import test from "node:test";
import assert from "node:assert/strict";

import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import {
  createSensorController,
  detectSensorCrossings,
} from "../src/sensor-controller.js";

const PARAMETERS = Object.freeze({
  m1: 0.5,
  m2: 0.1,
  dropHeight: 0.5,
  trackLength: 2,
  friction: 0,
  gravityMode: "earth",
  sensorCount: 8,
});

function state(position, overrides = {}) {
  return Object.freeze({
    time: 0,
    position,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: Math.min(position, 0.5),
    phase: position > 0.5 ? 2 : 1,
    status: "running",
    endReason: null,
    ...overrides,
  });
}

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

test("la détection retourne tous les capteurs franchis dans l'ordre", () => {
  const sensors = [
    { id: 1, position: 0.2 },
    { id: 2, position: 0.4 },
    { id: 3, position: 0.6 },
  ];

  const crossings = detectSensorCrossings(sensors, 0.1, 0.65);

  assert.deepEqual(crossings.map((item) => item.id), [1, 2, 3]);
  assert.equal(Object.isFrozen(crossings), true);
});

test("un capteur déjà déclenché n'est pas retourné une seconde fois", () => {
  const sensors = [
    { id: 1, position: 0.2 },
    { id: 2, position: 0.4 },
  ];

  const crossings = detectSensorCrossings(sensors, 0.1, 0.5, [1]);

  assert.deepEqual(crossings.map((item) => item.id), [2]);
});

test("un déplacement nul ou rétrograde ne déclenche aucun capteur", () => {
  const sensors = [{ id: 1, position: 0.2 }];

  assert.deepEqual(detectSensorCrossings(sensors, 0.2, 0.2), []);
  assert.deepEqual(detectSensorCrossings(sensors, 0.4, 0.1), []);
});

test("le contrôleur initialise les capteurs dans l'état idle", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const { svg, elements } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);

  for (const sensor of layout.sensors) {
    assert.equal(
      elements.get(`#sensor-${sensor.id}`).attributes.get("data-sensor-state"),
      "idle",
    );
  }

  assert.equal(controller.getSnapshot().triggeredCount, 0);
});

test("le capteur se déclenche lorsque le bord gauche de S1 traverse le faisceau", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const { svg, elements } = createFakeSvg(layout);
  const emitted = [];
  const controller = createSensorController(svg, layout, {
    onCrossings: (crossings) => emitted.push(...crossings),
  });

  controller.render(state(0), state(0), { reason: "initialization" });
  const firstSensor = layout.sensors[0];
  const mobileTravel = layout.track.width - layout.mobile.width;
  const crossingPosition = (
    (firstSensor.x - layout.mobile.x)
    / mobileTravel
  ) * layout.parameters.trackLength;

  // Le capteur ne doit pas réagir lorsque la coordonnée physique de S1 atteint
  // simplement celle du capteur : son bord gauche est encore avant le faisceau.
  const beforeCrossing = controller.render(
    state(firstSensor.position + 0.001),
    state(0),
  );
  assert.equal(beforeCrossing.triggeredCount, 0);

  const activeSnapshot = controller.render(
    state(crossingPosition),
    state(firstSensor.position + 0.001),
  );

  assert.equal(activeSnapshot.triggeredCount, 1);
  assert.deepEqual(activeSnapshot.activeIds, [1]);
  assert.equal(
    elements.get("#sensor-1").attributes.get("data-sensor-state"),
    "active",
  );
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].beamX, firstSensor.x);
  assert.equal(emitted[0].position, firstSensor.position);

  const triggeredSnapshot = controller.render(
    state(crossingPosition + 0.01),
    state(crossingPosition),
  );
  assert.deepEqual(triggeredSnapshot.activeIds, []);
  assert.equal(
    elements.get("#sensor-1").attributes.get("data-sensor-state"),
    "triggered",
  );
});

test("le déclenchement suit la position interpolée réellement affichée", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const { svg } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);
  const firstSensor = layout.sensors[0];
  const mobileTravel = layout.track.width - layout.mobile.width;
  const crossingPosition = (
    (firstSensor.x - layout.mobile.x)
    / mobileTravel
  ) * layout.parameters.trackLength;

  controller.render(state(0), state(0), { reason: "initialization" });

  // L'état physique courant a dépassé le capteur, mais l'interpolation à 25 %
  // affiche encore le bord gauche avant le faisceau.
  const notYet = controller.render(
    state(crossingPosition * 2),
    state(0),
    { running: true, interpolationAlpha: 0.25 },
  );
  assert.equal(notYet.triggeredCount, 0);

  const crossed = controller.render(
    state(crossingPosition * 2),
    state(0),
    { running: true, interpolationAlpha: 0.6 },
  );
  assert.equal(crossed.triggeredCount, 1);
});

test("un grand pas peut déclencher plusieurs capteurs", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const { svg } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);

  controller.render(state(0), state(0), { reason: "initialization" });
  const snapshot = controller.render(state(1.2), state(0));

  assert.ok(snapshot.crossings.length >= 4);
  assert.equal(snapshot.triggeredCount, snapshot.crossings.length);
});

test("la réinitialisation remet tous les capteurs à zéro", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const { svg, elements } = createFakeSvg(layout);
  const controller = createSensorController(svg, layout);

  controller.render(state(0), state(0), { reason: "initialization" });
  controller.render(state(1), state(0));
  const reset = controller.render(state(0, { status: "ready" }), state(1), { reason: "reset" });

  assert.equal(reset.triggeredCount, 0);
  for (const sensor of layout.sensors) {
    assert.equal(
      elements.get(`#sensor-${sensor.id}`).attributes.get("data-sensor-state"),
      "idle",
    );
  }
});

test("le contrôleur signale un élément SVG de capteur manquant", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const svg = { querySelector: () => null };

  assert.throws(() => createSensorController(svg, layout), /introuvable/);
});
