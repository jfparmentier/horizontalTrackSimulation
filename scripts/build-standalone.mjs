import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifests = [
  {
    key: "i18n",
    file: "src/i18n.js",
    dependencies: [],
    exports: ["DEFAULT_LOCALE", "SUPPORTED_LOCALES", "normalizeLocale", "translate", "formatNumber", "createI18n"],
  },
  {
    key: "languageSelector",
    file: "src/language-selector.js",
    dependencies: [],
    exports: ["applyInterfaceLanguage", "bindLanguageSelector"],
  },
  {
    key: "constants",
    file: "src/constants.js",
    dependencies: [],
    exports: ["GRAVITY", "FIXED_TRACK_LENGTH", "FIXED_M1", "FIXED_DROP_HEIGHT", "FIXED_SENSOR_COUNT", "FIXED_SENSOR_POSITIONS", "FIXED_MOBILE_LENGTH", "AVAILABLE_HANGING_MASSES", "SIMULATION_MODE_IDS", "SIMULATION_MODES", "PARAMETER_LIMITS", "DEFAULT_PARAMETERS", "NUMERICAL_EPSILON"],
  },
  {
    key: "physics",
    file: "src/physics.js",
    dependencies: [
      ["constants", ["DEFAULT_PARAMETERS", "FIXED_MOBILE_LENGTH", "GRAVITY", "NUMERICAL_EPSILON", "PARAMETER_LIMITS"]],
    ],
    exports: [
      "PhysicsParameterError", "getGravity", "validateParameters", "getMaximumMobilePosition",
      "computePhase1Acceleration", "computePhase2Acceleration",
      "computePhase1EndVelocity", "timeToReachPosition", "timeToStop",
      "integrateConstantAcceleration", "createInitialState", "validateSimulationState",
    ],
  },
  {
    key: "transitions",
    file: "src/transitions.js",
    dependencies: [
      ["constants", ["NUMERICAL_EPSILON"]],
      ["physics", [
        "PhysicsParameterError", "computePhase1Acceleration", "computePhase2Acceleration",
        "getMaximumMobilePosition", "integrateConstantAcceleration", "timeToReachPosition", "timeToStop",
        "validateParameters", "validateSimulationState",
      ]],
    ],
    exports: [
      "PHYSICAL_EVENT", "getNextPhysicalEvent", "advanceWithinCurrentPhase",
      "advanceToPhysicalEvent", "advanceSimulationWithEvents", "advanceSimulation",
    ],
  },
  {
    key: "timeLoop",
    file: "src/time-loop.js",
    dependencies: [
      ["constants", ["NUMERICAL_EPSILON"]],
      ["physics", ["PhysicsParameterError", "createInitialState", "validateParameters", "validateSimulationState"]],
      ["transitions", ["advanceSimulationWithEvents"]],
    ],
    exports: ["TIME_LOOP_DEFAULTS", "PLAYBACK_SPEED_LIMITS", "createTimeLoop"],
  },
  {
    key: "geometry",
    file: "src/apparatus-geometry.js",
    dependencies: [
      ["constants", ["AVAILABLE_HANGING_MASSES", "DEFAULT_PARAMETERS", "FIXED_MOBILE_LENGTH", "FIXED_SENSOR_COUNT", "FIXED_SENSOR_POSITIONS"]],
      ["physics", ["PhysicsParameterError", "validateParameters"]],
    ],
    exports: [
      "APPARATUS_VIEWBOX", "SENSOR_COUNT_LIMITS", "createDefaultSensors",
      "createLinearScale", "computeApparatusLayout",
    ],
  },
  {
    key: "view",
    file: "src/apparatus-view.js",
    dependencies: [
      ["geometry", ["computeApparatusLayout"]],
      ["i18n", ["normalizeLocale", "translate"]],
    ],
    exports: ["buildStaticApparatusSvg", "localizeStaticApparatus", "mountStaticApparatus"],
  },
  {
    key: "animation",
    file: "src/apparatus-animation.js",
    dependencies: [],
    exports: ["computeAnimatedApparatusFrame", "createApparatusAnimator"],
  },
  {
    key: "appState",
    file: "src/app-state.js",
    dependencies: [
      ["constants", ["DEFAULT_PARAMETERS", "FIXED_DROP_HEIGHT", "FIXED_M1", "FIXED_SENSOR_COUNT", "FIXED_TRACK_LENGTH", "SIMULATION_MODES"]],
      ["geometry", ["SENSOR_COUNT_LIMITS"]],
      ["timeLoop", ["PLAYBACK_SPEED_LIMITS"]],
      ["physics", ["PhysicsParameterError", "createInitialState", "validateParameters", "validateSimulationState"]],
    ],
    exports: [
      "DEFAULT_EXPERIMENTAL_SETTINGS", "DEFAULT_DISPLAY_SETTINGS",
      "DEFAULT_PLAYBACK_SPEED", "createAppState",
    ],
  },
  {
    key: "modeSelector",
    file: "src/mode-selector.js",
    dependencies: [["constants", ["SIMULATION_MODES"]]],
    exports: ["bindModeSelector"],
  },
  {
    key: "parameterControls",
    file: "src/parameter-controls.js",
    dependencies: [],
    exports: ["bindParameterControls"],
  },
  {
    key: "massSelector",
    file: "src/mass-selector.js",
    dependencies: [],
    exports: ["isPointInsideRect", "createMassSelector"],
  },
  {
    key: "mobileMassSelector",
    file: "src/mobile-mass-selector.js",
    dependencies: [],
    exports: ["bindMobileMassSelector"],
  },
  {
    key: "responsiveApparatus",
    file: "src/responsive-apparatus.js",
    dependencies: [],
    exports: ["APPARATUS_VIEWPORTS", "selectApparatusViewport", "applyApparatusViewport", "createResponsiveApparatusViewport"],
  },
  {
    key: "simulationControls",
    file: "src/simulation-controls.js",
    dependencies: [["i18n", ["createI18n"]]],
    exports: ["DEFAULT_MANUAL_STEP_DURATION", "bindSimulationControls"],
  },
  {
    key: "personController",
    file: "src/person-controller.js",
    dependencies: [],
    exports: ["createPersonController"],
  },
  {
    key: "sensorController",
    file: "src/sensor-controller.js",
    dependencies: [],
    exports: ["detectSensorCrossings", "createSensorController"],
  },
  {
    key: "measurementRecorder",
    file: "src/measurement-recorder.js",
    dependencies: [
      ["physics", [
        "computePhase1Acceleration", "computePhase2Acceleration", "validateParameters",
      ]],
    ],
    exports: [
      "sampleStandardNormal", "addVelocityMeasurementNoise", "addTimeMeasurementNoise",
      "computeSensorTriggerPosition", "computeKinematicStateAtPosition",
      "createMeasurement", "createMeasurementRecorder",
    ],
  },
  {
    key: "measurementExport",
    file: "src/measurement-export.js",
    dependencies: [["i18n", ["createI18n", "formatNumber", "translate"]]],
    exports: [
      "buildMeasurementsTableRows", "buildMeasurementsCsv", "downloadMeasurementsCsv", "bindMeasurementResults", "bindMeasurementExport",
    ],
  },
  {
    key: "app",
    file: "src/animated-app.js",
    dependencies: [
      ["geometry", ["computeApparatusLayout"]],
      ["animation", ["createApparatusAnimator"]],
      ["view", ["localizeStaticApparatus", "mountStaticApparatus"]],
      ["appState", ["createAppState"]],
      ["i18n", ["createI18n", "formatNumber"]],
      ["languageSelector", ["bindLanguageSelector"]],
      ["modeSelector", ["bindModeSelector"]],
      ["parameterControls", ["bindParameterControls"]],
      ["personController", ["createPersonController"]],
      ["massSelector", ["createMassSelector"]],
      ["mobileMassSelector", ["bindMobileMassSelector"]],
      ["responsiveApparatus", ["createResponsiveApparatusViewport"]],
      ["simulationControls", ["bindSimulationControls"]],
      ["sensorController", ["createSensorController"]],
      ["measurementRecorder", ["createMeasurementRecorder"]],
      ["measurementExport", ["bindMeasurementResults"]],
      ["timeLoop", ["createTimeLoop"]],
    ],
    exports: ["IMPACT_SENSOR_ID", "getImpactSensorMeasurement", "createAnimatedApp"],
  },
];

