import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStaticApparatusSvg,
  mountStaticApparatus,
} from "../src/apparatus-view.js";

const DEFAULTS = Object.freeze({
  m1: 0.5,
  m2: 0.1,
  dropHeight: 0.5,
  trackLength: 2,
  friction: 0,
  gravityMode: "earth",
  sensorCount: 8,
});

function occurrenceCount(text, fragment) {
  return text.split(fragment).length - 1;
}

test("le SVG possède un viewBox, un titre et une description accessibles", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /^<svg[^>]+id="apparatus-svg"/);
  assert.match(svg, /viewBox="0 0 1200 500"/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-labelledby="apparatus-title apparatus-description"/);
  assert.match(svg, /<title id="apparatus-title">/);
  assert.match(svg, /<desc id="apparatus-description">/);
});

test("le montage comprend exactement huit capteurs par défaut", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.equal(occurrenceCount(svg, 'data-role="sensor"'), 8);
  assert.match(svg, /id="sensor-1"/);
  assert.match(svg, /id="sensor-8"/);
});

test("les éléments destinés à l'animation disposent d'identifiants stables", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  for (const required of [
    'id="layer-mobile"',
    'id="mobile-body"',
    'id="layer-hanging-mass"',
    'id="hanging-mass-body"',
    'id="string-path"',
  ]) {
    assert.ok(svg.includes(required), `${required} doit être présent`);
  }
});

test("le SVG affiche seulement les indications souhaitées", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, />0.5 m</);
  assert.doesNotMatch(svg, /gravity-badge|>Gravité<|>Terre</);
  assert.doesNotMatch(svg, /m₁ =/);
  assert.doesNotMatch(svg, />0,1 kg</);
  assert.doesNotMatch(svg, /L = 2 m/);
  assert.doesNotMatch(svg, />socle</i);
  assert.doesNotMatch(svg, /9,81 m·s⁻²/);
  assert.doesNotMatch(svg, /Phase 1 — prête/);
  assert.doesNotMatch(svg, /Montage initial · fil tendu · mesures masquées/);
  assert.doesNotMatch(svg, /x = 0/);
  assert.doesNotMatch(svg, /h =/);
  assert.doesNotMatch(svg, /scene-horizon/);
});

test("la poulie, son support et la corde respectent la nouvelle géométrie", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /<circle class="pulley-wheel"[^>]+r="20"/);
  assert.match(svg, /<line class="pulley-support"/);
  assert.match(svg, /A 20 20 0 0 1/);
});

test("les capteurs n'affichent ni cadre ni base", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.doesNotMatch(svg, /sensor-frame/);
  assert.doesNotMatch(svg, /sensor-base/);
});

test("la masse suspendue est rendue comme un carré arrondi", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /<rect id="hanging-mass-body"[^>]+width="76" height="76" rx="14"/);
});

test("S1 est rendu comme un carré arrondi de même taille que S2", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /<rect id="mobile-body"[^>]+width="76" height="76" rx="18"/);
  assert.match(svg, /<circle class="mobile-port" cx="76" cy="38" r="5"/);
});

test("aucun vecteur de force, vitesse ou accélération n'est dessiné", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.doesNotMatch(svg, /force-vector|velocity-vector|acceleration-vector/);
});

test("mountStaticApparatus injecte le SVG dans le conteneur", () => {
  const fakeSvg = { id: "apparatus-svg" };
  const container = {
    innerHTML: "",
    querySelector(selector) {
      return selector === "#apparatus-svg" ? fakeSvg : null;
    },
  };

  const mounted = mountStaticApparatus(container, DEFAULTS);

  assert.match(container.innerHTML, /^<svg/);
  assert.equal(mounted, fakeSvg);
});

test("mountStaticApparatus refuse un conteneur invalide", () => {
  assert.throws(() => mountStaticApparatus(null, DEFAULTS), /conteneur DOM/i);
});
