import { computeApparatusLayout } from "./apparatus-geometry.js";
import { normalizeLocale, translate } from "./i18n.js";

const US_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const PERSON_HOLDING_ASSET = "assets/person-holding.webp";
const PERSON_RESTING_ASSET = "assets/person-resting.webp";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLocaleNumber(value, locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUsNumber(value) {
  return US_NUMBER_FORMAT.format(value);
}

function resolveLocalization(options = {}) {
  const locale = normalizeLocale(options.i18n?.getLocale?.() ?? options.locale);
  const t = options.i18n?.t
    ? (key, parameters = {}) => options.i18n.t(key, parameters)
    : (key, parameters = {}) => translate(locale, key, parameters);
  return Object.freeze({ locale, t });
}

function massColorClass(value) {
  const normalized = Number(value);
  const classes = new Map([
    [0.2, "mass-color--0-2"],
    [0.5, "mass-color--0-5"],
    [1, "mass-color--1"],
    [2, "mass-color--2"],
  ]);
  return classes.get(normalized) ?? "mass-color--0-2";
}

function buildRuler(layout, t) {
  const { ruler } = layout;
  const ticks = ruler.ticks
    .map((tick) => {
      const major = tick.index % 5 === 0;
      const highlighted = tick.isDropHeight;
      const tickHeight = major || highlighted ? 16 : 10;
      const label = tick.index % 2 === 0 || tick.index === 10
        ? `<text class="ruler-label" x="${tick.x}" y="${ruler.y + 33}" text-anchor="middle">${escapeXml(tick.label)}</text>`
        : "";

      return `
        <line class="ruler-tick${major ? " ruler-tick--major" : ""}${highlighted ? " ruler-tick--drop-height" : ""}" x1="${tick.x}" y1="${ruler.y}" x2="${tick.x}" y2="${ruler.y + tickHeight}" />
        ${label}`;
    })
    .join("");

  return `
    <g id="layer-ruler" data-role="ruler" aria-label="${escapeXml(t("svg.ruler"))}">
      <rect class="ruler-body" x="${ruler.x}" y="${ruler.y}" width="${ruler.width}" height="${ruler.height}" rx="8" />
      ${ticks}
      <text class="ruler-unit" x="${ruler.x + ruler.width + 18}" y="${ruler.y + 33}">m</text>
    </g>`;
}

function buildSensors(layout, locale, t) {
  return layout.sensors
    .map((sensor) => `
      <g id="sensor-${sensor.id}" class="sensor" data-role="sensor" data-sensor-state="idle" data-sensor-id="${sensor.id}" data-position="${sensor.position}" transform="translate(${sensor.x} 0)" tabindex="0" role="img" aria-label="${escapeXml(t("svg.sensor", { id: sensor.id, position: formatLocaleNumber(sensor.position, locale) }))}">
        <line class="sensor-beam" x1="0" y1="${sensor.gateTopY + 12}" x2="0" y2="${sensor.gateBottomY - 6}" />
        <rect class="sensor-head" x="-16" y="${sensor.gateTopY - 10}" width="32" height="22" rx="7" />
        <circle class="sensor-lens" cx="-7" cy="${sensor.gateTopY + 1}" r="4" />
        <text class="sensor-number" x="7" y="${sensor.gateTopY + 5}" text-anchor="middle">${sensor.id}</text>
      </g>`)
    .join("");
}

function buildStringPath(layout) {
  const rope = layout.string;
  return `M ${rope.startX} ${rope.startY}
    L ${rope.pulleyEntryX} ${rope.pulleyEntryY}
    A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${rope.pulleyExitX} ${rope.pulleyExitY}
    L ${rope.endX} ${rope.endY}`;
}

function buildPerson(layout, t) {
  const { person } = layout;
  const cueTextX = person.cue.x + person.cue.width / 2 + 7;
  const cueTextY = person.cue.y + person.cue.height / 2 + 4;
  const playCenterX = person.cue.x + 17;
  const playCenterY = person.cue.y + person.cue.height / 2;
  const label = escapeXml(t("svg.personStart"));

  return `
    <g id="layer-person" class="person-figure" data-role="simulation-starter" tabindex="0" role="button" aria-label="${label}" aria-disabled="false">
      <title id="person-title">${label}</title>
      <rect class="person-hit-area" x="${person.hitArea.x}" y="${person.hitArea.y}" width="${person.hitArea.width}" height="${person.hitArea.height}" rx="24" />
      <rect class="person-focus-ring" x="${person.hitArea.x + 3}" y="${person.hitArea.y + 3}" width="${person.hitArea.width - 6}" height="${person.hitArea.height - 6}" rx="22" />
      <image id="person-holding" class="person-pose person-pose--holding" href="${PERSON_HOLDING_ASSET}" x="${person.holding.x}" y="${person.y}" width="${person.holding.width}" height="${person.height}" preserveAspectRatio="none" draggable="false" />
      <image id="person-resting" class="person-pose person-pose--resting" href="${PERSON_RESTING_ASSET}" x="${person.resting.x}" y="${person.y}" width="${person.resting.width}" height="${person.height}" preserveAspectRatio="none" draggable="false" />
      <g class="person-click-cue" aria-hidden="true">
        <rect x="${person.cue.x}" y="${person.cue.y}" width="${person.cue.width}" height="${person.cue.height}" rx="15" />
        <circle cx="${playCenterX}" cy="${playCenterY}" r="10" />
        <path d="M ${playCenterX - 3} ${playCenterY - 5} L ${playCenterX + 5} ${playCenterY} L ${playCenterX - 3} ${playCenterY + 5} Z" />
        <text id="person-click-cue-label" x="${cueTextX}" y="${cueTextY}" text-anchor="middle">${escapeXml(t("controls.start"))}</text>
      </g>
    </g>`;
}

function buildTrackStop(layout, t) {
  const stop = layout.trackStop;
  return `
    <g id="layer-track-stop" data-role="track-stop" role="img" aria-label="${escapeXml(t("svg.trackStop"))}">
      <rect class="track-stop-body" x="${stop.x}" y="${stop.y}" width="${stop.width}" height="${stop.height}" rx="3" />
      <path class="track-stop-grain" d="M ${stop.x + 5} ${stop.y + 5} Q ${stop.x + 11} ${stop.y + 8} ${stop.x + 6} ${stop.y + 12} M ${stop.x + 10} ${stop.y + 18} Q ${stop.x + 4} ${stop.y + 22} ${stop.x + 11} ${stop.y + 27} M ${stop.x + 5} ${stop.y + 34} Q ${stop.x + 12} ${stop.y + 39} ${stop.x + 6} ${stop.y + 44} M ${stop.x + 10} ${stop.y + 51} Q ${stop.x + 4} ${stop.y + 57} ${stop.x + 11} ${stop.y + 64}" />
    </g>`;
}

function buildMassRack(layout, t) {
  const slots = layout.massRack.choices
    .map((choice) => `
      <g class="mass-rack-slot-group"${choice.selected ? ` data-role="mass-placeholder" data-mass-value="${choice.value}" role="img" aria-label="${escapeXml(t("svg.massPlaceholder", { mass: formatUsNumber(choice.value) }))}"` : ""}>
        <rect class="mass-rack-slot${choice.selected ? " mass-rack-slot--empty" : ""}" x="${choice.x}" y="${choice.y}" width="${choice.width}" height="${choice.height}" rx="14" />
        ${choice.selected
          ? `<text class="mass-rack-slot-label" x="${choice.x + choice.width / 2}" y="${choice.y + choice.height / 2 + 7}" text-anchor="middle">${formatUsNumber(choice.value)} kg</text>`
          : ""}
      </g>`)
    .join("");

  const masses = layout.massRack.choices
    .filter((choice) => !choice.selected)
    .map((choice) => `
      <g id="mass-choice-${String(choice.value).replace(".", "-")}" class="mass-choice ${massColorClass(choice.value)}" data-role="mass-choice" data-mass-value="${choice.value}" data-origin-x="${choice.x}" data-origin-y="${choice.y}" transform="translate(${choice.x} ${choice.y})" tabindex="0" role="button" aria-label="${escapeXml(t("svg.massChoice", { mass: formatUsNumber(choice.value) }))}">
        <rect class="mass-choice-body" x="0" y="0" width="${choice.width}" height="${choice.height}" rx="14" />
        <text class="object-label mass-value-label" x="${choice.width / 2}" y="${choice.height / 2 + 7}" text-anchor="middle">${formatUsNumber(choice.value)} kg</text>
      </g>`)
    .join("");

  return `
    <g id="layer-mass-rack" data-role="mass-rack" aria-label="${escapeXml(t("svg.massRack"))}">
      <rect class="mass-rack-support" x="${layout.massRack.x}" y="${layout.massRack.y}" width="${layout.massRack.width}" height="${layout.massRack.height}" rx="8" />
      <g class="mass-rack-slots" aria-hidden="true">${slots}</g>
      ${masses}
    </g>`;
}

/**
 * Produit le SVG complet sous forme de chaîne. Les identifiants et attributs
 * data-role sont stables afin de préparer l'étape d'animation.
 */
export function buildStaticApparatusSvg(options = {}) {
  const layout = computeApparatusLayout(options);
  const { parameters } = layout;
  const { locale, t } = resolveLocalization(options);
  const description = t("svg.description", { count: layout.sensorCount });

  return `<svg id="apparatus-svg" class="apparatus-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.viewBox.width} ${layout.viewBox.height}" role="img" aria-labelledby="apparatus-title apparatus-description" preserveAspectRatio="xMidYMid meet" data-person-state="holding">
    <title id="apparatus-title">${escapeXml(t("svg.title"))}</title>
    <desc id="apparatus-description">${escapeXml(description)}</desc>

    <defs>
      <linearGradient id="mobile-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#83d7ff" />
        <stop offset="1" stop-color="#278fc4" />
      </linearGradient>
      <linearGradient id="mass-gradient-0-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffbf69" />
        <stop offset="1" stop-color="#e57a22" />
      </linearGradient>
      <linearGradient id="mass-gradient-0-5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#83dfaa" />
        <stop offset="1" stop-color="#2e9b61" />
      </linearGradient>
      <linearGradient id="mass-gradient-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b7a7ff" />
        <stop offset="1" stop-color="#6853c5" />
      </linearGradient>
      <linearGradient id="mass-gradient-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff9797" />
        <stop offset="1" stop-color="#d84b56" />
      </linearGradient>
      <linearGradient id="wood-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#c97832" />
        <stop offset="0.52" stop-color="#f1ad58" />
        <stop offset="1" stop-color="#b9672b" />
      </linearGradient>
      <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity="0.2" />
      </filter>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <pattern id="bench-texture" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 0 16 L 16 0" />
      </pattern>
    </defs>

    <g id="layer-background" aria-hidden="true">
      <rect class="scene-background" x="16" y="16" width="1168" height="${layout.viewBox.height - 32}" rx="28" />
    </g>

    <g id="layer-apparatus" transform="translate(${layout.sceneOffset.x} ${layout.sceneOffset.y})">

    <g id="layer-track" data-role="track">
      <rect class="bench-top" x="${layout.track.x}" y="${layout.track.y}" width="${layout.track.width}" height="${layout.track.height}" rx="8" />
      <rect class="bench-texture" x="${layout.track.x}" y="${layout.track.y + 7}" width="${layout.track.width}" height="${layout.track.height - 14}" rx="5" />
      <path class="bench-edge" d="M ${layout.track.x} ${layout.track.y + layout.track.height} H ${layout.track.endX}" />
      <path class="bench-leg" d="M ${layout.track.x + 90} ${layout.track.y + layout.track.height} L ${layout.track.x + 72} ${layout.track.y + 139} H ${layout.track.x + 152} L ${layout.track.x + 134} ${layout.track.y + layout.track.height}" />
      <path class="bench-leg" d="M ${layout.track.endX - 132} ${layout.track.y + layout.track.height} L ${layout.track.endX - 150} ${layout.track.y + 139} H ${layout.track.endX - 70} L ${layout.track.endX - 88} ${layout.track.y + layout.track.height}" />
    </g>

    ${buildRuler(layout, t)}

    <g id="layer-sensors" aria-label="${escapeXml(t("svg.sensors", { count: layout.sensorCount }))}">
      ${buildSensors(layout, locale, t)}
    </g>

    <g id="layer-pulley" data-role="pulley">
      <line class="pulley-support" x1="${layout.track.endX}" y1="${layout.track.y}" x2="${layout.pulley.centerX}" y2="${layout.pulley.centerY}" />
      <circle class="pulley-wheel" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius}" />
      <circle class="pulley-groove" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius - 7}" />
      <circle class="pulley-hub" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="5" />
    </g>

    <g id="layer-string" data-role="string" aria-label="${escapeXml(t("svg.string"))}">
      <path id="string-path" class="string-path" data-role="string-path" d="${buildStringPath(layout)}" />
    </g>

    <g id="layer-mobile" data-role="mobile" transform="translate(${layout.mobile.x} ${layout.mobile.y})">
      <rect id="mobile-body" class="mobile-body" data-role="mobile-body" x="0" y="0" width="${layout.mobile.width}" height="${layout.mobile.height}" rx="18" />
      <circle class="mobile-port" cx="${layout.mobile.width}" cy="${layout.mobile.height / 2}" r="5" />
      <text class="object-label mass-value-label" x="${layout.mobile.width / 2}" y="${layout.mobile.height / 2 + 7}" text-anchor="middle">1 kg</text>
    </g>

    ${buildTrackStop(layout, t)}

    <g id="layer-socle" data-role="socle">
      <rect class="socle-top" x="${layout.socle.x}" y="${layout.socle.y}" width="${layout.socle.width}" height="${layout.socle.height}" rx="8" />
    </g>

    ${buildPerson(layout, t)}

    <g id="layer-hanging-mass" class="${massColorClass(parameters.m2)}" data-role="hanging-mass" data-mass-value="${parameters.m2}" transform="translate(${layout.hangingMass.x} ${layout.hangingMass.y})">
      <rect id="mass-drop-target" class="mass-drop-target" x="-9" y="-9" width="${layout.hangingMass.width + 18}" height="${layout.hangingMass.height + 18}" rx="20" aria-hidden="true" />
      <rect id="hanging-mass-body" class="hanging-mass-body" data-role="hanging-mass-body" x="0" y="0" width="${layout.hangingMass.width}" height="${layout.hangingMass.height}" rx="14" />
      <text class="object-label mass-value-label" x="${layout.hangingMass.width / 2}" y="50" text-anchor="middle">${formatUsNumber(parameters.m2)} kg</text>
    </g>

    ${buildMassRack(layout, t)}

    <g id="layer-height-guide" aria-label="${escapeXml(t("svg.dropHeight", { height: formatLocaleNumber(parameters.dropHeight, locale) }))}">
      <line class="height-guide" x1="${layout.heightGuide.x}" y1="${layout.heightGuide.topY}" x2="${layout.heightGuide.x}" y2="${layout.heightGuide.bottomY}" marker-start="url(#arrow-head)" marker-end="url(#arrow-head)" />
      <text class="dimension-label height-label" x="${layout.heightGuide.x + 14}" y="${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2}" text-anchor="middle" transform="rotate(-90 ${layout.heightGuide.x + 14} ${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2})">${formatUsNumber(parameters.dropHeight)} m</text>
    </g>

    </g>

  </svg>`;
}

/** Met à jour les libellés accessibles du SVG sans réinitialiser la simulation. */
export function localizeStaticApparatus(svg, layout, i18n) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (!layout || !Array.isArray(layout.sensors)) {
    throw new TypeError("Un layout de montage valide est requis.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.getLocale !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const locale = i18n.getLocale();
  const setText = (selector, value) => {
    const element = svg.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setLabel = (selector, value) => svg.querySelector(selector)?.setAttribute?.("aria-label", value);

  setText("#apparatus-title", i18n.t("svg.title"));
  setText("#apparatus-description", i18n.t("svg.description", { count: layout.sensorCount }));
  setLabel("#layer-ruler", i18n.t("svg.ruler"));
  setLabel("#layer-sensors", i18n.t("svg.sensors", { count: layout.sensorCount }));
  setLabel("#layer-string", i18n.t("svg.string"));
  setLabel("#layer-track-stop", i18n.t("svg.trackStop"));
  setLabel("#layer-mass-rack", i18n.t("svg.massRack"));
  setLabel("#layer-height-guide", i18n.t("svg.dropHeight", {
    height: formatLocaleNumber(layout.parameters.dropHeight, locale),
  }));

  for (const sensor of layout.sensors) {
    setLabel(`#sensor-${sensor.id}`, i18n.t("svg.sensor", {
      id: sensor.id,
      position: formatLocaleNumber(sensor.position, locale),
    }));
  }
  for (const choice of layout.massRack.choices) {
    const id = String(choice.value).replace(".", "-");
    setLabel(`#mass-choice-${id}`, i18n.t("svg.massChoice", { mass: formatUsNumber(choice.value) }));
  }
  for (const placeholder of svg.querySelectorAll?.('[data-role="mass-placeholder"]') ?? []) {
    const mass = formatUsNumber(Number(placeholder.getAttribute?.("data-mass-value")));
    placeholder.setAttribute?.("aria-label", i18n.t("svg.massPlaceholder", { mass }));
  }
  return locale;
}

/** Monte le SVG dans un conteneur existant et retourne l'élément SVG. */
export function mountStaticApparatus(container, options = {}) {
  if (!container || typeof container !== "object" || !("innerHTML" in container)) {
    throw new TypeError("Un conteneur DOM disposant de innerHTML est requis.");
  }

  container.innerHTML = buildStaticApparatusSvg(options);
  return typeof container.querySelector === "function"
    ? container.querySelector("#apparatus-svg")
    : null;
}