function transformModule(manifest) {
  let source = fs.readFileSync(path.join(root, manifest.file), "utf8");
  source = source.replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/gm, "");
  source = source.replace(/\bexport\s+(?=(const|let|var|function|class)\b)/g, "");

  const dependencyLines = manifest.dependencies.map(
    ([moduleName, names]) => `const { ${names.join(", ")} } = modules.${moduleName};`,
  );

  return `modules.${manifest.key} = (() => {\n${dependencyLines.join("\n")}\n${source}\nreturn Object.freeze({ ${manifest.exports.join(", ")} });\n})();`;
}

let bundle = `(() => {\n"use strict";\nconst modules = {};\n${manifests.map(transformModule).join("\n\n")}\nmodules.app.createAnimatedApp(document);\n})();`;

for (const [assetPath, mimeType] of [
  ["assets/person-holding.webp", "image/webp"],
  ["assets/person-resting.webp", "image/webp"],
]) {
  const asset = fs.readFileSync(path.join(root, assetPath)).toString("base64");
  bundle = bundle.replaceAll(assetPath, `data:${mimeType};base64,${asset}`);
}

const css = fs.readFileSync(path.join(root, "src/apparatus.css"), "utf8");
const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="Simulation autonome du glissement d’un mobile sur un banc horizontal." data-i18n-content="meta.description">
  <title>Simulation du banc horizontal</title>
  <style>
