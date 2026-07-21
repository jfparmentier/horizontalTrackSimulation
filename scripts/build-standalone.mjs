import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifests = [
  {
    key: "constants",
    file: "src/constants.js",
    dependencies: [],
    exports: ["GRAVITY", "PARAMETER_LIMITS", "DEFAULT_PARAMETERS", "NUMERICAL_EPSILON"],
  },
  {
    key: "physics",
    file: "src/physics.js",
    dependencies: [
      ["constants", ["DEFAULT_PARAMETERS", "GRAVITY", "NUMERICAL_EPSILON", "PARAMETER_LIMITS"]],
    ],
    exports: [
      "PhysicsParameterError",
      "getGravity",
      "validateParameters",
      "computePhase1Acceleration",
      "computePhase2Acceleration",
      "computePhase1EndVelocity",
      "timeToReachPosition",
      "timeToStop",
      "integrateConstantAcceleration",
      "createInitialState",
      "validateSimulationState",
    ],
  },
  {
    key: "transitions",
    file: "src/transitions.js",
    dependencies: [
      ["constants", ["NUMERICAL_EPSILON"]],
      ["physics", [
        "PhysicsParameterError",
        "computePhase1Acceleration",
        "computePhase2Acceleration",
        "integrateConstantAcceleration",
        "timeToReachPosition",
        "timeToStop",
        "validateParameters",
        "validateSimulationState",
      ]],
    ],
    exports: [
      "PHYSICAL_EVENT",
      "getNextPhysicalEvent",
      "advanceWithinCurrentPhase",
      "advanceToPhysicalEvent",
      "advanceSimulationWithEvents",
      "advanceSimulation",
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
      ["constants", ["DEFAULT_PARAMETERS"]],
      ["physics", ["PhysicsParameterError", "validateParameters"]],
    ],
    exports: [
      "APPARATUS_VIEWBOX",
      "SENSOR_COUNT_LIMITS",
      "createDefaultSensors",
      "createLinearScale",
      "computeApparatusLayout",
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
    key: "app",
    file: "src/animated-app.js",
    dependencies: [
      ["constants", ["DEFAULT_PARAMETERS"]],
      ["geometry", ["computeApparatusLayout"]],
      ["animation", ["createApparatusAnimator"]],
      ["view", ["mountStaticApparatus"]],
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
  <meta name="description" content="Animation SVG autonome du glissement d’un mobile sur un banc horizontal.">
  <title>Simulation du banc horizontal — Animation SVG</title>
  <style>
${css}
  </style>
</head>
<body>
  <main class="page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">Simulation de mécanique</p>
        <h1>Glissement d’un mobile sur un banc horizontal</h1>
        <p class="page-subtitle">Animation de S1, S2 et du fil, pilotée par le moteur physique à pas fixe.</p>
      </div>
      <span class="stage-label">Étape 5 · animation SVG</span>
    </header>

    <section class="apparatus-card" aria-label="Montage expérimental animé">
      <div id="apparatus-host" class="apparatus-host"></div>
      <div class="animation-controls" aria-label="Commandes de démonstration">
        <button id="start-button" class="control-button control-button--primary" type="button">Démarrer</button>
        <button id="pause-button" class="control-button" type="button">Pause</button>
        <button id="step-button" class="control-button" type="button">Pas à pas</button>
        <button id="reset-button" class="control-button" type="button">Réinitialiser</button>

        <dl class="animation-readout" aria-live="polite">
          <div class="readout-item"><dt>Temps</dt><dd id="time-value">0.00 s</dd></div>
          <div class="readout-item"><dt>Position</dt><dd id="position-value">0.00 m</dd></div>
          <div class="readout-item"><dt>Vitesse</dt><dd id="velocity-value">0.00 m·s⁻¹</dd></div>
          <div class="readout-item"><dt>État</dt><dd id="phase-value">Phase 1</dd></div>
        </dl>
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
