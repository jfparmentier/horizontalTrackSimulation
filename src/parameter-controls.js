const PHYSICAL_CONTROLS = Object.freeze([
  Object.freeze({ key: "m2", range: "#m2-range", number: "#m2-number" }),
  Object.freeze({ key: "friction", range: "#friction-range", number: "#friction-number" }),
]);

const OTHER_CONTROLS = Object.freeze({
  playbackSpeed: Object.freeze({ range: "#playback-speed-range", number: "#playback-speed-number" }),
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

/** Relie tous les champs de paramètres à l'état central. */
export function bindParameterControls(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const errorElement = getRequiredElement(root, "#parameter-error");
  const physicalPairs = new Map(
    PHYSICAL_CONTROLS.map((definition) => [
      definition.key,
      {
        range: getRequiredElement(root, definition.range),
        number: getRequiredElement(root, definition.number),
      },
    ]),
  );
  const playbackPair = {
    range: getRequiredElement(root, OTHER_CONTROLS.playbackSpeed.range),
    number: getRequiredElement(root, OTHER_CONTROLS.playbackSpeed.number),
  };
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function clearError() {
    errorElement.textContent = "";
    for (const pair of [...physicalPairs.values(), playbackPair]) {
      setInvalid(pair, false);
    }
  }

  function showError(error, pair) {
    errorElement.textContent = error instanceof Error
      ? error.message
      : String(error);
    if (pair) setInvalid(pair, true);
  }

  function sync(snapshot = appState.getSnapshot()) {
    for (const [key, pair] of physicalPairs) {
      setPairValue(pair, snapshot.parameters[key]);
      setInvalid(pair, false);
    }
    setPairValue(playbackPair, snapshot.playbackSpeed);
  }

  function commitPhysical(key, rawValue, pair) {
    try {
      clearError();
      const numericValue = Number(rawValue);
      const normalizedValue = key === "m2"
        ? Math.round(numericValue * 10) / 10
        : numericValue;
      appState.updateParameters({ [key]: normalizedValue });
      sync();
    } catch (error) {
      sync();
      showError(error, pair);
    }
  }

  for (const [key, pair] of physicalPairs) {
    listen(pair.range, "input", () => {
      pair.number.value = pair.range.value;
      commitPhysical(key, pair.range.value, pair);
    });
    listen(pair.number, "change", () => {
      pair.range.value = pair.number.value;
      commitPhysical(key, pair.number.value, pair);
    });
  }

  listen(playbackPair.range, "input", () => {
    playbackPair.number.value = playbackPair.range.value;
    try {
      clearError();
      appState.setPlaybackSpeed(Number(playbackPair.range.value));
    } catch (error) {
      sync();
      showError(error, playbackPair);
    }
  });
  listen(playbackPair.number, "change", () => {
    playbackPair.range.value = playbackPair.number.value;
    try {
      clearError();
      appState.setPlaybackSpeed(Number(playbackPair.number.value));
    } catch (error) {
      sync();
      showError(error, playbackPair);
    }
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
