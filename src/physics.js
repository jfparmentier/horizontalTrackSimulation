import {
  DEFAULT_PARAMETERS,
  GRAVITY,
  NUMERICAL_EPSILON,
  PARAMETER_LIMITS,
} from "./constants.js";

/**
 * Erreur spécifique signalant une donnée physique invalide.
 */
export class PhysicsParameterError extends RangeError {
  constructor(message) {
    super(message);
    this.name = "PhysicsParameterError";
  }
}

/**
 * Retourne la valeur de g correspondant au milieu choisi.
 *
 * @param {"earth"|"moon"} gravityMode
 * @returns {number} accélération de la pesanteur en m·s⁻²
 */
export function getGravity(gravityMode) {
  if (!Object.hasOwn(GRAVITY, gravityMode)) {
    throw new PhysicsParameterError(
      `Mode de gravité inconnu : ${String(gravityMode)}. Valeurs admises : earth, moon.`,
    );
  }

  return GRAVITY[gravityMode];
}

/**
 * Vérifie et normalise les paramètres du modèle.
 *
 * @param {object} parameters
 * @returns {Readonly<object>}
 */
export function validateParameters(parameters = DEFAULT_PARAMETERS) {
  if (parameters === null || typeof parameters !== "object") {
    throw new TypeError("Les paramètres doivent être fournis sous forme d'objet.");
  }

  const normalized = {
    m1: Number(parameters.m1),
    m2: Number(parameters.m2),
    dropHeight: Number(parameters.dropHeight),
    trackLength: Number(parameters.trackLength),
    friction: Number(parameters.friction),
    gravityMode: parameters.gravityMode,
  };

  for (const key of ["m1", "m2", "dropHeight", "trackLength", "friction"]) {
    const value = normalized[key];
    const limits = PARAMETER_LIMITS[key];

    if (!Number.isFinite(value)) {
      throw new PhysicsParameterError(`${key} doit être un nombre fini.`);
    }

    if (value < limits.min || value > limits.max) {
      throw new PhysicsParameterError(
        `${key} doit appartenir à [${limits.min}, ${limits.max}] ${limits.unit}.`,
      );
    }
  }

  getGravity(normalized.gravityMode);

  if (normalized.dropHeight > normalized.trackLength + NUMERICAL_EPSILON) {
    throw new PhysicsParameterError(
      "La hauteur de chute ne peut pas dépasser la longueur du banc.",
    );
  }

  return Object.freeze(normalized);
}

/**
 * Calcule l'accélération commune de S1 et S2 pendant la phase 1.
 */
export function computePhase1Acceleration(parameters) {
  const p = validateParameters(parameters);
  const g = getGravity(p.gravityMode);
  const netForce = p.m2 * g - p.friction * p.m1 * g;

  if (netForce <= NUMERICAL_EPSILON) {
    return 0;
  }

  return netForce / (p.m1 + p.m2);
}

/**
 * Calcule l'accélération de S1 pendant la phase 2.
 */
