import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import { bindModeSelector } from "../src/mode-selector.js";

class FakeElement {
  constructor() {
    this.hidden = false;
    this.textContent = "";
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
    this.inert = false;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  focus() {
    this.focused = true;
  }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  dispatch(name) {
    for (const callback of this.listeners.get(name) ?? []) callback({ target: this });
  }
}

function createRoot() {
  const ids = [
    "mode-selection", "simulation-screen", "mode-ideal-button",
    "mode-friction-button", "mode-home-button", "start-button",
  ];
  const elements = new Map(ids.map((id) => [`#${id}`, new FakeElement()]));
  const scrollCalls = [];
  return {
    elements,
    scrollCalls,
    root: {
      defaultView: {
        scrollTo(options) {
          scrollCalls.push(options);
        },
      },
      querySelector(selector) {
        return elements.get(selector) ?? null;
      },
    },
  };
}

test("l'écran de choix est visible tant qu'aucun mode n'est sélectionné", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindModeSelector(root, store);

  assert.equal(elements.get("#mode-selection").hidden, false);
  assert.equal(elements.get("#simulation-screen").hidden, true);
});

test("le choix idéal ouvre la simulation et configure des mesures parfaites", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindModeSelector(root, store);

  elements.get("#mode-ideal-button").dispatch("click");
  const snapshot = store.getSnapshot();

  assert.equal(snapshot.mode, "ideal");
  assert.equal(snapshot.parameters.friction, 0);
  assert.equal(snapshot.experimental.measurementNoiseStdDev, 0);
  assert.equal(snapshot.experimental.timeMeasurementNoiseStdDev, 0);
  assert.equal(elements.get("#mode-selection").hidden, true);
  assert.equal(elements.get("#simulation-screen").hidden, false);
});

test("le choix avec frottement configure mu = 0,058 et des mesures bruitées", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindModeSelector(root, store);

  elements.get("#mode-friction-button").dispatch("click");
  const snapshot = store.getSnapshot();

  assert.equal(snapshot.mode, "friction");
  assert.equal(snapshot.parameters.friction, 0.058);
  assert.equal(snapshot.experimental.measurementNoiseStdDev, 0.1);
  assert.equal(snapshot.experimental.timeMeasurementNoiseStdDev, 0.1);
});

test("le bouton d'accueil revient au choix du mode", () => {
  const store = createAppState({ mode: "ideal" });
  const { root, elements } = createRoot();
  bindModeSelector(root, store);

  elements.get("#mode-home-button").dispatch("click");

  assert.equal(store.getSnapshot().mode, null);
  assert.equal(elements.get("#mode-selection").hidden, false);
  assert.equal(elements.get("#simulation-screen").hidden, true);
});


test("le changement d’écran replace le viewport en haut de la page", () => {
  const store = createAppState();
  const { root, elements, scrollCalls } = createRoot();
  bindModeSelector(root, store);

  elements.get("#mode-ideal-button").dispatch("click");
  elements.get("#mode-home-button").dispatch("click");

  assert.deepEqual(scrollCalls, [
    { top: 0, left: 0, behavior: "auto" },
    { top: 0, left: 0, behavior: "auto" },
  ]);
});


test("le focus et l'état inert suivent les changements d'écran", () => {
  const store = createAppState();
  const { root, elements } = createRoot();
  bindModeSelector(root, store);

  assert.equal(elements.get("#simulation-screen").inert, true);
  elements.get("#mode-friction-button").dispatch("click");
  assert.equal(elements.get("#start-button").focused, true);
  assert.equal(elements.get("#mode-selection").inert, true);
  assert.equal(elements.get("#simulation-screen").inert, false);

  elements.get("#mode-home-button").dispatch("click");
  assert.equal(elements.get("#mode-friction-button").focused, true);
  assert.equal(elements.get("#mode-selection").inert, false);
  assert.equal(elements.get("#simulation-screen").inert, true);
});
