import test from "node:test";
import assert from "node:assert/strict";

import {
  APPARATUS_VIEWBOX,
  computeApparatusLayout,
  createDefaultSensors,
  createLinearScale,
} from "../src/apparatus-geometry.js";

const DEFAULTS = Object.freeze({
  m1: 0.5,
  m2: 0.1,
  dropHeight: 0.5,
  trackLength: 2,
  friction: 0,
  gravityMode: "earth",
});

test("huit capteurs sont répartis selon x_i = iL/9", () => {
  const sensors = createDefaultSensors(2, 8);

  assert.equal(sensors.length, 8);
  assert.equal(sensors[0].position, 2 / 9);
  assert.equal(sensors[7].position, 16 / 9);
  assert.equal(sensors[0].ratio, 1 / 9);
  assert.equal(sensors[7].ratio, 8 / 9);
});

test("les capteurs excluent les deux extrémités du banc", () => {
  const sensors = createDefaultSensors(3, 8);

  assert.ok(sensors.every((sensor) => sensor.position > 0));
  assert.ok(sensors.every((sensor) => sensor.position < 3));
});

test("la conversion affine respecte les bornes et le milieu", () => {
  const scale = createLinearScale(0, 2, 100, 900);

  assert.equal(scale(0), 100);
  assert.equal(scale(1), 500);
  assert.equal(scale(2), 900);
});

test("un domaine nul est refusé", () => {
  assert.throws(() => createLinearScale(1, 1, 0, 100), /domaine/i);
});

test("le layout utilise le viewBox prévu et huit capteurs par défaut", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.deepEqual(layout.viewBox, APPARATUS_VIEWBOX);
  assert.equal(layout.sensorCount, 8);
  assert.equal(layout.sensors.length, 8);
  assert.equal(layout.mobile.x, layout.track.x);
  assert.equal(layout.string.endY, layout.hangingMass.y);
});

test("la corde est horizontale avant la poulie puis verticale après un quart de tour", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.pulley.radius, 20);
  assert.equal(layout.string.startY, layout.pulley.centerY - layout.pulley.radius);
  assert.equal(layout.string.pulleyEntryX, layout.pulley.centerX);
  assert.equal(layout.string.pulleyEntryY, layout.pulley.centerY - layout.pulley.radius);
  assert.equal(layout.string.pulleyExitX, layout.pulley.centerX + layout.pulley.radius);
  assert.equal(layout.string.pulleyExitY, layout.pulley.centerY);
  assert.equal(layout.string.endX, layout.string.pulleyExitX);
});

test("l'indication de hauteur est placée à droite du socle", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.ok(layout.heightGuide.x > layout.socle.x + layout.socle.width);
});

test("la masse suspendue est carrée à coins arrondis", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.hangingMass.width, layout.hangingMass.height);
  assert.equal(layout.heightGuide.topY, layout.hangingMass.y + layout.hangingMass.height);
  assert.equal(layout.heightGuide.bottomY, layout.socle.y);
});

test("S1 et S2 ont la même géométrie carrée et le fil est attaché au centre de S1", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.mobile.width, layout.mobile.height);
  assert.equal(layout.mobile.width, layout.hangingMass.width);
  assert.equal(layout.mobile.height, layout.hangingMass.height);
  assert.equal(layout.mobile.attachY, layout.mobile.y + layout.mobile.height / 2);
  assert.equal(layout.string.startY, layout.mobile.attachY);
  assert.equal(layout.pulley.centerY - layout.pulley.radius, layout.string.startY);
});

test("le montage est remonté dans le viewBox", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.viewBox.height, 500);
  assert.ok(layout.track.y < 300);
  assert.ok(layout.socle.y < 450);
});

test("les coordonnées des capteurs croissent strictement", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const coordinates = layout.sensors.map((sensor) => sensor.x);

  for (let index = 1; index < coordinates.length; index += 1) {
    assert.ok(coordinates[index] > coordinates[index - 1]);
  }
});

test("un nombre personnalisé de capteurs est accepté", () => {
  const layout = computeApparatusLayout({ ...DEFAULTS, sensorCount: 12 });

  assert.equal(layout.sensors.length, 12);
});

test("un nombre de capteurs hors plage est refusé", () => {
  assert.throws(
    () => computeApparatusLayout({ ...DEFAULTS, sensorCount: 17 }),
    /sensorCount/i,
  );
});

test("les objets structurants du layout sont gelés", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(Object.isFrozen(layout), true);
  assert.equal(Object.isFrozen(layout.track), true);
  assert.equal(Object.isFrozen(layout.sensors), true);
  assert.equal(Object.isFrozen(layout.sensors[0]), true);
});
