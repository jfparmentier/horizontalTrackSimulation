import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { mountStaticApparatus } from "./apparatus-view.js";
import { createAppState } from "./app-state.js";
import { bindModeSelector } from "./mode-selector.js";
import { bindParameterControls } from "./parameter-controls.js";
import { createMassSelector } from "./mass-selector.js";
import { bindSimulationControls } from "./simulation-controls.js";
import { createSensorController } from "./sensor-controller.js";
import { createMeasurementRecorder } from "./measurement-recorder.js";
import { bindMeasurementExport } from "./measurement-export.js";
import { createTimeLoop } from "./time-loop.js";

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

  const appState = options.appState ?? createAppState({
    mode: options.mode ?? null,
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let simulationControls = null;
  let phaseChangeEvent = null;
  let destroyed = false;

  function clearReadout() {
    timeValue.textContent = "0.00 s";
    phaseChangeEvent = null;
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", true);
      item.setAttribute("aria-disabled", "true");
    }
    s2StopTimeValue.textContent = "";
    s2ContactVelocityValue.textContent = "";
  }

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

  function destroyRuntime({ clearHost = false } = {}) {
    if (runtime) {
      runtime.massSelector?.destroy();
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
    });
    const animator = createApparatusAnimator(svg, layout);
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
        updateReadout(state);
        simulationControls?.update(state, meta);
      },
    });

    runtime = Object.freeze({
      loop,
      layout,
      svg,
      animator,
      massSelector,
      sensorController,
      measurementRecorder,
    });
    simulationControls?.update(loop.getState(), loop.getDiagnostics());
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
    } else if (meta.reason === "experiment-reset" && runtime) {
      host.setAttribute("data-measurement-count", "0");
      runtime.measurementRecorder.reset();
      runtime.loop.reset(snapshot.parameters);
      clearReadout();
    }
  });

  const modeSelector = bindModeSelector(root, appState);
  const measurementExport = bindMeasurementExport(root, appState, options.exportOptions);
  simulationControls = bindSimulationControls(root, {
    appState,
    getLoop: () => runtime?.loop,
    manualStepDuration: options.manualStepDuration,
    keyboardTarget: options.keyboardTarget,
  });
  const parameterControls = bindParameterControls(root, appState);

  const initialSnapshot = appState.getSnapshot();
  clearReadout();
  if (initialSnapshot.mode) mountRuntime(initialSnapshot);

  return Object.freeze({
    appState,
    getRuntime: () => runtime,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      simulationControls?.destroy();
      measurementExport.destroy();
      parameterControls.destroy();
      modeSelector.destroy();
      unsubscribe();
      destroyRuntime({ clearHost: true });
      if (!options.appState) appState.destroy();
      return true;
    },
  });
}
