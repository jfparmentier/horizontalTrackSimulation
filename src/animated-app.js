import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { localizeStaticApparatus, mountStaticApparatus } from "./apparatus-view.js";
import { createAppState } from "./app-state.js";
import { createI18n, formatNumber } from "./i18n.js";
import { bindLanguageSelector } from "./language-selector.js";
import { bindModeSelector } from "./mode-selector.js";
import { bindParameterControls } from "./parameter-controls.js";
import { createPersonController } from "./person-controller.js";
import { createMassSelector } from "./mass-selector.js";
import { bindMobileMassSelector } from "./mobile-mass-selector.js";
import { createResponsiveApparatusViewport } from "./responsive-apparatus.js";
import { bindSimulationControls } from "./simulation-controls.js";
import { createSensorController } from "./sensor-controller.js";
import { createMeasurementRecorder } from "./measurement-recorder.js";
import { bindMeasurementResults } from "./measurement-export.js";
import { createTimeLoop } from "./time-loop.js";

export const IMPACT_SENSOR_ID = 5;

/** Retourne la mesure du capteur placé à la fin de la chute, si elle existe. */
export function getImpactSensorMeasurement(measurements = []) {
  if (!Array.isArray(measurements)) {
    throw new TypeError("measurements doit être un tableau.");
  }
  return measurements.find((measurement) => measurement?.sensorId === IMPACT_SENSOR_ID) ?? null;
}

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément d'interface introuvable : ${selector}`);
  }
  return element;
}

/**
 * Monte l'application animée. Le moteur physique n'est créé qu'après le choix
 * explicite d'un mode sur l'écran d'accueil.
 */
