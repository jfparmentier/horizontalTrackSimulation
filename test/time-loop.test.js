import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PARAMETERS,
  PHYSICAL_EVENT,
  PLAYBACK_SPEED_LIMITS,
  PhysicsParameterError,
  createInitialState,
  createTimeLoop,
} from "../src/index.js";

class FakeAnimationScheduler {
  constructor() {
    this.callbacks = new Map();
    this.nextId = 1;
    this.now = 0;
  }

  requestFrame = (callback) => {
    const id = this.nextId;
    this.nextId += 1;
    this.callbacks.set(id, callback);
    return id;
  };

  cancelFrame = (id) => {
    this.callbacks.delete(id);
  };

  frameAt(timestamp) {
    this.now = timestamp;
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    for (const callback of callbacks) {
      callback(timestamp);
    }
  }

  advance(milliseconds) {
    this.frameAt(this.now + milliseconds);
  }

  get pendingCount() {
    return this.callbacks.size;
  }
}

function createHarness(overrides = {}) {
  const scheduler = new FakeAnimationScheduler();
  const renders = [];
  const eventBatches = [];
  const parameters = overrides.parameters ?? DEFAULT_PARAMETERS;
  const loop = createTimeLoop({
    parameters,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
    onRender: (state, previousState, meta) => {
      renders.push({ state, previousState, meta });
    },
    onEvents: (events, state) => {
      eventBatches.push({ events, state });
    },
    ...overrides,
  });

  return { scheduler, renders, eventBatches, loop, parameters };
}

