function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de sélection du mode introuvable : ${selector}`);
  }
  return element;
}

function setInert(element, inert) {
  if (!element) return;
  element.inert = Boolean(inert);
  if (inert) element.setAttribute?.("inert", "");
  else element.removeAttribute?.("inert");
}

/**
 * Relie l'écran d'accueil à l'état central et permet de revenir au choix du
 * mode depuis la simulation. Le focus suit le changement d'écran afin qu'une
 * navigation au clavier ou avec un lecteur d'écran conserve un point d'ancrage
 * explicite après chaque transition.
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
  const startButton = root.querySelector("#start-button");
  const listeners = [];
  let returnFocusTarget = idealButton;

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
    setInert(selectionScreen, hasMode);
    setInert(simulationScreen, !hasMode);
  }

  function scrollViewportToTop() {
    const view = root.defaultView ?? root.ownerDocument?.defaultView;
    if (typeof view?.scrollTo === "function") {
      view.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  function enterMode(mode, sourceButton) {
    returnFocusTarget = sourceButton;
    appState.selectMode(mode);
    scrollViewportToTop();
    startButton?.focus?.({ preventScroll: true });
  }

  listen(idealButton, "click", () => enterMode("ideal", idealButton));
  listen(frictionButton, "click", () => enterMode("friction", frictionButton));
  listen(homeButton, "click", () => {
    const currentMode = appState.getSnapshot().mode;
    if (currentMode === "friction") returnFocusTarget = frictionButton;
    else if (currentMode === "ideal") returnFocusTarget = idealButton;
    appState.clearMode();
    scrollViewportToTop();
    returnFocusTarget?.focus?.({ preventScroll: true });
  });

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
