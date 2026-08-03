function getRequiredElement(svg, selector) {
  const element = svg.querySelector(selector);
  if (!element) {
    throw new Error(`Personnage interactif introuvable : ${selector}`);
  }
  return element;
}

function isInitialState(state) {
  return state.time === 0 && state.position === 0 && state.velocity === 0;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state.status);
}

/**
 * Rend le personnage actionnable à la souris et au clavier. Le contrôleur
 * reste indépendant de la boucle temporelle : l'appelant lui transmet l'état
 * après chaque rendu et lors d'une réinitialisation.
 */
export function createPersonController(svg, configuration = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (typeof configuration.onActivate !== "function") {
    throw new TypeError("onActivate doit être une fonction.");
  }
  if (!configuration.i18n || typeof configuration.i18n.t !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const person = getRequiredElement(svg, "#layer-person");
  const personTitle = getRequiredElement(svg, "#person-title");
  const cueLabel = getRequiredElement(svg, "#person-click-cue-label");
  const { i18n } = configuration;
  const listeners = [];
  let lastState = configuration.initialState ?? {
    time: 0,
    position: 0,
    velocity: 0,
    status: "ready",
  };
  let lastMeta = {};
  let destroyed = false;

  function listen(eventName, callback) {
    person.addEventListener(eventName, callback);
    listeners.push(() => person.removeEventListener?.(eventName, callback));
  }

  function resolveRunning(meta = lastMeta) {
    return typeof meta.running === "boolean"
      ? meta.running
      : lastState.status === "running";
  }

  function localize() {
    const initial = isInitialState(lastState) && lastState.status === "ready";
    const label = i18n.t(initial ? "svg.personStart" : "svg.personResume");
    person.setAttribute("aria-label", label);
    person.setAttribute("title", label);
    personTitle.textContent = label;
    cueLabel.textContent = i18n.t(initial ? "controls.start" : "controls.resume");
    return label;
  }

  function update(state = lastState, meta = lastMeta) {
    lastState = state;
    lastMeta = meta;
    const running = resolveRunning(meta);
    const terminal = isTerminalState(state);
    const released = state.status !== "ready" || !isInitialState(state) || running || terminal;

    svg.setAttribute("data-person-state", released ? "released" : "holding");
    person.setAttribute("aria-disabled", String(running || terminal));
    localize();
    return Object.freeze({ running, terminal, released });
  }

  function activate(event) {
    if (destroyed || person.getAttribute?.("aria-disabled") === "true") {
      return false;
    }
    event?.preventDefault?.();
    const changed = Boolean(configuration.onActivate());
    if (changed) {
      svg.setAttribute("data-person-state", "released");
      person.setAttribute("aria-disabled", "true");
    }
    return changed;
  }

  function onKeyDown(event) {
    if (["Enter", " "].includes(event.key) || event.code === "Space") {
      activate(event);
    }
  }

  listen("click", activate);
  listen("keydown", onKeyDown);
  const unsubscribeLanguage = i18n.subscribe(localize);
  update(lastState, lastMeta);

  return Object.freeze({
    activate,
    update,
    localize,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      unsubscribeLanguage();
      return true;
    },
  });
}
