import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_PARAMETERS } from "../src/constants.js";
import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import { createSensorController } from "../src/sensor-controller.js";
import { createTimeLoop } from "../src/time-loop.js";

class FakeElement {
  constructor() {
    this.attributes = new Map();
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

function createFakeSvg(layout) {
  const elements = new Map(
    layout.sensors.map((sensor) => [`#sensor-${sensor.id}`, new FakeElement()]),
  );
  return {
    elements,
    svg: {
      querySelector(selector) {
        return elements.get(selector) ?? null;
      },
    },
  };
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

test("la boucle temporelle déclenche les capteurs rencontrés par S1", () => {
  const scheduler = new FakeScheduler();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const { svg } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);
  const snapshots = [];

  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender(state, previousState, meta) {
      snapshots.push(controller.render(state, previousState, meta));
    },
  });

  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(250);
  scheduler.frameAt(500);
  scheduler.frameAt(750);
  scheduler.frameAt(1000);

  assert.ok(snapshots.at(-1).triggeredCount >= 2);
});

test("le pas à pas détecte tous les capteurs franchis entre deux rendus", () => {
  const scheduler = new FakeScheduler();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const { svg } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);
  let lastSnapshot = null;

  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender(state, previousState, meta) {
      lastSnapshot = controller.render(state, previousState, meta);
    },
  });

  loop.step(1);

  assert.ok(lastSnapshot.crossings.length >= 2);
  assert.equal(lastSnapshot.triggeredCount, lastSnapshot.crossings.length);
});
