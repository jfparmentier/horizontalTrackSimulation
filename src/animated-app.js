import { DEFAULT_PARAMETERS } from "./constants.js";
import { computeApparatusLayout } from "./apparatus-geometry.js";
import { createApparatusAnimator } from "./apparatus-animation.js";
import { mountStaticApparatus } from "./apparatus-view.js";
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
 * Monte la démonstration animée de l'étape 5. Les commandes sont volontairement
 * minimales et servent à vérifier visuellement le rendu du moteur existant.
 */
export function createAnimatedApp(root = document, options = {}) {
  const parameters = Object.freeze({
    ...DEFAULT_PARAMETERS,
    ...(options.parameters ?? {}),
  });
  const sensorCount = options.sensorCount ?? 8;
  const host = getRequiredElement(root, "#apparatus-host");
  const startButton = getRequiredElement(root, "#start-button");
  const pauseButton = getRequiredElement(root, "#pause-button");
  const stepButton = getRequiredElement(root, "#step-button");
  const resetButton = getRequiredElement(root, "#reset-button");
  const timeValue = getRequiredElement(root, "#time-value");
  const positionValue = getRequiredElement(root, "#position-value");
  const velocityValue = getRequiredElement(root, "#velocity-value");
  const phaseValue = getRequiredElement(root, "#phase-value");

  const layout = computeApparatusLayout({ ...parameters, sensorCount });
  const svg = mountStaticApparatus(host, { ...parameters, sensorCount });
  const animator = createApparatusAnimator(svg, layout);

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

  const loop = createTimeLoop({
    parameters,
    physicsStep: options.physicsStep ?? 0.002,
    playbackSpeed: options.playbackSpeed ?? 1,
    onRender(state, previousState, meta) {
      animator.render(state, previousState, meta);
      updateReadout(state, meta);
    },
  });

  startButton.addEventListener("click", () => loop.start());
  pauseButton.addEventListener("click", () => loop.pause());
  stepButton.addEventListener("click", () => loop.step());
  resetButton.addEventListener("click", () => loop.reset(parameters));

  return Object.freeze({ loop, layout, svg, animator });
}
