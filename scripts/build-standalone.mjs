import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifests = [
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
    dependencies: [["geometry", ["computeApparatusLayout"]]],
    exports: ["buildStaticApparatusSvg", "mountStaticApparatus"],
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
    key: "simulationControls",
    file: "src/simulation-controls.js",
    dependencies: [],
    exports: ["DEFAULT_MANUAL_STEP_DURATION", "bindSimulationControls"],
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
      "sampleStandardNormal", "addVelocityMeasurementNoise",
      "computeSensorTriggerPosition", "computeKinematicStateAtPosition",
      "createMeasurement", "createMeasurementRecorder",
    ],
  },
  {
    key: "measurementExport",
    file: "src/measurement-export.js",
    dependencies: [],
    exports: [
      "buildMeasurementsCsv", "downloadMeasurementsCsv", "bindMeasurementExport",
    ],
  },
  {
    key: "app",
    file: "src/animated-app.js",
    dependencies: [
      ["geometry", ["computeApparatusLayout"]],
      ["animation", ["createApparatusAnimator"]],
      ["view", ["mountStaticApparatus"]],
      ["appState", ["createAppState"]],
      ["modeSelector", ["bindModeSelector"]],
      ["parameterControls", ["bindParameterControls"]],
      ["massSelector", ["createMassSelector"]],
      ["simulationControls", ["bindSimulationControls"]],
      ["sensorController", ["createSensorController"]],
      ["measurementRecorder", ["createMeasurementRecorder"]],
      ["measurementExport", ["bindMeasurementExport"]],
      ["timeLoop", ["createTimeLoop"]],
    ],
    exports: ["createAnimatedApp"],
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

const bundle = `(() => {\n"use strict";\nconst modules = {};\n${manifests.map(transformModule).join("\n\n")}\nmodules.app.createAnimatedApp(document);\n})();`;

const css = fs.readFileSync(path.join(root, "src/apparatus.css"), "utf8");
const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Simulation autonome du glissement d’un mobile sur un banc horizontal.">
  <title>Simulation du banc horizontal</title>
  <style>
${css}
  </style>
</head>
<body>
  <main class="page-shell">
    <section id="mode-selection" class="mode-selection" aria-labelledby="mode-selection-title">
      <div class="mode-selection-panel">
        <p class="mode-selection-eyebrow">Simulation du banc horizontal</p>
        <h1 id="mode-selection-title">Choisir un mode d’exploration</h1>
        <p class="mode-selection-intro">Sélectionnez le niveau de modélisation avant de lancer l’expérience.</p>

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
            <span class="mode-card-title">Cas idéal</span>
            <span class="mode-card-summary">Sans frottement</span>
            <span class="mode-card-description">Les capteurs fournissent des mesures parfaites pour identifier les deux phases du mouvement.</span>
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
            <span class="mode-card-title">Cas avec frottement</span>
            <span class="mode-card-summary">Frottement inconnu · mesures bruitées</span>
            <span class="mode-card-description">Répétez les expériences et exploitez les mesures pour estimer le coefficient de frottement.</span>
          </button>
        </div>
      </div>
    </section>

    <section id="simulation-screen" class="simulation-screen" aria-label="Simulation" hidden aria-hidden="true">
      <section class="apparatus-card" aria-label="Montage expérimental animé">
        <div class="mode-toolbar">
          <button id="mode-home-button" class="mode-home-button" type="button" aria-label="Revenir au choix du mode" title="Revenir au choix du mode">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 11.2 12 4l9 7.2M5.5 10.5V20h5v-5.5h3V20h5v-9.5" />
            </svg>
          </button>
          <div class="active-mode-copy">
            <strong id="active-mode-label"></strong>
            <span id="active-mode-detail"></span>
          </div>
        </div>
        <div class="apparatus-stage">
          <div id="apparatus-host" class="apparatus-host"></div>
          <div class="animation-controls" aria-label="Commandes et résultats de la simulation">
            <div class="main-control-buttons">
              <button id="start-button" class="control-button control-button--primary" type="button" aria-label="Démarrer" title="Démarrer">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" /></svg>
              </button>
              <button id="pause-button" class="control-button" type="button" aria-label="Pause" title="Pause">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              </button>
              <button id="step-button" class="control-button" type="button" aria-label="Pas à pas" title="Pas à pas">
                <svg class="control-icon control-icon--filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5v14l10-7zM17 5h2v14h-2z" /></svg>
              </button>
              <button id="reset-button" class="control-button" type="button" aria-label="Réinitialiser" title="Réinitialiser">
                <svg class="control-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9A8 8 0 1 1 6 17.5M4.5 9V4.5M4.5 9H9" /></svg>
              </button>
              <div class="playback-control">
                <label class="visually-hidden" for="playback-speed-range">Vitesse de lecture</label>
                <svg class="playback-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 16a8 8 0 0 1 16 0M12 12l4-4M7 18h10" /></svg>
                <input id="playback-speed-range" type="range" min="0.2" max="1" step="0.2" value="1" aria-label="Vitesse de lecture">
                <span class="number-with-unit playback-value"><input id="playback-speed-number" type="number" min="0.2" max="1" step="0.2" value="1" aria-label="Valeur de la vitesse de lecture"><span>×</span></span>
              </div>
            </div>
            <div class="readout-actions">
              <dl class="animation-readout">
                <div class="readout-item"><dt>Temps</dt><dd id="time-value">0.00 s</dd></div>
                <div id="s2-stop-time-item" class="readout-item readout-item--result readout-item--pending" aria-disabled="true"><dt>Durée de chute</dt><dd id="s2-stop-time-value"></dd></div>
                <div id="s2-contact-velocity-item" class="readout-item readout-item--result readout-item--pending" aria-disabled="true"><dt>Vitesse d’impact</dt><dd id="s2-contact-velocity-value"></dd></div>
              </dl>
              <button id="download-data-button" class="control-button control-button--icon" type="button" aria-label="Télécharger les données des capteurs" title="Télécharger les données des capteurs" disabled>
                <svg class="fa-solid fa-download download-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
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
