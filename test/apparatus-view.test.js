import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStaticApparatusSvg,
  mountStaticApparatus,
} from "../src/apparatus-view.js";

const DEFAULTS = Object.freeze({
  m1: 0.5,
  m2: 0.2,
  dropHeight: 0.6,
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
  assert.match(svg, /viewBox="0 0 1200 620"/);
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

  assert.match(svg, />0.6 m</);
  assert.match(svg, />1 kg</);
  assert.match(svg, />0.2 kg</);
  assert.doesNotMatch(svg, />S1</);
  assert.doesNotMatch(svg, />S2</);
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

test("le trait de règle correspondant à 0,6 m est marqué en bleu par une classe dédiée", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.equal((svg.match(/ruler-tick--drop-height/g) ?? []).length, 1);
  assert.match(svg, /class="ruler-tick ruler-tick--drop-height"[^>]+x1="349\.4"/);
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

  assert.match(svg, /<rect id="hanging-mass-body"[^>]+width="83\.8" height="83\.8" rx="14"/);
});

test("les quatre valeurs de masses sont représentées entre S2 et le support de rangement", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /id="layer-mass-rack"/);
  assert.equal(occurrenceCount(svg, 'data-role="mass-choice"'), 3);
  for (const value of ["0.5 kg", "1 kg", "2 kg"]) {
    assert.match(svg, new RegExp(`>${value.replace('.', '\.') }<`));
  }
  assert.match(svg, /<text[^>]*>0.2 kg<\/text>/);
  assert.match(svg, /id="mass-drop-target"/);
});

test("la masse actuellement suspendue quitte son emplacement du support", () => {
  const svg = buildStaticApparatusSvg({ ...DEFAULTS, m2: 0.5 });

  assert.doesNotMatch(svg, /data-role="mass-choice" data-mass-value="0.5"/);
  assert.match(svg, /data-role="mass-choice" data-mass-value="0.2"/);
  assert.match(svg, /<text class="object-label mass-value-label"[^>]*>0.5 kg<\/text>/);
});


test("les quatre masses utilisent des couleurs distinctes", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  for (const colorClass of [
    "mass-color--0-2",
    "mass-color--0-5",
    "mass-color--1",
    "mass-color--2",
  ]) {
    assert.match(svg, new RegExp(colorClass));
  }
  assert.match(svg, /id="layer-hanging-mass" class="mass-color--0-2"/);
  assert.match(svg, /id="mass-choice-0-5" class="mass-choice mass-color--0-5"/);
  assert.match(svg, /id="mass-choice-1" class="mass-choice mass-color--1"/);
  assert.match(svg, /id="mass-choice-2" class="mass-choice mass-color--2"/);
});

test("les pointes des flèches de hauteur coïncident avec les extrémités de la ligne", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /marker id="arrow-head"[^>]+refX="10" refY="5"/);
  assert.match(svg, /<line class="height-guide"[^>]+marker-start="url\(#arrow-head\)" marker-end="url\(#arrow-head\)"/);
});


test("le support d'arrêt de S2 ne contient que le rectangle supérieur", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  const socleLayer = svg.match(/<g id="layer-socle"[\s\S]*?<\/g>/)?.[0] ?? "";
  assert.match(socleLayer, /<rect class="socle-top"/);
  assert.doesNotMatch(socleLayer, /<path|socle-base/);
});

test("S1 est rendu comme un carré arrondi de même taille que S2", () => {
  const svg = buildStaticApparatusSvg(DEFAULTS);

  assert.match(svg, /<rect id="mobile-body"[^>]+width="83\.8" height="83\.8" rx="18"/);
  assert.match(svg, /<circle class="mobile-port" cx="83\.8" cy="41\.9" r="5"/);
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
