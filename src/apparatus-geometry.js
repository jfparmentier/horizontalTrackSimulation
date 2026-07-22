import { DEFAULT_PARAMETERS } from "./constants.js";
import { PhysicsParameterError, validateParameters } from "./physics.js";

export const APPARATUS_VIEWBOX = Object.freeze({
  width: 1200,
  height: 500,
});

export const SENSOR_COUNT_LIMITS = Object.freeze({
  min: 1,
  max: 16,
  default: 8,
});

const DRAWING = Object.freeze({
  trackStartX: 98,
  trackEndX: 936,
  trackTopY: 252,
  trackHeight: 46,
  rulerTopY: 312,
  rulerHeight: 48,
  mobileWidth: 76,
  mobileHeight: 76,
  mobileBottomY: 248,
  pulleyCenterX: 1016,
  pulleyCenterY: 230,
  pulleyRadius: 20,
  hangingMassWidth: 76,
  hangingMassHeight: 76,
  hangingMassTopY: 240,
  socleTopY: 408,
});

function assertIntegerInRange(name, value, limits) {
  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < limits.min || normalized > limits.max) {
    throw new PhysicsParameterError(
      `${name} doit être un entier appartenant à [${limits.min}, ${limits.max}].`,
    );
  }

  return normalized;
}

/**
 * Répartit régulièrement les capteurs sur le banc, sans en placer aux extrémités.
 * Pour huit capteurs : x_i = iL/9, i = 1…8.
 */
export function createDefaultSensors(trackLength, count = SENSOR_COUNT_LIMITS.default) {
  const length = Number(trackLength);

  if (!Number.isFinite(length) || length <= 0) {
    throw new PhysicsParameterError("La longueur du banc doit être strictement positive.");
  }

  const sensorCount = assertIntegerInRange("count", count, SENSOR_COUNT_LIMITS);

  return Object.freeze(
    Array.from({ length: sensorCount }, (_, index) =>
      Object.freeze({
        id: index + 1,
        position: ((index + 1) * length) / (sensorCount + 1),
        ratio: (index + 1) / (sensorCount + 1),
      }),
    ),
  );
}

/** Crée une conversion affine entre une grandeur physique et une coordonnée SVG. */
export function createLinearScale(domainStart, domainEnd, rangeStart, rangeEnd) {
  for (const [name, value] of Object.entries({
    domainStart,
    domainEnd,
    rangeStart,
    rangeEnd,
  })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (domainEnd === domainStart) {
    throw new PhysicsParameterError("Le domaine de conversion ne peut pas être nul.");
  }

  const domainSpan = domainEnd - domainStart;
  const rangeSpan = rangeEnd - rangeStart;

  return (value) => {
    if (!Number.isFinite(value)) {
      throw new TypeError("La valeur à convertir doit être finie.");
    }

    return rangeStart + ((value - domainStart) / domainSpan) * rangeSpan;
  };
}

/**
 * Calcule toutes les coordonnées du montage initial. Cette fonction ne dépend
 * pas du DOM et sera réutilisable au moment de l'animation.
 */
export function computeApparatusLayout(options = {}) {
  const parameters = validateParameters({
    ...DEFAULT_PARAMETERS,
    ...options,
  });
  const sensorCount = assertIntegerInRange(
    "sensorCount",
    options.sensorCount ?? SENSOR_COUNT_LIMITS.default,
    SENSOR_COUNT_LIMITS,
  );

  const trackWidth = DRAWING.trackEndX - DRAWING.trackStartX;
  const positionToX = createLinearScale(
    0,
    parameters.trackLength,
    DRAWING.trackStartX,
    DRAWING.trackEndX,
  );
  const pulley = Object.freeze({
    centerX: DRAWING.pulleyCenterX,
    centerY: DRAWING.pulleyCenterY,
    radius: DRAWING.pulleyRadius,
  });
  const mobile = Object.freeze({
    x: positionToX(0),
    y: DRAWING.mobileBottomY - DRAWING.mobileHeight,
    width: DRAWING.mobileWidth,
    height: DRAWING.mobileHeight,
    attachX: positionToX(0) + DRAWING.mobileWidth,
    attachY: DRAWING.mobileBottomY - DRAWING.mobileHeight / 2,
  });
  const ropeY = mobile.attachY;
  const hangingMass = Object.freeze({
    x: pulley.centerX + pulley.radius - DRAWING.hangingMassWidth / 2,
    y: DRAWING.hangingMassTopY,
    width: DRAWING.hangingMassWidth,
    height: DRAWING.hangingMassHeight,
  });
  const socle = Object.freeze({
    x: hangingMass.x - 34,
    y: DRAWING.socleTopY,
    width: hangingMass.width + 68,
    height: 28,
  });
  const sensors = createDefaultSensors(parameters.trackLength, sensorCount).map((sensor) =>
    Object.freeze({
      ...sensor,
      x: positionToX(sensor.position),
      gateTopY: DRAWING.trackTopY - 118,
      gateBottomY: DRAWING.trackTopY + 2,
    }),
  );
  const rulerTicks = Object.freeze(
    Array.from({ length: 11 }, (_, index) =>
      Object.freeze({
        index,
        ratio: index / 10,
        x: DRAWING.trackStartX + (index / 10) * trackWidth,
        label: ((index / 10) * parameters.trackLength).toFixed(1),
      }),
    ),
  );

  return Object.freeze({
    viewBox: APPARATUS_VIEWBOX,
    parameters,
    sensorCount,
    track: Object.freeze({
      x: DRAWING.trackStartX,
      y: DRAWING.trackTopY,
      width: trackWidth,
      height: DRAWING.trackHeight,
      endX: DRAWING.trackEndX,
    }),
    ruler: Object.freeze({
      x: DRAWING.trackStartX,
      y: DRAWING.rulerTopY,
      width: trackWidth,
      height: DRAWING.rulerHeight,
      ticks: rulerTicks,
    }),
    mobile,
    pulley,
    hangingMass,
    socle,
    sensors: Object.freeze(sensors),
    string: Object.freeze({
      startX: mobile.attachX,
      startY: ropeY,
      pulleyEntryX: pulley.centerX,
      pulleyEntryY: ropeY,
      pulleyExitX: pulley.centerX + pulley.radius,
      pulleyExitY: pulley.centerY,
      endX: pulley.centerX + pulley.radius,
      endY: hangingMass.y,
    }),
    heightGuide: Object.freeze({
      x: socle.x + socle.width + 30,
      topY: hangingMass.y + hangingMass.height,
      bottomY: socle.y,
    }),
  });
}
