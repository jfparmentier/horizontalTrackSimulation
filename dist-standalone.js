(() => {
"use strict";
const modules = {};
modules.constants = (() => {

/**
 * Constantes physiques et limites retenues pour la première version.
 */

const GRAVITY = Object.freeze({
  earth: 9.81,
});

const FIXED_TRACK_LENGTH = 2.0;
const FIXED_M1 = 1.0;
const FIXED_DROP_HEIGHT = 0.6;
const FIXED_SENSOR_POSITIONS = Object.freeze([
  0.12, 0.24, 0.36, 0.48, 0.6,
  0.8, 1.0, 1.2, 1.4, 1.6, 1.8,
]);
const FIXED_SENSOR_COUNT = FIXED_SENSOR_POSITIONS.length;
const FIXED_MOBILE_LENGTH = 0.2;

const PARAMETER_LIMITS = Object.freeze({
  m1: Object.freeze({ min: 0.1, max: 2.0, unit: "kg" }),
  m2: Object.freeze({ min: 0.1, max: 2.0, step: 0.1, unit: "kg" }),
  dropHeight: Object.freeze({ min: 0.2, max: 1.0, unit: "m" }),
  trackLength: Object.freeze({ min: 1.0, max: 3.0, unit: "m" }),
  friction: Object.freeze({ min: 0.0, max: 0.2, unit: "1" }),
});

const DEFAULT_PARAMETERS = Object.freeze({
  m1: FIXED_M1,
  m2: 0.1,
  dropHeight: FIXED_DROP_HEIGHT,
  trackLength: FIXED_TRACK_LENGTH,
  friction: 0.0,
  gravityMode: "earth",
});

const NUMERICAL_EPSILON = 1e-12;

return Object.freeze({ GRAVITY, FIXED_TRACK_LENGTH, FIXED_M1, FIXED_DROP_HEIGHT, FIXED_SENSOR_COUNT, FIXED_SENSOR_POSITIONS, FIXED_MOBILE_LENGTH, PARAMETER_LIMITS, DEFAULT_PARAMETERS, NUMERICAL_EPSILON });
})();

modules.physics = (() => {
const { DEFAULT_PARAMETERS, FIXED_MOBILE_LENGTH, GRAVITY, NUMERICAL_EPSILON, PARAMETER_LIMITS } = modules.constants;
/**
 * Erreur spécifique signalant une donnée physique invalide.
 */
class PhysicsParameterError extends RangeError {
  constructor(message) {
    super(message);
    this.name = "PhysicsParameterError";
  }
}

/**
 * Retourne la valeur de g correspondant au milieu choisi.
 *
 * @param {"earth"} gravityMode
 * @returns {number} accélération de la pesanteur en m·s⁻²
 */
function getGravity(gravityMode) {
  if (!Object.hasOwn(GRAVITY, gravityMode)) {
    throw new PhysicsParameterError(
      `Mode de gravité inconnu : ${String(gravityMode)}. Seule la valeur earth est admise.`,
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
function validateParameters(parameters = DEFAULT_PARAMETERS) {
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

    if (limits.step) {
      const stepIndex = (value - limits.min) / limits.step;
      if (Math.abs(stepIndex - Math.round(stepIndex)) > 1e-9) {
        throw new PhysicsParameterError(
          `${key} doit varier par pas de ${limits.step} ${limits.unit}.`,
        );
      }
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

/**
 * Position maximale du bord gauche de S1. Lorsque cette position est atteinte,
 * son bord droit coïncide exactement avec l'extrémité du banc.
 */
function getMaximumMobilePosition(parameters = DEFAULT_PARAMETERS) {
  const p = validateParameters(parameters);
  const maximum = p.trackLength - FIXED_MOBILE_LENGTH;

  if (maximum <= NUMERICAL_EPSILON) {
    throw new PhysicsParameterError(
      "La longueur du banc doit être supérieure à la longueur de S1.",
    );
  }

  return maximum;
}

function computePhase1Acceleration(parameters) {
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
function computePhase2Acceleration(parameters, velocity) {
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
function computePhase1EndVelocity(parameters) {
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
function timeToReachPosition({
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
function timeToStop(velocity, acceleration) {
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
function integrateConstantAcceleration(position, velocity, acceleration, dt) {
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
function createInitialState(parameters = DEFAULT_PARAMETERS) {
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
function validateSimulationState(state, parameters = DEFAULT_PARAMETERS) {
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

  const maximumPosition = getMaximumMobilePosition(p);
  if (state.position < -NUMERICAL_EPSILON || state.position > maximumPosition + NUMERICAL_EPSILON) {
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

return Object.freeze({ PhysicsParameterError, getGravity, validateParameters, getMaximumMobilePosition, computePhase1Acceleration, computePhase2Acceleration, computePhase1EndVelocity, timeToReachPosition, timeToStop, integrateConstantAcceleration, createInitialState, validateSimulationState });
})();

modules.transitions = (() => {
const { NUMERICAL_EPSILON } = modules.constants;
const { PhysicsParameterError, computePhase1Acceleration, computePhase2Acceleration, getMaximumMobilePosition, integrateConstantAcceleration, timeToReachPosition, timeToStop, validateParameters, validateSimulationState } = modules.physics;
/** Types d'événements physiques produits par le moteur. */
const PHYSICAL_EVENT = Object.freeze({
  PHASE_CHANGE: "phase-change",
  TRACK_END: "track-end",
  FRICTION_STOP: "friction-stop",
  BLOCKED: "blocked",
});

const EVENT_PRIORITY = Object.freeze({
  [PHYSICAL_EVENT.TRACK_END]: 0,
  [PHYSICAL_EVENT.FRICTION_STOP]: 1,
  [PHYSICAL_EVENT.PHASE_CHANGE]: 2,
  [PHYSICAL_EVENT.BLOCKED]: 3,
});

function freezeState(state) {
  return Object.freeze({ ...state });
}

function freezeEvent(event) {
  return Object.freeze({ ...event });
}

function getAccelerationForState(state, parameters) {
  return state.phase === 1
    ? computePhase1Acceleration(parameters)
    : computePhase2Acceleration(parameters, state.velocity);
}

/**
 * Sélectionne l'événement le plus proche. En cas de simultanéité numérique,
 * la fin du banc est prioritaire, conformément au cahier des charges.
 */
function selectEarliestEvent(candidates) {
  const finite = candidates.filter(
    (candidate) => Number.isFinite(candidate.time) && candidate.time >= -NUMERICAL_EPSILON,
  );

  if (finite.length === 0) {
    return null;
  }

  finite.sort((left, right) => {
    const delta = left.time - right.time;
    if (Math.abs(delta) > NUMERICAL_EPSILON) {
      return delta;
    }
    return EVENT_PRIORITY[left.type] - EVENT_PRIORITY[right.type];
  });

  return Object.freeze({ ...finite[0], time: Math.max(0, finite[0].time) });
}

/**
 * Détermine le prochain événement physique à partir de l'état courant.
 * Le temps retourné est relatif à l'état fourni.
 *
 * @returns {Readonly<object>|null}
 */
function getNextPhysicalEvent(state, parameters) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (["blocked", "finished"].includes(current.status)) {
    return null;
  }

  const maximumPosition = getMaximumMobilePosition(p);

  if (current.position >= maximumPosition - NUMERICAL_EPSILON) {
    return freezeEvent({ type: PHYSICAL_EVENT.TRACK_END, time: 0 });
  }

  if (current.phase === 1) {
    const acceleration = computePhase1Acceleration(p);

    if (acceleration <= NUMERICAL_EPSILON && current.velocity <= NUMERICAL_EPSILON) {
      return freezeEvent({ type: PHYSICAL_EVENT.BLOCKED, time: 0 });
    }

    const timeToTrackEnd = timeToReachPosition({
      position: current.position,
      velocity: current.velocity,
      acceleration,
      targetPosition: maximumPosition,
    });

    const timeToPhaseChange = timeToReachPosition({
      position: current.position,
      velocity: current.velocity,
      acceleration,
      targetPosition: p.dropHeight,
    });

    return selectEarliestEvent([
      { type: PHYSICAL_EVENT.TRACK_END, time: timeToTrackEnd },
      { type: PHYSICAL_EVENT.PHASE_CHANGE, time: timeToPhaseChange },
    ]);
  }

  if (current.velocity <= NUMERICAL_EPSILON) {
    return freezeEvent({ type: PHYSICAL_EVENT.FRICTION_STOP, time: 0 });
  }

  const acceleration = computePhase2Acceleration(p, current.velocity);
  const timeToTrackEnd = timeToReachPosition({
    position: current.position,
    velocity: current.velocity,
    acceleration,
    targetPosition: maximumPosition,
  });
  const stopTime = timeToStop(current.velocity, acceleration);

  return selectEarliestEvent([
    { type: PHYSICAL_EVENT.TRACK_END, time: timeToTrackEnd },
    { type: PHYSICAL_EVENT.FRICTION_STOP, time: stopTime },
  ]);
}

/**
 * Avance sans franchir d'événement. L'accélération reste constante sur la durée.
 */
function advanceWithinCurrentPhase(state, parameters, duration) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (!Number.isFinite(duration) || duration < 0) {
    throw new PhysicsParameterError("La durée doit être un nombre fini positif ou nul.");
  }

  const acceleration = getAccelerationForState(current, p);
  const integrated = integrateConstantAcceleration(
    current.position,
    current.velocity,
    acceleration,
    duration,
  );

  return freezeState({
    ...current,
    time: current.time + duration,
    position: integrated.position,
    velocity: Math.max(0, integrated.velocity),
    acceleration,
    hangingDisplacement:
      current.phase === 1
        ? Math.min(p.dropHeight, integrated.position)
        : p.dropHeight,
    status: duration > 0 ? "running" : current.status,
  });
}

/**
 * Applique un événement après avoir avancé exactement jusqu'à son instant.
 * Retourne l'état normalisé et un relevé de l'événement à l'instant absolu.
 */
function advanceToPhysicalEvent(state, parameters, event) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (event === null || typeof event !== "object") {
    throw new TypeError("Un événement physique est requis.");
  }

  if (!Object.values(PHYSICAL_EVENT).includes(event.type)) {
    throw new PhysicsParameterError(`Type d'événement inconnu : ${String(event.type)}.`);
  }

  if (!Number.isFinite(event.time) || event.time < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("Le temps de l'événement doit être positif ou nul.");
  }

  let reached = advanceWithinCurrentPhase(current, p, Math.max(0, event.time));
  const fromPhase = current.phase;
  const maximumPosition = getMaximumMobilePosition(p);

  switch (event.type) {
    case PHYSICAL_EVENT.PHASE_CHANGE: {
      const velocityAtTransition = Math.max(0, reached.velocity);
      reached = freezeState({
        ...reached,
        position: p.dropHeight,
        hangingDisplacement: p.dropHeight,
        phase: 2,
        acceleration: computePhase2Acceleration(p, velocityAtTransition),
        status: "running",
        endReason: null,
      });
      break;
    }

    case PHYSICAL_EVENT.TRACK_END:
      reached = freezeState({
        ...reached,
        position: maximumPosition,
        hangingDisplacement:
          fromPhase === 1 ? Math.min(p.dropHeight, maximumPosition) : p.dropHeight,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "track-end",
      });
      break;

    case PHYSICAL_EVENT.FRICTION_STOP:
      reached = freezeState({
        ...reached,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "friction-stop",
      });
      break;

    case PHYSICAL_EVENT.BLOCKED:
      reached = freezeState({
        ...reached,
        velocity: 0,
        acceleration: 0,
        status: "blocked",
        endReason: "insufficient-driving-force",
      });
      break;

    default:
      throw new Error("Événement physique non traité.");
  }

  const record = freezeEvent({
    type: event.type,
    time: reached.time,
    position: reached.position,
    velocity: reached.velocity,
    fromPhase,
    toPhase: reached.phase,
    status: reached.status,
    endReason: reached.endReason,
  });

  return Object.freeze({ state: reached, event: record });
}

/**
 * Fait progresser la simulation de dt en traitant tous les événements exacts
 * rencontrés durant ce pas. Le temps n'est pas consommé après un événement final.
 */
function advanceSimulationWithEvents(state, parameters, dt) {
  const p = validateParameters(parameters);
  let current = validateSimulationState(state, p);

  if (!Number.isFinite(dt) || dt < 0) {
    throw new PhysicsParameterError("dt doit être un nombre fini positif ou nul.");
  }

  if (["blocked", "finished"].includes(current.status) || dt === 0) {
    return Object.freeze({ state: freezeState(current), events: Object.freeze([]) });
  }

  let remaining = dt;
  const events = [];
  let guard = 0;

  while (remaining > NUMERICAL_EPSILON) {
    guard += 1;
    if (guard > 8) {
      throw new Error("Trop d'événements physiques traités durant un même pas.");
    }

    const nextEvent = getNextPhysicalEvent(current, p);

    if (nextEvent && nextEvent.time <= remaining + NUMERICAL_EPSILON) {
      const exactTime = nextEvent.time > remaining ? remaining : nextEvent.time;
      const result = advanceToPhysicalEvent(current, p, {
        ...nextEvent,
        time: exactTime,
      });

      current = result.state;
      events.push(result.event);
      remaining = Math.max(0, remaining - exactTime);

      if (["blocked", "finished"].includes(current.status)) {
        break;
      }

      continue;
    }

    current = advanceWithinCurrentPhase(current, p, remaining);
    remaining = 0;
  }

  return Object.freeze({
    state: freezeState(current),
    events: Object.freeze(events.map(freezeEvent)),
  });
}

/**
 * Interface compatible avec l'étape 1 : retourne uniquement le nouvel état.
 */
function advanceSimulation(state, parameters, dt) {
  return advanceSimulationWithEvents(state, parameters, dt).state;
}

return Object.freeze({ PHYSICAL_EVENT, getNextPhysicalEvent, advanceWithinCurrentPhase, advanceToPhysicalEvent, advanceSimulationWithEvents, advanceSimulation });
})();

modules.timeLoop = (() => {
const { NUMERICAL_EPSILON } = modules.constants;
const { PhysicsParameterError, createInitialState, validateParameters, validateSimulationState } = modules.physics;
const { advanceSimulationWithEvents } = modules.transitions;
/**
 * Réglages temporels par défaut.
 * Les durées physiques sont exprimées en secondes ; les horodatages RAF en millisecondes.
 */
const TIME_LOOP_DEFAULTS = Object.freeze({
  physicsStep: 0.002,
  manualStepDuration: 0.05,
  maxWallDelta: 0.25,
  maxSubStepsPerFrame: 2000,
  playbackSpeed: 1,
});

const PLAYBACK_SPEED_LIMITS = Object.freeze({
  min: 0.1,
  max: 1,
});

function freezeState(state) {
  return Object.freeze({ ...state });
}

function freezeMeta(meta) {
  return Object.freeze({ ...meta });
}

function validatePositiveFinite(name, value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new PhysicsParameterError(`${name} doit être un nombre fini strictement positif.`);
  }
  return value;
}

function validateNonNegativeFinite(name, value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new PhysicsParameterError(`${name} doit être un nombre fini positif ou nul.`);
  }
  return value;
}

function normalizeLoopOptions(options = {}) {
  if (options === null || typeof options !== "object") {
    throw new TypeError("Les options de boucle doivent être fournies sous forme d'objet.");
  }

  const physicsStep = validatePositiveFinite(
    "physicsStep",
    Number(options.physicsStep ?? TIME_LOOP_DEFAULTS.physicsStep),
  );
  const manualStepDuration = validatePositiveFinite(
    "manualStepDuration",
    Number(options.manualStepDuration ?? TIME_LOOP_DEFAULTS.manualStepDuration),
  );
  const maxWallDelta = validatePositiveFinite(
    "maxWallDelta",
    Number(options.maxWallDelta ?? TIME_LOOP_DEFAULTS.maxWallDelta),
  );
  const maxSubStepsPerFrame = Number(
    options.maxSubStepsPerFrame ?? TIME_LOOP_DEFAULTS.maxSubStepsPerFrame,
  );
  const playbackSpeed = Number(options.playbackSpeed ?? TIME_LOOP_DEFAULTS.playbackSpeed);

  if (!Number.isInteger(maxSubStepsPerFrame) || maxSubStepsPerFrame <= 0) {
    throw new PhysicsParameterError(
      "maxSubStepsPerFrame doit être un entier strictement positif.",
    );
  }

  if (
    !Number.isFinite(playbackSpeed) ||
    playbackSpeed < PLAYBACK_SPEED_LIMITS.min ||
    playbackSpeed > PLAYBACK_SPEED_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `playbackSpeed doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
    );
  }

  return Object.freeze({
    physicsStep,
    manualStepDuration,
    maxWallDelta,
    maxSubStepsPerFrame,
    playbackSpeed,
  });
}

function resolveAnimationDependencies(options) {
  const requestFrame = options.requestFrame ?? globalThis.requestAnimationFrame?.bind(globalThis);
  const cancelFrame = options.cancelFrame ?? globalThis.cancelAnimationFrame?.bind(globalThis);

  if (typeof requestFrame !== "function" || typeof cancelFrame !== "function") {
    throw new TypeError(
      "requestAnimationFrame et cancelAnimationFrame doivent exister ou être injectés.",
    );
  }

  return Object.freeze({ requestFrame, cancelFrame });
}

function stateWithStatus(state, status) {
  if (["blocked", "finished"].includes(state.status)) {
    return state;
  }

  return freezeState({ ...state, status });
}

/**
 * Crée une boucle temporelle à pas physique fixe et rendu piloté par
 * requestAnimationFrame. Toutes les dépendances temporelles sont injectables,
 * ce qui rend la boucle entièrement testable sous Node.js.
 *
 * @param {object} configuration
 * @param {object} configuration.parameters paramètres physiques
 * @param {object} [configuration.initialState] état initial personnalisé
 * @param {number} [configuration.physicsStep=0.002] pas physique fixe en s
 * @param {number} [configuration.manualStepDuration=0.05] durée du bouton pas à pas
 * @param {number} [configuration.maxWallDelta=0.25] delta mural maximal retenu par image
 * @param {number} [configuration.maxSubStepsPerFrame=2000] garde contre la spirale de calcul
 * @param {number} [configuration.playbackSpeed=1] facteur de vitesse de lecture
 * @param {Function} [configuration.onRender] callback appelé à chaque rendu
 * @param {Function} [configuration.onEvents] callback appelé lorsqu'un événement survient
 * @param {Function} [configuration.requestFrame] injection de requestAnimationFrame
 * @param {Function} [configuration.cancelFrame] injection de cancelAnimationFrame
 */
function createTimeLoop(configuration = {}) {
  if (configuration === null || typeof configuration !== "object") {
    throw new TypeError("La configuration de la boucle doit être un objet.");
  }

  let parameters = validateParameters(configuration.parameters);
  const options = normalizeLoopOptions(configuration);
  const animation = resolveAnimationDependencies(configuration);
  const onRender = configuration.onRender ?? (() => {});
  const onEvents = configuration.onEvents ?? (() => {});

  if (typeof onRender !== "function" || typeof onEvents !== "function") {
    throw new TypeError("onRender et onEvents doivent être des fonctions.");
  }

  let state = configuration.initialState
    ? validateSimulationState(configuration.initialState, parameters)
    : createInitialState(parameters);
  let previousState = state;
  let accumulator = 0;
  let playbackSpeed = options.playbackSpeed;
  let lastTimestamp = null;
  let frameRequestId = null;
  let running = false;
  let destroyed = false;
  let totalPhysicsSteps = 0;
  let droppedSimulationTime = 0;

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cette boucle temporelle a été détruite.");
    }
  }

  function isTerminal() {
    return ["blocked", "finished"].includes(state.status);
  }

  function render(extraMeta = {}) {
    const interpolationAlpha = Math.min(
      1,
      Math.max(0, accumulator / options.physicsStep),
    );

    const meta = freezeMeta({
      running,
      interpolationAlpha,
      accumulator,
      playbackSpeed,
      totalPhysicsSteps,
      droppedSimulationTime,
      ...extraMeta,
    });

    onRender(state, previousState, meta);
  }

  function emitEvents(events) {
    if (events.length > 0) {
      onEvents(Object.freeze([...events]), state);
    }
  }

  function cancelScheduledFrame() {
    if (frameRequestId !== null) {
      animation.cancelFrame(frameRequestId);
      frameRequestId = null;
    }
  }

  function scheduleNextFrame() {
    if (!running || destroyed || frameRequestId !== null || isTerminal()) {
      return;
    }
    frameRequestId = animation.requestFrame(handleAnimationFrame);
  }

  /**
   * Exécute une durée physique au moyen du pas fixe. Le dernier sous-pas peut
   * être plus court afin de consommer exactement la durée demandée.
   */
  function advancePhysicalDuration(duration, maxSteps = Infinity) {
    validateNonNegativeFinite("duration", duration);

    let remaining = duration;
    let steps = 0;
    const events = [];

    while (remaining > NUMERICAL_EPSILON && steps < maxSteps && !isTerminal()) {
      const dt = Math.min(options.physicsStep, remaining);
      previousState = state;
      const result = advanceSimulationWithEvents(state, parameters, dt);
      state = result.state;
      events.push(...result.events);
      totalPhysicsSteps += 1;
      steps += 1;
      remaining = Math.max(0, remaining - dt);
    }

    return Object.freeze({
      consumed: duration - remaining,
      remaining,
      steps,
      events: Object.freeze(events),
    });
  }

  function handleAnimationFrame(timestamp) {
    frameRequestId = null;

    if (!running || destroyed || isTerminal()) {
      return;
    }

    if (!Number.isFinite(timestamp)) {
      throw new TypeError("L'horodatage de requestAnimationFrame doit être fini.");
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
      render({ wallDelta: 0, simulationDelta: 0, physicsStepsThisFrame: 0 });
      scheduleNextFrame();
      return;
    }

    const rawWallDelta = Math.max(0, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    const wallDelta = Math.min(rawWallDelta, options.maxWallDelta);
    const simulationDelta = wallDelta * playbackSpeed;
    accumulator += simulationDelta;

    const availableFullSteps = Math.floor(
      (accumulator + NUMERICAL_EPSILON) / options.physicsStep,
    );
    const requestedDuration = availableFullSteps * options.physicsStep;
    const maximumDuration = options.maxSubStepsPerFrame * options.physicsStep;
    const durationToConsume = Math.min(requestedDuration, maximumDuration);

    const result = advancePhysicalDuration(
      durationToConsume,
      options.maxSubStepsPerFrame,
    );
    accumulator = Math.max(0, accumulator - result.consumed);

    if (availableFullSteps > options.maxSubStepsPerFrame) {
      const retainedRemainder = accumulator % options.physicsStep;
      const discarded = accumulator - retainedRemainder;
      droppedSimulationTime += discarded;
      accumulator = retainedRemainder;
    }

    emitEvents(result.events);

    if (isTerminal()) {
      running = false;
      accumulator = 0;
      lastTimestamp = null;
    }

    render({
      rawWallDelta,
      wallDelta,
      simulationDelta,
      physicsStepsThisFrame: result.steps,
    });

    scheduleNextFrame();
  }

  function start() {
    assertUsable();

    if (running || isTerminal()) {
      return false;
    }

    running = true;
    state = stateWithStatus(state, "running");
    lastTimestamp = null;
    scheduleNextFrame();
    render({ reason: "start" });
    return true;
  }

  function pause() {
    assertUsable();

    if (!running) {
      return false;
    }

    running = false;
    cancelScheduledFrame();
    lastTimestamp = null;
    state = stateWithStatus(state, "paused");
    render({ reason: "pause" });
    return true;
  }

  function step(duration = options.manualStepDuration) {
    assertUsable();
    validateNonNegativeFinite("duration", duration);

    if (isTerminal() || duration === 0) {
      render({ reason: "manual-step", manualDuration: duration, physicsStepsThisFrame: 0 });
      return Object.freeze({ state, events: Object.freeze([]), steps: 0 });
    }

    if (running) {
      running = false;
      cancelScheduledFrame();
      lastTimestamp = null;
    }

    state = stateWithStatus(state, "running");
    const result = advancePhysicalDuration(duration);
    emitEvents(result.events);

    if (!isTerminal()) {
      state = stateWithStatus(state, "paused");
    }

    accumulator = 0;
    render({
      reason: "manual-step",
      manualDuration: duration,
      physicsStepsThisFrame: result.steps,
    });

    return Object.freeze({
      state,
      events: result.events,
      steps: result.steps,
    });
  }

  function reset(nextParameters = parameters) {
    assertUsable();
    parameters = validateParameters(nextParameters);
    running = false;
    cancelScheduledFrame();
    state = createInitialState(parameters);
    previousState = state;
    accumulator = 0;
    lastTimestamp = null;
    totalPhysicsSteps = 0;
    droppedSimulationTime = 0;
    render({ reason: "reset" });
    return state;
  }

  function replaceState(nextState) {
    assertUsable();
    running = false;
    cancelScheduledFrame();
    state = validateSimulationState(nextState, parameters);
    previousState = state;
    accumulator = 0;
    lastTimestamp = null;
    render({ reason: "replace-state" });
    return state;
  }

  function setPlaybackSpeed(nextSpeed) {
    assertUsable();
    const value = Number(nextSpeed);

    if (
      !Number.isFinite(value) ||
      value < PLAYBACK_SPEED_LIMITS.min ||
      value > PLAYBACK_SPEED_LIMITS.max
    ) {
      throw new PhysicsParameterError(
        `La vitesse de lecture doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
      );
    }

    playbackSpeed = value;
    render({ reason: "playback-speed-change" });
    return playbackSpeed;
  }

  function getState() {
    return state;
  }

  function getParameters() {
    return parameters;
  }

  function getDiagnostics() {
    return Object.freeze({
      running,
      scheduled: frameRequestId !== null,
      accumulator,
      playbackSpeed,
      totalPhysicsSteps,
      droppedSimulationTime,
      destroyed,
    });
  }

  function destroy() {
    if (destroyed) {
      return false;
    }

    running = false;
    cancelScheduledFrame();
    lastTimestamp = null;
    destroyed = true;
    return true;
  }

  render({ reason: "initialization" });

  return Object.freeze({
    start,
    pause,
    step,
    reset,
    replaceState,
    setPlaybackSpeed,
    getState,
    getParameters,
    getDiagnostics,
    destroy,
  });
}

return Object.freeze({ TIME_LOOP_DEFAULTS, PLAYBACK_SPEED_LIMITS, createTimeLoop });
})();

modules.geometry = (() => {
const { DEFAULT_PARAMETERS, FIXED_MOBILE_LENGTH, FIXED_SENSOR_COUNT, FIXED_SENSOR_POSITIONS } = modules.constants;
const { PhysicsParameterError, validateParameters } = modules.physics;
const APPARATUS_VIEWBOX = Object.freeze({
  width: 1200,
  height: 620,
});

const SENSOR_COUNT_LIMITS = Object.freeze({
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
function createDefaultSensors(trackLength, count = SENSOR_COUNT_LIMITS.default) {
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
function createLinearScale(domainStart, domainEnd, rangeStart, rangeEnd) {
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
function computeApparatusLayout(options = {}) {
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
  const socle = Object.freeze({
    x: hangingMass.x - 34,
    y: hangingMass.y + hangingMass.height + parameters.dropHeight * pixelsPerMeter,
    width: hangingMass.width + 68,
    height: 28,
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
      x: socle.x + socle.width + 30,
      topY: hangingMass.y + hangingMass.height,
      bottomY: socle.y,
    }),
  });
}

return Object.freeze({ APPARATUS_VIEWBOX, SENSOR_COUNT_LIMITS, createDefaultSensors, createLinearScale, computeApparatusLayout });
})();

modules.view = (() => {
const { computeApparatusLayout } = modules.geometry;
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
      const highlighted = tick.isDropHeight;
      const tickHeight = major || highlighted ? 16 : 10;
      const label = tick.index % 2 === 0 || tick.index === 10
        ? `<text class="ruler-label" x="${tick.x}" y="${ruler.y + 39}" text-anchor="middle">${escapeXml(tick.label)}</text>`
        : "";

      return `
        <line class="ruler-tick${major ? " ruler-tick--major" : ""}${highlighted ? " ruler-tick--drop-height" : ""}" x1="${tick.x}" y1="${ruler.y}" x2="${tick.x}" y2="${ruler.y + tickHeight}" />
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
function buildStaticApparatusSvg(options = {}) {
  const layout = computeApparatusLayout(options);
  const { parameters } = layout;
  const description = [
    "Montage initial avec le mobile S1 sur un banc horizontal,",
    "la masse S2 suspendue par un fil passant sur une poulie,",
    `${layout.sensorCount} capteurs placés aux positions expérimentales et un support de réception sous S2.`,
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
function mountStaticApparatus(container, options = {}) {
  if (!container || typeof container !== "object" || !("innerHTML" in container)) {
    throw new TypeError("Un conteneur DOM disposant de innerHTML est requis.");
  }

  container.innerHTML = buildStaticApparatusSvg(options);
  return typeof container.querySelector === "function"
    ? container.querySelector("#apparatus-svg")
    : null;
}

return Object.freeze({ buildStaticApparatusSvg, mountStaticApparatus });
})();

modules.animation = (() => {

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function assertFiniteState(state, name) {
  if (state === null || typeof state !== "object") {
    throw new TypeError(`${name} doit être un objet d'état.`);
  }

  for (const field of ["position", "hangingDisplacement"]) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`${name}.${field} doit être un nombre fini.`);
    }
  }
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Calcule la géométrie affichée entre deux états physiques consécutifs.
 * Cette fonction pure permet de tester l'animation sans navigateur.
 */
function computeAnimatedApparatusFrame(
  layout,
  currentState,
  previousState = currentState,
  interpolationAlpha = 1,
) {
  if (layout === null || typeof layout !== "object") {
    throw new TypeError("Un layout de montage est requis.");
  }

  assertFiniteState(currentState, "currentState");
  assertFiniteState(previousState, "previousState");

  if (!Number.isFinite(interpolationAlpha)) {
    throw new TypeError("interpolationAlpha doit être un nombre fini.");
  }

  const alpha = clamp(interpolationAlpha, 0, 1);
  const position = clamp(
    interpolate(previousState.position, currentState.position, alpha),
    0,
    layout.motionScale?.maximumMobilePosition ?? layout.parameters.trackLength,
  );
  const hangingDisplacement = clamp(
    interpolate(
      previousState.hangingDisplacement,
      currentState.hangingDisplacement,
      alpha,
    ),
    0,
    layout.parameters.dropHeight,
  );

  // Les deux solides utilisent la même échelle graphique : un déplacement
  // physique identique produit le même déplacement en pixels à l'écran.
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  const mobileX = layout.mobile.x + position * pixelsPerMeter;
  const mobileY = layout.mobile.y;

  // En phase 1, S2 descend exactement du même nombre de pixels que S1 avance.
  // Le support a été placé à h × pixelsPerMeter sous la position initiale.
  const hangingMassY = layout.hangingMass.y
    + hangingDisplacement * pixelsPerMeter;

  const ropeStartX = mobileX + layout.mobile.width;
  const ropeY = layout.string.startY;
  const ropeEntryX = layout.string.pulleyEntryX;
  const ropeEntryY = layout.string.pulleyEntryY;
  const ropeExitX = layout.string.pulleyExitX;
  const ropeExitY = layout.string.pulleyExitY;
  const ropeEndY = hangingMassY;
  const afterDropDistance = Math.max(0, position - layout.parameters.dropHeight);
  const afterDropRatio = layout.parameters.trackLength > layout.parameters.dropHeight
    ? clamp(
        afterDropDistance
          / (layout.parameters.trackLength - layout.parameters.dropHeight),
        0,
        1,
      )
    : 0;
  const slack = currentState.phase === 2 || afterDropDistance > 0;

  let ropePath;
  if (slack) {
    const horizontalSpan = Math.max(1, ropeEntryX - ropeStartX);
    const sag = 10 + 34 * afterDropRatio;
    const firstControlX = ropeStartX + horizontalSpan * 0.34;
    const secondControlX = ropeStartX + horizontalSpan * 0.7;

    ropePath = `M ${ropeStartX} ${ropeY}
      C ${firstControlX} ${ropeY + sag}, ${secondControlX} ${ropeY + sag}, ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  } else {
    ropePath = `M ${ropeStartX} ${ropeY}
      L ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  }

  return Object.freeze({
    position,
    hangingDisplacement,
    mobileX,
    mobileY,
    hangingMassX: layout.hangingMass.x,
    hangingMassY,
    ropePath,
    slack,
  });
}

function requireSvgElement(svg, selector) {
  const element = svg.querySelector(selector);
  if (!element) {
    throw new Error(`Élément SVG introuvable : ${selector}`);
  }
  return element;
}

/**
 * Relie un SVG déjà monté au moteur temporel. Le rendu ne modifie que les
 * transformations de S1 et S2 ainsi que le tracé du fil.
 */
function createApparatusAnimator(svg, layout) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }

  const mobileLayer = requireSvgElement(svg, "#layer-mobile");
  const hangingMassLayer = requireSvgElement(svg, "#layer-hanging-mass");
  const stringPath = requireSvgElement(svg, "#string-path");
  const description = svg.querySelector("#apparatus-description");

  function render(currentState, previousState = currentState, meta = {}) {
    const terminal = ["blocked", "finished"].includes(currentState.status);
    const snapToCurrent = terminal || Boolean(meta.reason) || meta.running === false;
    const interpolationAlpha = snapToCurrent ? 1 : (meta.interpolationAlpha ?? 1);
    const frame = computeAnimatedApparatusFrame(
      layout,
      currentState,
      previousState,
      interpolationAlpha,
    );

    mobileLayer.setAttribute(
      "transform",
      `translate(${frame.mobileX} ${frame.mobileY})`,
    );
    hangingMassLayer.setAttribute(
      "transform",
      `translate(${frame.hangingMassX} ${frame.hangingMassY})`,
    );
    stringPath.setAttribute("d", frame.ropePath);
    stringPath.setAttribute("data-tension", frame.slack ? "slack" : "taut");
    svg.setAttribute("data-phase", String(currentState.phase));
    svg.setAttribute("data-status", String(currentState.status));

    if (description) {
      const ropeState = frame.slack ? "fil détendu" : "fil tendu";
      description.textContent = `S1 à ${frame.position.toFixed(3)} m, S2 descendue de ${frame.hangingDisplacement.toFixed(3)} m, ${ropeState}.`;
    }

    return frame;
  }

  return Object.freeze({ render });
}

return Object.freeze({ computeAnimatedApparatusFrame, createApparatusAnimator });
})();

modules.appState = (() => {
const { DEFAULT_PARAMETERS, FIXED_DROP_HEIGHT, FIXED_M1, FIXED_SENSOR_COUNT, FIXED_TRACK_LENGTH } = modules.constants;
const { SENSOR_COUNT_LIMITS } = modules.geometry;
const { PLAYBACK_SPEED_LIMITS } = modules.timeLoop;
const { PhysicsParameterError, createInitialState, validateParameters, validateSimulationState } = modules.physics;
const DEFAULT_EXPERIMENTAL_SETTINGS = Object.freeze({
  sensorCount: SENSOR_COUNT_LIMITS.default,
});

const DEFAULT_DISPLAY_SETTINGS = Object.freeze({
  showMeasurements: false,
  showCurves: false,
});

const DEFAULT_PLAYBACK_SPEED = 1;

function freezeArray(items = []) {
  return Object.freeze([...items]);
}

function freezeRecordArray(items = []) {
  return Object.freeze(items.map((item) => Object.freeze({ ...item })));
}

function freezeSnapshot(snapshot) {
  return Object.freeze({
    parameters: snapshot.parameters,
    experimental: Object.freeze({ ...snapshot.experimental }),
    playbackSpeed: snapshot.playbackSpeed,
    simulation: snapshot.simulation,
    display: Object.freeze({ ...snapshot.display }),
    measurements: freezeRecordArray(snapshot.measurements),
    continuousData: freezeRecordArray(snapshot.continuousData),
    revision: snapshot.revision,
  });
}

function validateSensorCount(value) {
  const normalized = Number(value);
  if (
    !Number.isInteger(normalized)
    || normalized < SENSOR_COUNT_LIMITS.min
    || normalized > SENSOR_COUNT_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `Le nombre de capteurs doit être un entier appartenant à [${SENSOR_COUNT_LIMITS.min}, ${SENSOR_COUNT_LIMITS.max}].`,
    );
  }
  return normalized;
}

function validatePlaybackSpeed(value) {
  const normalized = Number(value);
  if (
    !Number.isFinite(normalized)
    || normalized < PLAYBACK_SPEED_LIMITS.min
    || normalized > PLAYBACK_SPEED_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `La vitesse de lecture doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
    );
  }
  return normalized;
}

function normalizeMeasurement(measurement, parameters, sequence) {
  if (!measurement || typeof measurement !== "object") {
    throw new TypeError("Chaque mesure doit être un objet.");
  }

  const normalized = {
    sequence,
    sensorId: Number(measurement.sensorId),
    position: Number(measurement.position),
    mobilePosition: Number(measurement.mobilePosition),
    time: Number(measurement.time),
    velocity: Number(measurement.velocity),
    acceleration: Number(measurement.acceleration),
    phase: Number(measurement.phase),
  };

  if (!Number.isInteger(normalized.sensorId) || normalized.sensorId <= 0) {
    throw new PhysicsParameterError("measurement.sensorId doit être un entier strictement positif.");
  }
  for (const field of ["position", "mobilePosition", "time", "velocity", "acceleration"]) {
    if (!Number.isFinite(normalized[field])) {
      throw new TypeError(`measurement.${field} doit être un nombre fini.`);
    }
  }
  if (normalized.position < 0 || normalized.position > parameters.trackLength) {
    throw new PhysicsParameterError("La position mesurée doit rester comprise sur le banc.");
  }
  if (normalized.mobilePosition < 0 || normalized.mobilePosition > parameters.trackLength) {
    throw new PhysicsParameterError("La position du mobile doit rester comprise sur le banc.");
  }
  if (normalized.time < 0 || normalized.velocity < 0) {
    throw new PhysicsParameterError("Le temps et la vitesse mesurés doivent être positifs ou nuls.");
  }
  if (![1, 2].includes(normalized.phase)) {
    throw new PhysicsParameterError("measurement.phase doit valoir 1 ou 2.");
  }

  return Object.freeze(normalized);
}

function normalizeInitialMeasurements(items, parameters) {
  if (!Array.isArray(items)) {
    throw new TypeError("measurements doit être un tableau.");
  }
  const ids = new Set();
  return items.map((item, index) => {
    const measurement = normalizeMeasurement(item, parameters, index + 1);
    if (ids.has(measurement.sensorId)) {
      throw new PhysicsParameterError("Un capteur ne peut posséder qu'une mesure par expérience.");
    }
    ids.add(measurement.sensorId);
    return measurement;
  });
}

function sameParameters(left, right) {
  return ["m1", "m2", "dropHeight", "trackLength", "friction", "gravityMode"]
    .every((key) => left[key] === right[key]);
}

/**
 * État central de l'application. Il constitue la source unique de vérité pour
 * les paramètres, l'état physique courant et les réglages d'affichage futurs.
 */
function createAppState(initial = {}) {
  if (initial === null || typeof initial !== "object") {
    throw new TypeError("La configuration initiale doit être un objet.");
  }

  const parameters = validateParameters({
    ...DEFAULT_PARAMETERS,
    ...(initial.parameters ?? {}),
    m1: FIXED_M1,
    dropHeight: FIXED_DROP_HEIGHT,
    trackLength: FIXED_TRACK_LENGTH,
  });
  const sensorCount = FIXED_SENSOR_COUNT;
  const playbackSpeed = validatePlaybackSpeed(
    initial.playbackSpeed ?? DEFAULT_PLAYBACK_SPEED,
  );
  const simulation = initial.simulation
    ? validateSimulationState(initial.simulation, parameters)
    : createInitialState(parameters);

  let snapshot = freezeSnapshot({
    parameters,
    experimental: { sensorCount },
    playbackSpeed,
    simulation,
    display: {
      ...DEFAULT_DISPLAY_SETTINGS,
      ...(initial.display ?? {}),
    },
    measurements: normalizeInitialMeasurements(initial.measurements ?? [], parameters),
    continuousData: initial.continuousData ?? [],
    revision: 0,
  });
  let destroyed = false;
  const listeners = new Set();

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cet état central a été détruit.");
    }
  }

  function notify(reason, detail = {}) {
    const meta = Object.freeze({ reason, ...detail });
    for (const listener of [...listeners]) {
      listener(snapshot, meta);
    }
  }

  function replace(next, reason, detail = {}) {
    snapshot = freezeSnapshot(next);
    notify(reason, detail);
    return snapshot;
  }

  function getSnapshot() {
    return snapshot;
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertUsable();
    if (typeof listener !== "function") {
      throw new TypeError("L'abonné doit être une fonction.");
    }
    listeners.add(listener);
    if (emitCurrent) {
      listener(snapshot, Object.freeze({ reason: "subscription" }));
    }
    return () => listeners.delete(listener);
  }

  function updateParameters(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les paramètres partiels doivent être un objet.");
    }
    const fixedParameters = Object.freeze({
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
    });
    for (const [key, fixedValue] of Object.entries(fixedParameters)) {
      if (Object.hasOwn(partial, key) && Number(partial[key]) !== fixedValue) {
        const labels = {
          m1: "La masse de S1",
          dropHeight: "La hauteur de chute",
          trackLength: "La longueur du banc",
        };
        const units = { m1: "kg", dropHeight: "m", trackLength: "m" };
        throw new PhysicsParameterError(
          `${labels[key]} est fixée à ${fixedValue} ${units[key]}.`,
        );
      }
    }

    const nextParameters = validateParameters({
      ...snapshot.parameters,
      ...partial,
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
    });
    if (sameParameters(snapshot.parameters, nextParameters)) {
      return snapshot;
    }

    return replace({
      ...snapshot,
      parameters: nextParameters,
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "parameters-change", { changedKeys: Object.freeze(Object.keys(partial)) });
  }

  function updateExperimental(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les réglages expérimentaux partiels doivent être un objet.");
    }

    if (
      Object.hasOwn(partial, "sensorCount")
      && validateSensorCount(partial.sensorCount) !== FIXED_SENSOR_COUNT
    ) {
      throw new PhysicsParameterError(
        `Le nombre de capteurs est fixé à ${FIXED_SENSOR_COUNT}.`,
      );
    }

    return snapshot;
  }

  function setPlaybackSpeed(value) {
    assertUsable();
    const nextPlaybackSpeed = validatePlaybackSpeed(value);
    if (nextPlaybackSpeed === snapshot.playbackSpeed) {
      return snapshot;
    }

    return replace({
      ...snapshot,
      playbackSpeed: nextPlaybackSpeed,
    }, "playback-speed-change");
  }

  function setSimulationState(nextSimulation) {
    assertUsable();
    const simulationState = validateSimulationState(
      nextSimulation,
      snapshot.parameters,
    );
    snapshot = freezeSnapshot({ ...snapshot, simulation: simulationState });
    notify("simulation-change");
    return snapshot;
  }

  function addMeasurements(items) {
    assertUsable();
    if (!Array.isArray(items)) {
      throw new TypeError("Les mesures à enregistrer doivent être fournies dans un tableau.");
    }

    const existingIds = new Set(snapshot.measurements.map((item) => item.sensorId));
    const accepted = [];

    for (const item of items) {
      const sequence = snapshot.measurements.length + accepted.length + 1;
      const measurement = normalizeMeasurement(item, snapshot.parameters, sequence);
      if (existingIds.has(measurement.sensorId)) continue;
      existingIds.add(measurement.sensorId);
      accepted.push(measurement);
    }

    if (accepted.length === 0) return snapshot;

    return replace({
      ...snapshot,
      measurements: [...snapshot.measurements, ...accepted],
    }, "measurements-recorded", {
      measurementCount: accepted.length,
      sensorIds: Object.freeze(accepted.map((item) => item.sensorId)),
    });
  }

  function resetExperiment() {
    assertUsable();
    return replace({
      ...snapshot,
      simulation: createInitialState(snapshot.parameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "experiment-reset");
  }

  function updateDisplay(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les réglages d'affichage partiels doivent être un objet.");
    }

    const nextDisplay = {
      ...snapshot.display,
      ...partial,
    };
    for (const key of ["showMeasurements", "showCurves"]) {
      if (typeof nextDisplay[key] !== "boolean") {
        throw new TypeError(`${key} doit être un booléen.`);
      }
    }

    return replace({ ...snapshot, display: nextDisplay }, "display-change");
  }

  function destroy() {
    if (destroyed) return false;
    listeners.clear();
    destroyed = true;
    return true;
  }

  return Object.freeze({
    getSnapshot,
    subscribe,
    updateParameters,
    updateExperimental,
    setPlaybackSpeed,
    setSimulationState,
    addMeasurements,
    resetExperiment,
    updateDisplay,
    destroy,
  });
}

return Object.freeze({ DEFAULT_EXPERIMENTAL_SETTINGS, DEFAULT_DISPLAY_SETTINGS, DEFAULT_PLAYBACK_SPEED, createAppState });
})();

modules.parameterControls = (() => {

const PHYSICAL_CONTROLS = Object.freeze([
  Object.freeze({ key: "m2", range: "#m2-range", number: "#m2-number" }),
  Object.freeze({ key: "friction", range: "#friction-range", number: "#friction-number" }),
]);

const OTHER_CONTROLS = Object.freeze({
  playbackSpeed: Object.freeze({ range: "#playback-speed-range", number: "#playback-speed-number" }),
});

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de paramétrage introuvable : ${selector}`);
  }
  return element;
}

function setPairValue(pair, value) {
  const normalized = String(value);
  pair.range.value = normalized;
  pair.number.value = normalized;
}

function setInvalid(pair, invalid) {
  const value = invalid ? "true" : "false";
  pair.range.setAttribute("aria-invalid", value);
  pair.number.setAttribute("aria-invalid", value);
}

/** Relie tous les champs de paramètres à l'état central. */
function bindParameterControls(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const errorElement = getRequiredElement(root, "#parameter-error");
  const physicalPairs = new Map(
    PHYSICAL_CONTROLS.map((definition) => [
      definition.key,
      {
        range: getRequiredElement(root, definition.range),
        number: getRequiredElement(root, definition.number),
      },
    ]),
  );
  const playbackPair = {
    range: getRequiredElement(root, OTHER_CONTROLS.playbackSpeed.range),
    number: getRequiredElement(root, OTHER_CONTROLS.playbackSpeed.number),
  };
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function clearError() {
    errorElement.textContent = "";
    for (const pair of [...physicalPairs.values(), playbackPair]) {
      setInvalid(pair, false);
    }
  }

  function showError(error, pair) {
    errorElement.textContent = error instanceof Error
      ? error.message
      : String(error);
    if (pair) setInvalid(pair, true);
  }

  function sync(snapshot = appState.getSnapshot()) {
    for (const [key, pair] of physicalPairs) {
      setPairValue(pair, snapshot.parameters[key]);
      setInvalid(pair, false);
    }
    setPairValue(playbackPair, snapshot.playbackSpeed);
  }

  function commitPhysical(key, rawValue, pair) {
    try {
      clearError();
      const numericValue = Number(rawValue);
      const normalizedValue = key === "m2"
        ? Math.round(numericValue * 10) / 10
        : numericValue;
      appState.updateParameters({ [key]: normalizedValue });
      sync();
    } catch (error) {
      sync();
      showError(error, pair);
    }
  }

  for (const [key, pair] of physicalPairs) {
    listen(pair.range, "input", () => {
      pair.number.value = pair.range.value;
      commitPhysical(key, pair.range.value, pair);
    });
    listen(pair.number, "change", () => {
      pair.range.value = pair.number.value;
      commitPhysical(key, pair.number.value, pair);
    });
  }

  listen(playbackPair.range, "input", () => {
    playbackPair.number.value = playbackPair.range.value;
    try {
      clearError();
      appState.setPlaybackSpeed(Number(playbackPair.range.value));
    } catch (error) {
      sync();
      showError(error, playbackPair);
    }
  });
  listen(playbackPair.number, "change", () => {
    playbackPair.range.value = playbackPair.number.value;
    try {
      clearError();
      appState.setPlaybackSpeed(Number(playbackPair.number.value));
    } catch (error) {
      sync();
      showError(error, playbackPair);
    }
  });

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (meta.reason !== "simulation-change") sync(snapshot);
  });

  sync();

  return Object.freeze({
    sync,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}

return Object.freeze({ bindParameterControls });
})();

modules.simulationControls = (() => {

const DEFAULT_MANUAL_STEP_DURATION = 0.05;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de commande introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state.status);
}

function isInitialState(state) {
  return state.time === 0 && state.position === 0 && state.velocity === 0;
}

function shouldIgnoreKeyboardShortcut(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  const target = event.target;
  const tagName = String(target?.tagName ?? "").toLowerCase();
  return target?.isContentEditable
    || ["input", "textarea", "select", "button"].includes(tagName);
}

/**
 * Relie les quatre commandes principales à la boucle temporelle courante.
 * La boucle est obtenue à la demande afin que la liaison reste valide après
 * toute reconstruction du montage provoquée par un changement de paramètre.
 */
function bindSimulationControls(root, configuration = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!configuration.appState || typeof configuration.appState.resetExperiment !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }
  if (typeof configuration.getLoop !== "function") {
    throw new TypeError("getLoop doit être une fonction.");
  }

  const manualStepDuration = Number(
    configuration.manualStepDuration ?? DEFAULT_MANUAL_STEP_DURATION,
  );
  if (!Number.isFinite(manualStepDuration) || manualStepDuration <= 0) {
    throw new RangeError("La durée du pas manuel doit être strictement positive.");
  }

  const startButton = getRequiredElement(root, "#start-button");
  const pauseButton = getRequiredElement(root, "#pause-button");
  const stepButton = getRequiredElement(root, "#step-button");
  const resetButton = getRequiredElement(root, "#reset-button");
  const keyboardTarget = configuration.keyboardTarget
    ?? (typeof root.addEventListener === "function" ? root : null);
  const listeners = [];
  let destroyed = false;

  startButton.setAttribute("aria-keyshortcuts", "Space");
  pauseButton.setAttribute("aria-keyshortcuts", "Space");
  stepButton.setAttribute("aria-keyshortcuts", "ArrowRight");
  resetButton.setAttribute("aria-keyshortcuts", "Home");
  stepButton.setAttribute(
    "aria-label",
    `Avancer la simulation de ${manualStepDuration.toFixed(2)} seconde`,
  );

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function getLoop() {
    if (destroyed) return null;
    return configuration.getLoop() ?? null;
  }

  function resolveRunning(meta = {}) {
    if (typeof meta.running === "boolean") return meta.running;
    return Boolean(getLoop()?.getDiagnostics?.().running);
  }

  function update(state = configuration.appState.getSnapshot().simulation, meta = {}) {
    const running = resolveRunning(meta);
    const terminal = isTerminalState(state);
    const initial = isInitialState(state);

    startButton.disabled = running || terminal;
    pauseButton.disabled = !running;
    stepButton.disabled = running || terminal;
    resetButton.disabled = initial && !running;

    startButton.textContent = initial ? "Démarrer" : "Reprendre";
    startButton.setAttribute("aria-pressed", String(running));
    pauseButton.setAttribute("aria-pressed", String(!running && !initial && !terminal));
    return Object.freeze({ running, terminal, initial });
  }

  function start() {
    const loop = getLoop();
    const changed = Boolean(loop?.start());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function pause() {
    const loop = getLoop();
    const changed = Boolean(loop?.pause());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function step() {
    const loop = getLoop();
    if (!loop) return null;
    const result = loop.step(manualStepDuration);
    update(loop.getState(), loop.getDiagnostics());
    return result;
  }

  function reset() {
    const loop = getLoop();
    loop?.pause();
    configuration.appState.resetExperiment();
    const currentLoop = getLoop();
    if (currentLoop) update(currentLoop.getState(), currentLoop.getDiagnostics());
    return true;
  }

  function onKeyDown(event) {
    if (shouldIgnoreKeyboardShortcut(event)) return;

    if (event.code === "Space" || event.key === " ") {
      event.preventDefault?.();
      if (resolveRunning()) pause();
      else start();
      return;
    }

    if (event.code === "ArrowRight" || event.key === "ArrowRight") {
      event.preventDefault?.();
      step();
      return;
    }

    if (event.code === "Home" || event.key === "Home") {
      event.preventDefault?.();
      reset();
    }
  }

  listen(startButton, "click", start);
  listen(pauseButton, "click", pause);
  listen(stepButton, "click", step);
  listen(resetButton, "click", reset);
  if (keyboardTarget && typeof keyboardTarget.addEventListener === "function") {
    listen(keyboardTarget, "keydown", onKeyDown);
  }

  update();

  return Object.freeze({
    start,
    pause,
    step,
    reset,
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      return true;
    },
  });
}

return Object.freeze({ DEFAULT_MANUAL_STEP_DURATION, bindSimulationControls });
})();

modules.sensorController = (() => {

const SENSOR_EPSILON = 1e-10;

function assertFinitePosition(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} doit être un nombre fini.`);
  }
}

function normalizeTriggeredIds(triggeredIds) {
  if (triggeredIds === undefined) return new Set();
  if (!triggeredIds || typeof triggeredIds[Symbol.iterator] !== "function") {
    throw new TypeError("triggeredIds doit être itérable.");
  }
  return new Set(triggeredIds);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Détermine les capteurs franchis lors d'un déplacement monotone.
 * Les positions fournies doivent être exprimées dans le même repère que les
 * positions des capteurs. Les capteurs déjà déclenchés sont ignorés.
 */
function detectSensorCrossings(
  sensors,
  previousPosition,
  currentPosition,
  triggeredIds = [],
) {
  if (!Array.isArray(sensors)) {
    throw new TypeError("sensors doit être un tableau.");
  }
  assertFinitePosition("previousPosition", previousPosition);
  assertFinitePosition("currentPosition", currentPosition);

  if (currentPosition + SENSOR_EPSILON < previousPosition) {
    return Object.freeze([]);
  }

  const triggered = normalizeTriggeredIds(triggeredIds);
  const crossings = sensors
    .filter((sensor) => {
      if (!sensor || !Number.isInteger(sensor.id) || !Number.isFinite(sensor.position)) {
        throw new TypeError("Chaque capteur doit posséder un identifiant entier et une position finie.");
      }
      return !triggered.has(sensor.id)
        && sensor.position > previousPosition + SENSOR_EPSILON
        && sensor.position <= currentPosition + SENSOR_EPSILON;
    })
    .sort((left, right) => left.position - right.position)
    .map((sensor) => Object.freeze({ id: sensor.id, position: sensor.position }));

  return Object.freeze(crossings);
}

function requireSensorElement(svg, sensorId) {
  const element = svg.querySelector(`#sensor-${sensorId}`);
  if (!element) {
    throw new Error(`Élément SVG du capteur ${sensorId} introuvable.`);
  }
  return element;
}

function setSensorVisualState(element, sensor, state) {
  element.setAttribute("data-sensor-state", state);
  const suffix = state === "idle"
    ? "non déclenché"
    : state === "active"
      ? "vient d’être déclenché"
      : "déjà déclenché";
  element.setAttribute(
    "aria-label",
    `Capteur ${sensor.id}, position ${sensor.position.toFixed(3)} mètre, ${suffix}`,
  );
}

/**
 * Retourne la position SVG du bord gauche de S1 pour une position physique du
 * moteur. Le calcul est identique à celui utilisé par l'animation du mobile.
 */
function mobileLeftEdgeX(layout, simulationPosition) {
  const normalizedPosition = clamp(
    simulationPosition,
    0,
    layout.parameters.trackLength,
  );
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  return layout.mobile.x + normalizedPosition * pixelsPerMeter;
}

/** Retourne la position du moteur lorsque le bord gauche atteint une abscisse SVG. */
function simulationPositionForLeftEdgeX(layout, leftEdgeX) {
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    throw new RangeError("L’échelle graphique du mobile doit être strictement positive.");
  }
  return clamp(
    (leftEdgeX - layout.mobile.x) / pixelsPerMeter,
    0,
    layout.parameters.trackLength,
  );
}

/** Calcule la position effectivement affichée pendant l'interpolation visuelle. */
function displayedSimulationPosition(currentState, previousState, meta) {
  const terminal = ["blocked", "finished"].includes(currentState.status);
  const snapToCurrent = terminal || Boolean(meta?.reason) || meta?.running === false;
  const alpha = snapToCurrent ? 1 : clamp(meta?.interpolationAlpha ?? 1, 0, 1);
  return interpolate(previousState.position, currentState.position, alpha);
}

/**
 * Relie les capteurs SVG au déplacement de S1. Le déclenchement se produit au
 * moment où le bord gauche visible du mobile traverse le faisceau du capteur.
 * Un capteur devient brièvement actif, puis reste marqué comme déclenché
 * jusqu'à la réinitialisation de l'expérience.
 */
function createSensorController(svg, layout, options = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (!layout || !Array.isArray(layout.sensors)) {
    throw new TypeError("Un layout contenant les capteurs est requis.");
  }
  if (options === null || typeof options !== "object") {
    throw new TypeError("Les options des capteurs doivent être un objet.");
  }

  const onCrossings = options.onCrossings ?? (() => {});
  if (typeof onCrossings !== "function") {
    throw new TypeError("onCrossings doit être une fonction.");
  }

  const elements = new Map(
    layout.sensors.map((sensor) => [sensor.id, requireSensorElement(svg, sensor.id)]),
  );
  const sensorsInSvgCoordinates = layout.sensors.map((sensor) => Object.freeze({
    id: sensor.id,
    position: sensor.x,
  }));
  const sensorsById = new Map(layout.sensors.map((sensor) => [sensor.id, sensor]));
  const triggeredIds = new Set();
  let activeIds = new Set();
  let lastPosition = null;
  let lastLeftEdgeX = null;
  let destroyed = false;

  function assertUsable() {
    if (destroyed) throw new Error("Ce contrôleur de capteurs a été détruit.");
  }

  function applyIdleState() {
    for (const sensor of layout.sensors) {
      setSensorVisualState(elements.get(sensor.id), sensor, "idle");
    }
  }

  function reset(position = 0) {
    assertUsable();
    assertFinitePosition("position", position);
    triggeredIds.clear();
    activeIds = new Set();
    lastPosition = position;
    lastLeftEdgeX = mobileLeftEdgeX(layout, position);
    applyIdleState();
    return getSnapshot();
  }

  function getSnapshot(crossings = []) {
    return Object.freeze({
      crossings: Object.freeze([...crossings]),
      triggeredIds: Object.freeze([...triggeredIds].sort((a, b) => a - b)),
      activeIds: Object.freeze([...activeIds].sort((a, b) => a - b)),
      triggeredCount: triggeredIds.size,
      totalCount: layout.sensors.length,
      lastPosition,
      lastLeftEdgeX,
    });
  }

  function render(currentState, previousState = currentState, meta = {}) {
    assertUsable();
    if (!currentState || !Number.isFinite(currentState.position)) {
      throw new TypeError("currentState.position doit être un nombre fini.");
    }
    if (!previousState || !Number.isFinite(previousState.position)) {
      throw new TypeError("previousState.position doit être un nombre fini.");
    }

    const displayedPosition = displayedSimulationPosition(
      currentState,
      previousState,
      meta,
    );
    const currentLeftEdgeX = mobileLeftEdgeX(layout, displayedPosition);
    const reason = meta?.reason;
    const resetRequested = ["initialization", "reset", "replace-state"].includes(reason)
      || lastLeftEdgeX === null
      || currentLeftEdgeX + SENSOR_EPSILON < lastLeftEdgeX;

    if (resetRequested) {
      return reset(displayedPosition);
    }

    for (const sensorId of activeIds) {
      const sensor = sensorsById.get(sensorId);
      setSensorVisualState(elements.get(sensorId), sensor, "triggered");
    }
    activeIds = new Set();

    const svgCrossings = detectSensorCrossings(
      sensorsInSvgCoordinates,
      lastLeftEdgeX,
      currentLeftEdgeX,
      triggeredIds,
    );
    const crossings = svgCrossings.map((crossing) => {
      const sensor = sensorsById.get(crossing.id);
      return Object.freeze({
        id: sensor.id,
        position: sensor.position,
        beamX: sensor.x,
        triggerPosition: simulationPositionForLeftEdgeX(layout, sensor.x),
      });
    });

    for (const crossing of crossings) {
      triggeredIds.add(crossing.id);
      activeIds.add(crossing.id);
      const sensor = sensorsById.get(crossing.id);
      // Le capteur passe directement à l’état vert déclenché, sans état
      // visuel orange intermédiaire.
      setSensorVisualState(elements.get(crossing.id), sensor, "triggered");
    }

    lastPosition = displayedPosition;
    lastLeftEdgeX = currentLeftEdgeX;

    if (crossings.length > 0) {
      onCrossings(Object.freeze(crossings), currentState, previousState, meta);
    }

    return getSnapshot(crossings);
  }

  applyIdleState();

  return Object.freeze({
    render,
    reset,
    getSnapshot: () => getSnapshot(),
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      triggeredIds.clear();
      activeIds.clear();
      return true;
    },
  });
}

return Object.freeze({ detectSensorCrossings, createSensorController });
})();

