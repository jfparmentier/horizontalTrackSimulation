import { SIMULATION_MODES } from "./constants.js";

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de sélection du mode introuvable : ${selector}`);
  }
  return element;
}

/**
 * Relie l'écran d'accueil à l'état central et permet de revenir au choix du
 * mode depuis la simulation.
 */
export function bindModeSelector(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (
    !appState
    || typeof appState.selectMode !== "function"
    || typeof appState.clearMode !== "function"
  ) {
    throw new TypeError("Un état central prenant en charge les modes est requis.");
  }

  const selectionScreen = getRequiredElement(root, "#mode-selection");
  const simulationScreen = getRequiredElement(root, "#simulation-screen");
  const idealButton = getRequiredElement(root, "#mode-ideal-button");
  const frictionButton = getRequiredElement(root, "#mode-friction-button");
  const homeButton = getRequiredElement(root, "#mode-home-button");
  const activeModeLabel = getRequiredElement(root, "#active-mode-label");
  const activeModeDetail = getRequiredElement(root, "#active-mode-detail");
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function sync(snapshot = appState.getSnapshot()) {
    const hasMode = Boolean(snapshot.mode);
    selectionScreen.hidden = hasMode;
    simulationScreen.hidden = !hasMode;
    selectionScreen.setAttribute("aria-hidden", String(hasMode));
    simulationScreen.setAttribute("aria-hidden", String(!hasMode));

    if (!hasMode) {
      activeModeLabel.textContent = "";
      activeModeDetail.textContent = "";
      return;
    }

    const definition = SIMULATION_MODES[snapshot.mode];
    activeModeLabel.textContent = definition.label;
    activeModeDetail.textContent = definition.measurementsAreNoisy
      ? "Frottement inconnu · mesures bruitées"
      : "Sans frottement · mesures parfaites";
  }

  listen(idealButton, "click", () => appState.selectMode("ideal"));
  listen(frictionButton, "click", () => appState.selectMode("friction"));
  listen(homeButton, "click", () => appState.clearMode());

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (["mode-change", "mode-cleared", "subscription"].includes(meta.reason)) {
      sync(snapshot);
    }
  }, { emitCurrent: true });

  return Object.freeze({
    sync,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}
