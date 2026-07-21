import {
  DEFAULT_PARAMETERS,
  GRAVITY,
  NUMERICAL_EPSILON,
  PARAMETER_LIMITS,
} from "./constants.js";

/**
 * Erreur spécifique signalant un paramètre physique invalide.
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
 * Vérifie les paramètres définis pour le projet.
 *
 * Le modèle impose également dropHeight <= trackLength afin que la masse S2
 * puisse atteindre le socle avant ou au moment où S1 atteint l'extrémité du banc.
 * Cette condition est automatiquement satisfaite par les plages actuellement
 * retenues, mais elle est contrôlée explicitement.
 *
 * @param {object} parameters
 * @returns {Readonly<object>} copie normalisée et figée
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
 *
 * Modèle : fil et poulie idéaux, frottement de Coulomb sur S1.
 * Si la force motrice m2*g ne dépasse pas le frottement µ*m1*g,
 * le système est considéré comme bloqué et l'accélération vaut zéro.
 *
 * @param {object} parameters paramètres validés ou non
 * @returns {number} accélération en m·s⁻², toujours >= 0
 */
export function computePhase1Acceleration(parameters) {
  const p = validateParameters(parameters);
  const g = getGravity(p.gravityMode);
  const drivingForce = p.m2 * g;
  const frictionForce = p.friction * p.m1 * g;
  const netForce = drivingForce - frictionForce;

  if (netForce <= NUMERICAL_EPSILON) {
    return 0;
  }

  return netForce / (p.m1 + p.m2);
}

/**
 * Calcule l'accélération de S1 pendant la phase 2.
 *
 * Après l'arrivée de S2 sur le socle, le fil est détendu. S1 subit donc
 * uniquement le frottement horizontal dans ce modèle.
 *
 * @param {object} parameters paramètres validés ou non
 * @param {number} velocity vitesse courante de S1 en m·s⁻¹
 * @returns {number} accélération en m·s⁻²
 */
export function computePhase2Acceleration(parameters, velocity) {
  const p = validateParameters(parameters);

  if (!Number.isFinite(velocity) || velocity < 0) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (velocity <= NUMERICAL_EPSILON || p.friction <= NUMERICAL_EPSILON) {
    return 0;
  }

  return -p.friction * getGravity(p.gravityMode);
}

/**
 * Vitesse théorique au moment où S2 atteint le socle.
 * Conditions initiales imposées : x0 = 0 et v0 = 0.
 *
 * @param {object} parameters
 * @returns {number} vitesse en m·s⁻¹
 */
export function computePhase1EndVelocity(parameters) {
  const p = validateParameters(parameters);
  const acceleration = computePhase1Acceleration(p);

  if (acceleration <= NUMERICAL_EPSILON) {
    return 0;
  }

  return Math.sqrt(2 * acceleration * p.dropHeight);
}

/**
 * Temps nécessaire pour atteindre une position cible sous accélération constante.
 * Résout target = position + velocity*t + 1/2*acceleration*t².
 *
 * @returns {number} temps >= 0, ou Infinity si la cible n'est pas atteignable
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

  if (roots.length === 0) {
    return Infinity;
  }

  return Math.max(0, Math.min(...roots));
}

/**
 * Temps avant arrêt sous une accélération constante négative.
 *
 * @returns {number} temps >= 0 ou Infinity si aucun arrêt ne se produit
 */
export function timeToStop(velocity, acceleration) {
  if (!Number.isFinite(velocity) || velocity < 0) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (!Number.isFinite(acceleration)) {
    throw new TypeError("L'accélération doit être un nombre fini.");
  }

  if (velocity <= NUMERICAL_EPSILON) {
    return 0;
  }

  if (acceleration >= -NUMERICAL_EPSILON) {
    return Infinity;
  }

  return -velocity / acceleration;
}

/**
 * Intègre exactement une accélération constante pendant dt.
 */
