const CSV_HEADERS = Object.freeze([
  "Numéro du capteur",
  "Position (m)",
  "Instant de déclenchement (s)",
  "Vitesse mesurée (m/s)",
]);

const CSV_NUMBER_PRECISION = 6;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément d'export introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state?.status);
}

function formatCsvNumber(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new TypeError("Les valeurs exportées doivent être des nombres finis.");
  }

  const fixed = normalized.toFixed(CSV_NUMBER_PRECISION);
  return fixed.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
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

      return Object.freeze({
        sensorId,
        position: Number(measurement.position),
        time: Number(measurement.time),
        velocity: Number(measurement.velocity),
      });
    })
    .sort((left, right) => left.sensorId - right.sensorId);
}

/**
 * Construit un CSV à quatre colonnes, trié par numéro de capteur.
 * Les nombres utilisent le point décimal et au plus six décimales.
 */
export function buildMeasurementsCsv(measurements) {
  const normalized = normalizeMeasurements(measurements);
  const lines = [CSV_HEADERS.map((header) => `"${header}"`).join(",")];

  for (const measurement of normalized) {
    lines.push([
      String(measurement.sensorId),
      formatCsvNumber(measurement.position),
      formatCsvNumber(measurement.time),
      formatCsvNumber(measurement.velocity),
    ].join(","));
  }

  return `${lines.join("\r\n")}\r\n`;
}

/** Déclenche le téléchargement local d'un fichier CSV sans dépendance externe. */
export function downloadMeasurementsCsv(measurements, options = {}) {
  const documentRef = options.documentRef ?? globalThis.document;
  const urlApi = options.urlApi ?? globalThis.URL;
  const BlobConstructor = options.BlobConstructor ?? globalThis.Blob;
  const filename = options.filename ?? "mesures-capteurs.csv";

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Un document capable de créer un lien est requis pour le téléchargement.");
  }
  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new Error("Une API URL valide est requise pour le téléchargement.");
  }
  if (typeof BlobConstructor !== "function") {
    throw new Error("Le constructeur Blob est indisponible.");
  }

  const csv = buildMeasurementsCsv(measurements);
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

/**
 * Active le bouton d'export uniquement lorsque l'expérience est terminée.
 */
export function bindMeasurementExport(root, appState, options = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function" || typeof appState.subscribe !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const button = getRequiredElement(root, "#download-data-button");
  const downloader = options.downloader
    ?? ((measurements) => downloadMeasurementsCsv(measurements, options));
  let destroyed = false;

  function update(snapshot = appState.getSnapshot()) {
    if (destroyed) return false;
    const enabled = isTerminalState(snapshot.simulation);
    button.disabled = !enabled;
    button.setAttribute("aria-disabled", String(!enabled));
    return enabled;
  }

  function onClick() {
    const snapshot = appState.getSnapshot();
    if (!isTerminalState(snapshot.simulation)) return;
    downloader(snapshot.measurements);
  }

  button.addEventListener("click", onClick);
  const unsubscribe = appState.subscribe((snapshot) => update(snapshot));
  update();

  return Object.freeze({
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      button.removeEventListener?.("click", onClick);
      unsubscribe();
      return true;
    },
  });
}
