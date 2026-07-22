import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("le cadran inférieur n’affiche plus la position", () => {
  assert.doesNotMatch(html, /id="position-value"/);
  assert.doesNotMatch(html, /<dt>Position<\/dt>/);
});

test("le bouton d’export est une icône accessible sans texte visible", () => {
  assert.match(html, /id="download-data-button"[^>]+aria-label="Télécharger les données des capteurs"/);
  assert.match(html, /class="fa-solid fa-download download-icon"/);
  assert.doesNotMatch(html, />Télécharger les données<\/button>/);
});

test("le temps précède immédiatement le bouton d’export dans la zone de lecture", () => {
  const section = html.match(/<div class="readout-actions">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ?? "";
  assert.ok(section.indexOf('id="time-value"') >= 0);
  assert.ok(section.indexOf('id="download-data-button"') > section.indexOf('id="time-value"'));
});


test("la gravité terrestre est fixe et aucun sélecteur ni badge n'est affiché", () => {
  assert.doesNotMatch(html, /id="gravity-earth"/);
  assert.doesNotMatch(html, /id="gravity-moon"/);
  assert.doesNotMatch(html, /class="gravity-badge"/);
});

test("aucun message d'état n'est affiché sous les commandes", () => {
  assert.doesNotMatch(html, /id="control-status"/);
  assert.doesNotMatch(html, /Simulation prête\.|Simulation terminée|Simulation en cours\.|Simulation en pause\./);
});


test("la longueur du banc est fixée à 2 m et ne possède aucun contrôle", () => {
  assert.doesNotMatch(html, /id="track-length-range"/);
  assert.doesNotMatch(html, /id="track-length-number"/);
  assert.doesNotMatch(html, />Longueur du banc</);
});


test("la masse de S1, la hauteur et les neuf capteurs sont fixes sans contrôles", () => {
  for (const id of [
    "m1-range", "m1-number",
    "drop-height-range", "drop-height-number",
    "sensor-count-range", "sensor-count-number",
  ]) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, />Masse du mobile S1</);
  assert.doesNotMatch(html, />Hauteur de chute</);
  assert.doesNotMatch(html, />Nombre de capteurs</);
});

test("le curseur de vitesse de lecture est à droite des boutons de pilotage", () => {
  const controls = html.match(/<div class="main-control-buttons">([\s\S]*?)<\/div>\s*<div class="readout-actions">/)?.[1] ?? "";
  assert.ok(controls.indexOf('id="reset-button"') >= 0);
  assert.ok(controls.indexOf('id="playback-speed-range"') > controls.indexOf('id="reset-button"'));
  assert.match(controls, /class="playback-control"/);
});


test("la vitesse de lecture est limitée à 1×", () => {
  assert.match(html, /id="playback-speed-range"[^>]+max="1"/);
  assert.match(html, /id="playback-speed-number"[^>]+max="1"/);
  assert.doesNotMatch(html, /id="playback-speed-range"[^>]+max="8"/);
});
