import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { mountStaticApparatus } from "./apparatus-view.js";
import { createAppState } from "./app-state.js";
import { bindParameterControls } from "./parameter-controls.js";
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
 * Monte l'application animée et relie tous les paramètres à un état central
 * unique. Toute modification physique reconstruit et réinitialise le montage.
 */
export function createAnimatedApp(root = document, options = {}) {
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