export function computePhase2Acceleration(parameters, velocity) {
  const p = validateParameters(parameters);

  if (!Number.isFinite(velocity) || velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (velocity <= NUMERICAL_EPSILON || p.friction <= NUMERICAL_EPSILON) {
    return 0;
  }

  return -p.friction * getGravity(p.gravityMode);
}

/**
 * Vitesse théorique à la fin de la phase 1, avec x0 = 0 et v0 = 0.
 */
export function computePhase1EndVelocity(parameters) {
  const p = validateParameters(parameters);
  const acceleration = computePhase1Acceleration(p);

  return acceleration <= NUMERICAL_EPSILON
    ? 0
    : Math.sqrt(2 * acceleration * p.dropHeight);
}

/**
 * Temps nécessaire pour atteindre une position cible sous accélération constante.
 * Résout target = position + velocity*t + 1/2*acceleration*t².
 *
 * @returns {number} temps >= 0, ou Infinity si la cible est inaccessible
 */
export function timeToReachPosition({
  position,
  velocity,
  acceleration,
  targetPosition,
}) {
  for (const [name, value] of Object.entries({
    position,
    velocity,
    acceleration,
    targetPosition,
  })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse ne peut pas être négative.");
  }

  const distance = targetPosition - position;

  if (distance <= NUMERICAL_EPSILON) {
    return 0;
  }

  if (Math.abs(acceleration) <= NUMERICAL_EPSILON) {
    return velocity > NUMERICAL_EPSILON ? distance / velocity : Infinity;
  }

  const discriminant = velocity ** 2 + 2 * acceleration * distance;

  if (discriminant < -NUMERICAL_EPSILON) {
    return Infinity;
  }

  const sqrtDiscriminant = Math.sqrt(Math.max(0, discriminant));
  const roots = [
    (-velocity + sqrtDiscriminant) / acceleration,
    (-velocity - sqrtDiscriminant) / acceleration,
  ].filter((root) => root >= -NUMERICAL_EPSILON);

  return roots.length === 0 ? Infinity : Math.max(0, Math.min(...roots));
}

/**
 * Temps avant arrêt sous accélération constante négative.
 */
export function timeToStop(velocity, acceleration) {
  if (!Number.isFinite(velocity) || velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (!Number.isFinite(acceleration)) {
    throw new TypeError("L'accélération doit être un nombre fini.");
  }

  if (velocity <= NUMERICAL_EPSILON) {
    return 0;
  }

  return acceleration < -NUMERICAL_EPSILON ? -velocity / acceleration : Infinity;
}

/**
 * Intègre exactement une accélération constante pendant dt.
 */
export function integrateConstantAcceleration(position, velocity, acceleration, dt) {
  for (const [name, value] of Object.entries({ position, velocity, acceleration, dt })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (dt < 0) {
    throw new PhysicsParameterError("Le pas de temps doit être positif ou nul.");
  }

  return Object.freeze({
    position: position + velocity * dt + 0.5 * acceleration * dt ** 2,
    velocity: velocity + acceleration * dt,
  });
}

/**
 * Crée l'état initial imposé par le cahier des charges : x0 = 0, v0 = 0.
 */
export function createInitialState(parameters = DEFAULT_PARAMETERS) {
  validateParameters(parameters);

  return Object.freeze({
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0,
    phase: 1,
    status: "ready",
    endReason: null,
  });
}

/**
 * Vérifie la structure minimale d'un état de simulation.
 */
export function validateSimulationState(state, parameters = DEFAULT_PARAMETERS) {
  const p = validateParameters(parameters);

  if (state === null || typeof state !== "object") {
    throw new TypeError("L'état doit être fourni sous forme d'objet.");
  }

  for (const field of [
    "time",
    "position",
    "velocity",
    "acceleration",
    "hangingDisplacement",
  ]) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`state.${field} doit être un nombre fini.`);
    }
  }

  if (state.time < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("Le temps ne peut pas être négatif.");
  }

  if (state.position < -NUMERICAL_EPSILON || state.position > p.trackLength + NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La position doit rester comprise sur le banc.");
  }

  if (state.velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse ne peut pas être négative.");
  }

  if (
    state.hangingDisplacement < -NUMERICAL_EPSILON ||
    state.hangingDisplacement > p.dropHeight + NUMERICAL_EPSILON
  ) {
    throw new PhysicsParameterError(
      "Le déplacement de S2 doit rester compris entre 0 et la hauteur de chute.",
    );
  }

  if (![1, 2].includes(state.phase)) {
    throw new PhysicsParameterError("state.phase doit valoir 1 ou 2.");
  }

  if (!["ready", "running", "paused", "blocked", "finished"].includes(state.status)) {
    throw new PhysicsParameterError("État de fonctionnement inconnu.");
  }

  return Object.freeze({ ...state });
}
