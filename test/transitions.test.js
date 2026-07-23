import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_PARAMETERS } from "../src/constants.js";
import {
  PhysicsParameterError,
  computePhase1Acceleration,
  computePhase2Acceleration,
  createInitialState,
  getMaximumMobilePosition,
} from "../src/physics.js";
import {
  PHYSICAL_EVENT,
  advanceSimulation,
  advanceSimulationWithEvents,
  advanceToPhysicalEvent,
  advanceWithinCurrentPhase,
  getNextPhysicalEvent,
} from "../src/transitions.js";

const closeTo = (actual, expected, tolerance = 1e-10) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Valeur obtenue ${actual}, valeur attendue ${expected}, tolérance ${tolerance}`,
  );
};

function phase2State(parameters, overrides = {}) {
  return {
    time: 1,
    position: parameters.dropHeight,
    velocity: 1,
    acceleration: 0,
    hangingDisplacement: parameters.dropHeight,
    phase: 2,
    status: "running",
    endReason: null,
    ...overrides,
  };
}

test("getNextPhysicalEvent détermine exactement la transition vers la phase 2", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 1,
    m2: 1,
    dropHeight: 0.2,
    trackLength: 2,
    friction: 0,
  };
  const acceleration = computePhase1Acceleration(parameters);
  const expectedTime = Math.sqrt((2 * parameters.dropHeight) / acceleration);
  const event = getNextPhysicalEvent(createInitialState(parameters), parameters);

  assert.equal(event.type, PHYSICAL_EVENT.PHASE_CHANGE);
  closeTo(event.time, expectedTime);
  assert.ok(Object.isFrozen(event));
});

test("advanceToPhysicalEvent conserve la vitesse lors du changement de phase", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 1,
    m2: 1,
    dropHeight: 0.2,
    trackLength: 2,
    friction: 0.1,
  };
  const initial = createInitialState(parameters);
  const event = getNextPhysicalEvent(initial, parameters);
  const result = advanceToPhysicalEvent(initial, parameters, event);
  const expectedVelocity = Math.sqrt(
    2 * computePhase1Acceleration(parameters) * parameters.dropHeight,
  );

  assert.equal(result.event.type, PHYSICAL_EVENT.PHASE_CHANGE);
  closeTo(result.state.position, parameters.dropHeight);
  closeTo(result.state.velocity, expectedVelocity);
  closeTo(result.event.velocity, expectedVelocity);
  closeTo(
    result.state.acceleration,
    computePhase2Acceleration(parameters, expectedVelocity),
  );
  assert.equal(result.state.phase, 2);
  assert.equal(result.state.hangingDisplacement, parameters.dropHeight);
});

test("un changement de phase placé exactement en fin de pas met déjà l'accélération de phase 2", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 1,
    m2: 1,
    dropHeight: 0.2,
    trackLength: 2,
    friction: 0.1,
  };
  const initial = createInitialState(parameters);
  const transition = getNextPhysicalEvent(initial, parameters);
  const result = advanceSimulationWithEvents(initial, parameters, transition.time);

  assert.equal(result.state.phase, 2);
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].type, PHYSICAL_EVENT.PHASE_CHANGE);
  closeTo(
    result.state.acceleration,
    computePhase2Acceleration(parameters, result.state.velocity),
  );
});

test("advanceSimulation traite le temps restant après la transition", () => {
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
  const dt = transitionTime + 0.3;
  const next = advanceSimulation(initial, parameters, dt);

  closeTo(next.time, dt);
  closeTo(next.position, parameters.dropHeight + transitionVelocity * 0.3);
  closeTo(next.velocity, transitionVelocity);
  assert.equal(next.phase, 2);
  assert.equal(next.acceleration, 0);
});

test("un grand pas peut produire une transition puis un arrêt par frottement", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.5,
    m2: 0.2,
    dropHeight: 0.2,
    trackLength: 3,
    friction: 0.1,
  };
  const result = advanceSimulationWithEvents(
    createInitialState(parameters),
    parameters,
    100,
  );

  assert.deepEqual(
    result.events.map((event) => event.type),
    [PHYSICAL_EVENT.PHASE_CHANGE, PHYSICAL_EVENT.FRICTION_STOP],
  );
  assert.equal(result.state.status, "finished");
  assert.equal(result.state.endReason, "friction-stop");
  assert.equal(result.state.velocity, 0);
});

test("un grand pas peut produire une transition puis la fin du banc", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 0.2,
    trackLength: 1,
    friction: 0,
  };
  const result = advanceSimulationWithEvents(
    createInitialState(parameters),
    parameters,
    100,
  );

  assert.deepEqual(
    result.events.map((event) => event.type),
    [PHYSICAL_EVENT.PHASE_CHANGE, PHYSICAL_EVENT.TRACK_END],
  );
  assert.equal(result.state.position, getMaximumMobilePosition(parameters));
  assert.equal(result.state.velocity, 0);
  assert.equal(result.state.endReason, "track-end");
});

test("la fin du banc est prioritaire si elle coïncide avec la fin de chute", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    dropHeight: 1,
    trackLength: 1,
    friction: 0,
  };
  const event = getNextPhysicalEvent(createInitialState(parameters), parameters);
  assert.equal(event.type, PHYSICAL_EVENT.TRACK_END);

  const result = advanceSimulationWithEvents(
    createInitialState(parameters),
    parameters,
    100,
  );
  assert.deepEqual(result.events.map((item) => item.type), [PHYSICAL_EVENT.TRACK_END]);
  assert.equal(result.state.phase, 1);
  assert.equal(result.state.status, "finished");
});

test("la fin du banc est prioritaire si elle coïncide avec l'arrêt par frottement", () => {
  const parameters = { ...DEFAULT_PARAMETERS, friction: 0.1, trackLength: 2 };
  const acceleration = -parameters.friction * 9.81;
  const velocity = 1;
  const stoppingDistance = -(velocity ** 2) / (2 * acceleration);
  const state = phase2State(parameters, {
    position: getMaximumMobilePosition(parameters) - stoppingDistance,
    velocity,
  });
  const event = getNextPhysicalEvent(state, parameters);

  assert.equal(event.type, PHYSICAL_EVENT.TRACK_END);
  const result = advanceToPhysicalEvent(state, parameters, event);
  assert.equal(result.state.endReason, "track-end");
});

test("la transition est traitée immédiatement si un état de phase 1 est déjà à h", () => {
  const parameters = DEFAULT_PARAMETERS;
  const state = {
    time: 1,
    position: parameters.dropHeight,
    velocity: 0.8,
    acceleration: computePhase1Acceleration(parameters),
    hangingDisplacement: parameters.dropHeight,
    phase: 1,
    status: "running",
    endReason: null,
  };
  const result = advanceSimulationWithEvents(state, parameters, 0.1);

  assert.equal(result.events[0].type, PHYSICAL_EVENT.PHASE_CHANGE);
  closeTo(result.events[0].time, state.time);
  assert.equal(result.state.phase, 2);
  assert.ok(result.state.time > state.time);
});

test("le système bloqué produit un événement à t = 0", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 2,
    m2: 0.1,
    friction: 0.2,
  };
  const result = advanceSimulationWithEvents(
    createInitialState(parameters),
    parameters,
    1,
  );

  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].type, PHYSICAL_EVENT.BLOCKED);
  assert.equal(result.events[0].time, 0);
  assert.equal(result.state.time, 0);
  assert.equal(result.state.status, "blocked");
});

test("l'arrêt par frottement est localisé exactement", () => {
  const parameters = { ...DEFAULT_PARAMETERS, friction: 0.1, trackLength: 3 };
  const state = phase2State(parameters, { position: 0.5, velocity: 1 });
  const acceleration = -parameters.friction * 9.81;
  const stopTime = -state.velocity / acceleration;
  const stopDistance =
    state.velocity * stopTime + 0.5 * acceleration * stopTime ** 2;
  const result = advanceSimulationWithEvents(state, parameters, stopTime + 1);

  closeTo(result.state.time, state.time + stopTime);
  closeTo(result.state.position, state.position + stopDistance);
  assert.equal(result.state.velocity, 0);
  assert.equal(result.events.at(-1).type, PHYSICAL_EVENT.FRICTION_STOP);
});

test("la fin du banc est localisée exactement en mouvement uniforme", () => {
  const parameters = { ...DEFAULT_PARAMETERS, friction: 0, trackLength: 1 };
  const state = phase2State(parameters, { position: 0.7, velocity: 0.5 });
  const result = advanceSimulationWithEvents(state, parameters, 1);

  closeTo(result.state.time, 1.2);
  assert.equal(result.state.position, getMaximumMobilePosition(parameters));
  assert.equal(result.state.velocity, 0);
  assert.equal(result.events[0].type, PHYSICAL_EVENT.TRACK_END);
});

test("le résultat est invariant entre un grand pas et des pas fractionnés", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.7,
    m2: 0.3,
    dropHeight: 0.4,
    trackLength: 3,
    friction: 0.03,
  };
  const initial = createInitialState(parameters);
  const large = advanceSimulation(initial, parameters, 1.2);

  let split = initial;
  for (let index = 0; index < 120; index += 1) {
    split = advanceSimulation(split, parameters, 0.01);
  }

  closeTo(split.time, large.time, 1e-9);
  closeTo(split.position, large.position, 1e-9);
  closeTo(split.velocity, large.velocity, 1e-9);
  assert.equal(split.phase, large.phase);
  assert.equal(split.status, large.status);
});

test("les événements sont horodatés dans l'ordre et sont immuables", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 0.2,
    trackLength: 1,
    friction: 0,
  };
  const result = advanceSimulationWithEvents(
    createInitialState(parameters),
    parameters,
    100,
  );

  assert.ok(result.events[0].time < result.events[1].time);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.events));
  assert.ok(Object.isFrozen(result.events[0]));
});

test("advanceWithinCurrentPhase ne change jamais la phase", () => {
  const parameters = DEFAULT_PARAMETERS;
  const initial = createInitialState(parameters);
  const next = advanceWithinCurrentPhase(initial, parameters, 0.1);

  assert.equal(next.phase, initial.phase);
  assert.ok(next.position > initial.position);
});

test("advanceSimulation ne modifie pas l'état fourni", () => {
  const initial = createInitialState(DEFAULT_PARAMETERS);
  const snapshot = { ...initial };
  const next = advanceSimulation(initial, DEFAULT_PARAMETERS, 0.1);

  assert.deepEqual(initial, snapshot);
  assert.notEqual(next, initial);
  assert.ok(Object.isFrozen(next));
});

test("advanceSimulation refuse un pas de temps négatif", () => {
  assert.throws(
    () => advanceSimulation(createInitialState(), DEFAULT_PARAMETERS, -0.1),
    PhysicsParameterError,
  );
});
