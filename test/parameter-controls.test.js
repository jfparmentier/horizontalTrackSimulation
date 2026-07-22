import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import { bindParameterControls } from "../src/parameter-controls.js";

class FakeElement {
  constructor(value = "") {
    this.value = value;
    this.checked = false;
    this.textContent = "";
    this.attributes = new Map();
    this.listeners = new Map();
  }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  dispatch(name) {
    for (const callback of this.listeners.get(name) ?? []) callback({ target: this });
  }
}

function createRoot() {
  const ids = [
    "parameter-error",
    "m2-range", "m2-number",
    "friction-range", "friction-number",
    "playback-speed-range", "playback-speed-number",
  ];
  const elements = new Map(ids.map((id) => [`#${id}`, new FakeElement()]));
  return {
    elements,
    root: {
      querySelector(selector) {
        return elements.get(selector) ?? null;
      },
    },
  };
}

test("les contrôles sont initialisés depuis l'état central", () => {
  const store = createAppState({
    parameters: { m2: 0.8 },
    playbackSpeed: 0.8,
  });
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  assert.equal(elements.get("#m2-range").value, "0.8");
  assert.equal(elements.get("#m2-number").value, "0.8");
  assert.equal(elements.get("#playback-speed-number").value, "0.8");
  assert.equal(store.getSnapshot().parameters.gravityMode, "earth");
});

test("un curseur physique met à jour l'état central", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const range = elements.get("#m2-range");
  range.value = "0.4";
  range.dispatch("input");

  assert.equal(store.getSnapshot().parameters.m2, 0.4);
  assert.equal(elements.get("#m2-number").value, "0.4");
});


test("la masse suspendue est arrondie au pas de 0.1 kg", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const input = elements.get("#m2-number");
  input.value = "0.26";
  input.dispatch("change");

  assert.equal(store.getSnapshot().parameters.m2, 0.3);
  assert.equal(elements.get("#m2-range").value, "0.3");
  assert.equal(input.value, "0.3");
});

test("la vitesse de lecture est reliée et la gravité reste terrestre", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const speed = elements.get("#playback-speed-number");
  speed.value = "0.6";
  speed.dispatch("change");

  assert.equal(store.getSnapshot().parameters.gravityMode, "earth");
  assert.equal(store.getSnapshot().playbackSpeed, 0.6);
});

test("une saisie invalide est annulée et signalée", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const input = elements.get("#m2-number");
  input.value = "4";
  input.dispatch("change");

  assert.equal(store.getSnapshot().parameters.m2, 0.1);
  assert.equal(input.value, "0.1");
  assert.match(elements.get("#parameter-error").textContent, /m2/i);
  assert.equal(input.attributes.get("aria-invalid"), "true");
});