export function createAnimatedApp(root = document, options = {}) {
  const host = getRequiredElement(root, "#apparatus-host");
  const timeValue = getRequiredElement(root, "#time-value");
  const s2StopTimeItem = getRequiredElement(root, "#s2-stop-time-item");
  const s2StopTimeValue = getRequiredElement(root, "#s2-stop-time-value");
  const s2ContactVelocityItem = getRequiredElement(root, "#s2-contact-velocity-item");
  const s2ContactVelocityValue = getRequiredElement(root, "#s2-contact-velocity-value");

  const i18n = options.i18n ?? createI18n(options.locale ?? "fr");
  const ownsI18n = !options.i18n;
  const languageSelector = bindLanguageSelector(root, i18n);

  const appState = options.appState ?? createAppState({
    mode: options.mode ?? null,
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let simulationControls = null;
  let destroyed = false;

  function formatReadoutNumber(value) {
    return formatNumber(i18n.getLocale(), value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function clearReadout() {
    timeValue.textContent = `${formatReadoutNumber(0)} s`;
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", true);
      item.setAttribute("aria-disabled", "true");
    }
    s2StopTimeValue.textContent = "";
    s2ContactVelocityValue.textContent = "";
  }

  function updateReadout(state) {
    timeValue.textContent = `${formatReadoutNumber(state.time)} s`;

    const impactMeasurement = getImpactSensorMeasurement(
      appState.getSnapshot().measurements,
    );
    const measurementAvailable = Boolean(impactMeasurement);
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", !measurementAvailable);
      item.setAttribute("aria-disabled", String(!measurementAvailable));
    }

    if (!measurementAvailable) {
      s2StopTimeValue.textContent = "";
      s2ContactVelocityValue.textContent = "";
      return;
    }

    s2StopTimeValue.textContent = `${formatReadoutNumber(impactMeasurement.time)} s`;
    s2ContactVelocityValue.textContent = `${formatReadoutNumber(impactMeasurement.velocity)} m/s`;
  }

  function destroyRuntime({ clearHost = false } = {}) {
    if (runtime) {
      runtime.personController?.destroy();
      runtime.massSelector?.destroy();
      runtime.responsiveViewport?.destroy();
      runtime.sensorController?.destroy();
      runtime.measurementRecorder?.destroy();
      runtime.loop.destroy();
      runtime = null;
    }
    if (clearHost) host.innerHTML = "";
  }

  function mountRuntime(snapshot) {
    if (!snapshot.mode) return null;
    destroyRuntime();
    clearReadout();
    const sensorCount = snapshot.experimental.sensorCount;
    const layout = computeApparatusLayout({
      ...snapshot.parameters,
      sensorCount,
    });
    const svg = mountStaticApparatus(host, {
      ...snapshot.parameters,
      sensorCount,
      i18n,
    });
    const animator = createApparatusAnimator(svg, layout);
    const responsiveViewport = createResponsiveApparatusViewport(svg, {
      windowRef: options.windowRef ?? root.defaultView ?? globalThis.window,
    });
    const massSelector = createMassSelector(svg, {
      selectedMass: snapshot.parameters.m2,
      onSelect(value) {
        appState.updateParameters({ m2: value });
      },
    });
    const measurementRecorder = createMeasurementRecorder(
      layout,
      snapshot.parameters,
      {
        noiseStdDev: snapshot.experimental.measurementNoiseStdDev,
        timeNoiseStdDev: snapshot.experimental.timeMeasurementNoiseStdDev,
        random: options.random ?? Math.random,
      },
    );
    const sensorController = createSensorController(svg, layout, {
      onCrossings(crossings) {
        const measurements = measurementRecorder.recordCrossings(crossings);
        if (measurements.length > 0) {
          appState.addMeasurements(measurements);
        }
      },
    });
    host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
    host.setAttribute("data-simulation-mode", snapshot.mode);
    let personController = null;
    const loop = createTimeLoop({
      parameters: snapshot.parameters,
      physicsStep: options.physicsStep ?? 0.002,
      playbackSpeed: snapshot.playbackSpeed,
      requestFrame: options.requestFrame,
      cancelFrame: options.cancelFrame,
      onRender(state, previousState, meta) {
        animator.render(state, previousState, meta);
        sensorController.render(state, previousState, meta);
        appState.setSimulationState(state);
        updateReadout(state);
        simulationControls?.update(state, meta);
      },
    });
    personController = createPersonController(svg, {
      i18n,
      initialState: loop.getState(),
      onActivate: () => simulationControls?.start() ?? false,
      onReset: () => simulationControls?.reset() ?? false,
    });

    runtime = Object.freeze({
      loop,
      layout,
      svg,
      animator,
      massSelector,
      responsiveViewport,
      sensorController,
      measurementRecorder,
      personController,
    });
    simulationControls?.update(loop.getState(), loop.getDiagnostics());
    personController.update(loop.getState(), loop.getDiagnostics());
    return runtime;
  }

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (destroyed) return;

    if (meta.reason === "mode-change") {
      mountRuntime(snapshot);
    } else if (meta.reason === "mode-cleared") {
      destroyRuntime({ clearHost: true });
      clearReadout();
    } else if (["parameters-change", "experimental-change"].includes(meta.reason)) {
      if (snapshot.mode) mountRuntime(snapshot);
    } else if (meta.reason === "playback-speed-change" && runtime) {
      runtime.loop.setPlaybackSpeed(snapshot.playbackSpeed);
    } else if (meta.reason === "measurements-recorded") {
      host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
      updateReadout(snapshot.simulation);
    } else if (meta.reason === "experiment-reset" && runtime) {
      host.setAttribute("data-measurement-count", "0");
      runtime.measurementRecorder.reset();
      runtime.loop.reset(snapshot.parameters);
      runtime.personController.update(runtime.loop.getState(), runtime.loop.getDiagnostics());
      clearReadout();
    }
  });

  const modeSelector = bindModeSelector(root, appState);
  const mobileMassSelector = bindMobileMassSelector(root, appState, i18n);
  const measurementResults = bindMeasurementResults(root, appState, {
    ...options.exportOptions,
    i18n,
    keyboardTarget: options.keyboardTarget ?? root,
  });
  simulationControls = bindSimulationControls(root, {
    appState,
    i18n,
    getLoop: () => runtime?.loop,
    manualStepDuration: options.manualStepDuration,
    keyboardTarget: options.keyboardTarget,
    onUpdate(state, meta) {
      runtime?.personController.update(state, meta);
    },
  });
  const parameterControls = bindParameterControls(root, appState);
  const unsubscribeLanguage = i18n.subscribe(() => {
    if (runtime) {
      localizeStaticApparatus(runtime.svg, runtime.layout, i18n);
      updateReadout(runtime.loop.getState());
    } else {
      clearReadout();
    }
  });

  const initialSnapshot = appState.getSnapshot();
  clearReadout();
  if (initialSnapshot.mode) mountRuntime(initialSnapshot);

  return Object.freeze({
    appState,
    i18n,
    getRuntime: () => runtime,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      simulationControls?.destroy();
      measurementResults.destroy();
      parameterControls.destroy();
      modeSelector.destroy();
      mobileMassSelector.destroy();
      languageSelector.destroy();
      unsubscribeLanguage();
      unsubscribe();
      destroyRuntime({ clearHost: true });
      if (!options.appState) appState.destroy();
      if (ownsI18n) i18n.destroy();
      return true;
    },
  });
}