modules.measurementRecorder = (() => {
const { computePhase1Acceleration, computePhase2Acceleration, validateParameters } = modules.physics;
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
function computeSensorTriggerPosition(layout, sensor) {
  assertLayout(layout);
  assertSensor(sensor);

  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    throw new RangeError("L’échelle graphique du mobile doit être strictement positive.");
  }

  return clamp(
    (sensor.x - layout.mobile.x) / pixelsPerMeter,
    0,
    layout.parameters.trackLength,
  );
}

/**
 * Calcule l'état cinématique exact au déplacement demandé à partir des lois à
 * accélération constante utilisées par le moteur. Retourne null si la position
 * n'est pas atteignable (système bloqué ou arrêt antérieur par frottement).
 */
function computeKinematicStateAtPosition(parameters, targetPosition) {
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
 * `position` et `mobilePosition` utilisent le même repère physique : elles
 * correspondent au déplacement de S1 lorsque son bord gauche franchit le
 * faisceau. Cette convention garantit la cohérence entre x, t et v.
 */
function createMeasurement(layout, crossing, parameters = layout?.parameters) {
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
    position: kinematics.position,
    mobilePosition: kinematics.position,
    time: kinematics.time,
    velocity: kinematics.velocity,
    acceleration: kinematics.acceleration,
    phase: kinematics.phase,
  });
}

