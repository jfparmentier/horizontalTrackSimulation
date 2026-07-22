import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";

test("l'état central contient les paramètres et réglages initiaux", () => {
  const store = createAppState();
  const state = store.getSnapshot();

  assert.equal(state.parameters.m1, 0.5);
  assert.equal(state.parameters.trackLength, 2);
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
    measurements: [{
      sensorId: 1,
      position: 0.2,
      mobilePosition: 0.24,
      time: 0.5,
      velocity: 0.4,
      acceleration: 0.8,
      phase: 1,
    }],
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


test("les mesures de capteurs sont enregistrées, numérotées et figées", () => {
  const store = createAppState();
  const reasons = [];
  store.subscribe((_snapshot, meta) => reasons.push(meta));

  const updated = store.addMeasurements([
    {
      sensorId: 2,
      position: 0.4,
      mobilePosition: 0.46,
      time: 0.8,
      velocity: 0.7,
      acceleration: 1.2,
      phase: 1,
    },
    {
      sensorId: 3,
      position: 0.6,
      mobilePosition: 0.69,
      time: 1.1,
      velocity: 0.9,
      acceleration: 0,
      phase: 2,
    },
  ]);

  assert.equal(updated.measurements.length, 2);
  assert.deepEqual(updated.measurements.map((item) => item.sequence), [1, 2]);
  assert.equal(Object.isFrozen(updated.measurements), true);
  assert.equal(Object.isFrozen(updated.measurements[0]), true);
  assert.equal(reasons.at(-1).reason, "measurements-recorded");
  assert.deepEqual(reasons.at(-1).sensorIds, [2, 3]);
});

test("une mesure déjà associée au même capteur n'est pas dupliquée", () => {
  const store = createAppState();
  const measurement = {
    sensorId: 1,
    position: 0.2,
    mobilePosition: 0.24,
    time: 0.5,
    velocity: 0.4,
    acceleration: 0.8,
    phase: 1,
  };

  store.addMeasurements([measurement]);
  const unchanged = store.addMeasurements([{ ...measurement, velocity: 9 }]);

  assert.equal(unchanged.measurements.length, 1);
  assert.equal(unchanged.measurements[0].velocity, 0.4);
});

test("les mesures invalides sont refusées", () => {
  const store = createAppState();

  assert.throws(() => store.addMeasurements([{ sensorId: 1 }]), /measurement/i);
  assert.throws(() => store.addMeasurements("mesure"), /tableau/i);
});


test("l'état central refuse une gravité autre que la gravité terrestre", () => {
  assert.throws(
    () => createAppState({ parameters: { gravityMode: "moon" } }),
    /gravité|gravity|earth/i,
  );
});


test("la longueur du banc reste fixée à 2 m dans l'état central", () => {
  const store = createAppState({ parameters: { trackLength: 3 } });

  assert.equal(store.getSnapshot().parameters.trackLength, 2);
  assert.throws(() => store.updateParameters({ trackLength: 1 }), /fixée à 2 m/i);
  assert.equal(store.getSnapshot().parameters.trackLength, 2);
});
