import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { mountStaticApparatus } from "./apparatus-view.js";
import { createAppState } from "./app-state.js";
import { bindParameterControls } from "./parameter-controls.js";
import { bindSimulationControls } from "./simulation-controls.js";
import { createSensorController } from "./sensor-controller.js";
import { createMeasurementRecorder } from "./measurement-recorder.js";
import { createTimeLoop } from "./time-loop.js";

const READOUT_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément d'interface introuvable : ${selector}`);
  }
  return element;
}

function phaseLabel(state) {
  if (state.status === "blocked") return "Système immobile";
  if (state.endReason === "track-end") return "Fin du banc";
  if (state.endReason === "friction-stop") return "Mobile arrêté";
  return state.phase === 1 ? "Phase 1" : "Phase 2";
}

/**
 * Monte l'application animée et relie tous les paramètres à un état central
 * unique. Toute modification physique reconstruit et réinitialise le montage.
 */
export function createAnimatedApp(root = document, options = {}) {
  const host = getRequiredElement(root, "#apparatus-host");
  const timeValue = getRequiredElement(root, "#time-value");
  const positionValue = getRequiredElement(root, "#position-value");
  const velocityValue = getRequiredElement(root, "#velocity-value");
  const phaseValue = getRequiredElement(root, "#phase-value");
  const sensorValue = getRequiredElement(root, "#sensor-value");

  const appState = options.appState ?? createAppState({
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let simulationControls = null;
  let destroyed = false;

  function updateReadout(state, meta) {
    timeValue.textContent = `${READOUT_FORMAT.format(state.time)} s`;
    positionValue.textContent = `${READOUT_FORMAT.format(state.position)} m`;
    velocityValue.textContent = `${READOUT_FORMAT.format(state.velocity)} m·s⁻¹`;
    phaseValue.textContent = phaseLabel(state);

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
    sensorValue.textContent = `0 / ${layout.sensorCount}`;
    host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
    const loop = createTimeLoop({
      parameters: snapshot.parameters,
      physicsStep: options.physicsStep ?? 0.002,
      playbackSpeed: snapshot.playbackSpeed,
      requestFrame: options.requestFrame,
      cancelFrame: options.cancelFrame,
      onRender(state, previousState, meta) {
        animator.render(state, previousState, meta);
        const sensorSnapshot = sensorController.render(state, previousState, meta);
        sensorValue.textContent = `${sensorSnapshot.triggeredCount} / ${sensorSnapshot.totalCount}`;
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
      parameterControls.destroy();
      unsubscribe();
      destroyRuntime();
      if (!options.appState) appState.destroy();
      return true;
    },
  });
}
