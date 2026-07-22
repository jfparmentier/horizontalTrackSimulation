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

test("les résultats finaux puis le bouton d’export sont ordonnés à droite du chronomètre", () => {
  const section = html.match(/<div class="readout-actions">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ?? "";
  const time = section.indexOf('id="time-value"');
  const stopTime = section.indexOf('id="s2-stop-time-value"');
  const velocity = section.indexOf('id="s2-contact-velocity-value"');
  const download = section.indexOf('id="download-data-button"');
  assert.ok(time >= 0);
  assert.ok(stopTime > time);
  assert.ok(velocity > stopTime);
  assert.ok(download > velocity);
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


test("la masse de S1, la hauteur et les onze capteurs sont fixes sans contrôles", () => {
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


test("la masse suspendue ne possède plus de contrôle dans le menu de gauche", () => {
  assert.doesNotMatch(html, /id="m2-range"/);
  assert.doesNotMatch(html, /id="m2-number"/);
  assert.doesNotMatch(html, /<label[^>]*>Masse suspendue<\/label>/);
});

test("le bundle autonome contient les masses SVG sélectionnables", () => {
  assert.match(html, /data-role="mass-choice"/);
  assert.match(html, /id="layer-mass-rack"/);
  assert.match(html, /id="mass-drop-target"/);
});

test("les résultats de la phase 1 sont toujours visibles mais initialement grisés et vides", () => {
  assert.match(html, /id="s2-stop-time-item"[^>]+readout-item--pending[^>]+aria-disabled="true"/);
  assert.match(html, /id="s2-contact-velocity-item"[^>]+readout-item--pending[^>]+aria-disabled="true"/);
  assert.doesNotMatch(html, /id="s2-stop-time-item"[^>]+hidden/);
  assert.doesNotMatch(html, /id="s2-contact-velocity-item"[^>]+hidden/);
  assert.match(html, /<dt>Durée de chute<\/dt><dd id="s2-stop-time-value"><\/dd>/);
  assert.match(html, /<dt>Vitesse d’impact<\/dt><dd id="s2-contact-velocity-value"><\/dd>/);
});

test("le menu latéral de paramètres a disparu", () => {
  assert.doesNotMatch(html, /class="parameter-panel"/);
  assert.doesNotMatch(html, /id="friction-range"|id="friction-number"/);
  assert.doesNotMatch(html, /<h2[^>]*>Paramètres<\/h2>/);
});

test("l'écran initial propose deux grandes cartes de mode", () => {
  assert.match(html, /id="mode-selection"/);
  assert.match(html, /id="mode-ideal-button"[^>]+class="mode-card mode-card--ideal"/);
  assert.match(html, /id="mode-friction-button"[^>]+class="mode-card mode-card--friction"/);
  assert.match(html, />Cas idéal</);
  assert.match(html, />Cas avec frottement</);
  assert.match(html, /mesures parfaites/i);
  assert.match(html, /mesures bruitées/i);
});

test("la simulation est initialement masquée jusqu'au choix du mode", () => {
  assert.match(html, /id="simulation-screen"[^>]+hidden[^>]+aria-hidden="true"/);
  assert.match(html, /id="mode-home-button"[^>]+aria-label="Revenir au choix du mode"/);
});

test("la valeur inconnue du coefficient de frottement n'est pas révélée dans l'interface", () => {
  const visibleMarkup = html.slice(0, html.indexOf("<script>"));
  assert.doesNotMatch(visibleMarkup, /0[.,]058/);
  assert.match(visibleMarkup, /Frottement inconnu/);
});
