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
  const section = html.match(/<div class="readout-actions">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? "";
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

test("les états de simulation sont annoncés sans ajouter de message visible", () => {
  assert.doesNotMatch(html, /id="control-status"/);
  assert.match(html, /id="simulation-announcer"[^>]+class="visually-hidden"[^>]+role="status"[^>]+aria-live="polite"/);
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

test("le réglage de vitesse est dans un panneau ergonomique distinct des mesures", () => {
  const speedPanel = html.match(/<div class="playback-floating-control"([\s\S]*?)<\/div>\s*<section class="animation-controls measurements-panel"/)?.[1] ?? "";
  assert.match(speedPanel, /id="playback-speed-range"/);
  assert.doesNotMatch(speedPanel, /class="playback-control-label"/);
  assert.match(html, /class="playback-floating-control"[\s\S]*?class="animation-controls measurements-panel"/);
});



test("les mesures restent superposées sur grand écran et les panneaux passent dans le flux sur écran étroit", () => {
  assert.match(html, /class="apparatus-stage"[\s\S]*?id="apparatus-host"[\s\S]*?class="animation-controls measurements-panel"/);
  assert.match(html, /\.apparatus-stage \{[\s\S]*?position: relative/);
  assert.match(html, /\.animation-controls \{[\s\S]*?position: absolute[\s\S]*?right: auto[\s\S]*?bottom: 5\.5%[\s\S]*?left: 3\.5%[\s\S]*?width: min\(430px, 93%\)/);
  assert.match(html, /\.playback-floating-control \{[\s\S]*?position: absolute[\s\S]*?top: 78px;[\s\S]*?right: 18px;[\s\S]*?left: auto;[\s\S]*?width: min\(200px, 45%\)/);
  assert.match(html, /@media \(max-width: 760px\) \{[\s\S]*?\.animation-controls \{[\s\S]*?position: static;[\s\S]*?width: 100%;/);
  assert.match(html, /@media \(max-width: 760px\) \{[\s\S]*?\.playback-floating-control \{[\s\S]*?position: static;[\s\S]*?width: 100%;/);
});

test("les quatre boutons de pilotage ont été retirés et le cadre s'intitule Mesures", () => {
  for (const id of ["start-button", "pause-button", "step-button", "reset-button"]) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="measurements-panel-title"[^>]*>Mesures<\/h2>/);
});

test("la vitesse de lecture varie de 0,2× à 1× par pas de 0,2×", () => {
  assert.match(html, /id="playback-speed-range"[^>]+min="0.2"[^>]+max="1"[^>]+step="0.2"/);
  assert.match(html, /id="playback-speed-number"[^>]+min="0.2"[^>]+max="1"[^>]+step="0.2"/);
  assert.match(html, /\.playback-control input\[type="range"\] \{[\s\S]*?width: 100%;[\s\S]*?min-width: 64px/);
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
  assert.match(html, /<dt[^>]*>V impact<\/dt><dd id="s2-contact-velocity-value"><\/dd>/);
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

test("le bouton d'accueil est masqué sur les téléphones en portrait et en paysage", () => {
  assert.match(
    html,
    /@media \(max-width: 760px\),\s*\(orientation: landscape\) and \(max-height: 500px\) and \(max-width: 1000px\) \{[\s\S]*?\.mode-home-button \{\s*display: none;\s*\}/,
  );
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


test("la page autonome active le viewport intégral et les zones sûres", () => {
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/);
  assert.match(html, /--safe-area-top: env\(safe-area-inset-top, 0px\)/);
  assert.match(html, /--safe-area-right: env\(safe-area-inset-right, 0px\)/);
  assert.match(html, /--safe-area-bottom: env\(safe-area-inset-bottom, 0px\)/);
  assert.match(html, /--safe-area-left: env\(safe-area-inset-left, 0px\)/);
});

test("la fondation responsive supprime le canevas mobile de 900 px et le défilement horizontal", () => {
  assert.doesNotMatch(html, /min-width:\s*900px/);
  assert.doesNotMatch(html, /\.apparatus-card \{[\s\S]{0,180}?overflow-x:\s*auto/);
  assert.match(html, /body \{[\s\S]*?overflow-x: clip/);
  assert.match(html, /\.apparatus-card,[\s\S]*?\.apparatus-svg \{[\s\S]*?max-width: 100%;[\s\S]*?min-width: 0;/);
});

test("les unités de viewport dynamiques et les tailles tactiles de base sont présentes", () => {
  assert.match(html, /min-height: 100dvh/);
  assert.match(html, /max-height: min\(82dvh, 720px\)/);
  assert.match(html, /\.control-button \{[\s\S]*?width: 44px;[\s\S]*?min-height: 44px/);
  assert.match(html, /\.mode-home-button \{[\s\S]*?width: 44px;[\s\S]*?height: 44px/);
  assert.match(html, /\.dialog-icon-button \{[\s\S]*?width: 44px;[\s\S]*?height: 44px/);
});


test("la largeur maximale de la simulation sur ordinateur reste fixée à 1440 px", () => {
  assert.match(html, /--desktop-apparatus-width: 1440px/);
  assert.match(html, /\.page-shell \{[\s\S]*?max-width: calc\(var\(--desktop-apparatus-width\) \+ 32px\)/);
});

test("la disposition mobile propose quatre grands boutons de masse", () => {
  const selector = html.match(/<fieldset id="mobile-mass-selector"[\s\S]*?<\/fieldset>/)?.[0] ?? "";
  assert.match(selector, /data-i18n="mass\.mobileTitle"/);
  assert.match(selector, /<legend[^>]*>Masse suspendue<\/legend>/);
  assert.doesNotMatch(selector, /Masse suspendue S2/);
  assert.equal((selector.match(/data-mobile-mass-value=/g) ?? []).length, 4);
  assert.match(html, /\.mobile-mass-selector \{[\s\S]*?display: none;/);
  assert.match(html, /@media \(max-width: 760px\) \{[\s\S]*?\.mobile-mass-selector \{[\s\S]*?display: block;/);
  assert.match(html, /\.mobile-mass-button \{[\s\S]*?min-height: 56px;/);
});

test("les téléphones disposent de cadrages SVG portrait et paysage", () => {
  assert.match(html, /mobile-portrait/);
  assert.match(html, /70 60 1130 535/);
  assert.match(html, /short-landscape/);
  assert.match(html, /45 55 1155 545/);
  assert.match(html, /@media \(orientation: landscape\) and \(max-height: 500px\) and \(max-width: 1000px\)/);
});

test("le tableau devient une liste de fiches sans défilement horizontal sur petit écran", () => {
  assert.match(html, /data-label=/);
  assert.match(html, /@media \(max-width: 560px\) \{[\s\S]*?\.measurement-table thead \{[\s\S]*?display: none;/);
  assert.match(html, /\.measurement-table tbody td::before \{[\s\S]*?content: attr\(data-label\)/);
});


test("la navigation clavier comprend un lien d'évitement et une gestion modale complète", () => {
  assert.match(html, /class="skip-link" href="#main-content"[^>]+data-i18n="accessibility\.skipToContent"/);
  assert.match(html, /<main id="main-content" class="page-shell" tabindex="-1">/);
  assert.match(html, /id="measurement-table-overlay"[^>]+aria-describedby="measurement-table-description"/);
  assert.match(html, /id="measurement-table-description" class="visually-hidden"[^>]+data-i18n="measurements\.description"/);
  assert.match(html, /body\.measurement-dialog-open \{[\s\S]*?overflow: hidden;[\s\S]*?overscroll-behavior: none;/);
});

test("les préférences de mouvement réduit et le contraste forcé sont prises en charge", () => {
  assert.match(html, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?animation-duration: 0\.001ms !important;[\s\S]*?transition-duration: 0\.001ms !important;/);
  assert.match(html, /@media \(forced-colors: active\) \{/);
});

test("les téléphones très courts en paysage disposent d'une disposition renforcée", () => {
  assert.match(html, /@media \(orientation: landscape\) and \(max-height: 360px\) and \(max-width: 760px\)/);
  assert.match(html, /grid-template-columns: minmax\(0, 1fr\) minmax\(248px, 46%\)/);
});
