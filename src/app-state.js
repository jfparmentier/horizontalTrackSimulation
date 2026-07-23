import {
  DEFAULT_PARAMETERS,
  FIXED_DROP_HEIGHT,
  FIXED_M1,
  FIXED_SENSOR_COUNT,
  FIXED_TRACK_LENGTH,
  SIMULATION_MODES,
} from "./constants.js";
import { SENSOR_COUNT_LIMITS } from "./apparatus-geometry.js";
import { PLAYBACK_SPEED_LIMITS } from "./time-loop.js";
import {
  PhysicsParameterError,
  createInitialState,
  validateParameters,
  validateSimulationState,
} from "./physics.js";

export const DEFAULT_EXPERIMENTAL_SETTINGS = Object.freeze({
  sensorCount: SENSOR_COUNT_LIMITS.default,
  measurementNoiseStdDev: 0,
  timeMeasurementNoiseStdDev: 0,
});

export const DEFAULT_DISPLAY_SETTINGS = Object.freeze({
  showMeasurements: false,
  showCurves: false,
});

export const DEFAULT_PLAYBACK_SPEED = 1;

function freezeRecordArray(items = []) {
  return Object.freeze(items.map((item) => Object.freeze({ ...item })));
}

function freezeSnapshot(snapshot) {
  return Object.freeze({
    mode: snapshot.mode,
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

function validateModeId(value, { allowNull = true } = {}) {
  if (value === null && allowNull) return null;
  if (typeof value !== "string" || !Object.hasOwn(SIMULATION_MODES, value)) {
    throw new PhysicsParameterError(`Mode de simulation inconnu : ${String(value)}.`);
  }
  return value;
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

function createExperimentalSettings(modeId) {
  const mode = modeId ? SIMULATION_MODES[modeId] : null;
  return Object.freeze({
    sensorCount: FIXED_SENSOR_COUNT,
    measurementNoiseStdDev: mode?.measurementNoiseStdDev ?? 0,
    timeMeasurementNoiseStdDev: mode?.timeMeasurementNoiseStdDev ?? 0,
  });
}

/**
 * État central de l'application. Il constitue la source unique de vérité pour
 * le mode, les paramètres, l'état physique et les mesures de l'expérience.
 */
export function createAppState(initial = {}) {
  if (initial === null || typeof initial !== "object") {
    throw new TypeError("La configuration initiale doit être un objet.");
  }

  const mode = validateModeId(initial.mode ?? null);
  const modeDefinition = mode ? SIMULATION_MODES[mode] : null;
  const parameters = validateParameters({
    ...DEFAULT_PARAMETERS,
    ...(initial.parameters ?? {}),
    m1: FIXED_M1,
    dropHeight: FIXED_DROP_HEIGHT,
    trackLength: FIXED_TRACK_LENGTH,
    friction: modeDefinition?.friction
      ?? initial.parameters?.friction
      ?? DEFAULT_PARAMETERS.friction,
  });
  const playbackSpeed = validatePlaybackSpeed(
    initial.playbackSpeed ?? DEFAULT_PLAYBACK_SPEED,
  );
  const simulation = initial.simulation
    ? validateSimulationState(initial.simulation, parameters)
    : createInitialState(parameters);

  let snapshot = freezeSnapshot({
    mode,
    parameters,
    experimental: createExperimentalSettings(mode),
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

  function selectMode(modeId) {
    assertUsable();
    const normalizedMode = validateModeId(modeId, { allowNull: false });
    const definition = SIMULATION_MODES[normalizedMode];
    const nextParameters = validateParameters({
      ...snapshot.parameters,
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
      friction: definition.friction,
    });

    return replace({
      ...snapshot,
      mode: normalizedMode,
      parameters: nextParameters,
      experimental: createExperimentalSettings(normalizedMode),
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "mode-change", {
      previousMode: snapshot.mode,
      mode: normalizedMode,
    });
  }

  function clearMode() {
    assertUsable();
    if (snapshot.mode === null) return snapshot;
    const nextParameters = validateParameters({
      ...snapshot.parameters,
      friction: DEFAULT_PARAMETERS.friction,
    });

    return replace({
      ...snapshot,
      mode: null,
      parameters: nextParameters,
      experimental: createExperimentalSettings(null),
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "mode-cleared", { previousMode: snapshot.mode });
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

    if (
      snapshot.mode
      && Object.hasOwn(partial, "friction")
      && Number(partial.friction) !== SIMULATION_MODES[snapshot.mode].friction
    ) {
      throw new PhysicsParameterError(
        "Le coefficient de frottement est imposé par le mode de simulation.",
      );
    }

    const nextParameters = validateParameters({
      ...snapshot.parameters,
      ...partial,
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
      friction: snapshot.mode
        ? SIMULATION_MODES[snapshot.mode].friction
        : Number(partial.friction ?? snapshot.parameters.friction),
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
    if (
      Object.hasOwn(partial, "measurementNoiseStdDev")
      || Object.hasOwn(partial, "timeMeasurementNoiseStdDev")
    ) {
      throw new PhysicsParameterError(
        "Le bruit des mesures est imposé par le mode de simulation.",
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
    selectMode,
    clearMode,
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
