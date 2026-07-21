import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import {
  DEFAULT_MANUAL_STEP_DURATION,
  bindSimulationControls,
} from "../src/simulation-controls.js";

class FakeElement {
  constructor(tagName = "button") {
    this.tagName = tagName.toUpperCase();
    this.disabled = false;
    this.textContent = "";
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.isContentEditable = false;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  dispatch(name, event = {}) {
    const payload = { target: this, ...event };
    for (const callback of this.listeners.get(name) ?? []) callback(payload);
  }
}

function createFakeLoop() {
  let state = {
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    phase: 1,
    status: "ready",
    endReason: null,
  };
  let running = false;
  const calls = [];

  return {
    calls,
    start() {
      calls.push("start");
      if (running || ["blocked", "finished"].includes(state.status)) return false;
      running = true;
      state = { ...state, status: "running" };
      return true;
    },
    pause() {
      calls.push("pause");
      if (!running) return false;
      running = false;
      state = { ...state, status: "paused" };
      return true;
    },
    step(duration) {
      calls.push(["step", duration]);
      if (["blocked", "finished"].includes(state.status)) {
        return { state, events: [], steps: 0 };
      }
      running = false;
      state = {
        ...state,
        time: state.time + duration,
        position: state.position + 0.01,
        status: "paused",
      };
      return { state, events: [], steps: 1 };
    },
    reset() {
      calls.push("reset");
      running = false;
      state = { ...state, time: 0, position: 0, velocity: 0, status: "ready" };
    },
    getState: () => state,
    getDiagnostics: () => ({ running }),
    setState(next) {
      state = { ...state, ...next };
      running = state.status === "running";
    },
  };
}

function createFixture() {
  const elements = new Map([
    ["#start-button", new FakeElement()],
    ["#pause-button", new FakeElement()],
    ["#step-button", new FakeElement()],
    ["#reset-button", new FakeElement()],
    ["#control-status", new FakeElement("p")],
  ]);
  const keyboard = new FakeElement("div");
  const root = {
    querySelector(selector) {
      return elements.get(selector) ?? null;
    },
  };
  return { elements, keyboard, root };
}

test("les commandes sont initialisées dans l'état prêt", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { elements, keyboard, root } = createFixture();

  bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  assert.equal(elements.get("#start-button").disabled, false);
  assert.equal(elements.get("#pause-button").disabled, true);
  assert.equal(elements.get("#step-button").disabled, false);
  assert.equal(elements.get("#reset-button").disabled, true);
  assert.equal(elements.get("#start-button").textContent, "Démarrer");
  assert.equal(elements.get("#control-status").textContent, "Simulation prête.");
});

test("démarrer, mettre en pause et reprendre actualisent les boutons", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { elements, keyboard, root } = createFixture();
  const controls = bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  elements.get("#start-button").dispatch("click");
  assert.equal(elements.get("#start-button").disabled, true);
  assert.equal(elements.get("#pause-button").disabled, false);
  assert.equal(elements.get("#control-status").textContent, "Simulation en cours.");

  elements.get("#pause-button").dispatch("click");
  loop.step(0.01);
  controls.update(loop.getState(), loop.getDiagnostics());
  assert.equal(elements.get("#start-button").textContent, "Reprendre");
  assert.equal(elements.get("#start-button").disabled, false);
  assert.equal(elements.get("#control-status").textContent, "Simulation en pause.");
});

test("le bouton pas à pas utilise une durée physique déterministe", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { elements, keyboard, root } = createFixture();
  bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  elements.get("#step-button").dispatch("click");

  assert.deepEqual(loop.calls.at(-1), ["step", DEFAULT_MANUAL_STEP_DURATION]);
  assert.equal(elements.get("#start-button").textContent, "Reprendre");
  assert.equal(elements.get("#reset-button").disabled, false);
});

test("réinitialiser passe par l'état central et remet les commandes à l'état prêt", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { elements, keyboard, root } = createFixture();
  const controls = bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  loop.step(0.1);
  controls.update(loop.getState(), loop.getDiagnostics());
  elements.get("#reset-button").dispatch("click");

  assert.equal(store.getSnapshot().simulation.time, 0);
  assert.ok(loop.calls.includes("pause"));
});

test("les raccourcis espace, flèche droite et origine pilotent la simulation", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { keyboard, root } = createFixture();
  bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  let prevented = 0;
  const event = { target: keyboard, preventDefault: () => { prevented += 1; } };
  keyboard.dispatch("keydown", { ...event, code: "Space", key: " " });
  keyboard.dispatch("keydown", { ...event, code: "Space", key: " " });
  keyboard.dispatch("keydown", { ...event, code: "ArrowRight", key: "ArrowRight" });
  keyboard.dispatch("keydown", { ...event, code: "Home", key: "Home" });

  assert.equal(loop.calls[0], "start");
  assert.equal(loop.calls[1], "pause");
  assert.deepEqual(loop.calls[2], ["step", DEFAULT_MANUAL_STEP_DURATION]);
  assert.equal(prevented, 4);
});

test("les raccourcis sont ignorés pendant la saisie d'un paramètre", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { keyboard, root } = createFixture();
  bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  const input = new FakeElement("input");
  keyboard.dispatch("keydown", { target: input, code: "Space", key: " " });
  assert.deepEqual(loop.calls, []);
});

test("un état terminal désactive les commandes de progression", () => {
  const loop = createFakeLoop();
  const store = createAppState();
  const { elements, keyboard, root } = createFixture();
  const controls = bindSimulationControls(root, {
    appState: store,
    getLoop: () => loop,
    keyboardTarget: keyboard,
  });

  loop.setState({ status: "finished", endReason: "track-end", time: 2, position: 2 });
  controls.update(loop.getState(), loop.getDiagnostics());

  assert.equal(elements.get("#start-button").disabled, true);
  assert.equal(elements.get("#pause-button").disabled, true);
  assert.equal(elements.get("#step-button").disabled, true);
  assert.match(elements.get("#control-status").textContent, /fin du banc/i);
});
