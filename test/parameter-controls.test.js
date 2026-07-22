import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import { bindParameterControls } from "../src/parameter-controls.js";

class FakeElement {
  constructor(value = "") {
    this.value = value;
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
  const ids = ["playback-speed-range", "playback-speed-number"];
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

test("la vitesse de lecture est initialisée depuis l'état central", () => {
  const store = createAppState({ playbackSpeed: 0.8 });
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  assert.equal(elements.get("#playback-speed-range").value, "0.8");
  assert.equal(elements.get("#playback-speed-number").value, "0.8");
});

test("le curseur de vitesse de lecture met à jour l'état central", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const range = elements.get("#playback-speed-range");
  range.value = "0.6";
  range.dispatch("input");

  assert.equal(store.getSnapshot().playbackSpeed, 0.6);
  assert.equal(elements.get("#playback-speed-number").value, "0.6");
});

test("une vitesse de lecture invalide est annulée et signalée", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindParameterControls(root, store);

  const input = elements.get("#playback-speed-number");
  input.value = "2";
  input.dispatch("change");

  assert.equal(store.getSnapshot().playbackSpeed, 1);
  assert.equal(input.value, "1");
  assert.equal(input.attributes.get("aria-invalid"), "true");
});
