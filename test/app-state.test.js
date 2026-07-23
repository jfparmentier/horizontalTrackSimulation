import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";

test("l'état central contient les paramètres et réglages initiaux", () => {
  const store = createAppState();
  const state = store.getSnapshot();

  assert.equal(state.parameters.m1, 1);
  assert.equal(state.parameters.trackLength, 2);
  assert.equal(state.parameters.gravityMode, "earth");
  assert.equal(state.experimental.sensorCount, 11);
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

test("le nombre de capteurs reste fixé à onze", () => {
  const store = createAppState({ sensorCount: 9 });

  assert.equal(store.getSnapshot().experimental.sensorCount, 11);
  assert.throws(() => store.updateExperimental({ sensorCount: 9 }), /fixé à 11/i);
  assert.equal(store.getSnapshot().experimental.sensorCount, 11);
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

  const updated = store.setPlaybackSpeed(0.5);

  assert.equal(updated.playbackSpeed, 0.5);
  assert.equal(updated.simulation.time, 0.5);
  assert.equal(updated.revision, 0);
});

test("la vitesse de lecture minimale est fixée à 0,2×", () => {
  const store = createAppState();

  assert.equal(store.setPlaybackSpeed(0.2).playbackSpeed, 0.2);
  assert.throws(() => store.setPlaybackSpeed(0.1), /vitesse de lecture/i);
});

test("les valeurs invalides sont refusées sans altérer l'état", () => {
  const store = createAppState();
  const before = store.getSnapshot();

  assert.throws(() => store.updateParameters({ m1: 3 }), /masse de S1/i);
  assert.throws(() => store.updateExperimental({ sensorCount: 3.5 }), /capteurs/i);
  assert.throws(() => store.setPlaybackSpeed(20), /vitesse de lecture/i);
  assert.equal(store.getSnapshot(), before);
});

test("les abonnés reçoivent le motif de chaque modification", () => {
  const store = createAppState();
  const reasons = [];
  const unsubscribe = store.subscribe((_state, meta) => reasons.push(meta.reason));

  store.updateParameters({ friction: 0.05 });
  store.setPlaybackSpeed(0.7);
  store.resetExperiment();
  unsubscribe();
  store.updateParameters({ m2: 0.6 });

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


test("la masse de S1 et la hauteur de chute restent fixes", () => {
  const store = createAppState({
    parameters: { m1: 0.4, dropHeight: 0.9 },
  });

  assert.equal(store.getSnapshot().parameters.m1, 1);
  assert.equal(store.getSnapshot().parameters.dropHeight, 0.6);
  assert.throws(() => store.updateParameters({ m1: 0.8 }), /fixée à 1 kg/i);
  assert.throws(() => store.updateParameters({ dropHeight: 0.8 }), /fixée à 0.6 m/i);
});

test("aucun mode n'est sélectionné au démarrage", () => {
  const store = createAppState();
  const snapshot = store.getSnapshot();

  assert.equal(snapshot.mode, null);
  assert.equal(snapshot.experimental.measurementNoiseStdDev, 0);
});

test("le choix du mode idéal impose mu = 0 et des mesures parfaites", () => {
  const store = createAppState();
  const snapshot = store.selectMode("ideal");

  assert.equal(snapshot.mode, "ideal");
  assert.equal(snapshot.parameters.friction, 0);
  assert.equal(snapshot.experimental.measurementNoiseStdDev, 0);
});

test("le choix du mode avec frottement impose mu = 0,058 et le bruit des mesures", () => {
  const store = createAppState();
  const snapshot = store.selectMode("friction");

  assert.equal(snapshot.mode, "friction");
  assert.equal(snapshot.parameters.friction, 0.058);
  assert.equal(snapshot.experimental.measurementNoiseStdDev, 0.1);
  assert.throws(
    () => store.updateParameters({ friction: 0.03 }),
    /imposé par le mode/i,
  );
});

test("revenir à l'accueil efface le mode et réinitialise l'expérience", () => {
  const store = createAppState({ mode: "friction" });
  store.setSimulationState({
    ...store.getSnapshot().simulation,
    time: 0.4,
    position: 0.1,
    velocity: 0.3,
    hangingDisplacement: 0.1,
    status: "paused",
  });

  const snapshot = store.clearMode();

  assert.equal(snapshot.mode, null);
  assert.equal(snapshot.simulation.time, 0);
  assert.equal(snapshot.measurements.length, 0);
});
