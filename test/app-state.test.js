import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";

test("l'état central contient les paramètres et réglages initiaux", () => {
  const store = createAppState();
  const state = store.getSnapshot();

  assert.equal(state.parameters.m1, 0.5);
  assert.equal(state.parameters.gravityMode, "earth");
  assert.equal(state.experimental.sensorCount, 8);
  assert.equal(state.playbackSpeed, 1);
  assert.equal(state.simulation.position, 0);
  assert.equal(state.display.showMeasurements, false);
  assert.equal(state.display.showCurves, false);
  assert.equal(Object.isFrozen(state), true);
});

test("modifier un paramètre physique réinitialise l'expérience", () => {
  const store = createAppState({
    measurements: [{ position: 0.2 }],
    continuousData: [{ position: 0.1 }],
  });
  store.setSimulationState({
    ...store.getSnapshot().simulation,
    time: 1,
    position: 0.2,
    velocity: 0.4,
    hangingDisplacement: 0.2,
    status: "paused",
  });

  const updated = store.updateParameters({ m2: 0.3 });

  assert.equal(updated.parameters.m2, 0.3);
  assert.equal(updated.simulation.time, 0);
  assert.equal(updated.simulation.position, 0);
  assert.deepEqual(updated.measurements, []);
  assert.deepEqual(updated.continuousData, []);
  assert.equal(updated.revision, 1);
});

test("modifier le nombre de capteurs réinitialise l'expérience", () => {
  const store = createAppState();
  const updated = store.updateExperimental({ sensorCount: 12 });

  assert.equal(updated.experimental.sensorCount, 12);
  assert.equal(updated.simulation.status, "ready");
  assert.equal(updated.revision, 1);
});

test("modifier la vitesse de lecture ne réinitialise pas la simulation", () => {
  const store = createAppState();
  store.setSimulationState({
    ...store.getSnapshot().simulation,
    time: 0.5,
    position: 0.1,
    velocity: 0.2,
    hangingDisplacement: 0.1,
    status: "paused",
  });

  const updated = store.setPlaybackSpeed(2);

  assert.equal(updated.playbackSpeed, 2);
  assert.equal(updated.simulation.time, 0.5);
  assert.equal(updated.revision, 0);
});

test("les valeurs invalides sont refusées sans altérer l'état", () => {
  const store = createAppState();
  const before = store.getSnapshot();

  assert.throws(() => store.updateParameters({ m1: 3 }), /m1/i);
  assert.throws(() => store.updateExperimental({ sensorCount: 3.5 }), /capteurs/i);
  assert.throws(() => store.setPlaybackSpeed(20), /vitesse de lecture/i);
  assert.equal(store.getSnapshot(), before);
});

test("les abonnés reçoivent le motif de chaque modification", () => {
  const store = createAppState();
  const reasons = [];
  const unsubscribe = store.subscribe((_state, meta) => reasons.push(meta.reason));

  store.updateParameters({ friction: 0.05 });
  store.setPlaybackSpeed(1.5);
  store.resetExperiment();
  unsubscribe();
  store.updateParameters({ m1: 0.6 });

  assert.deepEqual(reasons, [
    "parameters-change",
    "playback-speed-change",
    "experiment-reset",
  ]);
});

test("les réglages d'affichage futurs sont centralisés", () => {
  const store = createAppState();
  const updated = store.updateDisplay({ showMeasurements: true });

  assert.equal(updated.display.showMeasurements, true);
  assert.equal(updated.display.showCurves, false);
});
