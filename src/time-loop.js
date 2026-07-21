import { NUMERICAL_EPSILON } from "./constants.js";
import { PhysicsParameterError, createInitialState, validateParameters, validateSimulationState } from "./physics.js";
import { advanceSimulationWithEvents } from "./transitions.js";

/**
 * Réglages temporels par défaut.
 * Les durées physiques sont exprimées en secondes ; les horodatages RAF en millisecondes.
 */
export const TIME_LOOP_DEFAULTS = Object.freeze({
  physicsStep: 0.002,
  manualStepDuration: 0.05,
  maxWallDelta: 0.25,
  maxSubStepsPerFrame: 2000,
  playbackSpeed: 1,
});

export const PLAYBACK_SPEED_LIMITS = Object.freeze({
  min: 0.1,
  max: 8,
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
export function createTimeLoop(configuration = {}) {
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
