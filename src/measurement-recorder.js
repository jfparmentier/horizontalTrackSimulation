import {
  computePhase1Acceleration,
  computePhase2Acceleration,
  validateParameters,
} from "./physics.js";

const MEASUREMENT_EPSILON = 1e-10;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function assertLayout(layout) {
  if (!layout || typeof layout !== "object") {
    throw new TypeError("Un layout de montage est requis.");
  }
  if (!layout.parameters || !layout.track || !layout.mobile || !Array.isArray(layout.sensors)) {
    throw new TypeError("Le layout doit contenir les paramètres, le banc, le mobile et les capteurs.");
  }
}

function assertSensor(sensor) {
  if (!sensor || !Number.isInteger(sensor.id) || !Number.isFinite(sensor.position)) {
    throw new TypeError("Le capteur doit posséder un identifiant entier et une position finie.");
  }
  if (!Number.isFinite(sensor.x)) {
    throw new TypeError("Le capteur doit posséder une coordonnée SVG finie.");
  }
}

/**
 * Retourne le déplacement physique de S1 pour lequel son bord gauche visible
 * est exactement aligné avec le faisceau d'un capteur.
 */
export function computeSensorTriggerPosition(layout, sensor) {
  assertLayout(layout);
  assertSensor(sensor);

  const mobileTravel = layout.track.width - layout.mobile.width;
  if (!Number.isFinite(mobileTravel) || mobileTravel <= 0) {
    throw new RangeError("La course graphique du mobile doit être strictement positive.");
  }

  const normalized = (sensor.x - layout.mobile.x) / mobileTravel;
  return clamp(
    normalized * layout.parameters.trackLength,
    0,
    layout.parameters.trackLength,
  );
}

/**
 * Calcule l'état cinématique exact au déplacement demandé à partir des lois à
 * accélération constante utilisées par le moteur. Retourne null si la position
 * n'est pas atteignable (système bloqué ou arrêt antérieur par frottement).
 */
export function computeKinematicStateAtPosition(parameters, targetPosition) {
  const p = validateParameters(parameters);
  const x = Number(targetPosition);

  if (!Number.isFinite(x)) {
    throw new TypeError("targetPosition doit être un nombre fini.");
  }
  if (x < -MEASUREMENT_EPSILON || x > p.trackLength + MEASUREMENT_EPSILON) {
    throw new RangeError("targetPosition doit rester comprise sur le banc.");
  }

  const position = clamp(x, 0, p.trackLength);
  const a1 = computePhase1Acceleration(p);

  if (position <= MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: 0,
      position: 0,
      velocity: 0,
      acceleration: a1,
      phase: 1,
    });
  }

  if (a1 <= MEASUREMENT_EPSILON) {
    return null;
  }

  const phase1EndPosition = Math.min(p.dropHeight, p.trackLength);

  if (position < phase1EndPosition - MEASUREMENT_EPSILON) {
    const velocity = Math.sqrt(Math.max(0, 2 * a1 * position));
    return Object.freeze({
      time: velocity / a1,
      position,
      velocity,
      acceleration: a1,
      phase: 1,
    });
  }

  const transitionVelocity = Math.sqrt(
    Math.max(0, 2 * a1 * phase1EndPosition),
  );
  const transitionTime = transitionVelocity / a1;

  // Si le banc se termine avant la fin de chute, la phase 2 n'existe pas.
  if (p.trackLength <= p.dropHeight + MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: transitionTime,
      position,
      velocity: transitionVelocity,
      acceleration: a1,
      phase: 1,
    });
  }

  if (position <= p.dropHeight + MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: transitionTime,
      position: p.dropHeight,
      velocity: transitionVelocity,
      acceleration: computePhase2Acceleration(p, transitionVelocity),
      phase: 2,
    });
  }

  const a2 = computePhase2Acceleration(p, transitionVelocity);
  const phase2Distance = position - p.dropHeight;

  if (Math.abs(a2) <= MEASUREMENT_EPSILON) {
    if (transitionVelocity <= MEASUREMENT_EPSILON) return null;
    return Object.freeze({
      time: transitionTime + phase2Distance / transitionVelocity,
      position,
      velocity: transitionVelocity,
      acceleration: 0,
      phase: 2,
    });
  }

  const velocitySquared = transitionVelocity ** 2 + 2 * a2 * phase2Distance;
  if (velocitySquared < -MEASUREMENT_EPSILON) {
    return null;
  }

  const velocity = Math.sqrt(Math.max(0, velocitySquared));
  const phase2Time = (velocity - transitionVelocity) / a2;

  return Object.freeze({
    time: transitionTime + phase2Time,
    position,
    velocity,
    acceleration: velocity <= MEASUREMENT_EPSILON ? 0 : a2,
    phase: 2,
  });
}

/**
 * Transforme un franchissement de faisceau en mesure scientifique immuable.
 * `position` est la position graduée du capteur ; `mobilePosition` est la
 * position interne du moteur au moment où le bord gauche de S1 franchit le
 * faisceau.
 */
export function createMeasurement(layout, crossing, parameters = layout?.parameters) {
  assertLayout(layout);
  if (!crossing || !Number.isInteger(crossing.id)) {
    throw new TypeError("Le franchissement doit posséder un identifiant entier.");
  }

  const sensor = layout.sensors.find((candidate) => candidate.id === crossing.id);
  if (!sensor) {
    throw new RangeError(`Capteur ${crossing.id} absent du layout.`);
  }

  const mobilePosition = Number.isFinite(crossing.triggerPosition)
    ? crossing.triggerPosition
    : computeSensorTriggerPosition(layout, sensor);
  const kinematics = computeKinematicStateAtPosition(parameters, mobilePosition);

  if (!kinematics) return null;

  return Object.freeze({
    sensorId: sensor.id,
    position: sensor.position,
    mobilePosition,
    time: kinematics.time,
    velocity: kinematics.velocity,
    acceleration: kinematics.acceleration,
    phase: kinematics.phase,
  });
}

/**
 * Enregistre chaque capteur au plus une fois au cours d'une expérience.
 */
export function createMeasurementRecorder(layout, parameters = layout?.parameters) {
  assertLayout(layout);
  const validatedParameters = validateParameters(parameters);
  const recordedSensorIds = new Set();
  let destroyed = false;

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cet enregistreur de mesures a été détruit.");
    }
  }

  function recordCrossings(crossings) {
    assertUsable();
    if (!Array.isArray(crossings)) {
      throw new TypeError("crossings doit être un tableau.");
    }

    const measurements = [];
    for (const crossing of crossings) {
      if (recordedSensorIds.has(crossing.id)) continue;
      const measurement = createMeasurement(layout, crossing, validatedParameters);
      if (!measurement) continue;
      recordedSensorIds.add(crossing.id);
      measurements.push(measurement);
    }

    measurements.sort((left, right) => left.time - right.time || left.sensorId - right.sensorId);
    return Object.freeze(measurements);
  }

  function reset() {
    assertUsable();
    recordedSensorIds.clear();
    return getSnapshot();
  }

  function getSnapshot() {
    return Object.freeze({
      recordedSensorIds: Object.freeze([...recordedSensorIds].sort((a, b) => a - b)),
      count: recordedSensorIds.size,
    });
  }

  return Object.freeze({
    recordCrossings,
    reset,
    getSnapshot,
    destroy() {
      if (destroyed) return false;
      recordedSensorIds.clear();
      destroyed = true;
      return true;
    },
  });
}
