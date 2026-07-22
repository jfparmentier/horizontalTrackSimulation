import test from "node:test";
import assert from "node:assert/strict";

import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import {
  computeSensorTriggerPosition,
  computeKinematicStateAtPosition,
  createMeasurement,
  createMeasurementRecorder,
} from "../src/measurement-recorder.js";
import {
  computePhase1Acceleration,
  computePhase2Acceleration,
} from "../src/physics.js";

const PARAMETERS = Object.freeze({
  m1: 0.5,
  m2: 0.1,
  dropHeight: 0.5,
  trackLength: 2,
  friction: 0,
  gravityMode: "earth",
  sensorCount: 8,
});

function closeTo(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} devrait être proche de ${expected}`,
  );
}

test("la position de déclenchement correspond à l'alignement du bord gauche et du faisceau", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const sensor = layout.sensors[0];
  const triggerPosition = computeSensorTriggerPosition(layout, sensor);
  const reconstructedX = layout.mobile.x
    + triggerPosition * layout.motionScale.pixelsPerMeter;

  closeTo(reconstructedX, sensor.x);
  closeTo(triggerPosition, sensor.position);
});

test("l'état cinématique est exact pendant la phase 1", () => {
  const target = 0.2;
  const state = computeKinematicStateAtPosition(PARAMETERS, target);
  const acceleration = computePhase1Acceleration(PARAMETERS);
  const expectedVelocity = Math.sqrt(2 * acceleration * target);

  assert.equal(state.phase, 1);
  closeTo(state.velocity, expectedVelocity);
  closeTo(state.time, expectedVelocity / acceleration);
  closeTo(state.acceleration, acceleration);
});

test("l'état cinématique conserve la vitesse en phase 2 sans frottement", () => {
  const target = 1.1;
  const state = computeKinematicStateAtPosition(PARAMETERS, target);
  const acceleration = computePhase1Acceleration(PARAMETERS);
  const transitionVelocity = Math.sqrt(2 * acceleration * PARAMETERS.dropHeight);
  const transitionTime = transitionVelocity / acceleration;

  assert.equal(state.phase, 2);
  closeTo(state.velocity, transitionVelocity);
  closeTo(
    state.time,
    transitionTime + (target - PARAMETERS.dropHeight) / transitionVelocity,
  );
  assert.equal(state.acceleration, 0);
});

test("l'état cinématique tient compte du ralentissement par frottement en phase 2", () => {
  const parameters = {
    ...PARAMETERS,
    m2: 0.3,
    friction: 0.05,
  };
  const target = 0.8;
  const state = computeKinematicStateAtPosition(parameters, target);
  const a1 = computePhase1Acceleration(parameters);
  const transitionVelocity = Math.sqrt(2 * a1 * parameters.dropHeight);
  const a2 = computePhase2Acceleration(parameters, transitionVelocity);
  const expectedVelocity = Math.sqrt(
    transitionVelocity ** 2 + 2 * a2 * (target - parameters.dropHeight),
  );

  assert.equal(state.phase, 2);
  closeTo(state.velocity, expectedVelocity);
  closeTo(state.acceleration, a2);
});

test("une position inaccessible ne produit aucun état mesurable", () => {
  const blocked = {
    ...PARAMETERS,
    m1: 2,
    m2: 0.01,
    friction: 0.2,
  };

  assert.equal(computeKinematicStateAtPosition(blocked, 0.2), null);
});

test("une mesure utilise la position nominale du capteur au franchissement", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const sensor = layout.sensors[0];
  const triggerPosition = computeSensorTriggerPosition(layout, sensor);
  const measurement = createMeasurement(layout, {
    id: sensor.id,
    position: sensor.position,
    beamX: sensor.x,
    triggerPosition,
  });

  assert.equal(measurement.sensorId, sensor.id);
  closeTo(measurement.position, triggerPosition);
  closeTo(measurement.mobilePosition, triggerPosition);
  closeTo(measurement.position, sensor.position);
  assert.ok(measurement.time > 0);
  assert.ok(measurement.velocity > 0);
  const acceleration = computePhase1Acceleration(PARAMETERS);
  closeTo(measurement.position, 0.5 * acceleration * measurement.time ** 2);
  closeTo(measurement.velocity, acceleration * measurement.time);
  assert.equal(Object.isFrozen(measurement), true);
});

test("l'enregistreur conserve une seule mesure par capteur et respecte l'ordre temporel", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const recorder = createMeasurementRecorder(layout);
  const crossings = [layout.sensors[2], layout.sensors[0], layout.sensors[1]].map((sensor) => ({
    id: sensor.id,
    position: sensor.position,
    beamX: sensor.x,
    triggerPosition: computeSensorTriggerPosition(layout, sensor),
  }));

  const firstBatch = recorder.recordCrossings(crossings);
  const duplicateBatch = recorder.recordCrossings([crossings[0]]);

  assert.deepEqual(firstBatch.map((item) => item.sensorId), [1, 2, 3]);
  assert.deepEqual(duplicateBatch, []);
  assert.equal(recorder.getSnapshot().count, 3);
  assert.equal(Object.isFrozen(firstBatch), true);
});

test("la réinitialisation de l'enregistreur autorise une nouvelle expérience", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const recorder = createMeasurementRecorder(layout);
  const sensor = layout.sensors[0];
  const crossing = {
    id: sensor.id,
    position: sensor.position,
    beamX: sensor.x,
    triggerPosition: computeSensorTriggerPosition(layout, sensor),
  };

  recorder.recordCrossings([crossing]);
  recorder.reset();
  const repeated = recorder.recordCrossings([crossing]);

  assert.equal(repeated.length, 1);
});
