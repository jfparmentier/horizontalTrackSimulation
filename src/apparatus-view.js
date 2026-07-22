import { computeApparatusLayout } from "./apparatus-geometry.js";

const NUMBER_FORMAT = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const US_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

function formatUsNumber(value) {
  return US_NUMBER_FORMAT.format(value);
}

function buildRuler(layout) {
  const { ruler } = layout;
  const ticks = ruler.ticks
    .map((tick) => {
      const major = tick.index % 5 === 0;
      const tickHeight = major ? 16 : 10;
      const label = tick.index % 2 === 0 || tick.index === 10
        ? `<text class="ruler-label" x="${tick.x}" y="${ruler.y + 39}" text-anchor="middle">${escapeXml(tick.label)}</text>`
        : "";

      return `
        <line class="ruler-tick${major ? " ruler-tick--major" : ""}" x1="${tick.x}" y1="${ruler.y}" x2="${tick.x}" y2="${ruler.y + tickHeight}" />
        ${label}`;
    })
    .join("");

  return `
    <g id="layer-ruler" data-role="ruler" aria-label="Règle graduée">
      <rect class="ruler-body" x="${ruler.x}" y="${ruler.y}" width="${ruler.width}" height="${ruler.height}" rx="8" />
      ${ticks}
      <text class="ruler-unit" x="${ruler.x + ruler.width + 18}" y="${ruler.y + 39}">m</text>
    </g>`;
}

function buildSensors(layout) {
  return layout.sensors
    .map((sensor) => `
      <g id="sensor-${sensor.id}" class="sensor" data-role="sensor" data-sensor-state="idle" data-sensor-id="${sensor.id}" data-position="${sensor.position}" transform="translate(${sensor.x} 0)" tabindex="0" role="img" aria-label="Capteur ${sensor.id}, position ${formatNumber(sensor.position)} mètre">
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

/**
 * Produit le SVG complet sous forme de chaîne. Les identifiants et attributs
 * data-role sont stables afin de préparer l'étape d'animation.
 */
export function buildStaticApparatusSvg(options = {}) {
  const layout = computeApparatusLayout(options);
  const { parameters } = layout;
  const description = [
    "Montage initial avec le mobile S1 sur un banc horizontal,",
    "la masse S2 suspendue par un fil passant sur une poulie,",
    `${layout.sensorCount} capteurs régulièrement répartis et un support de réception sous S2.`,
  ].join(" ");

  return `<svg id="apparatus-svg" class="apparatus-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.viewBox.width} ${layout.viewBox.height}" role="img" aria-labelledby="apparatus-title apparatus-description" preserveAspectRatio="xMidYMid meet">
    <title id="apparatus-title">Montage du banc horizontal</title>
    <desc id="apparatus-description">${escapeXml(description)}</desc>

    <defs>
      <linearGradient id="mobile-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#83d7ff" />
        <stop offset="1" stop-color="#278fc4" />
      </linearGradient>
      <linearGradient id="mass-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffbf69" />
        <stop offset="1" stop-color="#e57a22" />
      </linearGradient>
      <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity="0.2" />
      </filter>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <pattern id="bench-texture" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 0 16 L 16 0" />
      </pattern>
    </defs>

    <g id="layer-background" aria-hidden="true">
      <rect class="scene-background" x="16" y="16" width="1168" height="${layout.viewBox.height - 32}" rx="28" />
    </g>


    <g id="layer-track" data-role="track">
      <rect class="bench-top" x="${layout.track.x}" y="${layout.track.y}" width="${layout.track.width}" height="${layout.track.height}" rx="8" />
      <rect class="bench-texture" x="${layout.track.x}" y="${layout.track.y + 7}" width="${layout.track.width}" height="${layout.track.height - 14}" rx="5" />
      <path class="bench-edge" d="M ${layout.track.x} ${layout.track.y + layout.track.height} H ${layout.track.endX}" />
      <path class="bench-leg" d="M ${layout.track.x + 90} ${layout.track.y + layout.track.height} L ${layout.track.x + 72} ${layout.track.y + 139} H ${layout.track.x + 152} L ${layout.track.x + 134} ${layout.track.y + layout.track.height}" />
      <path class="bench-leg" d="M ${layout.track.endX - 132} ${layout.track.y + layout.track.height} L ${layout.track.endX - 150} ${layout.track.y + 139} H ${layout.track.endX - 70} L ${layout.track.endX - 88} ${layout.track.y + layout.track.height}" />
    </g>

    ${buildRuler(layout)}

    <g id="layer-sensors" aria-label="${layout.sensorCount} capteurs de vitesse">
      ${buildSensors(layout)}
    </g>

    <g id="layer-pulley" data-role="pulley">
      <line class="pulley-support" x1="${layout.track.endX}" y1="${layout.track.y}" x2="${layout.pulley.centerX}" y2="${layout.pulley.centerY}" />
      <circle class="pulley-wheel" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius}" />
      <circle class="pulley-groove" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius - 7}" />
      <circle class="pulley-hub" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="5" />
    </g>

    <g id="layer-string" data-role="string" aria-label="Fil tendu">
      <path id="string-path" class="string-path" data-role="string-path" d="${buildStringPath(layout)}" />
    </g>

    <g id="layer-mobile" data-role="mobile" transform="translate(${layout.mobile.x} ${layout.mobile.y})">
      <rect id="mobile-body" class="mobile-body" data-role="mobile-body" x="0" y="0" width="${layout.mobile.width}" height="${layout.mobile.height}" rx="18" />
      <circle class="mobile-port" cx="${layout.mobile.width}" cy="${layout.mobile.height / 2}" r="5" />
      <text class="object-label mass-value-label" x="${layout.mobile.width / 2}" y="${layout.mobile.height / 2 + 7}" text-anchor="middle">1 kg</text>
    </g>

    <g id="layer-hanging-mass" data-role="hanging-mass" transform="translate(${layout.hangingMass.x} ${layout.hangingMass.y})">
      <rect id="hanging-mass-body" class="hanging-mass-body" data-role="hanging-mass-body" x="0" y="0" width="${layout.hangingMass.width}" height="${layout.hangingMass.height}" rx="14" />
      <text class="object-label mass-value-label" x="${layout.hangingMass.width / 2}" y="50" text-anchor="middle">${formatUsNumber(parameters.m2)} kg</text>
    </g>

    <g id="layer-socle" data-role="socle">
      <rect class="socle-top" x="${layout.socle.x}" y="${layout.socle.y}" width="${layout.socle.width}" height="${layout.socle.height}" rx="8" />
    </g>

    <g id="layer-height-guide" aria-label="Hauteur de chute ${formatNumber(parameters.dropHeight)} mètre">
      <line class="height-guide" x1="${layout.heightGuide.x}" y1="${layout.heightGuide.topY}" x2="${layout.heightGuide.x}" y2="${layout.heightGuide.bottomY}" marker-start="url(#arrow-head)" marker-end="url(#arrow-head)" />
      <text class="dimension-label height-label" x="${layout.heightGuide.x + 14}" y="${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2}" text-anchor="middle" transform="rotate(-90 ${layout.heightGuide.x + 14} ${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2})">${formatUsNumber(parameters.dropHeight)} m</text>
    </g>

  </svg>`;
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
