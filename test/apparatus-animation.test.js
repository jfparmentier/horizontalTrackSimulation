import test from "node:test";
import assert from "node:assert/strict";

import { computeApparatusLayout } from "../src/apparatus-geometry.js";
import {
  computeAnimatedApparatusFrame,
  createApparatusAnimator,
} from "../src/apparatus-animation.js";

const PARAMETERS = Object.freeze({
  m1: 0.5,
  m2: 0.2,
  dropHeight: 0.5,
  trackLength: 2,
  friction: 0,
  gravityMode: "earth",
  sensorCount: 8,
});

function state(overrides = {}) {
  return Object.freeze({
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0,
    phase: 1,
    status: "ready",
    endReason: null,
    ...overrides,
  });
}

function closeTo(actual, expected, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} attendu ${expected} ± ${tolerance}`,
  );
}

test("la position initiale conserve les coordonnées statiques", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const frame = computeAnimatedApparatusFrame(layout, state());

  closeTo(frame.mobileX, layout.mobile.x);
  closeTo(frame.mobileY, layout.mobile.y);
  closeTo(frame.hangingMassY, layout.hangingMass.y);
  assert.equal(frame.slack, false);
});

test("le bord droit de S1 atteint l’extrémité du banc à la position maximale", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const frame = computeAnimatedApparatusFrame(
    layout,
    state({ position: layout.motionScale.maximumMobilePosition, phase: 2, hangingDisplacement: 0.5 }),
  );

  closeTo(frame.mobileX + layout.mobile.width, layout.track.endX);
});

test("S2 atteint exactement le haut du support pour une chute h", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const frame = computeAnimatedApparatusFrame(
    layout,
    state({ position: 0.5, hangingDisplacement: 0.5, phase: 2 }),
  );

  closeTo(frame.hangingMassY + layout.hangingMass.height, layout.socle.y);
});

test("S1 et S2 parcourent exactement la même distance graphique durant la phase 1", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const frame = computeAnimatedApparatusFrame(
    layout,
    state({ position: 0.25, hangingDisplacement: 0.25 }),
  );

  const horizontalPixels = frame.mobileX - layout.mobile.x;
  const verticalPixels = frame.hangingMassY - layout.hangingMass.y;

  closeTo(horizontalPixels, verticalPixels);
  closeTo(horizontalPixels, 0.25 * layout.motionScale.pixelsPerMeter);
});

test("l'interpolation produit une position intermédiaire", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const previous = state({ position: 0.2, hangingDisplacement: 0.2 });
  const current = state({ position: 0.4, hangingDisplacement: 0.4 });
  const frame = computeAnimatedApparatusFrame(layout, current, previous, 0.5);

  closeTo(frame.position, 0.3);
  closeTo(frame.hangingDisplacement, 0.3);
});

test("le fil est rectiligne en phase 1 et s'incurve en phase 2", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const taut = computeAnimatedApparatusFrame(
    layout,
    state({ position: 0.25, hangingDisplacement: 0.25 }),
  );
  const slack = computeAnimatedApparatusFrame(
    layout,
    state({ position: 1, hangingDisplacement: 0.5, phase: 2 }),
  );

  assert.match(taut.ropePath, /\n\s+L /);
  assert.doesNotMatch(taut.ropePath, /\n\s+C /);
  assert.match(slack.ropePath, /\n\s+C /);
  assert.equal(slack.slack, true);
});

test("la longueur de la portion détendue reste quasi constante pendant la phase 2", () => {
  const layout = computeApparatusLayout(PARAMETERS);
  const shortlyAfterContact = computeAnimatedApparatusFrame(
    layout,
    state({ position: 0.65, hangingDisplacement: 0.5, phase: 2 }),
  );
  const nearTrackEnd = computeAnimatedApparatusFrame(
    layout,
    state({
      position: layout.motionScale.maximumMobilePosition,
      hangingDisplacement: 0.5,
      phase: 2,
    }),
  );

  assert.ok(shortlyAfterContact.slackCurveLength > 0);
  closeTo(
    nearTrackEnd.slackCurveLength,
    shortlyAfterContact.slackCurveLength,
    0.05,
  );
});

test("l'animateur modifie les trois éléments SVG ciblés", () => {
  class FakeElement {
    constructor() {
      this.attributes = new Map();
      this.textContent = "";
    }
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }
  }

  const elements = {
    "#layer-mobile": new FakeElement(),
    "#layer-hanging-mass": new FakeElement(),
    "#string-path": new FakeElement(),
    "#apparatus-description": new FakeElement(),
  };
  const svg = new FakeElement();
  svg.querySelector = (selector) => elements[selector] ?? null;

  const layout = computeApparatusLayout(PARAMETERS);
  const animator = createApparatusAnimator(svg, layout);
  const frame = animator.render(
    state({ position: 1, hangingDisplacement: 0.5, phase: 2, status: "running" }),
  );

  assert.match(elements["#layer-mobile"].attributes.get("transform"), /^translate\(/);
  assert.match(elements["#layer-hanging-mass"].attributes.get("transform"), /^translate\(/);
  assert.equal(elements["#string-path"].attributes.get("d"), frame.ropePath);
  assert.equal(elements["#string-path"].attributes.get("data-tension"), "slack");
  assert.equal(svg.attributes.get("data-phase"), "2");
});

test("un état terminal est affiché exactement même avec une interpolation nulle", () => {
  class FakeElement {
    constructor() {
      this.attributes = new Map();
      this.textContent = "";
    }
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }
  }

  const elements = {
    "#layer-mobile": new FakeElement(),
    "#layer-hanging-mass": new FakeElement(),
    "#string-path": new FakeElement(),
    "#apparatus-description": new FakeElement(),
  };
  const svg = new FakeElement();
  svg.querySelector = (selector) => elements[selector] ?? null;

  const layout = computeApparatusLayout(PARAMETERS);
  const animator = createApparatusAnimator(svg, layout);
  const maximum = layout.motionScale.maximumMobilePosition;
  const previous = state({ position: maximum - 0.1, hangingDisplacement: 0.5, phase: 2, status: "running" });
  const current = state({ position: maximum, hangingDisplacement: 0.5, phase: 2, status: "finished", endReason: "track-end" });
  const frame = animator.render(current, previous, { interpolationAlpha: 0, running: false });

  closeTo(frame.position, maximum);
  closeTo(frame.mobileX + layout.mobile.width, layout.track.endX);
});

test("l'animateur signale les éléments SVG manquants", () => {
  const svg = { querySelector: () => null };
  const layout = computeApparatusLayout(PARAMETERS);

  assert.throws(() => createApparatusAnimator(svg, layout), /introuvable/);
});
