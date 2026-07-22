import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import { DEFAULT_PARAMETERS } from "../src/constants.js";
import { createMeasurementRecorder } from "../src/measurement-recorder.js";
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
    querySelector(selector) {
      return elements.get(selector) ?? null;
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
}

test("les franchissements de capteurs alimentent l'état central avec des mesures complètes", () => {
  const scheduler = new FakeScheduler();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const appState = createAppState();
  const recorder = createMeasurementRecorder(layout);
  const sensorController = createSensorController(createFakeSvg(layout), layout, {
    onCrossings(crossings) {
      appState.addMeasurements(recorder.recordCrossings(crossings));
    },
  });

  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender(state, previousState, meta) {
      sensorController.render(state, previousState, meta);
      appState.setSimulationState(state);
    },
  });

  loop.step(1);

  const snapshot = appState.getSnapshot();
  const sensorSnapshot = sensorController.getSnapshot();
  assert.equal(snapshot.measurements.length, sensorSnapshot.triggeredCount);
  assert.ok(snapshot.measurements.length >= 2);
  assert.deepEqual(
    snapshot.measurements.map((item) => item.sensorId),
    [...snapshot.measurements.map((item) => item.sensorId)].sort((a, b) => a - b),
  );
  for (const measurement of snapshot.measurements) {
    assert.ok(measurement.position > 0);
    assert.equal(measurement.position, measurement.mobilePosition);
    assert.ok(measurement.time > 0);
    assert.ok(measurement.velocity > 0);
    assert.ok([1, 2].includes(measurement.phase));
  }
});

test("la remise à zéro efface les mesures et autorise un nouvel enregistrement", () => {
  const scheduler = new FakeScheduler();
  const layout = computeApparatusLayout(DEFAULT_PARAMETERS);
  const appState = createAppState();
  const recorder = createMeasurementRecorder(layout);
  const sensorController = createSensorController(createFakeSvg(layout), layout, {
    onCrossings(crossings) {
      appState.addMeasurements(recorder.recordCrossings(crossings));
    },
  });
  const loop = createTimeLoop({
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender(state, previousState, meta) {
      sensorController.render(state, previousState, meta);
      appState.setSimulationState(state);
    },
  });

  loop.step(0.8);
  const firstCount = appState.getSnapshot().measurements.length;
  assert.ok(firstCount > 0);

  appState.resetExperiment();
  recorder.reset();
  loop.reset(DEFAULT_PARAMETERS);
  assert.equal(appState.getSnapshot().measurements.length, 0);

  loop.step(0.8);
  assert.equal(appState.getSnapshot().measurements.length, firstCount);
});
