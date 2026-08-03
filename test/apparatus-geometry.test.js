import test from "node:test";
import assert from "node:assert/strict";

import {
  APPARATUS_VIEWBOX,
  computeApparatusLayout,
  createDefaultSensors,
  createLinearScale,
} from "../src/apparatus-geometry.js";

const DEFAULTS = Object.freeze({
  m1: 1,
  m2: 0.2,
  dropHeight: 0.6,
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

test("le layout utilise le viewBox prévu et onze capteurs par défaut", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.deepEqual(layout.viewBox, APPARATUS_VIEWBOX);
  assert.equal(layout.sensorCount, 11);
  assert.equal(layout.sensors.length, 11);
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

test("l'indication de hauteur est placée à gauche de S2 et du personnage", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.heightGuide.x, layout.socle.x);
  assert.ok(layout.heightGuide.x > layout.massRack.x + layout.massRack.width);
});

test("le personnage pose la masse sur sa paume et sa chaussure droite sur le socle", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const scale = layout.person.height / 983;
  const palmCenterX = layout.person.holding.x + 80 * scale;

  assert.ok(Math.abs(palmCenterX - (layout.hangingMass.x + layout.hangingMass.width / 2)) < 1e-9);
  assert.ok(Math.abs(layout.person.anchors.palmTopY - (layout.hangingMass.y + layout.hangingMass.height)) < 1e-9);
  assert.ok(Math.abs(layout.person.anchors.rightShoeBottomY - layout.socle.y) < 1e-9);
  assert.ok(layout.person.anchors.leftShoeBottomY > layout.socle.y);
  assert.ok(
    layout.person.resting.x + layout.person.resting.width + layout.sceneOffset.x
      < layout.viewBox.width,
  );
  assert.ok(layout.socle.x + layout.socle.width <= layout.viewBox.width - 16);
});

test("le montage est décalé à gauche et la butée coïncide avec la fin de course de S1", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.ok(layout.sceneOffset.x < 0);
  assert.equal(layout.trackStop.contactX, layout.track.endX);
  assert.equal(layout.trackStop.y + layout.trackStop.height, layout.track.y + layout.track.height);
  assert.ok(layout.trackStop.height > layout.track.height);
  assert.ok(
    layout.person.holding.x + layout.person.holding.width + layout.sceneOffset.x
      <= layout.viewBox.width - 16,
  );
});

test("la masse suspendue est carrée à coins arrondis", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.hangingMass.width, layout.hangingMass.height);
  assert.equal(layout.heightGuide.topY, layout.hangingMass.y + layout.hangingMass.height);
  assert.equal(layout.heightGuide.bottomY, layout.socle.y);
});

test("les masses disponibles sont alignées sur un support à la hauteur du socle de S2", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.massRack.y, layout.socle.y);
  assert.deepEqual(
    layout.massRack.choices.map((choice) => choice.value),
    [0.2, 0.5, 1, 2],
  );
  assert.equal(layout.massRack.choices.filter((choice) => choice.selected).length, 1);
  assert.equal(layout.massRack.choices.find((choice) => choice.selected).value, 0.2);
  assert.ok(layout.massRack.choices.every(
    (choice) => choice.y + choice.height === layout.massRack.y,
  ));
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

test("la position maximale place le bord droit de S1 exactement à 2 m", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const finalLeftX = layout.mobile.x
    + layout.motionScale.maximumMobilePosition * layout.motionScale.pixelsPerMeter;

  assert.equal(layout.motionScale.maximumMobilePosition, 1.8);
  assert.ok(Math.abs(finalLeftX + layout.mobile.width - layout.track.endX) < 1e-9);
});

test("le viewBox reste adapté à la hauteur de chute fixe de 0,6 m", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(layout.viewBox.height, 620);
  assert.ok(layout.track.y < 300);
  assert.ok(layout.socle.y + 58 < layout.viewBox.height);
  assert.ok(layout.viewBox.height - (layout.socle.y + 58) < 40);
});


test("le banc est relevé de 0,1 m sans déplacer le socle en pixels", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const pixelsPerMeter = layout.motionScale.pixelsPerMeter;
  const formerTrackY = 252;
  const formerSocleY = 260 + layout.hangingMass.height + 0.5 * pixelsPerMeter;

  assert.ok(Math.abs(layout.track.y - (formerTrackY - 0.1 * pixelsPerMeter)) < 1e-9);
  assert.ok(Math.abs(layout.socle.y - formerSocleY) < 1e-9);
  assert.ok(Math.abs(layout.motionScale.verticalLift - 0.1 * pixelsPerMeter) < 1e-9);
});


test("le trait de règle à 0,6 m est identifié", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const highlighted = layout.ruler.ticks.filter((tick) => tick.isDropHeight);

  assert.equal(highlighted.length, 1);
  assert.equal(highlighted[0].position, 0.6);
});

test("S2 est initialement séparée de la poulie", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.ok(layout.hangingMass.y > layout.pulley.centerY + layout.pulley.radius);
});

test("la même échelle en pixels par mètre est utilisée horizontalement et verticalement", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const horizontalScale = layout.track.width / layout.parameters.trackLength;
  const verticalScale = (layout.socle.y - layout.hangingMass.y - layout.hangingMass.height)
    / layout.parameters.dropHeight;

  assert.equal(layout.motionScale.pixelsPerMeter, horizontalScale);
  assert.ok(Math.abs(verticalScale - horizontalScale) < 1e-9);
});


test("les cinq premiers capteurs sont uniformément espacés jusqu’à 0,6 m", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const positions = layout.sensors.map((sensor) => sensor.position);

  assert.deepEqual(
    positions,
    [0.12, 0.24, 0.36, 0.48, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8],
  );
  assert.deepEqual(
    positions.slice(0, 5).map((position, index, values) =>
      index === 0 ? position : Number((position - values[index - 1]).toFixed(12)),
    ),
    [0.12, 0.12, 0.12, 0.12, 0.12],
  );
});

test("les coordonnées des capteurs croissent strictement", () => {
  const layout = computeApparatusLayout(DEFAULTS);
  const coordinates = layout.sensors.map((sensor) => sensor.x);

  for (let index = 1; index < coordinates.length; index += 1) {
    assert.ok(coordinates[index] > coordinates[index - 1]);
  }
});

test("un nombre personnalisé de capteurs est accepté", () => {
  const layout = computeApparatusLayout({ ...DEFAULTS, sensorCount: 10 });

  assert.equal(layout.sensors.length, 10);
});

test("un nombre de capteurs hors plage est refusé", () => {
  assert.throws(
    () => computeApparatusLayout({ ...DEFAULTS, sensorCount: 17 }),
    /sensorCount/i,
  );
});

test("le support des masses est déplacé dans la zone centrale basse", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.ok(layout.massRack.x > 490);
  assert.ok(layout.massRack.x + layout.massRack.width < layout.socle.x);
  assert.equal(layout.massRack.y, layout.socle.y);
});

test("les objets structurants du layout sont gelés", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  assert.equal(Object.isFrozen(layout), true);
  assert.equal(Object.isFrozen(layout.track), true);
  assert.equal(Object.isFrozen(layout.sensors), true);
  assert.equal(Object.isFrozen(layout.sensors[0]), true);
});

test("les faisceaux des capteurs utilisent exactement le repère physique x", () => {
  const layout = computeApparatusLayout(DEFAULTS);

  for (const sensor of layout.sensors) {
    const expectedX = layout.mobile.x
      + sensor.position * layout.motionScale.pixelsPerMeter;
    assert.ok(Math.abs(sensor.x - expectedX) < 1e-10);
  }
});