function closeTo(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Valeur ${actual}, attendu ${expected} ± ${tolerance}`,
  );
}

test("la construction exige un ordonnanceur d'animation sous Node.js", () => {
  assert.throws(
    () => createTimeLoop({ parameters: DEFAULT_PARAMETERS }),
    /requestAnimationFrame/,
  );
});

test("la boucle produit un rendu initial sans avancer la physique", () => {
  const { loop, renders } = createHarness();
  assert.equal(renders.length, 1);
  assert.equal(renders[0].state.time, 0);
  assert.equal(renders[0].meta.running, false);
  assert.equal(loop.getDiagnostics().totalPhysicsSteps, 0);
});

test("start est idempotent et ne programme qu'une seule image", () => {
  const { loop, scheduler } = createHarness();
  assert.equal(loop.start(), true);
  assert.equal(loop.start(), false);
  assert.equal(scheduler.pendingCount, 1);
  assert.equal(loop.getState().status, "running");
});

test("la première image sert uniquement d'ancrage temporel", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  scheduler.frameAt(1000);
  assert.equal(loop.getState().time, 0);
  assert.equal(loop.getDiagnostics().totalPhysicsSteps, 0);
  assert.equal(scheduler.pendingCount, 1);
});

test("la durée murale est convertie en sous-pas physiques fixes", () => {
  const { loop, scheduler } = createHarness({ physicsStep: 0.002 });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(16);

  closeTo(loop.getState().time, 0.016);
  assert.equal(loop.getDiagnostics().totalPhysicsSteps, 8);
  closeTo(loop.getDiagnostics().accumulator, 0);
});

test("le reliquat inférieur au pas est conservé d'une image à l'autre", () => {
  const { loop, scheduler } = createHarness({ physicsStep: 0.002 });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(17);
  closeTo(loop.getState().time, 0.016);
  closeTo(loop.getDiagnostics().accumulator, 0.001);

  scheduler.frameAt(18);
  closeTo(loop.getState().time, 0.018);
  closeTo(loop.getDiagnostics().accumulator, 0);
});

test("le résultat est indépendant de la fréquence de rendu", () => {
  const first = createHarness({ physicsStep: 0.002 });
  const second = createHarness({ physicsStep: 0.002 });
  first.loop.start();
  second.loop.start();
  first.scheduler.frameAt(0);
  second.scheduler.frameAt(0);

  for (let time = 10; time <= 1000; time += 10) {
    first.scheduler.frameAt(time);
  }
  for (let time = 20; time <= 1000; time += 20) {
    second.scheduler.frameAt(time);
  }

  closeTo(first.loop.getState().time, second.loop.getState().time);
  closeTo(first.loop.getState().position, second.loop.getState().position, 1e-9);
  closeTo(first.loop.getState().velocity, second.loop.getState().velocity, 1e-9);
});

test("pause annule l'image programmée et fige l'état", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(20);
  const timeBeforePause = loop.getState().time;

  assert.equal(loop.pause(), true);
  assert.equal(loop.pause(), false);
  assert.equal(loop.getState().status, "paused");
  assert.equal(scheduler.pendingCount, 0);

  scheduler.frameAt(200);
  assert.equal(loop.getState().time, timeBeforePause);
});

test("reprendre après une pause n'intègre pas le temps écoulé pendant la pause", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(20);
  loop.pause();
  const before = loop.getState().time;

  scheduler.frameAt(5000);
  loop.start();
  scheduler.frameAt(5000);
  assert.equal(loop.getState().time, before);
  scheduler.frameAt(5020);
  closeTo(loop.getState().time, before + 0.02);
});

test("la vitesse de lecture multiplie le temps physique", () => {
  const { loop, scheduler } = createHarness({ playbackSpeed: 2 });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(20);
  closeTo(loop.getState().time, 0.04);
});

test("la vitesse de lecture peut être modifiée pendant l'exécution", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(20);
  loop.setPlaybackSpeed(0.5);
  scheduler.frameAt(40);
  closeTo(loop.getState().time, 0.03);
});

test("les vitesses de lecture hors limites sont refusées", () => {
  const { loop } = createHarness();
  assert.throws(
    () => loop.setPlaybackSpeed(PLAYBACK_SPEED_LIMITS.min / 2),
    PhysicsParameterError,
  );
  assert.throws(
    () => loop.setPlaybackSpeed(PLAYBACK_SPEED_LIMITS.max * 2),
    PhysicsParameterError,
  );
});

test("un long gel d'onglet est limité par maxWallDelta", () => {
  const { loop, scheduler, renders } = createHarness({ maxWallDelta: 0.1 });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(5000);
  closeTo(loop.getState().time, 0.1);
  const last = renders.at(-1);
  closeTo(last.meta.rawWallDelta, 5);
  closeTo(last.meta.wallDelta, 0.1);
});

test("la garde maxSubStepsPerFrame élimine proprement l'arriéré excessif", () => {
  const { loop, scheduler } = createHarness({
    physicsStep: 0.01,
    maxWallDelta: 1,
    maxSubStepsPerFrame: 3,
  });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(100);

  closeTo(loop.getState().time, 0.03);
  assert.equal(loop.getDiagnostics().totalPhysicsSteps, 3);
  closeTo(loop.getDiagnostics().droppedSimulationTime, 0.07);
  closeTo(loop.getDiagnostics().accumulator, 0);
});

test("le pas à pas consomme exactement la durée demandée", () => {
  const { loop } = createHarness({ physicsStep: 0.002 });
  const result = loop.step(0.05);
  closeTo(loop.getState().time, 0.05);
  assert.equal(result.steps, 25);
  assert.equal(loop.getState().status, "paused");
});

test("le pas à pas accepte une durée non multiple du pas physique", () => {
  const { loop } = createHarness({ physicsStep: 0.002 });
  const result = loop.step(0.005);
  closeTo(loop.getState().time, 0.005);
  assert.equal(result.steps, 3);
});

test("le pas à pas met automatiquement en pause une boucle active", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  assert.equal(scheduler.pendingCount, 1);
  loop.step(0.01);
  assert.equal(scheduler.pendingCount, 0);
  assert.equal(loop.getDiagnostics().running, false);
  assert.equal(loop.getState().status, "paused");
});

test("les événements de changement de phase sont regroupés et transmis", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 0.2,
    trackLength: 3,
    friction: 0,
  };
  const { loop, eventBatches } = createHarness({ parameters, physicsStep: 0.01 });
  loop.step(1);

  const events = eventBatches.flatMap((batch) => batch.events);
  assert.ok(events.some((event) => event.type === PHYSICAL_EVENT.PHASE_CHANGE));
  const transition = events.find((event) => event.type === PHYSICAL_EVENT.PHASE_CHANGE);
  closeTo(transition.position, parameters.dropHeight);
});

test("un état terminal arrête la programmation de nouvelles images", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 1,
    trackLength: 1,
    friction: 0,
  };
  const { loop, scheduler } = createHarness({ parameters, maxWallDelta: 1 });
  loop.start();
  scheduler.frameAt(0);
  scheduler.frameAt(1000);

  assert.equal(loop.getState().status, "finished");
  assert.equal(loop.getState().endReason, "track-end");
  assert.equal(loop.getDiagnostics().running, false);
  assert.equal(scheduler.pendingCount, 0);
});

test("start ne redémarre pas un état terminal", () => {
  const parameters = {
    ...DEFAULT_PARAMETERS,
    m1: 0.1,
    m2: 2,
    dropHeight: 1,
    trackLength: 1,
    friction: 0,
  };
  const { loop } = createHarness({ parameters, physicsStep: 0.01 });
  loop.step(2);
  assert.equal(loop.getState().status, "finished");
  assert.equal(loop.start(), false);
});

test("reset restaure x0, v0, le compteur et les paramètres", () => {
  const { loop } = createHarness();
  loop.step(0.1);
  const nextParameters = { ...DEFAULT_PARAMETERS, gravityMode: "moon", m2: 0.2 };
  loop.reset(nextParameters);

  assert.deepEqual(loop.getParameters(), nextParameters);
  assert.equal(loop.getState().time, 0);
  assert.equal(loop.getState().position, 0);
  assert.equal(loop.getState().velocity, 0);
  assert.equal(loop.getState().status, "ready");
  assert.equal(loop.getDiagnostics().totalPhysicsSteps, 0);
});

test("replaceState permet de reprendre depuis un état physique valide", () => {
  const { loop } = createHarness();
  const state = Object.freeze({
    ...createInitialState(DEFAULT_PARAMETERS),
    time: 0.5,
    position: 0.1,
    velocity: 0.4,
    acceleration: 1,
    hangingDisplacement: 0.1,
    status: "paused",
  });

  loop.replaceState(state);
  assert.deepEqual(loop.getState(), state);
  assert.equal(loop.getDiagnostics().accumulator, 0);
});

test("les états et métadonnées fournis au rendu sont immuables", () => {
  const { loop, renders } = createHarness();
  loop.step(0.01);
  const last = renders.at(-1);
  assert.equal(Object.isFrozen(last.state), true);
  assert.equal(Object.isFrozen(last.previousState), true);
  assert.equal(Object.isFrozen(last.meta), true);
});

test("un horodatage décroissant ne fait pas reculer le temps", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  scheduler.frameAt(100);
  scheduler.frameAt(80);
  assert.equal(loop.getState().time, 0);
  scheduler.frameAt(100);
  closeTo(loop.getState().time, 0.02);
});

test("destroy annule définitivement la boucle", () => {
  const { loop, scheduler } = createHarness();
  loop.start();
  assert.equal(loop.destroy(), true);
  assert.equal(loop.destroy(), false);
  assert.equal(scheduler.pendingCount, 0);
  assert.throws(() => loop.start(), /détruite/);
});

test("les options temporelles invalides sont refusées", () => {
  const scheduler = new FakeAnimationScheduler();
  const base = {
    parameters: DEFAULT_PARAMETERS,
    requestFrame: scheduler.requestFrame,
    cancelFrame: scheduler.cancelFrame,
  };

  assert.throws(() => createTimeLoop({ ...base, physicsStep: 0 }), PhysicsParameterError);
  assert.throws(
    () => createTimeLoop({ ...base, maxSubStepsPerFrame: 1.5 }),
    PhysicsParameterError,
  );
  assert.throws(
    () => createTimeLoop({ ...base, playbackSpeed: 100 }),
    PhysicsParameterError,
  );
});
