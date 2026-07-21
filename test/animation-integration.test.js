import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_PARAMETERS } from "../src/constants.js";
import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import { createApparatusAnimator } from "../src/apparatus-animation.js";
import { createTimeLoop } from "../src/time-loop.js";

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.textContent = "";
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

function createFakeSvg() {
  const elements = new Map([
    ["#layer-mobile", new FakeElement()],
    ["#layer-hanging-mass", new FakeElement()],
    ["#string-path", new FakeElement()],
    ["#apparatus-description", new FakeElement()],
  ]);
  const svg = new FakeElement();
  svg.querySelector = (selector) => elements.get(selector) ?? null;
  return { svg, elements };
}

class FakeScheduler {
  constructor() {
    this.callbacks = new Map();
    this.nextId = 1;
  }
  requestFrame = (callback) => {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  };
  cancelFrame = (id) => this.callbacks.delete(id);
  frameAt(timestamp) {
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    callbacks.forEach((callback) => callback(timestamp));
  }
}

test("la boucle temporelle déplace S1, S2 et le fil dans un même rendu", () => {
  const scheduler = new FakeScheduler();
  const { svg, elements } = createFakeSvg();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const animator = createApparatusAnimator(svg, layout);

  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender: (state, previousState, meta) => animator.render(state, previousState, meta),
  });

  const initialMobile = elements.get("#layer-mobile").attributes.get("transform");
  const initialMass = elements.get("#layer-hanging-mass").attributes.get("transform");
  const initialRope = elements.get("#string-path").attributes.get("d");

  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(500);

  assert.notEqual(elements.get("#layer-mobile").attributes.get("transform"), initialMobile);
  assert.notEqual(elements.get("#layer-hanging-mass").attributes.get("transform"), initialMass);
  assert.notEqual(elements.get("#string-path").attributes.get("d"), initialRope);
  assert.equal(elements.get("#string-path").attributes.get("data-tension"), "taut");
});

test("le passage en phase 2 immobilise S2 et détend le fil", () => {
  const scheduler = new FakeScheduler();
  const { svg, elements } = createFakeSvg();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const animator = createApparatusAnimator(svg, layout);

  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender: (state, previousState, meta) => animator.render(state, previousState, meta),
  });

  loop.step(1);
  const massAtTransition = elements.get("#layer-hanging-mass").attributes.get("transform");
  const xAfterTransition = loop.getState().position;

  assert.equal(loop.getState().phase, 2);
  assert.ok(xAfterTransition > DEFAULT_PARAMETERS.dropHeight);
  assert.equal(elements.get("#string-path").attributes.get("data-tension"), "slack");

  loop.step(0.3);
  assert.equal(elements.get("#layer-hanging-mass").attributes.get("transform"), massAtTransition);
  assert.ok(loop.getState().position > xAfterTransition);
});
