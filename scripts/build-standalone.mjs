import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifests = [
  {
    key: "constants",
    file: "src/constants.js",
    dependencies: [],
    exports: ["GRAVITY", "FIXED_TRACK_LENGTH", "FIXED_M1", "FIXED_DROP_HEIGHT", "FIXED_SENSOR_COUNT", "FIXED_SENSOR_POSITIONS", "FIXED_MOBILE_LENGTH", "AVAILABLE_HANGING_MASSES", "PARAMETER_LIMITS", "DEFAULT_PARAMETERS", "NUMERICAL_EPSILON"],
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
      ["constants", ["DEFAULT_PARAMETERS", "FIXED_DROP_HEIGHT", "FIXED_M1", "FIXED_SENSOR_COUNT", "FIXED_TRACK_LENGTH"]],
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
    <div class="simulation-layout">
      <aside class="parameter-panel" aria-labelledby="parameters-title">
        <h2 id="parameters-title">Paramètres</h2>
        <div class="parameter-list">
          <div class="parameter-control">
            <label for="friction-range">Coefficient de frottement</label>
            <input id="friction-range" type="range" min="0" max="0.2" step="0.005" value="0">
            <span class="number-with-unit"><input id="friction-number" type="number" min="0" max="0.2" step="0.005" value="0"><span>—</span></span>
          </div>
        </div>
        <p id="parameter-error" class="parameter-error" role="alert" aria-live="polite"></p>
      </aside>

      <section class="apparatus-card" aria-label="Montage expérimental animé">
        <div id="apparatus-host" class="apparatus-host"></div>
        <div class="animation-controls" aria-label="Commandes de la simulation">
          <div class="main-control-buttons">
            <button id="start-button" class="control-button control-button--primary" type="button">Démarrer</button>
            <button id="pause-button" class="control-button" type="button">Pause</button>
            <button id="step-button" class="control-button" type="button">Pas à pas</button>
            <button id="reset-button" class="control-button" type="button">Réinitialiser</button>
            <div class="playback-control">
              <label for="playback-speed-range">Vitesse de lecture</label>
              <input id="playback-speed-range" type="range" min="0.1" max="1" step="0.1" value="1">
              <span class="number-with-unit playback-value"><input id="playback-speed-number" type="number" min="0.1" max="1" step="0.1" value="1" aria-label="Valeur de la vitesse de lecture"><span>×</span></span>
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
      </section>
    </div>
  </main>
  <script>
${bundle}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
fs.writeFileSync(path.join(root, "dist-standalone.js"), bundle);
