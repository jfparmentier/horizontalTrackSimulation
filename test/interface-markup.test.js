import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("le cadran inférieur n’affiche plus la position", () => {
  assert.doesNotMatch(html, /id="position-value"/);
  assert.doesNotMatch(html, /<dt>Position<\/dt>/);
});

test("le bouton des résultats affiche une icône de tableau accessible", () => {
  assert.match(html, /id="show-data-button"[^>]+aria-label="Afficher le tableau des mesures"/);
  assert.match(html, /id="show-data-button"[\s\S]*?class="table-icon"/);
  assert.doesNotMatch(html, /id="download-data-button"/);
});

test("les résultats finaux puis le bouton du tableau sont ordonnés à droite du chronomètre", () => {
  const section = html.match(/<div class="readout-actions">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ?? "";
  const time = section.indexOf('id="time-value"');
  const stopTime = section.indexOf('id="s2-stop-time-value"');
  const velocity = section.indexOf('id="s2-contact-velocity-value"');
  const table = section.indexOf('id="show-data-button"');
  assert.ok(time >= 0);
  assert.ok(stopTime > time);
  assert.ok(velocity > stopTime);
  assert.ok(table > velocity);
});

test("le tableau des mesures est un dialogue superposé avec export CSV", () => {
  assert.match(html, /id="measurement-table-overlay"[^>]+role="dialog"[^>]+aria-modal="true"[^>]+hidden/);
  assert.match(html, /id="measurement-table-title"[^>]*>Mesures des capteurs de vitesse<\/h2>/);
  assert.match(html, /<th scope="col"[^>]*>Numéro du capteur<\/th>/);
  assert.match(html, /<th scope="col"[^>]*>Position \(m\)<\/th>/);
  assert.match(html, /<th scope="col"[^>]*>Instant de déclenchement \(s\)<\/th>/);
  assert.match(html, /<th scope="col"[^>]*>Vitesse mesurée \(m\/s\)<\/th>/);
  assert.match(html, /id="measurement-table-download-button"[^>]+aria-label="Télécharger les mesures au format CSV"/);
  assert.match(html, /id="measurement-table-close-button"[^>]+aria-label="Fermer le tableau"/);
  assert.match(html, /\.measurement-table-overlay \{[\s\S]*?position: fixed;[\s\S]*?z-index: 100;/);
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



test("les commandes sont compactes, relevées et placées en bas à gauche du SVG", () => {
  assert.match(html, /class="apparatus-stage"[\s\S]*?id="apparatus-host"[\s\S]*?class="animation-controls"/);
  assert.match(html, /\.apparatus-stage \{[\s\S]*?position: relative/);
  assert.match(html, /\.animation-controls \{[\s\S]*?position: absolute[\s\S]*?right: auto[\s\S]*?bottom: 5\.5%[\s\S]*?left: 3\.5%[\s\S]*?width: 430px/);
});

test("les quatre commandes principales utilisent uniquement des icônes visibles", () => {
  const controls = html.match(/<div class="main-control-buttons">([\s\S]*?)<div class="playback-control">/)?.[1] ?? "";
  for (const id of ["start-button", "pause-button", "step-button", "reset-button"]) {
    assert.match(controls, new RegExp(`id="${id}"[^>]+aria-label="[^"]+"[\\s\\S]*?<svg`));
  }
  assert.doesNotMatch(controls, />\s*(Démarrer|Pause|Pas à pas|Réinitialiser)\s*</);
});

test("la vitesse de lecture varie de 0,2× à 1× par pas de 0,2×", () => {
  assert.match(html, /id="playback-speed-range"[^>]+min="0.2"[^>]+max="1"[^>]+step="0.2"/);
  assert.match(html, /id="playback-speed-number"[^>]+min="0.2"[^>]+max="1"[^>]+step="0.2"/);
  assert.match(html, /\.playback-control input\[type="range"\] \{[\s\S]*?width: 76px/);
  assert.match(html, /\.playback-control \.number-with-unit input\[type="number"\] \{[\s\S]*?width: 54px/);
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
  assert.match(html, /<dt[^>]*>Durée de chute<\/dt><dd id="s2-stop-time-value"><\/dd>/);
  assert.match(html, /<dt[^>]*>Vitesse d’impact<\/dt><dd id="s2-contact-velocity-value"><\/dd>/);
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

test("le bouton d'accueil est superposé en haut à droite du SVG sans barre de mode", () => {
  const visibleMarkup = html.slice(0, html.indexOf("<script>"));
  assert.doesNotMatch(visibleMarkup, /class="mode-toolbar"/);
  assert.doesNotMatch(visibleMarkup, /id="active-mode-label"|id="active-mode-detail"/);
  assert.match(visibleMarkup, /class="apparatus-stage"[\s\S]*id="apparatus-host"[\s\S]*id="mode-home-button"/);
  assert.match(html, /\.mode-home-button \{[\s\S]*?position: absolute;[\s\S]*?top: 18px;[\s\S]*?right: 18px;/);
});

test("la valeur inconnue du coefficient de frottement n'est pas révélée dans l'interface", () => {
  const visibleMarkup = html.slice(0, html.indexOf("<script>"));
  assert.doesNotMatch(visibleMarkup, /0[.,]058/);
  assert.match(visibleMarkup, /Frottement inconnu/);
});


test("le choix de langue est limité à l'écran d'accueil", () => {
  const visibleMarkup = html.slice(0, html.indexOf("<script>"));
  const modeSelection = visibleMarkup.match(/<section id="mode-selection"[\s\S]*?<\/section>/)?.[0] ?? "";
  const simulationScreen = visibleMarkup.match(/<section id="simulation-screen"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(modeSelection, /id="language-switcher"/);
  assert.doesNotMatch(simulationScreen, /id="language-switcher"/);
});

test("les cadrans utilisent la virgule décimale par défaut en français", () => {
  assert.match(html, /id="time-value">0,00 s<\/dd>/);
});

test("l'interface propose le français et l'anglais avec le français par défaut", () => {
  assert.match(html, /<html lang="fr">/);
  assert.match(html, /id="language-switcher"[^>]+data-i18n-aria-label="language.label"/);
  assert.match(html, /id="language-fr-button"[^>]+aria-pressed="true"[^>]*>FR<\/button>/);
  assert.match(html, /id="language-en-button"[^>]+aria-pressed="false"[^>]*>EN<\/button>/);
  assert.match(html, /data-i18n="mode.title"/);
  assert.match(html, /data-i18n="readout.fallDuration"/);
  assert.match(html, /data-i18n="measurements.title"/);
});


test("la page d’accueil place le dépôt GitHub et la licence dans un panneau discret", () => {
  const visibleMarkup = html.slice(0, html.indexOf("<script>"));
  const modeSelection = visibleMarkup.match(/<section id="mode-selection"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(modeSelection, /<details class="project-info">/);
  assert.match(modeSelection, /<summary[^>]+data-i18n-aria-label="home\.info"/);
  assert.match(modeSelection, /class="project-info-panel"/);
  assert.match(modeSelection, /href="https:\/\/github\.com\/jfparmentier\/horizontalTrackSimulation"/);
  assert.match(modeSelection, /data-i18n="home\.github"/);
  assert.match(modeSelection, /href="https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
  assert.match(modeSelection, /data-i18n="home\.license"/);
  assert.match(modeSelection, /Jean-Francois Parmentier, IPSA, IRIT/);
  assert.doesNotMatch(modeSelection, /mode-selection-footer/);
});
