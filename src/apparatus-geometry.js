import { AVAILABLE_HANGING_MASSES, DEFAULT_PARAMETERS, FIXED_MOBILE_LENGTH, FIXED_SENSOR_COUNT, FIXED_SENSOR_POSITIONS } from "./constants.js";
import { PhysicsParameterError, validateParameters } from "./physics.js";

export const APPARATUS_VIEWBOX = Object.freeze({
  width: 1200,
  height: 620,
});

export const SENSOR_COUNT_LIMITS = Object.freeze({
  min: 1,
  max: 16,
  default: FIXED_SENSOR_COUNT,
});

const DRAWING = Object.freeze({
  trackStartX: 98,
  trackEndX: 936,
  trackTopY: 252,
  trackHeight: 46,
  rulerTopY: 312,
  rulerHeight: 48,
  mobileBottomY: 248,
  pulleyCenterX: 1016,
  pulleyRadius: 20,
  hangingMassTopY: 260,
});

const SCENE_CONTENT_OFFSET_X = -24;
const PERSON_SPRITE = Object.freeze({
  sourceHeight: 983,
  palmCenterX: 80,
  palmTopY: 333,
  rightShoeBottomY: 941,
  leftShoeBottomY: 960,
  holdingWidth: 492,
  restingWidth: 266,
  restingOffsetX: 140,
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
 * Crée les capteurs aux positions expérimentales retenues. Pour la configuration
 * fixe de onze capteurs : cinq capteurs uniformément espacés entre 0 m et
 * 0,6 m, placés à 0,12 m, 0,24 m, 0,36 m, 0,48 m et 0,6 m, puis 0,8 m à
 * 1,8 m par pas de 0,2 m.
 *
 * Une répartition uniforme reste disponible pour les configurations de test
 * utilisant un autre nombre de capteurs.
 */
export function createDefaultSensors(trackLength, count = SENSOR_COUNT_LIMITS.default) {
  const length = Number(trackLength);

  if (!Number.isFinite(length) || length <= 0) {
    throw new PhysicsParameterError("La longueur du banc doit être strictement positive.");
  }

  const sensorCount = assertIntegerInRange("count", count, SENSOR_COUNT_LIMITS);
  const positions = sensorCount === FIXED_SENSOR_COUNT
    ? FIXED_SENSOR_POSITIONS
    : Array.from(
      { length: sensorCount },
      (_, index) => ((index + 1) * length) / (sensorCount + 1),
    );

  if (positions.some((position) => position <= 0 || position >= length)) {
    throw new PhysicsParameterError(
      "Toutes les positions de capteurs doivent appartenir strictement au banc.",
    );
  }

  return Object.freeze(
    positions.map((position, index) =>
      Object.freeze({
        id: index + 1,
        position,
        ratio: position / length,
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
  // La position physique x désigne le bord gauche de S1. Les capteurs et le
  // mobile utilisent donc exactement la même échelle sur toute la longueur L.
  const horizontalTravel = trackWidth;
  const pixelsPerMeter = horizontalTravel / parameters.trackLength;
  // Le banc est relevé graphiquement de 0,1 m. L’échelle verticale restant
  // identique à l’échelle horizontale, le décalage vaut exactement 0,1 fois
  // le nombre de pixels par mètre.
  const verticalLift = 0.1 * pixelsPerMeter;
  const trackTopY = DRAWING.trackTopY - verticalLift;
  const rulerTopY = DRAWING.rulerTopY - verticalLift;
  const mobileBottomY = DRAWING.mobileBottomY - verticalLift;
  const hangingMassTopY = DRAWING.hangingMassTopY - verticalLift;
  const mobileSize = Number((FIXED_MOBILE_LENGTH * pixelsPerMeter).toFixed(6));
  const mobile = Object.freeze({
    x: positionToX(0),
    y: mobileBottomY - mobileSize,
    width: mobileSize,
    height: mobileSize,
    attachX: positionToX(0) + mobileSize,
    attachY: mobileBottomY - mobileSize / 2,
  });
  const ropeY = mobile.attachY;
  const pulley = Object.freeze({
    centerX: DRAWING.pulleyCenterX,
    centerY: ropeY + DRAWING.pulleyRadius,
    radius: DRAWING.pulleyRadius,
  });
  const hangingMass = Object.freeze({
    x: pulley.centerX + pulley.radius - mobileSize / 2,
    y: hangingMassTopY,
    width: mobileSize,
    height: mobileSize,
  });
  const socleX = hangingMass.x - 34;
  const socle = Object.freeze({
    x: socleX,
    y: hangingMass.y + hangingMass.height + parameters.dropHeight * pixelsPerMeter,
    // Le support se prolonge jusqu'au bord droit de la scène afin d'accueillir
    // le personnage sans modifier le point de réception de S2.
    width: APPARATUS_VIEWBOX.width - 16 - socleX,
    height: 28,
  });
  const hangingMassBottomY = hangingMass.y + hangingMass.height;
  // La paume et la chaussure droite servent de deux ancres. Cette mise à
  // l'échelle conserve S2 sur la main tout en posant exactement la semelle
  // droite sur le dessus du socle. La chaussure gauche, plus basse dans le
  // dessin en perspective, recouvre alors légèrement le socle.
  const personScale = (socle.y - hangingMassBottomY)
    / (PERSON_SPRITE.rightShoeBottomY - PERSON_SPRITE.palmTopY);
  const personY = hangingMassBottomY - PERSON_SPRITE.palmTopY * personScale;
  const personHeight = PERSON_SPRITE.sourceHeight * personScale;
  const person = Object.freeze({
    y: personY,
    height: personHeight,
    holding: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 - PERSON_SPRITE.palmCenterX * personScale,
      width: PERSON_SPRITE.holdingWidth * personScale,
    }),
    resting: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 + PERSON_SPRITE.restingOffsetX * personScale,
      width: PERSON_SPRITE.restingWidth * personScale,
    }),
    hitArea: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 - PERSON_SPRITE.palmCenterX * personScale,
      y: personY,
      width: PERSON_SPRITE.holdingWidth * personScale,
      height: personHeight,
    }),
    cue: Object.freeze({
      x: APPARATUS_VIEWBOX.width - 164,
      y: personY - 34,
      width: 146,
      height: 30,
    }),
    anchors: Object.freeze({
      palmTopY: personY + PERSON_SPRITE.palmTopY * personScale,
      rightShoeBottomY: personY + PERSON_SPRITE.rightShoeBottomY * personScale,
      leftShoeBottomY: personY + PERSON_SPRITE.leftShoeBottomY * personScale,
    }),
  });
  const massRackGap = 18;
  const massRackStartX = 520;
  const massRackMassY = socle.y - mobileSize;
  const massChoices = Object.freeze(
    AVAILABLE_HANGING_MASSES.map((value, index) => Object.freeze({
      value,
      x: massRackStartX + index * (mobileSize + massRackGap),
      y: massRackMassY,
      width: mobileSize,
      height: mobileSize,
      selected: Math.abs(value - parameters.m2) < 1e-9,
    })),
  );
  const rackWidth = AVAILABLE_HANGING_MASSES.length * mobileSize
    + (AVAILABLE_HANGING_MASSES.length - 1) * massRackGap;
  const massRack = Object.freeze({
    x: massRackStartX - 16,
    y: socle.y,
    width: rackWidth + 32,
    height: socle.height,
    choices: massChoices,
  });
  const sensors = createDefaultSensors(parameters.trackLength, sensorCount).map((sensor) =>
    Object.freeze({
      ...sensor,
      x: positionToX(sensor.position),
      gateTopY: trackTopY - 118,
      gateBottomY: trackTopY + 2,
    }),
  );
  const rulerTicks = Object.freeze(
    Array.from({ length: 11 }, (_, index) =>
      Object.freeze({
        index,
        ratio: index / 10,
        position: (index / 10) * parameters.trackLength,
        x: DRAWING.trackStartX + (index / 10) * trackWidth,
        label: ((index / 10) * parameters.trackLength).toFixed(1),
        isDropHeight: Math.abs(
          (index / 10) * parameters.trackLength - parameters.dropHeight,
        ) < 1e-9,
      }),
    ),
  );

  return Object.freeze({
    viewBox: APPARATUS_VIEWBOX,
    sceneOffset: Object.freeze({ x: SCENE_CONTENT_OFFSET_X, y: 0 }),
    parameters,
    sensorCount,
    track: Object.freeze({
      x: DRAWING.trackStartX,
      y: trackTopY,
      width: trackWidth,
      height: DRAWING.trackHeight,
      endX: DRAWING.trackEndX,
    }),
    ruler: Object.freeze({
      x: DRAWING.trackStartX,
      y: rulerTopY,
      width: trackWidth,
      height: DRAWING.rulerHeight,
      ticks: rulerTicks,
    }),
    mobile,
    pulley,
    hangingMass,
    socle,
    person,
    trackStop: Object.freeze({
      x: DRAWING.trackEndX,
      y: trackTopY - 26,
      width: 17,
      height: DRAWING.trackHeight + 26,
      contactX: DRAWING.trackEndX,
    }),
    massRack,
    sensors: Object.freeze(sensors),
    motionScale: Object.freeze({
      pixelsPerMeter,
      horizontalTravel,
      maximumMobilePosition: parameters.trackLength - FIXED_MOBILE_LENGTH,
      verticalLift,
    }),
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
      // La cote part exactement de l'arête gauche du socle de réception.
      x: socle.x,
      topY: hangingMass.y + hangingMass.height,
      bottomY: socle.y,
    }),
  });
}
