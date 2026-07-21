import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PARAMETERS,
  GRAVITY,
} from "../src/constants.js";
import {
  PhysicsParameterError,
  advanceSimulation,
  computePhase1Acceleration,
  computePhase1EndVelocity,
  computePhase2Acceleration,
  createInitialState,
  getGravity,
  integrateConstantAcceleration,
  timeToReachPosition,
  timeToStop,
  validateParameters,
} from "../src/physics.js";

const closeTo = (actual, expected, tolerance = 1e-10) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Valeur obtenue ${actual}, valeur attendue ${expected}, tolérance ${tolerance}`,
  );
};

test("getGravity retourne les valeurs terrestre et lunaire", () => {
  assert.equal(getGravity("earth"), 9.81);
  assert.equal(getGravity("moon"), 1.62);
});

test("getGravity refuse un milieu inconnu", () => {
  assert.throws(() => getGravity("mars"), PhysicsParameterError);
});

test("validateParameters accepte les paramètres par défaut et retourne une copie figée", () => {
  const result = validateParameters(DEFAULT_PARAMETERS);
  assert.deepEqual(result, DEFAULT_PARAMETERS);
  assert.notEqual(result, DEFAULT_PARAMETERS);
  assert.ok(Object.isFrozen(result));
});

test("validateParameters accepte toutes les bornes définies", () => {
  assert.doesNotThrow(() =>
    validateParameters({
      m1: 0.1,
      m2: 0.01,
      dropHeight: 0.2,
      trackLength: 1,
      friction: 0,
      gravityMode: "moon",
    }),
  );

  assert.doesNotThrow(() =>
    validateParameters({
      m1: 2,
      m2: 2,
      dropHeight: 1,
      trackLength: 3,
      friction: 0.2,
      gravityMode: "earth",
    }),
  );
});

test("validateParameters refuse les valeurs hors plage", () => {
  const invalidCases = [
    { ...DEFAULT_PARAMETERS, m1: 0.09 },
    { ...DEFAULT_PARAMETERS, m1: 2.01 },
    { ...DEFAULT_PARAMETERS, m2: 0 },
    { ...DEFAULT_PARAMETERS, m2: 2.01 },
    { ...DEFAULT_PARAMETERS, dropHeight: 0.19 },
    { ...DEFAULT_PARAMETERS, dropHeight: 1.01 },
    { ...DEFAULT_PARAMETERS, trackLength: 0.99 },
    { ...DEFAULT_PARAMETERS, trackLength: 3.01 },
    { ...DEFAULT_PARAMETERS, friction: -0.01 },
    { ...DEFAULT_PARAMETERS, friction: 0.21 },
  ];

  for (const parameters of invalidCases) {
    assert.throws(() => validateParameters(parameters), PhysicsParameterError);
  }
});

test("computePhase1Acceleration applique la relation sans frottement", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.5,
    m2: 0.1,
    friction: 0,
    gravityMode: "earth",
  };

  closeTo(computePhase1Acceleration(parameters), (0.1 * 9.81) / 0.6);
});

test("computePhase1Acceleration tient compte du frottement", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.5,
    m2: 0.1,
    friction: 0.1,
    gravityMode: "earth",
  };

  const expected = (0.1 * 9.81 - 0.1 * 0.5 * 9.81) / 0.6;
  closeTo(computePhase1Acceleration(parameters), expected);
});

test("computePhase1Acceleration renvoie zéro si la force motrice est insuffisante", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 2,
    m2: 0.01,
    friction: 0.2,
  };

  assert.equal(computePhase1Acceleration(parameters), 0);
});

test("l'accélération sur la Lune est proportionnelle à g", () => {
  const earth = computePhase1Acceleration({
    ...DEFAULT_PARAMETERS,
    gravityMode: "earth",
  });
  const moon = computePhase1Acceleration({
    ...DEFAULT_PARAMETERS,
    gravityMode: "moon",
  });

  closeTo(moon / earth, GRAVITY.moon / GRAVITY.earth);
});

test("computePhase2Acceleration renvoie zéro sans frottement", () => {
  assert.equal(computePhase2Acceleration(DEFAULT_PARAMETERS, 1), 0);
});

test("computePhase2Acceleration renvoie -µg avec frottement", () => {
  const parameters = { ...DEFAULT_PARAMETERS, friction: 0.1 };
  closeTo(computePhase2Acceleration(parameters, 1), -0.981);
});

test("computePhase2Acceleration devient nulle lorsque le mobile est arrêté", () => {
  const parameters = { ...DEFAULT_PARAMETERS, friction: 0.1 };
  assert.equal(computePhase2Acceleration(parameters, 0), 0);
});

test("computePhase1EndVelocity respecte v² = 2ah", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.5,
    m2: 0.1,
    dropHeight: 0.8,
  };
  const acceleration = computePhase1Acceleration(parameters);
  const velocity = computePhase1EndVelocity(parameters);

  closeTo(velocity ** 2, 2 * acceleration * parameters.dropHeight);
});

test("timeToReachPosition résout un mouvement accéléré depuis le repos", () => {
  const time = timeToReachPosition({
    position: 0,
    velocity: 0,
    acceleration: 2,
    targetPosition: 1,
  });

  closeTo(time, 1);
});

test("timeToReachPosition traite le mouvement uniforme", () => {
  const time = timeToReachPosition({
    position: 0.5,
    velocity: 2,
    acceleration: 0,
    targetPosition: 1.5,
  });

  closeTo(time, 0.5);
});

test("timeToReachPosition renvoie Infinity pour une cible inaccessible", () => {
  const time = timeToReachPosition({
    position: 0,
    velocity: 0,
    acceleration: 0,
    targetPosition: 1,
  });

  assert.equal(time, Infinity);
});

test("timeToStop calcule exactement le temps d'arrêt", () => {
  closeTo(timeToStop(2, -0.5), 4);
  assert.equal(timeToStop(2, 0), Infinity);
  assert.equal(timeToStop(0, -0.5), 0);
});

test("integrateConstantAcceleration calcule position et vitesse exactement", () => {
  const result = integrateConstantAcceleration(1, 2, 3, 0.5);
  closeTo(result.position, 1 + 2 * 0.5 + 0.5 * 3 * 0.5 ** 2);
  closeTo(result.velocity, 2 + 3 * 0.5);
  assert.ok(Object.isFrozen(result));
});

test("createInitialState impose x0 = 0 et v0 = 0", () => {
  assert.deepEqual(createInitialState(DEFAULT_PARAMETERS), {
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0,
    phase: 1,
    status: "ready",
    endReason: null,
  });
});

test("advanceSimulation fait progresser correctement la phase 1", () => {
  const parameters = { ...DEFAULT_PARAMETERS, dropHeight: 1, trackLength: 2 };
  const initial = createInitialState(parameters);
  const dt = 0.2;
  const acceleration = computePhase1Acceleration(parameters);
  const next = advanceSimulation(initial, parameters, dt);

  closeTo(next.time, dt);
  closeTo(next.position, 0.5 * acceleration * dt ** 2);
  closeTo(next.velocity, acceleration * dt);
  closeTo(next.acceleration, acceleration);
  closeTo(next.hangingDisplacement, next.position);
  assert.equal(next.phase, 1);
  assert.equal(next.status, "running");
});

test("advanceSimulation traite exactement la transition phase 1 -> phase 2", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 1,
    m2: 1,
    dropHeight: 0.2,
    trackLength: 2,
    friction: 0,
  };
  const initial = createInitialState(parameters);
  const acceleration = computePhase1Acceleration(parameters);
  const transitionTime = Math.sqrt((2 * parameters.dropHeight) / acceleration);
  const transitionVelocity = acceleration * transitionTime;
  const dt = 0.5;
  const next = advanceSimulation(initial, parameters, dt);
  const expectedPosition =
    parameters.dropHeight + transitionVelocity * (dt - transitionTime);

  closeTo(next.time, dt);
  closeTo(next.position, expectedPosition);
  closeTo(next.velocity, transitionVelocity);
  assert.equal(next.acceleration, 0);
  assert.equal(next.phase, 2);
  closeTo(next.hangingDisplacement, parameters.dropHeight);
  assert.equal(next.status, "running");
});

test("advanceSimulation arrête exactement S1 par frottement en phase 2", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    friction: 0.1,
    trackLength: 3,
  };
  const state = {
    time: 1,
    position: 0.5,
    velocity: 1,
    acceleration: 0,
    hangingDisplacement: parameters.dropHeight,
    phase: 2,
    status: "running",
    endReason: null,
  };
  const deceleration = -parameters.friction * 9.81;
  const stopTime = -state.velocity / deceleration;
  const stopDistance =
    state.velocity * stopTime + 0.5 * deceleration * stopTime ** 2;
  const next = advanceSimulation(state, parameters, stopTime + 1);

  closeTo(next.time, state.time + stopTime);
  closeTo(next.position, state.position + stopDistance);
  assert.equal(next.velocity, 0);
  assert.equal(next.acceleration, 0);
  assert.equal(next.status, "finished");
  assert.equal(next.endReason, "friction-stop");
});

test("advanceSimulation arrête S1 exactement à la fin du banc", () => {
  const parameters = { ...DEFAULT_PARAMETERS, trackLength: 1 };
  const state = {
    time: 1,
    position: 0.9,
    velocity: 0.5,
    acceleration: 0,
    hangingDisplacement: parameters.dropHeight,
    phase: 2,
    status: "running",
    endReason: null,
  };
  const next = advanceSimulation(state, parameters, 1);

  closeTo(next.time, 1.2);
  assert.equal(next.position, 1);
  assert.equal(next.velocity, 0);
  assert.equal(next.acceleration, 0);
  assert.equal(next.status, "finished");
  assert.equal(next.endReason, "track-end");
});

test("advanceSimulation signale un système bloqué", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 2,
    m2: 0.01,
    friction: 0.2,
  };
  const initial = createInitialState(parameters);
  const next = advanceSimulation(initial, parameters, 1);

  assert.equal(next.time, 0);
  assert.equal(next.position, 0);
  assert.equal(next.velocity, 0);
  assert.equal(next.status, "blocked");
  assert.equal(next.endReason, "insufficient-driving-force");
});

test("advanceSimulation ne modifie jamais l'état fourni", () => {
  const parameters = DEFAULT_PARAMETERS;
  const initial = createInitialState(parameters);
  const snapshot = { ...initial };
  const next = advanceSimulation(initial, parameters, 0.1);

  assert.deepEqual(initial, snapshot);
  assert.notEqual(next, initial);
  assert.ok(Object.isFrozen(next));
});

test("advanceSimulation traite transition et fin du banc dans un grand pas", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 0.2,
    trackLength: 1,
    friction: 0,
  };
  const initial = createInitialState(parameters);
  const next = advanceSimulation(initial, parameters, 100);

  assert.equal(next.position, parameters.trackLength);
  assert.equal(next.velocity, 0);
  assert.equal(next.status, "finished");
  assert.equal(next.endReason, "track-end");
  assert.equal(next.phase, 2);
});

test("advanceSimulation refuse un pas de temps négatif", () => {
  assert.throws(
    () => advanceSimulation(createInitialState(), DEFAULT_PARAMETERS, -0.1),
    PhysicsParameterError,
  );
});