export function integrateConstantAcceleration(position, velocity, acceleration, dt) {
  for (const [name, value] of Object.entries({
    position,
    velocity,
    acceleration,
    dt,
  })) {
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

function freezeState(state) {
  return Object.freeze({ ...state });
}

function advanceWithConstantAcceleration(state, acceleration, duration) {
  const next = integrateConstantAcceleration(
    state.position,
    state.velocity,
    acceleration,
    duration,
  );

  return {
    ...state,
    time: state.time + duration,
    position: next.position,
    velocity: Math.max(0, next.velocity),
    acceleration,
    hangingDisplacement:
      state.phase === 1 ? next.position : state.hangingDisplacement,
    status: "running",
  };
}

/**
 * Fait progresser le système d'une durée dt en traitant exactement les événements :
 * - arrivée de S2 sur le socle ;
 * - arrêt de S1 par frottement ;
 * - arrivée de S1 en fin de banc.
 *
 * La fonction est pure : l'état fourni n'est jamais modifié.
 *
 * @param {object} state état courant
 * @param {object} parameters paramètres physiques
 * @param {number} dt durée simulée en secondes
 * @returns {Readonly<object>} nouvel état
 */
export function advanceSimulation(state, parameters, dt) {
  const p = validateParameters(parameters);

  if (state === null || typeof state !== "object") {
    throw new TypeError("L'état doit être fourni sous forme d'objet.");
  }

  if (!Number.isFinite(dt) || dt < 0) {
    throw new PhysicsParameterError("dt doit être un nombre fini positif ou nul.");
  }

  const requiredNumericFields = [
    "time",
    "position",
    "velocity",
    "acceleration",
    "hangingDisplacement",
  ];

  for (const field of requiredNumericFields) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`state.${field} doit être un nombre fini.`);
    }
  }

  if (![1, 2].includes(state.phase)) {
    throw new PhysicsParameterError("state.phase doit valoir 1 ou 2.");
  }

  if (state.position < -NUMERICAL_EPSILON || state.velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La position et la vitesse ne peuvent pas être négatives.");
  }

  if (["blocked", "finished"].includes(state.status) || dt === 0) {
    return freezeState(state);
  }

  let current = { ...state };
  let remaining = dt;
  let guard = 0;

  while (remaining > NUMERICAL_EPSILON) {
    guard += 1;
    if (guard > 8) {
      throw new Error("Trop d'événements physiques traités durant un même pas.");
    }

    if (current.position >= p.trackLength - NUMERICAL_EPSILON) {
      return freezeState({
        ...current,
        position: p.trackLength,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "track-end",
      });
    }

    if (current.phase === 1) {
      const acceleration = computePhase1Acceleration(p);

      if (acceleration <= NUMERICAL_EPSILON && current.velocity <= NUMERICAL_EPSILON) {
        return freezeState({
          ...current,
          velocity: 0,
          acceleration: 0,
          status: "blocked",
          endReason: "insufficient-driving-force",
        });
      }

      const timeToTrackEnd = timeToReachPosition({
        position: current.position,
        velocity: current.velocity,
        acceleration,
        targetPosition: p.trackLength,
      });

      const timeToPhase2 = timeToReachPosition({
        position: current.position,
        velocity: current.velocity,
        acceleration,
        targetPosition: p.dropHeight,
      });

      // En cas d'égalité, la fin du banc est prioritaire conformément au cahier des charges.
      if (
        timeToTrackEnd <= remaining + NUMERICAL_EPSILON &&
        timeToTrackEnd <= timeToPhase2 + NUMERICAL_EPSILON
      ) {
        current = advanceWithConstantAcceleration(current, acceleration, timeToTrackEnd);
        return freezeState({
          ...current,
          position: p.trackLength,
          velocity: 0,
          acceleration: 0,
          hangingDisplacement: Math.min(p.dropHeight, p.trackLength),
          status: "finished",
          endReason: "track-end",
        });
      }

      if (timeToPhase2 <= remaining + NUMERICAL_EPSILON) {
        current = advanceWithConstantAcceleration(current, acceleration, timeToPhase2);
        current = {
          ...current,
          position: p.dropHeight,
          hangingDisplacement: p.dropHeight,
          phase: 2,
        };
        remaining = Math.max(0, remaining - timeToPhase2);
        continue;
      }

      current = advanceWithConstantAcceleration(current, acceleration, remaining);
      remaining = 0;
      continue;
    }

    const acceleration = computePhase2Acceleration(p, current.velocity);

    if (current.velocity <= NUMERICAL_EPSILON) {
      return freezeState({
        ...current,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "friction-stop",
      });
    }

    const timeToTrackEnd = timeToReachPosition({
      position: current.position,
      velocity: current.velocity,
      acceleration,
      targetPosition: p.trackLength,
    });
    const stopTime = timeToStop(current.velocity, acceleration);

    if (
      timeToTrackEnd <= remaining + NUMERICAL_EPSILON &&
      timeToTrackEnd <= stopTime + NUMERICAL_EPSILON
    ) {
      current = advanceWithConstantAcceleration(current, acceleration, timeToTrackEnd);
      return freezeState({
        ...current,
        position: p.trackLength,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "track-end",
      });
    }

    if (stopTime <= remaining + NUMERICAL_EPSILON) {
      current = advanceWithConstantAcceleration(current, acceleration, stopTime);
      return freezeState({
        ...current,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "friction-stop",
      });
    }

    current = advanceWithConstantAcceleration(current, acceleration, remaining);
    remaining = 0;
  }

  return freezeState(current);
}
