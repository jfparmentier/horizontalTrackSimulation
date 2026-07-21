import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { mountStaticApparatus } from "./apparatus-view.js";
import { createAppState } from "./app-state.js";
import { bindParameterControls } from "./parameter-controls.js";
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
  const startButton = getRequiredElement(root, "#start-button");
  const pauseButton = getRequiredElement(root, "#pause-button");
  const stepButton = getRequiredElement(root, "#step-button");
  const resetButton = getRequiredElement(root, "#reset-button");
  const timeValue = getRequiredElement(root, "#time-value");
  const positionValue = getRequiredElement(root, "#position-value");
  const velocityValue = getRequiredElement(root, "#velocity-value");
  const phaseValue = getRequiredElement(root, "#phase-value");

  const appState = options.appState ?? createAppState({
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let destroyed = false;

  function updateReadout(state, meta) {
    timeValue.textContent = `${READOUT_FORMAT.format(state.time)} s`;
    positionValue.textContent = `${READOUT_FORMAT.format(state.position)} m`;
    velocityValue.textContent = `${READOUT_FORMAT.format(state.velocity)} m·s⁻¹`;
    phaseValue.textContent = phaseLabel(state);

    const terminal = ["blocked", "finished"].includes(state.status);
    startButton.disabled = meta.running || terminal;
    pauseButton.disabled = !meta.running;
    stepButton.disabled = meta.running || terminal;
  }

  function destroyRuntime() {
    if (runtime) {
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
    const loop = createTimeLoop({
      parameters: snapshot.parameters,
      physicsStep: options.physicsStep ?? 0.002,
      playbackSpeed: snapshot.playbackSpeed,
      requestFrame: options.requestFrame,
      cancelFrame: options.cancelFrame,
      onRender(state, previousState, meta) {
        animator.render(state, previousState, meta);
        appState.setSimulationState(state);
        updateReadout(state, meta);
      },
    });

    runtime = Object.freeze({ loop, layout, svg, animator });
    return runtime;
  }

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (destroyed) return;

    if (["parameters-change", "experimental-change"].includes(meta.reason)) {
      mountRuntime(snapshot);
    } else if (meta.reason === "playback-speed-change" && runtime) {
      runtime.loop.setPlaybackSpeed(snapshot.playbackSpeed);
    } else if (meta.reason === "experiment-reset" && runtime) {
      runtime.loop.reset(snapshot.parameters);
    }
  });

  mountRuntime(appState.getSnapshot());
  const parameterControls = bindParameterControls(root, appState);

  const onStart = () => runtime?.loop.start();
  const onPause = () => runtime?.loop.pause();
  const onStep = () => runtime?.loop.step();
  const onReset = () => appState.resetExperiment();

  startButton.addEventListener("click", onStart);
  pauseButton.addEventListener("click", onPause);
  stepButton.addEventListener("click", onStep);
  resetButton.addEventListener("click", onReset);

  return Object.freeze({
    appState,
    getRuntime: () => runtime,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      startButton.removeEventListener?.("click", onStart);
      pauseButton.removeEventListener?.("click", onPause);
      stepButton.removeEventListener?.("click", onStep);
      resetButton.removeEventListener?.("click", onReset);
      parameterControls.destroy();
      unsubscribe();
      destroyRuntime();
      if (!options.appState) appState.destroy();
      return true;
    },
  });
}