/**
 * Enregistre chaque capteur au plus une fois au cours d'une expérience.
 */
function createMeasurementRecorder(layout, parameters = layout?.parameters) {
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

return Object.freeze({ computeSensorTriggerPosition, computeKinematicStateAtPosition, createMeasurement, createMeasurementRecorder });
})();

modules.measurementExport = (() => {

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
function buildMeasurementsCsv(measurements) {
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
function downloadMeasurementsCsv(measurements, options = {}) {
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
function bindMeasurementExport(root, appState, options = {}) {
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

return Object.freeze({ buildMeasurementsCsv, downloadMeasurementsCsv, bindMeasurementExport });
})();

modules.app = (() => {
const { computeApparatusLayout } = modules.geometry;
const { createApparatusAnimator } = modules.animation;
const { mountStaticApparatus } = modules.view;
const { createAppState } = modules.appState;
const { bindParameterControls } = modules.parameterControls;
const { bindSimulationControls } = modules.simulationControls;
const { createSensorController } = modules.sensorController;
const { createMeasurementRecorder } = modules.measurementRecorder;
const { bindMeasurementExport } = modules.measurementExport;
const { createTimeLoop } = modules.timeLoop;
const TIME_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const VELOCITY_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément d'interface introuvable : ${selector}`);
  }
  return element;
}


/**
 * Monte l'application animée et relie tous les paramètres à un état central
 * unique. Toute modification physique reconstruit et réinitialise le montage.
 */
function createAnimatedApp(root = document, options = {}) {
  const host = getRequiredElement(root, "#apparatus-host");
  const timeValue = getRequiredElement(root, "#time-value");
  const s2StopTimeItem = getRequiredElement(root, "#s2-stop-time-item");
  const s2StopTimeValue = getRequiredElement(root, "#s2-stop-time-value");
  const s2ContactVelocityItem = getRequiredElement(root, "#s2-contact-velocity-item");
  const s2ContactVelocityValue = getRequiredElement(root, "#s2-contact-velocity-value");

  const appState = options.appState ?? createAppState({
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let simulationControls = null;
  let phaseChangeEvent = null;
  let destroyed = false;

  function updateReadout(state) {
    timeValue.textContent = `${TIME_FORMAT.format(state.time)} s`;

    const phaseTwoStarted = Boolean(phaseChangeEvent);
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", !phaseTwoStarted);
      item.setAttribute("aria-disabled", String(!phaseTwoStarted));
    }

    if (!phaseTwoStarted) {
      s2StopTimeValue.textContent = "";
      s2ContactVelocityValue.textContent = "";
      return;
    }

    s2StopTimeValue.textContent = `${TIME_FORMAT.format(phaseChangeEvent.time)} s`;
    s2ContactVelocityValue.textContent = `${VELOCITY_FORMAT.format(phaseChangeEvent.velocity)} m/s`;
  }

  function destroyRuntime() {
    if (runtime) {
      runtime.sensorController?.destroy();
      runtime.measurementRecorder?.destroy();
      runtime.loop.destroy();
      runtime = null;
    }
  }

  function mountRuntime(snapshot) {
    destroyRuntime();
    phaseChangeEvent = null;
    const sensorCount = snapshot.experimental.sensorCount;
    const layout = computeApparatusLayout({
      ...snapshot.parameters,
      sensorCount,
    });
    const svg = mountStaticApparatus(host, {
      ...snapshot.parameters,
      sensorCount,
    });
    const animator = createApparatusAnimator(svg, layout);
    const measurementRecorder = createMeasurementRecorder(layout, snapshot.parameters);
    const sensorController = createSensorController(svg, layout, {
      onCrossings(crossings) {
        const measurements = measurementRecorder.recordCrossings(crossings);
        if (measurements.length > 0) {
          appState.addMeasurements(measurements);
        }
      },
    });
    host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
    const loop = createTimeLoop({
      parameters: snapshot.parameters,
      physicsStep: options.physicsStep ?? 0.002,
      playbackSpeed: snapshot.playbackSpeed,
      requestFrame: options.requestFrame,
      cancelFrame: options.cancelFrame,
      onEvents(events) {
        const transition = events.find((event) => event.type === "phase-change");
        if (transition) phaseChangeEvent = transition;
      },
      onRender(state, previousState, meta) {
        animator.render(state, previousState, meta);
        sensorController.render(state, previousState, meta);
        appState.setSimulationState(state);
        updateReadout(state, meta);
        simulationControls?.update(state, meta);
      },
    });

    runtime = Object.freeze({
      loop,
      layout,
      svg,
      animator,
      sensorController,
      measurementRecorder,
    });
    return runtime;
  }

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (destroyed) return;

    if (["parameters-change", "experimental-change"].includes(meta.reason)) {
      mountRuntime(snapshot);
    } else if (meta.reason === "playback-speed-change" && runtime) {
      runtime.loop.setPlaybackSpeed(snapshot.playbackSpeed);
    } else if (meta.reason === "measurements-recorded") {
      host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
    } else if (meta.reason === "experiment-reset" && runtime) {
      host.setAttribute("data-measurement-count", "0");
      runtime.measurementRecorder.reset();
      runtime.loop.reset(snapshot.parameters);
    }
  });

  const measurementExport = bindMeasurementExport(root, appState, options.exportOptions);

  simulationControls = bindSimulationControls(root, {
    appState,
    getLoop: () => runtime?.loop,
    manualStepDuration: options.manualStepDuration,
    keyboardTarget: options.keyboardTarget,
  });
  mountRuntime(appState.getSnapshot());
  const parameterControls = bindParameterControls(root, appState);

  return Object.freeze({
    appState,
    getRuntime: () => runtime,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      simulationControls?.destroy();
      measurementExport.destroy();
      parameterControls.destroy();
      unsubscribe();
      destroyRuntime();
      if (!options.appState) appState.destroy();
      return true;
    },
  });
}

return Object.freeze({ createAnimatedApp });
})();
modules.app.createAnimatedApp(document);
})();