import { NUMERICAL_EPSILON } from "./constants.js";
import {
  PhysicsParameterError,
  computePhase1Acceleration,
  computePhase2Acceleration,
  integrateConstantAcceleration,
  timeToReachPosition,
  timeToStop,
  validateParameters,
  validateSimulationState,
} from "./physics.js";

/** Types d'événements physiques produits par le moteur. */
export const PHYSICAL_EVENT = Object.freeze({
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
export function getNextPhysicalEvent(state, parameters) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (["blocked", "finished"].includes(current.status)) {
    return null;
  }

  if (current.position >= p.trackLength - NUMERICAL_EPSILON) {
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
      targetPosition: p.trackLength,
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
    targetPosition: p.trackLength,
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
export function advanceWithinCurrentPhase(state, parameters, duration) {
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
export function advanceToPhysicalEvent(state, parameters, event) {
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
        position: p.trackLength,
        hangingDisplacement:
          fromPhase === 1 ? Math.min(p.dropHeight, p.trackLength) : p.dropHeight,
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
export function advanceSimulationWithEvents(state, parameters, dt) {
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
export function advanceSimulation(state, parameters, dt) {
  return advanceSimulationWithEvents(state, parameters, dt).state;
}
