import { createI18n, formatNumber, translate } from "./i18n.js";

const CSV_HEADER_KEYS = Object.freeze([
  "measurements.sensorNumber",
  "measurements.position",
  "measurements.triggerTime",
  "measurements.velocity",
]);

function resolveTranslator(options = {}) {
  if (options.i18n?.t && options.i18n?.getLocale) return options.i18n;
  const locale = options.locale ?? "fr";
  return Object.freeze({
    getLocale: () => locale,
    t: (key, parameters = {}) => translate(locale, key, parameters),
  });
}

const CSV_NUMBER_PRECISION = 6;

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de mesures introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state?.status);
}

function formatCsvNumber(value, locale = "en") {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new TypeError("Les valeurs exportées doivent être des nombres finis.");
  }

  const fixed = normalized.toFixed(CSV_NUMBER_PRECISION);
  const compact = fixed.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
  return locale === "fr" ? compact.replace(".", ",") : compact;
}

function normalizeMeasurements(measurements) {
  if (!Array.isArray(measurements)) {
    throw new TypeError("Les mesures à exporter doivent être fournies dans un tableau.");
  }

  return [...measurements]
    .map((measurement) => {
      if (!measurement || typeof measurement !== "object") {
        throw new TypeError("Chaque mesure doit être un objet.");
      }

      const sensorId = Number(measurement.sensorId);
      if (!Number.isInteger(sensorId) || sensorId <= 0) {
        throw new RangeError("Le numéro de capteur doit être un entier strictement positif.");
      }

      const position = Number(measurement.position);
      const time = Number(measurement.time);
      const velocity = Number(measurement.velocity);
      for (const [name, value] of Object.entries({ position, time, velocity })) {
        if (!Number.isFinite(value)) {
          throw new TypeError(`${name} doit être un nombre fini.`);
        }
      }

      return Object.freeze({ sensorId, position, time, velocity });
    })
    .sort((left, right) => left.sensorId - right.sensorId);
}

/**
 * Retourne les quatre valeurs textuelles utilisées à la fois dans le tableau
 * et dans le fichier CSV. Les lignes sont triées par numéro de capteur.
 */
export function buildMeasurementsTableRows(measurements, options = {}) {
  const i18n = resolveTranslator(options);
  const numberOptions = Object.freeze({
    minimumFractionDigits: 0,
    maximumFractionDigits: CSV_NUMBER_PRECISION,
  });

  return Object.freeze(
    normalizeMeasurements(measurements).map((measurement) => Object.freeze([
      String(measurement.sensorId),
      formatNumber(i18n.getLocale(), measurement.position, numberOptions),
      formatNumber(i18n.getLocale(), measurement.time, numberOptions),
      formatNumber(i18n.getLocale(), measurement.velocity, numberOptions),
    ])),
  );
}

/**
 * Construit un CSV à quatre colonnes, trié par numéro de capteur.
 * En français, les nombres utilisent la virgule décimale et les colonnes sont
 * séparées par des points-virgules. En anglais, le point décimal et la virgule
 * de séparation sont conservés. La précision maximale est de six décimales.
 */
export function buildMeasurementsCsv(measurements, options = {}) {
  const i18n = resolveTranslator(options);
  const locale = i18n.getLocale();
  const delimiter = locale === "fr" ? ";" : ",";
  const rows = normalizeMeasurements(measurements).map((measurement) => [
    String(measurement.sensorId),
    formatCsvNumber(measurement.position, locale),
    formatCsvNumber(measurement.time, locale),
    formatCsvNumber(measurement.velocity, locale),
  ]);
  const headers = CSV_HEADER_KEYS.map((key) => i18n.t(key));
  const lines = [headers.map((header) => `"${header}"`).join(delimiter)];

  for (const row of rows) {
    lines.push(row.join(delimiter));
  }

  return `${lines.join("\r\n")}\r\n`;
}

/** Déclenche le téléchargement local d'un fichier CSV sans dépendance externe. */
export function downloadMeasurementsCsv(measurements, options = {}) {
  const documentRef = options.documentRef ?? globalThis.document;
  const urlApi = options.urlApi ?? globalThis.URL;
  const BlobConstructor = options.BlobConstructor ?? globalThis.Blob;
  const i18n = resolveTranslator(options);
  const filename = options.filename ?? i18n.t("measurements.filename");

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Un document capable de créer un lien est requis pour le téléchargement.");
  }
  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new Error("Une API URL valide est requise pour le téléchargement.");
  }
  if (typeof BlobConstructor !== "function") {
    throw new Error("Le constructeur Blob est indisponible.");
  }

  const csv = buildMeasurementsCsv(measurements, { i18n });
  const blob = new BlobConstructor(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = urlApi.createObjectURL(blob);
  const link = documentRef.createElement("a");

  link.href = url;
  link.download = filename;
  link.hidden = true;
  documentRef.body?.appendChild?.(link);

  try {
    link.click();
  } finally {
    link.remove?.();
    urlApi.revokeObjectURL(url);
  }

  return Object.freeze({ filename, csv });
}