${css}
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content" data-i18n="accessibility.skipToContent">Aller au contenu principal</a>
  <main id="main-content" class="page-shell" tabindex="-1">
    <section id="mode-selection" class="mode-selection" aria-labelledby="mode-selection-title">
      <nav id="language-switcher" class="language-switcher" aria-label="Langue" data-i18n-aria-label="language.label">
        <button id="language-fr-button" class="language-button language-button--active" type="button" lang="fr" aria-pressed="true" aria-label="Français" data-i18n-aria-label="language.fr">FR</button>
        <button id="language-en-button" class="language-button" type="button" lang="en" aria-pressed="false" aria-label="Anglais" data-i18n-aria-label="language.en">EN</button>
      </nav>
      <div class="mode-selection-panel">
        <p class="mode-selection-eyebrow" data-i18n="mode.eyebrow">Simulation du banc horizontal</p>
        <h1 id="mode-selection-title" data-i18n="mode.title">Choisir un mode d’exploration</h1>
        <p class="mode-selection-intro" data-i18n="mode.intro">Sélectionnez le niveau de modélisation avant de lancer l’expérience.</p>

        <div class="mode-card-grid">
          <button id="mode-ideal-button" class="mode-card mode-card--ideal" type="button">
            <span class="mode-card-illustration" aria-hidden="true">
              <svg viewBox="0 0 220 118" focusable="false">
                <path class="mode-ground" d="M18 87 H202" />
                <rect class="mode-cart" x="42" y="52" width="54" height="34" rx="9" />
                <circle class="mode-wheel" cx="55" cy="91" r="7" />
                <circle class="mode-wheel" cx="84" cy="91" r="7" />
                <path class="mode-motion-line" d="M108 68 H179" />
                <path class="mode-motion-line" d="M158 57 L180 68 L158 79" />
              </svg>
            </span>
            <span class="mode-card-title" data-i18n="mode.ideal.title">Cas idéal</span>
            <span class="mode-card-summary" data-i18n="mode.ideal.summary">Sans frottement</span>
            <span class="mode-card-description" data-i18n="mode.ideal.description">Les capteurs fournissent des mesures parfaites pour identifier les deux phases du mouvement.</span>
          </button>

          <button id="mode-friction-button" class="mode-card mode-card--friction" type="button">
            <span class="mode-card-illustration" aria-hidden="true">
              <svg viewBox="0 0 220 118" focusable="false">
                <path class="mode-rough-ground" d="M18 87 L28 79 L38 87 L48 79 L58 87 L68 79 L78 87 L88 79 L98 87 L108 79 L118 87 L128 79 L138 87 L148 79 L158 87 L168 79 L178 87 L188 79 L202 87" />
                <rect class="mode-cart" x="42" y="52" width="54" height="34" rx="9" />
                <circle class="mode-wheel" cx="55" cy="91" r="7" />
                <circle class="mode-wheel" cx="84" cy="91" r="7" />
                <circle class="mode-noise-dot" cx="129" cy="57" r="4" />
                <circle class="mode-noise-dot" cx="146" cy="69" r="4" />
                <circle class="mode-noise-dot" cx="164" cy="51" r="4" />
                <circle class="mode-noise-dot" cx="181" cy="72" r="4" />
              </svg>
            </span>
            <span class="mode-card-title" data-i18n="mode.friction.title">Cas avec frottement</span>
            <span class="mode-card-summary" data-i18n="mode.friction.summary">Frottement inconnu · mesures bruitées</span>
            <span class="mode-card-description" data-i18n="mode.friction.description">Répétez les expériences et exploitez les vitesses et instants bruités pour estimer le coefficient de frottement.</span>
          </button>
        </div>

        <details class="project-info">
          <summary aria-label="Informations sur le projet" title="Informations sur le projet" data-i18n-aria-label="home.info" data-i18n-title="home.info">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10.5v6M12 7.5h.01" />
            </svg>
          </summary>
          <aside class="project-info-panel">
            <h2 data-i18n="home.infoTitle">À propos</h2>
            <a href="https://github.com/jfparmentier/horizontalTrackSimulation" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.6 0-1.2.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C14.2 4.6 15.2 5 15.2 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.3-2.8 5.3-5.4 5.6.4.4.8 1.1.8 2.1v3.2c0 .4.2.7.8.6A11.3 11.3 0 0 0 12 .7Z" />
              </svg>
              <span data-i18n="home.github">Code source sur GitHub</span>
            </a>
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10" />
                <path d="M15.7 9.4a4 4 0 1 0 0 5.2M17.5 9.4a4 4 0 1 0 0 5.2" />
              </svg>
              <span data-i18n="home.license">Sous licence CC BY 4.0 — Jean-Francois Parmentier, IPSA, IRIT</span>
            </a>
          </aside>
        </details>
      </div>
    </section>

    <section id="simulation-screen" class="simulation-screen" aria-label="Simulation" data-i18n-aria-label="simulation.label" hidden aria-hidden="true">
      <p id="simulation-announcer" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p>
      <section class="apparatus-card" aria-label="Montage expérimental animé" data-i18n-aria-label="apparatus.label">
        <div class="apparatus-stage">
          <div id="apparatus-host" class="apparatus-host"></div>
          <button id="mode-home-button" class="mode-home-button" type="button" aria-label="Revenir au choix du mode" title="Revenir au choix du mode" data-i18n-aria-label="home" data-i18n-title="home">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 11.2 12 4l9 7.2M5.5 10.5V20h5v-5.5h3V20h5v-9.5" />
            </svg>
          </button>
          <fieldset id="mobile-mass-selector" class="mobile-mass-selector">
            <legend data-i18n="mass.mobileTitle">Masse suspendue</legend>
            <div class="mobile-mass-buttons">
              <button class="mobile-mass-button mobile-mass-button--0-2" type="button" data-mobile-mass-value="0.2" aria-pressed="false"><span>0.2 kg</span></button>
              <button class="mobile-mass-button mobile-mass-button--0-5" type="button" data-mobile-mass-value="0.5" aria-pressed="true"><span>0.5 kg</span></button>
              <button class="mobile-mass-button mobile-mass-button--1" type="button" data-mobile-mass-value="1" aria-pressed="false"><span>1 kg</span></button>
              <button class="mobile-mass-button mobile-mass-button--2" type="button" data-mobile-mass-value="2" aria-pressed="false"><span>2 kg</span></button>
            </div>
          </fieldset>
          <div class="animation-controls" aria-label="Commandes et résultats de la simulation" data-i18n-aria-label="controls.group">
            <div class="main-control-buttons">
              <button id="start-button" class="control-button control-button--primary" type="button" aria-label="Démarrer" title="Démarrer">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" /></svg>
              </button>
              <button id="pause-button" class="control-button" type="button" aria-label="Pause" title="Pause" data-i18n-aria-label="controls.pause" data-i18n-title="controls.pause">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              </button>
              <button id="step-button" class="control-button" type="button" aria-label="Pas à pas" title="Pas à pas">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5v14l10-7zM17 5h2v14h-2z" /></svg>
              </button>
              <button id="reset-button" class="control-button" type="button" aria-label="Réinitialiser" title="Réinitialiser" data-i18n-aria-label="controls.reset" data-i18n-title="controls.reset">
                <svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9A8 8 0 1 1 6 17.5M4.5 9V4.5M4.5 9H9" /></svg>
              </button>
              <div class="playback-control">
                <label class="visually-hidden" for="playback-speed-range" data-i18n="controls.playback">Vitesse de lecture</label>
                <svg class="playback-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 16a8 8 0 0 1 16 0M12 12l4-4M7 18h10" /></svg>
                <input id="playback-speed-range" type="range" min="0.2" max="1" step="0.2" value="1" aria-label="Vitesse de lecture" data-i18n-aria-label="controls.playback">
                <span class="number-with-unit playback-value"><input id="playback-speed-number" type="number" min="0.2" max="1" step="0.2" value="1" aria-label="Valeur de la vitesse de lecture" data-i18n-aria-label="controls.playbackValue"><span>×</span></span>
              </div>
            </div>
            <div class="readout-actions">
              <dl class="animation-readout">
                <div class="readout-item"><dt data-i18n="readout.time">Temps</dt><dd id="time-value">0,00 s</dd></div>
                <div id="s2-stop-time-item" class="readout-item readout-item--result readout-item--pending" aria-disabled="true"><dt data-i18n="readout.fallDuration">Durée de chute</dt><dd id="s2-stop-time-value"></dd></div>
                <div id="s2-contact-velocity-item" class="readout-item readout-item--result readout-item--pending" aria-disabled="true"><dt data-i18n="readout.impactVelocity">V impact</dt><dd id="s2-contact-velocity-value"></dd></div>
              </dl>
              <button id="show-data-button" class="control-button control-button--icon" type="button" aria-label="Afficher le tableau des mesures" title="Afficher le tableau des mesures" data-i18n-aria-label="measurements.show" data-i18n-title="measurements.show" aria-controls="measurement-table-overlay" aria-expanded="false" disabled>
                <svg class="table-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 9h18M9 4v16M15 4v16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="measurement-table-overlay" class="measurement-table-overlay" role="dialog" aria-modal="true" aria-labelledby="measurement-table-title" aria-describedby="measurement-table-description" aria-hidden="true" hidden>
        <section class="measurement-table-dialog" tabindex="-1">
          <header class="measurement-table-header">
            <div>
              <p class="measurement-table-eyebrow" data-i18n="measurements.eyebrow">Résultats expérimentaux</p>
              <h2 id="measurement-table-title" data-i18n="measurements.title">Mesures des capteurs de vitesse</h2>
              <p id="measurement-table-description" class="visually-hidden" data-i18n="measurements.description">Tableau des mesures enregistrées par les onze capteurs. Utilisez Tab pour parcourir les actions et Échap pour fermer.</p>
            </div>
            <div class="measurement-table-actions">
              <button id="measurement-table-download-button" class="dialog-icon-button dialog-icon-button--download" type="button" aria-label="Télécharger les mesures au format CSV" title="Télécharger les mesures au format CSV" data-i18n-aria-label="measurements.download" data-i18n-title="measurements.download">
                <svg class="download-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
                </svg>
              </button>
              <button id="measurement-table-close-button" class="dialog-icon-button" type="button" aria-label="Fermer le tableau" title="Fermer le tableau" data-i18n-aria-label="measurements.close" data-i18n-title="measurements.close">
                <svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>
          <div class="measurement-table-scroll">
            <table class="measurement-table">
              <thead>
                <tr>
                  <th scope="col" data-i18n="measurements.sensorNumber">Numéro du capteur</th>
                  <th scope="col" data-i18n="measurements.position">Position (m)</th>
                  <th scope="col" data-i18n="measurements.triggerTime">Instant de déclenchement (s)</th>
                  <th scope="col" data-i18n="measurements.velocity">Vitesse mesurée (m/s)</th>
                </tr>
              </thead>
              <tbody id="measurement-table-body"></tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  </main>
  <script>
${bundle}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "dist-standalone.js"), bundle);
