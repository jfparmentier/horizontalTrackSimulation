const PLAYBACK_CONTROLS = Object.freeze({
  range: "#playback-speed-range",
  number: "#playback-speed-number",
});

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de paramétrage introuvable : ${selector}`);
  }
  return element;
}

function setPairValue(pair, value) {
  const normalized = String(value);
  pair.range.value = normalized;
  pair.number.value = normalized;
}

function setInvalid(pair, invalid) {
  const value = invalid ? "true" : "false";
  pair.range.setAttribute("aria-invalid", value);
  pair.number.setAttribute("aria-invalid", value);
}

/** Relie uniquement la vitesse de lecture à l'état central. */
export function bindParameterControls(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const playbackPair = {
    range: getRequiredElement(root, PLAYBACK_CONTROLS.range),
    number: getRequiredElement(root, PLAYBACK_CONTROLS.number),
  };
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function sync(snapshot = appState.getSnapshot()) {
    setPairValue(playbackPair, snapshot.playbackSpeed);
    setInvalid(playbackPair, false);
  }

  function commit(rawValue) {
    try {
      setInvalid(playbackPair, false);
      appState.setPlaybackSpeed(Number(rawValue));
      sync();
    } catch {
      sync();
      setInvalid(playbackPair, true);
    }
  }

  listen(playbackPair.range, "input", () => {
    playbackPair.number.value = playbackPair.range.value;
    commit(playbackPair.range.value);
  });
  listen(playbackPair.number, "change", () => {
    playbackPair.range.value = playbackPair.number.value;
    commit(playbackPair.number.value);
  });

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (meta.reason !== "simulation-change") sync(snapshot);
  });

  sync();

  return Object.freeze({
    sync,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}
