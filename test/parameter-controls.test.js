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
    "m1-range", "m1-number",
    "m2-range", "m2-number",
    "drop-height-range", "drop-height-number",
    "friction-range", "friction-number",
    "sensor-count-range", "sensor-count-number",
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
    parameters: { m1: 0.8 },
    sensorCount: 10,
    playbackSpeed: 1.5,
  });
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  assert.equal(elements.get("#m1-range").value, "0.8");
  assert.equal(elements.get("#m1-number").value, "0.8");
  assert.equal(elements.get("#sensor-count-number").value, "10");
  assert.equal(elements.get("#playback-speed-number").value, "1.5");
  assert.equal(store.getSnapshot().parameters.gravityMode, "earth");
});

test("un curseur physique met à jour l'état central", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const range = elements.get("#m2-range");
  range.value = "0.45";
  range.dispatch("input");

  assert.equal(store.getSnapshot().parameters.m2, 0.45);
  assert.equal(elements.get("#m2-number").value, "0.45");
});

test("la vitesse de lecture est reliée et la gravité reste terrestre", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const speed = elements.get("#playback-speed-number");
  speed.value = "2.5";
  speed.dispatch("change");

  assert.equal(store.getSnapshot().parameters.gravityMode, "earth");
  assert.equal(store.getSnapshot().playbackSpeed, 2.5);
});

test("une saisie invalide est annulée et signalée", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const input = elements.get("#m1-number");
  input.value = "4";
  input.dispatch("change");

  assert.equal(store.getSnapshot().parameters.m1, 0.5);
  assert.equal(input.value, "0.5");
  assert.match(elements.get("#parameter-error").textContent, /m1/i);
  assert.equal(input.attributes.get("aria-invalid"), "true");
});
