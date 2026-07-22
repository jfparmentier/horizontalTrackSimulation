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

test("les contrôles numériques sont initialisés depuis l'état central", () => {
  const store = createAppState({
    parameters: { m2: 0.5, friction: 0.08 },
    playbackSpeed: 0.8,
  });
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  assert.equal(elements.get("#friction-range").value, "0.08");
  assert.equal(elements.get("#friction-number").value, "0.08");
  assert.equal(elements.get("#playback-speed-number").value, "0.8");
  assert.equal(store.getSnapshot().parameters.m2, 0.5);
});

test("le curseur de frottement met à jour l'état central", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const range = elements.get("#friction-range");
  range.value = "0.04";
  range.dispatch("input");

  assert.equal(store.getSnapshot().parameters.friction, 0.04);
  assert.equal(elements.get("#friction-number").value, "0.04");
});

test("la vitesse de lecture reste reliée à l'état central", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const speed = elements.get("#playback-speed-number");
  speed.value = "0.6";
  speed.dispatch("change");

  assert.equal(store.getSnapshot().playbackSpeed, 0.6);
});

test("une saisie de frottement invalide est annulée et signalée", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const input = elements.get("#friction-number");
  input.value = "0.8";
  input.dispatch("change");

  assert.equal(store.getSnapshot().parameters.friction, 0);
  assert.equal(input.value, "0");
  assert.match(elements.get("#parameter-error").textContent, /friction/i);
  assert.equal(input.attributes.get("aria-invalid"), "true");
});
