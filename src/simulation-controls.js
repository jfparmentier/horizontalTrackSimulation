export const DEFAULT_MANUAL_STEP_DURATION = 0.05;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de commande introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state.status);
}

function isInitialState(state) {
  return state.time === 0 && state.position === 0 && state.velocity === 0;
}

function shouldIgnoreKeyboardShortcut(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  const target = event.target;
  const tagName = String(target?.tagName ?? "").toLowerCase();
  return target?.isContentEditable
    || ["input", "textarea", "select", "button"].includes(tagName);
}

/**
 * Relie les quatre commandes principales à la boucle temporelle courante.
 * La boucle est obtenue à la demande afin que la liaison reste valide après
 * toute reconstruction du montage provoquée par un changement de paramètre.
 */
export function bindSimulationControls(root, configuration = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!configuration.appState || typeof configuration.appState.resetExperiment !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }
  if (typeof configuration.getLoop !== "function") {
    throw new TypeError("getLoop doit être une fonction.");
  }

  const manualStepDuration = Number(
    configuration.manualStepDuration ?? DEFAULT_MANUAL_STEP_DURATION,
  );
  if (!Number.isFinite(manualStepDuration) || manualStepDuration <= 0) {
    throw new RangeError("La durée du pas manuel doit être strictement positive.");
  }

  const startButton = getRequiredElement(root, "#start-button");
  const pauseButton = getRequiredElement(root, "#pause-button");
  const stepButton = getRequiredElement(root, "#step-button");
  const resetButton = getRequiredElement(root, "#reset-button");
  const keyboardTarget = configuration.keyboardTarget
    ?? (typeof root.addEventListener === "function" ? root : null);
  const listeners = [];
  let destroyed = false;

  startButton.setAttribute("aria-keyshortcuts", "Space");
  pauseButton.setAttribute("aria-keyshortcuts", "Space");
  stepButton.setAttribute("aria-keyshortcuts", "ArrowRight");
  resetButton.setAttribute("aria-keyshortcuts", "Home");
  stepButton.setAttribute(
    "aria-label",
    `Avancer la simulation de ${manualStepDuration.toFixed(2)} seconde`,
  );

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function getLoop() {
    if (destroyed) return null;
    return configuration.getLoop() ?? null;
  }

  function resolveRunning(meta = {}) {
    if (typeof meta.running === "boolean") return meta.running;
    return Boolean(getLoop()?.getDiagnostics?.().running);
  }

  function update(state = configuration.appState.getSnapshot().simulation, meta = {}) {
    const running = resolveRunning(meta);
    const terminal = isTerminalState(state);
    const initial = isInitialState(state);

    startButton.disabled = running || terminal;
    pauseButton.disabled = !running;
    stepButton.disabled = running || terminal;
    resetButton.disabled = initial && !running;

    startButton.textContent = initial ? "Démarrer" : "Reprendre";
    startButton.setAttribute("aria-pressed", String(running));
    pauseButton.setAttribute("aria-pressed", String(!running && !initial && !terminal));
    return Object.freeze({ running, terminal, initial });
  }

  function start() {
    const loop = getLoop();
    const changed = Boolean(loop?.start());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function pause() {
    const loop = getLoop();
    const changed = Boolean(loop?.pause());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function step() {
    const loop = getLoop();
    if (!loop) return null;
    const result = loop.step(manualStepDuration);
    update(loop.getState(), loop.getDiagnostics());
    return result;
  }

  function reset() {
    const loop = getLoop();
    loop?.pause();
    configuration.appState.resetExperiment();
    const currentLoop = getLoop();
    if (currentLoop) update(currentLoop.getState(), currentLoop.getDiagnostics());
    return true;
  }

  function onKeyDown(event) {
    if (shouldIgnoreKeyboardShortcut(event)) return;

    if (event.code === "Space" || event.key === " ") {
      event.preventDefault?.();
      if (resolveRunning()) pause();
      else start();
      return;
    }

    if (event.code === "ArrowRight" || event.key === "ArrowRight") {
      event.preventDefault?.();
      step();
      return;
    }

    if (event.code === "Home" || event.key === "Home") {
      event.preventDefault?.();
      reset();
    }
  }

  listen(startButton, "click", start);
  listen(pauseButton, "click", pause);
  listen(stepButton, "click", step);
  listen(resetButton, "click", reset);
  if (keyboardTarget && typeof keyboardTarget.addEventListener === "function") {
    listen(keyboardTarget, "keydown", onKeyDown);
  }

  update();

  return Object.freeze({
    start,
    pause,
    step,
    reset,
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      return true;
    },
  });
}