function renderMeasurementRows(tableBody, measurements, i18n) {
  const rows = buildMeasurementsTableRows(measurements, { i18n });
  if (rows.length === 0) {
    tableBody.innerHTML = `<tr><td class="measurement-table-empty" colspan="4">${i18n.t("measurements.empty")}</td></tr>`;
    return rows;
  }

  const labels = CSV_HEADER_KEYS.map((key) => escapeHtmlAttribute(i18n.t(key)));
  tableBody.innerHTML = rows
    .map((row) => `<tr>${row.map((value, index) => `<td data-label="${labels[index]}">${value}</td>`).join("")}</tr>`)
    .join("");
  return rows;
}

/**
 * Active le bouton d'affichage uniquement lorsque l'expérience est terminée.
 * Le tableau apparaît au-dessus de la simulation et conserve un bouton de
 * téléchargement CSV dans son en-tête.
 */
export function bindMeasurementResults(root, appState, options = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function" || typeof appState.subscribe !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const showButton = getRequiredElement(root, "#show-data-button");
  const overlay = getRequiredElement(root, "#measurement-table-overlay");
  const tableBody = getRequiredElement(root, "#measurement-table-body");
  const closeButton = getRequiredElement(root, "#measurement-table-close-button");
  const downloadButton = getRequiredElement(root, "#measurement-table-download-button");
  const keyboardTarget = options.keyboardTarget ?? root;
  const i18n = options.i18n ?? createI18n(options.locale ?? "fr");
  const ownsI18n = !options.i18n;
  const downloader = options.downloader
    ?? ((measurements) => downloadMeasurementsCsv(measurements, { ...options, i18n }));
  let destroyed = false;
  let open = false;

  function setOpen(nextOpen) {
    open = Boolean(nextOpen);
    overlay.hidden = !open;
    overlay.setAttribute("aria-hidden", String(!open));
    showButton.setAttribute("aria-expanded", String(open));
    if (open && typeof closeButton.focus === "function") closeButton.focus();
    return open;
  }

  function close() {
    return setOpen(false);
  }

  function openTable() {
    const snapshot = appState.getSnapshot();
    if (!isTerminalState(snapshot.simulation)) return false;
    const rows = renderMeasurementRows(tableBody, snapshot.measurements, i18n);
    downloadButton.disabled = rows.length === 0;
    downloadButton.setAttribute("aria-disabled", String(rows.length === 0));
    return setOpen(true);
  }

  function update(snapshot = appState.getSnapshot()) {
    if (destroyed) return false;
    const enabled = isTerminalState(snapshot.simulation);
    showButton.disabled = !enabled;
    showButton.setAttribute("aria-disabled", String(!enabled));
    if (!enabled) close();
    return enabled;
  }

  function localize() {
    if (open) {
      const snapshot = appState.getSnapshot();
      renderMeasurementRows(tableBody, snapshot.measurements, i18n);
    }
    return i18n.getLocale();
  }

  function onShowClick() {
    openTable();
  }

  function onCloseClick() {
    close();
  }

  function onDownloadClick() {
    const snapshot = appState.getSnapshot();
    if (!isTerminalState(snapshot.simulation) || snapshot.measurements.length === 0) return;
    downloader(snapshot.measurements);
  }

  function onOverlayClick(event) {
    if (event?.target === overlay) close();
  }

  function onKeyDown(event) {
    if (open && event?.key === "Escape") {
      event.preventDefault?.();
      close();
      showButton.focus?.();
    }
  }

  showButton.addEventListener("click", onShowClick);
  closeButton.addEventListener("click", onCloseClick);
  downloadButton.addEventListener("click", onDownloadClick);
  overlay.addEventListener("click", onOverlayClick);
  keyboardTarget?.addEventListener?.("keydown", onKeyDown);
  const unsubscribe = appState.subscribe((snapshot) => update(snapshot));
  const unsubscribeLanguage = i18n.subscribe(localize);
  update();

  return Object.freeze({
    update,
    open: openTable,
    close,
    localize,
    isOpen: () => open,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      showButton.removeEventListener?.("click", onShowClick);
      closeButton.removeEventListener?.("click", onCloseClick);
      downloadButton.removeEventListener?.("click", onDownloadClick);
      overlay.removeEventListener?.("click", onOverlayClick);
      keyboardTarget?.removeEventListener?.("keydown", onKeyDown);
      unsubscribe();
      unsubscribeLanguage();
      if (ownsI18n) i18n.destroy();
      return true;
    },
  });
}

/** Alias conservé pour les intégrations antérieures. */
export const bindMeasurementExport = bindMeasurementResults;
