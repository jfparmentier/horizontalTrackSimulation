import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PARAMETERS,
  PhysicsParameterError,
  computePhase1Acceleration,
  computePhase1EndVelocity,
  computePhase2Acceleration,
  createInitialState,
  getGravity,
  getMaximumMobilePosition,
  integrateConstantAcceleration,
  timeToReachPosition,
  timeToStop,
  validateParameters,
  validateSimulationState,
} from "../src/index.js";

const closeTo = (actual, expected, tolerance = 1e-10) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Valeur obtenue ${actual}, valeur attendue ${expected}, tolérance ${tolerance}`,
  );
};

test("getGravity retourne la gravité terrestre", () => {
  assert.equal(getGravity("earth"), 9.81);
});

test("getGravity refuse tout autre milieu", () => {
  assert.throws(() => getGravity("moon"), PhysicsParameterError);
  assert.throws(() => getGravity("mars"), PhysicsParameterError);
});

test("validateParameters accepte les paramètres par défaut et retourne une copie figée", () => {
  const result = validateParameters(DEFAULT_PARAMETERS);
  assert.deepEqual(result, DEFAULT_PARAMETERS);
  assert.notEqual(result, DEFAULT_PARAMETERS);
  assert.ok(Object.isFrozen(result));
});

test("validateParameters accepte les bornes définies", () => {
  assert.doesNotThrow(() =>
    validateParameters({
      m1: 0.1,
      m2: 0.1,
      dropHeight: 0.2,
      trackLength: 1,
      friction: 0,
      gravityMode: "earth",
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
    { ...DEFAULT_PARAMETERS, m2: 0 },
    { ...DEFAULT_PARAMETERS, m2: 0.15 },
    { ...DEFAULT_PARAMETERS, dropHeight: 0.19 },
    { ...DEFAULT_PARAMETERS, trackLength: 3.01 },
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
  };
  const expected = (0.1 * 9.81 - 0.1 * 0.5 * 9.81) / 0.6;
  closeTo(computePhase1Acceleration(parameters), expected);
});

test("computePhase1Acceleration renvoie zéro si la force motrice est insuffisante", () => {
  assert.equal(
    computePhase1Acceleration({
      ...DEFAULT_PARAMETERS,
      m1: 2,
      m2: 0.1,
      friction: 0.2,
    }),
    0,
  );
});

test("computePhase2Acceleration renvoie zéro sans frottement", () => {
  assert.equal(computePhase2Acceleration(DEFAULT_PARAMETERS, 1), 0);
});

test("computePhase2Acceleration renvoie -µg avec frottement", () => {
  closeTo(
    computePhase2Acceleration({ ...DEFAULT_PARAMETERS, friction: 0.1 }, 1),
    -0.981,
  );
});

test("computePhase1EndVelocity respecte v² = 2ah", () => {
  const parameters = { ...DEFAULT_PARAMETERS, dropHeight: 0.8 };
  const acceleration = computePhase1Acceleration(parameters);
  const velocity = computePhase1EndVelocity(parameters);
  closeTo(velocity ** 2, 2 * acceleration * parameters.dropHeight);
});

test("timeToReachPosition résout les mouvements accéléré et uniforme", () => {
  closeTo(
    timeToReachPosition({
      position: 0,
      velocity: 0,
      acceleration: 2,
      targetPosition: 1,
    }),
    1,
  );
  closeTo(
    timeToReachPosition({
      position: 0.5,
      velocity: 2,
      acceleration: 0,
      targetPosition: 1.5,
    }),
    0.5,
  );
});

test("timeToReachPosition renvoie Infinity pour une cible inaccessible", () => {
  assert.equal(
    timeToReachPosition({
      position: 0,
      velocity: 0,
      acceleration: 0,
      targetPosition: 1,
    }),
    Infinity,
  );
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

test("la position maximale de S1 tient compte de sa longueur de 0,2 m", () => {
  assert.equal(getMaximumMobilePosition(DEFAULT_PARAMETERS), 1.8);
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

test("validateSimulationState refuse un état situé hors du banc", () => {
  assert.throws(
    () =>
      validateSimulationState(
        { ...createInitialState(), position: getMaximumMobilePosition(DEFAULT_PARAMETERS) + 0.1 },
        DEFAULT_PARAMETERS,
      ),
    PhysicsParameterError,
  );
});
