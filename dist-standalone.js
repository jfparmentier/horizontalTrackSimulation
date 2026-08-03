(() => {
"use strict";
const modules = {};
modules.i18n = (() => {

const DEFAULT_LOCALE = "fr";
const SUPPORTED_LOCALES = Object.freeze(["fr", "en"]);

const MESSAGES = Object.freeze({
  fr: Object.freeze({
    "meta.title": "Simulation du banc horizontal",
    "meta.description": "Simulation autonome du glissement d’un mobile sur un banc horizontal.",
    "language.label": "Langue",
    "language.fr": "Français",
    "language.en": "Anglais",
    "accessibility.skipToContent": "Aller au contenu principal",

    "mode.eyebrow": "Simulation du banc horizontal",
    "mode.title": "Choisir un mode d’exploration",
    "mode.intro": "Sélectionnez le niveau de modélisation avant de lancer l’expérience.",
    "mode.ideal.title": "Cas idéal",
    "mode.ideal.summary": "Sans frottement",
    "mode.ideal.description": "Les capteurs fournissent des mesures parfaites pour identifier les deux phases du mouvement.",
    "mode.friction.title": "Cas avec frottement",
    "mode.friction.summary": "Frottement inconnu · mesures bruitées",
    "mode.friction.description": "Répétez les expériences et exploitez les vitesses et instants bruités pour estimer le coefficient de frottement.",
    "home.info": "Informations sur le projet",
    "home.infoTitle": "À propos",
    "home.github": "Code source sur GitHub",
    "home.license": "Sous licence CC BY 4.0 — Jean-Francois Parmentier, IPSA, IRIT",

    "simulation.label": "Simulation",
    "apparatus.label": "Montage expérimental animé",
    "home": "Revenir au choix du mode",
    "controls.group": "Commandes et résultats de la simulation",
    "controls.start": "Démarrer",
    "controls.resume": "Reprendre",
    "controls.pause": "Pause",
    "controls.step": "Avancer la simulation de {duration} seconde",
    "controls.reset": "Réinitialiser",
    "controls.playback": "Vitesse de lecture",
    "controls.playbackValue": "Valeur de la vitesse de lecture",
    "controls.status.ready": "Simulation prête.",
    "controls.status.running": "Simulation en cours.",
    "controls.status.paused": "Simulation en pause.",
    "controls.status.finished": "Simulation terminée.",
    "controls.status.blocked": "Le système reste immobile : la force motrice est insuffisante.",
    "readout.time": "Temps",
    "readout.fallDuration": "Durée de chute",
    "readout.impactVelocity": "V impact",
    "mass.mobileTitle": "Masse suspendue",
    "mass.select": "Sélectionner la masse de {mass} kilogramme",

    "measurements.show": "Afficher le tableau des mesures",
    "measurements.eyebrow": "Résultats expérimentaux",
    "measurements.title": "Mesures des capteurs de vitesse",
    "measurements.download": "Télécharger les mesures au format CSV",
    "measurements.close": "Fermer le tableau",
    "measurements.description": "Tableau des mesures enregistrées par les onze capteurs. Utilisez Tab pour parcourir les actions et Échap pour fermer.",
    "measurements.sensorNumber": "Numéro du capteur",
    "measurements.position": "Position (m)",
    "measurements.triggerTime": "Instant de déclenchement (s)",
    "measurements.velocity": "Vitesse mesurée (m/s)",
    "measurements.empty": "Aucune mesure disponible.",
    "measurements.filename": "mesures-capteurs.csv",

    "svg.title": "Montage du banc horizontal",
    "svg.description": "Montage initial avec le mobile S1 sur un banc horizontal, la masse S2 suspendue par un fil passant sur une poulie, {count} capteurs placés aux positions expérimentales et un support de réception sous S2.",
    "svg.ruler": "Règle graduée",
    "svg.sensors": "{count} capteurs de vitesse",
    "svg.sensor": "Capteur {id}, position {position} mètre",
    "svg.string": "Fil tendu",
    "svg.massRack": "Masses disponibles",
    "svg.massChoice": "Masse de {mass} kilogramme à placer comme masse suspendue",
    "svg.massPlaceholder": "Emplacement de la masse de {mass} kilogramme",
    "svg.dropHeight": "Hauteur de chute {height} mètre",
    "svg.personStart": "Cliquer sur la personne pour démarrer la simulation",
    "svg.personResume": "Cliquer sur la personne pour reprendre la simulation",
  }),
  en: Object.freeze({
    "meta.title": "Horizontal track simulation",
    "meta.description": "Standalone simulation of a cart moving on a horizontal track.",
    "language.label": "Language",
    "language.fr": "French",
    "language.en": "English",
    "accessibility.skipToContent": "Skip to main content",

    "mode.eyebrow": "Horizontal track simulation",
    "mode.title": "Choose an exploration mode",
    "mode.intro": "Select the modelling level before starting the experiment.",
    "mode.ideal.title": "Ideal case",
    "mode.ideal.summary": "No friction",
    "mode.ideal.description": "The sensors provide perfect measurements to identify the two phases of motion.",
    "mode.friction.title": "Case with friction",
    "mode.friction.summary": "Unknown friction · noisy measurements",
    "mode.friction.description": "Repeat the experiments and use the noisy speeds and trigger times to estimate the friction coefficient.",
    "home.info": "Project information",
    "home.infoTitle": "About",
    "home.github": "Source code on GitHub",
    "home.license": "Licensed under CC BY 4.0 — Jean-Francois Parmentier, IPSA, IRIT",

    "simulation.label": "Simulation",
    "apparatus.label": "Animated experimental setup",
    "home": "Return to mode selection",
    "controls.group": "Simulation controls and results",
    "controls.start": "Start",
    "controls.resume": "Resume",
    "controls.pause": "Pause",
    "controls.step": "Advance the simulation by {duration} seconds",
    "controls.reset": "Reset",
    "controls.playback": "Playback speed",
    "controls.playbackValue": "Playback speed value",
    "controls.status.ready": "Simulation ready.",
    "controls.status.running": "Simulation running.",
    "controls.status.paused": "Simulation paused.",
    "controls.status.finished": "Simulation complete.",
    "controls.status.blocked": "The system remains at rest because the driving force is insufficient.",
    "readout.time": "Time",
    "readout.fallDuration": "Fall duration",
    "readout.impactVelocity": "Impact speed",
    "mass.mobileTitle": "Suspended mass S2",
    "mass.select": "Select the {mass} kilogram mass",

    "measurements.show": "Show the measurement table",
    "measurements.eyebrow": "Experimental results",
    "measurements.title": "Speed sensor measurements",
    "measurements.download": "Download measurements as CSV",
    "measurements.close": "Close the table",
    "measurements.description": "Table of measurements recorded by the eleven sensors. Use Tab to move through the actions and Escape to close.",
    "measurements.sensorNumber": "Sensor number",
    "measurements.position": "Position (m)",
    "measurements.triggerTime": "Trigger time (s)",
    "measurements.velocity": "Measured speed (m/s)",
    "measurements.empty": "No measurements available.",
    "measurements.filename": "sensor-measurements.csv",

    "svg.title": "Horizontal track setup",
    "svg.description": "Initial setup with cart S1 on a horizontal track, mass S2 suspended by a string over a pulley, {count} sensors at the experimental positions, and a stop beneath S2.",
    "svg.ruler": "Graduated ruler",
    "svg.sensors": "{count} speed sensors",
    "svg.sensor": "Sensor {id}, position {position} metres",
    "svg.string": "Taut string",
    "svg.massRack": "Available masses",
    "svg.massChoice": "{mass} kilogram mass to use as the suspended mass",
    "svg.massPlaceholder": "Location of the {mass} kilogram mass",
    "svg.dropHeight": "Drop height {height} metres",
    "svg.personStart": "Click the person to start the simulation",
    "svg.personResume": "Click the person to resume the simulation",
  }),
});

function normalizeLocale(locale) {
  const normalized = String(locale ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function interpolate(template, parameters = {}) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => (
    Object.hasOwn(parameters, name) ? String(parameters[name]) : match
  ));
}

function translate(locale, key, parameters = {}) {
  const normalized = normalizeLocale(locale);
  const template = MESSAGES[normalized]?.[key] ?? MESSAGES[DEFAULT_LOCALE]?.[key] ?? key;
  return interpolate(template, parameters);
}

function formatNumber(locale, value, options = {}) {
  const normalizedValue = Number(value);
  if (!Number.isFinite(normalizedValue)) {
    throw new TypeError("La valeur à formater doit être un nombre fini.");
  }

  const normalizedLocale = normalizeLocale(locale);
  const localeId = normalizedLocale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(localeId, options).format(normalizedValue);
}

function createI18n(initialLocale = DEFAULT_LOCALE) {
  let locale = normalizeLocale(initialLocale);
  const subscribers = new Set();
  let destroyed = false;

  function notify(previousLocale) {
    for (const subscriber of subscribers) {
      subscriber(locale, Object.freeze({ previousLocale, reason: "locale-change" }));
    }
  }

  return Object.freeze({
    getLocale: () => locale,
    t(key, parameters = {}) {
      return translate(locale, key, parameters);
    },
    setLocale(nextLocale) {
      if (destroyed) throw new Error("Ce gestionnaire de langue a été détruit.");
      const normalized = normalizeLocale(nextLocale);
      if (normalized === locale) return false;
      const previousLocale = locale;
      locale = normalized;
      notify(previousLocale);
      return true;
    },
    subscribe(subscriber, options = {}) {
      if (destroyed) throw new Error("Ce gestionnaire de langue a été détruit.");
      if (typeof subscriber !== "function") throw new TypeError("subscriber doit être une fonction.");
      subscribers.add(subscriber);
      if (options.emitCurrent) {
        subscriber(locale, Object.freeze({ previousLocale: locale, reason: "subscription" }));
      }
      return () => subscribers.delete(subscriber);
    },
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      subscribers.clear();
      return true;
    },
  });
}

return Object.freeze({ DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale, translate, formatNumber, createI18n });
})();

modules.languageSelector = (() => {

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Élément de langue introuvable : ${selector}`);
  return element;
}

function applyTextTranslations(root, i18n) {
  for (const element of root.querySelectorAll?.("[data-i18n]") ?? []) {
    element.textContent = i18n.t(element.getAttribute("data-i18n"));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-aria-label]") ?? []) {
    element.setAttribute("aria-label", i18n.t(element.getAttribute("data-i18n-aria-label")));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-title]") ?? []) {
    element.setAttribute("title", i18n.t(element.getAttribute("data-i18n-title")));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-content]") ?? []) {
    element.setAttribute("content", i18n.t(element.getAttribute("data-i18n-content")));
  }
}

function applyInterfaceLanguage(root, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.getLocale !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  applyTextTranslations(root, i18n);
  const documentElement = root.documentElement ?? root.ownerDocument?.documentElement;
  documentElement?.setAttribute?.("lang", i18n.getLocale());
  if (typeof root.title === "string") root.title = i18n.t("meta.title");
  return i18n.getLocale();
}

function bindLanguageSelector(root, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!i18n || typeof i18n.setLocale !== "function" || typeof i18n.subscribe !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const frenchButton = getRequiredElement(root, "#language-fr-button");
  const englishButton = getRequiredElement(root, "#language-en-button");
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function refresh() {
    applyInterfaceLanguage(root, i18n);
    const locale = i18n.getLocale();
    for (const [button, code] of [[frenchButton, "fr"], [englishButton, "en"]]) {
      const active = locale === code;
      button.classList?.toggle("language-button--active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("lang", code);
    }
    return locale;
  }

  listen(frenchButton, "click", () => i18n.setLocale("fr"));
  listen(englishButton, "click", () => i18n.setLocale("en"));
  const unsubscribe = i18n.subscribe(refresh, { emitCurrent: true });

  return Object.freeze({
    refresh,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}

return Object.freeze({ applyInterfaceLanguage, bindLanguageSelector });
})();

modules.constants = (() => {

/**
 * Constantes physiques et paramètres fixes de la simulation.
 */

const GRAVITY = Object.freeze({
  earth: 9.81,
});

const FIXED_TRACK_LENGTH = 2.0;
const FIXED_M1 = 1.0;
const FIXED_DROP_HEIGHT = 0.6;
const FIXED_SENSOR_POSITIONS = Object.freeze([
  0.12, 0.24, 0.36, 0.48, 0.6,
  0.8, 1.0, 1.2, 1.4, 1.6, 1.8,
]);
const FIXED_SENSOR_COUNT = FIXED_SENSOR_POSITIONS.length;
const FIXED_MOBILE_LENGTH = 0.2;
const AVAILABLE_HANGING_MASSES = Object.freeze([0.2, 0.5, 1.0, 2.0]);

const SIMULATION_MODE_IDS = Object.freeze({
  ideal: "ideal",
  friction: "friction",
});

/**
 * Le coefficient du second mode est volontairement absent de l'interface :
 * il constitue la grandeur à déterminer expérimentalement par les élèves.
 * Dans le second mode, le bruit est appliqué aux vitesses mesurées et aux
 * instants de déclenchement des capteurs.
 */
const SIMULATION_MODES = Object.freeze({
  [SIMULATION_MODE_IDS.ideal]: Object.freeze({
    id: SIMULATION_MODE_IDS.ideal,
    label: "Cas idéal",
    shortLabel: "Idéal",
    friction: 0,
    measurementNoiseStdDev: 0,
    timeMeasurementNoiseStdDev: 0,
    measurementsAreNoisy: false,
  }),
  [SIMULATION_MODE_IDS.friction]: Object.freeze({
    id: SIMULATION_MODE_IDS.friction,
    label: "Cas avec frottement",
    shortLabel: "Frottement",
    friction: 0.058,
    measurementNoiseStdDev: 0.1,
    timeMeasurementNoiseStdDev: 0.1,
    measurementsAreNoisy: true,
  }),
});

const PARAMETER_LIMITS = Object.freeze({
  m1: Object.freeze({ min: 0.1, max: 2.0, unit: "kg" }),
  m2: Object.freeze({ min: 0.1, max: 2.0, step: 0.1, unit: "kg" }),
  dropHeight: Object.freeze({ min: 0.2, max: 1.0, unit: "m" }),
  trackLength: Object.freeze({ min: 1.0, max: 3.0, unit: "m" }),
  friction: Object.freeze({ min: 0.0, max: 0.2, unit: "1" }),
});

const DEFAULT_PARAMETERS = Object.freeze({
  m1: FIXED_M1,
  m2: 0.5,
  dropHeight: FIXED_DROP_HEIGHT,
  trackLength: FIXED_TRACK_LENGTH,
  friction: SIMULATION_MODES[SIMULATION_MODE_IDS.ideal].friction,
  gravityMode: "earth",
});

const NUMERICAL_EPSILON = 1e-12;

return Object.freeze({ GRAVITY, FIXED_TRACK_LENGTH, FIXED_M1, FIXED_DROP_HEIGHT, FIXED_SENSOR_COUNT, FIXED_SENSOR_POSITIONS, FIXED_MOBILE_LENGTH, AVAILABLE_HANGING_MASSES, SIMULATION_MODE_IDS, SIMULATION_MODES, PARAMETER_LIMITS, DEFAULT_PARAMETERS, NUMERICAL_EPSILON });
})();

modules.physics = (() => {
const { DEFAULT_PARAMETERS, FIXED_MOBILE_LENGTH, GRAVITY, NUMERICAL_EPSILON, PARAMETER_LIMITS } = modules.constants;
/**
 * Erreur spécifique signalant une donnée physique invalide.
 */
class PhysicsParameterError extends RangeError {
  constructor(message) {
    super(message);
    this.name = "PhysicsParameterError";
  }
}

/**
 * Retourne la valeur de g correspondant au milieu choisi.
 *
 * @param {"earth"} gravityMode
 * @returns {number} accélération de la pesanteur en m·s⁻²
 */
function getGravity(gravityMode) {
  if (!Object.hasOwn(GRAVITY, gravityMode)) {
    throw new PhysicsParameterError(
      `Mode de gravité inconnu : ${String(gravityMode)}. Seule la valeur earth est admise.`,
    );
  }

  return GRAVITY[gravityMode];
}

/**
 * Vérifie et normalise les paramètres du modèle.
 *
 * @param {object} parameters
 * @returns {Readonly<object>}
 */
function validateParameters(parameters = DEFAULT_PARAMETERS) {
  if (parameters === null || typeof parameters !== "object") {
    throw new TypeError("Les paramètres doivent être fournis sous forme d'objet.");
  }

  const normalized = {
    m1: Number(parameters.m1),
    m2: Number(parameters.m2),
    dropHeight: Number(parameters.dropHeight),
    trackLength: Number(parameters.trackLength),
    friction: Number(parameters.friction),
    gravityMode: parameters.gravityMode,
  };

  for (const key of ["m1", "m2", "dropHeight", "trackLength", "friction"]) {
    const value = normalized[key];
    const limits = PARAMETER_LIMITS[key];

    if (!Number.isFinite(value)) {
      throw new PhysicsParameterError(`${key} doit être un nombre fini.`);
    }

    if (value < limits.min || value > limits.max) {
      throw new PhysicsParameterError(
        `${key} doit appartenir à [${limits.min}, ${limits.max}] ${limits.unit}.`,
      );
    }

    if (limits.step) {
      const stepIndex = (value - limits.min) / limits.step;
      if (Math.abs(stepIndex - Math.round(stepIndex)) > 1e-9) {
        throw new PhysicsParameterError(
          `${key} doit varier par pas de ${limits.step} ${limits.unit}.`,
        );
      }
    }
  }

  getGravity(normalized.gravityMode);

  if (normalized.dropHeight > normalized.trackLength + NUMERICAL_EPSILON) {
    throw new PhysicsParameterError(
      "La hauteur de chute ne peut pas dépasser la longueur du banc.",
    );
  }

  return Object.freeze(normalized);
}

/**
 * Calcule l'accélération commune de S1 et S2 pendant la phase 1.
 */

/**
 * Position maximale du bord gauche de S1. Lorsque cette position est atteinte,
 * son bord droit coïncide exactement avec l'extrémité du banc.
 */
function getMaximumMobilePosition(parameters = DEFAULT_PARAMETERS) {
  const p = validateParameters(parameters);
  const maximum = p.trackLength - FIXED_MOBILE_LENGTH;

  if (maximum <= NUMERICAL_EPSILON) {
    throw new PhysicsParameterError(
      "La longueur du banc doit être supérieure à la longueur de S1.",
    );
  }

  return maximum;
}

function computePhase1Acceleration(parameters) {
  const p = validateParameters(parameters);
  const g = getGravity(p.gravityMode);
  const netForce = p.m2 * g - p.friction * p.m1 * g;

  if (netForce <= NUMERICAL_EPSILON) {
    return 0;
  }

  return netForce / (p.m1 + p.m2);
}

/**
 * Calcule l'accélération de S1 pendant la phase 2.
 */
function computePhase2Acceleration(parameters, velocity) {
  const p = validateParameters(parameters);

  if (!Number.isFinite(velocity) || velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (velocity <= NUMERICAL_EPSILON || p.friction <= NUMERICAL_EPSILON) {
    return 0;
  }

  return -p.friction * getGravity(p.gravityMode);
}

/**
 * Vitesse théorique à la fin de la phase 1, avec x0 = 0 et v0 = 0.
 */
function computePhase1EndVelocity(parameters) {
  const p = validateParameters(parameters);
  const acceleration = computePhase1Acceleration(p);

  return acceleration <= NUMERICAL_EPSILON
    ? 0
    : Math.sqrt(2 * acceleration * p.dropHeight);
}

/**
 * Temps nécessaire pour atteindre une position cible sous accélération constante.
 * Résout target = position + velocity*t + 1/2*acceleration*t².
 *
 * @returns {number} temps >= 0, ou Infinity si la cible est inaccessible
 */
function timeToReachPosition({
  position,
  velocity,
  acceleration,
  targetPosition,
}) {
  for (const [name, value] of Object.entries({
    position,
    velocity,
    acceleration,
    targetPosition,
  })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse ne peut pas être négative.");
  }

  const distance = targetPosition - position;

  if (distance <= NUMERICAL_EPSILON) {
    return 0;
  }

  if (Math.abs(acceleration) <= NUMERICAL_EPSILON) {
    return velocity > NUMERICAL_EPSILON ? distance / velocity : Infinity;
  }

  const discriminant = velocity ** 2 + 2 * acceleration * distance;

  if (discriminant < -NUMERICAL_EPSILON) {
    return Infinity;
  }

  const sqrtDiscriminant = Math.sqrt(Math.max(0, discriminant));
  const roots = [
    (-velocity + sqrtDiscriminant) / acceleration,
    (-velocity - sqrtDiscriminant) / acceleration,
  ].filter((root) => root >= -NUMERICAL_EPSILON);

  return roots.length === 0 ? Infinity : Math.max(0, Math.min(...roots));
}

/**
 * Temps avant arrêt sous accélération constante négative.
 */
function timeToStop(velocity, acceleration) {
  if (!Number.isFinite(velocity) || velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse doit être un nombre fini positif ou nul.");
  }

  if (!Number.isFinite(acceleration)) {
    throw new TypeError("L'accélération doit être un nombre fini.");
  }

  if (velocity <= NUMERICAL_EPSILON) {
    return 0;
  }

  return acceleration < -NUMERICAL_EPSILON ? -velocity / acceleration : Infinity;
}

/**
 * Intègre exactement une accélération constante pendant dt.
 */
function integrateConstantAcceleration(position, velocity, acceleration, dt) {
  for (const [name, value] of Object.entries({ position, velocity, acceleration, dt })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (dt < 0) {
    throw new PhysicsParameterError("Le pas de temps doit être positif ou nul.");
  }

  return Object.freeze({
    position: position + velocity * dt + 0.5 * acceleration * dt ** 2,
    velocity: velocity + acceleration * dt,
  });
}

/**
 * Crée l'état initial imposé par le cahier des charges : x0 = 0, v0 = 0.
 */
function createInitialState(parameters = DEFAULT_PARAMETERS) {
  validateParameters(parameters);

  return Object.freeze({
    time: 0,
    position: 0,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0,
    phase: 1,
    status: "ready",
    endReason: null,
  });
}

/**
 * Vérifie la structure minimale d'un état de simulation.
 */
function validateSimulationState(state, parameters = DEFAULT_PARAMETERS) {
  const p = validateParameters(parameters);

  if (state === null || typeof state !== "object") {
    throw new TypeError("L'état doit être fourni sous forme d'objet.");
  }

  for (const field of [
    "time",
    "position",
    "velocity",
    "acceleration",
    "hangingDisplacement",
  ]) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`state.${field} doit être un nombre fini.`);
    }
  }

  if (state.time < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("Le temps ne peut pas être négatif.");
  }

  const maximumPosition = getMaximumMobilePosition(p);
  if (state.position < -NUMERICAL_EPSILON || state.position > maximumPosition + NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La position doit rester comprise sur le banc.");
  }

  if (state.velocity < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("La vitesse ne peut pas être négative.");
  }

  if (
    state.hangingDisplacement < -NUMERICAL_EPSILON ||
    state.hangingDisplacement > p.dropHeight + NUMERICAL_EPSILON
  ) {
    throw new PhysicsParameterError(
      "Le déplacement de S2 doit rester compris entre 0 et la hauteur de chute.",
    );
  }

  if (![1, 2].includes(state.phase)) {
    throw new PhysicsParameterError("state.phase doit valoir 1 ou 2.");
  }

  if (!["ready", "running", "paused", "blocked", "finished"].includes(state.status)) {
    throw new PhysicsParameterError("État de fonctionnement inconnu.");
  }

  return Object.freeze({ ...state });
}

return Object.freeze({ PhysicsParameterError, getGravity, validateParameters, getMaximumMobilePosition, computePhase1Acceleration, computePhase2Acceleration, computePhase1EndVelocity, timeToReachPosition, timeToStop, integrateConstantAcceleration, createInitialState, validateSimulationState });
})();

modules.transitions = (() => {
const { NUMERICAL_EPSILON } = modules.constants;
const { PhysicsParameterError, computePhase1Acceleration, computePhase2Acceleration, getMaximumMobilePosition, integrateConstantAcceleration, timeToReachPosition, timeToStop, validateParameters, validateSimulationState } = modules.physics;
/** Types d'événements physiques produits par le moteur. */
const PHYSICAL_EVENT = Object.freeze({
  PHASE_CHANGE: "phase-change",
  TRACK_END: "track-end",
  FRICTION_STOP: "friction-stop",
  BLOCKED: "blocked",
});

const EVENT_PRIORITY = Object.freeze({
  [PHYSICAL_EVENT.TRACK_END]: 0,
  [PHYSICAL_EVENT.FRICTION_STOP]: 1,
  [PHYSICAL_EVENT.PHASE_CHANGE]: 2,
  [PHYSICAL_EVENT.BLOCKED]: 3,
});

function freezeState(state) {
  return Object.freeze({ ...state });
}

function freezeEvent(event) {
  return Object.freeze({ ...event });
}

function getAccelerationForState(state, parameters) {
  return state.phase === 1
    ? computePhase1Acceleration(parameters)
    : computePhase2Acceleration(parameters, state.velocity);
}

/**
 * Sélectionne l'événement le plus proche. En cas de simultanéité numérique,
 * la fin du banc est prioritaire, conformément au cahier des charges.
 */
function selectEarliestEvent(candidates) {
  const finite = candidates.filter(
    (candidate) => Number.isFinite(candidate.time) && candidate.time >= -NUMERICAL_EPSILON,
  );

  if (finite.length === 0) {
    return null;
  }

  finite.sort((left, right) => {
    const delta = left.time - right.time;
    if (Math.abs(delta) > NUMERICAL_EPSILON) {
      return delta;
    }
    return EVENT_PRIORITY[left.type] - EVENT_PRIORITY[right.type];
  });

  return Object.freeze({ ...finite[0], time: Math.max(0, finite[0].time) });
}

/**
 * Détermine le prochain événement physique à partir de l'état courant.
 * Le temps retourné est relatif à l'état fourni.
 *
 * @returns {Readonly<object>|null}
 */
function getNextPhysicalEvent(state, parameters) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (["blocked", "finished"].includes(current.status)) {
    return null;
  }

  const maximumPosition = getMaximumMobilePosition(p);

  if (current.position >= maximumPosition - NUMERICAL_EPSILON) {
    return freezeEvent({ type: PHYSICAL_EVENT.TRACK_END, time: 0 });
  }

  if (current.phase === 1) {
    const acceleration = computePhase1Acceleration(p);

    if (acceleration <= NUMERICAL_EPSILON && current.velocity <= NUMERICAL_EPSILON) {
      return freezeEvent({ type: PHYSICAL_EVENT.BLOCKED, time: 0 });
    }

    const timeToTrackEnd = timeToReachPosition({
      position: current.position,
      velocity: current.velocity,
      acceleration,
      targetPosition: maximumPosition,
    });

    const timeToPhaseChange = timeToReachPosition({
      position: current.position,
      velocity: current.velocity,
      acceleration,
      targetPosition: p.dropHeight,
    });

    return selectEarliestEvent([
      { type: PHYSICAL_EVENT.TRACK_END, time: timeToTrackEnd },
      { type: PHYSICAL_EVENT.PHASE_CHANGE, time: timeToPhaseChange },
    ]);
  }

  if (current.velocity <= NUMERICAL_EPSILON) {
    return freezeEvent({ type: PHYSICAL_EVENT.FRICTION_STOP, time: 0 });
  }

  const acceleration = computePhase2Acceleration(p, current.velocity);
  const timeToTrackEnd = timeToReachPosition({
    position: current.position,
    velocity: current.velocity,
    acceleration,
    targetPosition: maximumPosition,
  });
  const stopTime = timeToStop(current.velocity, acceleration);

  return selectEarliestEvent([
    { type: PHYSICAL_EVENT.TRACK_END, time: timeToTrackEnd },
    { type: PHYSICAL_EVENT.FRICTION_STOP, time: stopTime },
  ]);
}

/**
 * Avance sans franchir d'événement. L'accélération reste constante sur la durée.
 */
function advanceWithinCurrentPhase(state, parameters, duration) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (!Number.isFinite(duration) || duration < 0) {
    throw new PhysicsParameterError("La durée doit être un nombre fini positif ou nul.");
  }

  const acceleration = getAccelerationForState(current, p);
  const integrated = integrateConstantAcceleration(
    current.position,
    current.velocity,
    acceleration,
    duration,
  );

  return freezeState({
    ...current,
    time: current.time + duration,
    position: integrated.position,
    velocity: Math.max(0, integrated.velocity),
    acceleration,
    hangingDisplacement:
      current.phase === 1
        ? Math.min(p.dropHeight, integrated.position)
        : p.dropHeight,
    status: duration > 0 ? "running" : current.status,
  });
}

/**
 * Applique un événement après avoir avancé exactement jusqu'à son instant.
 * Retourne l'état normalisé et un relevé de l'événement à l'instant absolu.
 */
function advanceToPhysicalEvent(state, parameters, event) {
  const p = validateParameters(parameters);
  const current = validateSimulationState(state, p);

  if (event === null || typeof event !== "object") {
    throw new TypeError("Un événement physique est requis.");
  }

  if (!Object.values(PHYSICAL_EVENT).includes(event.type)) {
    throw new PhysicsParameterError(`Type d'événement inconnu : ${String(event.type)}.`);
  }

  if (!Number.isFinite(event.time) || event.time < -NUMERICAL_EPSILON) {
    throw new PhysicsParameterError("Le temps de l'événement doit être positif ou nul.");
  }

  let reached = advanceWithinCurrentPhase(current, p, Math.max(0, event.time));
  const fromPhase = current.phase;
  const maximumPosition = getMaximumMobilePosition(p);

  switch (event.type) {
    case PHYSICAL_EVENT.PHASE_CHANGE: {
      const velocityAtTransition = Math.max(0, reached.velocity);
      reached = freezeState({
        ...reached,
        position: p.dropHeight,
        hangingDisplacement: p.dropHeight,
        phase: 2,
        acceleration: computePhase2Acceleration(p, velocityAtTransition),
        status: "running",
        endReason: null,
      });
      break;
    }

    case PHYSICAL_EVENT.TRACK_END:
      reached = freezeState({
        ...reached,
        position: maximumPosition,
        hangingDisplacement:
          fromPhase === 1 ? Math.min(p.dropHeight, maximumPosition) : p.dropHeight,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "track-end",
      });
      break;

    case PHYSICAL_EVENT.FRICTION_STOP:
      reached = freezeState({
        ...reached,
        velocity: 0,
        acceleration: 0,
        status: "finished",
        endReason: "friction-stop",
      });
      break;

    case PHYSICAL_EVENT.BLOCKED:
      reached = freezeState({
        ...reached,
        velocity: 0,
        acceleration: 0,
        status: "blocked",
        endReason: "insufficient-driving-force",
      });
      break;

    default:
      throw new Error("Événement physique non traité.");
  }

  const record = freezeEvent({
    type: event.type,
    time: reached.time,
    position: reached.position,
    velocity: reached.velocity,
    fromPhase,
    toPhase: reached.phase,
    status: reached.status,
    endReason: reached.endReason,
  });

  return Object.freeze({ state: reached, event: record });
}

/**
 * Fait progresser la simulation de dt en traitant tous les événements exacts
 * rencontrés durant ce pas. Le temps n'est pas consommé après un événement final.
 */
function advanceSimulationWithEvents(state, parameters, dt) {
  const p = validateParameters(parameters);
  let current = validateSimulationState(state, p);

  if (!Number.isFinite(dt) || dt < 0) {
    throw new PhysicsParameterError("dt doit être un nombre fini positif ou nul.");
  }

  if (["blocked", "finished"].includes(current.status) || dt === 0) {
    return Object.freeze({ state: freezeState(current), events: Object.freeze([]) });
  }

  let remaining = dt;
  const events = [];
  let guard = 0;

  while (remaining > NUMERICAL_EPSILON) {
    guard += 1;
    if (guard > 8) {
      throw new Error("Trop d'événements physiques traités durant un même pas.");
    }

    const nextEvent = getNextPhysicalEvent(current, p);

    if (nextEvent && nextEvent.time <= remaining + NUMERICAL_EPSILON) {
      const exactTime = nextEvent.time > remaining ? remaining : nextEvent.time;
      const result = advanceToPhysicalEvent(current, p, {
        ...nextEvent,
        time: exactTime,
      });

      current = result.state;
      events.push(result.event);
      remaining = Math.max(0, remaining - exactTime);

      if (["blocked", "finished"].includes(current.status)) {
        break;
      }

      continue;
    }

    current = advanceWithinCurrentPhase(current, p, remaining);
    remaining = 0;
  }

  return Object.freeze({
    state: freezeState(current),
    events: Object.freeze(events.map(freezeEvent)),
  });
}

/**
 * Interface compatible avec l'étape 1 : retourne uniquement le nouvel état.
 */
function advanceSimulation(state, parameters, dt) {
  return advanceSimulationWithEvents(state, parameters, dt).state;
}

return Object.freeze({ PHYSICAL_EVENT, getNextPhysicalEvent, advanceWithinCurrentPhase, advanceToPhysicalEvent, advanceSimulationWithEvents, advanceSimulation });
})();

modules.timeLoop = (() => {
const { NUMERICAL_EPSILON } = modules.constants;
const { PhysicsParameterError, createInitialState, validateParameters, validateSimulationState } = modules.physics;
const { advanceSimulationWithEvents } = modules.transitions;
/**
 * Réglages temporels par défaut.
 * Les durées physiques sont exprimées en secondes ; les horodatages RAF en millisecondes.
 */
const TIME_LOOP_DEFAULTS = Object.freeze({
  physicsStep: 0.002,
  manualStepDuration: 0.05,
  maxWallDelta: 0.25,
  maxSubStepsPerFrame: 2000,
  playbackSpeed: 1,
});

const PLAYBACK_SPEED_LIMITS = Object.freeze({
  min: 0.2,
  max: 1,
});

function freezeState(state) {
  return Object.freeze({ ...state });
}

function freezeMeta(meta) {
  return Object.freeze({ ...meta });
}

function validatePositiveFinite(name, value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new PhysicsParameterError(`${name} doit être un nombre fini strictement positif.`);
  }
  return value;
}

function validateNonNegativeFinite(name, value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new PhysicsParameterError(`${name} doit être un nombre fini positif ou nul.`);
  }
  return value;
}

function normalizeLoopOptions(options = {}) {
  if (options === null || typeof options !== "object") {
    throw new TypeError("Les options de boucle doivent être fournies sous forme d'objet.");
  }

  const physicsStep = validatePositiveFinite(
    "physicsStep",
    Number(options.physicsStep ?? TIME_LOOP_DEFAULTS.physicsStep),
  );
  const manualStepDuration = validatePositiveFinite(
    "manualStepDuration",
    Number(options.manualStepDuration ?? TIME_LOOP_DEFAULTS.manualStepDuration),
  );
  const maxWallDelta = validatePositiveFinite(
    "maxWallDelta",
    Number(options.maxWallDelta ?? TIME_LOOP_DEFAULTS.maxWallDelta),
  );
  const maxSubStepsPerFrame = Number(
    options.maxSubStepsPerFrame ?? TIME_LOOP_DEFAULTS.maxSubStepsPerFrame,
  );
  const playbackSpeed = Number(options.playbackSpeed ?? TIME_LOOP_DEFAULTS.playbackSpeed);

  if (!Number.isInteger(maxSubStepsPerFrame) || maxSubStepsPerFrame <= 0) {
    throw new PhysicsParameterError(
      "maxSubStepsPerFrame doit être un entier strictement positif.",
    );
  }

  if (
    !Number.isFinite(playbackSpeed) ||
    playbackSpeed < PLAYBACK_SPEED_LIMITS.min ||
    playbackSpeed > PLAYBACK_SPEED_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `playbackSpeed doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
    );
  }

  return Object.freeze({
    physicsStep,
    manualStepDuration,
    maxWallDelta,
    maxSubStepsPerFrame,
    playbackSpeed,
  });
}

function resolveAnimationDependencies(options) {
  const requestFrame = options.requestFrame ?? globalThis.requestAnimationFrame?.bind(globalThis);
  const cancelFrame = options.cancelFrame ?? globalThis.cancelAnimationFrame?.bind(globalThis);

  if (typeof requestFrame !== "function" || typeof cancelFrame !== "function") {
    throw new TypeError(
      "requestAnimationFrame et cancelAnimationFrame doivent exister ou être injectés.",
    );
  }

  return Object.freeze({ requestFrame, cancelFrame });
}

function stateWithStatus(state, status) {
  if (["blocked", "finished"].includes(state.status)) {
    return state;
  }

  return freezeState({ ...state, status });
}

/**
 * Crée une boucle temporelle à pas physique fixe et rendu piloté par
 * requestAnimationFrame. Toutes les dépendances temporelles sont injectables,
 * ce qui rend la boucle entièrement testable sous Node.js.
 *
 * @param {object} configuration
 * @param {object} configuration.parameters paramètres physiques
 * @param {object} [configuration.initialState] état initial personnalisé
 * @param {number} [configuration.physicsStep=0.002] pas physique fixe en s
 * @param {number} [configuration.manualStepDuration=0.05] durée du bouton pas à pas
 * @param {number} [configuration.maxWallDelta=0.25] delta mural maximal retenu par image
 * @param {number} [configuration.maxSubStepsPerFrame=2000] garde contre la spirale de calcul
 * @param {number} [configuration.playbackSpeed=1] facteur de vitesse de lecture
 * @param {Function} [configuration.onRender] callback appelé à chaque rendu
 * @param {Function} [configuration.onEvents] callback appelé lorsqu'un événement survient
 * @param {Function} [configuration.requestFrame] injection de requestAnimationFrame
 * @param {Function} [configuration.cancelFrame] injection de cancelAnimationFrame
 */
function createTimeLoop(configuration = {}) {
  if (configuration === null || typeof configuration !== "object") {
    throw new TypeError("La configuration de la boucle doit être un objet.");
  }

  let parameters = validateParameters(configuration.parameters);
  const options = normalizeLoopOptions(configuration);
  const animation = resolveAnimationDependencies(configuration);
  const onRender = configuration.onRender ?? (() => {});
  const onEvents = configuration.onEvents ?? (() => {});

  if (typeof onRender !== "function" || typeof onEvents !== "function") {
    throw new TypeError("onRender et onEvents doivent être des fonctions.");
  }

  let state = configuration.initialState
    ? validateSimulationState(configuration.initialState, parameters)
    : createInitialState(parameters);
  let previousState = state;
  let accumulator = 0;
  let playbackSpeed = options.playbackSpeed;
  let lastTimestamp = null;
  let frameRequestId = null;
  let running = false;
  let destroyed = false;
  let totalPhysicsSteps = 0;
  let droppedSimulationTime = 0;

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cette boucle temporelle a été détruite.");
    }
  }

  function isTerminal() {
    return ["blocked", "finished"].includes(state.status);
  }

  function render(extraMeta = {}) {
    const interpolationAlpha = Math.min(
      1,
      Math.max(0, accumulator / options.physicsStep),
    );

    const meta = freezeMeta({
      running,
      interpolationAlpha,
      accumulator,
      playbackSpeed,
      totalPhysicsSteps,
      droppedSimulationTime,
      ...extraMeta,
    });

    onRender(state, previousState, meta);
  }

  function emitEvents(events) {
    if (events.length > 0) {
      onEvents(Object.freeze([...events]), state);
    }
  }

  function cancelScheduledFrame() {
    if (frameRequestId !== null) {
      animation.cancelFrame(frameRequestId);
      frameRequestId = null;
    }
  }

  function scheduleNextFrame() {
    if (!running || destroyed || frameRequestId !== null || isTerminal()) {
      return;
    }
    frameRequestId = animation.requestFrame(handleAnimationFrame);
  }

  /**
   * Exécute une durée physique au moyen du pas fixe. Le dernier sous-pas peut
   * être plus court afin de consommer exactement la durée demandée.
   */
  function advancePhysicalDuration(duration, maxSteps = Infinity) {
    validateNonNegativeFinite("duration", duration);

    let remaining = duration;
    let steps = 0;
    const events = [];

    while (remaining > NUMERICAL_EPSILON && steps < maxSteps && !isTerminal()) {
      const dt = Math.min(options.physicsStep, remaining);
      previousState = state;
      const result = advanceSimulationWithEvents(state, parameters, dt);
      state = result.state;
      events.push(...result.events);
      totalPhysicsSteps += 1;
      steps += 1;
      remaining = Math.max(0, remaining - dt);
    }

    return Object.freeze({
      consumed: duration - remaining,
      remaining,
      steps,
      events: Object.freeze(events),
    });
  }

  function handleAnimationFrame(timestamp) {
    frameRequestId = null;

    if (!running || destroyed || isTerminal()) {
      return;
    }

    if (!Number.isFinite(timestamp)) {
      throw new TypeError("L'horodatage de requestAnimationFrame doit être fini.");
    }

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
      render({ wallDelta: 0, simulationDelta: 0, physicsStepsThisFrame: 0 });
      scheduleNextFrame();
      return;
    }

    const rawWallDelta = Math.max(0, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    const wallDelta = Math.min(rawWallDelta, options.maxWallDelta);
    const simulationDelta = wallDelta * playbackSpeed;
    accumulator += simulationDelta;

    const availableFullSteps = Math.floor(
      (accumulator + NUMERICAL_EPSILON) / options.physicsStep,
    );
    const requestedDuration = availableFullSteps * options.physicsStep;
    const maximumDuration = options.maxSubStepsPerFrame * options.physicsStep;
    const durationToConsume = Math.min(requestedDuration, maximumDuration);

    const result = advancePhysicalDuration(
      durationToConsume,
      options.maxSubStepsPerFrame,
    );
    accumulator = Math.max(0, accumulator - result.consumed);

    if (availableFullSteps > options.maxSubStepsPerFrame) {
      const retainedRemainder = accumulator % options.physicsStep;
      const discarded = accumulator - retainedRemainder;
      droppedSimulationTime += discarded;
      accumulator = retainedRemainder;
    }

    emitEvents(result.events);

    if (isTerminal()) {
      running = false;
      accumulator = 0;
      lastTimestamp = null;
    }

    render({
      rawWallDelta,
      wallDelta,
      simulationDelta,
      physicsStepsThisFrame: result.steps,
    });

    scheduleNextFrame();
  }

  function start() {
    assertUsable();

    if (running || isTerminal()) {
      return false;
    }

    running = true;
    state = stateWithStatus(state, "running");
    lastTimestamp = null;
    scheduleNextFrame();
    render({ reason: "start" });
    return true;
  }

  function pause() {
    assertUsable();

    if (!running) {
      return false;
    }

    running = false;
    cancelScheduledFrame();
    lastTimestamp = null;
    state = stateWithStatus(state, "paused");
    render({ reason: "pause" });
    return true;
  }

  function step(duration = options.manualStepDuration) {
    assertUsable();
    validateNonNegativeFinite("duration", duration);

    if (isTerminal() || duration === 0) {
      render({ reason: "manual-step", manualDuration: duration, physicsStepsThisFrame: 0 });
      return Object.freeze({ state, events: Object.freeze([]), steps: 0 });
    }

    if (running) {
      running = false;
      cancelScheduledFrame();
      lastTimestamp = null;
    }

    state = stateWithStatus(state, "running");
    const result = advancePhysicalDuration(duration);
    emitEvents(result.events);

    if (!isTerminal()) {
      state = stateWithStatus(state, "paused");
    }

    accumulator = 0;
    render({
      reason: "manual-step",
      manualDuration: duration,
      physicsStepsThisFrame: result.steps,
    });

    return Object.freeze({
      state,
      events: result.events,
      steps: result.steps,
    });
  }

  function reset(nextParameters = parameters) {
    assertUsable();
    parameters = validateParameters(nextParameters);
    running = false;
    cancelScheduledFrame();
    state = createInitialState(parameters);
    previousState = state;
    accumulator = 0;
    lastTimestamp = null;
    totalPhysicsSteps = 0;
    droppedSimulationTime = 0;
    render({ reason: "reset" });
    return state;
  }

  function replaceState(nextState) {
    assertUsable();
    running = false;
    cancelScheduledFrame();
    state = validateSimulationState(nextState, parameters);
    previousState = state;
    accumulator = 0;
    lastTimestamp = null;
    render({ reason: "replace-state" });
    return state;
  }

  function setPlaybackSpeed(nextSpeed) {
    assertUsable();
    const value = Number(nextSpeed);

    if (
      !Number.isFinite(value) ||
      value < PLAYBACK_SPEED_LIMITS.min ||
      value > PLAYBACK_SPEED_LIMITS.max
    ) {
      throw new PhysicsParameterError(
        `La vitesse de lecture doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
      );
    }

    playbackSpeed = value;
    render({ reason: "playback-speed-change" });
    return playbackSpeed;
  }

  function getState() {
    return state;
  }

  function getParameters() {
    return parameters;
  }

  function getDiagnostics() {
    return Object.freeze({
      running,
      scheduled: frameRequestId !== null,
      accumulator,
      playbackSpeed,
      totalPhysicsSteps,
      droppedSimulationTime,
      destroyed,
    });
  }

  function destroy() {
    if (destroyed) {
      return false;
    }

    running = false;
    cancelScheduledFrame();
    lastTimestamp = null;
    destroyed = true;
    return true;
  }

  render({ reason: "initialization" });

  return Object.freeze({
    start,
    pause,
    step,
    reset,
    replaceState,
    setPlaybackSpeed,
    getState,
    getParameters,
    getDiagnostics,
    destroy,
  });
}

return Object.freeze({ TIME_LOOP_DEFAULTS, PLAYBACK_SPEED_LIMITS, createTimeLoop });
})();

modules.geometry = (() => {
const { AVAILABLE_HANGING_MASSES, DEFAULT_PARAMETERS, FIXED_MOBILE_LENGTH, FIXED_SENSOR_COUNT, FIXED_SENSOR_POSITIONS } = modules.constants;
const { PhysicsParameterError, validateParameters } = modules.physics;
const APPARATUS_VIEWBOX = Object.freeze({
  width: 1200,
  height: 620,
});

const SENSOR_COUNT_LIMITS = Object.freeze({
  min: 1,
  max: 16,
  default: FIXED_SENSOR_COUNT,
});

const DRAWING = Object.freeze({
  trackStartX: 98,
  trackEndX: 936,
  trackTopY: 252,
  trackHeight: 46,
  rulerTopY: 312,
  rulerHeight: 48,
  mobileBottomY: 248,
  pulleyCenterX: 1016,
  pulleyRadius: 20,
  hangingMassTopY: 260,
});

function assertIntegerInRange(name, value, limits) {
  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < limits.min || normalized > limits.max) {
    throw new PhysicsParameterError(
      `${name} doit être un entier appartenant à [${limits.min}, ${limits.max}].`,
    );
  }

  return normalized;
}

/**
 * Crée les capteurs aux positions expérimentales retenues. Pour la configuration
 * fixe de onze capteurs : cinq capteurs uniformément espacés entre 0 m et
 * 0,6 m, placés à 0,12 m, 0,24 m, 0,36 m, 0,48 m et 0,6 m, puis 0,8 m à
 * 1,8 m par pas de 0,2 m.
 *
 * Une répartition uniforme reste disponible pour les configurations de test
 * utilisant un autre nombre de capteurs.
 */
function createDefaultSensors(trackLength, count = SENSOR_COUNT_LIMITS.default) {
  const length = Number(trackLength);

  if (!Number.isFinite(length) || length <= 0) {
    throw new PhysicsParameterError("La longueur du banc doit être strictement positive.");
  }

  const sensorCount = assertIntegerInRange("count", count, SENSOR_COUNT_LIMITS);
  const positions = sensorCount === FIXED_SENSOR_COUNT
    ? FIXED_SENSOR_POSITIONS
    : Array.from(
      { length: sensorCount },
      (_, index) => ((index + 1) * length) / (sensorCount + 1),
    );

  if (positions.some((position) => position <= 0 || position >= length)) {
    throw new PhysicsParameterError(
      "Toutes les positions de capteurs doivent appartenir strictement au banc.",
    );
  }

  return Object.freeze(
    positions.map((position, index) =>
      Object.freeze({
        id: index + 1,
        position,
        ratio: position / length,
      }),
    ),
  );
}

/** Crée une conversion affine entre une grandeur physique et une coordonnée SVG. */
function createLinearScale(domainStart, domainEnd, rangeStart, rangeEnd) {
  for (const [name, value] of Object.entries({
    domainStart,
    domainEnd,
    rangeStart,
    rangeEnd,
  })) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${name} doit être un nombre fini.`);
    }
  }

  if (domainEnd === domainStart) {
    throw new PhysicsParameterError("Le domaine de conversion ne peut pas être nul.");
  }

  const domainSpan = domainEnd - domainStart;
  const rangeSpan = rangeEnd - rangeStart;

  return (value) => {
    if (!Number.isFinite(value)) {
      throw new TypeError("La valeur à convertir doit être finie.");
    }

    return rangeStart + ((value - domainStart) / domainSpan) * rangeSpan;
  };
}

/**
 * Calcule toutes les coordonnées du montage initial. Cette fonction ne dépend
 * pas du DOM et sera réutilisable au moment de l'animation.
 */
function computeApparatusLayout(options = {}) {
  const parameters = validateParameters({
    ...DEFAULT_PARAMETERS,
    ...options,
  });
  const sensorCount = assertIntegerInRange(
    "sensorCount",
    options.sensorCount ?? SENSOR_COUNT_LIMITS.default,
    SENSOR_COUNT_LIMITS,
  );

  const trackWidth = DRAWING.trackEndX - DRAWING.trackStartX;
  const positionToX = createLinearScale(
    0,
    parameters.trackLength,
    DRAWING.trackStartX,
    DRAWING.trackEndX,
  );
  // La position physique x désigne le bord gauche de S1. Les capteurs et le
  // mobile utilisent donc exactement la même échelle sur toute la longueur L.
  const horizontalTravel = trackWidth;
  const pixelsPerMeter = horizontalTravel / parameters.trackLength;
  // Le banc est relevé graphiquement de 0,1 m. L’échelle verticale restant
  // identique à l’échelle horizontale, le décalage vaut exactement 0,1 fois
  // le nombre de pixels par mètre.
  const verticalLift = 0.1 * pixelsPerMeter;
  const trackTopY = DRAWING.trackTopY - verticalLift;
  const rulerTopY = DRAWING.rulerTopY - verticalLift;
  const mobileBottomY = DRAWING.mobileBottomY - verticalLift;
  const hangingMassTopY = DRAWING.hangingMassTopY - verticalLift;
  const mobileSize = Number((FIXED_MOBILE_LENGTH * pixelsPerMeter).toFixed(6));
  const mobile = Object.freeze({
    x: positionToX(0),
    y: mobileBottomY - mobileSize,
    width: mobileSize,
    height: mobileSize,
    attachX: positionToX(0) + mobileSize,
    attachY: mobileBottomY - mobileSize / 2,
  });
  const ropeY = mobile.attachY;
  const pulley = Object.freeze({
    centerX: DRAWING.pulleyCenterX,
    centerY: ropeY + DRAWING.pulleyRadius,
    radius: DRAWING.pulleyRadius,
  });
  const hangingMass = Object.freeze({
    x: pulley.centerX + pulley.radius - mobileSize / 2,
    y: hangingMassTopY,
    width: mobileSize,
    height: mobileSize,
  });
  const socleX = hangingMass.x - 34;
  const socle = Object.freeze({
    x: socleX,
    y: hangingMass.y + hangingMass.height + parameters.dropHeight * pixelsPerMeter,
    // Le support se prolonge jusqu'au bord droit de la scène afin d'accueillir
    // le personnage sans modifier le point de réception de S2.
    width: APPARATUS_VIEWBOX.width - 16 - socleX,
    height: 28,
  });
  const personScale = 393 / 983;
  const person = Object.freeze({
    y: socle.y - 962 * personScale,
    height: 393,
    holding: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 - 80 * personScale,
      width: 492 * personScale,
    }),
    resting: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 + 140 * personScale,
      width: 266 * personScale,
    }),
    hitArea: Object.freeze({
      x: hangingMass.x + hangingMass.width / 2 - 80 * personScale,
      y: socle.y - 962 * personScale,
      width: 492 * personScale,
      height: 393,
    }),
    cue: Object.freeze({
      x: APPARATUS_VIEWBOX.width - 126,
      y: socle.y - 962 * personScale - 34,
      width: 108,
      height: 30,
    }),
  });
  const massRackGap = 18;
  const massRackStartX = 520;
  const massRackMassY = socle.y - mobileSize;
  const massChoices = Object.freeze(
    AVAILABLE_HANGING_MASSES.map((value, index) => Object.freeze({
      value,
      x: massRackStartX + index * (mobileSize + massRackGap),
      y: massRackMassY,
      width: mobileSize,
      height: mobileSize,
      selected: Math.abs(value - parameters.m2) < 1e-9,
    })),
  );
  const rackWidth = AVAILABLE_HANGING_MASSES.length * mobileSize
    + (AVAILABLE_HANGING_MASSES.length - 1) * massRackGap;
  const massRack = Object.freeze({
    x: massRackStartX - 16,
    y: socle.y,
    width: rackWidth + 32,
    height: socle.height,
    choices: massChoices,
  });
  const sensors = createDefaultSensors(parameters.trackLength, sensorCount).map((sensor) =>
    Object.freeze({
      ...sensor,
      x: positionToX(sensor.position),
      gateTopY: trackTopY - 118,
      gateBottomY: trackTopY + 2,
    }),
  );
  const rulerTicks = Object.freeze(
    Array.from({ length: 11 }, (_, index) =>
      Object.freeze({
        index,
        ratio: index / 10,
        position: (index / 10) * parameters.trackLength,
        x: DRAWING.trackStartX + (index / 10) * trackWidth,
        label: ((index / 10) * parameters.trackLength).toFixed(1),
        isDropHeight: Math.abs(
          (index / 10) * parameters.trackLength - parameters.dropHeight,
        ) < 1e-9,
      }),
    ),
  );

  return Object.freeze({
    viewBox: APPARATUS_VIEWBOX,
    parameters,
    sensorCount,
    track: Object.freeze({
      x: DRAWING.trackStartX,
      y: trackTopY,
      width: trackWidth,
      height: DRAWING.trackHeight,
      endX: DRAWING.trackEndX,
    }),
    ruler: Object.freeze({
      x: DRAWING.trackStartX,
      y: rulerTopY,
      width: trackWidth,
      height: DRAWING.rulerHeight,
      ticks: rulerTicks,
    }),
    mobile,
    pulley,
    hangingMass,
    socle,
    person,
    massRack,
    sensors: Object.freeze(sensors),
    motionScale: Object.freeze({
      pixelsPerMeter,
      horizontalTravel,
      maximumMobilePosition: parameters.trackLength - FIXED_MOBILE_LENGTH,
      verticalLift,
    }),
    string: Object.freeze({
      startX: mobile.attachX,
      startY: ropeY,
      pulleyEntryX: pulley.centerX,
      pulleyEntryY: ropeY,
      pulleyExitX: pulley.centerX + pulley.radius,
      pulleyExitY: pulley.centerY,
      endX: pulley.centerX + pulley.radius,
      endY: hangingMass.y,
    }),
    heightGuide: Object.freeze({
      // La cote est placée dans l'intervalle entre le support de masses et S2,
      // à gauche du socle et du personnage.
      x: socle.x - 20,
      topY: hangingMass.y + hangingMass.height,
      bottomY: socle.y,
    }),
  });
}

return Object.freeze({ APPARATUS_VIEWBOX, SENSOR_COUNT_LIMITS, createDefaultSensors, createLinearScale, computeApparatusLayout });
})();

modules.view = (() => {
const { computeApparatusLayout } = modules.geometry;
const { normalizeLocale, translate } = modules.i18n;
const US_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const PERSON_HOLDING_ASSET = "data:image/webp;base64,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";
const PERSON_RESTING_ASSET = "data:image/webp;base64,UklGRihVAgBXRUJQVlA4TBxVAgAvCYH1EI1IjGy7bps5FwAvMBfov2Dh40kaiOj/BPCnlflT60EBqrtyMRZawbX+SGNA7N7dO0DGKMtyr3aAkBLc60c2KA7fB0QSkCipAMVMQIqSpFiWgCoqBa+huUEs2y1lHSrYRcrkWBcpggtAReK6yKvWm1IS+6unYgIFdJB/R/sO2mjYp+b24o1saSe7Wyp3tgatPhTg0DZJ1sHbJLqT1po3zUmTDtnKpxxvVgL1Ru6t2clNlT3sG8mWPE/Nm9+rpVzIGl7zQXb0pAv+D0ntxWr2i+74i/Zmabz5rb35oUluVyGBvM15KmQGkt0EEpjRprAvaBcgGGAHhH98IkuRLEeSfLX40nrvf66kKJLHIymCoikej2RkZrJHkKDadtxIh1CDqro7PMQnuOba/6p6BXN3EEIIWJJtq2pW3N0T5Dvzn9DFD77xC9x3Tv8nAPzXzSlop/OCAvNt2G+wxsTvqDcIjRvcteDu3XmD+x7wq7iTCsG4e/L9aG6revXR0NxWJ88K5La5Mbe7X82m7Zqpa1y7a3clYe6fGSrc+zVv74zuqJtqPsiFc/d6wN1XAAAKHLfxd0nXSNeMuE5i3PtuujdfzbaawjNQlJiPeVXscWzl2sYanPPtmN8O380D5v0Zz84N/CF1uKEvQpyzqj7Ped3mn3s2OAAAxSo5/yJWcKJfO4eUqxdrlnOu+WKaBvC8D/JfP9cwt8VpQpJJMWe57DZuXVXEoOvn6Kdh8iCknHbN3Na9eTw8g2FHrl7ohUSzYDGn5qqKjXhlBFKEdEmxZxeLMdxQ8NoSzAv6AYZ37GKfCCwX+EohhdW+zwoWGhzVie2V/5vbxsbRWGEzN+6Sq0y4jVg1dt3qUDDxtS8kEhPJQBQUVPmI77i1JJFI1H7EabFQb443XZFIJPLhJwURGY1MGERiYsQ20XQa5/VQaeQKh4nEiAg7DnZYdSsbx1GFmEjEIQ7ZCB87F4ftplvFoCBYEJFItMl1ld26mfso1cnA0fWCjERENsOm73xX7dgxaBALIiIiSNR9ZQZtR0VgUJmYKIimYK7UdXWnjbFtwNC1ZIQRTUQHmcquF7A0udbJyJe74qJambAdPsLHtSj08Ty6C/XmhtpsbW7WWyLq8ZaQdC0D43iFr5APRUQhkyAsECjIP4GIiK58bEsKeUJMjHzR1yJCDzl6SKE3obcFkqkaJQInwuiSbn/6MzECVYhEcaNuHmt4Ox0mPCeejSZSo0nE1/fck9gXRWtCEURErwERIU9nGawxiYJaElE1KkOE7NyyAHMubSICPdNEQ6RogWqLCFleJIGILBeyjhRE1N7sBcKZtECZiBIdehI41ygWlDYRJXqNCFA/nFmIgl4o6DUiQMukhjRDm2oLdOiiQ8/klTB7D762OURBL3TRMhfiwgzwuuaAIqoEDERctMCROKDgXAiAiLRXaNBEgABJhAV6m4YOUZkGIJmcLnBsaRSiEBFIVvLC2dt0kUwgCCT32AK1JZA61ehpkEKItBbOamXjbKEEyQTKFWZflC9HxHVwZxAI/Zd3fT0iTN6++7cqX+KfEp/i3+J3Vw/DWGt0B7xPeXcy+XKpPn5W/47qS/Nv8V+fTjIp0ICvcEAqzgCOAj59+qfP6DnvOc9nBsBRwDloEL975e4rd527qgrAMq/0X4D/rxYIbSRJkvIJ/qS3O3vuEETEBOjoR30KMCGkQE5AkhA4iVAB+BKEAsQnKQmBcMlBGRTFyiTRJuhutQqLWoQe0VxJ3n77lGRzoEz9pX3AS3+z+CD7pgPwlC94CnmKNsc8QAfO1QpEg41tWErbyhOt3MVuYapbKTe1tMrmljC4tLVvdu22g26jDv5C4xd128lPdu3W86F/1G/8R36RwUYryPYkJLSCyGKAYN+QXEB3S6B/a9sb/n+rLkmW8r/ve61Ht4dnpLtUlnXV6dJ2q3bv4+7u7u7u7ud0H/dzWqpdq7s0uyqrMis9MnRHbHl0rXXf94uuzCO515Mv5z+DdeBuhTNSjRej1TinX3ECZ+Hr6vPqPDiJLxwCZ3wK9/GpHq4ju/BsvDf+FL5weuHd+MY5hbuMuwsOu/CNEziR+MLZuFtc4+5uWXifi7EsfCceOIFTjT84iYx74u4wPhM4iWfi7ER7j2e+ArrxB2fc9UjhjYwVdq4r8cTJwAl84VTiLh34uA/W11WDj89U4dn4xsnASXzhVOIuhcO4+0z1eM41rzLxPmg9OLVxh9o43ei4u7tbH7QDJ/HAqYWT2AsP2LYd2xvt374fx3le13X7YfLkiZqknaSYdtix8f1s27Zt27aN1xr0HXfeTtupETXOkzy6cek8j4O3bNuqLUmS+hhzrX3OuVdVDSKSmZmZmTnztf4i34rcw6OY+QOYmZkhGSqyIpIZPcDNTFXvPWevNYcFUAAQOokeSA0YG/vrbrqka3THsLs5G7uDUMJDbLG7u7izA8RWQNiodfffYKNzAvi8/6/cli1nPM9cu+qYmZlfgeWoX4bfB6d+EX4DfgUO8Q0wM6eM58K5VXuv+YygTjwjw89cy8xw7wuwmLEhM3tJjoZ5SM1DcnTCYfY9kpmuZGYfyVSRpbXNDHeb/53dEV1pjxu5O9xpM6TH0JCabtTSs82P+U7J0TrZHVFLy8xwtk5mZoZ9zAx1zbMia0WWVlrOepgZGq90GszMEJ3MKnMts1dlXuZ1Qjf3GWZmxobM7DK7uSvdK3Jrmv9mV0nOWzrbzMzMboYyN3evdE+zt3lIjo4tZrsxMtNJb5kZql5Cj8ze0+yoVdvMcDs1MzO7JNM0u8xl9n2ilrYpwFvbtmvbqlrvY6299zlomQAFkyyIghyIQEaktQW2xsbC5Gtxj9p7rTlG9y1JkiVJkm0RkZpHZFb1vX+7f6r7Oxr6E/rtHuHKdGxtO7Y9+7ftv7LNJG1GoDL/HLIyur9Nbfuzv8fW+73PMwGc9/9bL0ma8r3v+/f7HQ/NjIyM9KyU0q4saakur3Z3d+9+3N3d3V3a3d1Ku0uzS9M9IzMiMiJOxPHz+/3u+/43bpzE3QpnpB58fKpw2T2Jc/BDr+hgxVX4welk5TbuM8sapK8rWVbjT+AxPgeHg4/PJMup68Ld3d0hajeBkzhZuzk4gbsl7rblkWzcZXwmCn0SJ5dU7ebgJO4juLt74dSDVrHMxAOv8Zl68LguVu7+CO7WOOQOl8odVy4DpxN36dzh7tbjbl14PsvAydwmfnCo62LHLnF313pYudX4VKN9cDpwhwrc3d3dHbrxxKllPjgHJ5GNB9rWjk2Stm3v4zjP67puxH2HI9KoyjKfp83q17Zt27Zt27bRdleXnc6szMiMyAzdunCex6Hbtm3TtrWpovUxxtxr7X18vl9h27bNK8c7xJU+HHyIB4jXiGvbxm/zs/6DrTXn6L3VCK8ZRsu2bUvOGOtGfMq64PoE5b85yVXXdZHF2wPcl7LhpwcLpgMSTBf0CW46YP8EBxVsOFxIKy7dgoE3HLRRNReWH2lF0plw0kUP7XR+nyzQsUPVseHSSRfdNOmgYUNYkYKPXqhJT8AN49owPJENlz4YNCY9sNFMGzaVCzJAPKDoorlowmaFSitEkz4aF4o2quXCUmGPnBhU8OFGjyrgW5IkS5Ik2yJki8gEqJ/OyxfWL1S93++XbheKjSQ5kiQLr73XX1lOOmMCfF//t+qSrCn3fc/5yJLQjMjKrCyvXe/2dnd3t3+gjxo44l/gL2Bw5u5w5u7O6++72eWWWWmRYcsemfP+HbT9Cz+8Fu4WOC258df2GFn4rn32Bs7Eb5yaOInfJy07cNo7cXdIbI/xFJ6F18JnofvGqRuvjS8cCre2PNi4W+I8iT84awyOItF34jy4yw6cvXFrq4MoXF9JnCfOWDgLJwrdEyfwdskDXNrdAieQPUbEUY+xAl+HETjV+MR34dreXSc4bYkTh4kT64yx8Bun4gD3vfB29z1G9WE1XonsMQLnoc9i4QQ+kZZK3CUP2r2LMQon9xmJvJKJV6E1cfLB4SwXzi7cpcag3TvHIHFqHy6kJfF4C82Js7ADTQMgKZJjTWbmEZlV1SRpJI1mHtO3zMx43OP+s937nvfMdPqYmeHBzJM0JOzuqsrMcDdOkm2rtm3bKaW2Puba5/F7/4shzFIWWNlQUh6YsqYghpkZH9y795qztxoTAKAdvgf+f6+cVm2ESRIPIAyQKAJ6SBIC4ASADhKcEFAnAMcIVKVi/Apg76G2ZJ/xBJlrqAYaqrTEYfcqTowXggdJHdSQqiMzdjMBewR0EkB5CtwF4O9DW0289GbWC4rFnp7Y70ndJwYRRaqAAiLoDKwSVcEIKkJEaIJQgz5kA1HDaCFMjBqyF5kEDDSjYbEtms16Cn6K4XotgJZDT4S8J50pak8kr4QUYLtQtqRhZOmIlloSSZIJijYqjSD+uMTkqURZzicG4aZTDEg+RW5ZFjUlf0u672/G3QY1EBn5Kwk9dPDSvPQ5NBHjSAF0mkDPApApQJwEIdLp/GzP9rt4NiBNBAQ/RgkyGueM65qClmgbWcNOSZfSjEGptoYkpAxK6BpChJcAQgqkiHQZlFpkEAIQChFEFCBiRih0jkweFu1j7u0tc2czrgU4MIc8wnBfdDAoPQNAdRaPdXHq9VZ+kn0oIGG3bro+rgT05QDFJ+tECIJrSIIHiIgyCFaBY5UFGYGFGEAA2bGLnH9nGxhlkw6t2owy9NhWnnCuNjYpkCoERlNYUmy8jBISgEVZwJQOBKLEwpIUapn9ELPuoutdnCLcaVnXXQeFyfQUCuQwgcJTh1xcwPt3SjvKOltgLwAwuuWY1OwEIkAqoAQdILmN2JrEx4WWRtUUl1MIcYI0CAvdY43sQxy2/P6psIxsE9Dj/G9KrIg2Wlsh07Oow2YUTSsbFUAQSimfzrIQk5oELIDUpItlCQEnTgeRegyS6kz20977Ri8KjAyTteILYPxBoCbnCAZ3na5vA91bkpgzNElnl2qESgXkRumMA5Aa64kkATIiuYbU5tR4bohvD03TC3XQYgF3BBdhkDkEID3AcEoVKELl6ICa0D5IbUbdsnVbOH/ILLfOGtrKoAXbxpQz29Y+pCL4MIzQKIIwKEq/b1lgUatU1vbj6Rxx5hoQUA9VpLG3zddk+mUwjUArRYBLDwK5rPmb6BHDvgC6s2Ur6OickoyQ5RI+gya6nEwjYlMk1qz1xJDctikbh6bh9DMtFmEwBEJacItVwuNup5wyghJSBkgQAAU8iENNUJMwA2uFtCWjshDb3BiLDga35fy2dVmaAni1SW9rLID1gsnak1Y5jgCGB6gJBziDcaAWS0A2IafmKnaeDs0TMEJJAiD6IBJ+e3jSEb0SXxmmbd0orQgKAxElxmS8C21M71Lf7qVAToHcnTrumZnx3c8Udk/Nu1PzJlonh/g04lWhMQwJr69MIJLNikYqq04ZGcGqpFiIZYwkGngbVDtQg2oS6wFmXWr7GWY/LDLL5Itt+3JQhg96bLQHodVIsrUWMavVrJHqAIVUNTaSRcUwTmTIBIHBaVLVYqPGTJgbg45cr1b7rEdRXi+U38DUC0+Iv+IrBCnk15JiOp7OBNDYwfcPACh7u5SA++nsV7X2TlXJj4YpE0z6018lgzSPDyQ07psmp1UrqcnJfdSxJsCJgdoqa5VA1FxJVCWCQAgMBQMQvQFY85VkIjQKxByxRrLZ9go44HZhU2xzDpvEKBbb3QLaizQhLtJtuFaurSRoIJGygw7kbXluA6F4CA1ZQNdQqlAREEAkANl6PXCRfvFJ4syK3fSLT0jxIiPfT0/WuACAX0uIFGtNuuZkV/3xw50Of+pAADe/XYmxunH2Y+rx65ji5EJOTCHImaKWyDy0jv2JUyA15sLKSA0sPdrSKiRA0Ay2UcDmekA7+R1JwKpiGV2/isGAJR3EY+DM8fpKGaCkFstym0U2PCGi465tciG2L0Uftipk0CwSVgPIcHXNJ0zdpDTKSNukYxvmDgUoxiYrAZVTVmcpi+MrY+CH6wHkHTbsKdv/+c9i8QtEXx3YnUhr+Rkflg4qeVGtvVAvRdGnEgAZ+HZekRos0WcKMIaQ3slux/3ax2mBZycjkT1ELbKVDhlMIBH0IUu+laXPXPmEZdfb0yC8DnG9BNH2xvj4iA2ZspBzbGSESYteOZ7eeLEh7LhmcIqTy5devu/76Nt5mEf82m9rl3PKB8B0J4EJWhShnBuWb+lxyr2/fNuZIipp7WWmFhMg9NwksEjRtR338g1LXIzu2aTRr18PgNqRHrRbGBcxeLXNhYmdA0s5SwlvoksFhbqH9Foo12DQ0rhUA8h5OxXnkaBzPQnQBMU6AB5UI36ixU5F+kSJTVrToKWrLV62c1hr3Ky0jwOcYWVx4JSN7+1/d/tf9Aq6Y/m39+SPcpcHFqcPkZ+DlSJDXmHB1KJtGlDByPjY9qkpQiggFCilOEGYdjni7O7dr797P87pf/BaezcnP2kzJs4o4SEaK1ydX8t88prU4vAWaKlM9k8kpGyBG12geyMpFiGM2XbxbwmfiYQyNJ7vPRECkk5keIjjZOA0RdD4rGnVYODloRIhxVta6pgVhU1sfeHmOg9OcewO+HY2RY/Io1dTZ4II8ntM7m4zd++mnm8NOwMdGIvBfDEEhx0mU0ASmSWCQtCQGJqHbVM9nb5bzn3D+tfb/z5sZtm39l4fuPrGQpnY5uLfkcXa2PfAhGWsYjdDL7ghJSRLzHinYbikGOYZbF21+3Xa4z3jzde5rw5bIEFIkRtsNweqvZV2i2Ny1o29ndSyzG0L5CGFMjlNX6EhQnrJ9NGG2O4LC9LEOSlkIuI0v4RKEJWothZ7oHrHCVreTdsGjIODnBKhgNe3M2Pb/InpQptP3tyrX+rCinw7EuNepHldSy29T6eXMOXptvkO2jZP8VHwiGcVFpCiFyCCWCsBAYEsdNBkiBOd5OaCw/ksq8DI0JLz7jz9iw79dJZ8Zwe2x+bLahLttek+IqcaDYgSYiCAZnpkwhgpxwwHVg2tU6bd073HJY9885z+PuT8tJi5YXyvgwyAtdMdilZUVVVJMZpFOzC+upGazcghEmQfi3TZZjcan9t4kBy9ApEg6Q3znd18eUvowr0pOQxskyo8e2zVmQkSC6CuFGjk00JpHt2wsWz/4qGlviKzIXU9ALR724vTA4qeVwAMQygw48XT1s+jcS1I0QQ2LgLeRr4B6oKreiVt7YoBgLQcpQwxjolcd3dUt90FmnP2m3ngn3Xjj88jzpm3VBKTMOXyqWxqvyHsoSzbfMe+GzD2ejB56NrzbU9fUIh7r90425zx1dD1ZVGLsaCVHN4748KKl1ZoAsmTlXbIJ8lbUxtRWhMmT6Mz8pPTzs9uXwfLjGkAUzAvK7cwLFPXihJPLLfzhWxNtqSmYgQToB+AH0qBHD4ufcrtv9XUU6/gYUk+hUwVzXi6HsDat51OrJdJz+V/YUy/0Hb6dJu8/WDIJtgGGWPZjXqXD0hiwJWwtQTST+x2oEdnefGfpzbaWo8I+vg8Qk/nLt9ibM2brhvQNqRdpl49NUZUUMeJHIEWEtpsd7RIQN7BmAporLZWUJK2D/UMEDr17tePs3jOfe12rIaF7nnDywj3hri/oM7oUytC5QipNny6oeEXVFIbmPqp7SyNuWHndCbkpM+6Y9tF0YoThAAxrviekDXhagREYwnYxNvpHEqgZ9v0J6c8TsVqmXEGohCteXk6XV27Ajh4sNqhMw3nMQCJGDvdtvtabPFU6HHJtwthJAw3XHsDiZCGojdpYfs2OHzH8zhrIwyz1fEe+8/XSMUb1VnjV8Bu9i43Fr/d0ousS1nAODSGKvuJGL8cmjaw2lAJIiftqCs5zWEoZnCkTLpihisuWPD5dbDd59RHDn02G0yhQ1SmPGHH2Bve0Y8MlsRT5Xw9JMOrAY0AqskAoWijbfpFqB6CGtkpeV9t03/y1kP6HIpxuxEPkBo8ggacrqAjSoECzvOCpktDaoRiH/nyNHUr4l+JzNQKi/sBOp7TAXx3UBSV2YX9hlL36Hw1sY3Y/nPLDldCbG2duRn9wixiYjGUJRzxnHeTjt7e3qiXEJYvRRBgZnk8B0uK0boLOGy5FBXX8l5312WH9twUzpZWWD2sxexgUE1fnbfZCLcX5YgF3vvWfMFwNlqwvXJLpe75BFbaLfYtfpz+n4RE84RgCcssMK644NDZi26ecktB2+JhoQIUSjsRVCwRomnYmkZLvO6YfK2xspRtnyu8WoSHbdd5hrGMxY1wzlTcpy3EXFiEUzkcCU73bxuA40D2gNNEvf5Kz69PAag2KwO7L0S0nZiEN2GtBvHuQpcP8c9unSM7XgTlxcD3MfhZgqoGcADRwM7m4MHkfJ2dmR1YFa1ft4s8ubVunjp9yTtECpoj7cK0FAE9N27Nrwd137ZdBIeN0sgZWkVwQrFTz83Watl/mbY8psftjvnL0DF0GiDpK3g075y0/VgyhnHC2LF7uiB3qhbcHPrikv2Ce3wOP5kTO6m0zypS4Wf9SnefI8abuROKXOFsWXcbGAO9La/11hntfP+zJI541RrXNlFKdjJsfuFu8jkUtLkCZqsp8oeSf2wgyNZ9draYTsfrTTNiqyjOqgxALYD1bfc/WQWgzYSa0yehAoqCMdLrYdgy4hj9qTm/uNTHD5t8s/G1gLkhcUnVkhvNGgAnJdQxtTqjRRAxkaYvY5dLbfq5U55LoW8ygRhiFjGTb08xx7/4NJcI7HqZwoCwLRvRMogeetSZaXsgR/I629+8qloB6bEljdp9bdUrXmDVMlcmFCngcbpus0Cr5PXL5sf34ysZF9NIb3tWgTBTEiivIrH5GwefH/fSHNzG6TygrnC0n87GUwaWqk35CgWi6uDqu4DIANGm7IhRWHKr7fQpyYwehLQVkjgJlld7XB+0vQIZ3cMpdqlN+vKWHEisQp8Mg07Te2RT6AdL8cC+XaSDUgfrYIznswCuNZFWHtGEPHc9jLi7NSyJyl5BIkJk0CyS9tz56qRU5SLPy+X+4m3Oh639pqlb7XdIMm4an2yp2dK805qeGyadLkp4ELbQdjteMVFc1hY9uhNkh9tTSNkLCCTwxwJw2OjaqFvaqxPqaaMtpFfnE60UQ6xNLeWX/wpW5LZD72EPWLVbFistCMBl+uMzpO8lllUrtjJ46hLDhgOex3I25KjezYud8sVbeswvabBYprpVwHAMIIAz+Tuya4Zuk12UO0jB4MaN1IQIVh6paFHOiJzINl8ciqeMVyDJZA4CgX667q224K0LZSs2vbBNPdVip4WWcgficZrUgdCoiwhFdpEVLHAsWIb+QMQB1EehHkfXqbkCwH2msQjn3xQMuR4S6XgMSNAQBgE04gXMQExPrUtfxDZP270obAG9RsEMAqAq74QMwIcmFCBQLRJdU2Eq4Esr3YZsDshBsxxJCKciCaC4oY04iOiKZt1XzcMJYcEyRBuLjHDUHqsSiU+01ll3WzqxdDcOeCaUjmNtVNDhpeXtQ8if0O9Of8jVSvzs6B1ntN9+whGq5ZcZep6uB97AATguSmsIUmllmIHBnEWQXFwhMUog6wdGqZkQi81syueWqSeHYsCdpdlaMGT6bW43bPLJh+3XSnzrLje09++wu65CgIDA7fuNxKzEUEgriyD7pdZ1S7RDKA+ie2vWpNoeD6DEHFTyWaxVcgpH2fUA9HGWhCYBC5eaCNoo620MiGLfQIS6KJC+D1hK4VoMDSEgjHPSiDTkJqs1SFdGsQcY6uC4m4+VsuU6GLhYdhGVbiDIY9LUPELna5ZkpH4FZVqH9vZsz5rlrP+LWfFNCqxzlg3dwhpcWrYhrTjuZMly9A6oQAlovdVSRNq2Q8JKb45Z/0p2057mx0HKY9TDOEeskRKSbyWfDc8gLFIFRE6821qe0TKInc4WvXiALIeBAXJIhyqx68klHUyPW2cFAvsLrjptALGOQKxewiDxjFQ/sM4WZbtWJQuvQjwCWyK/VqsA3GMGcdaoxIJcGkDB8etBsQ6dzxu5+F8llqS44MVZBwhqZVy6fVGEUg9PXhMclVRpDhIH1ulu3X0UEj5yhWJIrBoWMHBg77CFdoAEIimDaLBhgDGHm4RFj5PHKgaBBeDhpD78RPv8PPQWvnqPJ3HzXfG6xnGr6LHv9j8zGvegcOhiAXkh59oQFIvMQWPHfoe1a/u7Q3LJJVXrhpQDMXa5tQQGKzxLrhPiMTjoDy8e4R612CCU4cZDSLehEeu0G8aHqEkIQZGQ3oGjfdsN3QFCDBKR46iaSkm50f5mH2zXud7y940dQxv7CwC5JgBYa8QEdM0AHX89ADR3zVwEJZnFIyM0SaFmG4eXjRDG6rEoWOadLCROjimmyBCXBi4Fk4V9GBZxL5+nYFtyEjc8Y6/jOseDAxGREIhKGGzrlo4kowfre23EtOpHwNIKHZLRO+3b88g/367vdtXldz/3uFvlRTCDgOIIXvelkPJFrrQYvGz/jowwB+Ihpv/T6bnOEVfYOa9fRgfrVqqVbT4CkSWfo5Cb1kW+a9mEXGpZa4aH4kVo4QTJsI6veOERNZ9CBDG2jAhcy/bDQbfunjAYPTmJUHVoaJ7kj5arrpb5HxSoIUX/AhjS46V5G55eMDb11JA4XXLY/a8HKmC74c7turPFU8mnB0nUJS3oC07AYNl6PJ0jvteTYkmpnFvo0Z62OyUxLBPcboI8CzcIFxzGCg5UsVoHiBsRVhth0DONL6WS5Ft+BScOtw7785MzO++sur3HPuB0+3869/0eDvvk52wCBCmjM4D6spnzzskNpzObHAQyfoQws6Wgmtnwkyk8JK9+DpVyoDqY2887OZTKCEUi36OjkUVdezdas2l9FAxxK8O1W9cs9NbigHPyMKH1ukTExQHP3eAMgshGlkFhUopB8MpYLA2rSTm2J1zd7XNt4LWAsQ3AoJ5O8OV2Y2KbX3m26ZWLZN8BQi29Ho3Ipzj35sLbIFKkmAtEABIn1IMgHN9tGZZbHBRGaS5Hq/AVRRwS/a0VoQVBjkQOdQkt150gkMB1wygQRhJWoUho6NK/2CBadHrUa2IurXpmdeB4aab0pbuSrQyJgezxXtOT1BbXBhyM/Ilo9IPJd9KlUSRUlmQcpBrjgDOR6wDoxBpKXTDhraNqNAU36ppbTZu2x9qN03a1+lYb0JIru9ZAkzErly93wuWSogakJWSYZGHIEAuOZdMj04rJN+Gww3bfv/xZ2/Ju7kyp702z+LmwRx6IDkQ7SOpET6eRkXRHpmxM02c3cKE0HZ9LGJX1RFLg/5TUaO/Zpt/edn3qnazceSdIERDZsGrQH/9yLfn4H18e1DxsLxBtF1Lg43CqyPWEJl18EESh7zknOFEIxCqHsNgypmH2ZxYih9iNpsRdgeQbXGEIuEDSPOSy9WsoxrBtevGQvyHzaqkKhGAQmE0oeCJDIYSIwlWOPIemYW6GWkmjFyOgUmr1L/is/XILQsRXqip0BQcAYAFMolVRI/qGp+77y9xvO4sWfNLS9bV8eZXneziKQdRHtZ80FUUY9SlNKZxSWbY/KEE0bnLU7MOEjYixlEIxBFLztg/0lSUPhQeh4FjPlmSFNBzv5PTkILZDP4+2b79V2Boo8mOcnYSIAJpS0GN4wPeG7f50bLt7URhsPJYgigYHIylGlfbVBWi5khjXMG5vddk2NPNzrIzSURsdqgUYBfU6EfHC0EFEs9hAs30aYqxix/gN4HOe7tpqd4MTQsAVAPQKghoMbCxZrsQWgwJB5j42SCAZ1nh9dLyPsjwlg9EchuHUH2nOS6FFSsEoNFCuh7+L29fCynGsAPdMJ5k0kmpIBupMM/6Ed5VfWfmAncmqfVm6sl75iBON4zqCJJDCKJRm2oQZJSFBw+eqSdj5YSPv1wTWlpaSyRc7gMXgIEaSJOXBU+UfBBRABWzu0TiToBd2U1m8EoOPNt8epnwONCoxNd8VcfbaSVzZAApwU6znFbLFcA3Z43dl2+dl5scHZXIB5Sa5nOcGOBp6FnI+qcYu+uV2e0hkwJRG7dFitVABAi5rKAwgHhAR1hBrgeM40pjtBokYUUSqHQv5bc5RHxEszIVDdI3TCeyCC/p4wBfUVCxN56z9jmWCXYBSLBxnLBR2RJ0rztAhxSIUlbefNRGKODDHpesjpx4Uw02RsCZhQqTYAySNWoQf7HVXzrhtH+tqHN2XWpUiT4+HSmdaVgOAlU9oUZKolDJXpkmDUkIUNRiGK4PPDTwo9c0JxUQq8/VqtjQCEnAS6mJ0p+5FwAIYAz/1ZAAS8eMDPpD8Si0/2OZTFzO/jcK5AuRauWJ3dlQ/UdDQghxqBseVBCPInq/jg4ldjsaLseWONA3FB8qoywxzLeREjbs32MyX0mfA9MIlSq5J2+b6xqWAC4dUCUFQVgHEdxzXDy1EkyiD9TTbwZhOA4S95XR2XpJOM5FheONszORspCxDsmxTNk0+RGc9CDWbsAjB+wrE+mWr1oMXI4tj13QTaaIA2OC15Q8dTlIHcxLlEWDQI7ATZ1a8+Ce7m+na9ThkBqa+Zc8dle5tnN7wUy+O2M2uGruHKXNhZsIwVQZDZeoJMBzEUG2Cav+GTNoTp2oTmta7+YygjtLiidWuaY0Vb8UqtUcD/F0PRpCOXOX7ysNJ8MTDndy+2/RzZee/oE357Cn/RJHQJEionX46ESgRyVMy/bS07lpjVYiKkPD9FS794p/NCaBZvvyXDoBPvkfY0R1Oaz7sCaWbDhgelOZLigsQINCywAMrNYNJJxP1ud3jVzDoH6S+bJ2UYN4Kha5wi4K2448sFhiXYrlRtAxlVde+rPoL34DCuASIva9EjAtiPhQd32jdkYZaKMxQpje2lKj2Q0NeXZ2sZEg1TnxL99Ez7C5TjVWdoa57zv/emVjqdhef+Fv9Dariczj+Ay3gWJdYwT98hMKUkCmzXZm6kalBkt9+BDkILNExi1BqKUr5uPxsr7YKqghjIpA3qlcd7Z0xF5SltgMI9lwqVFysqpnncpjMDfomPUR8aDpvO3yjXOQvWrK3lpl/xsZNALL1nynJEZqKSI2MDcuTCcQKQqEuBDLw+qHHweaRIVhxC5pcwGJnSLTI5K3Dalm4W4yD5xGRUUlg3UULaBJSw6TjI5r0JmVCymTEy6ozTSBjXgfN7GP6ggYkoYVgsKA5gA4lM2+aiHS5AVAYBs7wJwjs7oXcfhAq7H3VTeoMogs4AAxSVCp1eTKhD4OAkPsjl7+Td0HXwv59QQJZICszSGboge8u29E10z1lOelW7ZjSvg7jNCzxo789JCFDCFGEYoaJopZIrFps1xrejKHHe/+J8ht5nST5GXOrfwEn8Ryc8bhKGyADcJjzcPsXPU8CubfnmoTVvvXojOg24blw4G6kA2sg+kXErWEzZr5gIorkID04THh8BSSZVAPHZ4nEZWS5RLAMIK4k0C7e+22feY73MURaSoFDGTdTcaTjew1sxzDA93opBGAeStqIdKnqI1NciMmMEqtiMiDqsT54Uy5TArpSya0m2Zrmm6ZtZSyJXkg5VkV8XYrLovUiPDSC+VAHChoasWQ/2a4kDKK6rHiX0Y+LC7CFGPxVP+6/4jYaevms1IaltDNJ3dVvKo2QMY5coSDtHtb7mGFntHKXwbPle4fuQ5LcB6y+nrvuXBZW9suYZ++bTqfTNFThPDUmJBRpkMqMam3uFJUWl+fQA/ePgknRhqTj9pDBjdj4gUIKPZbvSS7H/OuNJfBCDQA+76Hi7DBG3tmXc2PH9JDpGu8G6AyS/DBJD9rJXf/FOZgUE8F6SQZxIQkTwwMAqzITmUXLWywY9cTIbLV0i5yxSEooQ774N3PTakrcRDCp7dnjWpZxhCCAoCInBx51nPDjAoF/acy5VrmDaDqTdcY0DmF48M/SJvJZdfVRTAY9rs+JNQoEaB9bcr2IlRjZpMu/uECoKne8wbDBlkvQrfyVmJlwM8TiJmWLKkV4oUZqc0rkgInVA5GI1HF32p6pERZpgxsjlAzzCABiI5olI46nvM6Gbc5ad90LXHvK13LPJ+1p4X1HpjdnaUohEhjqBA3WgIjp8hVXXFyb88WSuGUNJj3UsP2jdCGOcNcRXMggpYb0AipxXs0/fsEfy40S4O2eSWWlF1H/cui8ZEwsDEvh0WIsQa2seOoVNUjCklSPULoAD3ABxz2cMKzZi3mOgixxmThwyE909LOxRE4k3kgYONYpa79MGUCjJVkITXdwgaSBinPCHW/AE7rmtuCRLXgg1ZVq8UmN0rB4cMWNKy7pjvBYl0u8VpkQA6EWihKlNQgY8kReIBmGxvfgL6sXgIj4SGSSP+TNNVgxy6fxu9dCS3Ql59JpkTShipuTLE59BUWp00uYapblEvp94j5M59LpxMxUWh0QWy9IKXfP0YmWPqZj4gqqbn6z/CkD4+shC2f96D5t6OpvTjoktwtXr6EyI1QTQQgmWnMJITLH/x+d4Azt15hCty1majW1PdkbQWvcYSpqEF+GEAMNwkh3Mf+9B9rAKFQP4JaeKEHidfSvQFKnXDzd+3ds5hmBJRYdQDEZEQKr5tVCn7hZNQvELOJRIQ6rrOct4dP3xQXjuPd5OWJBmfMIK8uzpcQtc9AOnj2Ng8Eo+vb1AE2hnKEiKCUzt31vy6yblrkDfozf7RjAeIIMJAnYh5z0Eac94eR4KtPbxQ2t8kLW2+IGsX84peVhXw+Y6IL3lpoNqSL3+Ob+MM/i2W6QgLAseSCTYv0/f/ikFarjzmfcmWSQGbWO9mTXTSsr6boxs+OUi+EvrBFqDDgmSp1rCGyBBBjEMkY3up0VOaSwnqHTeYA+Z/3qOfP93yx94LLrdaLjRBA1DVW6GTkYZRIZtiYZsqzdTsyfiE+gxpnR9vv8xeoLQhNpHnneSg99YKQ0WUlTYZnju/abYAYF9XRPVKC+pE7s1CfaRb49GE89zHgCOPutB9EVf9XQ6d7p/pk1BAsEj7WnSVgVCM03gdYkF5osb2d5qkqYJxmAx8bbAjd1nfr51yWscEbewnD0RZ/nZ9BxMOz1vs25GmTfWCXJXaR3JL0RdvQTpXLby6tbSqf0HwPv/Kkv/6v76k+e3r2l/r6T2jtUicqP9iZ3/48KQnjkQzte10YArHIHhUkRmeM5ZbKsixMTcULFhLiIZMXeio0VemOJj6931PcJDrmiI1bv8jDCFpU1g3DpZetYDD31aByAolmqdYeQ3W4AQZofza/Pyu/+9ed++m8d9qirH44Ti0TUCdUMdmm6MaGrNM4wODGDBbLh9kfgJF3Me7D2Qgb5zUjDRlGaUQqoSJVTU61d9/7G56JF1wNY3vMw6gmWGdSwjh2/8kTMDpk4tOwsDRcj+2Ec+LDFeKidOwAOa5XMMmBLwul1algjMN0iAVPF8vGBIC7sWPRKTlocHf+Jugwvpc1QaFf8rLf3duXKOMJYTnu8N8x6pykrxDYw6SmZfCEatyI+AhsGoG4zjiegZKdxlgy+e869T/nzkGvu8ze574On1L7d2nsovVAUQYvDKIvw8kmQLDfmJp+yYQaU4aHhmJfr5wCehQAx2tmMoMmKTemel66F5e8Vff6/gfy/Mw5DSpglAU6pUbl7YlMKqGA6gfSKzY0Wm1jEkAOEtDREWigIBYHJWIdlgdtz877vkx045JE/96pcdfVTn8TKRj0CzOUFmpPXKk6QECI4D/uSLIy9kEdD0A9m0GBBnb8iEZNutwdvt2/I0tXK/m9BaRDDfL7HSYGu6fm64ce69dcv4ttb0RYlCZ887PopkBO47istuywJnUQA8QixhhM2gUgAsdrrGbadm5ZJ52mEFF/KuEXnY6zKyUxHOeS6i+7403/gY4M/r/a9q2u9Drkn6hitFzH9couvx7HFFM/59UzE27YemGCplX5B5JT198+Zr4d/5cp/uK/9OKXpV3fVuAoV+7WSEP+Z048VwD0Kim++lkFK2SAdQ4xYx3IJQOTJmFhxMc1/bJ23Deb/C2XrfzT98v9k2plfa+rWr2NrgcpGgQJzcDWzuAM8mhKmtO3cq4QA02m0hjMBqltTSeuVIWHrE09i5Y471Bu6pjrvaQ8/1StP/6Wvvn1PfRjSbp3Z80c/jk6eUK5i3ZBkjKoYI5hkDKIkKs5CsOZH3iO8mYxNlEGCgDRSXVzrccC90ArvBrCkp1GlH++eTk3PTdMulAIemDVi7TfXvHm66FcaSbjyr5buujTwQOMgQnnyZb0OuAVHOuggCkec5a9UkIW4PQ0Mo6OZrymlEjTPYKFFjF2CzRmGFWwf/j43L/b9dWMqiRMx7Rm0nW8FSr6zpwkpLLwloulOMpwhKbFT9dxWOJ3TT6/+H+akf3Bf9cNbuznxUjZCibEIETB8Pauk2aesdUFmwkSIic9pihsQSEWYTYseTPM+NPD/QeuTseXTv87Mtb8pCUDYdAZV1oNy+jSQyA0yMJESYB1yEnmK3PnqdT0f4Tu7SO9ULpgJFZFEsOIllLT2775pgkUczJB68vWHP5izfuHVv9tTntmwYA7JG8b5OX1eLymflnzfMRXZOUwFnMBCrqrfM3TQLSEGCCDIKolQq0N7jfaXTrFVxHCb1dMQoRgG2OSTT2SxSQ9giBC3KFYxbXt7Xt9AfNyu8qttjzubVsu/nyZUnIFqr4PoSpoAOKDKZAgMkeGYWercdscWnYMNhx17zIXjrLhNJPl5xZLtde1i9jsgA2m4EFMuL1DIvPuHwmEhKGuenUVRC7zVJqeEVNOUJBy+dBZYmuS2OeP9s+Gnc69/uDEbfu7nrfxwqEq9X7p8OCs/cG0JNpVbTqwhsEqFUZgdZj+U7A1ruth2fubXmRr+rIK0LthP5+ZvP5zE5gYgAaZxsIAwB0hSiqSL891a4pEa8GDtv8/X9q44znRvyLI3VNOqc0OHutkYURis9L371dt+5iN/9aty4T2vddpOf5976BVV9vPSJZia9Cp3GIMdZUJldKWYWB/UAg2KOpCbiiJkCIkwBmZ02OftB7mPwmR8AKC0Z4njenZ6QXrxL3nKFc64VsFq7bF7KVJtXXH9/cF+/PPVP/7lgPUrUN3NYJJRJsPt0dSh88ukP6wwHLFqiEOsSyIgPqsQQxNAr8TksdxUUFLHUHNA4773Fm9pHjJ1K75RPFPRY75IEPzI74JUSerTpDBpDF1zQFNBTjjAwU+YJP5xtcqc/dvN33Dpc7u5d6rF3JEZAk88MsSdSdWhz2k9C0w0cXGIGMfonYe6SvbU6uSnV1KaRsu3FLVskCAGg0gxfj7ViKkL/N3SO1CNcQjrXdW76uHYNlfxvbK3/P1AiQJxJA6RwO/r4IUSQEgiIsFfZg52MUtHusVpF3f51+x/kcpoXh1++c2F3BtzGRe5rRtQrYUAuG22IBbKzB2EZpuWzbdthsKR5dlECEETsF8Ay8ZqFP/e0P9lRQL4qGcxeJ5drHDyY4vt7eYSl9rtXBBKkKGOc/m564Nfr3n9Pm1XK3IQJENCOe0RCcpExqgj+tkysAonKKsltkpCJ8rVxKUVIaFZ6WXMM8pR1zUfcIij9x2wmr+u4SToCCTBlEACCcgKCJbhpXwN6AI80bTsNI1Fmmq4oXIfKqokSb+olNs/3wbswnJOS434FX64TVRSVsaFQDGl2/3SX1lw751wlr/xiHbkHdp3X+kr7jQIHywOSy4sACHI2h+7bAMx2K7hbp8YauN4ykVcND/Tajkpa58pvfe54rklG68QKV7h94WVO72o3bEQq5Dw6gwCO8adHdz3D5m76jnngUhYMo7PLCE3F+0A8/3oUj4dBKeKTNvid/5CJPCaKmgB0pPWdVg4ZJWw0DVEFpHafIPs1R3wa0N7FoEeCIKVN28Xv17itrh9nOm40zyDKzSH1wzZQVH1klqW0FJmlKEIQ6aSBiWWahOXAGUW45L6fX/BzgMcjM4yTDr1JAfLR/+9BQ17HubPlAdI2YZhLTajVACVGJcAZjLkvGksWc0s1a20lXYc8wpbxCV7PlDsAZI7mwACtmHBwU25b6HjE04fdDjKQJyJEwNgwLUdM6GSFicosdtdO7etEbvlmyiKA9WIXFdu5+GFvYUNtCUZFFNBSDlaJ/48UeS8VBoYWjnqUl50qwGsy+86L3/eV8uo/P0+xafGQU+NgpBqHhbtbikMmTmUz4fkcXWX7C3du2bVlnEJ+UlPumjOWEif83H8ly2wzbGAyTO7/oTJntF9RogpGNhQOpYmeqNJaG+kFbWN9u1i/FMm/0VFA1jfk6gcIY1zsliF3v27qoKhCa+S5E4AHK0DaSEozQ5QTomlkNBFhRB07vh0IEqIG5qp2ac9bVg76DtSz8s6jHGa5WZYCbfbp38HZIQW20kdhpQcRSMng4YreQAiHg8ZkPFnee8+o0KpgofkhdoWy9iLTiAEZ+pRGOZoGfA1I1nYoMMmeAEaQANxTlhX7KBSJd0yrNFUhh47t3ThUVmqdI3s2kunyjkrbDmojIFTCj9VSZ2hLdUeUn0QNZCEM8FMosJ5ioRACQwlSogEWC9ZqyRr79offBakpIDHwSpCJpLhpmpO78o7SzJqJ62pyC74exr49BkY/jHKtGJclzgl0uV8hv1m65XX3Pa5WpIUFcAAZonHQ7QNSzFbdy/EJ+FFI07Lj0pxX1itKMV/9Oc9iYTiipWok9Kthdo7afa9sm1fSqotTmUrCRGZrSExreSQzJDRQoWRNPSnDsUV9qqYs/52/xUMM0siP7m+MaVXgVaQs5G0wVKVr5R1ZMIEL4iFuIRMKt67YOVNqZCkyAv4UvXVzX8/bTZsLdbTIhllXF2DQktJxk26D+ET/UOUDMxC5GTS0ZGlHrD5tkqzch9YGWCZahxlgfQCZBAY5MOwIFZZmdYtrLJhMkDeAsMiLFJmkJPxEUOY+TCkTiilDDvjWMVifYLNV/2pl9ZRSkHE7jPKD61CgJQ5/im2uzKnW/PLtzNd63HZlSi9Zu2LQ/rTApejrsps+BN1ay79Zxag55QcgQrkUsao0apEuWFjJcUbpZAAHKC32ELU1gqdyH/a6L+gkwBaexCJJAiBMhus1oBVXTrOg4MGgQCQnsdMSyofhUTPEDHydtNEVXWk0HPYquDsYW6qqoVQAiL7ol2mfPc30CDzPDJGyyn8G/4FyGDCyj0iHIQAojCGmEvavA0SEDJEzkD12K4bvt2034S5Hy1gEgL3bjC4UkcquB53oqVa48q4iAb+sJCV3wbIki5aVsuxl85Hepj+Yfv6ZGI9+mPRon4VLUIrgmM3WzAr2F1m4ARyyeVTzARl/PmwlVAEYnTihUemNelKY2jbSfrv2aclF4w0YGcjgRLIU2vmSDQPekbKfRmSfCrLLk//6W/6d3/VE3AsJ8lPriwWuNsEO0OtC11zfQhEeskQoBRjNKiJzcjuG3iBHJptpJfuAGMlEk4G8G0PAqCrTQeDJbZSQkEHQkplM6TK/oQyCUT86FCIihDfYiyHjOmHFk44ZtCEnNUJpaQM949wKPOTJfzVJ2XeRPN1+MpmWXJHFIEFiZoQGLhDF2oeH+kT7G4ZJIPTkhurysm+tqx9405blEKoghARIJ6LNWaGb46aSi4inagGO0vndt7Dp0u2teSy29ebOpr+qiPiZewZ5RA4QrMYopVNQreZFB9rwJSFK5bOJxkhSotCwrTmWwmxiZhLzKnVBelFo2U47pGUwpn/M3JRwggpKiLcKU/R9tQYhuKAmZ/pDsgHGXqRnsvYYt90gWnedmmG2y6qcUIZIKNGRpaE0WwCrTmalqUrhPUNs8b0hOLqG1jz9R5x+/T1HgRACwHQjbhBg4iODiQA0xDK4G7qEEZjtn+E0O0FP+edzp+GSZUliUnkfoMOqxiz32kUAjbp3P11dfub7JMgw55l6Hgwi4g2hsPRRBJbOP1PeA1OrRsbq2SCb4EpTVc9eu3CesqdCN/SelEk80mSRgPu0deGJz3fEBPsR6fb0Dp8Stt5dCllGrBk5SUWz3kZERGKHQSGWGRyhCNa0TlH9Vc+5POsuOIHY8apxToSo+YBimkiZUewnjl5XM3G8tV0BlmyKJZOVIK0xWz0/MNdhGq5SplKr2UcdhZgNVzaZ2D7y8r1X/Y2FucyCc5VEUYAcdbEmQ6T2hNLF8NDSaFUUbxbjD5iC/yWuERX/Z3EP/oN5J9XI4CDPQeFK1iG3t255bUkSgXTps3zAHftYjxDj9rWIYpImUg1byNseE5a4IuQMSqzsBUeYkhHH7aQHEICmNO707346y/Znf66+VKDACuxo2FWOMlV4EQEKEGC0DP22Y9lebzsSl8Ny4qzfaZl9OlG6X46nZGhWn8uMUSZ5HGkEb91ZsTeTeCApoam+O+zxVnmjMALFgpkk4lE7FiFAKIiUBkIBKZWB7S4cg7HQHLWyVMuZ58/H7Q8jU3/2d30V2BRy8JJxCHMuszr5bmul0IkjCQgI5TkD3KH9/C90vOHbgSWs+NuUOSyhw5+McVLP503PPTeORjXACQoaHSqPQ22etfla3VBA6RYfl328BtgVbjheTrDd/rdMv8aAL/3HB9SooG4vQxgLMz8Ta+0mUG4tp4cnt0glRIg5iRh5hd5ZD6QNs+6U56Vi/MSShlCWEKESRLjRKObSMi7/+viIdXtr53lr+ku1nIdIGU+t3rkmHvDKKJDUU4jbzEPQgggt/yFS8o9L4IUbK0tzdjrQdIfceuy/RGz4zhlFkSyTN6JIKwkrpVfo/QB25xii14cFdTaPuiL/zilDEM2hrkwEaoIgkPUNDaGKmgxV/fnYe/DJlb0HJQtVwEqhyVT/ppftNXGqDSJzA4UuPtraubxl58pGbxrKcFCsIpQWjQokIRHGSVchwV25Fg1UK6oziybp9Ra3dMtXfKLZZSzemSYUgSCWSRr2rvH2v4VnCEZSmHa3jcU5GvOeLKCiDj8DvH51zIAvNVzYPeUQrHExmNykGWt3Ns/l988W2vj3CFanlKoMMMnQaRuefnWDUeLmppcJDTBjmE2JMjs50qrxGu5PRPWg8D21+76V1/0y90Dm4IV3Mk769SnqnfUDJqHZuiemfWERD1JBZUCabV02QqK+SO3nXSuN+u5a7V4CBXNvbWexo25CFp+sYZD26ej8C5zhmUtMhT0mvXMnQ+iYKkIlW2FbwaCGiFCNfXx6HRsZqLu2rx45HFWXUpZVuiIWD2vigxRS6ElsQirTV5ELUNfpAnLtGTPFculjJodPgVd1MAj33bUrgSLw9QHmCNuP9fZ/BSuMvA+P6sDgDw9yaQ0IXFClBIpEnpDIydVpNmvQYSv0R99gxwPxkwErdB8J/1f/E7sX7q90YOouOyCjHNuQ2veFJQ6JyUTOLwdBgm2bdrtsfYOU+eKm+XlwDHOdn8ZHNUAkVDKSARyKHCCCjkIPWTfJQ+A67/iy98MvzElsJlZfVa+1t7U/jZqnW8KEuqhD0Xx9LAQCWdppfeiHZIoUIqiXZASOoKSbJbcpyywzqKV+gPfIWVAw6IM062k5bDdGEhnr/s0BgdXPb0Iz/xNf1V7LvMwNs+eSVFZ2VgfTgpEjf33L4lnLSWNpVGOBQ0wnqvD7Jv+NS/bCDwlVxA7dpCdEgiBabSrisuQ2su43Qn98WgKVk5E+yuN5pFOucVtQ6ADejWOWgryMZybjIMFhwIJlNg4UUbWPAJx8GRn8bJ0GArhOxS3vw4qO70r/yNgBcp/6CiAPT1HIj29wTqse24p84z4AE0rI4wOoCX3GCiyYxptNaXUf35jNpfpu59iHTAkmRyOZYtQiaGUXJGMU2gsuZYPK0v8HPl1PHWVtvBO8R4E5Ih0OVrY41b59UweaSaT6XeW3NhLas1taFLF4y4anXmrD8rD012VN7a3UNbRhgt5i+SuPpTq9HR8KaiDNHfhXD5M5yFhwdQlyYa0CoZEFKO0JMaRxYHqwvSBDBvvNotdn0xWRetj8WiyjKtGHmNHhsQqUg0tD8TkHACtZ1iiB0bfPhk2ZBza8D7ujylF8ON7bpSyZBNqJlbr5D8OPtShFeKBGl6xfThSlkFA0kahu/GrFOJ0TctZimhPxgQE6DURPa9SqViO85TfZGXS+MIY7Gs35t8BjhDzr7cB+K7nAPBRZkRp9dM556jNp9SG1vCiPIZlmbefuxEfd/TOBnPFr/zTzm2wLe7IRmNtlhYqbBHzMQByQGtNECSwo2UY3+D09uwoPpIcLW3SoXM3RRO5jsgzLaW62Jsd/fVW8ye2/MjcboRDG56+0cOeHJGSkFtuITUyH0iZ23Qk0pbUaXT6nU0vhul46RVohH2j+154ft1PfjCk/NBeTj97xHS9QMgQpUT2sFJQRm8UW0l+bvM65tiDten7WavvZcQ5bXoYkfWg5Kr6JCIEEgHxix6X2xseeUtL04P8RJ/6jP1fdAFTajEKZeb7QgI9pJwrmXZm5i/vjLCW0SWMmahJhic5BQDWAeD8BstoEATP6pKVoIqefLMcG8tZlHFADKKMKQNMDaXIuKQ4zsnpoWlrX1ccfQcSobeirb6B4uuh35GeAxn85Y/ljJ/g1AEfh7Ix7jLuOfmyOPzPr9du4A5gh9TPzy2copIMJaXieTToW6Z3OpwbX3V85sDMgSDsSFAIHZ180op9Pgt+n8H3p3yfda8OnTAN+6rtLzra3i9I73bf8vIN270y9TCZBJHPDdGkAzbgFsZjGCdl3d+MExunu213Mx9s8nzgjBveRuuHpMbWyhzelekZvfAMllp0webt3t78vX23f77P6IOemz8//LABMJ2UNSQNZSWsNm+WR/897TdiLhcCyogJCBDGQZCcjCFMTraY5PUscgVjXLvYQ/NA/7j9K7otEb86FkjG+ll/33gKGrDYUK7LZRwJCbgJmSc85fVnoKwwVeR9D7nccg0pjk8QNKcZuHPZ9S20DmfBbCgD6Un0UTqS0k9gQKtGy2jV2Kjoj2w1WYXefEPT4T/cHcCaHgTA9T3v3v1//Jz5U7qOp5Kl41rD/m1gu19psfjxOuog/BLW2w1mYzqIuqqt2i0blqerTz62qs4CmJ2JvSg64HkxqbLMAZh32UOcgXvMwKvT/8X5fa96/IvX2fnlzerHjvUHx8YD1dyGS5jmc62frofgRVsPHmVff7vF5WGcWGpLaoSzKzgKzI2iBjmA0KtwDQ8rde81rq2XS6tC2qhVu8e3YeeeXuDur7v+41/vFT4YcZtSH6alyoQzByxoAIntt1sqZhRD46bHRZQrMQiE0gkUFgUlz04Nhnnryuhim1AFbafC2ibHwdDTkrKogpI/OTN+b7rGhlG0L20Ya4Dq/O72IsnnWikH7P/KKWe3EIQrnALVDlIcp1qtuMsORgFSJMZZAglFGaMEIkApcANCgIoxiGR1IcZNg9Gl6Y1p/0xp+Oe//bceBMXw+jjMsfev205fOzStoVhsiZHNfdhkZ6xqRthilCQLR3BvEvhyLZDL2uDKT+zPtmSe6lRfgzQEJQZIoK6uogJMFWCETGO1rBuBGqwRa9VxrU61cbfyyd2Yr1LNT7QoC/SvmY8Ue7/PcaG+V3fu27kbP93OP83/Ynn9NxmfDfvyXx124+OPf2dw4+JivxjBAl6ETBITUeODbdLJr1zi2S9d9ItfUc/9/TJN6f7wquvGzcIHz9x37X3YwgRldpCQhbSbo7bM9s9Zod3soj+5fV+0TStAPze2lbySudwirRKXMOV4NQtpfKubWmNcyKvd2MGLDHw2PTd+i5pQulUyfHRJXLqNQI3Pivdywt3cMuuz7+U9b/bzVBakQ5aqkQgs6baKshPiwLDvOKBCQqRDWfBYjEbULPo/ZqqtSACzexAANwP5XdwV9Tx2+OLUsnGKDyEPpVNi0gASZjAkcWqVO25k5vdMRtbi6JPrOO1KIhOIEGWRBx0ujgju5I4KcHBYh63jxlsGQ/iom5cTcCNL+yB82++PXfnW5Zgf30/dgkV+VvXn3vJkcyPwU2Xiv3b//PmB28BtcDlNG/peWsTQbr+k74bf7SYMqpb5nNTy4WIXHy7y6Y+mPvdBrrSuexcw0n0t615IFSKhhbT8m5dVWE/0pC+Bd55eNLyv21ooXGWQ/vacxkRBc/snw7SPGRQtVnEHQwXHbHUgwCSutLLDs+7Pw282F7zFNm62ACYIj+h4b0xqSS4XgE66m1cMLtvxgUWPSSIbreVKQRjgsBQ4IYGBmh7wi4ZK2m8NSDpRD1YWgHY9CAIYA06eflMaz7Z7unK35X6k2ug+ClkW3p2IB1cxGMRixE5+PX11zj6/Np+MB6ath/sPZRNJmFRWBpv2Y05IOYKZ08eBoThhWtfyoGs5P5i/SMReG1gkp83hLrGnmBVpsrjIuGK47HOVKA1vFu1NMoIwCFaB4ifxoU2SiQbMz/Ef2+bk3fN6/ivZcpnJ7Q7VIcwExFAlh+RgLlogR5L8AMTm211xyHaPlpGDECHsby1H54j6CVTgC6yUp/9CyIEKT4iZY2FZ9JCN7OBpeq7iJsSyba47hi3PA8AJQFIAQyApn2xt5xuqpRcuMmQnQrEeyMH4geEocJCahKDFkdoaSyuiZe8MMZjxT1ti/INzAXzeg+AUvslZiA+/CVPvxjNth3OW3JTv4yfCguhsionwprhEfH2dtX2tefPq2XsaQ/rbCRJsd1CGpiNGVocisw/gTmFdgbZQ3mEcm5t7NPylAXYxV01LyqGOjaziWTWkeKQSEsVYfXvu1GQFDsstCrBeH6PEeZ9yDNGSB1UO2T6yFi1ltK+GWy1GgMIVtGFXzSfjBuffdoeEIl6osoe5WkwqpEQtxBFdCJOi3LgYyq8ab3PdbRwMu8Jh5abX+1UM/Pmway3hQlpx1WPAEKu1H4h2W6DwP4E7b4KyVRBgsw/WVkJgS7WBaugGNtiQzcIYU6stS+T2CvyzWIgfeBRARk8CoAVAH0X0pbLKbJhAnhJ11xbckYZygeJEMeQy9Lm0z+Mhb74GT+cuVz0VVA93C6mAIlv1RmoSogC1GOimwAHcxbLMPg1jsIY9d2+32ZOpbigAmFQUnWWZQo1CL9RoKPvn4+pdIkh7EVjExxAB5js+g+AFzY54MRUNKQ5XeuPJm9xR09eFxTKfQsEdBt/mgGdtum5XBVBHaht7x5ATbvoECorjluGNx6qAWF5w1yXapQBdEzc/tyWTGzYHFj/T26wcmt4KSC3yMCBo3athJ6msOe/0YBW4ItyGKgoDoe+4OBBsOP+j3K+VlLet4kkbWfdiIpb0JrktB3D/wcngcWbO8yiA5EMWIoA5dKg5Rehx6mTl3sbuv7WQEWgJUHxyshUyw+oH91X2d9m85flyRnoog0hjlCR1h3CRCHP1VJVlK8F71jvlZph8aJXG/fDX+RrcArIsOf8iNTIqpRfoB72PiveaA2Qi/N1Dh9DKvu+XHZDiHJNAaVZjeXj4Hz95DikmwNnp0PyQwZ0V2eLGtROtMikWrCyFnIp8tYRUkHHRAz6NQccKWG3VusUuDqdd1kXBOISTl302lgrXU/7huHJbtZaNgNWCS0L3a4FAREcgC5RDzPAZKeR573335IHAd8KjpKLBDr+Gfe4cnmSn0oonixhItnu5r6k4kgBUHYwC8ijLJD3bIQ0BfNmEuaqQzlfokzLt3FXBlsyqkYDkxFrXS/M27nEo229lgjqPmyfVOmJdolI/dV8urxQWP7cEoibNsI6pN+/bj97RShk7TlvIVY4GCPDmwafjIopiRqORSGrfZUZpH7aaWslew3ERF8sp+2EENASGE/Yfk8zLd+ZtvXYB9kBAhlBx7PeD1TzzKSxxOW/NAbH/+TwzxckQHbOKH8QQwyyQn+NThjg3fblV+Mw47hzRWz+b+PpmlfbODhYDbxOVcslyaMVtdBYzEJ5KMEvCiDkACBtZBSnhlWy5IIhCJxhcNVqHsEzzg5hg35vTnFJmlNPUTx6K65ZZnZXqcA4GsPUgFKyPiZHEMvCQXwRFtfg2LvapC+53gk1KMXQTiCyjdKiO9gthiCsDj5ae9rvGyz7dXK0lCIFJRI02hWVcBWvfG978gxSSavZumOZC/Y9/HrBhSJCQmGy0KYUQonYZsdrDzYuyH/jRBXX0MBgaWKzY9DZeK/EBkkBKhm/Uz90Wv9FxMOV05y1g0abRD7uKEOTJ/8xgvki2lRlNnWHXEGqAYP1CFwVwUfwCpto3VF5kaPCfLJe3encIUQvqHi2SVkjgrvWOQ6oIsIbd5ILvRi4IMAhWnSw1eNzagqVHMm8hB+5Jw7Co558V3nvR1fe/NLL2b/RE4rjmZPF4kiUGgaDhuPUABmikBpqlm4u0hce2iiOEB+S4iaINQV1VrxtgCNRBUO+pU3Swqc1GwCQPQmquSimaD9/3z9939GVrtU89i+ZqrlqKHGHs1Li0CLVKKfRFryR9VBF4lT37gY9hr2eHHnr24Yksb+OVAXeChZQMbq0kZbewhRRbw1L5LGDu4OIx2dbvbJVzflVatKp2SQBV6HGqZ/zEpCGB8cyBW2+9benUf33pR9PD5W3fN8d0bk7wQK22nbB1gxbBWutZCqiIyweBxwJEP3DDMak2HPCwNUnbZDjxcZv/DoqPX8AURhD87epRWz4UAAcAZCmJlNtMP1vmHSMzrQIAvQ55BDSxDJ0QFjw1SE0E6ZWOkdRXSYJ42CPObPOIE1yWY+zz+uIijXGqhRXWEtri/dyDd/CAhzE2sAGthVB2xCfoSMZQwFBmaorAUGpd8m1QRVnAL+El6IdD6NW86ILAHpJEMg9v/VcFX8DJMAfeWw+0zdeAphpYyKCyyQkZU1Eez9iJIcRBgjkLHiQivig7SBip0QtmJdgASqhCZaeLXXaZyt1fkksKjYPPmYyJDgEThA0TiMiORAiwG5DAZtv7ysq974bBmB+ELno4zNlIaJtA+EPst8C8R6Gch3Ff9CgAhiASQfoTbYedSAyGx/xDAbAXD/kAmgoDNyQvJ1q0C8EG1sBb7/ErxqaZJyOSKkRJanujAwcc7m+vnPmBpOTFFI5S0sxGhXnzXn75qUzDa2oCJefVNhmcXUAZA0cRIyWjFAnRb46SZ2SEt2UmkAVCiZx65NURiJo7BDCJSKfytt4ydBNSkIQO74SiUg1ymVrOVtOKaAGZlQV7x4/igHc4Y4YzO3eHUdhqZV5wYCK5EGpIDdQBH9hOTqf7idX3eXoeay+bP/MDOMZy1T4SQINEd4AwAgiJvTUTe9o5YdSCq5ELIwyDwA2ck6Pq8HJI0GXjm9uWl0TkId+1i/6lkl1u/Di03potlLOH5JYoOebcNJ4kkfNhD4AA6or37G/cNALXdl7tHYyl0/tM2Nkxt0NrHg5vf8rGe6m78ovjLkp/l1jpnb/vPHwfDS7Gtj6/OaqWZTYyHoy4iQ0VEyhRZhki+iXlBZiMq8q7YQ39cmCjFHNr/f0CaEzTY30EdIsZI3D+qx7qKea4zT1vVILalVZSkTZ0i4oJM90iFACq/SFmGpuzcTA7CxyKTBwglarsvbA09pP6j7Ktv/LLXliOtqbHUHn1/dlalSZJtb5SbmKTt90T0XdDxw8Q0asQE6lFK+30kxST5vXCgnxxxDelR44lh6b1F4uOB8hQUX/2BARsp3N0X5fNnxZcBhKgWL35SsVc6taEMZ0arZBNt6hkymdkcCSl5lKXMdKtxRbvF4e/l4Xw0DEqMS2Q/nDoBYlXN3GzUlGr1fJDFcqeF2owvKJoIRLhmiAIak4UOAADlN7GVK67EOTb3pT5RDIG7BA33poffZOhNR1SHKrQFzrGyzKTmVAkqIxSMqyjnB31vLg+EXKs5c/PySMrbmWqMKyV0FK0lREpk6RKzk4wgZ0gX+SLFeDgOq4fho6DfvUCZ9grn3G3c8EgMzQLGkS10HL51x6WyWXR3nZusxypPYEC76A91DPILkU5sUiP+srKZhod2bcvbe+grDpGct2tsExllSNVzIEMn4ihjW7lO/ys+/BzxtVhyqEBTPOWZO0Kee8BQKDJEtUMgtZoog1iPSiHuoRrCUYBus4aDJyy9AI+DMYhnblY4NGLJPQ2p1nVuyH2Lb6ynOhb6xK9qXMEx/dDJANiFCrEEEUiZYKjgKCUsQw4B/o6U3wD6Y/CLfPei0tkcDikNo8Zk1pvGRMZZYggDTrilOBalQJnwEHE8QvGLxi/m0dgT++dCyoQ8JQfgQIh2bKQQrB4Py04CnlTQKgHUH4IImRDGrwA4O3rxZCDT5Xft9kfxWafWbyVdQFJH88UKkkwPc0sq7YeV2YdTBW67NU6xVjEgFMThzN9DjL8y++0cKqVkYHYzDjwHK5BNDBSYkhoo2OIUYH0kmbVZFlTGNzFQenuY+AEoRuGzsgzUgwUxjQ0RheonOrWsMY+Jp9rweQr5uTpPZ2BVcdJuDqShSRMwgTrIUpCQkTK+DJJpETdlAmqhGhBo+zofxRWh0a+aium2xTTSttB88bbRk/IIIrATlSy1IDLZw7/x6d37596C76Qumax71Ss0HLCtSucCrgR2PgwiCBEe9LjaEImIQ8wDoU0Za8tbIUE/AUegikpB9B5CjTteiSRkAI059SWIfa/KgvvDS1nN5mCsFCYVUMUKi2OhRyys+khRy3FvtcqrZJey3V1MhZ4Lx1psOl7/uYzrcotGtsrZboZ52EhVdMEgCZGiEB1EAcUmQ31uN5ioDDciiIIvEgKynY5csLlz0F8kIQijcVYximdMrhohzRk4qZwLKWK01nWqdZsREjLERJSuYPIxHSoRalky2AoY2wQg4gokTLSEPay/UQloveQ3If9pAbO07e83igvu9SCcX1LtSXcpdGzQFllpyKSmfv1VX/64V38o57kP1/e6m9+k9ub4wxLAmgeWpaTY+QQqhVmUo6C8uigkgFJurvICRQ3kqbu2814vTUdt2c7JDFQn1gxPDscdQrYGIdXANiKGvYUA74rtdhTJ3/itPPZ6UqPkGtsly+9UDdaLA8slsmTEMCBqV8yDVLVr87v4q1LdPN6WseQEf44PmzSid7HbxIMfvL1oF9Lfn2cYWegrsuTUUKxw7YDHtbKYxHdiSiaiDDCKNUoYtFEVBLjFMMocicmIkIjMOLlLObGKKuaFFsNX7o5TCtOqWZoUrSsvHwGCzI5fF5MNnMMZ1kMQ5CVz6e1tTtESFGsz0skRKpWp4OebHkEqdVx7LuYtotrnCMPKM75jOmexzllZlnjL+lOViI/31sRagcpI8gCcSaxljN4J9dcvZwl+2qxBkyPrBIJrEcKkkzsg5/okSsW+joCFesFazw1w1BMjQd5EgLLZFnw2iu6QmF6nQ9g3SGJoMqt2O5Vbv9EO+QH1QTgSKxJvF7YlLOnrb8zqcMm7k9XfnuTI9n2ubv0TIzYooiuAAtVUsnO1IkX61Mu0b1UqnVB6xDqgCSrTebmrvfjxUf+sbda9dT6xxK8o22NS4ASSjSBEgYQuxKu8xH9yEKNoilQI87XgSNCAOXIcSIQmXDKBFalMILCKFxLs7e85TlUBl2tlNWmwu+yqgk7muKcIdq0LPvE5hJchUiLWK/m6SZAz0NPeiCieSlBkc1QysWEEOwQ3OTgDipeVLzrmnoesnbDl9Bm4UlWTC6Z7KI36hV1aW9cStYOt/r2PVnuGfKExTPhGnHzcPy0Iyfso4XN3l6GLgNPuvKk/Tjc10/ORCiFOCQAKuO3lb2Qx8P873/Eb0Ar6t3vBx6SUzg+JAb2uTLzicOixanzYaxUhzHlXJm0e8GHJptTvEb749j9bVPWYsfLW3J728MfRAwzdsMpuG2lDkw4wjdXUruA1Cr+fgwZL2In3e3Hi0OfF9jCtJQD9RmyexhuLOtgCcx1HNtHCZMoEaKDiEARNWoUiIkkBjPPcUPPcdB1CM2vOhEoEr5AMbZyvHDbhu4wmauBrqiIkcy5pjaeh7xdsfbfQBUeTItnXAEOHb3zmD4QaCJ8AyQCgR002Ena4YRWlJlI55i3MMY6Zo15lHbNSfce0s1fJX+Ikfl2JnKCZ31/nkTnkfgEyojtGWda0FdqLLBUiknoEWxMwYpc92PuJy2fV91ikjB6DlG5pS1q63x86P7RKXfPioW/AXA+HqIBfJCZsJtO6LX5X1CmnDwQPMTydsLT65182rQ30S8027z92Outokxj8ytLDlofa3sqwR10Sp7KoVtRJs/p1IO1J7VoyDCk5iaHwybeiaW35PVYTAXDUQsCvIC6iGBcgEQuEkjNnVjr4giulQBqWUMtCNUSMcRwnhBDGPpDPqH5DoFVl5xOJfTQ9D42G171TOMSTBoqml09vjoQ0pUS26ujcDJWdisz8QwpJmZI8lY1BCKDpk5HQ5Qd6jSDeBLnURKaeGY3RIikgjfsbGGNteY3fy57rulfLJ/kM3AnGGYG4tIS05ey5DZaT5d9edzgmJZN2AI9vRA6cghzARSQc2MsbRgUDo8OOSkdQOQOIodxKJn7aL9tuVuWehCFoT8BcAYewhm8GnK/HH8xtvjUk9TkRFU23uMZIEMmOU34Btk6H9t1r4b+0NJOqtU4tgDay1hVq2ipHENlLK30TLNCY9cywjmvIdNK2NSeR/7WimpO3kkwVwUhACEEGLTBw7HcdTiwDm0cQUdp1LVFgcAgYihCitSBFvlAcYiUKPKjEInYF1dUEMGw4Vlqegetw6YUckUO4AAYvuQKpiVTpfe85IKPhddaWyagPODNeLdspYj2PCqbGUgtk2YLQMtIZWS9E6aUySBi9rldlV+bP/tj+mFt2MXn9ClfelAOMoRYXF+goTmdkX1L0mMscda4mO6+FNRmxeS+DiAFTNIq3/kLHJ68B2+ftIWITmAp+hHgLmAfpIMetT23NuYDWIeHdACvAHozFAxp/LpN+VhJxKbkUJKcIhFnUiu6bwKNwvRF2fdGlF6ePV7tlK3dMoaxBB/C2M4W7dWsDUof15vv6Pb/1fnh4sfJXffUv7bFPbQmyDMUiQhyfYgNwhISDzrSMWIjAUaGbHBZZ49EqBIAWmjZNDE2ApWFfoihG2IURes9SYSoU9IeXi2qvgb1mErfkpOB1UfsVVdX/feZ0kmD/wbLMDD2+ARkD0QXEhN7nteShiJEIE6Agh62QIRzYYYJUsZXBsdQATENK8kNk4tJ5q4sihbitC+0c6B+sjtu81VmFfQpfJTNa6ApgYVletZ9CI2w+mbWvDkbOg639uNWeATaCmnxcSaWoeKy6vuBh/wGXLL46kPBd771S2g7WVRszAQM/dQgHMPjhjSmUGpx7XXugo6dG3fivsnAxkokQknNSN3tnoMeLciQ1MssP/mA/uWrMH+F1iDnl43DIMdEhJHxDAAxiwiUWs1BRAxq0crIRaE1EMSmTj2UVlXu8peg4w+5ThRNrJ+oVsBNi0mz6j1YutFTDVPEp3oLnslc3DV//hG3NmvOGRSu6M4t7fboAa7Ej46PtbSUEWGTekiRIS+UjJmRUWceEyLrysyHdZWcUPPEnedRxZugxDRXAJtko1R+tt6hsNkKJvit2w9s4BoxEJXC8JJHGL2QTA7cB2Hx6uyWy/dvm52CI0x0C+Ngm/TCNu+tKXH4+lZxbQ4EkHfIwybsxR3wMjiNGc+0qSdFFmIw7sYZywUhgONUE940tMkltuLrUJzsaqTO47o/wZBMVoOqbTiWlcfddi6dLxv0fK63L2mvHA7HM0WYrWGoEIAA6GAtWIcIFMJYi4OE5izHGhAcaWtQIrUrbFEkngojJ/In3LobSVqIngeOdZ6hLJNIwxRl+48kB7xkZuIZdbN3qx5P6S/9rCs+tqXlJ0/LXwxJEjKcaGkpfQALUmnm2cCuqyyrk7ZNSChOpXWkjGiFBrdrIHt/veqoO4EUTImNUudPzdGfX5GnrsFtnrz1ppqHdpb0qQ0mLFz01oTgQ78hhJItD52j1wnBEKNs/+XhKj+NRWsDATsA9OsBMI1+udt8OVtH6/OnKWen2MD6tSgCwXVTUsDSsvem+Qdbei+ZZVvW0Hp7+Rq7jLjjT+Y47tKplKBz333reF+5Q745N0fhhXby5iJd7bHhHrmbMoQzL+sURgTE9jq0qohuLcD62sOIFQLDEyO8LWjdIN0S/fusDKtQHDlF2SWhX7cnnPKEG20MKgMCMtc3QEvfh8mVNfDEentfGSQcUQEOMXnun8s761L1Pz14KIrZlu11WtSBbK9T2Qyb4VPOssd6emjrNJGUftQ6R1FpwVJxsCXmxRVUmYla4ba8ZTxVf8LqfAzsou6m+Qm1i/T04NPSFCbwH7plHvrAdZC5FagPYQPQyzouOH0FL8tWnzjAJlhPXxK1CsA9PQAq4Gmy3NflByWx0VrOR/riIaGihCiGRb9j869J131Lno1mLWeqhbhIX5ZhXRZrpeOwnYKM9vk43T+vvCcv+Rd3X58kdc/0o6cdm9l541Q9oA5BRmcCT8ysRTwWbTx2XVRzlr+3t1v+S7CsXRJey2+n0ag2pcuvrV/q6Ikpoi7xAeWYfqDZq4Die4ISYm0w7hsy5ehMGaoYX/Dvv09BYpoZaQqF90EUqMlMpVnawsL6xKQbPCcEpgmKDOeJ6JgEoswdsmczpNkTWDQ7/6jFZIdRqkQjGCE9LhRLa/FsTegtokvLDV304NrqA2RtsWMF36C9Uu4Stha2BC6RQlQc0EP7YKoAiaSHsIAUpIty0ZbUDJM+MzxT47wBaNcTIMUcXPS1NrXaY36/Rml0jFgRRjZj37B5fdviU6KPwUoFRmvBBNSKDRJ9olCHrl6kt7fMO1QWth2ri8c3EoBi3EhhKNFD6bkY2hstm3irTfwEABaTpdW3OFDunH2Vc9FHjV/rx/eA8glYbXqVZfHcI87KtHdZux7QU54PMDjLcuKF+ORuwPoFUoBeMH70C/mgfEtpu4hr+dPPt2T/s8b2inK4Gil50AxQggKJiWqv/O7cDXqQz+TWPPG98mhyYk4RVMj9iESkVmUAs65koTXhtFZBxf0JVdT8kCm5EZYu8ggpJkEjiXmv0THXVBqa0F+EZBxaYJV3TH6Y7BNoXeL38Um5Cxkz3n4i/d9UxFYBQkCWFtgrpVZuLoGRCphBLjeeeUJgC92TQsjdAB7qCRAVaLyOvkhAg4QrFUA0Ysv2tvULENtN75urbs2IPxcJxtBMH40FXQ7upOYu68qruCmp0Q4/acIhPMADmCCTYYwymEXPWYdWrUZchJcRjsFqBNoQs5byFn7v9BjfPz3s9D7ryMC5lWUg9ZIktYOe3fRcnGXNFfPzoVzzobWvaXL36/lx6RwEzSM04CBpQko4Pu5tkCos8o/Vi8LO1v3DyXd4/U5pO4zk/LIjkQhE80BJAmZo5G9C98Z0jCRMpfdOzsrDE/OgENExVBqisrIUri9zsNdQbSk6mG507NSO/JdyxWUhSzU4Th8oHOHYqtYJuSDARF/iCLdrB6intiec1V/+MqrYXekDyJqKxNwmRI6RbYtgfZVJZ+lWr0qyCAAcw5pHSmXS02j/kUjXZQB69QyIuDVW9iz4o4zXgIbNbdvPF7nRNkarp+uq+HcZ17O1BczLXP2rav+Nq2vr4CjfaCu8RKcuUoQw8yGl2VQok1BGHqItgSMF5FjpwXGIu02x8lgfDm/sP/3K4/7/3yf/0MiorPjG7X7Y4m5z7VohCxlvvNPJUx5ncDnluwy9GTIszL6t9+xax5i5veyg8RnkwsApFMWzgw22HQAFG15vaWF/eck8ZubAav6sf/89D8ogBOHBEHjwze7AlDnoA21ynu8JLK4/2ExY6Woxan5ROlGYykb7Wp4zZKpBPsi1/eeGf/MyQ9IOM7vtTQ32CBBdr9slY/SkkozSY/EJLJts16d5BPeAutlfwJyQubAkYMpQCJZCsMg8UdYmOgsWtbuRLNV3xExI2DaZCszAMtmxUIkAqnuK6VjZ+/v8BkDqjt9E+nT7TO1wFQvWgw6GqH30Bdjxaj+r9q9/9KB/78MNL40U30/w9XHsf/KkBwdSWhIf6ueZ4KEMo1mGCsOWh+gLL/ZZ3KPRDRp5oX/fb/VY/+O3kK1pq++8mLy7KWP85Aj3umuAaarpHazlnaZBwzcHT18b3jzz9suVf4K39Es89nGbvnu3c2yAkpMhCOwgnLDr4AToFjjLM3I768zeO6L04PMuXBQ3BKGg20D0UxFpEuICa6tdzRcMLvRhrPUhAXKsdCcoAkKgyXA/ibWtBZ2GM3waW2fsBm6GSHkLXZ3OjzBqV6iCXOuylXRwmw2I5wF+U/MaswtkVmLL+DhGM1V6LVsWj6CRFRXCoj8RfEhCwqSRbLKpVhsChwTOo4SukR4gcRpcJU7dD2B5T6FgP5n3WtS2G5t/fRLFA/GocZWhhbvPQxQCC2v9WXs6h+OkL/+tvDsR4rBu3WPnvivxh29Cx0PzoT6t2fFwKqYAVd2t2TULMu4RtynZLg/91/5Gu//uw9Z/KSZfCiGnU/KtgMPBcDT+hk/fQUMS7ng6ET+5HPvvm/Kxre2KwNpwrdeGt/yT8ngdLnRh29ItF4omQdiOCWwXKNF6JMEaHKIuc8ng1NX3nq/94XulaSgMFiVGJRvbSfEmkSvsZJmPdeXA55zjbLxoxKPAON1gewvoFRThhJirryCtOTfnWDV0C5/pZvMF2bKOrqkZWELOnbAGGRm45W/8H4MkTF91VsnUQnTQvpJaJIAmyJrzRYFwb2SqFGNEEFpwtNAE3wzEwDbIcoILRteDiBT8x1InCxpIDvaUOvgLnOFbfMpaXwhup1Eh0RjVRDMVy+S5/kVAOdgnWhmtL21WX2McorwdfYj/4d+sHj+9Cq+8DanDjBzPpsJaHNaHUMLQ8U+b5vbK/oNv2f037nb+m9B89uHXr61sA89IxmxpCav5GNal3c1ESa/TgDVfKtP4p7Rub9OffCAT2e3li7f4i9a1hcttQqXltWyI0EVRDwwPkTMwCwWslJW2+Tme3i25z6KjDScRWxODtEqykxw7vQ0Gf5OTzEnXErP2y555N38HB6nuCiXXDeopF9vN5jAl6i+xWLV3S68XMhQouuSH1Z8MrHy/y/dWz8Jq3eoWJ5f1WTHHVMY3lmOFegimFaEtSVaC5mWEogFOVIoqMhbBgm1Sk8mTLhw58K+WPULzvTJnTEBsqZmAQkB9ewxw0oPE9kBVgOKCCWMUQ9HDpEqjDOr45LQ5ZBeNl7DN1isWF55aMKP60oUuf2Hug2fXWL54iLOlWFxI3cohwPzQD8MIARIKIZgBSPiiDKJ8w+W+uLI+9ty88VA6IVCYkgPj4NKNtCt/U/526A1f+JccBiEJIBFSCaUX4+BUBjEg3CR5wBZGDB6/2X7lTlu6Lr9dObU9hepjor5h5tGC71jxVvF5+3fxuznnT/8jGha/2aXf/LZ37CRdOBGBDKo+oIwKJULuUDrdBkxG0T1CodQtpKyhR/2JMaWjALiRg/N0pHDOK13h0nr+gmL0eCBsUyeb7uavyhnDBycOVkVFedrNpWQl2eD8K4jyqfWC2NhUGas6sua/mUOjCNuuSYlSZrnI2u2sOSIcJw37flloHKU6Gi1oQOPDndBTABTGjADZBJwyQxsD8BbM8X/X45DAVmbeip1pSwNK22gRo+jiBU0gOWQOVeXj2ePXb211WS4UI1MIhVWw7odSbBijMMxBUcuZiM3q6u/FcedRpx/xsWdGno384p+UdyrHYXmPNronaPA45uFpWpJxKKUiiWLqcVqm2vSPrS3MqKIHjwoP7nzz3VcfvBsUfmK125zpcNSj2/rZBXRXZgqgg4wCQxnqEI+FmA0x/bp2zwOeP6f/LvG/rutx8g8ktpg3OCZEKuYz+r9hAYYcadF2O4ZPqmQX/uz8zRT3FmcLvbnGpzOiyJhyz9AkGfyT+u5aabnPh3RfXGX5gGm55AC2RmujLlJJIGNnjK0katRzeaqXoQXUM3FVJAhgEwsKSyJU0pRJbRKRU5fpRk7prD2+2hFnrUPiMEIDgtFuGlehCqOUngKgdkhnYNNJEApEESEehpcuP/w4/rKSOAkWTXSiFJA+tB8++Y8ALCYt7Xfj8XjKNxdd8+WBz1190d9nsEJYNo6HAEiWCIFWgSARwzCzaTAP2LnOUCA2O/LuHCVX7mCGlNPXNud66VNss7W1XXNOH5kFbfA7QjAkJ+MA5DmoRGHKgCbb7C3TKN7cjt3NcXMrub/bZxdY4Ns31vDP4Nnblj397Kil3T0GsY+Ld1EN4YxalGkcnv74DPKTb3PGZ/ug34t7L8+4h+nQn4YeIUNDbstIMPx9r3dwdoPiIR18rezttu5k3yqXELEvYk3aIdvnW24Fy06fXHbtmLVv5rSnnnKQt93MMOdzCwDjGBCcVRRSYgBhxJGx0EFAoiycw0Vl8fgNQ4LIcMLUwzoxHtjYa7nuUnFKvwfakCXOHJEMZCZEhRemArSAm+66aw8BYI9iKGuxSZVbgLSYloX1RW4xzVz7yKI5IMlPVmaRSfa5ehhiY/kvf7S0lKbqIYWHm8x6MN3vC89SXAw36mZLkfFAUgjFA5obmiIQHKxL2Pql9JdvsQ25scnDPtFPuq7x/FjlRGwiie2P9gX61Rot5gDHoQD9ILVPz5Rh6yRbjhbnqlvodlo5Z05ticUz+HY3x+QRJJiKcqfherCt9PQnVy7oKQZgUA1RWEgVxlBk/hrOOdct8Z3vHcR5+J/b93zcYwzbzjyjdiXkkPEae2dKMAIMBzQtjr/+xPC2Q8gQLEcAuJEpvpvLyVrnzIblVL/oym9475vynWN5HEbrHEbH9DwxAFsgQzM5F5yz5orIkYvrAiJ6wyh2H+EWoTBJdMSgiIhLvHE5uvpCmnFA04SboXGECMIjRnmALHBLl7na9xBYLKkjcxQJVg2fNwT8uLuXxVjJJwxulYowe84neV7FcIX9MnMZFG3hSK5ycnv0yXLgrWeqbrmj4VJXDpsVURQhKJImFVJAGKFbrwMknuC0CBPaF3qlJ+6x0DfNPf8qrvKIsjU+qkTiZRri5RgiLoQi4OHYGQ0FuZAjQUr/l1pQSpcOzbVbnMudZvOzcQ9nySFL7100++zHqS/eX/MFrMitdFis9XJLG45QhyIMEp4hZT2/S7TQ03vQ2c2adzviXjca15V5qrKWlilMJfOL1wjKcKcQeigg9/4j5LNPdNUpKtx1zoqvddsZeCfctfBBTr7oSZf9FFiOrbEJIUBYhgOA2ngxJqQ0Xk3NmAoxlzsgN1LxYIC4VGI6ro+BxcvSOocQhaihCRXGTW0HM2idt4fuLGu4xnnDTz9+VvAMAPb1FIT8AUfIzl99GMVR+55IRXFZjGzh2YIGYs/0n09O2iv96v9p5q27jpPDsNparI45p6x7+nC1N54VHsl9fvpim2HLCfpPlBogGI9CAIjYUCRUVS0Q7VYst8I7+03qcHo/3nIGVRxWFrdMN2E0lsVjGIrdPhYFKgrEaI6AowYb/1pd4ejB1ddNW0+xDNVpy2iFww8/ab9zaIefJb13T/kilgge7FiIBUc1xYzIpkWGmPPSCkLlyTNLP9gHXf/6sN2OcyMMbD6r1JIpI1iKlos0/DdIzESIooFk3f6TfbfpT2741VTe8XOjl7Pkqct3d+ncQvcZQIvj5KRBlDVAQNaQGJ0E0ksyQU0AOTgxRnAAMkA0DqVlPt63ZUZYChXi9aMIoIg8X2KE2yrqjCzUML/fxo3Qzh03YhCiWAASuk+MZuwpKXUHS8hf/UCzRtV4GR+MzCKWGCJuz3QyaMFUOCh22PeZ6ZkAAmZ282M8wORhs09fXPG1YeaTy+Um6CpApEgBsIHAtiOgSDGsRVQwXBliKHvs0z1/0cX9Kh36bXOiLlJbOfsABN0eQ1NDcWBmMSVwBSn5g2A20sw7VOf2GXsKm3J3qLvdOgyrLJq+Y9//vHX0mTN9RMv2L8fYDvFkKpkPkWAGlPXcCoeQ3thLPfP0Yvc/JCX/EXUIx64hQcBaKSs0VfgxpWAsmOF3VO/a/0Z+amJfxL6Z7j1dFyle0tWxGS4uPFqwBWQBDLMYE4hzHqLWx4KYCyvrJ4JBVAS46/lj5HHkSfVKGXoraSeTDzmRcSwkCk/oEBOOphyTNtvCx0UHaLab3Wx8Wa4KWQsB+3sMAIVA/uEvR+b2B09VRJOhpafRfrVoNRLT0BU1EgRJFpaEpZBaJA18OLJ7Q77sS6S7C31hai1j5tCKUcITQ7seIoYXIDASQc5ITOikW/P3KbaNaRzNGQyCL+qUQOx1U+SK/Vz1OvGDUGkk4bIwoFO/39PjGuItphNj/M91DKBHtZxmiUHxtep38MllL54f+b//QwccpczjiZhG+aaLFndIz/qsW9szdcByP1D3ZTpH29PdZu0sjbuzlqORp7a2IO/AM5PxUd/zj754ZffFFA4UZqy9C3zKM6AEhxRM87F0Wd5BlgZo3rG62dVl0lVpVUhigrhuNnfUT+RUgIEgIB65k+dgG5CX/aF4x9bnZfG6FZJ4xPUQUcR1A6S+Ta/a9GjynuTadhehceTxN/uXf8SKZWePgQCGN91F10/usssXT5+PW9Ns+ydkm+HW1CaBiVYF1RzUwFVOoh7AB2rGLPo6KtvWt+mDkisMaOuBEk4goUUhRiIYqY4Gkx+2RMoUtwJHtS7Z70VZLeYkTjiiVZjCEtIkOw815kVF/pA/UWcoIfmKEgAx8UmIAhEmnxSj/FqNrSYTb7jzKXyU//HPcuF100TtpDIEjQJCeCq6G3UH42054IONv9X/cKVuscPF+VKIgWoYoJl1KwaNGjfqZkw+3lKgh/c4PaQ4UMdcpcAUIG34rZkWAjw0u35haHTFnN4dm112coYYrx6Y5MxflHsCWPuncaZ9QE7RnchLxA5QpohoLmQnJw7XgUqsK1OfMplRtMkibIj2OqjZU1EXCXCVYhKSkez1Yc+Bmekcob6O+b+x6be34iroWkk8ZQv4TMuDCpMRNwKVLhVNI7Y8gBbmyA8htK0/VaPlI44QOtSBBhRgITQi5oNIGHmhUIhR5ZPiFcjNYARrMBNYuCwOp1SPB9nyxtnrTvffbecEesY+o/8HpVDqEjqe5RrPVdcNpVtNv72mjkeQGMRclKytxVDdDmqBvVu2vNvHLxp5OSETJknMYgJSt/+ia/GR2nXFjY+v8PDpS+nyTFmGS9foJRtkg15IV4Fjn+8yThG3jW4hiDBXFovP3JLQfeXk4whyjBOUQHY/buPmuXetOsv7LrmiZ2c+yix3qHDCEfstepJv3zXzkMYjPmwoucS2LElb7cO4ggypUt1q5cBhgM26qJvt2xVF29M3U6qWOhULHwyGwpUSLm9hPIJaB/N6rwcB8HfX1GM771OZ+W8fxO+9Uq5cNeup+8HQdU2UIFJE7MsftntfttwYWgSTol1ieXXZa6V5sXRsLUI2KoeCSJDO5RiKAjTfrw/VsQ6USFTEg8E6MKHsL1kNMhEZGQPTetj/sa79nXPIHdGkUWCYS43MxQ0cOHBMHY6wrKwlznnpJ0azFbReDCzyxRACUJIRQ+WIRhRnAYuLI2oxqhrOCFBSoCkwnUW9BSwp32jIk3/huT3c7qP3RXfHFo+601bUABrFFd+AYkh+8TrIoBhFDALKmDz8gvMMC9wmdTj1DntNEbdiBdgFG7pb1txx9hfzPXh6/qo9cwoXGpx3CFCP3tJlLJ3Bd42T09e0TJEW7Ost1x+YVYyPvHw+pTW3xnHNQy0JMcJs3kxhUMTUcfmpdqWmwIgH66B3YtxGcezq96kHQQC//VPnRNbt/QHVW3Q/kNB16XOFx2YcbeAiMyDDwn0eLYhQWcu5ixdx267wXjFkMEQop/lujYJEFq6HgELqGFlDiIEnS9ZUgJujmA/GEWuZKhe8l5/6R6/+5Wfuh76ZFPvxmfOA8vJ996IGLenTCwghxDa33huSR+ezs3UHf+R3JztBNgICjOAYkxJl9dcQkuo5QMXi4iKXcztniIfjjDh/U2YvL/zkhxfzDz/vpZ9EyqDVnkCpFZCtFx5WEV/gBvgKK2GhrVDl3z9Z58phvVdqAC0gdRQNiNrCQj7X/hPrbl3/KkMvp/JV+JTcOHlx/D+Rttj8sbTs0sIox2y35mEfCm2qRQF/6L7hcwByl4NmxyBKRYlJjaUNYnpltMK8RiCIzbLkEvgDieXkY48K4CCA+Um5XGfIeITnM4PHYenPDy1IQDIdfn7QBjTR8f4roOx64XBP54YWmpCmyZBRTE4iCMJCUIAFIH7kOE4SM1FkRnksDjGVxWM2PvJ3+Rj//GnJPQQT7515lG6PY+lLaLGmlKFNlRTpsarJWXPEEfvdZo8r7H/T/olFCPK7w/be8w2623YZMPyBihUmotiBIBDHBAYs1gDwiQQqQOl0dhgZJVzlKu/Sw/9xV3/pzw42pV3U0ttNx9QrfOn+AhJyMAZ3jJKi84yMcXg4eQwgMYva8zz0UB/yRXbznoObLxvf7Q5Kmz7YTzJn2Q7dnr8ZCdkjd0QLD+DRJwtmaD7yL+Cq6HhyUCJqlCFiQpFQmlCINDvazkT3e0M+S7wrrLfsykiDWK7vexZEHY//QP2SAQaXDUtq49BanFLZ9sdUOGwvOX1us/mLK+5sV/Qttx/WNa4vb+uDr9vqqbJjGVoRHbQ2lLiZZCEsrgs0dHAoGQ4hCDk5hEmrQUOf77N/YMOvnmAJKjErf5SrvnQ5+iNqXUTG9Cu8gb89FTEGsSu/QJztxhh0MK7/btb7XtuPPicE5PeK7HPLPZb2tFpYArCZODkHUImwaHSAGiI7SXOxYzQmGqI4Sy9ieTjXffb5vfzRv/akrZ5g+w3og9ZL4ERNIJOGTKQKTl4RHpxnFVoAwCPSJ8YjhazHiSBEHRxv+CnhGsKrnpsa1o2QkSE06GuuifgXNUS3/Lr0O5S32Qpwl+0rMGI1QhfWQ05QI4XoKyFIBpgUxqfN1oYvf+6RqH0RXvKHElsF89u7PYxCNkCTOXo1JVanpIdwxGaH1BAt3YukYlXTaNnl8OHFvYd5M3ngHXtrS+EL6Idf96hvfsMmL0wXGqBdQtXS1soxFEYoiIQWAi0KgKumeh8IZ2ZSMXnei7+j1/sFRHKNz/ACv+B+2bV8bY4Yp4Z5GFKNvXXyt2/kBGPKJO+UjpYkp1XmKPntZwoPvjBPqO27y/9AdUN5o6Q0KnYGAWLiTNTYgmYxwWYTk/n5RQolyka59LhSdvnAP/GLl8BTacQOzzB7NXoZOcGnpIJv7Wa1tOIGSFxQqEVS+pzgoga3pTGUESpF2PYUCGDHlOJoBJxJsEaE3EJvRyHG0LLohDRBtB4QxfXK9FJ2xBJCcwP2cIQUItYjrCOF6WVMjZI+jfb3hszhJNNUfCCFmUsAVPcsAN6K1eRwRWJ11xQ/n97Y75r9J48fOvdPU8bRpneAtior0rUlXcP23ryot+TV/23/hx1Py4Jb30Eu/2GP/8E/7PKfkebi1KmY2RXCIQSag47jE0pg7lRGz/jiRgDnv/Dbe10ZQUs57+63vnrGj6i49OACP14ZNjYC5gwdweixCygzeqyE1qmgYk7Js/Vw5Kl73PwcxmfHYdUqz9QKKE1GEgtAAkQkgtdR2ZknFJh5TBKdaIWQC7J3RliGSe7+3/+5DeKprKvzk52xRs7ezxsqaE4kJHCsxA2jUHutg65wCGisUk1ccczrKPTH2+OaqFTVoNb9xtu82dhag/LtyOdwTG2OUWrod5lxiSklXP3s+TLyDVNV8Vl1D8xkFGHseR54s04yhqctdodv11778THBHLFMCR5MHfV+3I7MQ57wubxhvu7Nj0SPrp9sGg2gFGNyJrQcfyheVLzNmLz9/SQDpYdioboVyumA7bIJP3il63/Z8Z+/QmHPLh569mb6dKk63P1DSqqpFBWhShGo4G5kfk02l8HPu/rRv6H3m1tl6uD6wN/40TWeS3+GWSSQkfW6gBHAaWwXMcjdnCilqcbSIl0DenqL6Xw8vw4/L8XDux+ic2+Z48IEER6ZDk1DuggSqauLAHZkTqARGGsBDIo0QO7FP0WDsT01z93M/uLmdx4MJ9XmC8k+17pHzcUTDQJZsXZ83PI8YhgamMiXkdV2LDGJJ1MhkhCTmOKMGBkOVzHxDKRAynrsmSZlqhx2O4bkMTTZdQQiMJZS+vzMvU6qFWUgJDol3YoVPIkiU5QxyIrEIJoMQQEwCOCxJZrh2q/J7Nfjk4Vrjau/AjD7oKbizWXd8/cy8rEJwI+HtHj7HKXZa4M2apCGSWnOAVCK+GTNeBowpfvyi2Jd8wu70ymLqunmgs1N9cL1Ij/CuYcfHPfiU0R0f8vr4dVmkx6xctREAsgwcaKYCJ4xIykNPLMsd/kbf1v3b1w4Ya5uD/DyDx/zWfSzJSMEmAUU1ehK63waW9r77BMvg3nYrYgvY7Fa6UM7e95iz+HSoZxx/NLYNrUstRrmOLBzF+QyrI6uTdSKglKMooLAHj9uC0TjE6Pj0IQhdtUAPJZJ0qZnHuY5bv7pEW68ptafZssnHnZTW2FAUSpWeCHu8DgeL2m9jieAIpFhy1sUVbBjJ0k06gfZ/VljzU7JGl1EoWekZX+OAxYasGDhRCzh7chcRWbRphHR0NTFOrAYpkHeNHdJ6EKTqRBQyZC5TgbKHKHzGCVEDo6fyLUxRnx52Pvdtv8rAxwiedgKkzEJwPrr1Qrn7tV+K5firfTyOIiH9EyxPniHt2uQ/gzAJkREAAcB5DYPzqGLFtdNkGTB+C2AqV1paGQPe2uv/OzPrSadv/9hdpx/9QVvPCZtSF56wZAIiEhQiHlIlh6vbVCXf/lyyb914Q6sudd/rVUf5yC/PpcpuyUXPXHzA+QOx2N3r693/LhgctDGrw6AA3Boy8rLzpvPjrn20drpo/b3lNrY3ztkSs4b4OJph2bj9+NI1+FDpyOrAtIIDIATcV6udW0OEdueDmQWhlGEIibuA5uB18xjnHn6x7ofLVxJj27+MbR58kb61Fth5gZEjNBECGTZhGAVuJxsSYH17xdmhQC1pcesdvR31DvpWcmDsXAxygjEgZhxWKoju0SbiGzplt3K8CiLFcYgjcD0jiwQlH/rR9AdUvboUSKosZykkUjMjEJnvVSThESj3tJL2++aXOcXB7mQ5sdb92w8Q8GHAJUyqI1AAQHSdbC8Mzd1Q8hDiXNUHtIaFp/35sxEVBNaq/TA6w1gsza+fooL9IbrEzKfXvfhj/AoN97hzfBrvO+Hn2D26K4emaOG7ugq3X369OrtWXAnODgC6CAHZjPgW5+h+/lAv1d6Uv05/9j1pB9xfyzZQUFMMjCBuGXt5oIrbzzC7dfdDw7QzPxrWHYld80PClCkbF1XPffB0LXH1vqxIR1gQ8pDyR46h27SwPBJ1knSSb31YKaTxlwugEWhDSJKpIjcTRDsRDTOfEPAioaZOdXdVX/kqh88ZJ0a2nkWvdWmS2r55EpfX6NZL5TGWEAQlX1wDBGDhAgJcAEDDggwHsRz3jW/k7koEa1PICUKxAwIg1m+UqVNkUYBrVnKgZooOUgaK3ih3ZGQqz7Rn9xu7GDQeFNKSlJkaMIgcaRgPUpAMGiOWDfMfTzt/WYUPxDoEG9D7SI7rga1S7QIpqxh8tPSdcYKy2DY9Ye07upxFyIr/AGAcw4CW5r50Lwyf859ZG378VrwYz3Sm59jEnf4I/W6yjt/8B1L5bnq6jnhStcfFw53DjOEO7kDvIHN2WDNDZD0k7d3P9K/2fu9LbH0p17c7S/uIdoSF5fFoThh4pn0g40/ccE33oaOfycVZKR0DDhp0GlieQVFGUOdw7uogGPnAoLrfdDX7DZuw9BV2bdAeWz5YIfMV9d6ZZx8OouXMY9zTuCxEEv0ISzQttiFklIKKdKKomQMmyANZNbjzJzx4vFL9/3Nr6VfZNvPI3d/H/F9js54KtkXZsKNKJhZ/Vy7eoYQAY8KOGonW5UyDgSw9WQKcg8m6rUo7ElyEUeaxrAChCStS7IcD5oHGfpDUYIIg0lQvqi4qsAm6DUUQZW1spZjNKMaER078DxBEA8JvH1tPi26FQv2t8LStLnRABhjarG1/YXWcctmvRMsN03vNYc0PazJiJOWz6t/QQclSV6qeRF7BgsXTx73o7eoC+mRyg8tpZiAvLvznuevdSu2cP69vm53b5mdfx9KOKKOI2PGTB0vG9xtX/gvUojz/ZHDQetORRicPUPjypTtWu/igm+8yTrOzcq5+5yTirtyXjzdkKtJcw5Htox1zYyruYYaJI97sm22V6WBpqRg6py9ZGyzuwMQO//56zSdrdE+raeT+Ga6C4RBDQxFAgajKJzMwsDCmdwKZTE9Fa4CuZ7h+p/wxOr442JZa/d+5d7bXW8EnRhTR61tLA1ipGinUGuENs6sSKJS886slcHBgYqDApThCCOmYTBIlftMRA5EmSdR6zEikT5oVOkb4ZUXg3D3JA+cjASVdSY0yJz9SCDDDJKBsqDUgUhZGVuPE2dOTJT7aRKR8S8uhAYCqEpu3zquYdadQo+kcbgB2HvImrx4170ZGnbt0fuf1rfMFwDt8KA/FG3wtEOG7vvW559pP5yIy0XD9lrwpa2Kw1Vin7isnh/2Nac0BsU2uLPrihvxzGpIOHBCExP8C9nuq/yfS+4tig4vrDUf72EyJXNDOLILcXzYF/mL0ZrxKk9kt4eqVuv2XlBph0hyPDNiaGt1ihqcGcjbhXy0NBEImXIPkh9EEg0dzPO68N35wb26Lls644c363Fn7yLzKFzv8u7+DMrzdnYRZyutYZUXexRDkSwEAigwcPMBLDQvHmzNw112f3HdmyvnJWVeWruQBPveGHb3KNyyIH0p2tbQUkiSW6wfRLBeFyDgcCwJnIwy5h7AgFkvCtATGveIRObeypCjN5WfWbrb3GhbkglNXYvncxErWHskLbS7ZIzKeqhM2CJUbVsHLSbvHFtcpBlS4gKUDhwZ5oJjgSEhT040IELQctn0biisEOU2x894iNZR6+eMPrRRQNIq2lSNW0inAdh/UBhzlcokj3j07WRn2wyWt4QPNslXesTqi1yi+ehOOAcdTSl1stdDDxg/NtU3Js0kuoqhGZtzcZlceuoV/jmFON7PKiqqWxSLVVLERvba19bfTsUdy7qIuKfmwfJK1XKnpGR4hdgsm75kVyRIt8e4N/iUOLr5mFipJRnryW2mznW1cKx3c+NGAq2M3MfSq/eO33DP+tvtyy3s3x8F97VfMrRPdRqv2s62Z23hSqyBmAaO1B6IPJxNy1tKe17h6Fv3/fJH1mfU9mMgmHspyO06EHObkr1eYAVyBo27MakqDWOkXFQXanI6uFR7T8YpOlVZhggqRAAggW/dkIEFf453VkW7Y/iu2EHDyKayIDQ1QAYyMLKGRn0TknEaFyQxWDeZogiBoTxoIYNgwHZVGBPUECQ8dCRggYUgzvKOEEFsIqJThvK9qYcYjsux7JAFoC8ZDMI3iPg4C5xRCrpJgsMKRhswtRJqoaCWg90Su1SiyzhcUyg/9kgh766eUx8o8ZIYDx/fethG7q0qbm3M/QF8Hdfaa3znPFNsjcfWeprzmT5/nj55SJ1cjc1EEh7n/9/vQFt8awmMXHTve936QDQfdjUPqeJshd7kNXj369xh3ZutO9Hx2IZ70IqsIXzYcqzStI+olwijoVwVjhVd5NFSVsgTSRsl060W9HTjga/kX4hS78fa4aNc7gvdJOKrf+SHe6h9OcVdlrf0TGcJ6Y3zsypUc6XlWl6r/FlqwJcaqUtiWgEl3YZ36xQ3/yzb3jr9UCjxpiczMw16H1iyQiMdK1k0N+O2BGQNydNomKK5HFIlvsuMGJWUqZSo+leQGDxSl6lzNSvPbJQcquTIzl3xw4ZAq8SYe4FuYBljUcbkyXJCAxchuh5IUBpVl2EgQfpW5ZYNtgpsNOc5gkdRoiYpNWJRC5ZyBSGCe3CRboWC0jUPciRwTg0A8g9ZANoz2JL3A0kBDY4EEWABa6d+q9T+pOSta/I2+AcmyInWxVcJuckb0MvWs0Mj7KW0kcnTK2pwL8UxRrL9zoOrbvF69z7YUqbsN/6Oa6z/8qus/Yr1139J/5XvVJp8YTarrV62u93Eki+uzqudry/ehAaQRkwj9yUTva4tqep74NP7LLdHyZLQyEWZregT1335gGN29IoUNEjC7/t8gDThDiZaVVFgmVWabJmOcR+7I39uI5Ue2TJWBzqbHoCDtS4XERklwm5rhXlR5BaUYtjT2tNMlbL2Dlu1m3vDWpUNNmNYMc3Tugv/U/m1l/2hNKxOH4TyrpWkHkbZGHAb0Vp+ie4j6zowoxPIIBFkgvgmYhE/QDYwQymkIB1o0yyXmsBr+hpoC3jn1qaEOuJbtm20baVliS7NiVtzw4SZQcuCciZ464VAHABRgJqM0LqWvg58uxyEFTrUILk2PfdJlyEQAxKorOdqeA+aRHd0FSF9yM9FuRvnK9V4FoBDNoBjPxAhQQiilupQFJEavESsXWLlcEdqwXJryfcAa+5IiuLgiqoMXqrH461KNg2xXHRtj9n0luUmVmJ39fzkoW1u6bz6q8/+1nFX3+Pdfwt39XWd73v3d37wSy7mv/QcP8y5V0qIlX8YJF1IiKU5s/BnjVAEeOt4/nbW38i8Ag/nEDrUFvPE4g3cJeQygvXyUhAqwAwQZQAiEzarwG8/rGfNKQ94IrRxjsee3214l4o6lbBZTE2rhvO0n2s3U3BtgEUDJcletXcTZB1RDastjPzWYxyJiF2Q2OD2+9LV5pXgZULPiupDZgGkElUEik0RfKGxJopqhSy5bGQhhWR8ZXwlQe9THSQgQ0QAqasTUohUIW0NltU2FPItVayOhhLhuNRRTgYrbwEm2YOrQTAZVK1WCLIjtTRxzrmqkhaTAVqmTYXFBiDB6sAY8C64h3uSbCWXkWdQtaJcFK7eKQZJ7Qbw7iEMXEdFbjKgLL1lXDwUi0ItvgH/OAroWQwfaMLdn5iKpQSPpQdB+2vdmzfifWkmaHKtbGZA5YCj6xV2r955bFAKY4A902x8ox789csxfxjs9yhEh6dBpZNAIiohQoguVpzspW0p/IKHSq/8BcKa56PJekB0P+U6rG2Nj1ocd9EtSv5W4BzJGO55Q1XN/l7etgwnd65x2stO1nXS9ohXGCC+ONpjKC40hH4GWe3jtkmXsTi50pI3MkMRQIC6mO2fFkN0NFVGI986WHZkAn/gTHCAQSAGoCAVkAmgBC1BBpiGxtS6Hk6dixAmg4ZIJcCK8MjUchiqSqN8Je312b+hOpVhCRnbTlttVkENQmDd7Q6QMs210yY2p41yFBTyizjx30wDJY+WRuKkRonIg1/BXzC/2k1LgUtLaVRRA2gwECGUGiRwg9aj0MeXp0KgtQMeDrElkhdDpRbgIZzCN8Ttsv4ZPu5KI/0+E11HuFMoE2CqNyUUDlA4ICGAdJJIB446Bq4urcdfZpPUWCif+BwNQNw/Tq/JtjuOvpYtndepK4fmQKXfAuDvzLGoFlaZJakak/cmX4JuFCLrlKgEk0lEYQp5OLWbCr8TUphX0yFEy4LLCR2c7VNWU16yXpeD9tsbmTmBEM4cqZcAnVyWwbhVvzdrZ/rpPj+f9cJ2b5d/2W9FDDpU4ioOeu8kuc8zV958/ymqW7+cag5fW0EuAgMFODM7Z4IjVAckJohoT+J5hX8UDqFVscJhiggNXZswGB534g4wyF6GAaKW8i54A5zqN/ez+LGOjh36IQSNMIkIZGkqqKl7lrwsPtz6g9sXq5ypnBMtjxp1FIYa+zn7KRy0aaa0mh0O77xUoeeQprKbvuqWhy0pwzoRFDG2feKZOXnTy3LYxyQY/xuqAiqEwE9bQM5VgqgCsbC571vnO4i3MGQ+jId0AJ8CmKQHN4Er8kYA2uHB3SoQOBDaKfvS3bdMQhmKokmsbtWzHZs6AerEFtszgFk8eTlcbodL5czyGWSR1qaGAyJloyiFwajAEHJziDh05lff4v5123YXAqt2Npg0rMIMsXW6FQByhipCCHc+NxZDAwDNPMjCPY8gH3HVHffiXeznu/orNZfOemaaUSOXPeBD/I5fw8Nddd++S4fmuqTcniH0D7mx06/bB/pMf9q31DU/S5vpnK6S2XIu4F1ET6Y0OH5aCZGVKs1BibgDCYAA6ig73ENm0y1IJzQZF4gQ0wdvPPD8Z7i3qz8KVbh7Sw3FqcaZVImAJmNaaYcl1fs1Vz66yNG3Sj9sacM5FwCdtAJShtzEq+m9fivUqHLLnqPV4hgmXercexKQoCTGp1YiRSggJE1M1m0fc+b9KWemrgcdoGxIfMpCACKhkkBUFBEw0w7L/Pei+0351RVlvAig8BCHCKB1tZqQxgwF0HZwAAQJqtjAGJWz4IIV+8GYlREcTvOG4rIcjRHhJAeMA5z86eNuPpF7+cy6j4+fZ/44c7btNIAhJoSxrxCGGkQAObkTCOyxIYPuRGuEAQYUpBQq2nfjUuSmONUst3HbOI7brYmROtCFSGSCJNwWMxuyNxw/v1S6nu7EyxVynefDX64miZNu+BGe+MFH/swP3nXa1e/dcE15+th1mJPfliGW97kZRUc468oLOaYWlqbLWagkwNXCneChPsiCaT/2qz+vT5N54oBqaYuomcfoGkTkJwFBqnfijUAdPAEqPN/u53uYl38qbYaFp94rVhvKlruSsrEHxEGgKMO1dYWhS4udGrCSB/KfG3K1jY+YzU0VXPUqDQmqp6DoUokuty6HZWtGX1/vVazs9yeGloR4YUvMI6HUUW7bZUlBnvHV8+Nu3tlaJxsd4gN+SkI7DA0VeWTdt4aOa6HfFGggo58GsA17QAAHbrSakPZ4sGlSa0GYfjENkht4xMUeBNPd5Wy/hV+YdyaZjiXE3V66f/j733uOvR861d5PnOTBT9zt4Y89xolvnP8T22P/gasQCSkSQQhEsAggIzgbwYtyH/FAB2EnI+w21o5c3ucVfAwyysDv0Q+K+xgOBkNlFZBV/fchaS1eH7L/wXnPX88a9rPs/BJPa3Fvz50PE/5j29MvBw9U2h5guVwDCB4E7puCytWDmRsefE2cwOibE6eUqCRLNizNSe1yvtt/tfBOlvmxR7Ozp9a138gd2Spoj6fi2mJH6F4NBxxL4XE0zPAK3/8dLvHajzDr+W/JT5rSWXw1vCUkU2ALD8WEXDFqlh7GRMpu+SEHjHFPX/pLxfdTeMgj9ggqKZ+p35Y9xtctxdZKDx4VGfpYs4TbAtHSLSMxSYxMdHJHL13S3fPtyN0s8VMRm0ZDbGwIVphWFqO3/AL6NRj35RMTVL2CugHAB9gTUlK5EkHpcPAIVM8h8yHcglorpOWt5S8gzrEm0BpzTOWGILLV6EvXfuoTHWM8NXjhWlR7eGl3/393/OLrQiARopC4DJHJOSFw1UzaUbUmQJ06vOUuJRQ3hrZyoUsQ2DXKhslyElqKUy4WQyta9/QbH+nDm/3YODYEQRd3Gn351vC6qh0VlwxEYGHTWrooeJNMK+fL7kS/JLJ9G60oBMDUgFZcNc4wku+sO5dvvnCYt5a8HWm1YUXa1jBeuKaeeYhbBqtFeTM4ZVOzlFQrCzZL1lc5iZCEehutWZaMTyLCIGOylA+dW0dv6+lxve+/V7IrrZYEjkJCJPing34lc+rhzHE4j1w4F5jnUguMjIShwFAjAzxGHKe1K9j1kzL9hY3vS/cvh9m/PBzww8O+L02zv1faf4D8S6K8G6JVEaGeBhD728YekVBlA66UFX/wCFUk2BaVk4CM3MYdF4hONY5GUJIIAN6dKITyIZ6MZNypLHXb7/zV0SpDSRGiTDg0djpQsaDgANCqxWMODyh3PGXlaNXNi6CDw/04sPxgzgQwzbzbr+6l8rz7jg9GDp4pFZsBN5v0dVLX06uenORYowMjuEKjifbGpWXkbmBR1QRqKJNONUvWIq1IE+mCsnXzZGobKrdniiJZt5nDVXbaEs1pmPIwp5J8k2zs+/+ntzKlKuIlt704/JDoVvWypt0vA+ch+6DqpYdru3nz4zgmfEuwZt5/Q4NIli/gDXFHpEBpw+ROrGdyMUAGDSiUJolsS0kKPRs4sWR62va5duFvtpanF+jxL4ofROKoqxOL/jpprKSDIxtAFoBF2ENSjo0rQwEGHzwa9BdysTUe4lLwZsRJAJJGueGTfFOMAJCg0sDLbVRAqqQ3sZZBohqaQzKYA7lEVf1iJopXyRIr5C5rhQtHEAiDhHgCDqxAH1OIQHDdTOQbZHhwpRhqq38cAGEZtMGTLvoY60KtqSWBKhL/ug4SGck0XA0jcy0t21JkiMNGC44sTBWbflGAItGYbjyLyCbJkjiN8ZTKtp6chtV2PYR9MmwtDd1m6oahK5KHbPy2FR/N6ujZV7p195D/az7Sv1yX+/d9+f/x6ct8751Np8w+dSzn5S+CFERoIVNWbVA4dkGnljJBWMHIGm7yg6yTX1a2wn8vRROSRMIemk4MBZ5PymbcjL0DUqRSoCS3ZdfPoeXygsXgukmY5wCYBeBeAIXYYwK0hTgcw/e4g0eVEkdT4RQ8mwI3QmDxBEXTgmrV4hZcp5V9iofXF/2YlhLJeaXgaOSureP0josW7fj8lcI1IfHOsV9AqCOmZdROIbCM4XAsxhmAJ4AbZWIfPrenllpvGAFl2mqo78i36x/00FqoOEQSJaoyLIEAu0103ymC4tU9AiEw4aa7fFExlilbBxQdRC7Clt6Dueim5s1lvdha5x7XZHEYDMh2nDeSi9jAXtZOc658cHcvT/zmK//rM//W+20uvbPcp9/t/Py7xuXq9W1c8f+APsm1RlALIPFzazFAFxz6DM4JH5dpsJE5GDjXp6Hm9zijW6Yx8o7y4u1qRpTQ+MSAbGp5RYAB3o5YKUC0adnhs0K28NedjVyFPSmAXbcfM/zMOngS2dO0ODWnU6/nJTEkUApsLQSlrPl1YroqzViYheRAc5wxRLHxAFuNloXmxYe2px6uCA3QIo7mAs5m0pzRtJtFBj4i2qAyRUC1CZHpDHSCgWEMxGMxDGFwsV8WlemcrI+N2LIOV7tTy4sa24zWZWYYpBDRaDQkgBNCoBT0PEdChuNmUTNi6prUbkIM0mSUsOOol9QzQaqN3yXItLCNfK6gDyUAEpQXc9vwlfOR/3Y77r171B/XZ/rlnzzxjzq7Pd/LP3Gu9nyv/sM0NPsa/yzWF3G0oVUNItNsrnr0NkpwTpqnqgHLe/fMbsRdKqhnzUvr0XsXjgWL6ghV6lRyekwfAIwMiDngoUScxsyWq2u23Sc3pH0uMnDN6kmwa0i5ZfhKP3gAThYLTNOI0PsfpMOAmyCIlKIs83XCacPDlPlHudF2B2t1nbARh6GbbctK1Pfd6Ssd5lrNTJtELRg5hAu5oMxbzTaBJMQ6RKwxASlNhwRb5aja4OYOimi0AkE7ITmL5Jms1/x7CzIObH7GrYYPxSBBSaBloCVXlchcAiDEV3IMZ+EOeUNDA8QKGEYSZqoA625koAAJMaatKa9k69e9HY6UDiAy4CpjSU5ifP1LPP3vP4cGmRdvZ/5V753wpWXdoLukO9Ab6BFa4zrOY9zqNq73tT72F5RCaaIf5Oh33laUnqP4WkkdpuMOzFOLU1RZf4ungKUAb+GaoDBdt7WwDpGKIgOtVWONSIA6UMb4kiAWJ+kR005F+lQzgmhYy3oUlccf1KWpJuXggbtbsZy2GV3NjBdnu4wlJoWyvRaI4mWOygIruMWsNKxOxAszoFWPmAv27jzaosnr7s7HurU/1nvsu/xMdhwCEBNHgPb0V/umN5++sGhhogvEplikQ/fSLLFTF5MVrusGEUSFOCgSdv24iNfMcO39nhLVx/9ZMuoZTdQALEEVaQ2XQp9Qo+QQ2JBdq1KYRTmcLDqxCIcqQSFuHCRLsZ5vz5Gu8wGMKR828tGAZRL0ApTtW3hyzoXjnL84HS7KUzZVEighub64V4djlnlmv+b/oPUxrDGwO8of1Pp4byHlr+ldiGTixNmzuRM55k5RBQYJUagp3TPl+T7WwrnBynnrtXPdotqWpYfCgDAhQ2FupygmNBVlbNMuBYInp0dJ4PqGrQVAYOLBEkwyzqjsQYYFXQWRx5IM267y0PdYnYksVGLX8eIuI2ZjQAld/w1bZnAgYt8RzVxyKasP+0IPlLnfu8/iVCTx5xrSeYW19yBJW4hijky2hMbkKLoPMstl/NlkgUGMSCDEYFNFEBMePO/Jj1CY1NH7VWFlfMmPbqpsI0dVUnFCCFB5ShXxQQbnJ1KK5UsahTlV6sEplKX7uOFqR7IQBi4gjxBZ99Wl6uJSzNaNpnIuXU9LXKae46YtKks2rcgf105YTKhDCSyxZNDPtC6QX2L4ZJzwdLuivmTZ2dqOv8W3wC2aOHBQXQxbFnwi3zMuSHOWNau91S4tWYUVdONvMKgOyXK1rL3pMqtCJQioCKhQiCR4lJYzwoZI1p3A7Ta0J1F0rFcd40X/cOnB0pwx2FTFQw1tWvtwNlMDbpvG4VG7V+c8rF2tSZfb5YsvFQtjndVBG2iE4Libu8RSGdYQBjIn9uvqegw+HLqKqhcFRQjcJeN+8Oojhu3H0KoXWxZleijSopAaEC/SgOXAtQTxzJiDI7vqfN5XPnDJLYW3obtj6BVICqI5ysfWTbAIkVaQiphMGX0vgQs7GW7NIjBCG2ZEHxOoUhbuyWpWCigoA/oiVQDh4KtrKK3wphVh6BtjK02Qidn+zB7wTECDvmTO+VViCNMYliBC1wMFYqKdvuXhc6+ypcfXKa7drBtCn/X8KHZUhKqbwAOG0PfMyaWTXABSia2QL8CtTrKSJGy11K2YHylvJURYSIIIQIVCBPAbT+1CqBiyF/Qk77ZzqJL1RVvTDlaRaxA2rpXNIPc+u0LNTj+ne+U2xS+uEl49lkv9ee1O2x58v/lrh9iqrffWOxKofGoZ87n8hp4Zc/ZbMLeTpWfOXtTY0DQFoUpH3nmvPdTpF2/6zlszB6aiqCI5j45WLlfcXCHfCRFwEADd9RzNkF10vuihHxfL+T0ayc2+I3VCDJgGWPLR600kSeLOCllBrJB8FXDsd5pMiaqKkYNRtJhxAB5m3ykkGKvAuPHlNOflZwd7ZsyfWbFiOvdvYKbHP2ylRw0j5d3F92YoJq6GZGb0LW85A8lAGJR855CUP9QvqUe0641JuoSF9boJLTUVTiNQuCzMpIlTV76MOhzYvcMNMlK6xAG84CoVJKgyhaNWC+/ZWel2d5FP+KwMbSBxZxhIw4YFArtXT4IJ3r6SCGrEE9WpB4fDY+jMZhbtwJ2H+zyHewsP0wrsUCyvQBu+Ip+MLH+553P+hRGWjSKIZBzRVxGAcHCTqn3sk4/3mpBb69EXWXWNVBbxhaS5pgG5sAn5PnfnxSuMP+CSww+uXD+LO04omM30eNRUZkT5rHTiJico1sJFjMvHZ73lViBJ5VV3SJZ1/x+SHFzupa1FsYY6JYhDlVBLNTJnHYAiGIIMtN7oEJrtIpZVBmeZfyeeJJm24t1h31+8tehnF6YhtZbEBKbRjULKenVHP9mtzt0KX/ej/q1xwX+/Xfy/6FqvbpYebVWBmKqwFnLwHDP0chBERS9DlW7NkhEmxEYkFhxATiIkSiwknvAcBD4r1IE3UJw9kpMAaUkMkFaaG3nWI/B6655o3iEIT5J15AxFDw5IihR7h1JEgqgeJYWnxbGEk/P46oGDo+Sd3LQuU3nqGuIxJ9/0Mk6+8wjl3zOtLwm3V9VvrxgDQVz6XFz24G+Zt/0GTXgXgE0GELbKmjWcLhpnTW6Z3sLpkPp9LEXRau3ImddUD4wgxtwACj9449VXXuvyM49XX5xwSZeXQfzgnsZgTLgf2lix/AjwYhDnUN5UwCR2+0jjrfeDu02+XeHoBX5DXDTiOBgEpVjrpp1EO7DJJQaB1Rzbs4My45A1W3i/pMcx+/Un824cZC2X+4ZlxR04kI+xISREUv6QdtRxP75BwtDvdM//r15fruv87X6gX1WbfE2DD8aK52Mo7FdjjAx357pbNSTcinzpAh+cyU2GqCK6QIAQU5j4niUFVoKCkCwIk6qbmn5Jtr++RhBoCExNgalObvj0DGC6RRd9EuQWesJ7yQ06QUughLr0KACaC8X4mgHQ7jlN9i70oLoaxxlxmDF5SMmpFbLV9PASpz/S5arPNIWB1adXBgNvDdXDS939lkJVNt5SIiQjsMENcrx7EGhFp7bPTvnYLkTr0imNtKDGBoQGdgOXxXmyfHqci8vrevuH2KH7xEua3d1nd/fauQGKFWfjiEI4zRov11hbGgdfaK2+pVRnEY4fyeCcQvNKx7zUv5bnoRDQ5jEe6/nnA7DJAIdEQQgSRCnBqEoRyMNCillASMIve303nFXb/HtlSL8/3f+fPjzwn1Hu9YUTozA5Y5/JWENCuXs406e3Dk83ZKSs+9y/EXf/1+7u+e+Ps/yuDY+59f9nj1u9zotDjzEJOjUBOpKWQMvRzxaisygFYAxyeUImE+pFvUIUICulwK8QBc5Qslxzfpzm2LwvRJqyjialDKUwsaxwmkOfzsAqu5RB/nkCEAYjxedn5HhOAQHoWI+CcVwejPfQIhbwe186KKEMizadPPzluqbb/eab1zj+M17oWdljYY97eAAJ7vYSn5btFt9vzvYNsY0HOQ88JMUdsCosNNIq2OjTrO6paLHZ4XXIaDe0OxUEKiois5giP2hbL+7u58mP3twHn3hprcQxTHJLa7mfYRhsmbx1OPTq1HT2xYs+/7ds3bwoxkURPD0KP78U7YGH95f7Vwwy+BS/arPj4F41HB4lpPyhyUCCEndK2zAVcSdq5AHi1gAYlcQEgRRkSYbTi/vny7Znry7+XEwdghPzw8TFiAIKiZDUSKYjM+LufvljZdDF77cr2VSdMFrtHl8n/ale+bEz/YI3+G+bvjrXOEfEmMyqWlPpgowW/VXIZ3uIE8lQKW9hEn0HUEoAaA6TSQgigSzbvh/rKFLR1YkkREMZYrJ0PiS9S0cHjim/zcCtHbcLZek3pAnHZ2p0UaxFUJhXQ88C4Ld86XUME/QvZ1Mq8yDyMWeMbhdNSRvxyJeHmYyXssQbnf4k7XYwvDzok/H8+r9s1sm3lNSMUASMUwgbuuPuUVgalDSieXc9+WMU7lk92uxl1i6/OubmZm6qq+di6tBKe8DFF17Dhb/tWvpsn1WZ1w4daZKMGNuM4m7b6atd+KJ12TLjkh9cfYGcrObwl5whtwf4U3fFN71LylbO+tM+tvsjYiXmVoRgbWwyIuiDd5MTTgIZ3Kga1CThUIqfIxoHpxf35w2c0slyIMxewqU43RCqlVxe9Zpr5wPM/wdLvtq/iD8ZU8hrQVE8PKGX3lgFnTb+X177hyNNFdlZaEGjM6Mygt5GRmHJ61JQriip+GmBcBRS7g6BssNgdNX0T9BsWDzGbUxgGqIMQ5lo2hh4n9JdYDjnZXQ8BM1FpvKcshdeyz/IS9pla8+CiXC9LtEtxVI6437tIIpYw5jE9lkMbtZtUo29+fXplT8c9Ebu9Wy8Yv8r5mx/ipp9yoJDFSUN3fo5HhcswrBzmNMuXzI84kqvn5uNkXK8q0IwVdTN+kEGJKNjFkoql26+lKq3RLspSagtRhiKRemaloVrmHMyJILkiCQ/tWfWXNb1r91f+h+wEgR38kcHUTMSHFMAqIa9WCmTvoeMaAq1XiGHXlRfTCmSGCJuf/F9JM5QAAKLBAEkFScA4iyMKg2Xtddx5cH/Vo/6QX/fLD3IuA/IqG3SO6zgcrbY2Df8n8x58mHF8VAVYw+v1oV/gxFidFK2LhnOQlmglCuNClJlw6hxo4hV8bxNm0xZgV4CNISBMEs0K2uKmNijzPpzSrfJLX9tLGTBGzDmQbuANmgNfSG541BSJOx4r4dB6FmslVPj8Rdji6qHr5eBik4OZZu0cC40n1rqh0cdfOaVHJUF728X//r0uv/ge+haChTCdrIgpDRJjLsRBdwayYWkifZX0ElrJ2/9x7ZwNeCWz9sOW8gKFJhU+98QjTXMTXLyBaZjwSABB6SVF98ZGBLNvTXN522snAH2VR/11G9/73yLb+D//1VMaftm0zdtb5/a0b+zTefr1tqHtJ9Cxm66PcR5WM4ob39dPvQ9zAP/+r8y+f5OFRJxkUQQkHnNVVWd8ss2P7Bd5j+mMPWyz+04SHYCheViWMbpfvU5+D1e6f8hwwgO8AqEvnUdxUmM7JZW9MP69/ql/+nChUeALC4mbRI6duieuzwN7YwAo+YLAhwEEBDXs9BawwtAu6Vk1k6zp2rtBjr3HkYlmp3Jzbjf9IIqAAU9DeYjg4xwKJIrRNTM65Fevo+auTm0Ad/nyfOHtyGfeNmPfpQFj+QiX8Dr+t73iJeHLkefkCa1LV3s2ehTwu+lNtA80Xyghp9wnhdX/A1D3OkT+ErPPlGK4af8zAQGLAAjXojbyLuUbGPn3VkwlkpgFcMBvBzYgznt44N4/x/ljNHe7Q+rKtGHxeegAOSFr1ubt206+HRDB+Pz1vfRftpay3H+zrj77W1ZHJMEh8w+FMHCW/RJzmvdvd7oP7LjJ9VsfbAsDEoYfuU6Pxusl4v/3y3VHcYsRIWjCPWtA+wXt1/lu57+tjomd2nxopzl4KUOxTekLQO0+DQnPZpqB/qslh4OgdgVW0IsEeRIMBEB0g18EaBiJp/PTi6x6H0U6/ZjN2zL7DU4RgyXP7DHZUJ8bvBc03z8Zc8M8rKkpiCi7oQKHXbwu4bUGpt4w/jUK721ZA/swmvtNXz/u00boh2ieHmPpYZUeL2eLWl+H1ZXrAApoAKhNRDXPLQD9xti80YwLqN/ENYb6Q8kNKJSJ24Aoy4Etk4CwTgHXAHcWHjk+MmB7ux/CHH9q9e7/CzWNmw7ZLy4s8DFNUjb2IbjH86Kz+zHjsRom+buhe+7vzDxwQ1AiRCCANo7Nct2But/mYYttzq30UwCKrAOHf2H2rp6XvFrSHdUSSBGYfj22H04gRi53CW8y/oHUhSutHdyeGCTazigVasA9i6PhKm0uOlmgSQs31qzDqyxhHHquLGHBijJ4OOWwtA/iY8gPozEXdC9yN84uUm/3dTzYGOuBZ3TT+vA6dSteSkTexkiKXruBdsUpWkur7z+1Gu52YpLu+zs1Wvf+gvSQ8kQ/lBZCoL16KHl+EDxnGPGucotz6Eu+92O7v0DgojRbRvVbDwPn7UMAdoIw/cpUPUtzmHoOA4TxIRGKbJDnfIWxGc++MfprVuOQB0yHpKHOE1fz/gUptOk/fwX/Nz85/q3vdxD6oLuLFOHqMhfWxWoCFVTKZnDJ+x5pa3bar4plikBh/tNR/nkMfnabzIdhQlCShBmYVgyPQ3zsrK6Pj0eMpj4RD6VKiSFa72dz3RAbt7u3VYDHgOEELVT1qO7eI3LAyhllZGNZAA2wp0P4GCK/tztyvhDdicr3gNh/Q6gugcC8HfKKhfAHgDdhfuarsj6WLyPUXG/TQab2Q4vb/mzvIWPFt7jvk9ur3nrL1FCy8I+dGCcuAxtoKA35KODNpY3jkKGzPKZvPPsUoCCqw58OMzTizQnEsogdbnJib8R9BmEuAkvAmXQEDMEf6VPe42f817VIA6d+/1m7ZvP37xfzkYenjCz+HSObfXpBk1/AmU00ukeJYDHgSori44fXwfSimvD90OT2j+9m+NiGUAjKzVz+c9seTe3G+whFQPTCiWREiWZpVyybSq2dku2bHLgdHJTlx7cRjJ/uVlasoQkFcSSPHIVKWMKcddbXtkdj4iiFhT6Qg6E+sbl8SEq9DuNLYrHkalswXI7rUmfz8SeGMBfLclDAGwEcKLp+IsJ7bis461OFfHwavenN31kwnHpk8OrWPtu+Qkyw+EuwAAFSKxZV3cG36UraW6EKyRi1Lv1WWcdIxkxPPwQFNkQ974+XWPP/m4FXGV84IyjfqR1QqsQt5POMmCxEAmCQd7W69OjXmgJi1hsLmV4xkHL2wfavZaTaBZ1zntuug2Xz7vS2L3XYIRE6D4WU2qLi3g10EAFmMSWql88Lv+fPzKfxIov7MWzKCRDoWxmWf6Hqse3XTyEEUawDMrk9/V9STDGIKyOFzdn82nsemT3FVVxeBOGnLkORPIt1tFsH4MJ4GjqkJCodz0VuTWFdT80oiJOqA5AGwJoLAxVIj9C/hr01xFTfgRQ0yMhgH0ATmfU7K7pZ08TqLkYnxicZte4dQOXl3R2yY8lO7KbStrghg0hgSFaYQ3d0PHGBUUSEgiXfcC35IpCmJrWStPkhCRI+9XtLf/G8BB/vl1mpzU6OmN0B3BaeIzi8eNqyhthKaI83rXyZv4Pedw/MkZHlkyfUx8KlNbDct5mVhMusCOjGA0AP+vgRPcfd5R9VEhFPDQpave+vYjqQB0X1YP2F2ns6t5/2O+EI5/gF/8nPlvuVoQMcYepQM5HucW33GJ1LU5gSKJeIQ78dlhEdlxvnPPoc6x70rPQfZpbPBtaDI0svpn07oQydnodXH+XNUSEuAgRZvgUtNvBIFLzLiIC3HqP3PsnMBoBTMGeGsBmAIsa0OcO1ELcbCAz7JQbCDPhIShhuxESGOKAFEOLENYFtkTrtyUCCMJGpIE0EFlqKLY8uW3zYlGKYAK+NDaS6RfL/X7ndG9fwmbbUGlEzOBguLQ30/53lsf96fYELw/7vy96W8DDUl/1L/HOfnCc0JVPfSb4zM52gADw/WhIznv+1Bu6i25989JiDqlYI009KAIhcaTJIuVxTz/u9+hvYqnP9dGf+rke92QERiMpr1fOWhXP6OxVs9wahSDkOlQCsGAG1so6V/l7NzAsfdIVT6h0GHXJ1TbDIox5Io/gBRcBAuWGfF2yfWudwRaKvtVS7JsfQ2k/gnKA2BMB4BZElEhHaMEWmMTnLOzBOVygtndqkFQwzJXT10u9ONSkvnFwqC5Z0MVa6Du2642WB3spw/UphKBQFCrlK9pi7XTffzZ2+swDDbFubZkU8rNqGJdEbLoNxjIWHRdjZXor9lC09fm7D+ffPfd5zEDLcXEZ6AofCdv2Afi+Ti2Hm/Jf+WCdlL9fVFVjdECHZoNjtjHpc7qXz/wezwfMfnqd/id/tMm1hTPiKIy/FqnJxqLhXP6Rm095WBVy7YzNsmNaK1n2+XAc7Gyh0z669KKg4dRW8sqIGiOSMrt1i6ZQxvI05+GWmMnvhXuAwD9CCp67q5z0d7e7aOKvERE5ustTKePbLAB7ezLdK+QdNMjV5YaH8qyl7FNdMRuoH5R+EBKSbQzHexEdREQfKFZ1yBn2l1NYwCBHxQgm9lwJtSt8Ynugv1Dexv817flmyS0nngsioov1m8Rj2/HK9tB/xcW9fal0tdnQ7xFiAQ0J7jCQpvY7cbwtdGBF13++hGLc3h/0LasErS3YFI8FzR0e6P+j5L20e2qd5me/2Owq9A6SNJPiagn0YaavrxWfJBZRph4xGOAww/H4ZgMdb31u8skgsPdjq30gcJv50JaZjxSJuGaWlg6dLbahH9mU0y1vUouEQEQhHUi4ar/zQI4kcTEAzELEDDpKOJ2U4t39AL7GnlyCUzKTTxppv92PDCtlJ1dq5HCCk5pMYuEEF5y3/khJ81wHbRf9wwZd6rF6JYUsGyU04EQ5fNaMRcfNQrlJ4KaYbd5x7PMRHvsXuOqr1rHXeF+4l9RQGtZx4eenS30ytrxUtjpZEmJzJSrRCaf1ScOuAuwooBh6KoyC0Sf+s6LrP88+WFE8WGlVuY6bSzy+EBji8Ibtsl9/alz+D2f9NQ+9dq6+Gh8yFc/0p1tpt3KWs+y6iMLPfk26kAfuSTzY2mjLNLjd4O3Q2npbpnWWb35zpxPYmJ/cNFXGEIgfaofZyZLuBSBL8+4XCotNhrJ2XCaklrZw0egNOMXxXo2ICKAxjutoAMuxR5cgBHNp2zqWyd6ch79/uO7WsMfp2G+3NOKkojFZTq0jdXlmChlaunRp2QfYcJXCqlVAIbTqCoLiD9rScUrRjWlLE7+LmJWCDZoZ2AAsP6cP+A9Q0MhqZAFBUWDDbkRzFgPkEMA2EJ05QlK5Aazd9af8iWNqjEaVUPk+u8enTrSxnovmWdJa60c8GlBh3Xde+Kr9Z9VBllLTLGjp4mgTS5XShJyYvT0VHkIls224bv7eVvrA1catloZ6u5ArjNx0nTGCFBPepk1+p3sOeuIV07+t0EpfKARKtq66FO+8cgAUAnjpieCTYc/OqMMMnARtqcHw/Cbw59xeHiNfEV7sd3JJBkhEQh+e9CgKUxy9pygUlfgrUZaVFIVCGCQkKARGaOVqv+8OWBLYeB7XJoi8gxHcJE5TfFhe4QIhMcQpKsNfRmANIFhTXugLT6CvMfq1tia9TQ3dFQZGjZsO6oNlzJV92CrJqWjTzp4Cq/bWik/YUd/5pzCg0lEtY2WLMzI8iK74QUDAmBjLYRYuTeRmw9z46uPBNzxTXqP5BCgHUQIMx/dgq16vb/MOYys7t8QTwZvB6ODb1EqXHTo/egG1KDnS5WUomiKFDiHY1j20FzU6bDt6JbK9+ffKLLtId1MGwrgAF+7yByAsCuMHnoCAD197mbEoaP+0GOSDeRZv1PeHHXBBX7KMj3OB1Pb5Vblbhbp9tBRWAQIkgnE/GHVuNEmMiImMBBBlDEWmbP0nJQH2hjJuLqNJscVc0msUTeUi3rTYUcnm6eydQ6ZDBjDop5zR9eP+2lmcpPTjB4Cx+LnxjaPH25kprTHl/Hp/x5NiMXHlyzSrAlkkEkLffyWNcEcsJHW2/V8NN2JCU+k6OmQ+OgFerU6ox6I5AnQEkBMio7MsSYlXcPbQsnbqvonX9gYOzFfbnHroRhDfVhDZuJRsKtd5T+bfHHgq6aG1bNuU7TZ1sswctynhEPOJcqAsBOY4zmFYdyQtWOrZ1vUNFLcy5EqW0MboWNd3MMtQIBoZh8Oe5yONnzn4U9f2IvBZIh2iNsmSQCgWRSIudUuq5Q3a7acYPeWDqg39tQz+khnDQ7MwFS7ZdN03t+7fB+v4wtIv9uODcfyBY6yE0qGtl4GyOC8THpmzAxS1JLbMaAOSEJQFD1C4veAn1hxrMprkrSQ4Jj26aJ3jYRc8vJzL1rpxmn91eG2/xAv7Z55c/GN3HV50x69qfVctb+v7w+6/96DvN/1Y9G5gA9vhG+VF/PVyoTVLulCajy6h+AAZtO1gfKm9wl7qvlcSuIlHaN7QyqEKIoHJJMlSDLNMtoAA8MIIVzauzk8Oc06NHn7/mW3YXKozep8AmjIWUUDPQ1B5eahp3jgOJWbHORnhBJWWOD/Qa73W3V82bW3YSvojeFrMHADDBElYcVXFrXFaDzkAEO252EYn/7BKKcYqWH81/0Yz9hvgK0B+BXAamiaAEz//jsMHIW0OcPkrr17pS99t2y9/0PHqReKiPcDfc7ivr288blowKvJNTmJLWuh50pLlmpJvrK3E9usWg1khzWGBcrEHuGeHEfqjDoFFDnXxCS2KVka1POdX6ctSS1S3HCc5k9HUk4zMKIww8AI7dMKQSHlagFEaJZGpKY5NAc6eRZVUFF0YStwCuYHnTV9Z77p7nfP455n996pubdBcKOPWxATIeWnIgAS5kkCM3YCYqbpFKh5aiFQj6TD/owey32JtyI31IoDX0URWHLgPysaJDrGLnV5e8x9+twf8u188wv92Vzwu2/8F8gB/DTY9d/jtETRXZeuPURjQgDbNhxRMApACUDK8EQIzC6ZH4DsYOYRGYFFUjeqjUTnKY1mW0DvV/StH3bh5hqiTSYYYTmAYToCYFwxJMTymT8lL0ztdU8vhBQs4VBGLLBCxA6hs1SluT9fR78+7uvq/H66/vfSPXGgLG4dJloNFz5MghY15ZgX9yRnvCJr0RhI6OD8xYodFtxc4jNZHD/nyNhPN9EPxuvZPgg+SG+Sh04bm4uEV/fVfutJte+P/Szz2H0xDl/97cH9/XiTLiJYRL9/qFGUqrRk4Z0XJGhaYEwMHIpCCDjEM7MAJBvwoihCd6n2UdDr8buZ35XkLZ3T7jKOuDztxHDwGJ4BlAkQ89C4YqxdVrsXrKv5ai0aucsVwJiOZgMuaFWSoCrEHk3TfsvTLPPzx33/D8T88Ii9ZsUn3YdwDRyCGOqDhcSS26zdBMDO4LmtYwVTHrggxSVp4RRryDy17/4HCQTIZvdFU3ydrzi1oKJwQaMszUuaH1oIHMFz51vBmf9P2vB0P/ffKduck7wfi0iA2JdhUN5X2SUg0SRRve2zwbM45lzk8BkHggCB0/DCKQglz/E5Qc47JXD2RcTvvCoKs3zQTfcdjCG39YRORB2J42AWCJmQyaN3h8MivpJXWI979V2lz2vviQGzmeIBGcyc3Rm3zvKj7/6W//7o/++++4Tf/V3ULCbtvUjjk6ZxVnVojRmIwPZjMDi6xIgVlH6XhFMqfHYmRI3S++ZBaHdLDzkVzlVAjHnjDihZMQuoiwwLahIYUPHOLncCWaxwPmViS00GgTNJpGkvaIcQWr0A86Hvuy8Uepu85iFII7DBYj4g+Ruhj5NwJFZYI8exB21KcTSAjtST9vjKB9UV1F50JCYSfdVcQfQjnrdOz0+0f3+7+s6+tNaWu/sq8pZL1ktFY01S3s9DWxmveePb1bf9j/3Ewry4N7cPjTKmym8DcOXHozmPH9hEJCkNmBzdy4D+9L1dHc2KVAURshw+N70FsqxhAnckQajfOumnzFqJg4BAq7baU2wX9Y8RPDJKXC8HSAGtw84YWo+85sELoc862cnLpg+rtmtABmu84EQYTUeCXQ1mQ7pBeuPpw14P0M5r3PEcmkX9yVC5H6DhlpCyLQogYex2aZ7c/qAHv3X7roz5zOe7j+9KrlS5WsHDH176t1mY7zza8+rzX/aL7IIDIroM9k4Rbjh6JHNUJiOGkeSACGxImfQIH5Q2rQaOFGqet5Rx2G8zDSb7Oe5NfgZA2NNl4wQuYP7ZZtyRhA7FyZwIjKONR2Qc0Rrth7Rg8bggRsWSTe7aZ+mARAsqWI10kZHhNGCCiE4Uh5YwjIEtAzJe7c4YH53E+JHfPcD0lAFamYgSlTKQ8B3ihGASHBQSrhmv8eqjhCsuqfPNs/MZDQK5g7NtUkQq9LTwHggwh7rD04p50mcLVqXTdDDgccrvTYaEEGIMHKrw0EYZAS8PHWPT1LI8GJRw9CrJpGF2pJB/uwQD+NRkAu6jQ/C+6yitT0go1OekMP6j3l6vOT6JKIT5iDetAicg9296Gnnqz3xfHD5g16hBio2soMOSVgzJG3ZJA3wrKWDxEdwnAUy9z7hHQyk65/9y+PofClnWKFAQdfdn/VcERPLLVR4IHZ/MXU3rbv5RzH0II8X4Yx7FuwrqB7q+dykMru0G6yc3M5E6XdVBOWjNQvtFhwiAyzNCWF33ijQIOJ7FV50B8YQu2zJmpozww7ecBXGUuyNQF+LivvCEdjHYKQaEYiAQCBPuiUaBVnQFPQupOJCRbhNDbCvXCsMh9P4v9BAVYNA2al5bVBQ/lPfQlEREgQjd0kUiLlkhoTpszBVq6OxFyrInhhLve9/v7jqI0JjYfEa9wzfcl/8iwwrgG85lo5Wrx8aUd0XMfzV84eUuhlFH6UIYtDQj9TQ+s7uCEOsT7+/NmSeHpTZuOHV98R9PUeqSy4pSFTlnJSwuxclzxHOpxvan+1Hj+Yt6W0Y4ri0N3APCMuVBhG17n7bLP4RSTQQr6CQswIhccUuwoB2iuYyGiO8GVAEYvrDVwL5KKRMEj1/7Cz51FeSUPZV65XMJFK00iqisxiiQFp4BZUkLhwdRonpv77p57hoMoaRP1iNAmVk2oKAtDKQoWNrbHTwbGmJByTmxQXzxS4g1nPNXEwTtSL+Z+/A+UuhgNBkWqx6H6fOpiRLLalX/WjRtVG+w8kgDhLO1yZ93bZ/mlFVI2PXVIOKE5oRUeYxqW/Atl4YlJSK9VLSObWu5gdmz+QRT0ftp1tl6vEH0t/k6bBJV6WsGm7+Oa70ojTEEowHOLYL5r+0hgF6x0h3y07fCEA5iLraQbKh/HXkc9H6o5KCDSNrs3XCXYG3mzPP7dC/1ku5S3YokzKtVyvR50d6QcHzd39+oeLNm8MZxQ0aNJsTV1G2hhX/1TVliKOnz3E6Fc5WelcE8UCTJAs9MEn7vUcaef+8ydZ87nxplHJpDiGQdJHBlmVCEB9Z6wfHvteceUhyy9s4kGFFVw1n8auGTFdAZBleQrVnl0ggh9WNSwbJYk87Hv07n6SLtVQ3Ou1QLr1PTBCs9UgLEbADyPJgkgz5Cx23rU124SFClwKY2HyT3SDcHDcT4KyeIOBYNeWecDZg2LE278uDd4/cWmuqmpvMWhvKYPTx2LKcbWMmj3U256LIRWDepePWSYluHOnZricM+JHHa5wYbK4W0Pq14opRwzRGBPq+vVHG7/5b3ulf1+Ip+G0RbzOuR+694Ifeudx4Bl1/m7zpyJBODkQsZYiqUhMkGEiHGnwNzVYt2RCk7tEso8qZE5rT3KwJq1PzornpE7OAT5gIYhQyCmzr3FdZtamHoColwKH7MOmQqHg1q3yftvF6JpqsGfMLbdfhqd2ZTw5FkIB6nibrSBGEz69uf/+TNY//ipY6OS0MbcxykVkSP+YH9/46va8GZLl1uPPyiv8mB5Y2+X7tXwkGdfvYKL7QEmBnF4D/twbM2YEzSJvWI4OIw4JTkdB5jySYbJY//mYeitD+rLMQZZEGWRNyPePN6PoC+NKIxmyDhTNAQZGYmoxx2dAEMVc4bjIKyXiC83j8njUCVZVEk6wfYsDdacSviaGJP1JyTC7s3Bvh+dDYsrP85nWqUc8AZTaiwBeQRlJCnxcZFl0e5GXiDX3z6J5slUa5rxQfcH8jZfnSbhStIUh1DzDvekIMblgIO2zaQkOS1i+XDWAEMyRj24GcOiIYJjSK75Q3/9Zc87/m/HO/DjL6/nXey9N203Pb2SzT/kRcQtPh60YTzbquDUANdg6LjE7BPlRZVfJmOL3JxY0sOC0A43jm8MGSyrZZ6f1IirvImFb+G/rrcTm4btZHSG0mEGRsIcHM2dTVRVh4gPWw6aoBGmwxjKLHaAGB5072tnz72/uTy0lrBELCQZVfnkksEfvvLl9N/vkm9M1xTS4GFINYIIWMKx0Flni84UDr2kpwAUmQiA5i759EeWt7f8v4D4QmWgBkMu7MGzmZyEtpf1F/9symp5Jf/7d9lmcFioJSty8zPX1gS5TdZ1xHiKm/6YP+fNzLxpjntX3o935O/zDv5i3q3fPy7bHttMXryQi3cv4zR2QJm9WYrFEMlgR0V1XBO4mJNRvYqqHoWNyomDoO15hMfckGJrQqCFy6Tahjkuehj22z/s/n3b4btoOvGQ3xuanxhYhepk9ehEHXcCEJ7NyRm7GFVIvbh/ntngGAYhD1Y+sP88G87kcZi7ZwykGkuoKdrBu3w51dfpfw952Hyfv6bFUB0UgEhWWLaF8w1WBfAlJY81ACrQTOOiZf+zPX8yPdZVNKn1A6ZjTh0nuiVke5R35dX/U68Kx8Pz+zvLC/2z0QJoMhVw0G0wfKityjgk/MhL6KFHcrz7/eFd+I95h/789o794eVd/+1D/M/LH/W2fftf3vbvfHnJO3HPMhSHpXsIwiGUCqlWj5w6+kTMm72iujxYRoXIqIkEaZh4hOgUXYJ6iJ6UoW8et6w3KReP8wcy7WPtwf6au1l3S34xNV0Syq4T3JmYGakI11EKiHJJeFhZvYO1vaTwrxteWLnvWW9T3c7RWj0R4xllrBHqVI8hJ3re79A/OoOfzWAyBPhGFVFMZLJcv5HanF9BQ3+9FE1WK/cDxdHVvbxwdy9z/BCVbJHU7SlBwHhq8W2Pg/aq/jW78h9etZ6/u8yfVi7yhcMmu2gaFqUo0lsm4b+77827fa9ue7x1aL+G+e8f+LygOty2fn67yJdw2a/LJZ6eGnT655795/6/off5D8Nzt9/9pmq6KkRHF9kz0yViTYkeypAiYaAQiYtAlKamdYykWfjhnDOrwHwgzfLWfv+jZHx40X/Rafa+dX4wtVwUOmhaxvUAPY9DB3WJ7dyYQ0BMEY/rC4R0RB5aVOQHPv++tKy3H7pw1KxloSWBlRWuYECshxqvIzj6UL5Z9xt7GpN4SEK+gZ6aJ60oCcUB/yRwPg/gJTRbQsamlx8mJMPy/E5edY5utLT8lUBPR0gxD/DQiIi7vOV34+H+K7nmSwfeFxBRhsHKWKbNh2+l6MXCX++k86edXrQtPycX+njb7ERrKyfGaYK4Pf+Vdn8dn1uSUSKEzAHB2AKolLGeRCI/SxiUsiljD5CQILLu4lJUXA4sZJZv8fLqka+1+dfai/lronXwcI1XRCZJbTcS40mICGQu3PbeHZIvKWtFaMBVLoSHMDhEjKtIl0FKY91wwJ1GHZPXJw2LINYGxKVPAH3XX6klqC75oRoBlCGABwH8xoczkjnJiicK4AMEVDBoK4D9aMI6evXHfR8X5fJvfXDdePMXAy5SxDuml1MUbm0IndvV58Nub5c93o2FD1rXkfxaSGGtOzbtiWg7jdZtTNuIn2tjCGAp0goWKU6tHBJE6DbMYTkzNCWyen9bM8rJzErpz9qKIspEDLkmzJIFIIRtZ41Bf5SgdETsg2aIFLA0D+5e9F8V2649zHk87f/2QCuJjzbKLZRqx+4WQBf1//GfDiEZHqpZ0TIRIDMGFYhYDLPuQZvbFmcNwiJNxokIUmtgCLFudff4/ZMZNYiIALb+ywE0okmLzFwJeiWL7WFOxubbV7/NGBYBkwyCECxDrkGjXCgfhGw67ZP4E3CEcFMYcTQDkqXohCbGufVSK2kbWvyigUElhJQMr2KP0UW4U1NyaJGbdtcQSW4ehorREYIwhpGsaXwtRhPHY45siD24CYpUM4iLn52mnrAsp3n7TzqvmbIJdRIC0hB+eEUyHxcZO+IGRnHA2ZpVLbsKhdSl437Mu1XUCTY/a7F1GGw3JpSndFdJFQrpp1k+v9y9TdkWKtrwRMzc0H1r4+pj4EKfu3nN//l3aRdT8gnMNt4SJCTFcTa2Y+sEzo6wLmBjAo0AE2s4Y6NANGCabIc0IIE+AhnrRZk9U6gUHB0s+PiWXnkXdbqSiJtlFGYZQaQEoedCvyPaHhIaDcRcP88pQ2GwOfswaqQ2wEZ2rEGsHQMwfFkeKoc+1ps/QpG+dTIbc9EfTrOvt8JVa3qmbXLuQky2ItsGksWDFNTkCGc9JKGwhfc2ck9SHxcAN5qd9BpF4L5kUF7O7/9w97HTuu1OsSIlhDbQZQx9f55LzoOISRTvvHdJ2JCylTXK15NAa4I1wz6KleAyTFhGpOYBYS/4VtOJqmGSyJ2cTHQ5+iVE9Fpha3cUUgYUKdAlvZ2F7KHte/yFSTbBRiSEgIt9QXPvNZElNitQ4FgEInwBQLGAEtd12H2cFfUr8ETI+NvO/6XwA5n6nEy6YPpwE97KQ7Z15gg1k5B+5sPcRw/ytjhiI/9B02dZd6bql+jN/qJPvcH/57totgkv41IX0O083x7tQHR6o1Le46HyxHkoEL2MwliaIY0uMcaNCW14dEhGGywqPCSCvSKc4eZszQNxtXAkBkUwTpHdEXWYDQJNMa6cU5ajiwgIZjAk4zyBxgWLdQzzb0JmUcrwpItLAXitJ6HtHiLOoLnhUABQUFBTRIijZWBsABaRmDS9WCQREJVe1w0Adod3JBqbfe8FPBLAF6jwNoCD5pdu3LMYdn82VebL+tcenvfXn8zBwESkNhnaErQDAzbPMZaUUpRBIr7C8wZilFN+DZQl4cX9DFZKFgKpj0h0uhA92DyqgbMttyXI5WtL833f15IyjGymCINTrWBXBXc/PxW0yCCSTSL6+iYkmiSy6TDvulgkQBgkQLJgSBHTpI4WLOcOOr8MIULvcHD2zdKTtskZ2ffncuCrMuWFaDhtxiCo4a6nrHv3IMZTyTxaOj58gFaQCB8B+AxLwEzIVSy8rpp0+fSGfvHnpadPCtJCKQ2wPYcHDDePsudqaZ9vTZNDIhZKU7Qdb6Q296CJjIud/cQkbXd2KMRFtx8pou0qQZVH0rC/8EUPWP4ggfioR3KUasYYh+FM3+YkNFcXlMu9gScRG8urOo+HzjtAStwDkpD0AAdRaJRd9q/U7RBaSUAECcfqFDg/H1vLiRaPUext/hvW8EyLXUS8hBQQGHeBxgqPkLu1QC+A9xo6FAZaBiAfS8J40QWSZN3PX3N6Vf/NX7YgFIltY0CwSJGyp6Itcnurf7Ls+XaLBRGlsRhrEzG2OI17vvzOFrPJkOYCbcBHV6JsEVI7MW41lLg+icewtRvjzl5eJqhF1Be+3/GxhqOEB3huA+ySmKKO5u2cG5U/IDvwjr1B52HkFwWJQprciRQAYu0KkX3WG+4nl2zev++ONBz3x4Zg1pLr0fWoxObx7HolbAoxlhN/jvxIvvxUfyfOJZ8K/wNwN5aICRkXQPf+Lb28eMXf+1Me/MsXcwkKEdqMiPGxqhtDvA8duS2ql/ZGDEdTKZuMh8k6EVpGQtL8OjhcHB66axWuoQT7rbz/IXOX9hYe4PmikaKNsK1arLST5zrViV/Aw/7Cb8TPhbHEHJZlDfhOXfWWWy2Cxf1HWHcHhCSHo70TVlE9pfJpCuczUcc2EjU4cYyKyaE1nGonpOtWXLs+VMBq06F+ADIk1AWcw58AETYWitdPsISkyg9gTJ727MMb+vF3a1m7yPv249YKWU+41dzFg4PE4/MrK4Ai9hX6lCJZfBddrAQ52Li9hOMh7LppuPQJ2s6r5OJOtH3/hOcbpIjrqXInOM7pP3m98//8p4/4vT9sk+CwUyng+ODhWlG+FaQFPn7hgpMHXBIEw+3Sqe4XVofQ2f9KIkn4BBxz1+uKhrNCAzKjooG/AXyCCGAw4jvFUpIrsXD8ZW23vnVff2d71f/hd+vSgerCQ5MKgs1BtN+rjeDwTmVirjXho+sjDgSAOHsPppL8kpUSsOOO+1E0P9bCmwGGs1yfCsr6azDPQ5/jzi6ZdynpwsRY/L4loe8SGnHTGkNSGg1CKJbm4lZSxF7oDr9V/W8rQQlxx5g1MCjVvNgJab4URxTQ/wWQhSWogB4r9LkJBvZy/qvhIT4t3aGJEBvuGEliiQTQF0DkW85Kz3V8r26h3THXvfboNxfdSWBr3uI1ctgOMT/atk3PfjYDui4/Dt4P/3zO+o1pFQ48/saPgsAIrVyulpfbhEVbBq66RQ3ExoCqbXcedlXbS4q+H83gq9hMXD/8/JrVu+pMPpC250r8UqS7ztRL/QlgVAmCmW5vk64BUz/bXvvvfbdNN4a8gjCADaSBhou+U+uTgOsHFvq2F7hYuxmMW003eKpeO3u4W7w0oaf1YGIT8UbRzS8cxK2439LX+VP7PvEuP7irP/iu6ljCxhAMhEZhwV3OIF4oC+GgwEQHpAiXCtZkI0QqJXcWmgzwO8/4PZ0jFrLtzsetc9aeRMyeUVnD1BeH1BdMDYwkpC7B3ATgvdKjYTwG6Mv7tiIv7v1vG17tf/jHdRU3kqHIIrSBNkL4zoCDflRzgfAl0Rtg1cYdT3EshYhtVIhkCHhIvITE5lJOgFR4B/gZyE9l42Ev53V/T+fsvf5WTr7ukKTKtXdQgsIoSrCWQe6y9i7rDW8oXbxlJzBJgjHGdEBso/v9XXil53nEH1k5Yackc9zqlSlI38oDQiJWnKadjczh1PXRIju9mytcpZCGOLO/AKcXs978OZcUqGGdXywOpMKlN4ssL4xqU/RBlBsJjYhQGEFZ4hMYVUSI7qooioAS2hLiSiAcREQgECt4kL31KiJegMcENTCccbRC+nX78D1Unv7Od/O7Pes3LTz+vOpfuYUppbHoU27iMuInMUbFhigHJoVKUdVkZWtAxKOlQGGQhHvY4GJjWa1tv5db9o4gxl7A5GejVSYaiqHxDkgKYNjEQmpwR3wupD+wRvT7S/seFrYPfB88UNkCVmOJqbnHu9Pj6ZJS8lNQWUTAcQBbvhwoURg5gY+SFtZrWD8mGBhzqoOeW6u4uK7ugwOxGvrH2CgRNt7cW0xdiA1FvRgiG/EedM+67bv+vfMuf87yl7n3P81rfe93/X4q7HaOjlBeQ2iVfiIDcAIMwspyAmMsrJqIylotDzQKUeOOe6yVjiMrhoSabM6brfMtaZtDB7onAlM0PIXGcyURChmLYrCOpBYIGawWSAe9t9z9h477d9q9AL2+DuBSLDXjongAabF+2eXyxVZ7Iu1FrAHrhKTCUrAcIFYmkLV+BIJ1G91VQEEHEJEEXLs2hk/UcXAlWrhESpEU30bHcS2SDVDsbEBXEU8773Rf90/yrn72e/2vDNv3tf8OvYeznm+Ot4M6XMd1DWeB7R3cIFgoheYlQYlDYhYxb0kpRGxAPn5g3ihjsQDWngTW1grBmfnbMuulRkj1lvANs9GzCq55AGKgQOwEkicQ24AShQa7w39PzyH22y9Vfwy+QHyJ/EhrANyOpWcsj3uaFx/itbXp8lVT+9Nh0kplQwC0EADXWReMEcQ6dCQRuKvQloCNI4ihhb7j+uhKKX6fVfOImxQImgLhmH4Ii+Kia8zLeN0/y7v4+Xv2r52Z1/gXea2/rKOntO7bXc9djlWuq1yx/uZcJqmTYdIgtouUBhpxufkvhIjcccHbQ+HQlCDF2O5EE24tHdJEENJA5rbPG5u4LpuQMz6OHBQuwfkF6LzUIeMyU8gKEAAKmQAJYFB6qD2MkmoFXi9x3ACgGUvRXNgDu9aebTK8u1yOjhkYjCiItlsQCqFZazw7xCDAICQAQPzaWBXtEUREN7R8hxCh6wwcQ7wI2GDd0JIP0hm3v8W8Dtd8Tx7zpzj9F+O+mtU/eH9Q/3RPfeB5yBHlWhcAlqOAy3HBn02SEGpSy11VyFZyaE4SFzmGsJBYwpMKt23urwbahTZsQ3e904hwVO/0zc0dl7m/txGyCcAwRGyAQjkYL8A0icQREF6V0D4C1zPU1yrmegBtWKI2Y8QDkjVwqY2HTY9EL7bbUml9UUggNUCUA8QAsS5dsF6za2M4giOh6wYO+n7NB5d1J4GbYsVQ0UPrLLestnm5Xe09POYP7cDXS+Gx5a/uB/TP5gP9a1SZgfqmmmfMbfkYgA4PD4+78LOWatIijtg5DCk3Q0QBwDeJhYUIB/6yubdi3q9k0uWDMYThDXLILMJCQNbJLmgzHHhtKf5amsj9AJZjSVyQ3KZ2Z2wsxv1uPSkOC+FCYcSHSn2sDiIREBghBuvWROvGEKs2VtFBN0D0e/0z7g5eCApXycctWyyZuMzu2zXfL4/xkuz/qn0CVGLXL5w+6H9x85ddx0/rFQShClEIM5OBbINo+1LLUf/9HbSkvHGGp4pQb4LxwQyr6cTYdfGjDxb9BC2fieYnr0gQnZs0yA69nEbbkD4UzQ78wYnso0nIAbCxJEIDa7ZeTBfavLtUi+7JHbWJ5onSQKK+aswK0A8CCQnQW4M4hlit93oDiFXE446rvccGys89G7dCWPZtt93ejUf/3mHBW9CXtma7z57u789pu1wu62eGeGlM2pqllHIoMt8ChlCgqn7XJh92AOLedMZGyfYLPtPwkBpgYGlpnZxrk+ssSR1/pfOkpC9h6hMXdDO4QvRxBw7QLAZNSskfx/wft8QDKBW3adA7AGpLoQbZpyeaRy8ltge4YAouDDxh3Vv+eSDbUehZY4FdC2xJQ8QAccy2azWAWFaFuEngKCmtIKKjFIgOW659GNd+X67yCyx8fdC78sVt9dzpvv88XPRZ0Ua20JfLbRIybA7Xrlq4DMiDmUw7yOBk2PY0wuCMMUFwtoQ3X3OBYALyHeXWGwA8UBi9PaeAflq4ot6LxMeRPmWsBKPYaicyDvpQaNuy17DgjYADyCRCuRvAQyUQFlBXiWjTRx9dcvJO9+BGaY1zIgjQWHFCVRLSpVpdg0DUMAiswHXsavVYuybdRDbdDLAZ0oRs3SKzVnbl62X3V9ter6H4sMgeaTlt+em4t+/YTs8VOrJ2LIbgnGFDNYDJxhnJgl0ymAV5kdzBg6BxIpAMwWZIqB6AoplJFWGmc8p3IwwBfCD9KSXLD68kaiYXKgEBnYFugU6glsNTy7bJeRiPIfaFZmil/mxZfDYFwP5SqCWNUIlkMsclttpOVzfZ34m4EQzgsVYi+qrBWDAWAAWDwK84bsUVLsLxfRbSDEKzSZrIbHpu+xxh94d4/Ncf9vpV6XpfoAPGClzuz1gu9c1t5jn7zy7y0FUYQoE40U4DyIVyMyUW9hLKXkKwBB/lYpZOoKBJYqzvmRtwoumkAmv/5YaNMETEHNRfoG8BZ3TjnN7FUoSIpFADy4i36JypkFDfArgeS+RC0dMIHRbzbftyUvEwFzfSm18DifGxaq1WrdXQITA3WEFc1krHMxoG5svf32DLmR14ZFd9E1f/44dr/86mXd1gAcTmnbbz1+PSXyw7ndsKA+n0GF95F8mBsp2kjksliVWdzJMEeTs/7x5/VsFS7iuPcspxKYiW7DMAw5CEop8IIlIQAGgkIGkUdAKoXEB5AAqxhBbQ+Kbj9wGiEDtXz+/zn8jwpOPEBGAmzUbqfbbjXwBu/Vj3Fjt+bV3WhoWruPZt7PfB3TVfbrv/SIrv3cFBQBKg2RBw+T/V7ucvQtPWoEXbbzx9dqqBwtbVh4lJtCA8IUSDQxA3c1JjzMvbyu4r2704fHwcA+laUgAqSMURB1GKC6xwroWLzf+733uYP+1JWzj8e4omYJu/og8EEijXHAJbpyioWlwi70PGyoEL7H69PcHLba8fvJj/6mbcBz8u4MA4NnVSebHQ0Qu7W8yTbvlsSawf5gVTdFMhCqTXFzC/TqRUCAFlNgZOE4f9WszgJRz4MpAAWmhVNJYUMDWUSRXeXwQktYRDgDqzvD3qXzU94uvfss2XHy7yqbeml5PKeFJCCyhFETBAldj4VRksRm57P5D93v1ot18u+10rs96Xwi3wR/IVSMNtEnjoxtMPLORzAE/hVptfxDLbtdwUd5W3Hr7dcYdURARGaRTxVUmgz/GBgEyUh9IH7nvIMddzrlCzNUr4QIsARrxIKzHHNpBp0wsymiaEO7OUQwDlbfr+/L3XP/E2706P9fIXcpO71Bk0zQYDU7Gbct3Q3Vr7scw5jD0/bI/3E3uMP5Li3W3u1ZBHIRtxIYNaxPLSjduvAPKZ+jUAf+ATNWy/j7PfDG11im+V6zPB7Zc5fZ7jRhgT2kkwjMbPH0+BFZspMjrsj/ZX14IPxCcqQ3p48cFMGFYJJR1TeIvP4b46j55KMzFGhQAiVkEAZOCqU1AxIU3EGzxNoVIzgAMU2Umg7Qx8cj4edLw4v4j5Q+bRVef+oKoNrCRELxLG0z3d4CCnFkLK7eXkTQNDYh1Ureldx/dHR6kbRSEshkhDDHUQY4AcK+0Q2/gUWsD9Gh091QB9G+Yk5KvA8kCZZfx2s2NqCAiqYEMavMqwd71bPPiK7g2aHC1afdjn4VtUTLgNW44/4K+sS8r80jpVST9wBuTVhbO+PxtstKRa9auRUwVusaIlN2IDoDuUek80ySNgYKdIKCCQLgBOEtCkYJR/ivh2EkDVzx4yFt2Y4rZRa5++twb7HUKsjNwHV4SUlqTLNQ/+tW7ZVauhltarDrq+77tU4mgaYtr5eGYJ2h0aeLsLVGFt1kdPinkalGhj5cFBinDDG47XK446x0AvlR650kvaXQp24qQGZFkOYlkyxspFCKNtc8ksbhVyaEchW3H+Rxfd/QF0kmz2jcZswjbouv/qzok3LTmUSI5Y6aiJ3Xx1m+hgY6+keOvPuyOwSaAR2Pr89AuI+woUurcRh3LigW+x8yObt7ggoSyWRFkigPAuCKWUr+Yy5n7SZgkklVwpFTE1iVpJSK8ngVFJnM5FFh8LXqZsXZxY4MHIe/ihnJhSkLKP4Ajt+zdM7eyl672qFCmPS4tD6E1XBlI8kTcajtgIKH1FhFCCAIPA3jg4Xh+cvj7BADXhHnkoB0BzLjwVQcbcB1f13vKK8tKadMjUpkLezMzHbZ1FaXQ8vyE5Za0FYzBmW+Xy+j47p615KmzdLD0z8FAOqqHLsOOuUcdhEihzyvV5bknHdmLbZtGNZqNitDrQB6YB2mFNjyFatj12R+B2Q4NLa9wmnV6Qm1MP7VBRDc6/avlkksOduUPk7e+3qWJnxNQUBuO+bkWbNe2NhkQVoSpSlmUhWuiMSykGWkpk+2eA6f4+9NAOo/9l2HJvv9IebrzbIC2JfJou244BW1owRlE2ycVorZGU9b5S7FgokSwkgFWpOnWggOATThCX+dJExsiHCyPfUg/lEOWfGB4K90R7NE2TsiltF9q2bmkTjSG42eF9UmCh8X5NKR0qKYRsI2soDNF1CA1glIe8xoXPXqQ2l6XC97xDOUyzI6+3eqgjdjxcOsmWaUqlC5EnblIbQgF0a3bRZYSo11zv3BoGrusGESUYoJopedJdtpjIdhceSAAgMw7lAAhS6eCqjgOTHAwMwuSJiZvj4Qa9pkIHSHAWSIGzFBAjrPk+gZ3xHMQm6VNKhwt9qt0CkFGHchBAw2DHg+VwwfAcdAkx7noYY26bHZPAhyyIDbDdmuM7DqH1Ex+YlZgVwrLrp57QISgSkPY881AOQHtr1715883GUdsNBlcGgHUuspR0I6gK2VxJ1kGLuPjgUu4nKBJDP2Ao0na5cDPpYvN0cMGhHELVrey680rxUL0Qb8TD9dH1NQgKX4otk/LLURRF1kpKoy5IKVwxw0BOL1d5a9JFpQAuOnTzZ1jXsfcqn6FgQgpDJLB1jkavAYqoKa2Yqx76oR/5IYFFAQjW1Xc5K1e8HaTdmnwWN/pYJJgnOVmqkYs4HX6ohdC7pEvh4FRMdwqEQtB1bbd3KY0qqsii59QcP4jQIQL0AiIhiSVG2HbClLv4UXb/BEEydk5t5+PJHLQoD5aIlDfy6II88yKnBxw6IVTVuvz8lGlPDIau6yJiRwqqyjdGEHeCCJ2gXrMDYBurGYLoeZ2VR7vzl/DS6EwuuVWucEp2Po0pG2KUBiCKQws17tc4k3NohLBa+riZnsBoVcdZO2BZhTsU/hy9QkbVIysK0SWMANCCibVgpaCxo8UVF/+vrj18/Jce2gOcbtM/tl30+auHee7i/j6Jpl1B4TqVk+sOhVBRGwMqhoOw9PkVXIch7oybpyj1Qi2B6KMfVO2xofGwtlxi0uK2/+xvudLi77H40h51T17JreEt3h+YbZdYbfc0Ldvv4g8r1STV89CHsD7U7UezzQmHoFSBhoGE1PBOzYUnnkI4/ho/8onK+goOSUAynmLt6VMefnDt5Xe57sOP0J5yenghF77dFbascf+0UGKytVSQz+OzVEDloY5EtY8384x4l+9YwggKgY3W0ZaQzlN5T2qvENkkqng+pUWWOx7cSFKEBsUyuZF2loer/yf3d/8f9fJe/q/oLpvs4qG+hNf75M9yibVXMxPmV+iupCADZ7AOiSYIvP5QRqx4TVNjry3oBYmW0IWwVavVql93azAVpXAJtFgiChulIgziOLeTLPb6o1vrQUkXb+5evJ7fO9z/j/6g13/ju4C/erHPv/O6/5yf7yGfKbFB7Hn6C83zYFIaEr4U8CXbyU89O6lKistnhyKknxdll17P2m+dzBxXScfx5bwviKilQ5EAgVWrvu/7mr0YXO1SzONiqWq5fIqgKZB+znJbI0RDv7XUF4/Ry6v9Xuz1VgH8Fw58/H12Pl1e/5/+S72Gb/0Ml9q4a5CN9cPCHnIpqR6TgVgR3498au0PjfRQob9udShBwY6XeLxkgEch8QaTTOgaHNhmo0UjGvEtS4yeSG4MVh2pVh1CDOBOb05k1IN97lSwcpTYQHOhJiAQsTV0D611uWa+ei0/i0f6ERzc9cLf8VIuvPECPh+XfrKR6guZ6iHW2eTlk4QHNJIZNxiUjyg2xPd6TrTuQzEGNKUwLj9UAHik57E/k4krwIk0CjQ+Jzv/veWh/xs88D9xpw5bb9v2RWsxcUe1GlUdCvO1b/q6D7Qdr3vWRzckLGeN6EEa0sOktu0h9tpen97aDwG9AP4bUwcfPP8/7TOXe/of86pf/Ek229xmD1GMjVqJ9yIVqbQ0hgt9anc0imBha+1KtnnjEfYOeg0VbAPQeiiAg2vAGX4Btp3GxZ6Ynv9/hvv/+2L6M7HXq6LPRZptc/kzzTCBqCOBjB7lV2uRmB3Cc3T9hU6sgBXCwYjyA5jSxAFqr/O18nA/MFgJ4L+Vystl/8Gf7gX9Gf+OXH266vyd/OY35QcntUQsiARAT3EemDQFLdkvUzIa0pMDYY+Z8JZseHhu7fcbN+jgROknwCjE+CZ23JruSd9S83uNs1f7/7i8qb9pevz/8UZ0BoYLffPHecccIilBGPmjo6ep7uo+duadHrTHsziHmLXJ7d2iEK//erzh7x3oYnDSuLvo3/SzzPgb/7jtvv0DsqsXs/AklaH4q/pTJLtIdvg5KXxiBATtkzYHF1mdHrY8Pebw1RX0c69085d48PUfIf20GIL4gqk5nG+XdhJnT3BScWCzDew8faN7/aTvS/5Be+T/6NnD/k2Y9VMQD+GSmOFe/6yfKION0jwQBNZIP7h8e62d3LNYH+U01r/2hU6ul6zIG7kjr/cHQ+Hh5Kj879zT3/mve/B/5T93ye/+Dbt1n3nDr/0sMzaXrcPf9eWp0kAFaIoVEi/UYEkt2eI0D8PDarzSwXvzZu0h8YO8WvtFXtj+DzK1H1oOhq3TJ7Y/cUPWkZkhfsz5Bl6uLOEACUNMCba0C0CZU2N3iwW35dr3P3rs/8yMpTFFagc846J/+o+29fobmbxRQEqTEoGL6DzsoNUOq6zjTaf8VfdPbjrjTe7J6/7jWHTjylH1v7PF6f/UQ/4L/7PL/Xl/1ez5cN3+YrvpB3PzZ6744Y+3/c4XWor3KEOy9N8Ogh1Y3iUxpdp33mj74m2GF/fBb/PqBj/f83v4pKFf5m1gwQR5P7VPXrXN5SJ4MukcOJEfoggWlmwUZAA4RUkgG0hstxndkqkfsgfD1VMYh0CRspp7+Om/cZvph/ETfOa3apowl+a6qhKRSLA+wghOgCMSGT8XrMJcwNhGR3qr7+3K1790H7v/7hK3f6zw+Gb1z6x29gtdz16PdhYnKU/P6MHTnzy00WabsPf1lZ/RQUhoBMYwUJeY2SxeXH1ue0Lua3p4fuXVZD91V8XQophI2YAbzSeDjYdFZVMK23+/zXr3HyP+aQP7jqPx8jsOAthUkhFoYqJJ3A87KXFhPbVOT/cd2gvobQcccmqImedw/4t3uuGt833k7y7zQ15Ze/QLSovnCM10RcO1QcGJ2ZziZJ2ojo5n7r0YaWTSExzSl7j2c5f64vdud/nbeUcvjH/oYe2L79/5JZ3Tbvh8to7IGtGaTxZiMOpxpdTXnLBt6eKBW2B5j5N5oPbGI+Vnb+lO2XJ8eCEbTy63aB2Tk67GfBqXbEQWwEZ94RokbIJLzKLNbF735Lp3W/HBNwAI5/b1GAAvlVzNSEga95s5uUSWQgJSm5GMw9T6FHebPX1omz0kR0EFOLmS+z/4XNvuOy5b/fggzQO8/Y95fODaBGZMOIyIKiYoG1mNoSfjIHdwD0NG2xJsKcXaj/r6j17mqz845Mo3ueVFLfVXbnfz7HG2yIzial97YYX7RXkl7TIwIbm/dT0io0ZKsW/ZsrmKKT7swTfe5FHbu7aHOPvG8/FICNqnoD4By3gIDglbN8HVQKWfYuhP8gkdyD4PZe7+N8AS6e5rCfJfrQIA+SVVGo/4LNcbfMGjSksSOFTDgqOh04dMeGuv1K5UnPKFbD3bRBTkK6TrSa4eFwwf2umbD/jWP1rOf6GzvCWY5IMMJBBY9jKqg2GNmE2pkOzO7ISg/un5lV/9mWt948eHXf/WVFOJNhdH+9O417OPO+JaOn7urRaV2BZNqtE9J7tkRiN/AWI7cKhFWrTLHuo6q5urthcPf1y2H1+8qO23LtQ8dA1ED4X6IMWACFwEFyHlZCHi2PVB+zfTGofuoux/82ty976T/s9/g4CiALxWOk3Ca7yGrE3M+8xvg1piM13iOZpXTfSlEEGHtovFJUReVvWjbb7ecK8j25vfRLsHR2gFYyl+F6GdvWcIDoWoNPKERIAhFOFgxC9FIFseGXUND7jqh1+72rd/dMvXv+g+ekCMtTyP9pnjzJ87rGt98XfQqZpYJ8dCFKKppuVsDA3ITeyMDagahEEyNdYA3x9zv0Apz//kswe1oAGZASgmQgmJwCYQH0MkRM1eOQAe1EX6xmRLSYlPhr32tzkf/KOghaS7pqp/dEOJ1IjX7A741dgiC/TSiGLGTnsBF+4uu/nQ1ZYDs6hltJWx9eBqG5dt7O95sJNvsBLC5E0e/nlgp2L4wJLeJFLeYJAQlKicJRo5UAcWXRociJXSSoJ1cNv64aov/9j63/zpkg+fsm69QluxVv5InfyHcpXTN0C7i4uxMup321paJFMSL12JMJvHYwuLVKHNQrPMi/ueen/JWW039b3uXr3gydW27dIxhuDAbBgPA0lzARICS0SkoBSRFGtdn4VH6VJIjMZqmivY720z9i3+z36tW6E7Ly6F0ujoHOpp0jO9MCi8kOYz22V2Hy61Lc/36bu2cXv0W7hONGMYatyKs3KtnY3OvrDrhQEUj3bj+72N9Jc0rCJffAElStwlConjAY7MY3EybcYwUjKlNbulOfLLucXDDzd894tbvPWV/u9+S5+3SCVTRrXiJ+vkX5hdtppyFMRDD0nLc4nTymU6CneZjXz74HVFeh290madluLu1uNi5DWn3a63n3G8XRaNxy1Xxv86lMTGoXrdnpgglMhZPxQ59cihYhFgEFKObeAQG2Kv22j/a4aVRs7w0qcbWQsd04rlYIxt888tD/Hs3UMOX2wyP93T3sX9PomOI5v1YNiiucqPtkQz7InDXhYPMIsX/eRb+Gre/TMe7uB7bPJoSnVC7I7LDoIQF49M1Fu6y/7GzJEOWRsdfHvdd39q4w++Xnz7Y9osIdqc9DE+Mu5j7+/kcSpr106nrg5eWN4JiofpE3ZcwTaYWdX8754/g8cGgbfmHXr40c+Py9WLyTjjeD/p4TJq/iISA4GFkvDqE1ENxKLIwShyAkIL+88PLpCcCAugSJW/YUNxtd+RpQzXByeK6TWztIlTqzg0oRBNOGZcXh7gAh6ka61J2ifvLJyW5+2f2eSJuNK909TFtONBM6qWw90dt9byInK86Rd/laTGG3n/r7qv97/hNRz9tx578GcstfqLMuITiw3Zx1hNoLO92iVp5U6f99795pY3v7j19Y/y7j4Dg8CQJOnwaK362ePYP7i1Lz+2AddKd1vttSPcE5+KnsBiIp3O4jkkRmVap9IDcOYs63z41N17db35GCE4zuhyzkllpulYWnrIaiDC0cP90KnbdcTIjcr1sB65dSqIKAploTQmxkTKKb51ia3PNJ0RTjQZaXp+XF3CJDjCDHg+iKKCxpPLFTbs/m9A6S4WjW9y1bNc+ETL6sWL2npn3qPpbalMfmSxfhGFsOI0ub8oDF+0Vd/ycr7y6sGeG5rC9lZvfdPL+tm/7MFe/oOsq7Ks7Kmji1wKuXz19E/hnk7f9PQsQj1CiBRXx0s7771c6YX9bD8YXFAtVuFwvT/WEjgTc2IVhCZenNZhCe3vYyC6nW7EJHdUuqN3b7sIeqM9dxlv5w6XlffaMb6pEdgdXu9vxPELHPcwjCygONEERiESsSgiIn1lp1wmMF9AGuoX21741LQnLrggo9BzTylZDGRK6vjsCzlAcZEz22VL+9vnyyZwkHrDq6u521f30pSHuDK9wT/BbrtvNTZDe2z5qnz4WrkItVllSZ/9Pm/q6V/vbXzx13uRzx+mjVqx2bxHXXDjIZkQY0QgrEinFMrZRqfH0uUCHnX8BzpiPOhlLfmoWf9WWkGGsfA1pfRvJEYlzKwAlwIXwe7RsubRn8tUoMVkH1Tul9XzCjOkhZxyvJ9wRnOepePb4dgJxCLqJikEhdL6/fWS5kaIfh2jKAy9ob4ownDVeofR+hyD1j4qLVvPJn9iICUkAaBriULAWL0s2NqeLgvZ5oFlR2HEYBnSwWle+9p7L6447Lq7vayf/zHXGt+ILgbyg+J8ELqFkosoFjb4Ps+3eHidn/qFHvKzH73sFwcjrkXd6HE/fW8qe5yOp86sYSz9zZhw/VtZ7gLW3qACMyzuyR/eCo74QmjRRBZmJalE0YDAR6dR2MghRnKKCtOnXVB1nh834HaZujXyRIPLqed7m0V8/amWkTIjyTByVvsJbQIQToDhRBhNTERDyzwpIiF+5AZe4JTLGC0WCinQ+SomDzN3ruIEo7RkZxO86VaKcHT4zYjEjPJh+1KIPGjhziZs38QHhNKtc/z9XsPWH9A6jlfz/leUYtsUQ8qaUW7ADbxwgR5CyU3E+D93DAQm2/0sn3B9ipELLY4ehzz/07e2h1MNRkhJvNNW9pRz9Pf9zDRvY2IppGamlKzGYO1YDpsgWeLPwBCnqnS1wYO9c5e4ObzRopzstfvbafNd1yndSzd/2YgOcQI7BQIPJ7SIiEWjkoITLhC+Y+MQBjXPDcJ6FJRD3wGXyCIOkgvNBgbgq2mjITEwkKBs8fIMLT0AHGMpPvepp2NqFcXhJoIRFCMWEYQwLlgrOGVGX3o9u78PG8jjXp12qCRmJx42JtZIK1qRGLRwEHpq6iZGZHzLlU/mrz8z2Bzhj7a4fr/OE8ycPx4+eqybzYYtFxckbqOHP3QlJmTS7j3TXOlpMWZsjFIyZKjkzcBUaJQtdaFu176GyzawJ6062E/l+/JTatXpGkyEqgsLgaDY4SF/PaFElqRJIPJwIkJBc4WYFFQ9DCjgB1E4tHyi7FTWSZ8A5VjBkLKRUdEHjRF1NbC/1FCoh04PmqeW6qEVuLX04UwfBNSDuB0meZUdvfcGt3+P6cXF67gWFKZHCNkapWhoxWqJ98JlWt2mQ15PRrHc5LenUFstkrqM5Uebo8JtazmO7fbRYiVpFp9eX1NMQtk72ga0BQEM3DjGLXfB2I2FPNmGfBubz/v1brv71TYFrF6NE4ex0hRYT3d/zSbuyHQA5sxpmlMZJ5QoKiNGE1EUDUmWuhQZAgIlQyDOXRKGWB5avBjRG3pGwSa9EQ8llV9MAULmcBcq9bcqLdJkURZaerpcv0q2TcqJQCoC0uuGgfO0gGcds7tXNf0d7nv21gu693/SZbpNc3cooGT1jsJ4GaqXTfyiC8hVQnO5tVY2Vxx9j84Vt0vB1I2ARZgSMvdgrnFxU8mbfBIMzdWORNsSjASjCQTwlCmKnSaNv608fWXdG9jqBlJLnvC5Wm7ttvQ0RNszyJSxIQQ0TUdQ/c5HhqLRyHGwfyLC6BhnKBxyQGyjRAiEYKNqWEZniFFiQBJIOJImDPhdJAyNnBpwlZKbBA9GITwaPYbHHBK0lhSA3gHguNrHs7v83dvz3b96kmi5c21Vb7W/DfQmLCeEa2pBIif0ZXDv1Xu7/k8u8PzLHPgSi/M4y1u3pj29l4bu6F9t15w/nGDwqE0Tyvn7KeaH9FruqxLOj4hz23kw3y57N46DJc6WdFc/Kfl+FB++3PimCuNcWdxS6p+vz2se9OY1OFx1OB/EM15b5HD75/uXF2ljm+iXhzay68eFSlFttmBEGf/KLJOZ3iuBwb15SyThUeC5E27L8wnth8vCR7Fgr+hLO1fRYhSNFRKP0lBetMUnrcUh6dH6CG/E7t7o797JpRRKbwIwrHQg1A5wTha05G8tb++P/uYIX5rGduW3QX1ZqqtBlYIexeAPNC3Ggx+O4RMtMWaX8Yvj2MU+esAepbm7hJ3tQq+TjtLhRLlkD2Dcf7xfBSzbbiU+zFa1Ll4PXvYU7tKVSlyrrAZ2Wen5+xTn/QgfD8Xb5le1PY9wH/L2vrs3lN/mPh+eD/zxeWcci98b928nMvrfyMkmtim1jkI75ERIaCIZZUwoR8YYQpEJyiBYIZAECsQShohDsu207w3Z/U1rv9f0I7ROt82flu0vl5aNFldoQKfjwB4L2piXTnopzdHuGcN2+Qd7JfKlR/rN+AtC0PMAri4VPkUAdeDY5z1ZkMvg9k+V/q8yZM32/oZQIg4Ek63MQXJ6GBLu7u/NzVjgni6szOJjLZStuWzG3mbRpx4csp7ITFXmVgOLc2h73ydgeJcjIZgh9bzzfdULcvh9afrJ9VGAEl9n7ElX/YiufWTMN+l0XudVz749K3hf46kf0Afew+fiwek6oQSWq7/Zi31A5rFlp/vsMsyUyhgNw80WbFPGwlicbNTzBtJAVxtP8Aau9osCHTa90LZ9xjbdQdvUkqEIaXm0kwWhZmNZztRN5hB78r2OOnbeeTaj/9zLjP+LvX4+JOpIjUYigOoSAchGnPfuxT437hry8GRBXblG6Mrr1gqmSIkhQWpy6PrSOuf14v2jveJWp+b5t7Pk5Fo8PC64uC4bvFKwtwBxyjCxsQFfLBfL3UrbEw7XyrOeDsJVwmnfgjDF8RQXvmq+jNXml/Q6r8cm93vsaz/ua8wuK8ttK8ERZo4AS1icL6NNnMznQh7YS5EalCyUmcpCZUHKUGSCcFyOlgSMvlzp1/JYPyzU4hJfbRd+9tQyNiXYe6VxMAy+DYCQ2MjZwDdqcfuYDZ0FMrFNby/2xZOX8d4foh8IUXYD6F0aJIr5bNwaz3K1l4L0BWw7JJHIoEbW5X4D2uMW6VnEcDUtts14XPJD/1yn3lgZAYPb65p9KOFGUUhksLLbuHZ7vVe7+bFuyE2rsOVcv9t3rfPnZHiV+vO9f53Tr4fe+aDj03XRe3y4H8hHz6vfZBXL8Ck3y60W0AoIAqqkPS5jV1OEosenUaCiCJUXImFlGFoY5nnsKOH2J7/ubXuU328d98vFv4bLvohEUQqEDlwAbIQC3kZsKaj21exR6cs5IAZ+oes24/CtN3Lw4o391oFmpKJvKQkAbNdjbcGrv2q5fCB2IVxSgTW5P5GEkBPfcuzgNdUxv5nme5E8uvIxt3sQb+GjjK7HXnvRNdtcCzvlpPXH3afJfdpZsoXji/uh9em9mzVZNr4etL0eXnvGxqNO6X+fIvdVrvkIPuK1P/BuevLYgbmlFkFhek1bcTYEomaFBi99jw4PtknWgepZaVqjBmUzoZgR24hcHvWleILv2Y6fXu77T02t49ZF0b1QDIRynmTYfQMCYVfHej17o2Ccx3Xi0oi1hsUbL2f/D7n2tavGVSsJCPWYijjg+sU1H0sLD5KFwoS1euedpUKVFPsDZERopr1gDPcld5TTMSxw4wbddzdHdk7/9jVlij6G4Y3Mge8mKcc4djDdkKyvPvTu2Xg6X8sv7DF3n/2gruZVDt4rdtVSC/xKv+IkpMiI8KnL4AmtJQLspp91QDqCkMyBMkYmKkpSyqIRBaecn7fyf2PWten+/xJc8op1i/wtKCZEO9goiF5bAjZiuRpsFII+wUFQOJaWpVz1QF7J71yIleSxPywBALyp03kk4eF/QxK4YBIE5fa1s1oroVKCDyyjvoeFFDjXyOTMRU2GRHOj13OQYPCih81Z1Lo0WcvWRGyDBlaXdbrn9s794D/g5Ja7ck4uTzrW5g4dOnjoukdLPUdth1LK+n4Y3cDZFAFqmc6WbZMHMzVRG00/DWvUTdAIpbyGaMz3D9beyQzP+6+92HxdFmCRHABFoAUD5bpA2OXqGIHU0LY9iRi7mUDhAumA/NB2dHjV79mj/2pIHXOmiudE81OCljDiGj8se9ZowkRlOUW1rfJRWxVYvT33fc8q6v7AcbZ4GeFAhBiDssmYpHSUsqjSH6lRWkAuhzINO2v5TfFW5SnVfkpT1z66N9+BltOyoDykFzCmiEAEIgBQBtu3+su9R8c6ybdscOCJyTiKNHGoI21PpRhY7Hm4L+AvvYiVQ5c3hkGKnOdKYrhsl+1y1ZU0z5UMvwwe5Zs5iyekbc2rZc/6jZe//ycZARm8X2l6PyQteEtuMTz8b7xK5ydrf7MEk2Kt9iNvVgoL0suo5ygDm4MFLk7EFoUwhCBwAjVrUog4qoixjE+f6Xj6oBNVnLEqVo2FyeUhqqC0eRSVl/nSSxSASGAad4y+jJrTkN5ql5pDnN22LeIsBxxny2ypYu0Pi0tCZFGoX7jAkNIopd+pevWqjdUQJUEcQNTs6vrA4wJqTeaH5uWT1/zRpJdQVn2R6Sk6Fi2+4u882SdvCU46DhyT5EV5oHGVlG1lOZ10LpVSdBZBURsiTk6FQslwpF6IWOoJIG+by5O6giGZnCcYBlFvl2noS6WJi8SrURLikdia7A8sjIUponGCc3GzaFj4MHxebOvlnnW3LfpHheoUxoOkEccYIVAC2I9BrW6VEYMBb9ATRBmDoV6Sl4bOdssXsTH0AQzwlMkB+FWgNizYv3gj/5M02IXkAtm4FWkDF/TWou+naS31QsmMrWhkxxiGgqGkqBJAhESZkMZoZeKjFOHKuJyKE6yFBpUUWAMgQFIEgEzbeHuj7+QmH+0T1jFWwHJWL7jy5kq8uzrd+w7eUgZ+THhYskQiCKXmYL9nY1Srly07Qrfqlb0qokMs+mLd4SJXrmSAutjXm1xCr1c2N8sVf/Pq0e9YGxrVjz588AUM5VritX5fSAG9VLIGbC8CsWBSYFCEy0Q4HmREFLVghdGtBMdVhthA9GSqtBQ1jYjaU7kXrM6nPq3zvARGoXeCs4yVJ3q6y64ZfOtA7gXA+wZAc91Bx/PL1f4Q3aE+WzJqhOLWBWF5ZeytLV++obnBQ00/E99AsQTHzDU1AAVdxfGCchyv/X8Kw56oXKguHx/4ne4PQjZtYa3lPoOhrRMkKIJ1idr4mPC8aCxRJ8riNE4jHcbJ1KJSoqYzD7MoixCN1DWFsRLM3dfcqMayL4bZaKCFE7uUn9WP5ryvTt8dBevgclyOXYajVYyqXu9ivxwyCgqAAOUIEIjWRIi2gBAvYMZ1YX63a33Y+tyBCAp4XWZqAK4qhCpZ+NLhLby7tNkzZttgox32uI19568YoiE9n82lZ5f6DOwjHhZlUeyIlIl96gPBMhFJMcVESdMAlLmxf2geU5Se8Qx6aLRC9PZnY9TWxvIGfUqzJGBUBlvBk9zjG/Yvc87tzecPhlCEY//RlOUngTUCTLiWh0AMuYjo2Da6KAnHw7J0swAG2CQe/gaXOPlEBKQXDCK4hZiZGuoKJcWb+tdu9pObBG5YhmDbfHR1xZ9OGYPkQ8VRKagEwDLOnshsg7DCoYQIcyBUmwxGE7FYpD4FaGKlY0Q5jAwOp5FEIVEqECoWWSQT76H7VmwlUwfU1mrveAxOUeSqq+777Lfuyz7s8185Hzk6mnIsY0G/LgACYC2oBaHtuBJwwMOuYzXywhFJWOgAm4Glff10cb4T3xStQAEfVpiZwL7RKMr2T8TWRzBEGIbm1ZO3cPdhk7JMWy3S20O/veZWkqNikD93pISxiirO8bFRdILCNbtLg8/k4ARwEhFWrSUiP5bXR+stupHhYrq5vRS77lwY7/s8dXCqhWz2p6a00JHuNUxIZS5ZZ88JItoPL3vxd4bX/ZN2OYhLXCmg4GCGmUko58l3OSe3+RY0N8NVq+0q7bNLbV90jjbA1eg1dPGaItQ6GTmUdJee71IZom9lj8Q38UIorKx2fgmhoMc21iIhMC5un3+R3vZRlglEZaA50lUOTH3Yuz+9xzd/z3Q7I5S97OJ0q1GyRLxaIMsugi+I/WIT1qZ0e/BtNSLLRSeLF2/TN0bHmldMxmXEFaEM5TKnragLwRLr33jYm7HTxmmrehEsBGaiIUosrjGqun/NLPVEekosF5l4paoQL/zr8pFBXvRxg1q05J4+6qjhsFUHlviYvq/NsCHj5C6eB/zFH+f22zvBuQxDMJRnK0MYo0t9FmnoiECDT4Nh0ZjoA22X+hc/0TB0z2L7wRRbA1fRkAXmxbHPNKTMfDIuNJf55UMitatWp8e+9+w+Tj3LlSfwgaBMjbswyjyjqjz8WQqP8DKpCLys6C6uFn2aiihQk0Jjmah4rxcpT5GsSZWl9yXT11Vbl8j+6sDq3T6wEl7PkFYUeUmP+GwSFKMmJNTKyFfCaqkpY3HOw/LFaQqlbQOGSgE507wM0A88Lr+1qX3oaCw9eRM3tsnTbQeeiio/Dax7VlpAibRgzEBZllQ1aZRRXpH+SIlLFUgv96K4j5roFTX36AQP2+zdpd6qA4Y6W22Qv9iHvfyjlU/eOd554FAm3ZxlWRHxHPU5tmVcvYfe9z5MQHfIbWLsa6ec0tzKLqcEBZRtWrqccbGuU8Kd1qcF5amps6vL9khvvXHZ3RLPjXPA8YfejRIZTHRY7k75nLkXLhryrYVbFdsvLwVVdO8idb8U8VWWsstXZ5REUU6Q4r+xtRW43JO7G9+0tL1Pnbca9ZPZ+Qzl4jvxC1HviSw58XqJGsCnuJTDmn/ZCIzTsoN2iRMTBChJSQrd26woM75YDA3rMaOaOLZY9+xNXi+kkMucLYXiRFjKtiQsVJQk/rUiZ68pWoTWW3mroC90B5o8KXT358mq3qyQvlTZS6cD4fVWH2jB0LhQ5m6+H/LJnyx/bAcJ9+YFgThupPBRr4svrh5f816JNEqkfJvtL+XOxCdd2464aZrCCKIjp5sVoKdi6xp+1Il+ePxwePRfv3PpSx9tX78qRERoL4Ho6xSNUC/pgOln8OKSE9so6E5NSMGoEKK8SYWQtfXaarGXFCistotPkAuISrsrD7P2LhW8V0mXpQgCSiiAyNSAzYtEDRpVRPFgl8XbXq2EvcR3MboQmeCyxeOrllkTlCJ0ullxMBC33baWfiHd1cPeWWSN+3zyDSF3NBdwOSZ8qKiKuYIY6E7AhNwDPoa5a0AaH6OKHBX5kZLzu3q99KpISiRrL5yoJtLK/ljmx5q/3of85I+XP2ZhVCdAfJNygslCUd5flLrnPRJK7yI9tgqN8/m42+OPerOtGORItFkZcCaIbLe9qWjX5FuP+8rVZs8t91y9yscgKJbrjvoSjxUVTkhncguUdXcJZ2rluN0DgT1cPkLKPWIsk0I+ho1r2p6n9IhBRPEI+wd5/xBHn1MPbjyy4fxZEXVUKWWSgGYxGR5+hQKWmOy+D1V36feI2nUimhQw43g53GkihEiukgQYIeYU92tPJSWgjmTTjZZKN2/27iZMHuzjEvdXwLJCyHBnp9Ci8+Ur6fnH/KoP5EyW0MvuGTs9RwkN14fd3u9GaBlAf8n49MxjRUF3ULeW5/a81V///QOe/1nhije4ZKEtMyFMtgfvzfuXTK+PkWTeF2+4vlp3Ebq3MKQYNuxYDYkq9EIA6W9OgvQxtCTLmCkPV0/PHuVXmHlxecAKuapRTusxrIlHLIPuniL5eYZXekC8+OXxI4J3pDDx5yhHxFKiyfaYLosj7zkhJbWIusVSu/2fV/PQ6T7q1hU9LjuqQcjZGDucTgt/HuV5GaxNCPfaxdnTSqKzyNZFcfolh2LRWhV/wufSsS4wJ44ePtSKZUYrr+/9V1/Vw3zqSdK+InQiagFIDNYr5gLSEdfuJMMqLQmRgg8ZFVA+QfS8W08qFNSryKGkSkaRY0V5pPmb10tM/FV3tyf78Bd/zKftdk8I9BWmaZok2YO9SZU/PrTfebAUzpSSmr/yKYTa6AQ2yiAgrUXRHFrdAH3Nicvuj5OH2G3/jStdxRYnt/udnjpHF4QXh63aEIb9TaLisNlT3rOQUW+o+RRJvkl7m/tNJrp3gtp7/gKNX4qUUYRIbbJMUJdc3pzl9p22f7ifkx787sHP/3D5VV01Sz3fjMajgZ9c+Fa1R91Nml3G9d19l+6jVrAyAasZ66GhjYWYNt7qAkoyJ4kV527N7U1dfRCQB/vqW+AngxdgRboNRYMWknsWeEmVaPSJZpUhUCXV38puo0zuViDD5sz0siXcQCZGTSTS+ned9hmv7zZ98N8/cG9o6ZrzXepwdooylI6jzDAbx6h8cLV8gLe3OrxLRlbaWK3NLvUNQt1e4hhWIDvOLJBQD3MSUCIj9j66ufrNZ1ts2/1Mt0xlH5f0YR11qR3jdBtShcSUQUWlMbGJl1XBexXRFh8lwnuxP9aEjLJxSTzg6yXSqk9Ibf1iwIOM2C66/2/+C//tgZ/8ebnHQihCiaJMEo3OSznKjNS3KF+4fzRJQvMrsOz6tnCBH0qDmiPclm4+KfX0suO5XSNMSUA9pMvV9oo0ecjvNkU/qtXtlW697oYvkiKueCFJSlVGNREnyxNZSMGFcI0oHMdIFXF1qUSgEKlGFFKgKGw+2Lw7//qNN+NJByY4NzvWu77w+FhUebFkIyiPpay7Ecljn9LcxYuQokRTB6ZGGFGEdD9TklDX1bfefHe5zydaodgYhDA24BCB4Xgf94r7fv+5fN+9UiQXJNlrsImOdyOi5mm7T4m0UXcgahqJVrP01zJqj+eTZoaCeHUTlDAmLKu82/t9D9/mzWIaoeIIuG9RMp+1c7+fIjU1cb55/SKtvlETVq8lj7xcxvVLhDN+im9INMamDCBUBPZ4UyKkwwlU8TB/tqnV6X1SsBHZlow56+5ceUVqbxn91l5GJYKcvceOvHTpxWWyKquKXqZEdiuVisTKa5NqgQ2hYq0SJGY7Srvsb8/93/rEuu6XCRWpOSodNQk1l9sUQl/6tACTJdRgPZAedX4J683uEYu5lufW7xI1i7WM2rgEmWbUXCi0tT4DQmTnS6/u+1zLldtPYz2RONWVQA0dj/sE8U3vP4sj1SAk9rD7HOn74zDdpEkfy11u1C7ul89T6hvkXtQ+KhciTIWnjRAYXGf7vC53sGZwOz44UxORVDqC7RNtAr2bDLZui92J1F0OYrHaxhoIBkkLNdcSxCjXFg/WMI7TBZRqRoWslPeaCh7iW6bgJPMAebgTBgGOoe2SJdORdFx9WQChDaKIuYxgYinRD4Q3JICsCCdEGTVRraSrVGGKzSAcvV5a/uTS+58+J+/vm1mX0LeDcuD6uNlXSo8+zxJZ0uXeBHyiRHrgZKkXuQi2HYwJgQprG4YHIM6MCrmv0YJtdf50qXOWDQF2kD5UnNCLHC8cIn0KkTs3Lr0NKmSJuo0SWlj33QCZpk8gW32S8u/KqSQtctS2THy0+RRRCBVF1FVSzz70nfe85nIyLIwPNk2yts85RNidUWWVE9Jkl48lhXWq22O9CVLUPPtsTgmmToESRJkRdy044QH+NIlJu4CiPV1Qt10b3eooAmKpgmWv3CP6l5LZmd8iovleZYu31YtLGR+NNMmNbhnLZyTyUMdZraFA0Sdy1XW7nr0+993/thSd7TcucWGtXc5IYaI6o75rvHd3KQ3e0kRyXBF1qQLXqqxb7mw9HO6YrBNgfJtkPoScx4z4bc9+dC8Xh+5yGwfZpMaGWsVZhx5G33OXu2ePrb5Fz3gPxqKwqsBYdnF/XOIbi6PiGuIl3VOWz8XqcgvGsilRCwHY/PBhpMRzWsw3L3WE+8C9XkiQ15LFXK2YQKp2qubHFwh1yS9fdxFMIwjW3Xq5IbFJGJ5djwIgy3wM5+YlV/julsCd4EK5gSw3BG4BYh3tQLecvW8qwShqDpcJ1Q+MRYyarHcTwQ0oHLx+KSkX7bEslCzdvKsMFWLSRERAC+t58Inu2ZOyn4SdO8fFlh65SKHvTaPSR213QpHgTKemQdR4oVxC1/KH7zIpCovwAN3HdBQySMkZPmlyutyFSeMDEm63ve0YOkMhhrVGxPaz7lJ7RE4witqtfFiFb0ZMOLVLEbx2Omq/1MujPTSrWh5MLq1PacZbsLnF29WMPe3yuf9tl8/bNXaoq7iUs085H7MA0IlaWsVO7WMN+BSJujiClF9GbYu7zugZi5cmxX4hXIVj9zUdDtbIQu7tW3dtHrqERFnqedg7NlZFB++BSifU1CUzXL2i3IQ0ygMmwst3SeeeRLWkZ1qMKhHqIhqXbGzrspYrGgqNhf5rH/pqTmqfXH43XNxLYQ3g0vd9qEDhj1lQYspgFT1F+otEpdw9elQLDH1kblFTslgBj2PHm02CPSXRfGtqfL09wCevCvKK2ETc7ozlallQsO5Y0V61e8mXlEc8AmRQeQTiRS1E2+WpLpDfeiDjCh8lnpIeXKqMJRLbzqjbx7dV1Y0abrGKM/ueczfLZ6ttn0IKUrOQHs0xJfQ9KoKkqL1qCqMKF2riMR3xsnLZca+35vtGCBVDYhR1jo4zmyJ8H9fDZT7z3lbhpEt5+8Ou69q2jUN25DI7uo/Kb0LPcjQ6LyI9pdKKipKHFFXeJZElq0l1+X0VeLC0TDOzsWaDYSju2oXCTh5ZrZ7uSdPDtY3hDzSjDx0KetMb9ipKeoaQQU1w8U8m1WRUJNBr90kiKN+gcRhHciTcZBTSTzoDEnF7oK9cZauT0LJmCL0hrOHialRG9W8BEV2jZC/xmoZ16aL15rR3uVPsmUjWLgc9I+fLg9XePfcqiyYnU2V7HsJqa4hx1HrIgov0dlyNzz7va237oIEeG55RGkXgEUtt4bkH+a34pWbD0AvOGzM0giljoQ4BQk3GgJamV98MbHPhYrui5IMwsRs+Rb2OXohudHpvNeS+RyHca4nIEJi9u/GlzdGJHTcvohCdthw1Ma7Cv26/s+gu/T33+fYfIT6r8vxt4JCSlrT27R5ylGQL8Vzf6FHxqIjtK2Wzh4ku2B5/fneGVUxMqTR5dpFApPDXL7pfhHD8DRsIm0RIts3HgyuhzuaSoMMA5Cgal34yJDeJKQJpjBhb5/jOUFAdCINiv/efR3HeYe9SSREBCVXxmA73xQIfJP7ATlnQUaPM8+JMpPEuW3n48jiamlcP6pX48fA38qRAKUbm+NVPVGTjYqWYAaL1E/ZETTDO1Kpk2a2mXPRu64DvSxVyv6zta7fHCupe/fQVOHNg2LDogMQMMxUNj0cSHdFTd+M+wtXw9te4n/zN36+P/XNIfnGJCunT1OzO5VZW+fygeGjPVZ+hoPwrl2XxylKqNKBtSzpIOuUyQTD4rFLIQcebOxYxBqpFrV9SvC9JYJKBvao5qrxUHJs3bO9nYfS538wXKx1Q9L9Wzx5yZ7IIpNZm78I2tQwbHVa1Xt7IaJIxdU3QEAEoxlQENPc93Pn8NKkr/7Q9mF7iMYjwd/e6WPH2dXHGegvpmfv7/en340JG9ZAiXuNbmkRr+7unRPcp0gjx14lLYrKUzeIif4FUHYWHNcRhSFwUDjaoiL+mVNAoBpTgeN5VHif6oKzNOXsdzsrgRn3zMqunms0neD+2/FD4pf8xv8lv0rBslyMBKSpahgKKmwOSbSaqjEuoKyZR4D6fusqMH9afTlIiUq5OQS0v3bpGVEpUBk2hMsa9kogsawuggIdX9F+81BIsu3GR9HCUatKxwWT1ncLcLMxGiqcneWse3oEEGqmxgofgReRRkRO7m271BlcmKBoNkZYW4KaNhHHMEc+0pAk6XmTX601loRUWSzDYTDh6oSC2OFV2wFSUbbpG8eJSExmDiCjSRk2ggdrjUe0xsKBbFFW+2WN8QAYJVsJSFL+0siLopNUeOIJzUIEZNg+4bW0uXrjvLpLh8WfiQEKNrThexssIva8UiMD2ed9adRjF1N7V5LFySgA5kVaSTMrJmSwOWtbQEBdJicTWYrFhnW0mAvTBy567Wka4/eEl8/CICp6zahQy0SsEF/EKXoqvlVJZj/UcJUXMZHV3pJKMLKuUChjlPU5ajaA3xNKt1uvebn/YBxuxgUxRAlB0OIHUZetVHlUOu7opQL96olb6vi/BJWSi3r3wkhjFIZnZozx6m7qUQhclgBRmEDFIw6mG3JNmIopULjUFlAI7npV8fHDGmaYGFkWEJUqi1tc+tSqsOyKRuzwYvd/5VjUs8WLaAk/BY6xAkuZETlS1t89ltVBWEQjJtpbdqOJ7HAiaWkYSh+oCUR0N5zf4Bitlzv2GBdfI+X4DsId6Awb6hCcF7yWWJo0P7V/5oPt36IVezSmwxU1mnjMQCCfBRAT6PG/6qWXzCMkF2H773ymLANHoAb4kUTR5T6CQnil3R3/xjCnNi7oDyShv/T0hOBet8X6vTfpw9z4ezCRvemC3snDKtlOmzvQBIGXthAR3TqmWwrrMcZbB+oCLt5Zz+UssWrEl0T/AMsr1B/JdWP3xEomEOOi7AiEZKrDpbtxRusJNRELDg+3OR5IwtDGUL9Mwlj1uMRpSJkHa7/EoqW9FzfIMC9yXKAmQkjsyNu+mXi36t+7J0vYKr723slyR68ADvSU7NZ29ujbaj1rUYfE5DAizBE2w6GJDXspLWWEpMDa8ThuVUjlmBYjnFMkfaiaFiEvaYYMOuxoRSjcXvchQTJrh/HhOT4LnEPNI16T/Qi66Yx8fcPuN3EtdPeOjV908uke/q3t1p1pkK6qS18qLtBrrS1b0CZyoKXtKeVREFkaRlNcoEUwwSfr0o5XPpvc19+1vlgVmCMpwJ03w+1rUCPF6LQVvfYHtF1o7l0GZ0qi3Ml0GK7DuvBdkO8uRrl/HgNFWf/s3G4IVWAxOwDQUHKMKpfwSd5he8bDcNhi9EqmMcKq06hI6WQRFJIzSsyyULMQqNSGjPOJdbRN/NSDGzZ1w7m9eULSx4sEivrCB08/jaCcHb7HucVtnVmNHtq+jmd5MDjTCyspQ8itSuLQBpACzUUjZcl8uvtRCbTENr8Urgzj2lPyGdj3wHelicJs6DjoBFzF8DzYNLuuK2vRNTJerd09VpFp5elXqq9dWmVmMMzZ5rshNq+ZSnn0vcM2qcWWGuHugMYqsoAWZNleT7r54PXSI/UcRlK/S0rilb+Aa+6t0vNXsjVpwJ+vgMQqpkYI+ZQ70MWMOxvNcUHrb28fo2dJE3FCXcLU8kPIXqSL6tSqFcdnaRiV2SpZxPGaahoQGeNPGJZmEC9z61IuKAS/PSd4kRjnOpYvkxoM8NHKR+1ehd5cKq4CNW9GXxiKm0WCsrCljubNQWIxqZILYF57S3I5xtofe8cYhKbP8KsQU3suLVDWCl4JvnN/LS2BOedun3BtF7uHtl1FW26DASmwoJ/dytrE8kES5bHvVvLYmRdOmBIZlgmkQ0jPYZGIfEHVQmFMVpSJVA+Uv5u48Fssz9wpap//Gq+pLPFiOq6iQBoRKaAZ2tn4vvDTwlCo8dRFiE+vR3HdP6dVW/QovegPPD+dMFDN9WchhpOH7zZ7ZwXLp+z5rSaKnixVO8j4qUi5Jj+P5uxJJYK9E1L1R7ltjblucDAppbru/aQAIO2HmhnFpaNVGL7bozuOoccW+eUjO3qmXX7YLJeQ9/D7hn+/vX4M6pU/pXkLVEhsF1XWy3CgKL3o1mxWeQknum7scrfRc9kK6f7Ctv/Qoc/98rjsJX2ZYMtoxc59zbyrFSmGe3UZNRLr174Qtb3tiTqs9l1tectuxPO5df1QQ3EXTbedzEeRi4V4jTKIBbzKTrWL+y5uOJsHtbiMEFveMYbkv5XWPOqD6O40eTSfrvZaqrArNt8w3K+otoU/jS+h9l9QPiVx4aMt5CcWmIAgqCE5kNPggAeucPVDkhe5SpyQJVsa9LcohjKJVCCgMMw/wo1d/WTIWEl5Rk/Uob/OU/INFxqB90/AjdKVHrx3ltV30hKXXYlBCI01C1zX4Q1FKTIqFE+AFYJXwCKj7KwWjHqltIg4ZNUEJoeL1OApHMIySojbydTa6CY6509PKqL2kfpBfOFXNxFNGSr6xOJbUl92eHT2+v6608Ua64xXG3TVqJamI2WSdDZit9YAUu17EMfEJxuXTJEvt8Zvc37cpMi6pDltlRvP6l+e4TRtuM54OTmh5X2wSDe8neNP3eWGS6SLKVTudh+OifqneolKDKqs8rD20WkbRiNciqmTxvySqJJTwLA89eMrDItLfI+RIjCSx8umEhoqJhof72/mEWuDN3n0vqUvjFPX8CoqVWqnIsd6FTfTwRVsLZ+A8el6TgFGyRf61yoyUxucjRXIUfQILR49zuePHv8OzcnpD08NUfephDhKu+Ddtn/sNGmFDAozSk1B7/BR9j46/1hvigwvxcYv+8mf2S1ks8Bryug8q4pPXLhO6R3oI+dZdUjwl0qRHmeNF40JiI5VJBJlcfOmSn7u51g28xf69xhGsRb5NDHTUHBUHVYqQrM1wEqWCJAXwRg+GB0ylZHg5mCCPXfDIDXEwiGqRF/r5sGx5rnGVTFGK+eO95iDYBX/ZrgHHis8m1IWWjNZxUPHfEfmpnAfKR+8rrkcVuI+qo+fH33gUUC0kdDIft/LsafkHQ+03E19+49J7ZC/6DqbtraKcLj2VmRfwZt8pCxq7Y6YBwTRwKiWYAEbqwSXqAyn0OfZADFwy+plf56nrwdBEAMmOhRUMHT+CaNnydKETVw1nAALh6mcOAk6nZ981AuAfbi598Y5I17H8+vY7GwVhVVNCJyhKypcvAYzymlTOKvll4lW4vLXaJPdB+dvauyfWMlb3BFG1yoIhpTG1mBzi4aPLnzXeS3Ep9XZs+dIGOgSqlEpasV4KLka3pmMst6F46/KWZQCZWcocYaOW3IvyqG1RSG0Y+w2cphTLds9LTTeGmYPEg/xrH2gfMcq7NxFpEz5Wi/jKqP7SWOYUz2NKlU/EqI8Vmr78/Rq3QVX26i3CXaWa5GP3p+fQ6NInpH64hESUy4JRRelB0Fr4TAq2K7dLfrwZJvVcC03lGgPTGV0O4LQBKlJJfaWgjvqNvvcm54zgj4+ZIusfHqOT72mXnSjqC10FFjOjbBf7hJACiZQYRTTNFP4kyE1SuKTniJIYZREafeKi1w9TTLtWUSJHTkFdSt96UVOVU571IaavSVxGrVY7KsZEShcEG5d9d//gfvDKVUGUq/3UI4khhqEQ2v1uy6YXAgtNLCoeNuOJKDWSa21XsTRiNsyVVNhp03vLvsdu7+VYHohoy6AXxoFrUJhHIViNohAIkNIZTzudHdQTKAbL9lluCgJHe74R9FzHL7jTwK/hmF9pzQaRy4PJUnID+ZLxy/0e7zSTrzmuXFjkxU0Kf48OPOz+5oOybbebLLkk6OCgRGAkGLFckrwyYPEyLnsSmO/kWz3QNeRtd8hESE00QEbWu8fKvvGVwhthG4+JRiCv9pA/edDmDNj5cwMpxA7carDMVXwY3KGwXV8MCJBQuikImOxy41SC9747E4H/r01iYbwi7TUQEkZtDCV3ZzSvTVI+wETZY9niVj88nl2k3ruTYvlDn7oW4WCFh57no33yhjgL96EIaS7tFC3Jgf6R5GqYEGNUGdGuJRd1ny1q4k8UISSDkhx8tbEtcgM2ck/KtufavQNVh6AQL1KXS15pATMiFXlOMgMB8+7KngaUqLm/XF90ahph1bx7ezBB04vD8LTPqHn/YuAao5aInEaGWggp3xJeYrl5to/vEvo13fnXcjWi73goCVeV4q+IBYmVAMP8ZTukS+pNarQ2XhtY6ZRoQ/a1VClsewC5D+Be3sKz16AePVM+qmu5Lq7xnBGCovqVIbHjiZKYBAiEZ4EZVKIrVzSWBa0hhVD/yRkWk8USQsdyQWqxUV+jrJx3/K27u72VWU58N8ru5qQJ9SHI54m3RMzyh5zaBy7CIl5v5HhR4HkKC65QA/4B0uSA1YOTGlgPHW0xSqP3fW/7DS4bG8LKyLyxcUMlRTKXJB9id7vPrkYYWLdbC25F2Vqn0bQTi7V8n24GAjIcXrnS2tSw3TtR4tfsuypWpn1QZUTVNifyjofTpB64V6HlDqIVowqpewbNc0Ib4rkUfREMr1x2LXQ9JoWySJaEWLzAsvbVUnPUhQLlWMM6nZCAAgunfak0fHCAspGKNP7iuzkHi9H+kFvNr9pl262PC2INhbUE2ercQgMkkmEGlYhwpPUAX6saOuQFFYmGtp8uFp8+j5pWsgyUiTYZvcn4ZWn7UP3lblLYuCYQhq0ud9gfqxCf33NJBN8vuYvhV6VLHcs4xBXrGWxdTC1eCS5ql8PK0RMVqTjOKtaAgQQR0VpUgvHl4CJybqwgDVCfmjRue6SLRjARhdVqLwJbOeCI8jZngkMMI8YMBC1UmeVTr/7fY0aPq/d9rB+XoVl36C+jBvHQgtCotGXJKlk+eggfKL8NklC/JFBp8XECoYlwLJFYt/Z9CNbrFvoeOnUqVvvYGiu4Xe12RXKZYK+PMYRdCWKrsYiLlHsGcIxPsPV6AF6//x1Ev6WN5bPcJaIwRHTRdm9y+PH/vBkzASLRJ8IMavXXh9YsvedclTKbcY/OZeGtT3Shn5ZRzXs03yk+8GATlIY/jnqd1uXNf2uDXv099rR+X3a514QGU8pdv8v2Bq/Uh5a7V6+PYVBbIRh2X+1zaBkjyHbyJOccAqg5JEelVFKQgnNGFQ94sN2CZ3ub9Yd6lqP3dJt/sO//YVItB5Pf+PrVBBzDauQFQ57rHVMkSNxWGCIqRrgJXKb+v+wY2XrSIyw1zGMpUySxUb3ZEhPxfldjlFqpL7KUvWvFBzKpEMLTfskwibRlgvX3boIfnvvRBuVCZMtBH/1whfSQiKpzKqGtahvZCVovT/J2LCErFdqxvem5lspaB/QZ3oE3bK3M/9Uj4J1R3kvPv6ffXz5f+Dg6KXKx58OqvQGFeMuG6rh4BWMRsEI/DKwg0EkTELD5JJ89oXpPX+bwfvTB9hn0UmMhvUUXKUSX/cJHe6ibyLgRwUCTp6CiTC63tNCLXHhZy6THxDD9PadAyHc1ObknhFarOE5VAMIDa2siTrQOhCi+qvf0f+ASBW9Db2slJ1MRCCKFtXnYYJhKKR/aE2165+d4IuVt9cs/4N8PVvGRx5T99/G8y1+4juONenV0BGIQLPIpDniMtasB7DUBBNCK+x9B+gQsQwgtgmx/+emHGptVQhVBr+W9/876s0ZREV4TEfj+Pt5ki2OlP9zqvZ49P2pIm8LjRQXV/V2lbMlaTYaTQiQcLA1t4T3q+YuTOGiGjGYqxXCs2aQMQw6GOo0idXP8lL66RFtKPgfb+eeePXhRnc9vJb2eB4TFQEO0e6uWF44W2dq5zWllbbxvaIYA2mpzlmJwuLOgLV9d+p5bMqF/044foL3vvCZDFSJaew3j2yi3+mWidrGSfScfSXl//1jfyy1gk59MbVemgvgmZRJvayYU44OJdjugK/hPk+ShfzoAvVlpjAlDjyKEqhCzJImbmss4fNrAcLObc+5KrtS/au9Q9cG8DAmJ5RjfmqhhRRDluwjEXDllBbP7SZp0j66NpgCgbCBzFHovZ5w5ILizjO1vPo6S1tffTZ08J64QiftSUeWfvT5OdJozSl+bqlY950PLjPD2L+wgoW1Cd5W96yoQQH17fYqwdRdbC57SI79Z28764Re3JyJRV8o0lCAgS03I3HTBjI9vKTulgbLirj0RKDQrfey6j6JYlOi164j2hvAUmm0u7nLWaGq5Y1gAKkyBkny3qyvtQL8QBBPCdqw/gHlOnS3teR/LdUp/+42MKriUU66xwNtYOahFHe+dXHvkxBTdtp3+N3VD92zIfv62njmItE+ZcAZDl8TbRvOhHew8+/mPIUSIGhCta81QhoFWIYZxs+kPYqo1jMm3rF8tx4RaitUoBHufikWtzLaGrLpz9jIGm1e2+QII1hGGRcsSxpi/TEGhvmAOrbH2VhiGdVVh7RKBI/hpHeoeMTJRRfFZNGr5GKUVJiWRL9Ijq+4i4xqV3mNyeVkyrn5GzyYif25jaQu9UZmk2JrxWlfZSCEgxYYvv/q31x7OIhAAkcZ5BlU6NfX9oQjDRIHrlAoXsdh8dGBkEMf2cO2JkU73BxtNKgfrHlKM4pFj6BAaYckGmcOT0MJ06OwHbRGr0zIfNgXG2h7vmm62z+FJySIRksKUjvRkarnRLbk8Hx/yK6uLSnXGoklQESkmNcwSDpIvdHLC3Bf5m4cPpYsyhUsXuuEXlCFyEkrZ3DZ7pMM7xUPjvvevNe8zDlzQcpZz53WMlCHMiAptc01IOZxTSblDNBYsrzPkzVU3C8FVwR/aaBM1mZTvXx1FDFEQGxUTTeQAe/hMSRRC2/NYRB2rAZSaAoADmfEoW7X3YwEToLl0YKKN5PybdTtAGzWqDw6eBZ8jvCIWmLBxK9ufL1I8+/LH1pqA5YvBn323/7mHwL5yZhh9rE9iFnJXS2o5OPkKKqrLnPPVWFrQhbhXAxZQz+imh4wBxUIseA2PVpXOgqtUasp5rBxSt+EvADvKa5oacdhiuWcHN9iWZemIA/2UMZxeY2nY53GBDCM4iOYIUI01+8CKLIqV6totZ4RZhNw3bfZgfZHuaYPV5tG6Vd9Esmws6tKdblMm/G7v+zcJBLXtXN8Uu24ooiqaiRBp6XmbELnHtfe5eO3j6emfvE4QfnNdYHXMCY5yVMXzInn/w+E+SwQHWqzOlprwCUu4Yxuq3Ne/UdS4uj00fas767jEcxu0/WVbaBuDCIewkkvTvAcCBoXZYBKUlGLHohTzRGhLx/rWcV33bDxAVn+t/cGUOyVbZUU/eCyNyBDuSaFukqv0BA7yfrqGnsEfbh+2r4UoGKowDI2qT9bqMYCTu0x4D/mzL+IFLbCEbWrkIG0bHUVYYS79S35eTTKRa+c97B6pNS4Q1xDWM/RbBZn7sNUQhkcaxFxsizyc4Pj3dUEf3XvAZtVDJsGoXRToXg2zKVKK/zcu89531p0J4ziol6+bVGMo7lYWiBRGfaul4HWB5c9yuOwIyfMiQsqLInq6hF78KiiqEHVIEdnkABHBJf1tBaQ459MXci6OApAXDQ83q5zhpsuvCnQp0+SaHeoUCOHY1EJvjCg5IUYGmQS9kERicYZO9z7rhZQFvjghd9yYocxuBQ4XZlDZO0xCYf1PyaH3tvBxa5rbXXdsOKT/xSe+ttE6ZLWhnpcaRfexqjLknt8kQR42r8o2MYUI9/R8OaTyMIglNJaf5yblZzMSsY4iFGDQ1FsW+Evi0JvDkTHUnRFAp6JtodzysNMlXDsu4XV9rdg8cj7BsXB8C3rUCRlUUQ+d1T0jJ9zne7KReqzWJBZgARcqJhyriMdo+0Isrm4BsN8kCEexVrj5xvutAHbglG3vbkBifZa15f6YMGoiL72WEnIXr30sd5Ea3DeW+GCR4u/DPDjeI2X/XN/he5j86sTDbQoRJ4wQMYrl7LD2wk23/6exvJyqDmNcko5woKNNHFUO5oG3XfP2moOv39VaDC+3IMUhGMpjIY16QElaY5t0rz0Gl1ON2u47hjfvX/5FeYLAgbV3WrQQ/JrRJG9FqTo8oBVDL4AGIudGVsCxZ1HLyfsvc0VV2lsFRYWUv6V/jaelnvNZGauGS2TvTGQIulyfvauGSiQiZsYYDC4KYm/W5rwfdJdwJMvafrvd6VD1fT/g9Xv92/3HO0l1m+9JIY/TogkSMWeU4Uw1WnVVF6oj/VJ4hTUJCIb3T2vQYkiohiUCMkRgmR54K7NARhe6c+soSCFS/uU+RSdrasvHAznvzK721ejio+420bfRypEME2qTwg99NhZvLBF/8wPHtMlZ+bML6DZNv5oamg6gYruvXbFJx61Nm3MH8NLrw1Q3hEs49pKKfeBX7Xu/32c+4gy6mH+JQ4ln1+h1FJG7CCaMJgOZVLtU/R8jTeLr/tfWoaHBNZoUKUbWo5gmGq4UQpNF7wOBOm4ahN59SvehdUNUs+ZuFCtTGLPZX34tr0evZzet90qj1KO2RpzF/esiFp7pz3DL5WjZtXl0P4ueg1BcGjHlolq0OMrdutEz/8slO9Gem5fpuFBatbl52Je7/jVB6Zh3+wdfxf7J+7oqgejvBjmajRsGs0yKujzZMqos+dA+TdArPY68PviyiVlSr97K43K1ORqKJySE4g0JOWgaADat7jwaDuweEr282EvLXRIZLhuOwn1+zCahBfomUsSgj4iE7lJLjJqwdRfk7seyx83rkUWdhxvG41mQRHhgIuWysXC93ApRj6zChnjqD7rM4UA9TzV86nPGe8551cn+93mdP/3tA/nL5vyrGm9syiNo5C6KaB1RSCg26n2iuhcxpS6SE0MUpsBSmJjaDnnYdc0e7V3sk5AoTR0I/o5Ng8FblD601jqau1iWP4z7EgagWqNMCroDRYj/zkqDLj123MaVXlIPPu48p+folswoz991ac9bHngdSSQSgzJJfXS9jVRd8vc+a/Os183bedde3lub4rbhtCH4UETd+gBHq2fvSCpqq8vSaAef++RvATK/9EIkp+IaiiRGEf09v05EuUHd8w4SlKAqAROjlHgxJOLFgpvReBlTduTN/9fv7fX/FCLkAxhhFgyuVXpwk3lYwhen751tI+Qitcvdqa3iXSv3W1QftjK2WISyr+65DtPl3dMiL5IJ9yDjEEle9hSTTGdyOENdJRGii+3ivtt3rPuKba58Em1UEmxHdiDfsRtJKS5Xit4Oe+3S1sss7Tk59t780TE8TQIoI8KYIgAwMqiOLF/2iCaXcJ/wt5K6O1ZeJShPocameevi6dN7A//oB1f9T+x307Y2RpoFgH3dk6oER/YArJ8urS201j6pQhJqKqMW4O54r31BiyqWm7qX2i2pdCU5On5Qz04kyBElxzGNHkmnX9GYSi7VCfFe7b3OFw8Mtro5m1G7gA1uO8oDGyQsXU53h7wZdGKlUTLkwdU/iQN4fD8kSN0AYlQUYQZEl9c2eTG4LTLaqLgHVoeO6V8+SiyESp5SWGLu78uiV+Wr41NPfbcmgT8IXIhm6PDDutJ2kH3P9mlTfFwen5fIb+L1N6RPSKFBZgTPNsofkyTe1CU9DFxyottRzkcTCVTUZMgUMeg5Jk6jj+XMZc5+jurbKq0GUyAUzhvDIDlIac81ZDpsfa5aKRVXd3UrZyqKSNuDHnX8REkf0GRWtWNngF0Wm3S3WDAse6PSW68EhnUNQCFc+AH+grIVjSoE8INZAAiqCd1N6KGMao3O5d1h1ijLgrJQBOn1WXUOvrgVQY/yOvaCeGhERI+j8tn358hH61FR5ItSdZz356e4mcri3srrvp3q6rRjqb5XFpMgVqG3x6FH3+necnk7phSW9lZ6LlyQoJgwk4cAzofGA4KCS4qI46nKpSrbqDvuPZIA9jrlMArBylolD3JVardWgr82CyAl8T7mr5auwfYrb6fenPlbtFafNhWqtmoSTZFfWdEtYHI1MS7KP6TYE885sSCtRxKtFkllP6xSmmGGnpcyJAQzsfk9fMoP/ixxV6u8atATtCd/al8B+DFoNnKWsRKXWk5NQby4VBiI948yC6P5UGkTp74OIvEivvU0+hIxhHVcHwUoINyHpdWnyu/H4lOKiVEmQeFNxNDVSEHkr2SubQY/f0LMfUvSalOkG2U56rsaN5l4JkTdvj46aG7vQZH98mC5gADpktuzjXWgBJEjKWYMocxwSkiRbBw5+7XpPR6Z3oXFk4SJQ/OAVMK+mKkVlg/xlYsGYlYT0E1h4AnHm7EyMsyAAMBMa0YJEemvX9RYfHcGnf4y1n2sELZBBdG9f2q/I2dmw8tHJkHBLkExGtOIB11+gBkFsU1mFh5rglFRJrXV5a2s++dvXTzGqg/UGnmhYn+d6Miv2jT4lNzkqFl8w4+Qr5biLsJYiKRIxMH4QtGsK8uLVN736W/WBjQ01sYaA8WqtsS1dJ9asbgIw0BiCFFAg4g6ISEoPaOPokFEA6CQS3zrIy7EuGyse1/v0GCv7UrgPEHh0gw2ie0Ge95p+UeSbJKQAd+YA0GCp/EeOuxzQkOJwHOKVLuU6BJjUV0D7RmXRF5xoiuhyOZZ/qyX7qeJcuIQzb5kSmbnnmYYIrNhndrUIgVO/0bMyGk3P4xJjObihVmlcwZcsu8ZUwiMyDkEun00GTYxFFoRJJulBFFjKnKvwXkEe+CjvFyr7zikIq4dCJg9QHNTXQBPdnsrqKJh2dN1eJ4pAHKwc1YtwkQDfht9FwzBudCse5lU7aRLf8kpl6pdasI1+l5e+2P+8THbRy65yBHieQTF4pK5i3ugONSME5RNNIzZOFA7lh8imZl7t8VZAW09k18Z4gAYUUAjugxBTVwjQoOIgRrFFBGBvn9ZrGBXo+yWZhHEBonoc9G7YJ0rHQOrY2LzWqSfQnZ90NGvmQKFDgM5Lk2+d79Kz4+gNOZ5rvp0z1krW1+oxRRJh24pkrjTo78kPIv3ICMjpNPBiVTuR4IMpipVUxZCiZo25Y3mdJciW4umQ6jaX5jTt0QsBGMUhhAdwXQ950ZAuZBZGDGrMsRRTrhaL8MMjKR61bhRIj5ge7jecyRE0p5xSLr1U4eCEsOz+31aYAxBIjToPDMg0DEAJ2vC0E0caJ9mqMsOnYTF8/HR1YqyR51YR5Vf7sUe/E7cU1JsSk3cjDw+tK8sIZk7KUJgHKemKQ+NvGzObanGNJuf0L6MrKYKXVgNVCQ0FrGQDEABjKQW15yQIeGUUt9iDjgLGA1MdI0Zy//qay8LOWxho2KA0XxQEmHgWUMCsmK5BIRF9Q6GtcPvC2i40FBzlpgBAUfBOVHjJnpuMzJfZLG+qZCMKqS6iHQXXzIKL/GcGCVzhT5h2S6pE0W2gOUr8uAiM4lwuwcKEcqphrjjDspkrIcUEZCnyxhGIDagFy2qD0cRXAcw5/YlA4Zd68Y6jVLfgaC/bolbMVuhQp2jRGrXddF/6m//1N/79/2zv/FX9WW0pL5+rbGGJr4TDTIIoTnSIYGqJS2ItxGO7aud0d5dZruBgRm9KBNpAgAdf/8s4TLcpiaAi8F7tVYSwzaXLzJUJObRq7CxplXs4VW498HllLF+sw/6aMK3w/noJOm79MPKLHWSuEIBcyS1Y6hmiwu6pux81gC6kKE5Meu5Uc3LiBxS3RSfFJVNH3xfv+vaHYgdwjpVx1hIntNlGePU9A36t5aHOaQ3+Ie6f6L7X/7DGibiwftSY+RB9IrA4brRjaU1bq1WG5EeAugXshj+kB1vlw0CJbhKFnrSBAh0IsDlHpSMdPVSRXIKqRZ9H0XysmROmpi9Lq1gmofCqgZSvBtHVB7T9uzHsEUv2ZdT9MXrQ6EfmByN1HytgTmKxPOWS+Ykzzr39Bg6P7PZMSbdUMaYSKxWYiS0J3Sezlybf5sq6whA87ALWn6t4zn97KOWlI+zjPsqM++sc0prQfn3fuPf/dE/8mH/TR/15A/1sHdfBhvXaIG9kbOOW5x7rJSyuL/Wv0FqnJStZMveGk8DuSvHBP5kiCMgJAP+EXQ4OpMzNZl0z60KBLVlpybKkXhoNsqPbzHMIRzmgx4yzcSd/BZMbr2DxF4uYBwDqjQnvhUTz5SwSztWlxSv8+WHdHhmz6wmzNicC3G9yrLfvohzMG7D0oPDHzReicNhgVJOf33df5n7v3/6js/d+vvVrvua4h7YnrrVicqMq/yXPr5/+v39V0ct9wdbKhZiWcJFpyYcywEmOQzVBLBOUkKpsm6pElprWbD5uBNMQIKTKIkRG7qGMquIiBM1Fn15jnGhdxHg+XkknnOa7ulbH90gU+FdHcl0icR6c43nd6kSPod7ZZmkTKIbU3kGCBQV35X7rHgMvqvf/4fcbiPd0K2oFUdRIWdzRmXn63UYzzdBZahg4XdSVIbqefBr3/2Le/rzWXHVD/L7v30IT3+7V0l1B+ftn+51LmMh85aRChc8zOQoop4MjeWBi20JGjreUkTEgKIIm3SN/4N7ogkAaAegPfbNM5i8fdv7Lqt1GWyUDxVEsTBl4blPOpzXkZc9OkimjTVsvFfkLhYsUjuejF4gUN8kA2lSoJxkB7n6xO23uKZ35n5/VSzd8qgPT2Ib94HzBXlpWh/DsPAwnDenz3/h3+RuYBkwSu3y7j7/vPM/wDn7Gn+JD/Ubf/LauxTRtVc/y/3TpByronwZMUZmnqkxGkugGsWklGGvsxgFADRraMhCy6UiZ2WBTCVG1ShRNwEJnQJOewk4Z1SkP6vqxwm6UV59VD0jSacI8OAgi2cZNzSkqkhExinpd32r4qHF/XcmX12KCkFNo6EAvQDYHPKiJIfjph/sN1+Fa4i4053/OqicReWDXXc7/eUU5ala/yA/y4vAGZaUUud1H66rvKIVj/fD/Nt+GB//uAscnLthd7mkjAWTo5IThhgvCxNEBtWw8DQQGUYxhtZEFWgoaE7NA7deghbzoUjr0s3AUIioZ6bVaAIAndJ8RGSVCEzhGamPpGJNtAuFyDGHwFDV7DFyF0GSYyCeBydFfeuOmOc+LuCh3iCziFGbjUWIMQrOakdYeGweZSNDeN/lig/hH0LIPXzlf1/3vu3yfAC6BKUFyVI4WBJzwpCpdZctdveNv2el6ZOeefUjeHp7uesufw5MH+BjYUaboTwKgCF+mFBEJIrSQCEAbMaZRwhHsYrlqqRIFqdW86Tb7YeZl33iNpGXUsjiUtBmAgB1KLvnLstCc0RGyYMdumQhpRE1tpBM6U5lkmPdjmNPouMS7tQ9L+TulVrxnEEvW/y98zXL/FCOJrGFFHi++H05nkp/f8jfm9VPe6H/Ph/hW5WOaZQYQxmiDVIQZVDKqv5dbX570QWO++Lj07nSm+PMm78r92+iMgKYSEYM4UCmnRgzVIlKPMbEOpBqeFRoSZwSbhSM049ZXu13z3pubjJHt84gaZsW0vQVwMBAsQlI0OlkIIjKD4s16yOJj8Zn/dRnQjyLdy3ZGaaElL1816WmDJXtQ41iovDapNUyVlqFaYmXBSYltWBmfJ1dd8QU4nHJJZZ02KU3++H8kwx8r+/529/bc5fp4BQskmmLSG0u2+yn6CY7XeTxh3vm/CzYuPkLMAzhEm37qAsSjAgNAUrTaCrMUI5EseSAMjI24y4dXDwu0AYl4XAxCTPEhItmyFl0shkhlDCdNpuhL1FT4PUmID09ysgo7TTGRPdP7VMriyKCpUYRaSWXj0XmBDWlbW+ZhVGX9tGkO5u43Kkt0heXJlIuVu6ohZRxvXEiH7GYjGosPiXxQX7j6XCmL/a/+OBfEssbgYnmWQ/16nU7csm1Lr268sPpGOyaUsm7BAM7QlkxG2IzTFCi/GjQIUWyXZt/dA1XOHQIVotyefJahsHwdrcigsvwH7B0wUf7WxK08+MiS6RN17XQlwIZFMcLJsC54iVR/81a9a67GgjrDMVeTtUURk38Kr9UygZNdkkZKrdWchdIG2WD2ePXBlV7QdSMlD3YpO46mtVehOjqFnRszvUp49xm9ffd/bg5bCf395/mwBkyEi2ZJQs577H9IzzWoCzNdC1diV1w3rEVphiWk1lAmwzGqdeUIkMkJAxAemPNqbF+7iNvPz/tsh08T+k8fOQt3Np6u8FLSoKFYghGBBuVAhIWY2ECmVHwslezwRGMqDIATSYg0dH4DSQw+PI24g0FSPbhpCwUncNrKQArkMwkaVGudmkhUUp5Wb1QglKu00hZSjVUQzWUuEA9cTcHVvX5Vp0+7MM//2van84j/8/ut3DbaVyNIaPD2pPlbnbxePspZIPEriUmBItoFFhfS0SAoUHPhISi9LI4Y/Snfdb9/kkGhv2nDCypppUKZAFY3M3wWNRKpw+bVsOWE5vsp4IsmhqX+NrPl0SsH+ZGmX9UwBDj+BRNEEC0UCgFEpxaPgRiM0A2dBOKTjG3URK0XfSVsbxEkt1kHAK3haDc50u9WQlSnrtNuZhE7RLRGxZApBvVCXEqcNtThug5nr/lnNGD/HduicPQXCGjldo6T+loQdpQGjWETZBbhQJA/YhQnUWaGJnpWqaSVMaelO2v7PwTHFtFB4v+sn8l67IoW86EA6Qr+y2nPfenTLbN17cLbdv2w2LEZvh2ewKku6s9svCbwjJiGA+aAYAeJ8dLSdk0ua58+pQN2leY8CI71PY2bkXPsuPlCEmO5Gzix16uASkhRH1KRH0sE3ZJvGp+8yT6U6JGuJzr8s5AyQ1UJroqZ7k0pR7v7tr/3mRHsy3zAVhq2Tg2xB4L5l97NnZFBQD/oEzUPHqoMWsAM56glihrmrMI6PzUidrosxZh7bK9j8QKbae5bbnWwcXVPxqaduzSF+1ioxPkE8XCVp+41tHyFcno3wG0mAGAbtVklESSD3d8d2YxPgNtE7kRoyHitctDY5ebuhyHiJx9ELEJehkXlOAWXiZUjPXyuKPDSDQBDvqcAErJ/AiAmot1va5LK9wpebvzWfvS6Ztx8C2M9/nyl9AIDtMi78f+QeQEy8Qx2uj5VEYEiFjqTGeq5WeYaGIw8kfEvMtylmO5hA+Uz10aFqh0uOjAZG4Lu4u3+ugTT/gr2f4KHvTiq+ny6moHnzngvUIcCdSNaIYSdC+ntcSTfTdGpfc+97Yt9kZCxGiON7kDZHtLGG6ZzRmLaTKBTKtypAORl6iklhwkJVPG5Y1ISJOKGrN7Z467lCcvWnuKZY1aRz3TnpemTZkFt5s5pSmcFGFhdIQo0UctQ+mnFBEoCcWaBoCR75/gLMcaISEQNqERmJKLsDI7xuywJATTUzzW4tu99Ze2xi150Re3N3Ot6AsB4ScAf5sCIOGSSMugGBYbm9losO6yTxnTdh24uHBbp6XGuHnuQq5k2wKMA4mNwkftULuUb6GeFDy6rOUIisTEGMomJ46bbPqVLM2vb/gfb4Abe957rspjjpOjGUCRCXVcXJ0EKhwA0RQxhkInzdDD0CAigYg6moqACH9E+H6IluccQ93iqXRFua5sPDxMldK++tSb+sVdfm6L9iTVRCMuN6MpShDANIuS26auarAIqp9aGxd+so9clHvIQ8xu/SVz1+huFrIgnkaxgL7lco4eKt3T4lPF0gzMEBGTLFSjPvEW4Ibj+Ub/6Yotr/XmmzE3VosXXE+mi8piVF04IpLhSq01olRNlBJlaKSSoUYcBXZKjET+SMP3cAhgUW2QsCmwOfHJfLzSS2kxGMfl9b48zHofxXHVANhqDgAiy2kUZu0vc6/lE9BIEKSXlchzSlHiPoZkkVufZqfCrq/33XNcFrCZN0ZBSZaJqwRWCzL2QgbDVpgNRwuALsPzjX/57v8KmnnRW88t83stLM7J9NyJyWTE6Apw1IlwAkiMsWqG6IcMoQhltNQzm27bdD2A+anogn0Wa6kWYSR0uMoxQ0AjXjb0UV0WxovZNhDFkzZ0W2Hx7DX/fqRWHW/w/ow5gBOOjRRq2z/NxzZQtUhKLLFEHBIPzamo2guXnKjaMiKaSMvVy0uqiVVa3TylDst0UJdoGo+pGBIeCikThjdg5xPI8VYH7/ytaCpyhq29aPkqdWM+GMeMWVQeCnMiKISIjFlUvmsCUXMWqBK/tE+WiqUzOrLVEeBy0gGoOUqqHPHHLWkzOaaAzCOmQ+fEuaieiyUfHrlRRLI60h3bVq2uT77GS0se5hqJJJqBzDMUQCg2l2XjPzMP29iGNkCJELFYScdLyFU8N6m2fTW7S4wxYYJ+D+7UDjeLNCm725HRHewx2GsaSRRTTRlSRiLnELn4zT3dnv1l8BiPVNtm5q3flGQkaRiVYLIlRSAoxGImCC/GLmKmggUeXR6Zj696dHTsByHkh83ovgxIcsEmtyCFwxnloFpcJbUPywv4NE+LOjRpr7ZOuWLkRgaKSTgKwZ5idVFNe0GyY9PBS2bA2YH0agfc1vEgtP3TfkYvkcpxQyvq72fRYvmcs9Dde3sZVW85U4S0lHGR7jU1aDoZfWIXT+6hrhneiS48E4eoKJpOWchjaw3GLbAPO8Y5cfnRzlDrXSUvEAONqJFxhAmwiIQX1mHL7anop/BxubW9BM2gDHAhNs6t+fp654MgkpHgSivMwxw2bxjuF+9yeBynwnEq1iWc5RSVxKjnr+GWW6gCTiM1pjlcDS4Oyd288KbJAA6GmwGXjjWCrWwdDFqMf7afocRFFv842GjlixTm3eUV5Red8FGffumzPWgP2PowdbnjGzBfmtvSNiRGqCPeJF9E2MM9jeIsk6GfORJYEmvOPmVzcWrrwaShMFRbWza2oZoJg+GRjDXeq3Bjvo2UYhqJVv10pFXQIG+eYTWKpymdy5/ga6nV5Jn7xpmgDWvG3pPbUziw3O3az6qbrLzhtJlVrSuVsvbJyjFJAKwFQuxuZDSjGMidRyLnaEZuJRbbgNolQmLdaAISSeQqMUZbOekaf9KvXzXyNjBoqDvZ860qRe5QXpbQw58tns2l0a0IaG/V3cHjM7Ag4iAMNyZJpFfNp2mWZfMUset5Snptc2gbGvbsSIvmyvJE2VhgpjBJ1X+sqZ0KF9Y3o5IEi8ly8dHQmQbsaeB+F3wY90JCWJmMEcgQ6QO2rcaHYU1ajQbnOshQMrD0vBMP+pRSyWVsX9DzjPs9eV774+1UWpGAW3UIRgDFCJzFHSNnzqzDDiqYZG3SDp5Lw841AYmkH5GKW2MshmDyM+mzhViIeDwWi/D6rY95KznYvwqOx061bzUNVJWJV4iFxZ9NfPWl9pFGBGlv+L7kG5imgMa7ETSuGPKHKpsX3QiV1j4/ElfNSFaMmcgESktXRDGWw/Iv7CSLSp2DH6D3AXvflfNA3GlCOg50gvNou8KctbTGSAOuo88sRdZpH5tb76DByDUUA9zGwOTX+N3fnnLxR/e79OGn/cZ9xrv74f0m/vLVAxQpm/sSA2TJAIXu/ESQ62VwVwUlarCJg7dQEdNmw+kc9DIBCVK8hgEarEwMGpXhtZRXDxxzp7jV/gBWk26HuZYtgshDvdgyMUCUO1HUSzcpIzn2zMVWXHJKWw/FUYRNaZWlfiu1FkM1TMlNJG/BpLAzity183Hyk+WFM9/WTcykARmct812921vwr2vcLuVnO2FresaWlejWVpKal3kj62GfCKuwu9ZwZokIJsOGaQM5VJ9SJJ/4P2e/Xrt08xwvB5xMfff8i5e/urxfm/6NrpPWLLRbUZbJwUW+whwNIYrgIyWPz8ppTWWoOko8SYAIAkbK4sZJOLyYKRz94ct3tl/cYpV66LF0Kox1iXqQu0luRgYVa8S+7BEqu1htZekQEwlze0RuhwZgCjD4WE5xFaYznG5ZA8OrSnyU+ngLvYAcuK8lZiH4OqQSMpmObk8rr17bPlO6BxyyaNfonVwW2F9O8/u3ZDTp6tn15iUgBzuBAekY3dDoIEEWcwTMmeSYIhq4fXDZjg/6437P+K1FrKq8mFtvGipxyt3tbtfx4C3xhY3MniLS62ya7H52dQSRRDOoII4IiTjtgFXMQEJ4mpNA6G+SbZpj6p0CY/4+1WiSJQHD5ZSdNPs/qiOTlvGo2ss4kh17xOE+ENn3UFSpoSH5HO+kZhl2heiWfISxwMEdO6yn8Q503++vQqCiUwfwZDiOjzfdE8qcodrTO+v8255d2Mc8WSf9amGL1e7wwtffCgsR7/z5eq/RA7MWQkeSqJMZjviMqIxsXDzZEgZBiFgLOPNc1c4Xdv5zzed6LoLeLxbHnX6xoJNrnVyHxawyZe4/vuxn/rXqy/bXEgjykA4HSsj6xcJqCM7dtAEJIiyWiMkl+r/a1J5+X4RIoTaF1zkpaTwRcZJLsVduEO49S9lgtU+0WzQ5jqttMz33FmgJ1FLbnFNx02thwdYAYZbFz1tP7kGpFt+GC2SilzYBvJa7Ledmud2dONiO0fP1yBW+YjPe6KPsn/zDDP4NByxELcaKTOIsAAtJASyMMRNCk3MT0MQymTZ2J7G9by1hzC3Ent1ruSqp4f6TrzoFaruOkq7R0av+E83+g//b93875c7lSX65dVZSahaqtK0zM5tNYWaTKD5cKW4k6cmdVtW45a2DNTQUKByoXVH06Vqrtr4bLmheDlqRZY/Gx8TKq13t34g+LPXkTJYNhHAoIgUSGD/89EsxTiZu6qnfsxE9/fTa5gUV2996QgxW2d698+PLvSqim7CMNS5P5bT+1J7yT2BWcbGKk4TF7I1f+HYsQ2JJBJUKFoYamKebZQzH46+fw5/lHkezgJtZMAFeIQzwANZcLh4TStua/Xpv/TPNv7/37vBB/8p/Yl/t+JS/ICSzQjFt7lZFt0DTVBQv/V8DI4slmXl9BEMXSTxxUgbNRolBbI0jV+KGtTVqjYpGaipo4P7VhOjNikxvLaxPNh5/hBpDkfIkSGZfaJImgAwG1bV1n90Dcpbqk6+5QN75rQz1XXu1Wonp4ewCdJxG3h8PPo37NxjqzM8w+MPJ3Y6ViZVANbCWpVRgAUMIuyySAMYMCgWKHQSQQzJ8KPuqNChjBN7YjNnAYXakIPwAc3t4kZ8OVzTrYrh0f/U/e0/tvn3/4jpsf+4/Jr8HgIZcLebn4p3JN4iiTe39nw69gg9Wrxo00bCpTGT0cZ5GckJKSYrBqhxBaN6ToxKFk+NQc6UvZeFNxFpEkvDekiEmtS0QNIqg0iddokdEihQqjQl3uegdz1BBjsf4KOsfmz+fWx8ZZz30zFzNfNZ1I4Lvztce1jtuX3t7W/Jq7va2/7cWzFpyRLmme87I8AT2zFRPzkUo0aJjiS9GiqJ8r3PAHFjPYLP/GQNuQsFJDM7yY3WnYimSjSYOaf/c58P/tgN3vijzZ9QxyWCLzu820GIhWjj+QOAlp5Px849vXG8tQl0aX6IxsNE7fWwvdUSEJWT3aGKsu6my5Q0e2i+PGJdhtE9lppExu7F8rVomW8Mpx3fLCG7WNyUGIdeiBLj5GfcvedD+etzsS923v7Z/Zhrbj1Fc17m+vG2rfLk9tDd773MyQckuwSH628/hYkPfOqICIpIIhRjxI2JQoQRUWcYXwS2Nt8Y4eotXKBceWgrlJns1PYLDzb6GNitpVa69bn/tPmrP9jz3r/pdimZna7dpetNYz3SuF6IPb8E6d6UQTS37UbEY3jmVWP9fYLw14qRvfqLSD3vIpSRCzV0Puotia5YYVJ4eGuXpB6UjUGpU5CKY+KQh4o2dSJUKE40bNcGSCSVTdC8/Qd6xdJPa7t3cN1X112+9HLYwejxTjLWePcXqfemJxytsFXXYCLy1yJqPKGQYP94uDE2JkoJliWBESFGpSJEHKq6UDaAcDLc9KUuHJbTgpXSlqtoVSQxMqq0FRtknXEPK//Tdq/9WDGRMuQ2O4AVZFG/AqgzAQFiwTFp1ihbWQq8RsTHqoKPzqiF8sd8FukT9YgG5IsUgpQV9/3xXlOiQKhdSmr+0rck5XEcJzLE8OqoGAQEOAzzBdcyjOoO48T3KS/2I3xLhfu8yJv3kmjmcZ9wx8MXeevGLsLs+zSJRuweD5lIcfCM2rHRYN10CtBMQoogKjSIcdkLGUVMPBoOH3qyvNxtpBBDYb9GBg+103KQMritcALXv+FeV9X3QMqEWlAjgHFoghKKDDaZLQQbSKMewy6L9LFcRw3W06o0okBcbak3q5qwBCEyAt6SFwlSpFK+ulqkx3gVoo2Qfm5CprMsI4p87v9+gLk8TSNZlabBeboLutBl9LpPKVKJOGpl5/IVdLGwsPSk6OGNTDnudjvtNA7DjCsYHDuVZiyYkRBARsIcSIyp8jj3wjBlqhEdiyApTY0L2lRAm0phBFVQCRabElGIMnl02vLZpdha576pLZJgDJqggYpMrnbskq1HIXQbHBzkXajJUC92Pg72Xs67pNxxhy8CuScZ7xoWktZ/u4/1hhPHssde9tP5DWnnbx1t510sMxajk+yKG5obzUSHGU48YJyFs+Pt/OdzwX0P2aus1W5OegeLhnMnzIUNYeymmqmhGyVqiQgoDHOgfCynDzxwBqOAjY3VdSIWq/iMEIVgzioLVnCkujsE1Wim3FalMImPAgSfMJUNMnRF28kteB5ldJkEoMgMJPZQrSjJctt0aEbAmvH6qHWns9wb9WAMpnauKkRQA33N5Pk9D8aRwYkk8U4a+mfb95Yp2d5DzxFnCdFGFx6BMJhlWZLJ6Y3UlRMAY7BX4dZO6Za8rTpcF7p2vO22efQYToNBjEXQVOSOc2tuClclJu/IAAwxBxE2vKhR07m0CCcWBQFrosdUHptSWxE7HIn+MwmxxjQwDlQG1QqDgcqAajj/iRUNKGAUqgawHs1QIOO9xkFrgHCF7Wyl4xoQl5BixEKHO0YB0rgI6l6N8u5ypAk5FBWXIPcLLUom8jKc88UJUdcpHRXBgkZSRnMy5crzB2hJTm8LwO7kSu5dpM5D7bXi+UYWSjEUdc/m4qlMNHXPsRUTohPBPRVDi6jnZYAQArCwFjkRBFQ0EuTAaK8bBc2ORLB5dmheRpCMEbeJYiIYKO0WXIULmEDShBUj2drkPAloigJK8VqLlu5xJHUAMXq3PpExiqR0supEWWVAhwKmSUpx6Q3JJMPJG5HRykkj8VBFtXUUEZ2WiEDmtX/+UDhgw5mZbeAwAUf0NIbXFlaU1IKWN4rQTAo2LqqfeHPsJAUAfN/HTZo4YREWB0ggLvhcMIuwhEgkEiGO8pkU6e8SMBcBs6iKIV1s//14WwBlgsCqP/+vh9HAIM1+4AJCMswBnHRvxiziCYKBzuA5jHIBnNGspIj3GE5JvNSUd3dPhEbuY5sokXQJHDlsG2c5BBA96ybXhvx11+HmKhJ9TigiuUgObtvgSE63eVcxBvvyKPPnECYQp2w/n5q2r+VsbKvx5t8TLjKGQNOncgDBtQRGJA7EEbIWZjE0ApgAYM4IRIDF26rF8o07OPpwYL/F5bqwGy0tQty8QAoopCghIYwiTc4q9gINjCDmACR99Q4boBYsCzFYdWSfRtM/1YNFFVR5beOqOKD7lpL6u0VqkaiXrDltUB4WbHK5HSa0RWPhCqrovug7CChmwybTxgLrnYtAiYOrFmPn83O3FlaaJKGs29XpZC1nmAYbGgmllKFdfj/uhcx13F2G2C8ECyUFdmOQOUePnnMw4vW79KucHdNEMysiESSQDO6YPFozbNhbOQhAgTKuws76DxS9QEZ2VEWmoMFp8bZjY6FtNQWXBm4VrKqFbq0YTG2UIFW8frpUo38nAg+x9SUk3EIKk1tg5F7cNiu3TEe1iTZENv1rkkD0fCeJ0si3Kl9kCSFCRs04D9SjtEzx6x0Exv8Zk//mIVw0igsiUUsvP/BBt+WOA+YjKGko5qeFNQsNoIaNeVEScLIwkXu6XezNau5mWGMrOAK+PnG7WndMsSsuzTNCuEMFiAKoAMmAVP5+CKDWFDj2uO9Ba3GarmEwaBZLAulTqxe7F30U970qd7tjiTPY89BlaCDNyXzJ0nA3gjys8oiiZRzqHQfVy/VlLyVFzNCIxFDzGfRBGopatsekcJ2wCPapIRai8TEHiaogVwJWs2UOuWfkS0EzmlBlgP4onHhRmp77bOUev2i7MlV/5UBVjC3gC8lLYzcHi5QCWfWNyZQTQUw8yFvnGGaV9jZtccVVlHTQgYHhf0tcoEDCZy0kQ0YKTUEgk4XIZLambhOISuU0T72k+Crh7+IV+pa7ZNsXyxrbNGWSf+TRPdNd8I3Ly0Ozx9zCPcHTuqKK7qIfdtIDyWKMPSM7nCBF1sHL9XMX9/399o0Igy4QsMB9ZOq1NzLFn4tc4P5bW27YXSPPOjOkGBwxr6EPWLDHwj2VHLH4iHm3/dB//t4Qg1Vy4+dvdqaW3bx/bVc+7TOTotHlZWl/V9yEZTIodqoYg23M9Kn5eJBSnl4jJiRLzpCUYIKaLpbNBgAFzaYgwUCcOdwaWpzuB0GV51zdytGoT0RJqLOZwptOYw+upUzk826lr5ktUpJo2Qb1ySGpTrta76eYsp16+IkmotRoYj2SIxtVV6FBSmQVEWNxMv5ef18S+fta2yos6hBsakTJWhjOTIO0yfdH/tebluotK7xr511pM9EZeWZdAhzcOZMbFwe46KUoQ8gRhiEe4s4vsY07u3qJlzq1XM3DhHZz5H3L/hMsI9aVruGrYlg+7y8oY5ISU3uslgk/EmTQZlOQIBW3mgSzqAbuugecgr35Y0VtEbmHLoyyJjWR38noHGnyLpG7aRguhMPsPikJJE9mZ1VbNkYZyGYi1MmRSLeB5OyQ+LtenW7mCiIiSkxOxsBhmPWWZLTlBu0jmLvhLeP12FEj9tT3CrZ+4xh6mZ590gXDUg/WE0pf320rZVy2ZamUirf1t/E3y9XBs+icLbu6OGfkNYXAS0o/odSVZC9f0zeeWoo2h6RYOqetffwwW+4EtyfpVsn00sQBKU1D+d0hAaWmoHSJiPdt520UixN1OdIdTEcrqsaN8hTNJtDKekbdLUfNGghkNmEcYWpBuLh8d8eP45BbDY4ufIieRcXZIoTEzAiJWWbDj2GAefy+zXsuVEQkcpJOS3kg32lw8+6CjLk9WvM2Qm65qbr76P2Gi6+TzYgCUs94qc+8tswnX+t86ZWs9XtbWYpUWZAhOqeOqUv8EZpEZTzaxfk8+8/8xJDZQ8Fu8o7ieMiBbxJXNJ1B262Zs/TiWuErT7j1LXvFL+XsgXmLOeY2EaQh77Kch/BGUEEVmAGl5v6FW3Hachi5cqmDhCSwfGz7qConUqi2CTHxefO65FuMCcW3QIf5OlmOzrst+ZpPS8oH93zJ3+QuqTsoTRDF4FV39NMjlGKYjFBk8aaNCg0vvnxXUBhUfyMSufOQu0NKXpQxFbExSEmcfRRbHnvoPukR0RK6/oS7Y/yEN4/24ne0qV5DsrlkebEKA3W0jsXRjM0Yyg4yMs4ROa/swW5Ig5jA4wnK1/Svn/d48ND7tae9vr3Jq3y4qzdXPJ66NUTYDAa0N/svoyFCpRiCajYJHCDeBoBmMxBgvrflWmmpYegyCGyH26MNuBftl9BYakqTiDaWVRkdRrljIxlDHYHkYaZgx3D70CI9okHR2vUc/vhnwVlUhSkTWabDZCTLRmSSt+tDLphKBQa42EgrA1Tl16W0m7EZ1kPlbzR3jMiyh9r0sEfchljiJx4n+8Xfs+ylt3m0W7pX+ACjkA9iJfkgMBcsYmzK+Qp0bU0XFVDETTIPkgJQASWoRdzW7L9OQxfKXG/36cZf/3DW23j4n0wPe+2dvRZXqf5mz7R1oM2Mk0CTNGqyoGmwQLF0HZohAX2DGbsidKl++yWbZGwUHzXaRE2Nugw2ZmNcFhJRZtU+UNtS8zJyic5jHrlrPGDh9Q3DxopZStggDdWLnqcgG95pyixhUIZpQh3KseCGkIOF6WiTicxaZp+r7NWuktUH6tt655Zn+MKG7qnVfa7/G3o86fO/5MQ/6hexchuB6yuQcZjzYzMeWXlv8UPGMLirgodTts6lxvYX01e0q7y6qtOrV6rELMIamVjAQ1Lydurl77izn/BLdvr650Rne74RD/e9J2/9o6tuw+bjaJJm5GCp0M4O3AckAAiagoQCINjqaQOelgxSSj3KgUK3ySgvPoZV+tC0Re7toZaBtrinS6mPSuqymIQcDOJs48pjbHJ8pCK941EGEinvVYOC3VI41JHB5se5lkucixG72zJBOGg/62+i5xrW3zhdZZlTbT1lwa2A8rTP/OqTdb/snfvHnz3x29ubI71Fz5/ewmveLOvN0NvqE9JQqKxVPzAGStHthkvQFWAZmu+9ucz+ZZUVyKlSPmXfUx/+/gpP/Bj5z7a39od/XecdPM4732XaE3/DA2zg2gouQyKjXa3ruAD+Fkr9YgbJasYCiFZLbPkUNJ5uSsWcUec9RJoVUbA81UR9KXPdGDURhkVJdYMaJZZThYNk2yJcFEoOwymTnNhebVpldccim0bIuM2jYTYOKSv7KxEEukKvyMo4Kb3lhaSdBdprS+LNSgzbCWR0fuT1Y+EXDT719E0/v7xVX/z0lj8/3nTwqV2JfgxvnBAYMyukeR7Oz+9bUj3JLG38jjaWf59vXfpmTJQQEdrl5Ufb/EvvvKWX/leikau8dgNn/5CdtyxWvmLJdjMjd0DtFRUtMwNua3TSEtH25LbNDnQu54dhGFRleA4ZpE5ZpZUMDt2ydhKpFz7ud4nKvWohyumLljwfRD27HIfzHFnbEcOJNO5d0OukZS44L5ka6cvBMUAApJsMaa55epvc+yavYg9Z06nhljFXXCzdf7O0eDAebW/D1394s8DhmQcQP0CVDvQl7Ov91ZIqS4IwTlgln+iyykr5ynX+uISqc9xDk2QHH22Pz80rXmmrBTo8/K9s5jN/yT0LDpSbvRdw5IZ3ohkamdlcZNr59hN4GupW8yXF7RFRNizGkQIkF6rD+0ByKW8lThxlqNlYfgkWCP9ogvAHjl1beTk8NhtutJqFToLgZNAIDVejid40niUrnrJTKMDd/8fKdXc4BZq4wR1fN+2t6nTFgkCRqo9a7/2Cld7/DUcW7j+6eFlpo/KRuWYMV+BSERpNGQPkRQt64WMoKTneVUWuPWu9P+QdLx6iNnEIVdx1xkZc6Hxc89f/vN27m8cRsHeD+DdRGfeZAoD+9S2vhIKo2q7tYn5hNKokBX8ReJFR3sqVqK35uFKjA2HjJl7pE71ZZXPJA0mPNpZPEaZOoFiqS4Fi+xq9ErWm2UtmIAUxeIPcxZ1f8nPQZZ1qGZY+tAWudJOX7u6H8oB5xBLT717qg1+s1I8ODwbCnTpAV2BWSWFcKUFavcIobU8LEExbpY725Hzb81kz7hwJh2guf5RnACxbXdgm1R/s+/itt9C9Q34dDuywFUCxKQCUTBRbvmAGwVEAxfEweMzozoTU5jzefBnVonyibFBCFRWUjXIujpd9XXZJuh0T3VuatFzE3/ag7N0/wkcHRXC5GnHl+CgZDI0BqqLnLVoM3J45dvMUZYk+8wWZ++TQNW7z0W41OFBg5+n3qOVA3VFzrEqDYfuEnkO/UqOkpy/rSDN8MaGSsJXW1YOhKX21rEkz7O852IDTy23O7fJ44R3yQTgAWgBMQjOMlyM7bR2f3I7tnn7yIYBP/wFwi5ahhLqQgtao8rZMyHmJssy9jQL9QSQkJArv1opKeMmJZ6NwFMQTPt+oCvqkEqBITWP0XA70sftuqAI5koOZdXVTwfTasyPOfXHrsIlFY4S1t7U+euO5ye12cfbNcx+CDewsnl44EGiuNTg9K+ax3V4u15HrfCUPXf4BpMBrXy+PWXwCrgXgTwGq5jeLpig8Y3VFy8diWnkowsCH5UM+opg7InSLj454OcRjAaNgFlwKqiju7iylQW4p3Mw1N8lCXhapKqSsBE4JXjIf2kGRwm4DJEdN7m6i0OyRkyv+Gl9QSn+dfRsn/7gytilS9GKuH3EpKY9eFLYrp1IS9h362M9DIQRI6mPS0LqRyC3L3MHwfTMUlsts/dJGfMJ7V5C+HzKOzwBch+YoPCOtTZ+cGsw4YsOGQRtthm00nF19VJU7EznqPbsXbWhRFfxaAykKMmomOEJE3Li1SJpMdLeoNlbIb3y4ldNQVa41CQBeHNs8JNmADJWV0UpskKye1D86V/Nrl6GT5lxy2rAL4LC492bN2ljwQeGFR6XRmDhlapJRpPGVvVM/S1mIH/bhe4AvADBARF82YF6NZimc/uPTzg/10ZuUsSYBHCoiuqVVub3uwxZQ38o9SqmNxUcJtbFQGAsd8MfussUfnDsefZq+v9eEiBOiRQraJ11i7JD6QxbVJDI9DETVKEwqJkx7C2ro5PckWcVFPxO+DkwP7g3b2f5Gn84laIzCeak2S8t99npwOJjN6U+ArwBoTIh6o3lKKO6ELS5dJX06btAuo+9VelLqNMrjDK3SsmJUC9jyvTK/SWFJIqRMHOl5HH6QZahRLbp/tHvGTCHQzvUbEdGYgkOC8yDVFEUUFhExUb4o2Wyw0pBJBppkjWla3FWkcJ8BM2uAAVxIE0Rp5J6rpWK8+zbaxGLRuXV29hwK9QaaZ7ysUAChSsC0HXP7NmxwsYzUZ6rb0No+yvDLU0LWRk0IS8oo95p9uVTmt4W5sLw85Ws3b744BPeJcZHC3dZAPzSZRseoDWKjwY5GI7xwhHAcU+UEnEGo/RsQRFsi0ohRyVTBeWVIvVUln4UGLIHlnJFTmaYJYiM1qPDatI+qaVpYvGLLOJJI/2EiwhXVnDsqNo3Jk/JP6iuP1V20wMFpSGgGJV7yKfj1oiQfWhjl+lIlPfcqd1JNMRFGF3OlRUUL6vJUbzFo1qX3UTLGMWtz1yFf11S6sIOAxEWc5cSRKCfUWNXYZJRL47xFLGtmu8IqYObS9/OKFMQUjUoWTGpQbs42tMTysCC+SBxIbCCcY7OJCE8Gp8RnkQ6Dxhiqu16A3riMYsrZYnF1XvcelG15ebW4X8bJx1hSJJtJCeK19AzqWH4o2RISuXtt97ZLvfVqvlREgmjXTG8T+7ioa6oaYSBqepzQZfMwFUdCnfB2rDTjqGSa3bcbzQsfOpXktzyK3eD9PqeYRqnZLCdEgqPjnGyUqh3m4r34HuJrAqDERAAZtLhhJg2cDDQXA7Tc+pr5Xa8J03s5zeTecp8iLlkd74+gPtYrRPHn/iHdyYb40lzc4RBYhP0r30p1yr8mbheF0pdco5wZ6P1StMXxeFgI0bQ3plXKs4Awy747E+wpNcJjGNB9n5HRQ6WIMsykMZKwMhh3xfdFydO++EK8QWb7qEYTFc4QbJiWFAaBcCLP9SQNi6hhE3wYauN9bLXIG3WphsrSd6lPVMwlXrM3LgUSn1nujqXn7v75W21828t3tvphfzHxNlNL0kEpyuE2QcCNkfCsSiaiBCNiGqAmRYzheG67c+lGs28qyaBSfD8/AWPRx1JlyqAymKAc+dMOstSm/dv34hkQXGcmf25s3ZY4pVq3/SBy/e4OTGTJqPDd6wi0ReP8Q/zuDedGtMD7i6elw0Fy3CVu9KSNJeXy1apIeQ3vnmIYUAa10iizJrFWpQq3eWHCNQY0ACYnOcqNW3CQj68jXHXbTry9HCFZ45ZVlR9zhCKUkSilkQYlTr1voavN7SZiUM0FZgJOtzs3bMugJAgkjADmEFr0RrOaqL3fLzKFQkmLdoh4xjlY5ElyTyf9FgEMmmaJ++W2x3FZyizlRe7d0uz+XZrXh6QnKMNJhujJJvPME+d9byNBpg4ShhMUrhaK66/fZuvEnH2Sv6SEDDWahBIlQpFQSokYYCA9IOFFTGQicnO4KrzZTBBTE6NsOOii24eYuPjshPgUEo58ySODpZVlQw7P9e6NAISz8xdHxJEIyxpHbkup3Yvoy7mFJMgwviJUZoSRDIOMsTBDYv9PDtgjkgNfI9Rwj+M4MP6ovv3vuMHczc5xDHa+iY6WH3t+LEkZ6WFAjfBQJdgoi1yQ6Vvx4EHpW8z8hamMiwDPQhfrNcR2wbjtfrtUQzLfqIk0+Asil7R2WxOcBYHczF8+8GUhL8O4DQp7d8/diqgF/vKn6O8WRqEvhIdTBIklo9/RO+ZIlZPgumC+BqhrvyJukSludK5jFVWSKfJZUsRlpDAWcSBRKiSc/32eT7sctLnlxk/NAArMBMCJcSMLBnZ5sGzb4ECi3aWqO/3v2XMkVvmWjR6cl1WSPFxIdbs1O6Q+imNCpKX+8ChQfNqo1gdF/lDlK40CkUEEHobYzuz7nk5Ra1JMTnquOM5LD23OHHb0/RaZmvn3Kn9dbfbSFAkxGCJmTuQzzHMOVPmTUagJzRTIMS+zCA7DMmJ5vS0ZYkulj5L7Rw1hWIUdYsdGTWQcciAfddEXwdofJqWXPday0ZxsNwlxGSWUTZ1ZTTwGbqDOhMQMk7CZL9ZOv6qE0Uh70eRkHG2LHYD4qYAStu5Z6R/VE8APhMhQGINGym0jW8qU4exnkB0IqtZUAOyxuh6atIuzRnoFwhqooftvbNBYL2NDQqzKONLOC2S23DVQiYqgv2bCc0Q67VJHVCRKi3G9uIt8+iqx9CnejXFOSC9mEAEJJEXitewoSh3Hcexh8zkuRCzySFZpPT7n8TFukk1AAGMfdUgMehhGoxXBVT17IWCIWRWaCiElqxbewntZWyEA7JXAIDYPiRrLZd/8YRP8IHTZC1LIJbK1UstcPhK/cyPfFySt3PGvC+mMkh/AJpalT+m7VNRCn9mOJAhe8P3Z0N59YAHQ2mFvwu/4i+hGJhA/oRZ1JiX/xZK9hOIMYXGidRaJGoqauOGtw0qlY28jGYlU35gKFTYyYNHVeOYbCEdVMsp95Y12GWvciiiJ2rxHIUkSANkqSemuH4xcYk2/RED4E7fUyMi4Z28iehlF7O+R4tXgQiUgUGL7RZX+OUvfePXerUD8ToKJ/ySq5R3EPAZDfLDIyAoO03PSPUWFsUaDMvFt0M93V7RvafahJdol7vWVqSiBn/907bcPez9uSUxfVG2dYJQFISgio0aTwUTKCyEnHnNBF6fZjTpnDGrjbodYsoVd5jdzDwtPC9Lu9KxvoyL04rJLiEsktZeJRITX/Xg/s4f3dx/WVqZiuQiRGExnxIJuPCRfjxgi5pCWpE5kHHiK5Puw3vm9Y5ogeogd1Jx56kaQR874fIx9dI+fawHsNxUA5Z2cOxfv81Zr9AGsHcW9HUmwfRMUW3xO6p5avap0cCahRAZyg4z0lXeJAIVfVmsvUnEk6hZBZJp8Ljxqgqqi3zjBoAZQFxbSvbhh3ofH91vnFI7dC4aDzp4b2tf1xZxjHxlz3rnn3EEkKYo4h1iFlfLx8JHMcyR2y0NErU6ByiTWFTPjVU4Z76X566F/tjwbQSrQXImoAa/5UnxApxomR0rERgrB0RNECsYSnMlYzhLkBWLVP+z4lJvJ7RUld8GmTuyQPHAn9wRzah+F71QRXlYZapynCEM+hrPj5xp8XGJFqmpr+rkJsQNyHTwHPbvcOLTR1d0PEXkIIJKEXfxBHebM10C+WL5FTomwJ5CxDkOVSkWcmCFlWao+5SF/8luNQCUmQ8XNeMAbshAPcblrLBpIq7voLfb58wD1OclyWiWZjM7z4CaAZByk3N0nAodM7xlr3jIl1TWVLXIB/WDtoUnE6ImYMQypinX8Pg+fQcEUm1oUj5fM+uK8zTVun8cqloh7tJwcrjIF35NWvkH4Gp/q4ivBugxkvLpPxqLjJiVKjEQ0BlEiR4IKr6tbqZ7z/LHifnxjMoTdCdVBaeZbV7spj/knpwQspeFIFhwlH61Ht1IL6JWet0xckGSiNnGkILeGNYEETyqkR5XE/ha+vb3E5Npr2Hcx6v3opiF0I7436lbIOxUbspSzduTc1TWLfeuA7caeNnvXNquhrbotlSa1g92BNmVljCEFfEEkRJOXgRfjdcJdbvz+rpNQewoJ6qMgyAZhkXNOs/7lE+uWWPb/zYXpNURCqbjpp7bJ4WK7rXcOuD698f9NrnVr4iYNREqG0c+f9F4bTa0N41vrWN5TQhIyWyrpgNAssdmyQAXJg8h3If2lnf31833wvX3gvz3pQ+/3v/3V/B83TN/9eQe91eBJg0HfNuedc+4xa9dDB0unrp73pMnz2i7tfKDjGZzisqWeRbA560aZxlEzxrEx+wmzKM5kg/kTiye3wblnCkMtETEafvEG3K7mwz/XfZPs+KkKQJO5cEushOOczZ9rGV0apsu9fts2u4jH+j7e5P9ib/0H2O3m9o9+vH/c/QNH/8a/tL0cy/nvdLSqCtUuyjHuhIQlTRc99hi6z7n3uEUeiWRK90IP/7xMvg/u89vyIH6l4fzT7T/z3/7Dv+/f93PlwQD6MfSVa5z+Nf/XAlw980E+7MrpdsXaWkZfNzOIfJq/mjqr8ee8w7t5Ug8ZT4egKEv+Uc5ELr4sHjY3ZzqUxsQi6igaqNvt3P/PDlkAUIHmKpC4ZL0iWMCW0bSycTlcOyw70F6Q3NyXlphPVz4sTuyKi951593Rv2rxdIG6TR7LtY0A2FG5VXoUwaavhD/ijwgAaeILX0AgnrSgaz5KLxQyk6MoKUd6EdBMjLiiAUzcsMq6DkoTQ5j11fXZdSvrRwfS0ua3FxJ7nzf9kbymXCWWaYg+rjoYU4GlOMS1YY9PecRlWMJRQGue55HELb0sl56oYw6735raYGOjIC8lVq2Mnueh41PYp1DkRjz2evfKotBmkxHotEJZ4oNoKyI7XoROuXTBIpJsO6TDA/R40YhvxPTr3d5/vbu3lBaWxp504Sk9y7vLcbvc4jih086bvqwZBhSJjdceoVgZA4j8IzUdCUJQnPAxatakDGUmpZYSm8yEWWNcgMuxriyTt+5HN2LXFn2b6xcHzgyuIVutpECWdFbOOekqpwUr++vr3/fUiY/g5Wy8Pm6cR93kDL/LjnhuXOvWVtgSPqSWVFk56+n4iJv1ibQQSUDIOMPORUbZg7nbRB/ki8tLFy8uoycZixWiGxuX6GhizttTEO/52GQk6C/EmqbRRJE8aXonpSUxaFGyFTrG4CpwyN0ffD6s8zywfx5a51HHfOM+OxVZnFu46PJpV01dNbvSLBmTTwur8mXXMc8RzQVXRyZc7ZQvZ/woBgQFYXVtKhQMySiSUZZRM55RXOY6DScstS2x/dgBt98MbPSl/SN/4MExQ+eUy66lK1qXVnt3Lt+xUi6TS+J0t9PlYQHld3FhWeTh23PGR3/ItYXt3OX29YDD93p8QDRJQUER2qafsTDxcDwcD0+8RUwpq8yhfBnnNhJbUVkUOYCB3WsH3hBupGKdXH4q+97c8jcuwGn825uMACm15hip9GCEVtBFSIspeGgbXC7DwPY4NOe9N/KhkM+wH1lbPHCZfj+l2+d1XrwqCNF2TeT39NR2T7uyuUzt5VMkvwm7yA2kAna62gUHzLZttARkSy0E2ajyXQEcy3Ec7sxTXLRKHVuh7/29DNFS2V8OZP/W1RRSKOu2KNqufb4by3ve6JGjH+F8V4wfFmIJGkCz2k9Vr76LEED1XSxO0fQvKTEFr8qPe/J4PTh+xwkoMSM5kmusaTB43S4Cr79+28xnEIvDboCH4xhHahIjyyihzMqWgC0Jr1rGoWPO7uSWjHa1Vy6gAZAgmiyARAK0hZbMuCDPOFyxkFgAi2AI4L3nOaX+9O0/YWtJ8Boj36CLzet8kGv7pmzU2egOVtbR8qlDb59z7uayRRJY5dxmaGFTjI21mM08Fypu+VJ9G5TceXk8B7dx/Uk6FxA3jpmwO/nGK77lZbussfrqYyO5PvlIXnazBfF7z1ELdC171sX5urxjw+W52/LboTsSTRnqUFEPHbICd+/G9n3yGs6t9LtsZYmzQTuOVN7eK9abeQQlnnnmJm4rm9tCD7iSMM8+7EaL7ku9LQvRDe0qSoQkyugwloJYURqB7fnmEyRkt9mAE+lOHjXVbF0OsZLCOFHve65Ssaot50hDpNsZvDj9OcumkD6FmFOdi9+MkNz4fXn6/rri9ZrdU/bpd0vpgCnXlJFKxHFg8+x3U0mXHz5u9jpWHeUaMIBcke/mzVk/5a7P2vtg/g9f9F/yL1lo6Q17gwLJ5e1a/frvt0v3I/nkt3Oe6oa7qhGuu4OLC12x8cEW8LB0sGQhbV0MmSORcOe0g/YUDLve74MAKp38mOV6mCQKJRxl7C+2D/M3YHQ7EsQlLtz2M45ZjD3itoq61YvL2NQElsCpggMFMGrbZcGgkCLxTtobmX/1CpnmH5NRZXYFKpwSM8fGLIhZ3sEgd+uXiLIeUCm7JLAMTgGHGdBUbZfC9XLiAIaTBcJr13eZnzV+6IGl63yT7bwUu3sXwVC8l97y9XrqF/nh31FquhjqO3KdQPwTuO7X8Y8/r/VX917tD50Ow51DHvPiIzy+KrtxI7zNmfg686PXhqsPQThwg0tOCGnZqS7fruiQm08GDhuGalejJmKX2rCbrLWsKLe6Wq5+V3Ka16eUURr2ap48CNtT4YVSk6KaoNVe1ojT2ulwy2kp2Ia7BhUGtl2WjLJdo7AcNkXlgEcL37MYlvRgv2kyhHRpOX7EKYxp44HLJmF5GJMBsowsRkPwpXQxbkg4w5IiHHEqRUEQY5UIXLct8VT4cjOOT/8+jlIHRjcYAW3v8Rkar7607/K3UmOW4PLYmxub8QKyPdVx/leDu+PGMrRJbEA91Lma8dtpX0wZshyAEzYueLHfwISw+bKr+aPP1VCfrKGPckHcGqdPnf1Nrt+kqaOecGLz2S67TtQYg39RS/YpFmB2ajysH6sO0Oap73/Sk5Zxu70IO3cm62/0ARclYNerA+DoXd5pW8Jt7/eKnIsuowZAuckQJkyPhZXSVFnfcNGhqqFTB9rSJ3fLDkWimDJgeE0vDhBBuQBe/H0i+ACuZXPF9v+h0jI0xBvDWFqdUTfeaFuTHvJtPwU831wLk4dVfSgVsyqIUzcux4fUdXJdXHBTgn2x2I0UaUY52Bstp3ZJdaziIEO0ouhw2nmDLnFOHO4C6motnNz2KiATcarymjz9+4xn4xakjK++FMxxWMmjIOZqdPdKq6gB4flSib7j2K5XW8F56IZIDnu8f3OaEnoHmqwAcU9Lh5YM+HDcIhALUg+j8tLdRUrYMFbAckLKLgSsJ669BLgc5RZSRgDceImmUBvOdfWGWsB+n058GajQZzamvDnwlyS8FmGIArJ5quH7gHvpscrwhaObR9qHZkOCUA7FCZd2NkC8QVoVriofKcvZNqi/h75tyoF0VTFWwOwGV80zmW8phYQoBillDFNI+DvHnB5q3egVnRF3j5oMk1F0fHcwcis+cdSI22f6p+/ubP6bAhlK2LvNBtBZT6uOJRUNBI7mEles9yvMyzu5LC/EKEViZl1UfaILGYYCmeMYABaN447SwCygIsWUlTlEkRBHD2UEfr9zOLkmoT9RPwLiSxQxVFzEQr4UR63FGMosehbFUJ5DyzsPOmV/SAxKioYKjYHgfQxtDjH5qcAQ7MGCsb1HavVG0VYgRKYYpXLEMrFbYIFjlR2EMEaOyXoLclS53KMQMaijIyHMF26v1Hy38PEHxXeL6psax1qzkaC3oMWHSLLUHMMlTgTlFW+/yDL2mYMiYy0clhdMCKVQN4B1yCaqzC6i1qiPaFcubgPMaCijbbsT/1Cuy2EUSmIAEpezGQCXgL2p4jgiRkQlgSNlqJeEn0Gld4q7eOgI8TZjRRhTbH5Fv/VVrY3hBYtlYRVtXTmTQ37Yu3wiGUNC2kI5boLFeCF2OhPpo70NZ3CTPRiUMyqCIIgmQqc3ZmUhljht/+ubeGRFOZoA7DQbCUXUGmKkW1iLDZRYKKDS5xMUzZFeA6wAcqLtsNsEV4UvGu0QisfZlhjqNqRCXY+gDAChlpU4NZpShiKjaIXVDdV8vvioX1Dfm4fOcJNSAvVWofxQ90K+WXGt4irRUUoxc/lR7IYXfGLnz46CMmfLAboLnAO58isCD+ggqrEfqVtgES+kHtl5yMu4OV0SaIvL3UVEdHxUMHRgaeCw51sHSHg/0Gwl1HOocTwwHgwVrrhxQgoRjPpn/CGVIl7AEggE0ArLzQlOaiPC4AKYx13DrFIAMVSiRpKaUsgQxBClj9dUFhoC8ZKRBYGIRfMWVXb3ExQhAERNNJTfgyQldkV9IdYEoWoeD7m4XbQgBswNo5nebMm0MUndnKnaz48Uk7XnW8VTnAq+qMVq7qj7zf2hTdMNLxsmWDzL9cZch0F0WN43ntv+rx6QSjaZDoCemBgW4EHIRKyAlZhNDoH51EwzQVa4ErjEADpVRl3sG5zwfQJ8LScnriEsolESD4m9KQMmCnVoZBulzVRWmYsomi9GIwTmlUc73lYdRWOUMBLRjeR5dv+Eni0QPWJlaJUuZUiR6Q4GMxaH4VAfwjlAMZJTq8LRb+1nUKkC3MmBSw5UfNwNzPlQ5yirTNYDNW4D+GvhYE8LBmW34qBCKRKUNnu+Za6Kgi1e8LLpADgKFNE1AhFqNcFBtQIOexD1hPAYeF8ccxSqPyXXCwCwnCGuIQYpHI4ZxRTD0GfG1aqIqgthGB/VAcrQHymvqrYxiJFSKD5RXpYoRmA8lJSRceugXaoh2NTURJ6oa+owhDE52TM7kBqGoRjfRQlEQnY8tlC45SDHu96Ft21xcDZhjoc4M/Hkx9d8sZpgMBVe3rqjhDiO45dVRl7uYmx73Ghiz9L+CsBm06HIbyxjk6e+W6a4aeq/T2dlvz1gARgeJ4iiT1xFokwEKCCVd2IEnHyyPXy0bQ1UhxjERdtG33Hq0ku4IUVEVDL0OXeidK4SAgkrTIyU0TkFkEpOFiGGmVAIZJ5ywgFcgg/Xhzkxoo/T5iNYTjDzwSn3gMI25mDAV+EjQZrvC0k/V1WXMNffSBdpImw47z+SyrEev9URhdijPuqYTH/e6vxDbVGM9A66tosBk8jpK4Xb7jdlVXfxvAVNF8ByI7gq3T4S3+Di53up5f+iOEV+GkY4GBrSwXWTaEUdTl9nxBgdRilmCA47+y4EJkXQ3oje0Usc9Jc76Pn9zvrRSEYAxBxFALiso50tnwNsJIQyUhKadX77VqPsJJ0wyMIASMipS7cSsREXUFeXqxKJQS3qQ6Ms8uAoHu2BoPgt3X36S/A4CUlLyK2Uoh3dhQspTWVLC5Yv6D63x0c/QdEO+OPy0JMQS0em9J+G7mZU+5lBrK6rIWWMZ2T5lA/80AaoZLf5IAFXZctrw+TjD9H39I3/3INf+j816kdaWKSfjpe+SA8jHU4CM2vYHqQuAnbmKafgxsE7DlCERxQxN14+uKsli+/4dQpsCH/CbYPAZlPEG3NczsqfJycEHfF9T/neZtpuoZFTK0NLMMpw0lSlsn2iVrcxA1ugjKbapkV4YxEKIpfFbt50T8Mpt9tezpVVOKS/j10QGdKrlZBTjBv1iPcPey1/hN2XP9peez/MgY9/CP3oDUiGcchyAqvibzKd4mVQQxJ1L6i7PlKYISbbF9nHL7rfPyneYpE3TQjAlwy9bNH0VtlY35OmXfmzdnziuyTn+B/lSiO2sV70dCWkDJxZGRmJylIMJGwpIB632AiE44BC8eKsjPyVZ1NYP6GNe+NzU8C2gWiXlxvAVtn9/yZXcHYE0BoGk4JKFuQi+c7vIYehGsKz0FChngqmAmtyoHAI1HDCuIScOKG4cJEI2tqp+eYeLOvkKB2O4WvwVZOXp7GLIcU67w/+gMMfKjN/5yrXf5ru+o1Zj384Y3mDIKHqRrMUMSQisIKEwktzjVaLjKvVJxwtyx2pUdh3VKLssyfGR+3/xtQbTQgBPJNGX5AZ3EppJu2ILc9+twe/+B+4j/4vUO0ObNL9QvQTNSNpIpgI8RQRiMhgw1Kw8Th74x2eYyNIY7CIoPQTWnSGQ73U1wiWp2sT7hTHgkoMx5tDwCXF/nLVRUc4l4KWDgkkhHEYUiyLMy4pODbDMCckIe1ragAiliff/Vg4AsjMPEUAXhVxH5xiQZI1MWoySgYypukoL4QPZnvxd/vs8QD/xYMWv74vfsGcxz9E99GnRJqEW0CrplSIlaV5JtmFYKMMno+Ie1EOeqkyYShAywIPxS1DMOKatwd5hLxcywC0mREC2ChRu9S6Z7FmKJZ21NZPfpcHWPuf3J/9KQ3hB3RUiHUBNnBcMDSiD9QbCLjCk8DhvfbhJ3/7CRcP2HwC+18P+ceso5AqDU24AJZrRsbTBQAUBV7gkuTqL9xFxzePdMLR0DDH/2MUD5G51KJHOfurvznwgOzdS71djUHjakPf82PPJRxmHAJ3TeqgDsbp1ZKfj+i90X/pe/r5rxzgvzS3+wXuyVs8V2QEKKxsqfUlPoYym9hgejLl5NR+s/kv84XAsg+QkburjaZ7xYOFixvi0DG1ynAeG8+x5zsT9ABoJ5rzf/vHmE6IwTTEXu//bDjl5N+22fZfsE2Oz3KzO1YYvpGbPGjlC2IwsvF2WLFWugkvLuU2HDDEe3sqof2vnwXxDBRsFMG08e4guRBcwg9HXwy4BrS/+po3XS6gAmg6Qn2OUpIczZjHLntmnNrbj5MaDqAOqB6w42DAddlcOLg8ldjJyOl7tJXbjjDOKDc+yLk0C9MTR7i/WO+v5OE7hne/oGTxNstD1H9fGJCF8dLiU4nNjIxNlEWPk6ARDz4Yqif8AClRR0yvBqJS3NVpNhKEhQTiFXzr7tFxE0cqOr4xKUDChdom4zZj96Ezt+xq0Jth/t4Pd1ulxEO/+hfsUsTFOd3z8m7G0bckl4PSm8hCe5zy9FhXfCFsH7TCZqSDEYRBiJfjgiF/ULCtVmX5kwvZTnBsNCJuboS8mLRo1cwS3IWpE0A8ioQMyZjtmXW22sUh4swADuXlLK/JwOviU43vQj1DWyrxXnr+gzyevGvXLbfvCs6a2GG9N3ryV+e2v3TA4I18vu1uXoMsIQQKkYr8/XLRhkJS36yYnlyEMFSGjqkxFylmrUnCKMQBCiEYLaOiRwxA7g3bHiKARR2/ou60LWpL8WazYup3TApAiNRJnBzUtbbB6JBboLA0Ug6QcPzhg82TuOjo7nItDgiS9YivXiWbC6EXRiE8CsjCYyPpEOtNtpOBLSnBOS2XKBIWElmADz4VGPkgOJCcj2MUdEF7zZ5gkngmeFkb5yrxIXmOMw/DZBZgxSU99Jy35PNTyF9V/XDpG7i6dW5p5fdn5ffKN39wyjpDy8mfXTd9n51/dPr6eeS9Z7x9nfv+WXP/5e/udVYkUI+Cf9pnLZXz85L6xH2gUljAA5+bRKkRFRBEROSOJBilVSmRYnkWwlIFSNJuDK5cB0MdT6AhWr2nZtgM2r5HB36Ioh4NABrNCTC6SagDyCA2b/igQb5TBY27B2hLsRdt9Upf3SnlW0Z/Er5JjwAUn+G2Y9nW29Yu09lasUzqkUqRaLfJ+v3S429S5CvT6sjFtzS50DkIlHEqD5ICbDc37MIQ424VuMzV7wHYPcTDqi52a2lYVRk+X+pFVYV6XmEhNtz91+hef63k7b9796zvk29/VdpvlbZct9Qoq32evvW14fSsW9pf+27efH0j3uZr8Ec/fkb89gcBiIY2CDYcREpYY6NxcC84gEuB6Elo4LQ4NkW5aGVI3MDsBEJIGkhIFyRiKTEKIyg1gDGQU3upKYT3PaPAIfQEQFwWMaRcXPnNSa5ARbvQnA24awVCKOXFV653LyTa+veVaGFpgDZke+LNSevvCs1HxeZBrk5iies8EESmSMaYotE2aduu/QXNxfdb8PhHeZyrP9cWW39ZchQNNCVI3L9yEyobwYt0tyTTC5laun5RomW+Nrn6AHdb65m35/P8Ivpv032il3doGv85hEMxXMe1vNhw/H643oOf+5CXv31d3k/fds99/4dnv2fgvetO2bjNuruvgfWUHPyoS9qfXB97d+x97EPYYQg5YrG4UTkdVvL7/m+4awE4RMVsRs4RIYiA4IRwWUhoGytRSkQSZzh1P7cXsZpajmoVLg0Hj7Rtv4Dls9r3Fw9giEX936Q4FAag3ZFMLR1Lqpq0vBkZBqEBhXg6g2TQJNSM9sHTYrR3vD1p9kq0JyOdQCWbh73bi2VEguqmyPILZnGJjz5oGn5LYvxeY/FevHyRql4k4geTim+Ze/xD7Tf/0d7QK3+f3J7qdJILXkCGVkkiIPPpGZ/MWT/88TX9b+9B0X/3qp7ibnWK9/IbrFaqtoJUN2+tnvM1+q9/8ayZ5xDDbRBbjfwBtjtsNheHtmFzWNdq860nc2AOaTSx0nJKrst0hSiDYorGQKSOEzUh7sDgvMrAspueWKn4IxUgYlKqDiDKrTWzvnstY+HecK2hoSGNJee2YGm5d4ShxYvjZZOiqcLyYX97UxkDtP0eGir7TD6aj0lacFmENK6b9f6eoaw9oWbDd4W+TTn3E/C83VizExkhERpV0VZxUufxD4FY8RCBOExmO2xngB99zbXT02PTJKQRNj10f1gPa+cgYw5ezjDvwOKwaUhAhPZAZLwBzf1Emn0tFfFKe4+m7fRgEdjJmAU1IoopDNUuPtNxzx8cH6QmshNwoEIRArsPKKNbjgEfGU3KqxwSJwIpwRSZ0Kgs+9xr+mMToeoBBE1KgoiWw3tE17k3IGAFF6MuShhsTjFsMfIDz5vIm0RUzpQAcUMCW0bEmA9K8Uz3Zd4rS2q3NG23aZ8M0ZqRcCfDIbPINFSLK0iPeHUiGUYKGPDsXigOzCBpEAli7A3p7tAYBhfnJ3q/8Re0zX+bzIfunu8ga0Mi1nwuZxzg7I1nZm69RXMUvWmiJjwgcm5Og/Wh1m06r6jOWurxgagsG4NAEMQQpbXWl0EplgRq/gqLt1EFDxIgGYBAybblROh00smdT5Y/VTHkCkWiUx5WXv0VG5JQGZo0J5FIRVzbWYzUYjSmV6n4CUjN8IX7omORFiPVtcTNCPhpUFqhXCSKjCJmTZ+AW9Sj+uJbD1M/zL7aWLnNPAWJMAR3zCz/+//ildGdvlbBir/+z5DoE4giCQIK5RgSzkMMaHhEAVUEjYnRYG6dIcXkjMiEbwwnLtdnyickU4Qwuo3nlu9gtb64UYJTMQZUxOIBAuLAsFKpDIPEMM3GO0izP8AtlwBhl490IkR8KN1M94aWZX9BeVkK/bbfKxuqwT+blSARSCQOBzRgYNkTiAqBgCIm03h1xJDtbgIhHLpuZevdERZSNq4oGMprqng6GOoEB+khgPfaPwJoLETQCvy6otAzOtGJRxFjJGHcRPmotIeai1t8LwQwnVKFhHYcO+bXcLmloc13PSiyNo6hl29FkzNjfdwEzOCoqwtgUwiR/kAIjurdwQySfPBriTYFImTbWLZfSPbch602tvqQaogeYQgibzH7ELkP239a4fGsWTXeOf7AhEfdh3NaT4wg81wLtw+cpdKgdKiwVKi3VKU39mvRwIJ3uLqcASfYP0ULu4bwqnmn4cg5ZRZKIDVZwFnAayKLaz2Q9UKDZ2Grr62BJZyaqZ3bRWW2tRWZea8butSWg3cl23QddOhxIgwyaNGn8/McJsX+mVvUTkj55s5c/5XDZwS00YmzlEJVi8Alvb9Soy46Q8My69EGh83gKAVQalaCnbxNlMbVQASEHWccw83nIpGFShEbXtBS5dA2S5KoA6oXL2EqsZdWIXddYbnMzYBA43dUbfvvv+BZOuP1EJTTKiNQdtYuuDLs9snaKNdsl4urj9k3+9HITOFLccZWaMYSkY6W73or6ec54bHg8SR4B1jTiY9DeYe38yl8iEvmXzbe1X5P+DHFq0hsr+47L7XZkiYgxK0dG0fsec2+7wAK0awFOy6NekMdKAIcBOpcz7lc95jwGGFdZ2ZLiLZTlV/mO8wvBi6htaS0+NDdwGR+xmX3C6kiY2nNKiUoxzrHAEWwGmzBKFB6QwJw8UlDYRvZIrNpPPvia288QK+H0ZSq4lplo+SU7V7N2+vVDnGDq3bvXF4nLrASSFZ1/h4u3tQ9sU4akCiL8mb0sf+rBgYi3mRaAo/dVu3IGr4F9+y6cWddpVlsC4tPuAF5B3fAEZcBxNvuYfvZEOXJcCepnJPXjLd4NS/URgBoKgZRGUrwp33gNnoGKguIcMJa6+EVM8OqMRA+icU3hHX3PV1PH5jiy2lGHqBgGt7iIq6afx2tRi0cipjWi487fYozMeKhFYECXt5xxmTuflnwuiAVv2BaEg+frXxcJHWOYauo5PEkcymFyxbaWrrse0tGb0Uuho3eu/3YJ0VqeSuwZm3XHOt3N6O5bxegXUU6KSTvaAFSnmELA7FGDK3Ymn5PRFQ0SRC0j1e3cnB8kTqwnCi+kjgLW1seVHFV/2mlL4+jw71/HBUFAd1EBWC3Zl7ecTTr9p3xQIAqA1BmWoIdXbljS8UeOed+i3vel852ESUPFwc+rMBdJMnzdyAGxGgePveTIsUBJNgQeiERrTtvVYRTfhqiJ9d5q6LzvRS4B3qVyzHVxz5GsZ4RsRdBWxLwrb+nvwxLWuScRN9hDKaAgi+ujp97ac02BvCjSE2n8hvuu599HqAudy7Anvharx0ggVDFaNoiHvdiRxaoSiyYHbsiLce9sLa0hcV2LtZdlxRjMlF+JzFMIdW6qbMpCD2y7i0pRQCim8JGchyjsz4cYN72bIv2gPNr2ouoGxyf4M7UnYUe2FJ6AxzNl2xl6ubGGJHbSUgMVPFkvVmF1WR7iL1XVCF7+9J4KWTIV9yKbIUe+757gUyzxbwEHPVVZW4tsg1dLr5jOPYu5+i27C5f4OiEn+2v7+2Ym3xfNURQEQmgco18H4ueoo8A4gRJYwogVmiG4PW+CmOtGP40zTQYXZuZgZTb53/K2wqT9AHll5S+uuSsTQB7ZZLKTHvM/Zr8jf+YcGg9z4XYPfdRuu4SBFERdfLHyznDosPI3yuRonrevAQc97WOE9kFF7JzcwQLADZ7al9HAZIR2LRct6n3ZiQkSWgFpMCM0L5UJPQTBAAUwdZJkCGCSEByXic4C7sNAC6CEa329uJeUk6SpMaqvPzDumP/Kb2PS2bP/YrefayIvZe14i2kFchCju9VuMDY4yjePowXhuYNBssLEkpMMBFDi07b7wHEMShTCKDIvIQ4Na91BFcpmQMuFobzLgGJojvb2i34WdOQAR65nMsLaOuXmWuSgU6SyvG1tM59FIiDV30EEgMqLqZ2kexUs3XoiQ9ASiPx2nwt8GJSbI2O1W5xSzJ4VsWHhCufpPvDU3q+cGz+qfkH5g+y8Mc+QWDv9nNZe3OF5UtYY3j/3Gie+7DxzeVnr87YMq5YutubB3EohFSgeb+aXNUgj3uukozOlQiIAFNMxUAr2ND/qizjNPbVD95Es0z9/1M3Gk9LD5XVxBe0Gb2WiRQcp6ANATg7dQcWgVUPQMGoLDVrUKIppQ6i2eMHrhp1i7KS36f0ig1vWsk7+OX9Itg0+TnWvZTtnX+tGh+33cntUr1QERm702Ku2A8nWP7TWvOw4O3lTCp8bWJ/X+6JmTM7nHBzqJQRERFJBmyqtadaMEPk5isaHm083tqJLnl8OC8ts4lEvrK86hPr5Hw+vXFAMZyaTBfX9ok6BhUbgeju80YDEqAO4vjATICShR5c0P1IS3C1Ou7AcUvnpbeRr3bxfy87u/YKZmSi/hAJ4uI/exMeGwoWTcqiuuVv4Dim2WBegk6IeGBFlDyqybXSABi5XeAcDia0LgLL6lMpXt7KwEqeu5kHKtg+lVP2cXJDdaK3QtlGRaxJkEAhAkzWEMCKPGhauFB0CED2IuO76DgJlAq8wNseRKlJLqey+cZ29NrCLic9Cluy4afdeq/d7+0xTnDioBBLC/c9gvRZ+lgAipDpHc/e3/hDGBiNAP42LwEHBOyvOGqF4Jkkk0nbiUSWyUpANrFa5z1de897PXRTZRa8kJWs6ttNstNhJ1Ibe+oh0bribMKsIkBpUJCAZqpEgGJADyMGveo9FglrBkWGSYDY1DrGj7oFJJHNbbs+bSGP3efwO64sum39kYPJFuz1c+1icl3p1ymGxzXewOcDSAmat2D7BOwTHPsR+qrWd9CkMiYTRnDCcYPiNLDqbFxzdbIZJyKbsv58DvsSq0xAKvAF1lYE1hmbSGiQigFJ4FrfQxOs810qPhb40UQHUiMqNJjMT38600a/SB+vDktHo7u2n1Ou8EdAG/3l3vcAxHFZH8oCBuk07PWW1L6/JiZgFDAJgXdjjFOnItrY+QBIh3MPWzh9P6x3YOuyDxHIqot+nYTWhJOlqpmvTbII+nW/sCn40EMn6xVQEgxcdGxP24TgdZcYfTJ9Khqe9oUREepOtm+6YSKPF1l5wbmvt1Lv0nxPAHdkZGRJ3+uTf4twlYc23HOJILBFbeu+02qK8pWJCZg/FOfEQE23ptO0tlCuEn7F4VSN4okXvqRbvETtV8FhezjgD/VnWXJzpXIy9whhFpfumknmQVWWuNotPXBxPMlovGcc4fhChmcYODWnIlZNtmC6TTuFgreykFYm0vq0BGSR4axBwjS2zlC3L9pSqEdMvN7EBE4P/YmVkoOtJppOp0jG2U3CFDsP4/XHbyqt9k519kDzCZ0n1qbLuk58lnJeOc4kl8B3/LpLU0i/CF7dQy63t13CRcy5vcb7fhzEq9zgMNYk0rM8hCgcy7Xj9otqXF9mbEcOS59gCwQBCG0rwVn0O75rABIm68QtF3FAF/zI4v0JwD4TE9C+Tr0lGkoGWmka7EobCsJvxLDL3+ru7dbi4ELvBIP1w+KJ/m7XLVWX8oHIOcg8CK6nElHQI7vmZRA4vUc2uuRRpMpc4cOFbrDJcDsik0irl7ixgNtAsxnzVtn841tbEfvhSx82gWG9HuwJ1QMI1qU1WHsaT9t+h5tYWXZwq0NzV5KRQJEmBBrL+9lSzhaev1u42V6nT2EPseb8XmS9ObH9loHR3jhEvoWSoYFW0IUbknCHjYgjw3tuaA9mIRdq4VhjWy+/FTmCt0SrfIyvzUM/anjhL78y2LhA5WExgUXVaO0ESWhCawBr8e8ZIhlp+83l4/xQzOy3F2Jf21nliaA4xeLi+q/7Q7740+8q3Z8bllE+b1G5UEJ0bvsJNuzf2suhkbUGUtOzh56vdn3PuqUQpGpmZB4kaaXtey+Oeuk8+iwSqQchPX0J4ElnFvc3uRC8r+9sWbmjLGOU4viEVhEbgBIkyDaEgHiga+uWrbs2BHDYzIDM2pKXSgLq7+r6Gg+8HU+/rSASgs1utJS3O3LI7Je1w5N93txubA2voaYa5GsoihxBn7ikaEa/OenklovVkkIm4EAksK1uZ+moSJd78FXoe1G55+9+cMnLcqB8gbGEFAJuznIE9Bq9BWxw3X1dUZcfWrErCOCImT0tAaAWbXeVJKlDP58ezh/5spsViT0Y2Hw/e44dI4aNelbax7KWrmJ4nUPnGlw14rzG9+Ju/QgJOcSPQdFz6wsZUeQuWIBlLI3V2/JJrYHzz9UPmv5wu+lL+5dOOQqxG8YBpEmNiNKiAOxMe5QdAAcHBwf5sOUR3A0BHDczifte50YkoGXLkYH6WTP+5w+3/97f/dXTizGEmyuGdnUPm0cieZgUk1baF9U96b+h24xqIIp3i9t8SUQ8v69pXjR9zS0XMrbEllzN2SONQ1lZfm66EXIjfWM98ndfnPQwf/OXLnbpan//ATG/Cm/4sQEjIjRAMMk6KShoDUSWGk3CEHxVLlAnzEywA6+TjdEeYOuhHsowf+jn5//S//af+Xn/wFu/enf7TemLaKNyTE/GqMPenJ2WeJ2yt9wwthUcvldRJfIpleNWWSljHUm1LONZpqyoHUkdTSCYnbZUP0mimBUePGh3beqFFy/9nynz5QNFjSpqRITCxrCCCH1fw/QmRo2IHeXag3UAx0xNwH4PL5U8FwIYf4rMfKq/9eb/wHv/7L/7T/3gv25v3q5e0jXyb4YHtQJ//9gOi1QaQ4u9hgjTJiGCCeF5D7k/HXvc/NtHMlbChg1PAUvPbWxHgBxBOp5W3OM2fCFdHyz4Mv5tS1RFY6gSoGHb/f1VTLHsQDJ5h6NGk9mJvQL7sZAg9bqZPe23MObuWuacs1ZmPvV3ZbzJw90//GF/8v/9p76vD58J2xX/4b9v+e78O3k0RD1268BdvyO/2k4h0k9cFUXPUhpoz6Af2W+JRHsfbpnfry2dyMhwJI747Rbu/jY8FFvo4tT57ukjvve/8NXDfC32xbeoGMCH2waBj+Uy3AGD1xqQul3ouNaqUtRoiUG4gHQyNWTk4lzOLs71gMa7eng3/0c/9N8aWvY8dVeuqF7cLjpUUz3UrnnlE8wOa0vfYqH5/7exwt49EDVkvILegz6UO+nvCYlkDjfWD03KycvBlENeX+SPvrYYJz7oR2bovtUKDyS1/upV/Fd/wgJfpF0wGUA37ybloGzbXQOaoCRErddvgQzWpjFuloBMmYQroa5m9hVgMt4uNxfnckQqqi9xHor+9vUf+2C5h5+ftcdunGohlDcXll/HMhB08Ob8mYHknf7BD/t6Y0REQeM5Ijwi75GZkiByIASIqTg43Xj35OAg3p48/113+oOteGfhXXkp/8YweW07IH+gYuISVFqfIOwyYnkNmK4lKIWrlt1kbynYFlOcAKCbmVVsJmDMolRZfV9c1waFckVQJ+7vuc7y0J7T/8WsN47tOZXvd3CHPYaNkgGptbcO1bq1/88lh+bXkKvTRXkUi0E9HdFL9BeXsTxMasoq8JrLYf3NczjDxO7x9vowf9T/VefVVz/wXb7x6oX8Bcv+/H6ExnWZoARIjK30rLodI3aizMCihMiMxHygatNGINEAhJhZBZ0QI1zOOXeOrxoo5ydQeQqd3ubuytquAIXrlu9z3jKVjSWr1dFK1BpupdncQqUcyvwDH3d7fffnIxJ1VMl0vxuSeSg4IQ1hZdObktHRbsnWnNtvh+eu/+Cz/8J3y99tp72sfwU5faFLUzgQmCMk6vXFwygBSexAwfbgEgRXAwL6pJgwWksIOka6fg0AZoiJCagF7jkHi5a57aCmGipBheUeaIHZXlK80F1dvzhQ5E5TeYW1lK2F6hN5nsF7/qd/9fHh9lzRn+V69VzOqJIonvTfjoPIRh80r1hQ/EaGSjr9A2sz3dvDjl/lr/7lP/LtRCoP8re/uPwzbQ/7AYxFSBAYQalXy5YAorJdrocLEh0EloBXfbZx/PYNEupEDC0CnWJiqLTxIC8WAKJ3ooogXVw9nfnGbR7rqjaXXcBfZ+ObWfdaezI3dLl2lR/PGV8y8DYWEibJPioTSpK5DNNkX1htSo0rY0CpKqQHQderq4TiDzvEzcXhSjj0H5AsQ2qAQPzR38Kv/9fb/7t/eMBVQ/I6hMK1gYLsNnIvceaMZpKjxnbS83EJkcZBJLawVPgeZ2a/T5VxDs5HSIE7UUuZ693R8hEuRnjgyCr29ay2EDt04ptGu6Al4+bOc8Z5B7+UDMfBjCViYcEgolgwhZVzdzKEig2NOKHCcfE3d8LId4ib44PBKnucpgviKlrT8vZPeDt+9BfP7lvzHnMciirl4v68v5iRN/qNIFVcnax4zofW7Djlf9hwql3AjQlmVmmT4LphsWAX4ESjSJxh85DyMPXZGbLF2axWjvZaFrojsPQL5rWFJevPuK+3fEvOMFMHFDFQCwJTDKlyubelpHpnFutOP4voyraeVVAS6CAYKqveAemDpYAOqsDoQ9TlgOYb3r7v4QH7CKfkqrDdl9AX26OHTD6mauq7PMuD/11Vi1JY27kYF650M/sePjUuOVg7sUR5CeEUQSitjkIJyaILHaSqufn/X7zS866giLOF9d3wubalxUwo0KCnMJht3m3Y6kmkmEXYxdSuh+muxuq6nJ6OKrs+IkoAy1yNR4OhfOSd/T9u+qC8Ld84nkgZlPha7m3BRSDnfH7PXmtVhZx1PycnVJg95TTGhTvBzH4fOo3TWIABFWWRVcGvg9kGLklI9c7rXAq1jrHIj5BcHMk3v8O9Dxl4XnLmspDQxCCmqDR+1CuF7sImRLk2v+5XayyKX8+u71NK3xIC80NCO1YtRBaLSN8wj8suq+E9FwSB0JX3c9/nvq8NG4JkT1UXD4TkLzbGKBKYvgspaEofU8zsgxWDqSIdHVF53T1aRbSVTX+enNwb68Pq+XSUZIZ/L/Yu9r5tZ8E96rx14xe1mSBJOknSbMYKPV6QXv7Y2SivRzkr6Ftj0030FTfAMqX1LSsjOkwHffU1c5qrxtGJ2vBEaKAcNEJloAB9hkVA/ib1HAKh3s7OBIOMTN0CHSLDG6ZJMjEBkxR2KBI82LhrVALMuy4ID5tYly1WXkGkOWKjeUEaA5/Pm6/5sbA6rhKU6HmoBRLSIpRqo8o/ip5xZIedc79O/KX4/nAItGVUjIkoAjdRmgwhun/EHpTtukWPi9DBd8kalo66iI1K6fs+ZJX0nhmSgPOXkqEACtEy3ZLbYbAIV5qJQV3QlEgzHlmi6M7Eaa6NwaFe7Jhk/w4+8ZK5Tug2v6jfBrtKVPoyA697oxcEM5HnYxQgPsvLPNbNkRy1aypyzOerJFf1v6tIYNwnbj4ICMv5NBoU8qc0OrTX/6T8BPFUisU20OjZ9rwv6SJ6G3rbo6QneQP/uZ2bJAiNiakVGrcaGlnDTUziOG1GFsjZ2ipPcJCSFkyGXqNhjIHGlYdjUjx78XB79V8i/+F+vhtfrWqhJ1AjEEQDmErkDAIlc8TO7oJ3HbtY03d9n0IiQiMsRCw2KmwYsre9+q/ZWk883PHQKl93XXuLRs7lYh/6vu8V0XNAuwS048U+ThGhBRpObChcvUxMwrjVTELK9kQu4LIg+6MQMXvUA4OibpLWAR7hBFgge17Crrb3Y3HoNWQzAhOgbzAIMc7J4tMoXMEgXSLgYhGiTU6ZEDcnDIHmg8jpR8QnhYfINP+E/StMWt7o4eHUR9914HO2ven7XvX9RXXJ3HUi/Gd9cvdyH6MQteQmULgTTex7WBM9mcHMHuqOgGr1nqLPR9Wqo5TGG0s5kDsgMmLNkFZ+BM4EQRwHnoee5wXU/KJAr1EBuKCi8iOOeuvL3LrvutTkNKYSH0L0bY/jf1Jq+FHMNtB2qp/li8H29mIP9LkUOQ7CHTy9vdA8pJQwtQkEEGliH6xrWgoP1KoCdsRrwiNDJVIG3mFEuX8BHa559jYS2ferqo4kADAOSCXwosjbS0np+Nzv8YlN7ZqmoIu2J9e3VV7o4kZXIuIDE6WI9I947OYwyQau4Sy7mC/W1sWL9mKPPqPvoY7QdneYzuHsQxx2lNe4hkBC4SZWyQE72TKQUNLhU3lbxT2i1ztoBHb2G0wuoYHD5SRXsgZtoZMw5o1u0oiBREwkFlFClONxXpfucTCcVdI9/RRdsQJuTsWukCzNpUgg0/2TFsSh9fgNTrvd8pyddbbve9u7gN4emSm74HDgvAz0MhghWjax7HtkYrWsXRMFu76RrF3VRLyQxUf1SMP9CoNgP2Eg2D+2mwR+KWAla5KQzn0OT1KZKCMQBTYlzSJe0zxgIk2TDdO4HkF3DwTHSP+tRzhEBIkPRXa45vyfkopNSUWgkDQ9Yy5WVQpMCLbvL/bZ4k6L3dXhp+PFHYnyHERK45r9GiXUxcQqLNXV1CYC8ElaSRJSRSRDtUwdlSLCEDVNSZAyZYiSxX0s+qOU7miKaFDHeitiq6pQBBByfu+4Uq4e5+Kk4JnETBpGIOPW6lBkBZ6+02P005RelBTEJ5onsGG/PxYuViRgLqRyaeMJ0K4+xbcmTtswZ3iAoShi6bGwMtK4R5hYFXPdDMSAtlSr1MbCaNK9193v9s4lbYUKMUlNkuDmf2F1qcfEp4LVgUSMA08EURwo0eliIidqX14n+pXfbOIvqwashMtXrZIut9OB5KgIRqb+pzyuHJLdwZCFmJFcaB6eUCmhItFYg8TfeCXgYs4p+7Adnu6bt4nWcAjsnCXxCqxsX7KJVaLYlCPNWklAaj3jirsGo3m/arDYxqIAwemiBkZIZVu/v/VAGUjrJgu0uAWBuAoZPYITjl/Pp2uonjBB1IFHimPO8e0ef+EHd/n3YzymAYKZjCIEoczmLEQ0Eo3W6Hs29WAKtHJOE5W+E2khx/IepiZbYuIApZLjYQybc/oyQTU8zz3PpQewZJOpSjlqUaIjA9EQAQET5u46TVquDBZH1PfiW4br8r22/USoUR75yGlACjl4hp+Sx/cH0v6hMu/+m+10fjQJJSBBGMgkwcj4w+v2s2+Es+XPWffvqTcptvLsX0hNZDMxEcuJXKgaVRLIEuZTgJ56jy7de18suhYdnW4ViMRo++iWW8XyjBxNuuxgrT0DtQRXyUSasp8ddxV9S92JJq3gcH0GDKs6y/etJ81/dzf8qszkErtkditDWsaMbCbEoBLtJKpFDfcodnc8xvU4lme5y9Y40mBij1CPFQ1rCxAYrNM9RnWk6Pj2ImQkl0EEp2xpDNRofqT1cTvrbNu285usaxxOfxLpHBMQ0t/O7zlNWrhPnYJ1qRPNS2dZ7JkOCyuTB62UOnu3245kcAoYRIw1+r7vT2nD1tI2d2ofV7x+lRxs3HiCAwYTq7DFcbWADRld6S7RO9dQkSs2MiNczLzQWm9VmSATdQxf+eOd1BhpzMlrdBmeKZlB3AIyOJ9XIgJoodpGDNU4qboDXDV/ctULLXOFsQqXOFyLoQzlUCSKJKJXR89ThNq7w7B5sfVhJxgfAgOVMLEKazQZCeDAbgFdnEPGG+5ddLINe1coBcizTFOSQUyS3At5ZhmQUkrNdNuCzL2gSzORccIUdLY4f/OciMNAM9ZILvbdBO9++UsdqfsEt7By5vn9zl/+Q09OPDolZZgFGj0ta6999mGLuhRaXAPExRFk3NHEKtFALk0DrnrqjutgjIVu3qWHhdM2LxgOCArFHHv2106HozsJ9ECheBm6Qzf1owx2BzgTup/AhCgHD05btZAlwf12v8vlWiX1sBSZWz7fd/7rv/LeOWESjSFOyWyziZLyqvi9DndEfBxlbVxqSRfi5UlMrBKVaxZ2aKKUhkB16I3NbSMOXAv2ADwBPmQpSFBvI/br7iPCOUUAWQ9F4qiQyLEhN0UQOYujup3nCEM5fTmNPPqfxLir252foc4k8Qx3xXl3v+E5/GUhgG450RDRZp2EzeyhORp7hE5nZK+iB+Vjh5+FwJQCJia9ErKvZgCzWGTXwZuoM0c4nVZGG1ZXutg5B5IAcRtqAKp9xGQ4gJobQLdzS0S/4TfPFI10ZfVTqIP6GdOJic2ZZXMUlg8531zdk2zHyrBMELjkqzn709cDvvxdIXG4HGwTQviqrrHVqkhxwGdn+UuklCJNMfzRVTGlCBMTork/P1J54uEG2HCYop2uFtclnHAe7D0sGIBTjvRRc9v2t0k//nnS0BrA3JNIQgjDAXxB3UGdbsMW5uLp6YMWdZYPXVrAe7k4ckgeC2Ztzd/+gZ+UuVWs6446VOsItVePRomAyx5CeGtTBxIUlkeobrJrSjjEdDOxD0eI+YsTa5yI4JInJGJA+0TvQXdfLDpDgDcUoRRqSxhGlOoCjpyol0AACKc1GkiyCgNu/QhdIABR/KraW/Mpg1nKxw26p/cSfbh6LNABoHbyfz39x1he7tZr9UhQoNVmk+m4leP6kpnNB9/DbnKjQdbjV6k1YKF0VD+o3sQq0QocTzedHhS9R8qUwZ4KOXUP2IPv8jKKKaKDQ1WT/5eTd+KzFgtmpufQc6K/uJCwDu3YO2kRPpxYkPHm7qrLSVQhQZK0syvoarfAHQ7Qm4q4cWvOeA7xjaLYuyr2MdGUoUgggiRB21/yu9+c3SUmrTX6kDtuEaCPmZgQtYD53vGMGUBw7YJ393iy6EgBnkgCOM3aA3q/78pA4j9hGhSUImVUEBzYs6k44IirakB0zkLqQHjoP7HeEzdfy1U/8n3vhYtnP5+nUU4zkMrgQgNVmkKV791l9+Yf+NAlscxya4QlZVp0AAeggyYmoKx0h71mDeakleIsEloLY2MhTpOd9wbUBgqwgI/blce6JYvlmiGy3vu5UX4u1STisExjz4GtO3pGkbOLbmozccwBKV4Ko9gTtVAuRkQU1Z3aq8556QA935OxRkK0DnWsIT1q0O578x+a/8n50xf6ra24uMuCPQA+AqTFxCCwUvKYiQOc6wGEhwDVDZwOABQAdlhwZVXKHC+cZecpnFIgWICDpIfcU+807ojOdjJE/TpBY2LiFjq45dFvNVPsWLmcO+IjhpUi7n/3o6+SpyH1UAxFUAGIhKd71dSEsZjqhZf29eOf9M1ONkWhaOEJXQcAvABQZWYCU2rO6chVSQju+BubKRohp83BtR0lELVYBFsZmfyzH8vJvwhPSkG1YERIWxPuy9HGBag5p3LpSpsCGKi+CSRPfvOLwBbU7S/zBStDqywP0MkZWPnWMcogdbzWNoGcCDGW+FC9Px5/xf1J21W/a//xf/9WcksXF4pvxTwUjhvgFdAVZlZhqB4ugTS8x1XL637XUYPknGCKq0DTCcL96+Zkb7DhTahhz6b25JU3QLxyuGYyuiNyKyfvNWxUiRYoGNZeIHPIFLwP3sudYlEqXLARHYeI5boAwip0cZdaWQCLhySjb2NfX9/ISCjOKaDisqsw04e87wiu28EPDjwIwYFhAA5ZWKYpqDDbzEyKXTz28dLwvhEuijvlzUd5xFCSaLuo+WG6xdRch+kF6pHV7RKdD+kEQQrkjY/dyW+ORyw97EnI+9uoIHvUxnDXtwvuKgy/ll/LL1xknKXoJtkE4/T1pwfhj9ChBE9Rx4rj16oSYRASjWPRGYyeXRcIVe+rmC/7f26FizZaI/fUb3vAETZ5xy39hNRLxo0fCirM32YmWEC/sFixUKTQ0aKqPDVDqgaFKpyRU/pVyX/nZOa65pnxp7sAaAQHVxc0U7S/yq1H4oXebKkJmecZSzikhXTc7akvqDAPia1Pstl9p95kwaqtWRNQGAMCBjmFQhynjxre5Buy9yrMJgpzM/OaHTbBBU02/QrTKlNxfdSWucVb5+DLaGvAUks20V0vcCgAWgDkmZnEhcnHIhohCUED7+MSesG711xPLrqdbLz8CcbuCUYdHUvjjkFdOPwx5wC7YTfIOWk52NccdhrBIX63uDs9hg1gurFV1560tipoiAKhSwiiD9iC04WU9ro4lPK+EhjAogGvVwJfz1c3P9lb/b/fUpryLzy/+UeMoYQl47rfffEf5HCoIgRxArO2e922XifygWFI9MOCZUAtQCrQzGu54oanmokH5ix+jz8dIkJO14lTqOs5VEK9auuor4VBhYYf82x1UDKzttDImyW/1diPm93SvMiQdC9gpoxlG0ELRMMB4Y2gKR6ScR4DBNC5nKwoEWSc0NAjDgsMvYkke95r/70Zo0FjB7hjv0AVZ6/7v9L5Umd0YGBcAnbNu4VWJynioPiB5GHeoUESlZ1narXZdMMjzYpd6I4sioqwoKaMDUInNMj0IBfCuigJy48HO/LwmOO1gFJQdIq0SjzDb6/5hNSNiMpL4KfhqC/ojY/b51I1fBrOFsvGRaL1T6uJdNalNv7rKru2i5UB6U0xudaHLTForQKNXQ7eFHpmGMrL6v++l3xuZySGI5h2gq77zjm9G1HiOGi5zHs0VCh7u6lVmNVg+IBccYqALlUlKtLvg0XCNbFkADtzCrRWTcShDa5ZOC40yDZ7Lu7d/A8e6RnDpp17SFZzoec+RxCdsDICWkSk4Bc3jJ7qIWXbkJFt0bysRRrEK6NtWRXq8c2/+rtPGieRsGAAR08IUs9b2e9hu2u1v1DuAERVWQ2DDqHOquXWrqkk0kVnb117UFOj1MemJiB5df9+c0hE53HeivfZwe+Es+BpPmYC5Qm1q6nmBMkMLuBmaXmQ2Hgs8gyJlhw3Xy/p1T24C0XFUMV9Tl9DYCERW2OtRShAHYoZQSlGeYqx9tzm7ZmErLXK9iC6vqW4Zfxw3atvpAZiM88ixiBvhkzsd+2hodWovZJ9y03GXncwrvlQBiPeH+Z1wR+IHkc9gEJTwxIjW01rDJtBuPtolJdIzuHRxpufxwZnUXVM+4UEcbBL1IiVr6An6kBwh5DukUh6krikI/Aa9dBCyfDo9UuYCBhE2rB5UhbiI7AtZtAVfRSYt4j5957YKGHoO75PYGHcQu8jN79pW8OpCIgGGVTJvLZ7p1PW0gzwk2VlCLXdZZg2VnqRXx7VYW/GO6TMBjT3J9ZHIMHyilRyXsAad6KWuLuMshCVUCEIQjcixjbKoN4kSrKPv6BIBBt8wnB5WuEenisJ3aMzUUZl+4rHsjVURapBsF69XXDHkzd7t/ZmD/+mucVHqqGowln22pfiwRSUOW2lQ2DVKqVUGaWrC57L1JPlmZP1iZGcVt0931SLR2gxaAwHIiqxzQfIunRTQC0uRmz7JvnZUep1kxOixPA8XNu28HAJUdex1f1ed7m6RzoMu2BdNHShJbNSbagvIybL98t121kapWx4emT0jBN7klSqaSGeWdzd73gLonauEgBpE/XGirbjernn8ofaaviD5VL7aId0lt1v4qmXlfuW+BQy2vd5fnxpW7q7uMlWOw14ImQy0fBb+ZjhN9Hxya4CLM4lYRaRuR+w3aODkvHFklm9mn0r3gcAX5qcwFB/SDmxh3jfPd69CFJqXC+SuvsplnU4U3RvHRsU76gvUIfvs8dgZDAROU156Cb46BIftXpNZLzM3TsZRMsRIEbV3oXI8S9KDJf/YWv75NL+gzTaG50BR87Nstt7BW2kDhwlKDVKGydiMdqcQ9xi+o5pOhFqVDwxrijbNd07PH75gwWgAwMndO5Ui0fvPJCanlxTI3tN8oNLGZp8TUF4sRJ5a/UsfdRHWe6X95L3CBFy4kR35k1xIVyT/ckXhL+xdYAl6yC9O91WgZKeNgwRkjoqvrrd7ycfTUK52bvgOX7hzRttxmAqytIeHz4F7o3k8jh3Y/61C0YQsyUMgi76BDbaFzPb+8EVCzFjXTQdCF3eiIQmaPhBc1Gni8MdE+RY3Nj9Bn67ltv7R7H6CRrwvYFRG8xuSW3sHrmr6aOXkQSEa/SQQX2ZtncKNBg7IJionRTGJ1HyM9OnKJYAQhJBEkiWrxuxZM6k+FKQc3lYDJv/ftnRR68HFa1rt9vq0sUUj3mDZV60DAuxMl/KI77c5KIwB81y7j+/Wh60EWDA8t+6+vtTbLC1hRBA7SiJ+Z0lcrtrJy7RZkyvIKpCqnnzVxdUzOhP1W6zddn9+kL7YBxPmt2S+u/POfIhMejdNV4qGqHl96p7q1GGYpzx3tRZw5WMuwaXwRfWtGzyWHDRHGc4fHXpLYV0pIqgI+Kzn9FhfyUTSISRYs1OlyYjvJg9ek/EBxof4n5469eH3X96IJXQQbkxjaKGEGySbVAS5bLqkdPD3teHyTt3rQhOJDFYXi5Bm72R1HPdTJZGCOouyN7q5VvGE2d6+ZzmPHqyrtcHPYwmAJvNbkn9c8NXLtdRCQUuIgeGkUFReg/Uh23sRPdTnHqswJRY/fbC58EN3CwMFwBSXXAASffteniCF8SnLpNqn3PmWSoDx/fe9amjH6OQpukG5YspOFzx+OLN/narTP3YRdsZe5dsPKgMTUIQn/J5gMYlRhfykDm+mnpmiJl8QeEQQJj2c+/zZnd4XkaC0Sro9fS9J/t7e5cXpLEd9XGl65BHFpP+Hc1eyK457iMWfbkFOn5EPY0z7PzwiMgIxSEjPRGkZ9Sn0ID4yZEod1zDCs8gKAYTElwPkd+EuwqC7lB+3aqLD6Lfi6SWYm5Xn/1O0899y+X/KLTy5g39eT/UY81/MKj/B63n3kuy4f4umm3Q4iflYmxdQiVMwhiDrbxF08y254yxgvF4WMksXqJnbywZdxZwQ/twGubatOzAMstGvvrLNvcP3htIDY+1pgegKYNqlm2ItjhrsSY+op6/9ZwsY9giTZplMG5AW8FlbF9C6ZGf3B+TDB2T+VJigDu5ctyW8i8R7iH1c2epZS9kFEHFESou80ja8MtccPQ7vNFv/XnazsVV1z9VePWHINOt6cyLNKTLL9y1wdB8sw120xBdwBhdohMMi5NDH5wUyjljv5iiOBHWCtgm7jGe3LB0KOdySscrv7g1P3pjvTktL2ZJPjjlctXDx/wxFIOE/zA9ALUA9kNqclmoy8phcMlhIzLz9uRJ3m4xOFLcD4uhY3VCcbyhhM3aYfC5HmvVTR0xUyOd5DiOzENktNql2iBt1OyH4LBL3HqTRTRMpq6Mjtu/0276J9H2f6PuRsu0qRQtHQwvz0y0OJlJmvjJODNaV3BZ+wy83TNbnaEXQJmzMXH44deWkwzStX5WsvxyeO80tcd2S0fJB17r00md48Lda4O/P6urAew1PZSuvWCbUcuAI4Dgy1N52vs7h4w7WTOcJEGaRdyl0c4S2bn86aT8OT6OldjqoIQ4XhDcMpiJvqsHo6pE6i1xVxLD7t/2iMYgjbNBDkJOJFHEn4/AdAzCC+vsuxCtTkTX8cEzQlWVMUQVe6W2viqIbDluF8hMB9JSrOy8DWy0mO3PLEszB22d3hIZ0/3yi4YRuy0/bFyM674H6FBeh+YPIAjejFbqEhIGwvGHm6ffPNJJHVuRLesIjeQPGTJ7dk3tzpXBT+tOoQwq010dIpNBzKsknaoiQP2j4APOILp/W6GIEf9v6mGE8lzv32qaRZq8d4n2J8KISWEOMHAs+Cphtnuvsp56yMZSGY1NjDTKW3DTMex726leOF3Dae+l5XTvs3zZ6gqWfB4mrou+e/eDI7cE3BKAQDUV0eEkCQtrMYxH/OFpUJFGmhSv3KORfJR2RGCadQ7xrt2KbpUDqXXSaS3ctoTEWfe4yUwhjkgGo0rAQVyP0ThXOYFJ0RwuRZEuRxoOdbGMfbTfpD8IWLthkNIaB0YNbkfxtcuynxpGkw+tSRBcOpiS+WqFYInLlMhbXdpwSz3yRY4aanQe+zHe3V17VGxIS3StEoBA1Rbv7IJltwVK3jWzMkXV0z0njh7qQPqRUzsEVRbONXLSuF5IFTENUgQ++kqSGxqeqcdYiUh2l3qKcU1RDweDYSkYwGDkNhT2JROV3vO/SDq/ZZ926yWoKgJhCdLssYC7t7iq33SZZzd3cX1L1WKV9JqCHrlscTMdHl1tumvB8kPWZGy0fbfNezQMtuu8RdedGGXLWivWLyCyQnMJQKli5C0+GkKTZv4cI6SkR5d0bk9qGZEi4YQxFMaYFEjjJ0YCPnjHen2GFhMecFhCWuIdLXaP0Kil7kvHB6UUF/0jbuN6FA1oX3LvXZ7xDw5d2l5SKqEGLjxkeMEh7CKhm173GwUDdjrzNLe6DpfuY4tZ2u+N9Uvq93TaHxlfbxEMqanHvm/o4J/MD82wdpc6vsib9y5EEoTsLwGoUHicWAVkWbPORTQzulf1pPcMXYPHm4OQHq2e7h5JgFpMRjYrgJUa/TlUP/wQkiTVu7BGKFGUV8E4AQbDtrW8TL1JFJ+m4BRmQXrkswS7PiXZZ51OD1b1rTGiG5p6kG09vsFOP/RlZnwo8lXocdLNprAP65qHS7mAbrz5i87ZwQWXXs9/F0IYz7xm235CKJzbtbghQG0lAKVqXLGwL3MFroW0TOki3nNPkLfvM95J7BFBtMxixVXS/TXcWk22RuaVSSDHK0Vu4qSTJm3cRCgkoLgLbgiXo2dXvNro+i9Kyfg25pdBgro9MT0KH6swuDAPEg9cDkW0+TXTmY/2kl0BKi3FIQWmzeuKg3vHW7XK52hrX0qpNt94dLV3LITt1BPbme+glVFqUjfNNSBBWwlA4UYV+IPLla0kZnf//qlH5jhCP6IfASAZGpIHaA9xye/Iw5ixFiGFsy6tYoDY0aej/CBTb9/3nBXHvZyeFaWebjgYIlYQvWWRMBxebKEtWs4ZrLj+0qntl9glSGkulqE8taxr/W8aL/QKj790oYno70wjC+XxlT6caEPH02k5Zr/Vx4/w3gH3g/RIOfXIdOpNfyEi9e3fiC1OBORQCSCZ/Xm6GSyMLmzpgR+YxG1C7ob3dMQXEjk2D+/kzwhiYmJ9rRVgdfRNLhlpzJkXOeIcpEp379iwYVWLhkt4lUdQwQGgIY4H4x5Re+qvoLhslaN8jKnJ9miv5peXFIxJoXrsbsO/5VV/2mmrWrMiZDQl71dG/G/7OJ/uTsdP+yxfHvzq7rsuXN6nnrpXNp6oUgS+Uc1tf20EcKAEAHCQodrA48tEtDNPoSEp/h7ZpetoHi2JQzLXrGzJMECPhM/GahYK1CiRlhQhmQv6NtYto2ATiiov8cogYuhiGIRSjZmBbXrd8k3gqi/KE+JXOGWp0gsJg53X+uL4k1b5WPyA7D4yBVvf/ScbvLOaX1pn6j7uPfaDXL5336Hce5Jx+hW0eqHBiIU8NcjBRQyNX3MJgAzVCCb/M2koO/dYe5fokzbh/Z5SLNGXDMngHrfoYKZb2liT6I66SXxTzAbBcG7ycX0yIkOC2xIsslHSv9zj5L4TAMNKHSNcdXJIPT7t3MpEjSb/yvLnroVVfKFLmMmUMIkHHd/1/i9Z5seh7fjUvQgkOWXfr/pF81rn2ECv5TzY62+pD2UYPMk8+QosP/r8AKoRIs5EDClTYV8poEqVruYriF5G7ae3rxZnZaRZgt7MD3GNsVVLggBNIuZwzm4xMOqam4QiRHA7skm/4z05EPEelaK7hpWBj+6a0HXDVSAmUWJ9+6qyK7F27X6ObHkoLeKQqCQm55mg63yNvOM6PxwgwdR4G7dNrzzZ5n9gqfOX4ZqLvrPTSZk33khbf4J6ux6EZOw3aZ9AlPtiiEuoYCmgsHYQg7EQ0stJFbmppxGQ7VBJX8XTxuYqPsVjdTNHhHSDlIufWALlC1t+w5cvktzJmLuly6MYUT7K6m7EhFYhuoEbYh3E+leGvG2FFfC+j38qqnAqXA7sZk5b8LD2svm/xRIv9VG2r55UBxng/KP7S/4Lfvu2kxfHznVs5oXvUJbvWHmhotBBAXGYwBbIDWm5AFWWAqDZSjxEHyJj2bKcd0erKYQEZHAjXbJzVPecYLOcYT0wTqrl0Z2YZz6JBJz0OIsGqEo5SNwjzt0kGiiVaZiEIqEFDlZvqbxpcf/7j/DqP193CNQcSidzS1AYG13Kt5/4JM88veqtwW3I2RoeP9J8knn9Vxt+9Cdd32bFo3AJPC6LxK3HaFoj3NzJshBUUSkgSS0x0VvjKeoSGIzsuGOY2LTCbpEIHmO93gQeCEwevTu3slTX1PuIydfolJ3b3hkKXyQ8RC4tuv8iJCKVNsopRINGq/3R5Yt2tPyu1bvc7+N/9QM4/m7zkzJNN1Mqzk6t3XO8Df3aWuKjLzK/z2us3zebSsLjh8ZJPig8uOLhtvKZhYdfbtb1HKcVABhFUjdJ6KLEKFli+SgsBX72Sg9YGV1A7YL1cjImgABtnBtDO3jUo4v3qOo+CKbfz7Iwr3YNLoMjC892RitlEmH4Au7hqPsICqI8fRFyqnqCMklSSdXw2oXyrT+y13z2L516/7f5S0/MTVla0EjzzI8tPvhUz7y42IPNOB9p88cPN2j86sCjStt8VQlm81c5kSQTc6CI9VoGO8ThWTpUEwCUlAJfc2Y8m34/Hw0OPgbpuwGt5TbPLjW2pfCyStgBXXcvz2d31DfgyJomsMi8L41kNmc/zaL2xFZOcTNhKenzkfKV32RkuskYUT6uc/TUx//Viun/h8VmXSCRWddGm4f7/7nbJ1/IX71tOHrSfHb/MEPCtwaEj20brxBD6dH6b1Cew34Qm1YAdo4AH1gY9bqmBLEUvBUBzWAw+rKytm50UqkB009wPiJdJJKUPOSoC23b55w3lywernmeDh1CEPcIHyYUwkFylkhEFmUuwqKUxjNJojjYXb0f9/RvdV/8uuf891J6MNbLgMJpe7SGymqfS79x2Yf3KP2CB46E1wsCvl1jWcXzKXehmT9YGzHoTM5E8bZHH/hWTQB0pCRAClWu/axufHYgexfDyN36Im/6Ghop0m9bjwzk6zbto89iUOKHH5E2yeIU9i6qMpQmZSZ75T6KX1gExtoBDRBz7Mp4LghmNruD6rt/p9T2tS7+n8z6ChnNjy4PsX1I7+psn/zqwP9yPtaLv+bRbxxw2zAo02B4Jg/Yt3cS0JOEplrJCWxPTLyAOSThyTECjpQG1Fxxpuhx95X5YO7ee9cug4l186y0I0gnQyWY0MMDS+he2bn6FcgaZpEfz8hZTlNcw0/RzSMkhSpZ3JFpQ44hBpQljsKcZuDNv3X26//0Xt/879e69Ty1OS544RPbXlnG9dW/eeWBT/4i+T87ZFzZM8rNvji9izATTnPPrSNgJjCZMLcCAwkdzD+ZDDwJHS4NAFSf+Z3+fvQNzTJpSkc6BSnw9yC8ezgWmKNPKQ9Lg0pV2Pu4zcW5nbWj6LA56ZxP2ihEhdqqkNVSVBLjQChMsGumcj79r/6Db9zhvzhtMTcNx0a3n7+RT3+j9+5QIF79WsaZJ6ilaw5vB8jn58ttIRroNpXgJCbRpIYq5eGWZ45LsL80oOQfmsH7eM413vZ92xYa2nIxkn7zzOzfytfvD2yXt+EhNS/oIbTcs3SKbXs6rTiaqietX5Z4k6oKPHtQZoUS0RfYbqCuWXuXH1j/+Tzgh//hg5z7snRQpPhhZdDy8sBLr5lLk9bO6elZLD31mw1h4SaRMtTKUAcx8AIvatXBFQS0lgaEKTpXrER3kUG2/ufbJ2wxmjEriaeTrPkmStC62W57bG4eUt2AKzOi0XYoE7HB/Iv6E+GHl8uoaE94WW1RE605IzHQKDGY4KTnYVdcZOD+Zb/92HT6dctAUlnQ4GfwdlHrqVuQ4fHA8n1NEQ2JQamNF0TCM3PA8CopCNhfGjB3RX4wmkgTZGlf7lg/VOPlx08o7B6FH4I7WCOby2yObWHNi601fzMfOVAdqGe6POidEDT8fM5Q9aqbzKXyHLVPcUQpIwItZDM5OJZe2POIZY8qkWrTTqO7vfnbkMWqwMZdH49LDkKoYDyWaSMSDwX66DPqkSFUCNhTGtzqVtDDMDn734wPRs4Ls4nS4Yhabhv5QpG0J57NxmOArxvswfLCMurhvv0+6HLyXCIPe/encmobVV8Cu+9SBggmGoMkXKyrgzte+SeT4gbWNC1IeMlTBUiiTIBNeyLj5JqpnKRjEYGBEGpMh6RxBIoAQGtpgP95liD7UukbmK04FkAPP9LWg6fyW1sKAhabuAR+Y+OXMQyWeuY6OKkHqieki/YaDiperhLeGGUNmaBKMFHYSNSEuYJYSyoipVtYXgwIIXE0ylVgEuPCTdMeRhigIqxOIoOABgD2lAjUveWz1awI2rDo+96R3djKmOBY6JEuaSkSuyfm7QIz+4DGYmU5uWTzWVzRvkv6jCLXlju13LsHcQ8IYvxQJiohTJrKTKFkqiOxUJFigmrueRlxRHEiGkDqkTXSa2kPPWxrkBxwOeUhgRpKBAp+yo6OOt7IO9dyEXMAIdOT6J4Ea+7etmDYvD3nrAeb6m3mj6+XYOX9pCd0YFJ40sCjCE8ZVREgZTAFkigTpkmWJbFK6vao+f0kLUJS4c6xkYHAjGg8Mr83nAoizzuRmH0KMmBZAXBZiQCkgMNHjaV8yx8k8tG9GvOsdKklutPHXTRb2eY7baf0QtGdZwdKdQFdYbQKts2zzif3DWR3v7uNa5qxyqMuvK39S5ogGswaWUJEahQAL94YZ0RYEhEwGaFEUy0yTa2IZdOkCI1Bkxi5NXGLN7+J2VFSIlB0PSBHebvx3qoaZO8KKqMUwCXQTVIkBR9Kds233I51VGhQWMQKsFTlSOsYMrOyrquQmXlzj9DBJZDBEZmE6qnH63mQXGHewjzq61GTWlmyBhxjseOHXu4r+jgTArsDwOZSo6avrUMDJVNdItxKQkflIv5n+9sKGTkzik2aYjq5kr4G3F/TnhHogFKDnQ50WOdY5eyu75NfmPyAr5JmYgs7KckfLiq2qQ2DBEGk6aWtyGlFPI7okZxkVg+4LmyziioqQAOBZk0uetJLAYCmEgG/5r+XnFvdQbFcFiAHsqRt17RDACSte29gw4yhMKJhh8ZNYKMhtLH5CvOseLIhkh4p79Jk2A4xXc4i6qI6HhXYNVGMd6Mx3Lk90SM7NpAMgorwRATkihzfE6LEkgF80xN2TiwW1q+j+MQSeEngkh5+fzskHOdmOp0Og0bLaHsu0DCshgFOndBYzNl23dq6pusf4mzBUgTzo2/Snh6vaSelrzsUiWga9/T11zcD0diDpqmaTKcRgDeyMIzoWy0ZAKp5qq9bTkCLBXwALwwDGiQzB0sk0ODAhmlsDuvY8v6YNHqh6zADrG+bwLp6x9ou4RLOo/DSl0x7b+TsStqssAorkU7nVgCotVuVglJrSqk2kGVYuzNCUJCnZOh9fPEnATjn/cIQvLFCCt1FCCVvFhg0z00DPz2Y49JemlaLxwV7Y1ulvV3CCVssea1vfrNcjlhyoaiwJK7Y6RusQJp4uAd32g9H3kQSA5pOFSoCTUjnny8E1CUDBT8rffBm+xd6ELzROgFwTgJ19/TD11tuGp4GDe4bQ5TxlWxXf6hkI2JxoBksenB4S8/GYSSDhezQPdHt3J5YBYSkXQJsjyrZEUt1lBnYIqL1CDBqtCcO0dOVDAQp75ipUSxx5Xtqi2JUitKUQIGUk4D4DenmGgpJxTdK1H1BWtlEUFl88tbc/HDpnFVED2XYspGb3gxkaQW65IJuccXCEPaasvIhgF6cmEN7nzagYUiHECAGcgGVKEoGAA0ADsq6LX/gdgL8hncAEL3NKJz0zHdPv4dAFZirddJJxq7E/wUvv09z2BvmagbZJbOpo46uwSFwtrgmImfrsnIFWIdj5ytlfyJHDo6ZOXM4wGwDYxnImVCLpGRAcO8hXRx+hOZ+g9wkLWIkAiS9p9+QehI/IjoGgTSUh3Xd+byRr3WM+i7ZjQUBvl2cLWSv2IsQE5a8iJpwlu91n7lurJuctDNjnefCGo9nGDMz2ELB88sQfXGt7ZQOSq46mmL5PVeHPQVCRwgJAEcueQPhSI92IKInmYuYoLEbOPqO9XnlL+fGdk5ojU0cD6DUE3LHz3LiOl46/10JAxO0A+CAzbry1VZOYDCDITSAVvlesaYeVXKhdIjlUUENy49ruGZbGwApheRUjJndo8flmCY86agAlT/lIXa8bzmJkkyJkfN3m/qyuW3Qto3Nb2z5SXIRoAFXnUW07cXuGPTE+QjbuV5s2KoUbzWg4ZMUtJ7lBsggVHKrdFCsflOSyHc9tjwYfjYDjDaebI4VILeMm0gieOhp3Gc8kXb+8WRvUK3eNEURegeWBdiapMN7whxn+aaHJDuikovnXnpATArg3GPiMNGYEK5qLbIcqEdXIikdFPfmzKSamsc1fGgj2UQp+2StzaiIg5aRHseGW+x3NM7XfYnDNvmhYNk9juW+JrC0eVMoyCTZzmKQy/WdWMWlW5gorB/YlUlmKGCqxGAv9QybAtsZWxw/t1mLrHSQoUsJtF8cs/yO11E8AwYuRg1kyz0Jd1didRJE5e9JtguMn2cLrG6+4OszyAYkyEaSh8zZdpV2CCLRsO6noBkbJ6uju0zIDMsZipDZexiANCX0zczdg1Gl6tIBQOuvo3pg+RN+rUJOtxOt9MKoBfRhF7cWpMjB91FvqQB3LyBX68S94vNGZ9Up/5VNjqnb931Rockqs8uWi4irWPLN50VVryh72xV9eowO11KInAE9zqgSCw+OGp7ixnCNWHqWWnalAyrYPLP8OpuVk621RD4gsAqe0KVc7YAVB1uccX1yyqlDFzz7L+wr3wRHQOvJlNaJSOlFhB6qdkskj+Dq+NVYQz30yLJeHhFv2PAsaAHMCAA4F7muvSe+ET+ihBDi7zuHbxguSaeAokFhsPNxs2gk3aG3adZEIuhWLmZMNrIMDt0kNsiVw0sB0Y+1Q0oUrdb0bd4jya3cc/dXcdz9+mTjFSHoEmF1MRk3wBgX24oQQmBocJ4f33sGlJAV+7CUa/iK4cfx9GqiXCiADQjZOORABJDsoZXCma+m1wnj/NzqZ2D5nBqRzTZnsk7TNK1PWVLhSDlEGoXoWdSR0DMnV5kLxzOZ29tLUzfS8N77bMMktGKBHjFKVPDL5Zn/bPkhYW2Ms0CZsah0Rctt/ei5d0sb6zXoq5LMLsEWX7ydVZepn4eveFw/GIpN6+et9glIKx5Pml7STZba8SuiU3QNXTrxPbksS97ZABqfaCCA4Xmc+yQD/3SjhIDk/vpYlw8N7y/78PMMONgCBZmtdgDVFYjOKPCqcwtn69LSNeXw69v3++rWnNNsAIuoJkolkveDNSShiyqcvzcFPV+vGUVvDZkpY55nwCXbHLIdj2mHKlGOEqhE0KzHD5CArtP6AHqhY+Ipy/G9kd/3JbdEKSrUVsbrmGI8uGG8fL9+GYOIpHCWTAqFUU4G9b3gsveG+tn6ortcty4mDq/siWHM/Km2IrAZWkcx14vDaFGr1auvfJGbuGJtAJwEKPiB5E6o4wBZSxt6NZPOFoeuEqUX15zatN6ACBkAdBb9krheAv+mm6BuuqAiqnsky6aftrY1OPMJHPQMLn3f9+Xup/GjxWU+q3tXfoI4j3UiYMPCY8HDDtIScpex3ugOCUSQzUalICUXu0N7fujm1JUn9lfKVAEuOr4LZ9Giv6ByJJITrd/eXFt3OaudXO3kubHKvrF9+sTsItlb7qFLj4q8cXEKlSxHioH91R1+wZGH9jeZnQYvFnCFcOyCIa6CKwAT3Nxp5pK/mcFFDz9yR3DI1luDsy4krSCS98g1vne6oxodVeHEOYnwEmjzJ7V5CnXmqqH0eVw5vCPmDS98pBjYv+to+f+PK9/1pURAGhlAnvE32DERDNnJzWj23p/MYNM3oN7wgYnBA161VVLxFuRcIo2YkMLxvUizDNAkZPXgnC6Kdk8+Kdu22+yyaQDsRqUIi/UB33hh8kwjRW0WrvSJ5SHxclyGqs4roVAYcynAAy6waz+UowVBa0Lfm5YPsDrYg9+7WnDIYA0yzhS2qeVCFyDDI8JZZ1XOlq5cfe6k7Cjntrj+z+C+7/cZfZgU0cio5PpI8WtVMtz9febXrfAYgaNBvLULvnRxym6Wf5iZFRzsekf+zBSPedo4/MDymS3EhQKMM4sYFlQmaglig9HfXHILP0U0K3TBt5nGr89O28j7+9sFD/RGOUIttkcKXL6dBXX4TcNJ5qKhXUfRSoB3OlvGE3Jr0WqarrEnrbT+P8bDQ82hH9nb5C0sgILccXfpTkpm0gmtVEnnXWMVwYEOIiEueAAsuMByuSAGdVCr3dGilmsi1xX/hyMHhBNeijemQSAAHNI39z/et5ubR05R8bbG+XxqZ+miky/ub9xzETbC+pAAq0uycttlrBs4UxT/M1Xf1DyuqMz41l2EcA9vMDOjtwiqlzPPcwBqGY4WAn7YbD7hT/97ZgCSIq1i0o6+6x6Z3JlvcNAM1BK8T1CD0jOnK95QD9Qib2e7cFyQnSXW/ZBuKSx095MJlKmisBub2N7eoHdKwlqQpdDDWtm4eqlV6ZSjxcB+fxkQrxBHBGnm2HzQlOj6adKd2+5xiXY7gnZz531mj5NeoQE0va7aZu+KFx3fKcptsslAcPoj39LXfnsDNm5vqKF7f1X+LmLXaD/Bvlhr+inFhQSylJJipb6dS59VpVONFs32Xm7q2ar67cPfGK9opeCIAgRcWr/z+/s96n5t13XIvNqSAvztXww+quMDi/czI2gEHSvidGCUl0DWnn2X3pYmKsIsPdZ+RXVeHdCuqyOrdKc95rlp0BM9fYYCqtHir15Si+/3Ff83CtfPvQQxMsfiLXcv5x6Fv9+Ri590qc+KWj/9apdusMv3+SSPnd+XgneziBiDkXKE20/9Hq22+klaJz657rGNZfp67aCNZGXux2nKClLAuk0vheLV9KdhxFzi/FG35P9dS+/48OqFarRhCQDEEQrc07incYeWYa5pSUVFpy+7afvXG97xSh6tVOBQUJGewx2VKKS815R7g5MD2HV+Jno3vC0ohzb7W2+mQGtFmlQ1UzW+1+OodatRY0Dfnrni/67h/To9MURASt47L0Lx27f1JZZINobNShLWxRhVjNf/nFtv8GOoiAQ+G5srUraB/WjhInpfpKb4LN7BDToID22/xrLZ5tZwcX+Fw7UEFeP6Ol24F5VWjxp18dMhZviSn+0ibiUiAij3CrxefJSLR0XnJjjTqraLKqHz38yr3bvyQECfK9KHbK21CQRYvGqiCq9TOCpXBwgX5nVNEOSW3j3MGK0kuGrZOU6VVo0atdx8gF+7zV3ve45E8NYil/8+IzzGer07H8eFnV+bEkng89RGsjsf449z/judribqqQeSQSq2HlHbqC13z1DcEVJs63vrncDZ3C8RqX+hrSXvfYzTGKXQBMdRacWo8YhaZ/uxzT27tyqlHBwIerhDlItElW2tO8CEt1tC9L4u/W7qJT4jqE/ZQJugD0rKe7WKAvy09d7ZT753gMZQGUr2vAUBSIejqRUDpdRi54KrRD5q4G7ZOvx6fCKWoo7akxklsbwtc0SJN4lXPpu0y1KY3xMNdTE97Keh7+T1VEqPIBnSUigevXuKa95TWvk8KmPD/Wp9gj0Webj59js04XBikqFrK5JE00QKJFvPhlqkI0ct/1aHX+b5PqbA5owc3KXKKnKvFxCHhvXSyPpjvJbZusXBZU/algeOnFgCGpqIKoICV7X3dAkJIUdN1ALe7fo6c+2Ic56CL+7kMHqsrFAkwGlSkJkdrrVg5KjEd+eu/C+877mxii82M4N7F+/v+bJ1y0lTxHS+1fF2UG9KboRDTxL7NOv4sDanSAAsevYSIi53+D1b3Oor7nvHMWoTotu2/IDHq/tN2DczUKqDhdIN2EUtd0aO2vxyOZd8mcErDmXObSyMWeRcvQpPCYfwCh+rwOhkebtnuNlYLV1RP4E+p6qPibLBQyESiaZGtn3YZqpD0NCd9jO/3h9O7EQX2mk+cazzNiulQQBcuyMGrpa7I4eA9SfWa6M5r7/xpruYyEXwUDyWMWrClViqnP1tcLB2W1ikHDm8hheDJ3vH4zkUHwg+USrv7b65Qy+Y0wXvM+ZcX5ivovJ9hPxtAZN5nn/2keChHdAERJXIRg4IWHwFR94fUkdR2iEjVCZRe6jVohKd3CTk4rBde7hwhlROvpj8PdeHBsjEEGEUPIq4f71XVWfTcOkOhPWiZL/2L0+3Q88rYLM7NALjqs5dEAMnMB09Bjp/1qMrXh8PzmBmhpEcnI3aQdIKK2jiOGfOwhKlklOX4nX1k/hl/TIgEXhEEgmCZWk5Lu6UU1suYGOZaASdKXOEE76tLdq+bawAZwt4C5t3xMBXoho9KvPdxzl807+/v51zDg4E4lnSQg3KSMUWcK0bGNY5dB1/nfeIxvBMT4gR0BOUajpRxR0cugy269sqzFz9tPdOdJXa0VVP5DpLOse5FM4O1593r2/0qMSPT8xHeuR/dOR+1BUKrtMHjjk+SW/un6QVGjq2UbUKZVBga+06qUPXVJd5vlcs1ORiToBSgA5GZWhFk3lTVsqQCbkKXYBey8LyJBsrc827Ss7B5bwtBMYFBYH96EGVYiB7od0+YipyYhA4iLYQ4SG4qeiZMwA4BbgPbNEtlHZYuszXqw4/YEtclEUu0PBySVRDKLmIIyWnEO2foqt0bwndaYCQppjeCB0K51Ly/lhYzUCMQiVno8eHAqCONe2nLAVAGxryED3cgxPYmk5PAmLwswx/z4y9Z79SXVBdIed44he8dkc9bNnwPlU5Esuugoj7/uhzgEu36N9ilAA6RW0RpzGrBkRkm8ece7ZbF2jzEaMHEnqn2i30WGhfKq5lu5YrP+r5hBonrkkql4JQR87iZCEwsjp56KL15Tf8CZalAEAX11ECTWNUr6K+pIoyl3JNFSkIGZhA+8SqQLVgKTAsm7PhXrGw9+dgBKXUDmqhrZpuQsTQ9msIEEKBeW88NJyojFI2GQts97QZKPi7lm5yw3f99HdG72MssPCQaoxKkzKnAoRCeIp4CrpLobMup6i7Nu/bKslIxYJ1Yh9lix4g41GEkg3dIwe1oxCdMBqBYRCE+Ovucj6VOqg7izxHAcpYUedQJPMZi0JzHM2ZaxIS4D1KhTqFpATgnR4Q0v9U6TGhFhK01trMN/u8yQGFcRboeY2eaRShZNcv3pjD6NC3Nqo5lkXDUKfEFZ4lFY9ivY1b9zRCJDJ+d/B0VZfr0of1UhgaIAepZL1RoSLIwn3eQp7cfvQ4RYfoxGlUgIO3eUsfFDDQc8kZawqvbxS5FYFbZT79N7BWwWq1ugKKR5xVSNVAmwElgFxdQy4SEf09g88OrrjPYOBQAAcoScq0jBnpbScWJzi5nCKCP5OpVtM2Ay1QCL2zPQCEENYVnm4UQQLXH19s5E4j/f0nVSqbDKUvaPijUrv0xSI4S6BpPEbTiVIhiW0GN9AVn/TkoWh2HtC534kS5q0PcinoTidaNzodvhqg80DHBj3BcQFUgCZ7SbYgoBtJlDxKqEFf2c/OtipeBU9x9XN31es1Q08BeHQLpRzdvkaKHGP2u2H5JS9uICDnXOmCzu5S9a1YutFjVIBEE65cF05xDT/OuVXa5px7gFsANmEdUKJFMnYjiWr1R7wTbYmve8VZvoWV/Ryn4Byuppq+nvXsfQTi7lbSqdhY7qquwvANy41r/UXAHuTUnSLKFpNvVpRY8A19e+wT3eYeiRATJhosjd7r1iOltG4LTLwxVGIYSUjMj4tmruJHjddCvJwpXSonIXpGNCKuz9pV1RVCC0CpytgGA/D4i/bFGXnXRCnysGCvlB2NkmzVanf1T139XbeTzfjeEhxnb2H1vTpmJEWEili+d34QBIwjiYirHlwnxbL9VhjtGY+VgIcnF/XQ9KuicYpMzoGmMb+Ue6oNMUTtohrc9EOLzpUPTVqlFSiBqh0E71thmMcngugb6t1OYQyQYQyAXgwaxmgFMHOF9mf5daxiJL3VO7zbe0TElmJN0jAWdRUXv6JKnTsAEYrgVk9Cw6JG6ZtZepaYLD/wOnRORNFNlFHDZnL3094nfFSU0hXCT/O7fAlxO7EbLSYAUn/+8bRHuCqj1KX9IvDgSIJA6rG4DGE2sbZm1a45ofKkxPWKnu1K2hjEjPPEjyaCKkVOXtDnM33AJ4ieohxioRhhVdRs4jaKCdHrNLJ4j5VRsdYTbdZdQtdS5J6aAZFdv0rKD6rqGHwuY8EujSaM/O1/D0lXAlxZt892ChRR9GrnkyG0UwVggfDGckaB55NLV+HIC6pTEwqUE4pU7iQ/fIVxsWXt7tY7e5wilC4ZGboFANXTcUBprSADmk4qctmXfqqeLgE3RhOFfEBNZGNaWygLhVWImz/lrKFocWVA5drpfApeqYWDrbZIo6wCyA34nvLyHUeOYz2s+AgkF6d2KfNxQe2hdi1HkNl7k+geSM4TPPx+2wQ6ymCHQLSz93w/7qXPfpCfzRJceLKP/30zklAhL46NN2Gsps9+DYis8jqRtXhJQUq4FDTgnOsWwdxRGciYZEjm0DVVzZMv37U02kmqBawm3SPjKIljjQOPALlqRBeh34lJh45zZ1EHtGMVACi1JwZ7T3PI19cz3LVM70eSf28+jMbvnVGbVFtKVRYDi981erxQlhf3p4ABrOWU2Lzwoz7mRqKNE4MLxG3e4BdIQ8knkVBqv5E/7bflKCSO/dj7E7FafyN8LKEbWu2QM6AnxZ5gPkcgor2treMSVM9Hc8Hg8FXF17lRBAEquZFYQEm4y2mnDtewFeUuQT1J+RwRlQJBa9TWUZ2BCPsxvilceVyq7Vgauo1NiftPSqaKqCenEsrXa79a734lZliLDMe1UhrjWPYgRerM3mx4QbPpfp9V9cVZ3iH4+mQkUeDd1EOvt3cOgg0bNtxvencbtXuF16YhBRlR9DF5n8L2Ue7g4EiU6tvgird51rZljWgOsrgDXci9m5p0uYYLdMF9DGs6TSJwaJ9eFBphXBQpaIopPujCodLgc/PgK+n9SBITf/8nNxYwGmNB1oyfQHRnXEaujjOoJoB1DBcKcl2wAAr7oz9nPvIOceIW0MQzIu9LIHH7OXOnkiAc6UoP6AXWEwAtOz52dKVSagCAiOgcOjFYXHYdcf025LwZSRIc32fkCOrHMFbGVI6t1/BjX95a1ETtUrXlkovvt1H4lDQeqT2QZ7Px98Xf/UPdtPcT6zw9M25IBJoW6s5s0dfu0nFAdkbk2AvrYZ/6PSvumAM0AZ5gHiZukfvUj3N3JAFQ+++FbhONLYt8FKdaVW0aUlAohQtsbwjum+cFs247/X0dFUsP3XQpeSBFlzjIsfJG7kdSnTjV5Qp9P3WhjDxrtW1VWwd3rmwfGzPOeg/A2hsG0ld7ZDuWec6WIihJI1j7T4GZLwG/tT4xioyHFvIZyrKPQIyaorv+ZLEFQJ4ubbrj7gfcpzzGawWsh7h+6wTkFjHsvkJHCGGsS/eTgwhuDjhyqJ1GwHYHr4G2tWSTEeTBFfdoSQKgWKL9Q0+5nW/RqQopj6JqLhCInJOgKynevq9jlVFo6Y097fST3Tv3aADwCL9lRpdB4HnrIfRr6ElElXeUwmkNUtp59Vk1g3k9ctbmrs05j0v/SkI9+JpLkl9G9btk9OLdel2ii+W47LEmouZiz6iYPJDAEM7WKaRO2XjymenbbxaeXjJjBn7y30rmQmyRGXdxXmysNxVO0S99CeDAq9MaCck8+yYYavBgIcHlMXOXt7bOV33dWUFTkjD6iwF91WAlJNs3cO6XqFYeWa2Qu6NaYBHginJqcQcRCBLEGhy6ajz8uKoDNyQHAPdMYf35yJ/uH9PnRdROLkjJtRE229YChLMQgwG6/tJTv/EzWqOdTDrXh8e9uOWLySNKEgLtXm0sWrGN8oby07Cd39KiHHEPKYZbGMZZRXutfiQyqF1T5kVzc8eRJe+i9V5Dcrhy3XU/7hzijb7QrTvibauQRntmQkQgvz7cUDsrQwExtkpBXzseb82P9CXPR83NUZJ+zZqOoKzjl3nLjwv97fQ5wkuEu89FzkCIfgGA8M2zapVClJk3sS3XcfiOpSiKBACu+yFPkdTgEHc6JdG9aw+K3hrM4b3xenbjQFo/VU9aJAJ5WOZ45JyrB7zXRxNU4BbZN6OO9cfiwu8iRgWSMpHvLljMNkDO+Gw3cBQiSIiIDah3idLdT/amSyLACpIiXoRktq1vh0SEdPRyRZB4e7eY6dlsnlJKUnNtvxz1YL8B01JUvmkM30ZMBtyFESWGsZPS+LKJJEdJl7cHwysiWvfo9AKci45tAfilHCu4ap4OjGfGFW96xhu081AnkdaEyJ1uVy3h5HRzh7H6DDCwClprc/vm+1uPyEJLsDeNe+dtc+K3UkvwYURJcf7BILnHRnq4lbv9JiQjyiSXsfSLk4BU8an4aHj36EVouOTi0ael9364JtqIDnJPEQ5yb31P6N1hrCns0YnmQBM6M2lbRTE/5GtcoSklSkQkBuufk/x4nBvQDyOK1GyDvPHVxtsWrtEDdEdnlI4pF87MwbviUK755pWdqQ5GlJZ2cHPOv/hZwTmApB5/yOy95xEHnFyHE8BJIXZYCwBtO3G3Lr7DP3GvnqtFC5iYkhrOmziPQc8SBiOKlBStlkto9emW+LeOmW37eduVneaAM1K+i4BtC2E9ZIUm8zzHXc9NGMPWJ9KbinjplBAegaSE5G1RR2cPO7kixOl8y77VHcgC7SewLEjghaYDAKOmO4/fez6Ce2hEIXBFkW6CXugKapZn+O9+6Mm86fyz7sYuZ2idtHMT7R0WQb+gorVDKfrLOSnWsbxw7s413RLHpTQjwVfJ5NwNOMuZwHQ5MG2XnQZjEvQhpM4NuBTznK2dGSMqYr+ezxXs0xEFwAFKt9xVb5vwRtwmx7/9b68fzsYP2z63ZcdHDVYZwadg0i/FMyhUgUsDY7uaPCk6z3OHDFxCvjxF2g2c69sntlP4bP5CnLsDODDYanBjDLY0ViPUjmGPzMBENpa2F/EEPICPL0cUVKRqBvQaBAWn9vM8AyjqppgDssuuaOe049qzDWSDfN2/+sbw+YmBK+OcqXVIT/wWKf1Qg3YKZlzp3eaYg23ODFhzSKqchgwcssiAs7y2dMngqwck3h5VFIziYb1pzzmOmW3Juort3QSjAe+8gz44xXr7hWs2nZnP5RWD6/C/Pxzsi2S95ekmcpsGLUf+ELss2laQeVELU/HzYzPMMpDnnfnmb//kKsXZ7FwGz+MLX/rcY9zk3F/mOVWiECp/tajb5xTOCn3HrSEuDhwQsvMELED7dQmWLQPlsgKaHrlQt4BLVXX0zHvcnKRhP4YAe5xeXASIWikYKOB0l1EV/tD/Ygm0yHmec570wrjs8hCfuQa9cxIelioDxrL90YGFeeXVo0E75ECLB4z38SClsJ6EdY/RdmZzxi+JZmV5oDA5R852W8Whh9P9xEVfRUUbsbN/6pQ61542CnOFfNOSdQRsZ5O9BU+2tlJ9eVTPj+czZF+VKDJ22bBoNqMFiRbh0BFHYO1C8JqVXlgOWDA/kvXp9jQwe8L23ldRRy301eqW2slMOSpD7fR2orvLsORH3MGWYS3OtCCcvpxpQMX8qyiZ2XI7qWcGNYd2jIf4skQBEjxFtMvPE4K83fz1WIBgm9kaAK9MBopBCtd/862aw59R8cf5R/au7Dkz1+Txh5C7L2meYXeJs6M4eyhmyjxfN8/zDnM/gdKDSiOdvbbkLrt2MmkxAH9srUvigxLl9lmq8R5khbuMdYm0TNG5KQu7LwvkssisnQQq6tsztWjBqtYMjFsPH/M7PDXmFd1EMlMPI4EzuZ9/RNX3+ZBo29ah1UDL3KtDoFLk6BNone3APBaF7drz/9fbvOnvX5dUJ1CaIJB9a42+9T/F4WnmRrcJ2it7WzI8z16Kj7yr9reJiLw18oLqitnv2Sxk1RHkLmVkEqwvSHdOghPELmfhgVMKZPNN3l3XbHj09uGZJaftGJyz5a69fEulHN5f8kWPLlEAVDMI70I47h5JQKa5YgrAtSCojqAKxqvXzSEFwG+/XDx0OFMH3kTqH3pkdOvHIeAEeCSmHnGOcxOghe1ct9CTczW65tOqJQ1kZC00HZtDu+qrxhR7fInypauEUW+1YYzd3T3MCRQCEgEyCN7D51Pj1zCHgTT8PC+VIFtHcsDbPfqeufaUNDDS6FNFTiqxvqvvWdY0JcxRgInzaIxZteFDGm/udD6DoaVz2w/8pr4+DXVqiQJgdx5q/goggQyGptpXVcEdBMCTKugXCGQ3jjFzztzyP7JNV7dGSYaapvXb4epHqBZydumunGJWtE8NwFhlTGfESP9Ky0ub+z4DIKI2yV1f53UCSi5RAOz8MmSDG382WNdOY5035VhEIkRrPXjfTyluW5QF7E2mLo3pSs2eauHg2I/I14gvnoMUjWfIXZgVdUOA2iPjVfLauy9luXXKtREPVN/3sOr6kD4ABJpWhJcmFKn4MmRqMssN0cMXTZHMHcy1Efh5uGRp4JvlnCVwi7rwzeMBM2LwCmxov+V75NFFwseVIId4yOlHUXTh2Ks1Qc7RPfU3f/J/x68fBPEMAFJK4b4P6GQjvgpQJaE0IXCthI7IFnd+yxasGE+/dW/8oO66t7DtbLPbE2LDtml9p01TeCV34OeRgzqQRoRXHE9PFbGkEFiKn1WaqYU+0UUpbE0N0O3fkJllJihsaaXUltGNp9rx1eqYikKv0gRA8Mv4C8oaD7dV1f9weJw1NZv69Yr6ebhO7ZQSyO5JpTo6h/jIb8a94r/tThq31jMy8QwpYY3ERflRFD9xPu3nHeFAOfbWf/x36tHzfbSKWimtdEv06p75WBD6lyb4VwDb3r+X5n905FjMN1iPQIEQtdqNOa47eZ23RMA3/2rRtI5U5t3yFHnfPW5+/01IWwrVECKhmkAabLkzbGLYPH++5Wsca6mZmZkiMTBQ+ydrWn/2K1EA7JOIz+TfCnrHBUjo61WJjfBQ0Ai4tiwUz23mpU2Qo2Hr15q9d/IWa94ke/p7BupnRVHV88lxYQOJeRVyXX/FUuZIrg7U2glOQykjSoP9Qq0joUT5mvGdPyZpSetK43hZdItT/63wRwUywEm20vE5P+xhD5mfPYKI7lsieeziIukfCcWl1SLpwaKI2yTdfdUtsfz69waFNymCtkVL656IzLi64Fi9r9gS5UukWUSSE8lhK81Bd3AnjgAFdzupXd2H465zqEs347BmAunaM7p3PZzjjuJyVjmfUHZdZBbv7komcqC377AZ0Ka2ALe61eCBdIJ09ShRqLuKmTzxv3AH5jO272KrCPs1UH33lbOuIdgXpfnciYAdHi0sOtI4p+CAPcJjNC+TXKLT93M0ZNPt5KzVSKIsPOy4D5ydoVFL3lpuudXATT8OSGnw91GseYooTYDkq0l4btOruwxGvHEA4ruqRIOrnifpq6oL6mCzZWTL/ONUNfTtPBuGMcmUHhrRj0zRUED1vBpncTYnQW4eaBzc/py7xeCNLoSHHbfZwvEjiRYDg3TSShMCFWWGbv53fjgPCyIkdmJf5bCuxK7DRvjrNeIs6trtmbMTXHpYVRAX6OcrW+0kZ7gkkLE8/D3vQzmhdna/emf1hWTvhyRk31v407PPw8LR4vJ1uCkD/LBrZCg/2YIzsDRhSJ0gh2DZPvy7z+uOHvzp0plVNBBOLfBrZHc0gxkQk5ODDfTLyJlJSFr64UeqRyhN084hohExoyR9irh74wtfDs+BdGczeJZWc5sdsrXqdlKVZZJklyYKaAVw/Cv4H+Tfbj+voMzKuoeRouBtTwmzZ8xr51Of42Fzos2Xi7/2C8eFflteI257yCJiFaroj/Euu4qJBIu/WLrDPezvfRU76tIv+ixx8tqBOdpOm0IrgJhhnVqavFviPvoL/5P/lsscr0ag+0rfEIlf208RZ9GgyTUd6JwC8w8NORqiOrC4JblTTg/31FB+tHeFwENPxy7sfkM82i1iXh0UhsJRdDlz26GdtNusEpDBSEosTZBYHREe/9xrJju72K5GiMNygPqmryjl+/xh+6wBBdtYS7uER3b+xP39S0TF++US6Rk3C4XYz6a7s51Yvj++bJkEsgjpP8sNv9Sy0W/Px2zZOutQo49/jTDiShSW68Dx//LwMt4gkENIowUqIpD4SRyC1KMdDFnAHHJEQUyGg8m/dIfMI8i81ZEZrjuKdHybhztksaP7/oxzJD3IA+Hx7uOHAzNTC4xpNFCRTmiJQtzB0/77v6D7uuq29O3EVE3hBOoou27qayIoF9ME5wh7v1a+9fBgb4tn8SrvVhVjOc7+4zGTU2QHTm9Nxrqsh6XP2WqKt4NnLwMaJAyAlFZmLp2v44ImfBmdVEeUJgTUHzk8R/YUz1orkClZaVI5WXXrHel4l0e34YYW4AKUJ9Bv2s1y8Q4Z4YsuOE39nWFzX/V87nbuYqqW3gRp4cL1lgas3ELWEkAeM/0J1//CnMSUJhRUKDj9d8eBCSWfYL3yMMIw3cYq0FHu3Tz7bqwPmCVwsTHEBlruiW8+kR4ulzBblj9uKiq7Lu8nO29943shIdL6i4ll4O889RRbCQrkvfFklkAMrmKEji9NpLBLwfJvPI1zRrdkWSu/8Lb8Sg8NesS79/Dg2z0ccsSxl8s/+rmDDk3bWY9D+hV15NqKjhOOzBnI0fDeQ5GYrZ5+g5M2efLKKKXW+kiI0wVJKU2EUNYl74JiXVezYAAPJGL2WED5lyb6dBklbVNnf1tdijbl1l977eA2PFxoAvCJBYO5d3eBswDotsYb4zVcW24Zzu4eqsUlH7a9vRw4Y8goOkNKpaMghKBJdFZpAqT6H/usMii4qoYBUOy1pOtYnbxGP8XcW6BSLHUAp/xD47Fy6Ti3lQbuTIBxMgUcCD3t13MTTcg4JA4i8sz2N//+Zg2tAcCTqpPQjhZIfGnChMZ/7B/w+I0N7yEBKRex0Aunc80e8hI4xa31aKdIZneq1LmpvgM/2fKJjz/s9B23+MCycaDhii+qvCGzmvDkvngIx4UnL5NPvmZq9Qwa7DF/GKg8O3IQV5rc6nsnHvgDiggAsF7AIiFGef/i+gQlO5iO5xydWVNAizv4cR83Le01+PWekHbqmzZBQjmfnXT2QIlbEMsNLN7oMNgEgLk2BwBW3WK9gAKlCX4s8kzzmBrdqhQW7D1rTV7pwVhBN1liiuDjRi7Jpinxyh0sJ/9+t3e35Ht+7tC/l24iLoQhamh3fj3jBjeP+1vOVWXIZFbkMQcYOXr3QxKElygAjtzdHGADgbINcArWOz/FSa1f31ijdRU45fqcAePtoCQKtw7PHCuwmGusrFubA7jiKApXAeeW1M29RxAHj5cC2VNn6oFmwDKjMAgYxZFQ1xIFoP17/771YA8DwMKCUZR4bCEOilgfx2MfGSmrf7bc+lkLGJtPWHvZ28bOmdBhdw66CVIWTro/SR5hEjc56x4SgXke38TWZuYTbxE0zh+xJQphWm99xWEd5HxecPE48F37oqXSY7vqdnLdouu1g2f4h9yB5TXPjcaf3iTNz3O6i4Zy4qwIelvjwXnkIB/Lnzz4rqefmECYdWCwdcu+1zf9C5coG/EH7InSS/Ee2Mh8wEkECt1kE6ymCFhrYs7RqNMg/zq/Wrzyv82xt5gb26YYqA1FbHJeZgm4pku3tMStm7Pn7HmtxqHQE1qtAY8c3PHZj0hAYaWJhOrpk3zQCTADGrPMixnVHRnln7r0ZgAwbpgocMvtauVg+Zz1Y7ioCCmxaSYnJ9BYkTiHkj3yCBK5Bd4NWPXDwJ1uYS2sk4V55dQ/rCfRPUsTQsrdv9+0OIPgWQrKweOrFB07dYtgG2WnkKRw0mQQt358lB413+Sr7SkcvpesYKoUi1qcJc+P4plyS5JQwleYSqFl1Lt8woUqybC2+pOgRQSADpQmAG3ffFbZ2ge0xlWloBeh/bRzsujFdm2CvbYtrgUA7T5GPj78X1cjzWVfk3aeUVC4DqZKXLne0knXSaQjtLLtQNM/xaZWsODOOYfRbw4lElOaEFD8cTbH8ajbExIc3EJqsMCJqzQbyzvQZ/qdRGl17F1O/rz/aPnG/2PAATRyCmxbWvQFfcoQTnKtgGzSJez7nbmnQlUZLwu7CloaDKBtB+q3WC/g2NJkCU4d4u2Hk6O+gAFCbFXEzfuSEv1l7wmacF276ZydOOh2cNW9cuYpN5ULWDggZnhfvN/bc7ymZ5bLR8+UFA1qJwkXh80iW04BFg9Uu9sh4fpogifRj7B56Ee3xYb1iBQ8su7ZQjgmreQu4iD7ss/Mqu3yXS+3yNZDQyoAISAvzGLf93Qvvy/fZ9LzlkntfVKX1mJ1ZIvprv5B8CYzGNAaYXsm4cKI8lf/Mp9kONM6Iu+8dZ0ND5WWGur0lx6z0217zWRiWTunXpAoieANlmJzyd6XDsGiRGbc0ntylN2OveeXlIPVyHX3+X3dmKMyKA7QABjAWJRmEs+MKrL1UCT2nGGw8ElDyovKlha5iAHfzfprPRdvFg34tVl2lk8V3oaHtcmKYAFwWhwG8YIcDvKFOJyVm62zr3v45O+4Lc+AczxxAGArxUo8MaIILC695pyzzwAWyMFCRycF/n1ubNCybbddV3Jxzg0Kd3zjDy0FfcmLhUOJAByk6bilk9Yz/JSS+v0uGAgRGv524s2xy3bmgRZhlyWcGFEEFPRZS0drpwBEuHkci8RThGBt0mgdY3MVDjcUX+44euujbN5AcAGMZCVAkmz7R4ubvLuX0y1yV1J2dYM0QApHje3deMxaIwNZFPLPP6JUlNLwMQuLBeAQ4NVC1NcAe1cEvZVtJ7h5FQpA74/eroYLxToYQDukFCIp3CPTMrXoukfSTRB1TxoBo46qmDMD8KBEgJdwfESpZeb+ccJkHUgWsS0bSRdDPO39EK/0iW3eh4dkdKfDFn07rc5xPcUqSYSc1h1UIiGiSYK8SxdZHV9oQAB89AScIgAtKavFAPh3RxW88pTBFkAkEx2SdgqUkGySa+dIqZt1e5qyWXdP4D996hQ0YGCLC8XS3VN6HmtEGpprATsLIEF0k1xLe7vuXIsHqhJhJuDoiFLLZfffXX9xYwM2U7IUkpSzkrsEdBLSiHDMnKfVRPO2/XbEQl7JCdgAIyxYR0Tthzf8LZ1j/15fE2tbi2VoSf3iXXnCVAadRtu5DFK3gnlUEWL11TWPS56y6jQBXMgmYpXek/z1SAC1pMoE9vQZRedW0ZzXcaccYBeZ+S523G+FHCDSiS49MncUxI/iyGGrA+6ePU1DBoC2PQ32PBZweESpxM6Srs/s4QXeA3BaUVrX/D5SPNYvJBoTmnZxM05icrHV2/pZr96GWRBbEFSMNnpsuUsuifeVcJGvchRO4Rb3rTw/SVMHDQDeslaZRTw0onyFf8wb/yT3PS0UUYRNSjuhnpkppZEJzsnZvd1zLRziPVmOjgdYXJWBUlxy4RD1XDNBOL4nD8tAAgNXrr1BDGQLGiAFcMt8w/jNeuHciLKkyif2z2jjUccI06SmU1Ka3rk3z5SalAQ38Q6QhGgKSy7ilxpPnxIFPifPwH4GwhJJ/17D+5bsnSX3wzaMaJtbBNwlOdAEAKr1sLzdN9aIMpDtcxaNF7fVKrikATghzRqQh8jh0iRfs+es+2xtC53jC3rh6uGbnMHZWWRQRqRnd3Hp+XOa6Jr80GODOGI/EgAFOxOk6L03ZIGK9H5EeYSkSs7bo25s21Z1jlOylEYnhSSOBJCgzc3zbDxOdfoFXSsnv5olzWbBKEoCJp8q6SQ3k7I1JWyXJ0kM8h78qxnI+TyUggJIk7VhPBtRUGnlWjPa0FophbAAFqolCn4m+FPZe5udnmiw13WpqG+nsK1ILH1BqRFxQbv3birX/gL0JqJdJR6O915Sw5ZBMiXADFBnlILL+PXYiCKwWHtKOrWyYvyGTc545ay4RvdQNjWCtQ+2LcHGyfmGPDLvHVkIvJ9XgaKzOWCcPLa+ed/VYKlXoYNYxzuzE7CL/bThq+6rokBmCNg3okiI1prjODehdt06UzAhrQiJcyjI1c/O1EI5tBodura2enpRdfQ6QoAttg+2DxglE8Gpz64qKHJdPGhpwq/7+za31KlLVlBQeJYz7hpRPu29V74z9xsMaO39QXg2ZyhXrhrEFYhaayQLazqpWS30XVYE/sCz99lvp9QvugWxWbd3pvRdYu8sEZsaESbtAPOfc93ZATzbcUEcUf4Jd+RQf3GDCZEIsEpEfMlQ/60q6hoAmLWBJsTtfWpOKcYGoyIF2TKgl+r9unSEt+u3LlPopkL63APFVzjWn/HzDIStSjsNKaYRpcIcD8+35eR9st5nL1eHJMrTNM7ggFPayGgV8W1JlO6h4UgEuhjPDIQYOPWIsVh0F5arIHRE5y8aEtGvsfke9hT/l302DoMESnvCiPpp4w8wW9u5hIWRwOkuzi6ncFc8niBA0ZiDazgDIIw/MDRndnoOASiMAF3s1PdZiWt0vnvul+5qcY2Q3k17tyQfrP+M4DTmmRbW+TCiVJio53ThdtwAWCpA+W2Ml4h6JKavXsSoSAZtD9Ua0oh3QK457sRg0wEJRQjo76Ivs1v0Rdge2neoddOx7LErp8YUhqenffX4aSUxbY2GzoEfMaJUIoY8cmnswYwChleF0/feY9iUOLMrFc8QCuAJgK5L3ATrmT0HA4pgb/si3sYr6QgeVN+lt2uCBIDPBxzTueHhIOsKi4RRtcY4yPNoJhtp7j0A66NUXO0JNBTdzh4jVvCYeVSqk4zW5mNkmWlGK7YRvIHWEaZoMMbKxbuFiT49Xr0vo6wmPN5glw/5eV2enpblZXEscBFJ8vCjyoCSW8TgccVRzswZIZzQVHVOZ7kO4hoeqlWqI6+VhcW/2t/9ow+i3ajh2LAEQYNPp95JGTYF0X5dlHBFZDthjvvC88evt0wy3c0MUkyvZkSpTHFZ41O7ftszIW0AGb4B2jh7PqGSC46IkU1MqbNI9/DdzWB/pyT4WLjohEaP8Gv5LO4y1lIWjmzOJyhe3sN4HZ7tKyQHv24kgJdi34hS4/Ckt5LdpxRBRyDXaSBfry9ytq76HiisRF0EJudaIHGO2zlevQEuIQAwqBK6RjQYK/TiPejd3YEun07vARLap6z3OQR1EPAUE0TcN6IIqJ6zekoAzjmyMHhPje4R4eavT2kERJeyt9Zywu5JUYPlEfZj0CgxVMSzDl9CuvPubpJvne5cnSl9WsWsEj/PP2+3pXm88gEWoKQUBEwjCupUqeOqbTWQwQFoz1R3sstVCURs+q6QB8CMR56kH2xVVcR7kyCBCQbS6tq3TlxdpJ9MoNvcpI/1IuzMU36eZ4BD6KzgEOFGlgGlYvCokKCUNwDrihJ8bcFVT2hEJG5zPtg1d6Fku3+Shj19wnmiiKjOE6B37zTzOeI0i8+14UIgL850ttO2bjEn31jXHVU4wuIRo0pNoZKHyCYLmoDagtJO0vD1euakMFpiFHTsuAWOFRqewMIzALIUIzihZy7nkytY+azk+XQ5/4gonwhT1gxoa5gqMGeLkbWW8d6Lmp49DzgQTXe6LmGofa+O2rAxcWySkQVvHWffSc1Rnr7yFgneF+8880rYZhL56q4z/urZUHA7EbJtLi3wJzNblw2goThyI0tNEeQ5dVBHLQFwixxC8yQKJ065cxYAnVaTTuuu62BXe/p2WuqIiBwIhF/X01muDdAzGgQEJ583QgA62nVBwcE5qNFloNbxy6iF4wTm5Ly6kkicWi5saygxIGrT2AIRNut+H38/kVVEMU0XlNy20eCkLnHh+yuivtcOvoeEzMMWGwscKxjOa8ArhZG1lgENT+FsSjY5lLPQK3iTs6kIobPuOmTOjG4CAEU4+LgT4oZRibLFAiChclU965NGXHUZKnxG2jWVs6skCgLg/Lrzyo0sTzV91CljLDgBDPVc/i1v+4xCgctm5j1ntjlqmo7vpV/mwkZSre80VrhAMVUPVFXjnBZ78HcdTgSOWnNk3XcEFBcyNEYXIQa+Wk4AY4CErpOTn15ZZ622K+fM2elPTXcg6DZGw7fjWS84godn4yhm9fbzfj2r6ukq3yv7SeksiioKxiphzFuDnbVBSKodWZ7OPbnoWAAJiATU8oVrBN+fX1BMi8kKPOuYYlSEe/j4U1ogAQkzA0Un3MS9NdLkz3XeddFnAgvYRPbWmrP+7eFlXldW2FNyI8zjthgOSMAx+CBdripxipNzftMJcOCc6wD4cxr0SOwMBwV2QQTVuuix6uroGc40b4F+UpHTcREA1SNBaY2u/LqNdMPIUsvKiVMX2HtmMFujEU3nHdbc1c8X+LyxaYuziJNkafcDw43DIMOThyKLB3qJ5KKiwubL6s36J91EfT9/Knhoks0XAFfUcKC7++tHNLr8WnLlh3slEwfHAENPpzPoyl/fUe/hNQp3Lpyjcwqqja+A6bhTHTogwxYHfhJS5XzmzxXgFHPo6UdOZ1EPXj1lXYWjYVjTiBBiGlkq0xzS9eJ+fMRjzMwp4YSyaAMEQpznc5c2LBtodRocH+J001AOxhsAIDBfcNs0TDUETqAgfpYQDYlhs9srbz/P7AKG+RTxLY8stemfmCd68mfNcEgOTkEJX6/rSU3B1bl06QbHDFis42ystmQ8z8JwHTkNACHBCpw1nn48rQqnFxXV5aTx4xupDy4EXQDm1pYGvUMC9kaWp3rOovHkyZ4lSkCBDrYodEP/qHj6pHOw3DIDJ2gd6Z7x3g9WOQneLzw8jBd03xubtXalnbdTThPXs33Shbj47948oflsK9u+rghNpiMMKlFdeFanO90RAJLTtc0nOYHiZznDtpto86ZzmZmhqsrJJHscMiwQHIqj95OKqsppEXEPVWVvnA6N048uuWZybAQcAAxSI0xF1d4nibiDpHewE39EVzWNsGfOqBtKyLZ/XpZbZLB/pNigh2uMTZZsiABB14sDqqrE/j3BybdZ3aXHGd4xNipzhQhjARP9ZaPL66O9cjZF7TqZUZ2j7qKcFb16SQeOiGR1bdD2V7G8rjqy0CBcdRJLypE1J1Ke+AndftTdfww57xA9UQBfAzI6+0jPMLrU1Lo3OJQMCBFuka666Z5OEUF4KV+WncVndlZk7XvR+bgnySZm4xScbx896M1ETMQD4Ud0b/GjuMwePqvyU2yurgBOUGJQsWF0eQSJQwNUTQIAQiI9KaGg5FX0dx4xQ+uJdhFRL4WaNepTg5tMJt4CUD9QKCE1j7OcDiLOqnJWxFFmUgFXfn2tBk9dtehPG10k1PggWqULUXoZOzij+EnkHJLposybzmvrCOTh67YooenZAbucWQQM73zr7qilzNE2jdzjLApunZjd9l2E3mFv7PvPG4DTFetHlwor1zSEsU2ABSxOp+Bsv1NBRVGg73B14UBJRKnHLzOxFjCwsBbD8eAsQWr5p1uEuvdziJ7FVPGAn/k5kBVYVwAUPefRpZal+8YbYZZ1jgQdr34W8eiqSqQbeAMTbD9M7E2U7qVHZaHAe0rOok3I0sUPkfvg1t9bqOFUSwsLTk9m+95+Go6KgqwK4rF39hcaXV4Z/oR1y1Y5uBDkrJe4nlHCr4uqAawtUTdASyF5YA8gAmJEVHzKOXKuG/zeM13V1TS8nc4i6DLPMz/91PZF5xUFZ2M185xHFwkF/TJyYnc0djRZy/mdExERoi7dsO37tfEyI6svzGNh4U+QM1pBEalWKWz3mVAhZklSXakFnV9odvIFdOan4YW9nXbaPAOiHJBgzejyTPhlbmUkDTBwEidDrj5nQ4mOwIrM8+wEl1zwwz3eRoUI6xPMMV9uLfJwLpmbH0i4Q+hF3HwRQrSlwgqw4v0FPOfR5X1yL1SuWKIpAI0rgegJJaKisI4jX7AVdjAvLEyPQ6WIGAnxjEUiuMtbWuIWby9ioju87brHyx4eEi7Ovu+7grhDAtvRpcLOfenPuAnnHADHSV0045pn6hRo03WetzRb1nkF/QTek31p0gyw1ohyOBy1Z87ooeK0bT7D2WaFc7QzivbGBrDsUPeigm50EV6NF/twrRLggKSoPqmo7uqqxLLs275ttti6se2KO1j//W0kMi1SonSQHqK5zBnHluGA/8gXdm17w+PneZtj48PxDQ98trLjK1aPLq9vUyzIjkBRgQBy+FmufnJ1XFGfhVVZ0cavu9pnDDOstD6DtmvnTogEAVRbBAmqVook6nhjH26sPVLVaQ70TltBProMbLN57zcOMZnKUZpSTkpx9RCfY0fZZW1uiAzXustOm81RpmYAQwSa2NwCcplzIWdS3HVWt1A20a0Dyy+tbZ573pf7sjnAiwYEZqNLbRp3t1hyWoHIKejVB4vr2dE4BWCs6yqeoKiCur3w8UlrEBGV1pHfhehyvu957H7OXRdLcRU2EAh2EFek6BnuxVxChfHoUoluU7bEyjqBlN5BG6rqh6EIoL7Byoz7SjtWMV9Xbm5frDtrE0zUSumUzGVWk+zusSebWFuV7SfddT+FrPLTHPs+n/g/3TPTYg8VxKNLJYYn0mes9nxwvHBQUJQUlHA9qblOnTksDg7eOx65jVtdpzSIrbcFVK8aqCstRDf8Rz01nzvXFu4arqWgWzKAc2DG2pkKstHlmZ7hjCrZBpsXB4Zwvy7nDV1EXIHWmu0Wbv7qr8L3yA3nh40FFgE5RJipEqHvDm70I6y/acxsX7sQ9skXDz83TDNetwkA9DHVvrDRBX8a1Uu/FiyEAAToOYgzJ+VqGurQISn3LjYpnvw9J3E8FMvBwU0m5Xo6a5z1Wqdz9H7urRPw6V315CvuSuvTYrBghwOtPTPa167qTA3tKIOd+Yxn8BvJpiQoAXicCJGLBEkfK+htNpz85t2jHAMeAHrrGs6VcP5MZQ0UV53yDidI//SOSCs7rLQmBeXBrUI980wjzFPRg3LZsBZgqOuvnc6CqoWS0KFBelV1+0hh+TfoCOsOExcSnferlj3rSeOqpoqfgzl+1E2C4AvCgdsJADQAArWn7v4OMMIKKCaPC8EhWWABrihctcAVJ92CePLL3TzucTzGcGYKIFC0Zs0IoZR4FzXKIuhshIAKXfdyMy9iTnAPlFS6NB1p/mpcnX12BaVYTh10dtFQskmnAzGuL1+ecDL0YkGPmjhynpCIHWhwnuXquOgZTVB+PGug1zPOCEUMoC2yj9CKzjTB3ff/4o9otBmurFhvUazNikkQpIj6qgpG0sHZZd9AFhYehwJPQLQiwUlxl24W0X3VjC10a+kG8oQGQklTROMjEFOk9rgY/SCjjBCde555DF6AAZ3WKf66NK4Ip+gXY+0r9Plvz6x93fSiUNPZswB4Y6G1I1DV1JO4ChCIcvLQX/cWm7k4VUAEAJo1PV79paOMiB2GZ3wusGykoVE/qTMrzht2XneH3vaft5/XeeXnZG53j30ZHtCEZLgxHDVx7++bI1EmGqiJnuML5hF87cywjVBKe2ZANZnXXkE/ygjZOnmiahVkAwc/3tCIk3LygPN535KVJn14Wa/X3kmtxYbZhQsBgFIIRHo66ymOOKsjrn5yVVSRPETPGnBOhW3HzNAAsHXhbMVmo8zPu3lcFWgAGkpn1vUpJNQjPPY1WYFZFl/mTv7bxIULCxhjlIvKRfQokSVbxDk8n5p2BM6OKmSBjuPt2YLhi7fw5hQ+j1HmEUG2zgPkKAVcQc4SsZ5EM1R7x3DazAsz6w7cwXL0eCgkwFipwAk9i2rIVQOliaKqiZ41CICskMnCOnKwjm7UAptR5j53PBIhwUXSdTlHuHfUUDjct8W23djZ2rLpeBIPerwC4L3l4rtFCOqodX069qsjaq6x9J0nPqwI7BanYWENNIrZaivWjDK33SB7tkAESkTXFldTuIbiq5+F5sywAraD1SehmiBAL1xB4Kx+RlTjGuiwnQN1BDnv6MKvEzBlYQBwCLAMSu1HMsq8anfvlJDIw4Frp1Zxv15yc5UPYYcdmOe5z6t7u89issfskHn7Lr9wrag91Ff1F9UvhJou7LqriEhgiuttTlBQGh4eeyJ5YaPMB/pET6/0Ro8IAEmfTeXM6aTkFqG0lqgyn/j1NnfdKmgHyMwdTzpUfx8Xd/V8XbKsdz1FKENpk8errX8MBl1wxUVEYwE4aeRQqWyUGaRYwHhhTbsJCOwhVMLpBIoiG2xBCxH7Ck35SsnUgAygBTpGxzVefGLUW9Ddq4PuGnJ12d3dCGlqgxQQyXo48qRcLbZHmQGmDxUNsbQXNbTWuHLe/TxztvNgoADz5/ZJABUchih1EIOOs8to8wRJmpaLo9GLsdQdURXOCBASRLeDRQvHTgMG07snldwcZQaixo07RN5oJFyHg4Mudo6TNEXZPvdNHGjJDOHmOV1ywAZKRsKwQdSCz32pNxllpqa6TqysBhtB07iDDOSA4CN4bSdUKhhlHvHQHdEhBwcPCBquoWdQRB39xGccQABy7jtqQLYZsEDnUu7uRaX1JaP62UTNV9ywsyBY6B0uABhaOxfS3aFS8SiDh+7sMDughYJq6q4dXTSiswT4sizArMDYzpA9muFyRFc48q3GsrCQO5L7XfDLFV9gWaXJK3w+IUGO0XsTW1gbL6GmYrSJD1LABGix4uFnWPVVSpUNZub2aYZPGAH0TI93Z9DCIum8ZxkZQVJIrTugtADYT66AFYPJPmyGhbcIJ2SLKupGmu/h1h2A/IQsXnAQ3c72rMSML81hnu4+fWoSCAnBtY9rfevRejw4njf3YWPXvg9VIV0U9E1X8U3tbNd3gKMvyRAgFesJF5oBVdSPNL8PIjTDs9aAE652Sv50AfJ8Rl43gQ49060tvJ5w65UaJZSKOx7R6/JrobyeQ0Td1Zlx42JfB0Uo6CCFRhCD8oOMNM+wtmcssCAQaECG4sqSy9dcRACJeaaxiiS6HIeRj/DHADVZjwpGbb6V09k738IrSEOFi+erAq4vt0ePCMWQgt2h8EyjTfuMTmv2IKznYRM5x4/iuKOasyogKDALnvqMpjFh1hSjA6sj4hDlIRnoqZ/k7HINjVNKsHM3bpcFCAqw4Ati8GiMNurFKQJBQ6eTw8afRaOZruodPjeWZd74hH/6rGPewq2KkjURHtmpZt1AxnKXXhpeulMvLqq8JKOnwl4vHCH5nBtmb8QRYg8PsoB20CVC41TqZwkFPcOnWZe5tU8tfzy1Twlc8NjutFIAlMdMRBRjK8mY57s5obhqcA3wYeyYzdgjwCFpoBUNdf/PGo82fxpN2UuQIood7OroGbmeQ1AXgO00A8x8nUHkk7hEQESnGdPCqvayKpesb5/wiFAMnP0lLPNdDchx6qOHIk2QrVLJvREHDwrWRliPOL/pTn8hFF1OggfgPUIWQM+co6qAv11M0E6QEkW+v+U+3wlJYhS6h7qoKaKOaqSmVjSKGBARASBHO+vPebQRsWnXmK31HmAwJU5vGgaEMsEWEaM8oIicobptPO5WmzglmwBq574tRVlG3ypNdULOgoSEEetp78J2hEKMrEFqGivRjzZCdkUxECrCeXajKu/1eqQdjQQJAB8AiwVn5xlwJ3F8t2WpZNd1kzZ3DdeGmiiy0p1+ZSgRenRm4PZEY18CDRCIlMaOe86jzSNqlJkjUBFEscFiUNwkbjdL8gIslEbyyADPrAdmd2BnZ8Yazme2hIu4miKhU2qnewex07DF2uEnMVDqQlEeWBBZZCVbW48YcW6pF+ooFKAUZL6QPb1zG7aKPMBggN3CMQNwNuta4uPnXes6M2mdxvHrmbieVa5+7lc0oF+vJ+WqiCIV9xEA7wDP8cW1zzTaVLLHDi5WpOx7HASalrh7JtEF8DajII97C2hqlTqKHQkc2IL9Ck9uV+j7eRENP+3qs3gH3OaIEPGK1PbU2+TArEGXYqWK0eb1hUuh3x8z+4pkSoCQ3r3JHbRwrgS4wA4BBY5P4u6pc9BO604CUTibzqqT2nrtgJwq4AqM4uqwcVrIgjEDbFBTVDIfbWpTB5mZFRTuyywVYSu0QD0yeadRxjxmZMtFCgDqEkRDDIQUkQ0yoHAmmnRBr3tcZY9YYcfZemcsYLqzKgGhzPPMsE9bqEQ52lQycaLhQrAWQgqRh3N4pGovtDvnbD4o2XtAO1j2GEg03bEMjWyi269prE3iqganvZ/gSsJC30AcptOTzAwHcICJuG20EayooxenbEVCiDGkCB/XXh4ZvBfMvsAzgCTBIiqHDtsQjesPwNbFM86fWcDKEIVNfLAYqzudje5M6UDreIdnR8653ijR2CKRE4w2ktr3UiSyRaAq2YEKgx3Rb70FcY9DI11wHmWht5RrqSUFa3uQaEzQdrFFbGmDIaFxRcKvvp4iOiD6DqXR2YbpKmAdkOHc9BJqFY42lTa8OXD+BzvrvVS8QrJ03EJKSPdEgZUjp9ZuvFddUk6d0cfGUJeAJIOW4LyaYo6uW+5XX09XCIuwsVy7P4/rb2F7jKOS8RKAiLZoekE0ghDhaCNhFv/2nb2oKKkoKq69UtDBJGHhnMNpOjMltXXjloJWKQvP+o1Qp6GZNVxx5bSf1VDORCdAIzpxjT6WX5BadeSUBEoR0YXjoc4JRpvfh+SRH+7GrRh18rslxBqeQXJENonVdE8ml6Zb91IDrp+eOgXOXWSk8cY4e62Ls9EJ4bycJUZZYD5WhPdhi12u7sEndiEGp5UEMRGU3hGdzUOcaLSROEK2Hn7rzpqa0t5KRvpBkneXukkBWhG2ttSlKamtramy3pWJdeOC0sG57aRx6q5nFLql4+VeXaM69D2gGUyxQ9OpWosqBty4+TGNNpU2rTTBTow7O1tbE6E7Nyf96R7TPAUMr0TElRin6XqaRn9wcPOCo3BstiD4JPSlFtFVl6erJf7qddWgh0uPiMajZUbd+vidnbWdqCL8g7H5VKPN0nb7odTM4U16GdPpzhRluJzjNunjuF0iuXh46BNmLUV17+lo0Fo7zjblnDex4SY4Kb6d0uAJcY9h0x57V7niNsq5TJVoODFoMkoRKUWkTm9tYrQdFJ8tS01jqGkEKaTr03TKed1Een60wXpZRgh7Lk6np8zujrm4605PT+uc/bR1VRQnLgEReT1jNDu/6aLug3qM2laPXbpd591f+tvP71xwW1Migtp6mjaMNkV5vJZo+hIeL6A8yQhPEn1R1duA1l17kXlTFJChEVuDphOjh0YldTQ49hhoPoGEBqdQIEqBxHQmc0zUsTxXyHOnYF1y0MmZcAoacaWYGJI7DwSR2K4xQal2WZ2cwZKm29dSpdMlsDnk0jMy2447Za07juXFbee257w57m4CazWJ9f0RJ6YNUZGO+QLxyseM3TFGWpMDWzC4gmVHgrrvYT4xCm4e5ghGuw3n0RqnEyFOdWSPnpugmIrQGOObK5Mnr2/CDpQynfHsyqFrkuvbZi/G3ncPxUemVCfKDbCNrgrWHvX0xY3zduFc2KPDVBBsewGvTLe3KddHNKbRQEOdhQPvjZaRF7WCOUQFJhMgCxOAvcN8faGSdkiQgaapgfe9JwpGFZpEKcWM2nN4WZeM5lJGl5yV6Hd06tmJrk+tFzH7j2P+h0PjjigxPphV1x8JXoHr+STf7K6dO7Ya8c8UeWPPqI/9mR7z1xUSMTVj++e27/edRjRjDtQx6SA0IxsE42CCn9zkoqMIbeOOMxSnG+2ZUbNvWCYNbfY1JlLO+kroQ6UMdac9mRhasTKWT5Oej4V725yfN7IZyQ1JTyU+wu8zaLh2SiUdnd+wzY1VAccReseMwCuvJtLtkJBVRIJYb6dXT/9JDpDKLQcOGJKg2nG44+ZhzgC0d4APMwK5GIMUROAV6Tj1dUJjOa7G9gk0WXufIcW5TdLxcvjh5hJGhUOGuKDfUEw+34qydR+Wrvst9x6gN1jbYptDck3e9Bte9FJB+Lpr1l90bA0yYhuieGRPemW17R1XprgnC+NbYZmq/dZM4iJJbn3CkdsJjVMvu+uqZH5A0mHNOIe5puQoKqTFA0E0jQj99kIjmTPANJR6wfmFIHyxHy2kD5+VLhQ6ISDC4kjwVkQc3XgitrwixQa5A8ket8IxOt9s4+pzc/nnj8tv+NW/ryVLlAbCeMwAZuinyRf/xbMhPW/u7MEZqHLUMY773t0z/PhK6OTb4B3PAW4t0H59R+Kys7MKYQ4IwUwM5uQQtyACn6FUZHgRBjiu1FiSJuON7axyx2Jy0tg5sF65wtetJQsxd+A0kdvxT81hVSNDY6PjaDm7rXwarZPD9zl8v44c10d+dXNCLNx9zz+yVDq635dthakxo2DKKw2X3XurHmOTVrd7jm2KC6X1HMBqwEXsz80R2hAiuwyHDBgR4GETmgdNu22Ez6Q1ewg0xgNR9zBVSqoGS3IpP+ncriyi+cmrpo/dGMOh2OmGkuV3sTR1uY30H27X13OGxghuqszaq+vruURjZ3nhync82ev8d8NDVw9PPEqu2cHErYQ+5lMhTC7Mwed+T+iEJc//vVybNuhauJ2+KpK2h9/bjOfrOd5sKCHkkHniLCcDc1YTSGkkjey1Y+8LCVnpjzUZbIWqfvX4xX/wta/fb9v67BBfsyeHCdLo5JJFkmPIgcVlcBCTowkQBaH3Lrlz7SburWf+VXXm6sc2gwsxiBTv/I4+lbx4b0PWrnnJdzH+LrohuC91Y9a0U73/+n2761SnS8KRGNuZLztjJ6wwxgQayZhEJIIpKzBgwZhxhhrhConM3bzQuCz6w5bPO3jbyueh0y79Bg2nTE8wslQNWMnyZeDIeU7oRKBCNJzgZgEwiTqeEUE8o6ZnboT2KZrtHiOBJehw4HJ++bujg8LvUMflGVq58m7gUY/eQ69ytros+O0z123yaC0d268Uk/sJS+GMOfuYeMYnMVDeFDBlzrh2u5gxjoW6FNfCx8alHqdO+XxL51t5Bz8N3e2SJ+25Gri8/32hjRP9XskiwQG8tSdZnHHQuM3RiIO2paQBUm1Mp2/dymhrY65Ot2zF4ICkQHuezwdwPGRMoX3u1c9DZvpf7jffuk7XZHFqt8kZGvxe0GxjmTNaI4OHbZkdJSOa+gWADObto46vZdwvno79gn7A/aP/zurb/nF+BcUHdu2meODqCgNYYVZ74l94tWQB0IqQZLmDA08GZsNBsKpuoydtVYuo4s6WLUkDr0TPi9/kpTsOXs3V2Ht2HZ+z4Vq44O7zDA0H4QDa//bzRyPXa1/ZHSl0L1cGe5bQLVWJOQ5rhtaOWVnZSlsX7HZGDcalFC1HwzVv8MSX8w8ZfFF+zk9u7lfW9djiNLk933LXcdFHz9O60uzu3/In9koWSdrwbuBAL6zYVaz4HrLfmcQOStMpFVuBRNJAL7gl3rnJou906CVB+BJsGYJUp5nr3mkPuKmIQfbvU1npvxUWx5X1A/89S3sOWZeRgXXtfvZe7a2cmRaRmB05c3UzaHqGC8sHlk8MPyAeEn0Q+XpdD7Lywebn9Ff0Y7hx4aZbvHgRMjILJDF6+ZZjyUqgAwgZJ5HYgIJBGNYIw/Mw8cqrTkFTjASYujHo+95eXrUVL7gVRYsy49i6rLwXHCvrWbPLexpPZisuHWqu3GbY1y87HCwH4sCwdebSnGiNHiQaF+Djjkgunqw2DfapL1h6mkPPuN8Tlj6b3J7XK0ZJ7d+eTMxU1cUZL7jlgLc3hIT3A3qLOUqWr9mlJ9pJbgUgTqWyPjjLslFIOKhGsdU0U9gBxnbUEQNSRDO73vEdgIzhzDES7lu4y7MP6XwKNEOzB9xoedfk03avzHZroQ46l64/YgzPORI89F7ZOL5z6YJozPd/qeo6L/fV1nt+nF/gA/s2hTRuClcASmvLd+2HcXwco2AvMXeEW1Z4Xyb0JSNVW7IAaaUQMItAZFU47nlYCxwPtdIYtNDTAj2tRKZRYHwrTXiVb6UtoNDIRHC7cE3orLkplQCJm2I18hYHtz+vcvMiPzqv0cKdliNFN4rBpaSHJbB9jJ2VWRY1/97RWsdjJ6IuB3UwzWGmpEJYBOPjRALqSxapaVEgNA9C4919nDK0k6qSYltBGBgMDLYCFBgZpDSqR1kkA7P3pS+FLCg0pnPTtHBUQBB6Ug1Exgdu5i6xqvUAeSyZbWNPaV1k4FQUA7W1F+nAJleI+0ojKndJjSBY06tz10iTmcPm0FpYQ5CBDKktWX5rKuV28eaKjbdP+12sJyYkSzCGXkgoIoYeakTsKBMknm8Cg7UJktzZIQqRO+bPHSNidQ9U1q8ad4kKojOGscCDY9IFpEWAJAZnICMFoIudFdLN45t0a7U0nt8Hl3PqNhR6fY/jBYEUVJYsgtmfFYJLLOvmUnFs1a7V7AomrZaR6CciQYOybTBA1LsnDkXbgsmJW4ikKrUTcHnkEDFv6LgqgW0UCLdCOuVTHXSRwC6SKrE9jzZGp0EavS+iYL1+fgvGOGgxOdaDCasWUqi8ZPlQJHTosxT5ADJcADRwW16zzhpD2VIt1TQGDSaIsu2lUYgzCOVxingAFChRa9ha5p2Cdi/atbqNA+g8pgTtmBjEliEGIJ2gz2hw9m6c3S4JS/uyvX6sIscs2Bn52SGFC0oWBJDfUGhG8zc+0XjpQNUkTKJIDlI2W5qNnbDVtJRZDEPTaflhjEZ1POMt1J1xpzrGB+CJqBqcjwINDKuqddsvo+9ZhEgViEi8YFSSQoZ2OxSVPR07b7vMkMbd+qReh97f38WBJ3vt3ZFCFaVLQm8Ls8n1TbOKafrkVWznCd8MgeJIHw7fuP4wqdoEKMoQmYQTAhGxI1JjTFZ31xuYNNQYYCUYrwnAsm0MJWFVEZEiXHIxFvA+VGGAIQa7e4AyVhXeUIspVdtYjrbkxTq0nuAO2gs1gOz60gVAVUyPeZqdny768QNsSuzSENt6ElsvMNgYYfhGHYexciprU4ZIqiT+BBrRQiBjpDDZNLq5Tt53okg7HCc0rEk0sCY9LGFt4KkEgZaFtgQquBVLLBEq0+pdtMjGwXdx686XcdpHBWCMW+Wo8jzGdxkH6KUBFJTZILeYicajsXRBAH8DSMyDj+jDyAfIQhLbB7q9qWt4T+OzgyyNpS6zQIQhkiqUmUuyRAjsEJYUCKQ1V/XyGNpnAikCIGiRkIlFdweHMNxcsvSO2ojrfKwoRMcEsC0MIHcwrKgapK0YFaItCMOeD31bbzj2gW/O1oPE7ViLwph6LGkBnJWPI8rIeUw6E5JQUp5y1JMm1i+Uk5J/9Hzrcvuhu/P9eQKNfGYhjQk7+4Vuo/Cj8GdbxWfqJ3eAIjrT780diFUR3YnXdpJIITX67PJAJfQRA1IgjYKshcKOswZYgpbinjqlz2tlpTFxw6TesKADncYZORdPc/m9/igkU1LaIIAmABdhMdBXgpXMvMCgFPZa5s02RgL7ktzFFHchh+T7Y80/8tOLzi8WkuY+kyYnCNoZqfPTZe++4ShL+eAP646trre6XH5edwGSISLUUFam4c4S0iJ/PUB89MBQxC6hMjK4MOk806To/G41E6eKzPqsSoa5/lnTraOdXJstDgTHz08uhTUXfFBfljiI+NcDcJohVIErcfpTd42nltP3DH3yx2SIiOanzvbPX9rueT2LMstMSMwMlxw8Gsbyc/kWN5cvQAUR8YuYtL7lcsvPL/A7/PshZoKwBeU2Hq4fsC2jswpRSCh5geJZZY4UlYoUlRwgTZqJzPw9U8+uFx7p5JvFqBr12tGJdEvx7FNti/Fe6YMIrqN4r3/Z3f3+9dtDnu2awTmnc+Z51r57rb87pbtX+fw4y4tvD8kcwGOmFXQQ0QvTn1jP/Fl+8+u/Xzyw9IbVH3Dvw901XbzJjwyRr0LrBhgukDdi5UxrYLzq1c9qtyAoZF+EoUqGBjPFpDE1FC/QVjjS86E/RE8nPBdk4akmy50nfb3I8pRsQt24/IIlcKwY8c1wWjfxQv+dv6dYfmnwg7XZwvamrkPKoDqe8jiVmiE+lUypKNW4S78qtw6HR1gMDSxoh0Wl2KanJTeZm/cvaXcKjA2deLccXKiTjxDlAtmDjxp23yJahJ3culQQs/OqXtLOtT5ACJxRTM7Q7ayNnnRU06Tl4HnuXRkc2jO++wY/bYWmL3/d93Lkv75Vd1BbdFm7ACwuhYRn1KeQnC4znt2K4W7g0TtltW4YWoP8gPrkRlmNVZpsu3IjN+pR3BoTjyu56oRcOLGumLrZ5eZH8i/AX1yxlPZ3v6n1ymfSm5+Lh5C+cd3+ICdICSJynnV6+goKYLe9EIo0kOHYKHBSOk7VVNWtw439QzsasFslqiI1aji+8gd8HFf8/yXevojLVdfFN95/CeBWLIWF94Kg+Twu/ZkfCYpX5z3+ff/uXYl3uV8encf4hutDIicAbSWE1RQjW8TGgQUBdEgNywH2Ekc3oKGhMvCWKZJ1Hb3n6QXItrSt3yQnN7HZAYYg0gxZ7IkaHdMiU0ne5eArTc7bWTvOXmOm9I0STVUTPfXTfCKXbxIbxKCOZPKUR6IrP67Dn2b5VWId4Mr775D3NZbGHQPK1byT7/2p/9obWP0oc06GkK0oN0VGjshJ+4sXid+kgaaZSbUjiZbjqIgQ2yqxRhhKLkBNmTopifBGfIoLOSxYQB8FML8p7sFJX1/rvWf+k6FAYvON+ImbxPSKjm/i4YaGiVoYOQYlIuj1Qx8dECFiQbTqauBMGI0Co73HY1LsZVnnfmkLmkxm4XmT9VZcnYrLTasXqEsFk3UUhvohiTwF4HMsjYuDvkC2+y1elFd2/lMPwf/TrBP4890+bUK5SQGn6ERBpAD5++ccf3KdZngs5jIQNcVsgSIZGE01ygfXIsBcDz6J8oDcKxRAX8QG1vAC1n9ZsyYVywMC8XXERs8aNt5Rn/rE75OVBtHqIOJKl+HAkmKgsmZVQJQxQpuERQXgxoC6fIQkfKv7doc+/8hl8Ca01fb3/SMh4t+VMXkq+EgdjjAArVgqdw/4BYyxm5z4c97GoOQnd3phQjdPMIo0LiZF7BiGFojvCcIANEKnfLSuGwFBrcOrNqZ9ubRNurVNmTC5OiXaDYF0QMR/O4DJpBqRjNzOoXHgjAEQpe1/tPDDv+PrgLGosys2KbHRwAYlVh1ocaGEQnR4X0kY3leicguitm9sMdo7+VJevlX1vs6R6l3/CpVbnDc675FmiKiiNRdtQXfARr+dBuA3LImLg3sIoGd+KyTqaIpnM2FN6UrzRhnl1W1/5oHk/zVr84IFAT98wkCjFAb5lD3OYi8+zu1LQShg2wxFxvFYc7goWJ8z8zPgJXH27KT02TS1JIJ5k6JSAOmIiACCANYAWDAZLzn8cG9YNHtr+hbExaH91ye+Vz5ORDwfyoEUw8+FxPK+Ljn6FixqCCW1YF/6UnfI0/8Fz4HMgePGnm7b9NQyw4wTmLnbdoSRg4AYn5N0ncCSODPoxRqOReCKRKw/8/pdRn/CWxq94HFYNPyMUclqYnYeQfFXLl05RCGOh1+VZxPTmPM6BBsBXFEWd67fdjiNiD1MDQ3SPk8C2uNBEiivY+1NJbP2Uv+02PlTtvd9m3WrzLkV7Q/Q8SCyj5A5lp+uVoM3IrNIk9PqESFpQlWm/r4Lu7c9rTX18b0f3tXf/rn82S/rwbv3wfukD383pUSDHFQOPES8Oy1cPnwECEIcgE9LoGKZuJzUl9JrMH7bU75QL5zQYJIbjQ/bnvqjHuLkf+yhmj8JQulmOW2JkCY0iFuVuox7tm17qz0DpN4hbAvYl+seW6LUCxpLu1OCtAZtVEFAyEHpmINSq3vS7zk9frXp+YHZFOfCdTNkK0IKfSnUklkgO0dmFbkFCgvRa/n9DFtRe6awp7i73YdPz+XtObwL87X3+/F2XdLbr9mIKZGy5dI+LprN0uKd8PZ5IHB3AfBu6ZMfZDZZ5f+54c3/pqUYWs0SfSPZPgLD4kNYJMijgcSul/4nL+fsv2ansXVAKCE4SBTwMrzYlTTXXjpi46iaQwBtmT573kWMFzBWEUcz8cNvO3wfDaDdQXSvvXnGKMrfc2o2MTtoJlQ2GZsoWrUfDMyisoRQ/IHAt9QsC5rD8WeTuZjoC0fXXumC546lwrLZCkRV+f/zgysKOmDJS3nvkbO37w7FwrSJWNIPH9eZ7sfmKBZSlyyWBT7kdUlPv+nl/pvf7gGfPrXrxSh1E4xhdxyHkMDAoy5gmwFEbTWMjZdPnTjoxSrUoqQV37786Ias/eBFAJ66Xgvw+iteeNQe+E+mfeVJt5V2vmjXu0J8WEEpn86q9w9riMGaN2umIoxbjGFi9+atIw7SpqxiIl0GhGxfaULaH8CVoH3JQ5kT6foHZMZPUsWTzftGcCGsSFidImQRALvNOVQ3kbcFIouwqZv28v6Dz9z/5eiSiVh5l4IF0a3YE4RSWRIZGQnlD1vAYSR1MUOGlfZqev1B82wz4kFfvn+yc3RpSmFtjOF26emIGjpbwBmKbQ8YHpQ07K+Dki4Mtmw8dcRXHf7Q7dufHaUYkRIARSIiTqnFuCCCILMEg3Iy9dLNtz+LWEgFiMRFGkJjBo7uXOoYGFVa8WRDQ/VtNvFF6YqO8lvd6AcnXuBKwU2O/GF26MOc+gsNZ/D63vpTNp9JlkbFVnCWDc6w49sV2zdCDaPQvstOBRb3Y6hZMVrYmuS0xdYHV/rVp/Invg1PC7Qnga4BkICoYV+drB8xzdXDPYerWTvWLYXYgfhGtRFdCFpRIkP50WSsFR2flWAIkfWLCbcdzxgKgmCBIWMtS365I1tAcZqSCw9N6MDK+DUpKSCyvMTh6ZozSF1YfpgShfjhDzLYe/g5/pADhBSxwcAsuEVLeKvr2vLq/5MvvI7/94+5yTgAvRJwbR999KRCLXyFfhXkACW+b7GbstVF22LYbDQIDHH9XFO6KPiX1LbjC6VfAHAVGmD6M93bDFO7mwNPQYdJPwBOQrenkNIYREGhsH6d0BgFtoI3jU1DOMahgPoqHLEIkzaSV3Iwp3QD4Jy+3dxwAcoIsBAO775t464uQVRJI+CApmPOMR/QTx16YRyOPXKjWz4HK7btlXtrBMuU6bPvSdHaq7/6h9z7lYuFahSlUqm56Eia66Sx0KHgoLHld15QGXF4PnlO/6WxOtR8s/ujg+zRcniRrq8AS8wO0nUWgIgpq0tWTr8q4MXwQINJK05a2IBF+ATcbnuCZLiSA0FRKGMMAMK1+6/nZGRECwaajBKkTT0MTn0sD+IeL1G4DjUuReihcRSoo/qUMpnqcp+a7uO4HmJWin43J9/N50OKFrcpnpuEVHHD0ODSXq9crpyh2ql1/GzO4Vfe/P/+3uv+7T8JaxXiAjQf0am4Hi5ubyIh4pIXWnF85O5b9nKnPL563cdX13jjoqH/jNoUwzY1RdreaZw/esb49jmjSmc9Thezv+Pemo8O3JlIbobiU7aDOgKlf9nQqYJAQdlYBnTe901DyZQikwwypF3wDESZiUQrSwBMYp3NqGSNgGIA9C5dOBhthAOVJ43VWzOKi2mwlKG7w9+iPMVbsxjBJNxABAhiqC7eWJUSFekhZYqHCZ/gpbJfNzQORMMAZnUigYTiOmiZZn1C+ZGFDIgTPTFvS9TgZHft8iev4t47u71+kcjvpOorLmKEjRch9UD0kB32XKmrszCiHnJ9SvSidleTD6YTM1LybL+l1cAgUkCwxHcowptAidBAfK3be+QCRaiVDAktTBGodjAYCiBUpBWSp03iDRTy92nBJQzA3hKlUDlUwmFDCqQlS1zeUPVJE8sWPO3Eu4JKB60Dpw2bqMRwwWFrwCGB6ujG8rOCbw6VgsXD8gYO/qSddmT57QhjuQMO3x8iNLALEiCGIUXOpr243dTBLMf3Uufr+Qf/5NfjP/1p+/VIde80pJuTJRsQxRKGNqW8UWwlghG17LWHz8UmDwRPpgwPW316uPCzuOjZuykof4KMbjKACu7oD9i2JHAxau2jUQLDUMrQgr/7RDqs5BqjYNClTCre+MjiDYFUdR0MYGtpwuFYAJ2U/CBFVrL+TmZwm3Te6PJEdWOyMLa84wAedC5TRVo46X4gFG/j0tGNT7PiUwaZAACVVRvBQUzC5SN2P0FxvWRGtobxr7ied3C7K+evHnyWFe/qs7/42v2Xf5L+hbJt8SxtV2t4AIWFBb3L6SuZPxoFWoWjrQQAEQImPTVc9uvtgf48ufApefJs2Jg051SvTBBla5iwGheaiAoxQElhF4ynC86m60YBL1cstAKdolhaAvNHAFNKElXWdbof9yu5YxS5SgwPk80UOyiQY6XjaycCEnfPPxi8j+TTj/epLb387du2zwcQRQd2S0Iwt/tdT/3k/LDaN4DghEcJKykStoWYdbZTBR+0YIvKQ7Jrk4/addOP9/A3f6urvP0r8MNniXTTmBe7HmcKiRLOYl+0Wm/anu7aPOzV/iKu4ODJX7hT4PKmelskFVnt4jrP2XOZ6fPilUMPknMLIBYFI9TRIWpFXG0836DQwKqGsiDOPdYQiRdIDYGFvCeL7n5SC0cDU74FcFHJwaS/lNmzxmPyBpPhHXPGF5qmtLDFZaImozSQrC4jFvswO8jPvdpj1xfnXA2mAwBKgs+PztXiZ37e+Z/oOmrhKe0t7XGaMasw56jiEamt7AMs0bWzFoyu9k8/2rVWP8Hj3vllrnXrZxH1RcyHhrQd/cvLeACaitKHb3CX1TmJWZY/ebw+N0f5ygRY5H6qvrx2K8WDp4gwVefpnsr5Bg+0KF+FSd/Xc2sINahFHxGU7UDTkFOB4lIKKUvEh+PrKjKW5lMbohYOAKK5+UIqfAzgzNKitV/DO8rxqYQSqJQ0D00QVQpRW/Fb6nL7wImWSSGaCWZZ1gIcTw6l+PW6pLs9p2FcHBOBqM18ooNtz8Jg+f7Pex79n/f75n/yQe3+yw+k/5evOv63Zecl1Ik8NWRwH/XGVXSxudUn9sk/zJVWP8PVD36avR7/BJmjb4fpZkqiKWLjhCZkoPHhzb42pe0bVyOnJFc5fC12XOXxI0jMdxwlXNSuDj9LePVri5XPz/td+XazbjqHE1M7v8WNj9HoebqRRNiWKBDIGU61txwwnHZ6JhAwHJ3SkrVNuM+IBw8DsKmUaMz7Otnen84O31Bx1YohJRPTYfHhH7DChUrjlA4Mi/rCidN4l3FcPzHDdtX3mbrnhPfWj7zhPAK06hM4O7Im33axouR6r1WqDLL+vseT/+bVb/77D+DwX921/W/F/jN16mzgH85pv80+9Y90QP3D7F//cF2H307rr6QX5lNDMoVyQynmAYukjTG1b3Jge+PKeN2ldKuEAcz1mvHDNR1Tq2xs2HdXzW+u/FAip87ucNaPsP7lZunm7G84E7imXUtZ3wBQ6CvO4O9oS4iCOgjs5iMnfPOLMS58dmp8Et1XLaXPJnPKpA8Wymb4Xgwgt4SIuT/jTq6UksLUwiHlg8Dh6cfK659uA0PEsHDaHFxt8HdPvO4hrBxW7eLnzL5nFPeMH90pQC5sUUUfSUv+rPScVJMnl3B9XgWUyg3+GtTbjeICa5sSwxFww2g0ZuW2cTeVQ/U9Hlsa1E4gtLJYV79wCZ7TEKeSzQtJsCLpNE0yEg8uxAiy5fGHIr70cS77OB81/OzO/ogYC6hrQYEAohGVlkrvGWVeTl1ZdyQHBkkPQEvBmE6SF6o8ITok2/v8Bv20W8mQlvsy5Xgu7ppMoAOVC0pjYglHwi1FSBSBQqRtQOphRd+sAebM4vF3i/a4fY1HjWWRe/m357asYL3O2fnTitwlOIXn+MsBNAr4TR10uffCU7F/Qo4eZ1yqKA4qpihOBW86DwRFwqSLIzEACmHzmJmmsoa/asU695G8huMQFjhNseBqvjLsKAQmq4EYJSbuquVrgXzsCX2mj93u4+7P5m4fC/aNasjBdBQiCKRGhyg1dTmjRjBhIqGpnd7on5TOtw1wpeob1CfhDwm9yhTPMkXOKhEapcNy4Ddhoy+VkghvpFQSvVEPnSXPlmHr/+lO9vZMwuGOVwbWX8O553D+zpQlxtbcja9iBfhKztQM1c+TkJOjLh+HR82DeRmHDXF9lwfbADX1Nn2JafEzc0qW00hVmuGGc1wnr9sinmpMc0prD6B+qM81bzlzlWniAiUilBTJeLxmx+9Y85eDiqdyuS749Dc7NjfH0AhuKb/tZ4DqulYGpWTsEIURDgxF9a21Lm/u1fIY/1cASgs/lRh8QsoB/BTjBYhozNTSIAVdTep+NjsaGvhsCiSRn1GdwA5K3kiIc3SRRRjmQEabdZpEMTCUCcwFglZpAMF5eCqwh7uyliGEZzDmTN8c567aHsjRqyTnnEiS6QmAmhgNIBAeOo6kKbZ8UaMCUjlhBeFGIFzQqXcFBxJCqUxZYOnpJV2Y7irD8xTOYLIvxYZDjgxwanGUoz8zkm75+nEJX5zm2b7fo58dtrUjL+LhZKFNXJ0K2dAq8YCxLecgvDCzb3JDizf/E3mrvyekkUnpU43xcx/Ox03koOCq3b+XwBpeElDhC8iaB3w2KaLFDvFmIjhAmADDbQTFYggFTQuYzav5lITKlCDMBzCpY2OLvNj2JTzUdNb0Wb/9fll8ncZSxalkSnAGERdiXDCBxKAp69YzcxadshJgJ/SuoJBCjEX86MPGOGUJsRQrJq0wg0jZdauWzv9/BT5FnGeCQ4P0MAFUJB4B18KD33iXfzyMT7PWculTX8UaCnj65hREpBnwcRRpJWmMfxLXb8kR7+V1/9Ae5/dDpjIVn0vLpwxpx1WjmEtMniTbe682Emp+MenuGupfcGUQuXlaNZhihWW4MQgLJYEtAagIyAVMCO38RSr70RixSRTmBlaCSKcnmLGQz/BRESd/ntJeq6nDmdkNmE4Dkxn0ZjEIwjDMxuX4mqczKBoAhpVDN/888yrtvBO5BNNw00IpYClyQ5MSANVgQFmHZyP2gi59ncJ3wV9/OVkr4sFgfcVijsaAz17m8pugeZSnP1ipfebol4tHqRGxIIcXYvmCeLztCsZtE8cB7fCGf6td++UBumkSPtVQvaGVZRxXEhfqJYYhVzxbCC42PUV0j9KwolANNNw0yI1KnOUnTISbga0o5V0uTmp8tCkXlqeTVI+MYC9ISm2a2rM6wyc8RprraF/+suPHXbG9Oq7Z5cuFWBsERbxMaEC2m2RRoTnONiCHCZdolNOYo6i2EK8gg7BsiotGivQigz3AZNSxeVmD8vPez9OcC4G7os3J43nz3UAMwipO1of+2h2nvs48/7oa1n1f/PBkfFbSExPEAdJGpQXYdGTkZr3EnL93jDfz6vLwv3+Vf2yKXU31z6TLt7qkiWAkmFUHChOJ0RzD9jSTUyR3GV5XUScVUFLh27SGJw1meK7GEGh/hxQWicjoRTemLkjOW4LSKmhKgCxxl/2KmO+YWV4lUvmsORFg+uT6/Cb4rIgfJyPTjp9k3+hCisDouojjON7e9GYXEhQb3j8dJiCERsRWMN9u1s5Xa8OGMCllg1wEJ+bdmkOvZjBA8wnYqBWfKu4j+mtdtkfnlIxsl+2PjNdHgFo8IUHzzPOvqXq9/3Mfn77+9rDlwyV1ST2eAay5eXYkJ5aiDD4o+3X8Fd/KT9uCDwdAacifmVp+Ih5v8ggRy5D0RmE2BQSNWjnGyB5iZg25svPKkob5Oj8zHoQMaXtnCg5pveBykC7HEQaRKBIdDopTC5dm2Ygbl1goh3azHJHSaHYkGPMlFnWYVlw059B9gpjf+nm8MH4V+OMU2q1UcADJUkLSMEXiAqNRILGtBHc19sUhYWvX/6qA5SZrV0q1efqB9NhApBTRZplsvD5FvDlb9iq95e/eQgBwZCGPa+merTm95rKWfMtkj/ZBWsH44sWRCk0yPH+Rcq72rM8zerHsLMuwf9eyWzUgSTXHMJvHFJAuU/H9Rr3O1/V/3Qf/yqGvraj2bGr8RGP5OaITp0i144Q3HC7fyGMcmEwN/j55aiTVtBr4OjOPp3uV1uOMYBNJPGmRQzOv3lsu6CeOcAMlzj+hi9JuQ0K2ad6YlVO5tPYwLTQpUk4w0tYgMlXsOXS1czSD+dNqP1ab5daNl2tD0FBiKEhVuIgBagIx0XWZEhkvmMCA6bDlkYC4G+bLKz0LxniYwsM3GVAGDZpLHLTKlMXnUC3znOUxJ/lSHSgAzfmTFxvIg/ACrBx+wprrOWB1JMIFZUySl7/pyy+QslEaqvOZ/YP41z8+5B/Maz44yzwW8qvuL9cuz/r7zyPfcv+f9F3+2pIfHknw/+e1zbxpLj4RL59pnN7jJVREoazut0cFRRKUBfSiiAtNGW9ODUwPHfmvjpqmr0wvpmdKYWjCkA4HyoMw+bjCDdRDii0hBHWjkG91MdosG55jSywfIxGjuhSDdPCCm/xwGwAQ6VCb7RCrwHJAcBwMx6Sys5CmKlzYFXSEBESg3LUggfEWwpfrkFpdolEXibJAP9JyBE12sQmuVBdpJiBlIcJw95gbDw7F/G42WG+5chdfhtzIff7Va+RA/6YsR1u8ibFxcWLRYirJxbe19CLD794fV4gLN1XyDfn5//ddfNL/ZuGxXfPwc9y3WO8/Vr1u/TMQ/LTws+fqT3p2T96jyoHrRQEiGBsEsVIBcumhJhFDR5aJFlUPIVcmmlEjmZHHvg0OvhxhDN6K6ZWBz6SipXHVYAPQnvW9oiYD40DcBgQU5lMIgVkfH4/tOrk06rapy/f85mOHfdCERYfN0WFhjuaI1QXjuM7LAaOaQBfwYlQpJh0P4wUPtxMy2lS/I864sGrA2hDYVjGIhbzTbaGUGflJmw4C0FjQGvJ87rkgTS32m+uE/7xzPQSfkyOrWBjzgiLe/eTDUnnWQr8jxR89LcSO0oCh9vMabi34WppfsIUKNbaHXVr+bOj2fc4nv9a+uoML1zL1Ey1cJr/7o+7DKxePpa3QoXE3HH9KN4fSgCIZQ4tBSq6/K6NEeEPEDWB+pt39zCchLC4iF8VbZ/JQGK9Uvfg9NNuTweWTjG4cBsHIGScL2ZVKKjWyDJvk2Q16PwLcu53uVVdje7nGabNenksYchdsD+Ypr09I4G9ZEAvNBUwRDerAoIcync0a6UVlzAsuOQF4KsE6/vrCL16irx6Z5Tw2jm2C45zWza4X4YjAgIT5mgriKE6nSUdrxJha8nVPcHbtx8i0seZ+QDNuEeBUY5o2zwp7qlf4UpJvy4x+3jJojEFQlwbO2UYYSp48HzsmmbU1rCqjNeY1IixaVqzJxCSRAlpqQOcpmQgpA9O34jK15anRrpbpHJ6f9FUN/pxT6s9pgFCk4XItBdsnyR4r7v3R5ZG7rbuVR89trzUMd1eClZB5KjyBcBUAhB1WC7It5ALQBcQmBs2FWVSpkS6oeHbWmS/nGWxswDc3RUyvnl9HWQO8NShtTpFZWv3J3Zi5/toEEiYCE/ZLSgEe6eEmnTNHkilZ2Wdjfv4DX3Aw6Viix3a941AnftaW3/ktpgJFn9ArkMzQaJiEVGUQY/Q4IaTaMhWyUpnNBgKhNdVfpDQmQs0kbqO/rr083iS3MDCQQQ1XDX7RyJsELqgbh0li6IOrB9qwUTgQSaWxfeBARLiQ530keYvXsht1Hh7juivACmNjLn2WHEZO4ngBZwlXYRtRdIhVZhYRQ4NpFfPe91rVAHg2TvTVd3CanxWaSZdx41zkolW2LPqZx9kxKYTZjW0Eoo3BusoYN73dLPQwDA8mCYMgGzZ/1c9zMST3y2UMryE1gLlecyV2eeZUeS6m04JJUrOL3aRAzEIDnQQqtRSARdk+RJgMAgYgyjxUaoQBHmQ5040ghCUZ3mrikzQuFE7Ey43BsKF2W9y3iFrbAw1bbMs5TMKPe4PuGbj3bK+126sQuyrJVZ42bLjG1REHifEQqIfCx2u0wvaokDGKPUhUF6eKOM7tPzWr7pe6vnWgsHxeNWepniGnylw0/PKQBqztlUPMesTjC9TpImsmzlVXXz959pd+O6REcZWI7V4/wm+ReCHBx47aUDYB5wUv8OJoIvDKQdKtwY7RKTqUYktwgSpFKFahx1MzwssqA8yCKgOE60nqTBQi/Qm+MUmeNOIZQREMTqMOdF0MZ1pDR4fsC8H5vE+G4zzeDxzvZfo6FeT8cB9uDWoeeVljePZ5ethDIFHgtwWiRBQoGlt+EBW+9E12vZUTu14tZ0Ze1b/1qJ/u2wcUuRggnnhLmcdauj5BIYcTSxHPVewigt/l/BBHahMfgE7klS1DEZknRMaxQP943RPAFmOUd5AAUUeAUEpBW2mAYmGtzTWhYo4B+piERJbGjIlaIRjPz5r1neb4FtFB5BAmt11pAVG3V3qAKVHrVCxTUZAGJmk9r89DsyVwv/ZY4/WPeQ+g+E9t47DPoGij4NDDLT76AoM2emKb4/NVR1Sh1KpPWpYbsG6dHLw3f7zkvDgV4RZgI5sUPL/7IkJxOEIK+XbLmE7hMClVV1oY6V481QFPb0LsRe31+40CWvLMd9WGT9PX8FCbpzZnUZM2DVhElNh6DyxigCMIRADyNkOiNwgwzwCppsC075HQRC4ySuRZW36nRT8DpXGE85elJuf559RtP0CYrKEAZATv1Erb4E2faEWfh24U2+seGjtP7XN7niZWtA1TCRxHj7PoCpdeysGI0LdrvHRT1edplG5On/3sweZGd2J5cR+WcAaZ62Y5+sKhmCH5o6gCW7OS+UnZOJBORCbFwXQOKoYTZ1pZGWmgLARywbsGssoJ4FNVXaZj0+Mi+Gw8jamSxNk65xpJ6aSdsc4TgyXwwdq5Z8SoENE6Kri5dGJMQAkK5e5ZiinC+9u2lM8aB28ofMKx3Jm4rDzynA3ODat1yw8iw7u4YEu8zi7ehU9dCLyC7/q2Z277J1vZT0/JMIpjXeMQzl5v/PaBEzjFZE5aemyEezYJcWmVU/U8rcEI7qFOOKA7wEJNUS6nFi5wurzFSj5pXXQFD5xwoJ0NkX73+KpwVfq28lwoMyHJGqwoDWeLcNgSnwzIBckP2yUZnsN4mCYGpoMijmebqcFJwOgIHXUFIie7yKS99cTQPjaBZHCKYkSNs0gQ6Pm4kwWuTI+ypMIbjZMpCSuWg+FCDUeBWf3pNtTDXnQRAyQNh4xFQ+wCIsAxbAoR1HPcobZrfErY9nOUYCyTNsMijKF0H5KCo6NV1kVnCvJ71Y0vgvNvrmCqSiNdaIn3UObre+y4BFriu02V1IEk671TgfnzFkgOvPhixk9Js1avDbxRc0F6Hu8770TykuVlj97QdW/jRm4q4I6dChTF6ZbCzS440m7oLfXYj2NMU0VhPEhaRYCJCwhmEbJIYN3iT9xRCqpLxwoOALr3eHYyE7uY8lljvGrgW89C23LE2ElS2srqkiCSgl507boHE+JqtMXrTB3M7gLOauU1LMVSoTr68nThMUyxARGMUqQTiBpYLj6OwWJDvf9AdtjNryf+SpKUqqPM/Gl/yJUC8Y1OwvbwF9NjmSMuLNPBSB8sVd1oV88SzpJRmo8FLd1qeK7G4TcilSUjvaWlPXk5uxfjK+2I49YM9Z0MCvXdZOqWDp1oCaHi2fj48auuiuWC0RLAiEAxoZQIsLE5ZwsThxrfCGZH7+xywpACSNeejtIFt0fgwOKFEUqeg1FCqAA2mgUYAdYdoBA21yq7GDgKGaQDMjQAHXFOopYNQBj65e5JgcFdXNOOpEwZMi682YAVLu9vfp2/S3h3hUXM+MyL3n5QW04Qu5WTSA/LLGAwTf/DtzN5ZUWs09lAB2q/hGV4LXfHxgt8O4PybfeF9Y5YKDfizTNdj5YZ1Ieu7E+ruGaLUyC/F8gOIbrTlnM3oxf7qJCMRgTgCgAYWGtLxuqJRrOAMmtSAwERNAAdejgA+zJRm/A3o/gT6RfUCkuFmlE33FgfcxA32C6ut8FlQ22RLIvAAcVjYTXQjFEgYqKCRCVbr6S0HTCYpUG0bVOVbrpw0oJU7w382VfkNEtxLVvS+emTWsxxVqm9seDj8oxn+zICUpky7nvI8V48BNdhzisfv1rzaCgVoqlEXeL2C5B3MzszhWCbV92P4J5WhEGsGxhHEyhhUWqUqDH+fgDBtgTQsUQUqAJOiAswl1xLy8rLsNAuxos3RgDtezgl8OZXx7kJPChojNvn+YUqHr+ZoQBxQ7kSDmLg4YBXxwPXsAUMBUQRp00vNVsxlTJNVYLo79zk2ouGh6M9k7fk+Gs9WM/ThYJSMkh5Vttl+vAYF2M2pwR5D1kSmlSEEyrvu6/acm5k7diV8awuSAam9x1DBQd8lSCwh20wYqBzbJardCiSyhBVgMborUEQxwoRpviWVYbjBNhcMlbTkCk9gtZOC4cNUFvPBuAJPVAk/EURy7MvIyFuAWpEjSh8r3ZO1Ua0McABDMCNsyYADKDAdwkXZhEFmhAVMEFKGAKf25516IWboKLDWGIMKKtSvIfEWvVpiMtwVseHYN5ejoVU7KFMmqYyxTRtMm88Y2vz4TrPI/25azypHd63v3zHhdyLB+YXW2FaGapMhJq2rx5dnZrUUK2SMmwbvXU2junAZ1oIEBeUgYKIsuF5dcgMM7csghREtHhMlIznYEJjz0aFx0Y70pdEWkAKgd2UCiiNUYgIQBAQZcsqS2AD2rXBOnoue4e48ABQEJFKEwiBiAsy9tIk9Fzqoo4zHAQpMmqg5IRiOe6G+DmE9+eK35FVsd+6t3NwiCRwD6pr0yRM9yFmGKbxwvG3XJbfjwrPc9ozUnL5jqB06lYgpTmyMS1ODWJgdXWsOk33SKNSk6oQQznrB8NAQRKMXcAuyBQUVyMsz4hBwCJwhNSsR0U43KMBeIYrm3Pt95nTfR/J5V3eDgRrgBadUEG7FyWiVrbtih3gEy1eBABKBJAdkhQRxaxAEQgFDF7F0Qq8CBmUFGmnswt71IDeG/Gz4k+ti56k7WndWsZXnKBawM0yTRdAoTDcNxsaD9NRWmu5tOd1YbYkNQFDP1OeDk+Wjau5LQTrpicN7tYYWOh5rKAWgyCUMkUZSt87oBjngTYXA7th1S2bh4PljFPwM/+YG4YZ6Qty7KgejUADGo/vp+Ymb6TD5z41I19INkADtgkMl9vWkeWTBGGXbQttbwAIBJgiAkA0XixSzIzjDgdYs7yNlnc4MZS/qDtpbBPUJfKox4axQelxG01aVj7K2UcCEcPFW8TvvLnbT7WOJ9N83CKIZjM71ILNrkIdcX6DyPjZn8w/8On+S1//GcLcF6+/7aPgL+AktsvzcXCjt/jCT2Vm0swQawLf81HMLMyjlzCLcy2JiK39gcETh0dtA+39vLXde/J5tg22ER/yxUfStpBDMT0aR64qVFM8PdH40KA3U+QmJndGmPoqBAYwYiU8UgJW7wqJ6KuiZdtOoBCliLRAFBGFhEmNH54yKGlWrbrRtlF6FLEVvX2FT7eKSVDYhA150bhw3OmMdv2ShgfhmzPJPzON79yP48mYNxk/7l3XWJse19hFQRs4i85uP8I8fTV9Nn3eP/vVWfV9Kv+I1XPJklgOLuJQDMdeO02TJLuaIkbicCOOYwAiFsTthC1jpEcdlGgQ276D179+dbjct/G8UWrt+1zUbVF47wOyG44ruUcD16B/8kVGscOmPNz+e3v439UoVy1yleYFlRuKAlaIiXQL1p5WHRWUatmy0EYMDcZCDEeIKFJCw/k6hQy7WLUlwpKOXsNawRdNYsCvH6H5K50nwU2zJrB9QCFalZTfzMCnmnhTJI5E0TTMdA2CmWEBe40FbWyd5iyfdLnm+Okbv9zD6tp87oanULokQs3JvFBo0ulsX5aGGod1DMhVJ0gRRwJNnTphB1tSaYMhBAOccX2DMYwoGJKNWNgbNxTkVTc+WNxWglJW92hAwr1EeXoh6dUr3Mab3pNrdDig/xIlYvGmjdOTpfuJ8g3qw/KN/eBYIR0nWxZQrLCSIgoc9SOMFGERU0oZ4PvUpY6HT3BC99CwFPyO+4lzM4iii24LYEFkxBRtXruL9FJRvEzD5ybzGbgVPFas7Ehmd7FCUoODYITkLNCx0AtTThbigz58ub/62hpybr27+eNkWGBq/kE041QbCnMz4WpEiiQW2CcdzKWXHufIlCcQKRoGIco56owhIic6t6/Qd1GwSWCUeDsPJHg45fxFwRbcVXE5xIDXoxFwAqVu8yrbztsrn5wOaOIqbtfq4qpq+W4CM4AwsWY8S/ig0HzqBhwoCsBOQdtxPRUZbxiMPw9QbF8wipJxCgHKSikiEbov33WN2/v5iRdxMnxZi8uotma2VFGmEpvLsgvuctbebLoSJtVmvjHDPqX6gSe8y8HFqtEojRXtGXGBVHAaTOUsO4rOzmn4fBY8i6z128JredBNbDLCTTVapa73hY7rAo4KTImRlJ5vN7qiRfHLIH6qfJwKalqMmN0YUJgILX1/3kUjpJRgUEhwNJIh2ICbISdNXn1nKr+Pe7Xp3hGMrdo9JdijATg4cNmdSUZkIzpLzCjbQ5UPirUOi1c+e+/xc7lWg/38qpAuDC8jVUTCQRH70ShSYhAqOMVjkDIWTTxAp6aGJyfBdVkX10Fdf4THhGSsPcnC4EPfkJStKWBzkU2DTcMSD+3LfPGj9xIhkiKPvZje4mro7AYFV5vYJ1rljTM1AN2vyr5vF0oKleA9tCEat14Hh4Iy2Gnx2duHr3vue9igOXecin7nEw5xTxDIwhybF3mbgzlqs5ZkKrUcVJ2yHSBlflwsC7pbljE2Xq4Ppy3RGjHx/LwXa182KBKuPG/sRkK3cwy0/3yBrzQPAG57CZfLpNIa7dvfoVIDcKxHI8i+wY9pA1EDsWwhgo15fMIXi3ixZRi9dYjkEJ2Q/bzsZrZPlnlmmTRo/dXtEINBJ5QiPhHjR7O5mrFUoGhLSUuLNElMo2zpmBSQlg0UCYJJoRTd8TkXGIWAVN54mt7Q4bPHnQs22hsz/VNxXukGCbiSViXegt2FUcC8EmJkGS0A7SInOwu/7puGEpeNDoif082W/XRyJKd+OtcwK2XYVIAECwp4K7F9YgPbXx/RG88KvBji7T/xQkdwNCIOdSgnocihcUKmiAHYPgfORcddka8yspyErVguzouLwhoK+7A5W0PC3wg/lB4NoLJvoDM34TI88H0eG168SMr7p/SIVDQFSAKqGXdkYTmTTspPsgPS7egEus1yLuWiAj15mcXarC3yMk+72R7ZE/zfivb/lmT8CZIERRTYDEIYfp2fVVHNECuKGbQJSZG+JXyRdvV65ld7rICT7J1N7C0p07ep6kngRlV7FDA3E4ong6hRabwN29hEp5KBZrmcdQk1G6kX7Um5mJ0VKDGVBJHpcKhvp9yFjxu4A/RcO+DvYpzlPFZ+celGOYod5lA4qQ8ZdTgjqmQYfFWQuyxeGWzYlk9b6cWuWraCKEG6peWDqMncZGpfMxJob4/GsD+P9cvs5mFBNU3vlnz7QoqNUmLIlQbaCycWYxmRmigZDPLVMUDxcKnDPSwZfBGVBoBGQEjhksil0SYRI9Rpc7LMVaw9f/FdpMCrgoihtlSxU5zDG+3lO+1Mz5+ZxBvO0NEIyoQtEQNBFQGGLrBY0RCBKUbHO9GGcmKZzwjKD3wtJKZNlaWploeAM5yiCiPCjRrPI77nsefyXrsy/9GPi9CQMgmeoKnXgkAB1o2f5fjk+Epwc2dY2x7Ttpy2MJCBFYrIsX1R1I2KETNJpPqmBaACKns0AOvygyOvcIhdnr94ZbyYhEPGHz7TZdQatYBcKmUPA+tIAQNDFSu2u9phBS6EJpGIGMo5L2Iq0yhomaWywML5YJjhLEEDxoj97oxgzLfmLA+3Ou15VIZn5m/T5hd/o/5hCSkPYBnR0WCUWHwks4gR2/Mcm+BEiGPZEH2phJYhUqpTibKpUwVIgO2Fdt2FrgveIdw1+Nj8Woo/t/LxWcjZMLlk3OG7ovdP6P91gsLNuGwl0y552kIai5JRyRDPtYHAKGzxksVCLN1Ztw9Kbyr8b4+GCrhdizOYqh+BmVfKg/t0ybRMsgvdkc8h20l6bAACEBgMuB4OLJaAzUwCcFEqTJHBaZky09mWWV6LdZhOYK5IR5AzGQzMrFVSykkUIJSnVHX5at9yeuOqR8PojPxtWvhEE6MmUkwiEG13CF3P6UqAX/CDlcowSkOGzVHVYE55i/MviBhqJZqYKi0x1Vo2wCPQhNfM/OffmLs3FYqN8Wu9/q4Hf7Rk+2M5Bg3QVvj7If0cwvcU2tH72dfE3FtO1TCCFSCfqVDYBHY3mqUKMEFE/iTD1caHBUdI1Wis3z7WswH4piXV6vzgqN/ruhFF24btNJ3uy15tI6Utt8bRoEnjudz1cwYPa9AZBJdRAGwLV0sM0wUGp7IpvWXce+O/2DqTtSgoKOKY5bWvjqCojuguWiyGRMGWK9U3j35op03Jb0zCE02mCHtDqzdExN5xhwx2ErEEKEZpKcVs3HB134TfYUhUcwEuAJIitrcizl6Ds0JgOAxFhWwyXxkpWEJ4z+7/n6vPivrTYr0q8Wsgfg7hF2fT1dP7NfK5Z/PuZplww75mEZhwfEIjFBCQbCwVQ40BilsDgyV5grK91dFUSJKZKh9Ac8+GAFZPamd2gbySjRnXfXszYvnYkps3l5ycdi1lukQ6R3PbftYxxnKO+HqGuUM4uIQApIWFYaBSRqYsQTg3EPmZf8uq7DmajeyFNIVOCItPwqDpPhTMMjYt9GluHua2pbttmi15MwMN3FL+bIp87qsSKGgj9aii7WJNEug2sACYOBYDBcPQRJVUlDOoIhrEWVxItcIYZwnb2BLf6M27sAp5uc/mytr2Z7vaPv7DUPzMooPpvX1fi69Xja6I5WFJlEhZSkXNADgiAsHKZetYHpQ4NFF69yu2K7rse9z0xgpFNU5r3p2BPT2A1m8ugFim18sLIedyyWCWE33EMnWItcmwtQ0fLhY/mlJEs1mKJQVJG1KGuFvC4xO+TZmVabiwebpzReSAUrEOXcvdoPSXfZvZDl1mv90OlK5UOs1y7cA7IOKAkhsz4WrMDzPTGyAHIZNdtes1G+2qh65tXdZpAV+iyS4Cw8EZX9dZwCM0DNEYL8C0jWGM6MexwFFAK6xjiWsDfA+CaEm14s8gbgUXN98N+wHj3I+5i3Bm+2MHoy8DNqGlRGsMaFyxRjUkaTFaqh8OnEzXHGxXxtKxDzjCH7gwGAVTutsQAAU9HiICeBXADAAxVLmUw6dx0L9xvjOywwGD9bUQgwnG+KfFNRLcEhKqtN9RwiFHX8bNyx3ESct5nOQFBszMDBj613qISBzNR3fd06dyIBUx04bJ4KsFIWuNnsFT8jsJuXiPHc9yvF5XAs5ob1DFYhdJF+/mWm+oCnFEfa4N3CPUXGfbqQ4USrWgUXvxiMfJlMOWCVSZQctt/0Bct8LPAHzBezjZvJqeDwDeTZDm51CxTuD2Bcij8XzNjzBQaTG1BAHZFjquWeLajtmtiRSrlC6KxWhg0JsAbgNQjSYJ4HUACzAFehSg2cI1RjDZACX+dVOrBPJDE2IYoGXZ4BIgLkiTmjRcUKzqbb89NzyCEjpEkL0AtVJQEUfvjEE/qqm2AdiDiDw80o3jLs6PrrbpfwjBYURCar29pwyO2tVqecBFoaCAqXhA+xCBsFOYsmuDuc2mtGmHUqGSKGY5qY3UHFIhVd6Ipj9eEjtS9Q6a78pCsf36wOO/f63d/3IvNRcpywqYvwkPOrFOwFXOPUadnMMwN9DDkAf2j8s1B7EXRFsWmYQmjOhFNRJoa9xqzaeLJtzKESqhSAmlcJDOQYYEPQF0AaQDIB0BdJRwQMK+BuYQMDqB8wpmT1VhVcGugF3B4svoHwFL+PsgIgJYCuDnHwQi4iKMu3ODQ9qnWCFSPqVRbCFibSQWR3plS7oABV03IRA3IyaIfmAw8EBgpPSxuG5Qm0DEGCI6oe/YIyMe2tVR6RjWuX3vORr4RmC3EX7KhrtcXgDALWW7aJx2jdGi8Uf5a59HIcwEwaPfCE1oC39cCkQx6dby/ZsVZB7+jj341y06/NuM41fWMyRXyI6oJ/TGOOYbANZhKStdg71ilKnl55J4B/ImDadXJLCxusoWkAF/0A8NgZQkDEgj0UfEQERaaBEIgYha0Eo0Rh0Cc/xwBH2sYOD1CjTdo+ibsEUwQAFshp26bTH8ARu57FpM9yQys2gkWNblp0MVjEI1qtJx+sp/N5QgIjmWjl72zm3fXvZrDtk0GalBWlZZ34HigHwK/RnHbfU3jqVtEQQAZHy30pS59Q9oHL2TwkUyTULKcmkYkxCSW20tcVtdJwAikWkylWokEE3sKR+Aj74X1QNfoD6AijByZHQidEbtio1nCgRHK2LR2AxskpvAg8ZTNp0ACHZkXKyyHUIosRQdBcS4mkG1EA+WBbwwkR93vMDJixL2xLB30/ZvpXtRCn0RMIz3LV+NFkqqKFSewPOrAD7B0lcPnUo9PWMDeWnTtt0UT9jc0TA08yIpFym/kXkSxHLisoKagdvKwYHQJJSdSqRoJhQiigh1BKiIiJnyPI2RRxiGAiehbg6FhSurq0d8gaYzNFmKeCjgQfdNz6Hbg43Tw+mipVxIMbmIYrBuK7obg9zlBms+75HGfmBRhGAuZXfHNVey8HgqtAbW1sZsU3sURq6Pk52NeHOvIecWAAexJBboRPz7bxa2V4L2qitc9eik98BELM1+08ALihuwgaMMS7c6MgcQiJQupLEfGplQAMCbw8jjxIumIg+jBLUOGfQrDCC0EbfXwFbkqyxOt9P8pPkmHRKxZKvQti1sh7hNkyZDyQFFBIcouQDMqVOKSkkFIRzmp+EaxLUatD82niCzxPqm9JIZz12qz+0z6qfbAJRh6SygcBR5yvWxTUBuiP1yu1Jtj2zL/t0gvFBGLB4a7aDIlMDE8ITB+pnHWhFTEiResiXFVCuh4zqQaDISNQ7Q4MHdMYP6ud2NmoThi2Z3RS4F3PHc1lZwip6mDoZd1GbGmMqTCJKl5WBLqQv4cObxXw+DfWwNaprbbkEeDzLvAYzWTqIGElVAWT8x1uMAdmFpDXBHvLXIocvWPYp0lsYei9CuAlypt2t62y8dRFc8AjCxZt4kaHEYRbHwUB6GAEMJ0IhDykpCNKJW6EWRX/MECjEPLi9cr4PlWDRZvvdF24QLErc6060xbBctymVCbK5bsRgyLN+Xgmz9zIzYMETN1n5RsR5xDo0+dHq5srTHhGWPIHtjGam65abzuxTzMIDvsORWzAcpgrAVQttuuHWXQmBKWhjRluMeWbQ5Xnbv5EqM6zjmt1fciwQQmbAiXTp5jc1DeKYmmCUYqkxLzJDYKAYDKLjg3c1xHd6qt+L7gn/0oQgRMVU8bKqys5TtC9mGbTIKxDZXY55bTgYBoS7nEQgxAxOHm6QyFBnUVPaXw2OK7b7a+MpIEiVBq0Ze3ObjAF7BUpwIlf8wkJYrhp0myIf2w2X9oqtRa27MJJ6lqUF/J09z0RYaDoDt7nYtxznba6ge7hzHj+aJLJvLWgFBA/8EMQJjFAsW2+vPqmCmDNPCsInINGKGWCsthfa/KQaZ47J3kAzwGzjDGxcRE9TlbsmMOKa1V49yJZcDHk1yJSRZcrV1Ty8/N2FfByAfS3Oi5GvFCDJLYMFQ4lHmFa2hadROLnVwF3vdT334k4s54g4lx9P8yTdW15H16HnseeBRzHljNlb6xhkohjzVEko5fa1FbFBw/4pFWlC7wXdlOVzBc7JnNVkhlpAlthDzM+FB/igFiT+KbgaUvNgBinkSixNmAU2Nq2ilUQgNks7GfMjl4apaHn8enQfGatBk+cEsoNCXAG7Gkh1AM2G204zHXCLWP2RCEV1jaZkAgb06AtogMUiEBIRjI0O77OLnje3ZFgZQmQEToElTc8gyYZaGIfO4CmccUpWXcrbC4SZcZPzz/EnwLHO07M/2MTVYiZsVaNFpa2gY0igZudpHbbcO++8jt8BJz1MYjH9iNh4B8B6W8gprZRG8c42Hy0WfaC85xoxWit6yIsJjOfOQYgqDuCD1tlQgbInGqUtcNnSZUQYIoihMKRumlKZhSB1CRSziQAe+aZHozjOFGBOsWBDtQLQujZhJqisctlSBJNh0GEiZXx2usSxXmx8Kxxv08VRa5YYU+gcVx4MAdmJpD+CbGPyc0saVb0zNs7jcdLt/x5Z68S3O0IoIXaB6sxQLSwrswXLEwdTosBdsCdBD4lCWImkWHT2UtBLV0gdD44JqsJuZGFoyYnM0FmoIIi5Cc0m0AmoKrRuY5XLdPMxJZb9lkYdNAiyLVlRxs9fKPy2W/gDupcXbizsGa4na74wT49WyyaZdTl5dPNh2afgrScbXLL0VAMm2kToW30wKl44SF6C3VQUoUS5khzKKhITZIwEQVV23yyUCq5zeRSILBO/Vz+mM4W4rmYR9irJXH3sth3crOxmmWXhwGYP/akrjPgCFeKgQwJsAMhm0nCNnx5szS48DEZAQWw1Pl4inncthsmFGbm0oibAVaUWiKOZiP78XcnT7DAHU7E6l0JimFMoEGMQMQyZtDtPcjtx7TmSOxxwKd+Rdugz7u81rcGB/0OvQW6sgNSTrRRtd16W4VgL4Aw9NJqG5GvoyCY34J55tq1wkLKXb9sVymfiqtZqmZWlEWVItgJwwDvdCYnZ623xEAGkSIoNyyhyCaPYT//usxXxlZ4UbBmep2S5my5RpLdOV36LopFJT+6aXVUdR+RTsTkFr/3p46DPNe46AT+PwUAkSaLvSPb2YQOApCkZLB6QVM8vTlIFNCtYEpBwJl3iOmENBrHSDO5xNHGUDkScyEh2KD+HP35VxTXsyd/HEWA2W6AeCkGk4Uhq+OCUvRnGpJ1CDAu2UoKoBrAFQi4dek9QAaUw0yFhJ0gSSml5+jC5UF7XeQIoEIEIdbkQIfzAaHAg9gRCO5f1ra2hLNzzzeZ6nMHA1AUEGSgEEFfhHFf3jp4iHhpuyQgRJkE4/TRkmmFQJ4gDpIaEQAJ0+m/8WgFMAtHs2ACclOAlQu2cjyCkSOmkDOA7gCEEOU/Q+irSq2NUEVFJ4kwClKlwAoA3fA/+/V1MD";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLocaleNumber(value, locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUsNumber(value) {
  return US_NUMBER_FORMAT.format(value);
}

function resolveLocalization(options = {}) {
  const locale = normalizeLocale(options.i18n?.getLocale?.() ?? options.locale);
  const t = options.i18n?.t
    ? (key, parameters = {}) => options.i18n.t(key, parameters)
    : (key, parameters = {}) => translate(locale, key, parameters);
  return Object.freeze({ locale, t });
}

function massColorClass(value) {
  const normalized = Number(value);
  const classes = new Map([
    [0.2, "mass-color--0-2"],
    [0.5, "mass-color--0-5"],
    [1, "mass-color--1"],
    [2, "mass-color--2"],
  ]);
  return classes.get(normalized) ?? "mass-color--0-2";
}

function buildRuler(layout, t) {
  const { ruler } = layout;
  const ticks = ruler.ticks
    .map((tick) => {
      const major = tick.index % 5 === 0;
      const highlighted = tick.isDropHeight;
      const tickHeight = major || highlighted ? 16 : 10;
      const label = tick.index % 2 === 0 || tick.index === 10
        ? `<text class="ruler-label" x="${tick.x}" y="${ruler.y + 39}" text-anchor="middle">${escapeXml(tick.label)}</text>`
        : "";

      return `
        <line class="ruler-tick${major ? " ruler-tick--major" : ""}${highlighted ? " ruler-tick--drop-height" : ""}" x1="${tick.x}" y1="${ruler.y}" x2="${tick.x}" y2="${ruler.y + tickHeight}" />
        ${label}`;
    })
    .join("");

  return `
    <g id="layer-ruler" data-role="ruler" aria-label="${escapeXml(t("svg.ruler"))}">
      <rect class="ruler-body" x="${ruler.x}" y="${ruler.y}" width="${ruler.width}" height="${ruler.height}" rx="8" />
      ${ticks}
      <text class="ruler-unit" x="${ruler.x + ruler.width + 18}" y="${ruler.y + 39}">m</text>
    </g>`;
}

function buildSensors(layout, locale, t) {
  return layout.sensors
    .map((sensor) => `
      <g id="sensor-${sensor.id}" class="sensor" data-role="sensor" data-sensor-state="idle" data-sensor-id="${sensor.id}" data-position="${sensor.position}" transform="translate(${sensor.x} 0)" tabindex="0" role="img" aria-label="${escapeXml(t("svg.sensor", { id: sensor.id, position: formatLocaleNumber(sensor.position, locale) }))}">
        <line class="sensor-beam" x1="0" y1="${sensor.gateTopY + 12}" x2="0" y2="${sensor.gateBottomY - 6}" />
        <rect class="sensor-head" x="-16" y="${sensor.gateTopY - 10}" width="32" height="22" rx="7" />
        <circle class="sensor-lens" cx="-7" cy="${sensor.gateTopY + 1}" r="4" />
        <text class="sensor-number" x="7" y="${sensor.gateTopY + 5}" text-anchor="middle">${sensor.id}</text>
      </g>`)
    .join("");
}

function buildStringPath(layout) {
  const rope = layout.string;
  return `M ${rope.startX} ${rope.startY}
    L ${rope.pulleyEntryX} ${rope.pulleyEntryY}
    A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${rope.pulleyExitX} ${rope.pulleyExitY}
    L ${rope.endX} ${rope.endY}`;
}

function buildPerson(layout, t) {
  const { person } = layout;
  const cueTextX = person.cue.x + person.cue.width / 2 + 7;
  const cueTextY = person.cue.y + person.cue.height / 2 + 4;
  const playCenterX = person.cue.x + 17;
  const playCenterY = person.cue.y + person.cue.height / 2;
  const label = escapeXml(t("svg.personStart"));

  return `
    <g id="layer-person" class="person-figure" data-role="simulation-starter" tabindex="0" role="button" aria-label="${label}" aria-disabled="false">
      <title id="person-title">${label}</title>
      <rect class="person-hit-area" x="${person.hitArea.x}" y="${person.hitArea.y}" width="${person.hitArea.width}" height="${person.hitArea.height}" rx="24" />
      <rect class="person-focus-ring" x="${person.hitArea.x + 3}" y="${person.hitArea.y + 3}" width="${person.hitArea.width - 6}" height="${person.hitArea.height - 6}" rx="22" />
      <image id="person-holding" class="person-pose person-pose--holding" href="${PERSON_HOLDING_ASSET}" x="${person.holding.x}" y="${person.y}" width="${person.holding.width}" height="${person.height}" preserveAspectRatio="none" draggable="false" />
      <image id="person-resting" class="person-pose person-pose--resting" href="${PERSON_RESTING_ASSET}" x="${person.resting.x}" y="${person.y}" width="${person.resting.width}" height="${person.height}" preserveAspectRatio="none" draggable="false" />
      <g class="person-click-cue" aria-hidden="true">
        <rect x="${person.cue.x}" y="${person.cue.y}" width="${person.cue.width}" height="${person.cue.height}" rx="15" />
        <circle cx="${playCenterX}" cy="${playCenterY}" r="10" />
        <path d="M ${playCenterX - 3} ${playCenterY - 5} L ${playCenterX + 5} ${playCenterY} L ${playCenterX - 3} ${playCenterY + 5} Z" />
        <text id="person-click-cue-label" x="${cueTextX}" y="${cueTextY}" text-anchor="middle">${escapeXml(t("controls.start"))}</text>
      </g>
    </g>`;
}

function buildMassRack(layout, t) {
  const slots = layout.massRack.choices
    .map((choice) => `
      <g class="mass-rack-slot-group"${choice.selected ? ` data-role="mass-placeholder" data-mass-value="${choice.value}" role="img" aria-label="${escapeXml(t("svg.massPlaceholder", { mass: formatUsNumber(choice.value) }))}"` : ""}>
        <rect class="mass-rack-slot${choice.selected ? " mass-rack-slot--empty" : ""}" x="${choice.x}" y="${choice.y}" width="${choice.width}" height="${choice.height}" rx="14" />
        ${choice.selected
          ? `<text class="mass-rack-slot-label" x="${choice.x + choice.width / 2}" y="${choice.y + choice.height / 2 + 7}" text-anchor="middle">${formatUsNumber(choice.value)} kg</text>`
          : ""}
      </g>`)
    .join("");

  const masses = layout.massRack.choices
    .filter((choice) => !choice.selected)
    .map((choice) => `
      <g id="mass-choice-${String(choice.value).replace(".", "-")}" class="mass-choice ${massColorClass(choice.value)}" data-role="mass-choice" data-mass-value="${choice.value}" data-origin-x="${choice.x}" data-origin-y="${choice.y}" transform="translate(${choice.x} ${choice.y})" tabindex="0" role="button" aria-label="${escapeXml(t("svg.massChoice", { mass: formatUsNumber(choice.value) }))}">
        <rect class="mass-choice-body" x="0" y="0" width="${choice.width}" height="${choice.height}" rx="14" />
        <text class="object-label mass-value-label" x="${choice.width / 2}" y="${choice.height / 2 + 7}" text-anchor="middle">${formatUsNumber(choice.value)} kg</text>
      </g>`)
    .join("");

  return `
    <g id="layer-mass-rack" data-role="mass-rack" aria-label="${escapeXml(t("svg.massRack"))}">
      <rect class="mass-rack-support" x="${layout.massRack.x}" y="${layout.massRack.y}" width="${layout.massRack.width}" height="${layout.massRack.height}" rx="8" />
      <g class="mass-rack-slots" aria-hidden="true">${slots}</g>
      ${masses}
    </g>`;
}

/**
 * Produit le SVG complet sous forme de chaîne. Les identifiants et attributs
 * data-role sont stables afin de préparer l'étape d'animation.
 */
function buildStaticApparatusSvg(options = {}) {
  const layout = computeApparatusLayout(options);
  const { parameters } = layout;
  const { locale, t } = resolveLocalization(options);
  const description = t("svg.description", { count: layout.sensorCount });

  return `<svg id="apparatus-svg" class="apparatus-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.viewBox.width} ${layout.viewBox.height}" role="img" aria-labelledby="apparatus-title apparatus-description" preserveAspectRatio="xMidYMid meet" data-person-state="holding">
    <title id="apparatus-title">${escapeXml(t("svg.title"))}</title>
    <desc id="apparatus-description">${escapeXml(description)}</desc>

    <defs>
      <linearGradient id="mobile-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#83d7ff" />
        <stop offset="1" stop-color="#278fc4" />
      </linearGradient>
      <linearGradient id="mass-gradient-0-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffbf69" />
        <stop offset="1" stop-color="#e57a22" />
      </linearGradient>
      <linearGradient id="mass-gradient-0-5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#83dfaa" />
        <stop offset="1" stop-color="#2e9b61" />
      </linearGradient>
      <linearGradient id="mass-gradient-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b7a7ff" />
        <stop offset="1" stop-color="#6853c5" />
      </linearGradient>
      <linearGradient id="mass-gradient-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff9797" />
        <stop offset="1" stop-color="#d84b56" />
      </linearGradient>
      <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-opacity="0.2" />
      </filter>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <pattern id="bench-texture" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 0 16 L 16 0" />
      </pattern>
    </defs>

    <g id="layer-background" aria-hidden="true">
      <rect class="scene-background" x="16" y="16" width="1168" height="${layout.viewBox.height - 32}" rx="28" />
    </g>


    <g id="layer-track" data-role="track">
      <rect class="bench-top" x="${layout.track.x}" y="${layout.track.y}" width="${layout.track.width}" height="${layout.track.height}" rx="8" />
      <rect class="bench-texture" x="${layout.track.x}" y="${layout.track.y + 7}" width="${layout.track.width}" height="${layout.track.height - 14}" rx="5" />
      <path class="bench-edge" d="M ${layout.track.x} ${layout.track.y + layout.track.height} H ${layout.track.endX}" />
      <path class="bench-leg" d="M ${layout.track.x + 90} ${layout.track.y + layout.track.height} L ${layout.track.x + 72} ${layout.track.y + 139} H ${layout.track.x + 152} L ${layout.track.x + 134} ${layout.track.y + layout.track.height}" />
      <path class="bench-leg" d="M ${layout.track.endX - 132} ${layout.track.y + layout.track.height} L ${layout.track.endX - 150} ${layout.track.y + 139} H ${layout.track.endX - 70} L ${layout.track.endX - 88} ${layout.track.y + layout.track.height}" />
    </g>

    ${buildRuler(layout, t)}

    <g id="layer-sensors" aria-label="${escapeXml(t("svg.sensors", { count: layout.sensorCount }))}">
      ${buildSensors(layout, locale, t)}
    </g>

    <g id="layer-pulley" data-role="pulley">
      <line class="pulley-support" x1="${layout.track.endX}" y1="${layout.track.y}" x2="${layout.pulley.centerX}" y2="${layout.pulley.centerY}" />
      <circle class="pulley-wheel" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius}" />
      <circle class="pulley-groove" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="${layout.pulley.radius - 7}" />
      <circle class="pulley-hub" cx="${layout.pulley.centerX}" cy="${layout.pulley.centerY}" r="5" />
    </g>

    <g id="layer-string" data-role="string" aria-label="${escapeXml(t("svg.string"))}">
      <path id="string-path" class="string-path" data-role="string-path" d="${buildStringPath(layout)}" />
    </g>

    <g id="layer-mobile" data-role="mobile" transform="translate(${layout.mobile.x} ${layout.mobile.y})">
      <rect id="mobile-body" class="mobile-body" data-role="mobile-body" x="0" y="0" width="${layout.mobile.width}" height="${layout.mobile.height}" rx="18" />
      <circle class="mobile-port" cx="${layout.mobile.width}" cy="${layout.mobile.height / 2}" r="5" />
      <text class="object-label mass-value-label" x="${layout.mobile.width / 2}" y="${layout.mobile.height / 2 + 7}" text-anchor="middle">1 kg</text>
    </g>

    <g id="layer-socle" data-role="socle">
      <rect class="socle-top" x="${layout.socle.x}" y="${layout.socle.y}" width="${layout.socle.width}" height="${layout.socle.height}" rx="8" />
    </g>

    ${buildPerson(layout, t)}

    <g id="layer-hanging-mass" class="${massColorClass(parameters.m2)}" data-role="hanging-mass" data-mass-value="${parameters.m2}" transform="translate(${layout.hangingMass.x} ${layout.hangingMass.y})">
      <rect id="mass-drop-target" class="mass-drop-target" x="-9" y="-9" width="${layout.hangingMass.width + 18}" height="${layout.hangingMass.height + 18}" rx="20" aria-hidden="true" />
      <rect id="hanging-mass-body" class="hanging-mass-body" data-role="hanging-mass-body" x="0" y="0" width="${layout.hangingMass.width}" height="${layout.hangingMass.height}" rx="14" />
      <text class="object-label mass-value-label" x="${layout.hangingMass.width / 2}" y="50" text-anchor="middle">${formatUsNumber(parameters.m2)} kg</text>
    </g>

    ${buildMassRack(layout, t)}

    <g id="layer-height-guide" aria-label="${escapeXml(t("svg.dropHeight", { height: formatLocaleNumber(parameters.dropHeight, locale) }))}">
      <line class="height-guide" x1="${layout.heightGuide.x}" y1="${layout.heightGuide.topY}" x2="${layout.heightGuide.x}" y2="${layout.heightGuide.bottomY}" marker-start="url(#arrow-head)" marker-end="url(#arrow-head)" />
      <text class="dimension-label height-label" x="${layout.heightGuide.x + 14}" y="${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2}" text-anchor="middle" transform="rotate(-90 ${layout.heightGuide.x + 14} ${(layout.heightGuide.topY + layout.heightGuide.bottomY) / 2})">${formatUsNumber(parameters.dropHeight)} m</text>
    </g>

  </svg>`;
}

/** Met à jour les libellés accessibles du SVG sans réinitialiser la simulation. */
function localizeStaticApparatus(svg, layout, i18n) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (!layout || !Array.isArray(layout.sensors)) {
    throw new TypeError("Un layout de montage valide est requis.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.getLocale !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const locale = i18n.getLocale();
  const setText = (selector, value) => {
    const element = svg.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setLabel = (selector, value) => svg.querySelector(selector)?.setAttribute?.("aria-label", value);

  setText("#apparatus-title", i18n.t("svg.title"));
  setText("#apparatus-description", i18n.t("svg.description", { count: layout.sensorCount }));
  setLabel("#layer-ruler", i18n.t("svg.ruler"));
  setLabel("#layer-sensors", i18n.t("svg.sensors", { count: layout.sensorCount }));
  setLabel("#layer-string", i18n.t("svg.string"));
  setLabel("#layer-mass-rack", i18n.t("svg.massRack"));
  setLabel("#layer-height-guide", i18n.t("svg.dropHeight", {
    height: formatLocaleNumber(layout.parameters.dropHeight, locale),
  }));

  for (const sensor of layout.sensors) {
    setLabel(`#sensor-${sensor.id}`, i18n.t("svg.sensor", {
      id: sensor.id,
      position: formatLocaleNumber(sensor.position, locale),
    }));
  }
  for (const choice of layout.massRack.choices) {
    const id = String(choice.value).replace(".", "-");
    setLabel(`#mass-choice-${id}`, i18n.t("svg.massChoice", { mass: formatUsNumber(choice.value) }));
  }
  for (const placeholder of svg.querySelectorAll?.('[data-role="mass-placeholder"]') ?? []) {
    const mass = formatUsNumber(Number(placeholder.getAttribute?.("data-mass-value")));
    placeholder.setAttribute?.("aria-label", i18n.t("svg.massPlaceholder", { mass }));
  }
  return locale;
}

/** Monte le SVG dans un conteneur existant et retourne l'élément SVG. */
function mountStaticApparatus(container, options = {}) {
  if (!container || typeof container !== "object" || !("innerHTML" in container)) {
    throw new TypeError("Un conteneur DOM disposant de innerHTML est requis.");
  }

  container.innerHTML = buildStaticApparatusSvg(options);
  return typeof container.querySelector === "function"
    ? container.querySelector("#apparatus-svg")
    : null;
}

return Object.freeze({ buildStaticApparatusSvg, localizeStaticApparatus, mountStaticApparatus });
})();

modules.animation = (() => {

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function assertFiniteState(state, name) {
  if (state === null || typeof state !== "object") {
    throw new TypeError(`${name} doit être un objet d'état.`);
  }

  for (const field of ["position", "hangingDisplacement"]) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`${name}.${field} doit être un nombre fini.`);
    }
  }
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Calcule la géométrie affichée entre deux états physiques consécutifs.
 * Cette fonction pure permet de tester l'animation sans navigateur.
 */
function computeAnimatedApparatusFrame(
  layout,
  currentState,
  previousState = currentState,
  interpolationAlpha = 1,
) {
  if (layout === null || typeof layout !== "object") {
    throw new TypeError("Un layout de montage est requis.");
  }

  assertFiniteState(currentState, "currentState");
  assertFiniteState(previousState, "previousState");

  if (!Number.isFinite(interpolationAlpha)) {
    throw new TypeError("interpolationAlpha doit être un nombre fini.");
  }

  const alpha = clamp(interpolationAlpha, 0, 1);
  const position = clamp(
    interpolate(previousState.position, currentState.position, alpha),
    0,
    layout.motionScale?.maximumMobilePosition ?? layout.parameters.trackLength,
  );
  const hangingDisplacement = clamp(
    interpolate(
      previousState.hangingDisplacement,
      currentState.hangingDisplacement,
      alpha,
    ),
    0,
    layout.parameters.dropHeight,
  );

  // Les deux solides utilisent la même échelle graphique : un déplacement
  // physique identique produit le même déplacement en pixels à l'écran.
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  const mobileX = layout.mobile.x + position * pixelsPerMeter;
  const mobileY = layout.mobile.y;

  // En phase 1, S2 descend exactement du même nombre de pixels que S1 avance.
  // Le support a été placé à h × pixelsPerMeter sous la position initiale.
  const hangingMassY = layout.hangingMass.y
    + hangingDisplacement * pixelsPerMeter;

  const ropeStartX = mobileX + layout.mobile.width;
  const ropeY = layout.string.startY;
  const ropeEntryX = layout.string.pulleyEntryX;
  const ropeEntryY = layout.string.pulleyEntryY;
  const ropeExitX = layout.string.pulleyExitX;
  const ropeExitY = layout.string.pulleyExitY;
  const ropeEndY = hangingMassY;
  const afterDropDistance = Math.max(0, position - layout.parameters.dropHeight);
  const afterDropRatio = layout.parameters.trackLength > layout.parameters.dropHeight
    ? clamp(
        afterDropDistance
          / (layout.parameters.trackLength - layout.parameters.dropHeight),
        0,
        1,
      )
    : 0;
  const slack = currentState.phase === 2 || afterDropDistance > 0;

  let ropePath;
  if (slack) {
    const horizontalSpan = Math.max(1, ropeEntryX - ropeStartX);
    const sag = 10 + 34 * afterDropRatio;
    const firstControlX = ropeStartX + horizontalSpan * 0.34;
    const secondControlX = ropeStartX + horizontalSpan * 0.7;

    ropePath = `M ${ropeStartX} ${ropeY}
      C ${firstControlX} ${ropeY + sag}, ${secondControlX} ${ropeY + sag}, ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  } else {
    ropePath = `M ${ropeStartX} ${ropeY}
      L ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  }

  return Object.freeze({
    position,
    hangingDisplacement,
    mobileX,
    mobileY,
    hangingMassX: layout.hangingMass.x,
    hangingMassY,
    ropePath,
    slack,
  });
}

function requireSvgElement(svg, selector) {
  const element = svg.querySelector(selector);
  if (!element) {
    throw new Error(`Élément SVG introuvable : ${selector}`);
  }
  return element;
}

/**
 * Relie un SVG déjà monté au moteur temporel. Le rendu ne modifie que les
 * transformations de S1 et S2 ainsi que le tracé du fil.
 */
function createApparatusAnimator(svg, layout) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }

  const mobileLayer = requireSvgElement(svg, "#layer-mobile");
  const hangingMassLayer = requireSvgElement(svg, "#layer-hanging-mass");
  const stringPath = requireSvgElement(svg, "#string-path");
  const description = svg.querySelector("#apparatus-description");

  function render(currentState, previousState = currentState, meta = {}) {
    const terminal = ["blocked", "finished"].includes(currentState.status);
    const snapToCurrent = terminal || Boolean(meta.reason) || meta.running === false;
    const interpolationAlpha = snapToCurrent ? 1 : (meta.interpolationAlpha ?? 1);
    const frame = computeAnimatedApparatusFrame(
      layout,
      currentState,
      previousState,
      interpolationAlpha,
    );

    mobileLayer.setAttribute(
      "transform",
      `translate(${frame.mobileX} ${frame.mobileY})`,
    );
    hangingMassLayer.setAttribute(
      "transform",
      `translate(${frame.hangingMassX} ${frame.hangingMassY})`,
    );
    stringPath.setAttribute("d", frame.ropePath);
    stringPath.setAttribute("data-tension", frame.slack ? "slack" : "taut");
    svg.setAttribute("data-phase", String(currentState.phase));
    svg.setAttribute("data-status", String(currentState.status));

    if (description) {
      const ropeState = frame.slack ? "fil détendu" : "fil tendu";
      description.textContent = `S1 à ${frame.position.toFixed(3)} m, S2 descendue de ${frame.hangingDisplacement.toFixed(3)} m, ${ropeState}.`;
    }

    return frame;
  }

  return Object.freeze({ render });
}

return Object.freeze({ computeAnimatedApparatusFrame, createApparatusAnimator });
})();

modules.appState = (() => {
const { DEFAULT_PARAMETERS, FIXED_DROP_HEIGHT, FIXED_M1, FIXED_SENSOR_COUNT, FIXED_TRACK_LENGTH, SIMULATION_MODES } = modules.constants;
const { SENSOR_COUNT_LIMITS } = modules.geometry;
const { PLAYBACK_SPEED_LIMITS } = modules.timeLoop;
const { PhysicsParameterError, createInitialState, validateParameters, validateSimulationState } = modules.physics;
const DEFAULT_EXPERIMENTAL_SETTINGS = Object.freeze({
  sensorCount: SENSOR_COUNT_LIMITS.default,
  measurementNoiseStdDev: 0,
  timeMeasurementNoiseStdDev: 0,
});

const DEFAULT_DISPLAY_SETTINGS = Object.freeze({
  showMeasurements: false,
  showCurves: false,
});

const DEFAULT_PLAYBACK_SPEED = 1;

function freezeRecordArray(items = []) {
  return Object.freeze(items.map((item) => Object.freeze({ ...item })));
}

function freezeSnapshot(snapshot) {
  return Object.freeze({
    mode: snapshot.mode,
    parameters: snapshot.parameters,
    experimental: Object.freeze({ ...snapshot.experimental }),
    playbackSpeed: snapshot.playbackSpeed,
    simulation: snapshot.simulation,
    display: Object.freeze({ ...snapshot.display }),
    measurements: freezeRecordArray(snapshot.measurements),
    continuousData: freezeRecordArray(snapshot.continuousData),
    revision: snapshot.revision,
  });
}

function validateModeId(value, { allowNull = true } = {}) {
  if (value === null && allowNull) return null;
  if (typeof value !== "string" || !Object.hasOwn(SIMULATION_MODES, value)) {
    throw new PhysicsParameterError(`Mode de simulation inconnu : ${String(value)}.`);
  }
  return value;
}

function validateSensorCount(value) {
  const normalized = Number(value);
  if (
    !Number.isInteger(normalized)
    || normalized < SENSOR_COUNT_LIMITS.min
    || normalized > SENSOR_COUNT_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `Le nombre de capteurs doit être un entier appartenant à [${SENSOR_COUNT_LIMITS.min}, ${SENSOR_COUNT_LIMITS.max}].`,
    );
  }
  return normalized;
}

function validatePlaybackSpeed(value) {
  const normalized = Number(value);
  if (
    !Number.isFinite(normalized)
    || normalized < PLAYBACK_SPEED_LIMITS.min
    || normalized > PLAYBACK_SPEED_LIMITS.max
  ) {
    throw new PhysicsParameterError(
      `La vitesse de lecture doit appartenir à [${PLAYBACK_SPEED_LIMITS.min}, ${PLAYBACK_SPEED_LIMITS.max}].`,
    );
  }
  return normalized;
}

function normalizeMeasurement(measurement, parameters, sequence) {
  if (!measurement || typeof measurement !== "object") {
    throw new TypeError("Chaque mesure doit être un objet.");
  }

  const normalized = {
    sequence,
    sensorId: Number(measurement.sensorId),
    position: Number(measurement.position),
    mobilePosition: Number(measurement.mobilePosition),
    time: Number(measurement.time),
    velocity: Number(measurement.velocity),
    acceleration: Number(measurement.acceleration),
    phase: Number(measurement.phase),
  };

  if (!Number.isInteger(normalized.sensorId) || normalized.sensorId <= 0) {
    throw new PhysicsParameterError("measurement.sensorId doit être un entier strictement positif.");
  }
  for (const field of ["position", "mobilePosition", "time", "velocity", "acceleration"]) {
    if (!Number.isFinite(normalized[field])) {
      throw new TypeError(`measurement.${field} doit être un nombre fini.`);
    }
  }
  if (normalized.position < 0 || normalized.position > parameters.trackLength) {
    throw new PhysicsParameterError("La position mesurée doit rester comprise sur le banc.");
  }
  if (normalized.mobilePosition < 0 || normalized.mobilePosition > parameters.trackLength) {
    throw new PhysicsParameterError("La position du mobile doit rester comprise sur le banc.");
  }
  if (normalized.time < 0 || normalized.velocity < 0) {
    throw new PhysicsParameterError("Le temps et la vitesse mesurés doivent être positifs ou nuls.");
  }
  if (![1, 2].includes(normalized.phase)) {
    throw new PhysicsParameterError("measurement.phase doit valoir 1 ou 2.");
  }

  return Object.freeze(normalized);
}

function normalizeInitialMeasurements(items, parameters) {
  if (!Array.isArray(items)) {
    throw new TypeError("measurements doit être un tableau.");
  }
  const ids = new Set();
  return items.map((item, index) => {
    const measurement = normalizeMeasurement(item, parameters, index + 1);
    if (ids.has(measurement.sensorId)) {
      throw new PhysicsParameterError("Un capteur ne peut posséder qu'une mesure par expérience.");
    }
    ids.add(measurement.sensorId);
    return measurement;
  });
}

function sameParameters(left, right) {
  return ["m1", "m2", "dropHeight", "trackLength", "friction", "gravityMode"]
    .every((key) => left[key] === right[key]);
}

function createExperimentalSettings(modeId) {
  const mode = modeId ? SIMULATION_MODES[modeId] : null;
  return Object.freeze({
    sensorCount: FIXED_SENSOR_COUNT,
    measurementNoiseStdDev: mode?.measurementNoiseStdDev ?? 0,
    timeMeasurementNoiseStdDev: mode?.timeMeasurementNoiseStdDev ?? 0,
  });
}

/**
 * État central de l'application. Il constitue la source unique de vérité pour
 * le mode, les paramètres, l'état physique et les mesures de l'expérience.
 */
function createAppState(initial = {}) {
  if (initial === null || typeof initial !== "object") {
    throw new TypeError("La configuration initiale doit être un objet.");
  }

  const mode = validateModeId(initial.mode ?? null);
  const modeDefinition = mode ? SIMULATION_MODES[mode] : null;
  const parameters = validateParameters({
    ...DEFAULT_PARAMETERS,
    ...(initial.parameters ?? {}),
    m1: FIXED_M1,
    dropHeight: FIXED_DROP_HEIGHT,
    trackLength: FIXED_TRACK_LENGTH,
    friction: modeDefinition?.friction
      ?? initial.parameters?.friction
      ?? DEFAULT_PARAMETERS.friction,
  });
  const playbackSpeed = validatePlaybackSpeed(
    initial.playbackSpeed ?? DEFAULT_PLAYBACK_SPEED,
  );
  const simulation = initial.simulation
    ? validateSimulationState(initial.simulation, parameters)
    : createInitialState(parameters);

  let snapshot = freezeSnapshot({
    mode,
    parameters,
    experimental: createExperimentalSettings(mode),
    playbackSpeed,
    simulation,
    display: {
      ...DEFAULT_DISPLAY_SETTINGS,
      ...(initial.display ?? {}),
    },
    measurements: normalizeInitialMeasurements(initial.measurements ?? [], parameters),
    continuousData: initial.continuousData ?? [],
    revision: 0,
  });
  let destroyed = false;
  const listeners = new Set();

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cet état central a été détruit.");
    }
  }

  function notify(reason, detail = {}) {
    const meta = Object.freeze({ reason, ...detail });
    for (const listener of [...listeners]) {
      listener(snapshot, meta);
    }
  }

  function replace(next, reason, detail = {}) {
    snapshot = freezeSnapshot(next);
    notify(reason, detail);
    return snapshot;
  }

  function getSnapshot() {
    return snapshot;
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertUsable();
    if (typeof listener !== "function") {
      throw new TypeError("L'abonné doit être une fonction.");
    }
    listeners.add(listener);
    if (emitCurrent) {
      listener(snapshot, Object.freeze({ reason: "subscription" }));
    }
    return () => listeners.delete(listener);
  }

  function selectMode(modeId) {
    assertUsable();
    const normalizedMode = validateModeId(modeId, { allowNull: false });
    const definition = SIMULATION_MODES[normalizedMode];
    const nextParameters = validateParameters({
      ...snapshot.parameters,
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
      friction: definition.friction,
    });

    return replace({
      ...snapshot,
      mode: normalizedMode,
      parameters: nextParameters,
      experimental: createExperimentalSettings(normalizedMode),
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "mode-change", {
      previousMode: snapshot.mode,
      mode: normalizedMode,
    });
  }

  function clearMode() {
    assertUsable();
    if (snapshot.mode === null) return snapshot;
    const nextParameters = validateParameters({
      ...snapshot.parameters,
      friction: DEFAULT_PARAMETERS.friction,
    });

    return replace({
      ...snapshot,
      mode: null,
      parameters: nextParameters,
      experimental: createExperimentalSettings(null),
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "mode-cleared", { previousMode: snapshot.mode });
  }

  function updateParameters(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les paramètres partiels doivent être un objet.");
    }
    const fixedParameters = Object.freeze({
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
    });
    for (const [key, fixedValue] of Object.entries(fixedParameters)) {
      if (Object.hasOwn(partial, key) && Number(partial[key]) !== fixedValue) {
        const labels = {
          m1: "La masse de S1",
          dropHeight: "La hauteur de chute",
          trackLength: "La longueur du banc",
        };
        const units = { m1: "kg", dropHeight: "m", trackLength: "m" };
        throw new PhysicsParameterError(
          `${labels[key]} est fixée à ${fixedValue} ${units[key]}.`,
        );
      }
    }

    if (
      snapshot.mode
      && Object.hasOwn(partial, "friction")
      && Number(partial.friction) !== SIMULATION_MODES[snapshot.mode].friction
    ) {
      throw new PhysicsParameterError(
        "Le coefficient de frottement est imposé par le mode de simulation.",
      );
    }

    const nextParameters = validateParameters({
      ...snapshot.parameters,
      ...partial,
      m1: FIXED_M1,
      dropHeight: FIXED_DROP_HEIGHT,
      trackLength: FIXED_TRACK_LENGTH,
      friction: snapshot.mode
        ? SIMULATION_MODES[snapshot.mode].friction
        : Number(partial.friction ?? snapshot.parameters.friction),
    });
    if (sameParameters(snapshot.parameters, nextParameters)) {
      return snapshot;
    }

    return replace({
      ...snapshot,
      parameters: nextParameters,
      simulation: createInitialState(nextParameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "parameters-change", { changedKeys: Object.freeze(Object.keys(partial)) });
  }

  function updateExperimental(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les réglages expérimentaux partiels doivent être un objet.");
    }

    if (
      Object.hasOwn(partial, "sensorCount")
      && validateSensorCount(partial.sensorCount) !== FIXED_SENSOR_COUNT
    ) {
      throw new PhysicsParameterError(
        `Le nombre de capteurs est fixé à ${FIXED_SENSOR_COUNT}.`,
      );
    }
    if (
      Object.hasOwn(partial, "measurementNoiseStdDev")
      || Object.hasOwn(partial, "timeMeasurementNoiseStdDev")
    ) {
      throw new PhysicsParameterError(
        "Le bruit des mesures est imposé par le mode de simulation.",
      );
    }

    return snapshot;
  }

  function setPlaybackSpeed(value) {
    assertUsable();
    const nextPlaybackSpeed = validatePlaybackSpeed(value);
    if (nextPlaybackSpeed === snapshot.playbackSpeed) {
      return snapshot;
    }

    return replace({
      ...snapshot,
      playbackSpeed: nextPlaybackSpeed,
    }, "playback-speed-change");
  }

  function setSimulationState(nextSimulation) {
    assertUsable();
    const simulationState = validateSimulationState(
      nextSimulation,
      snapshot.parameters,
    );
    snapshot = freezeSnapshot({ ...snapshot, simulation: simulationState });
    notify("simulation-change");
    return snapshot;
  }

  function addMeasurements(items) {
    assertUsable();
    if (!Array.isArray(items)) {
      throw new TypeError("Les mesures à enregistrer doivent être fournies dans un tableau.");
    }

    const existingIds = new Set(snapshot.measurements.map((item) => item.sensorId));
    const accepted = [];

    for (const item of items) {
      const sequence = snapshot.measurements.length + accepted.length + 1;
      const measurement = normalizeMeasurement(item, snapshot.parameters, sequence);
      if (existingIds.has(measurement.sensorId)) continue;
      existingIds.add(measurement.sensorId);
      accepted.push(measurement);
    }

    if (accepted.length === 0) return snapshot;

    return replace({
      ...snapshot,
      measurements: [...snapshot.measurements, ...accepted],
    }, "measurements-recorded", {
      measurementCount: accepted.length,
      sensorIds: Object.freeze(accepted.map((item) => item.sensorId)),
    });
  }

  function resetExperiment() {
    assertUsable();
    return replace({
      ...snapshot,
      simulation: createInitialState(snapshot.parameters),
      measurements: [],
      continuousData: [],
      revision: snapshot.revision + 1,
    }, "experiment-reset");
  }

  function updateDisplay(partial) {
    assertUsable();
    if (partial === null || typeof partial !== "object") {
      throw new TypeError("Les réglages d'affichage partiels doivent être un objet.");
    }

    const nextDisplay = {
      ...snapshot.display,
      ...partial,
    };
    for (const key of ["showMeasurements", "showCurves"]) {
      if (typeof nextDisplay[key] !== "boolean") {
        throw new TypeError(`${key} doit être un booléen.`);
      }
    }

    return replace({ ...snapshot, display: nextDisplay }, "display-change");
  }

  function destroy() {
    if (destroyed) return false;
    listeners.clear();
    destroyed = true;
    return true;
  }

  return Object.freeze({
    getSnapshot,
    subscribe,
    selectMode,
    clearMode,
    updateParameters,
    updateExperimental,
    setPlaybackSpeed,
    setSimulationState,
    addMeasurements,
    resetExperiment,
    updateDisplay,
    destroy,
  });
}

return Object.freeze({ DEFAULT_EXPERIMENTAL_SETTINGS, DEFAULT_DISPLAY_SETTINGS, DEFAULT_PLAYBACK_SPEED, createAppState });
})();

modules.modeSelector = (() => {
const { SIMULATION_MODES } = modules.constants;
function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de sélection du mode introuvable : ${selector}`);
  }
  return element;
}

function setInert(element, inert) {
  if (!element) return;
  element.inert = Boolean(inert);
  if (inert) element.setAttribute?.("inert", "");
  else element.removeAttribute?.("inert");
}

/**
 * Relie l'écran d'accueil à l'état central et permet de revenir au choix du
 * mode depuis la simulation. Le focus suit le changement d'écran afin qu'une
 * navigation au clavier ou avec un lecteur d'écran conserve un point d'ancrage
 * explicite après chaque transition.
 */
function bindModeSelector(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (
    !appState
    || typeof appState.selectMode !== "function"
    || typeof appState.clearMode !== "function"
  ) {
    throw new TypeError("Un état central prenant en charge les modes est requis.");
  }

  const selectionScreen = getRequiredElement(root, "#mode-selection");
  const simulationScreen = getRequiredElement(root, "#simulation-screen");
  const idealButton = getRequiredElement(root, "#mode-ideal-button");
  const frictionButton = getRequiredElement(root, "#mode-friction-button");
  const homeButton = getRequiredElement(root, "#mode-home-button");
  const startButton = root.querySelector("#start-button");
  const listeners = [];
  let returnFocusTarget = idealButton;

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function sync(snapshot = appState.getSnapshot()) {
    const hasMode = Boolean(snapshot.mode);
    selectionScreen.hidden = hasMode;
    simulationScreen.hidden = !hasMode;
    selectionScreen.setAttribute("aria-hidden", String(hasMode));
    simulationScreen.setAttribute("aria-hidden", String(!hasMode));
    setInert(selectionScreen, hasMode);
    setInert(simulationScreen, !hasMode);
  }

  function scrollViewportToTop() {
    const view = root.defaultView ?? root.ownerDocument?.defaultView;
    if (typeof view?.scrollTo === "function") {
      view.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  function enterMode(mode, sourceButton) {
    returnFocusTarget = sourceButton;
    appState.selectMode(mode);
    scrollViewportToTop();
    startButton?.focus?.({ preventScroll: true });
  }

  listen(idealButton, "click", () => enterMode("ideal", idealButton));
  listen(frictionButton, "click", () => enterMode("friction", frictionButton));
  listen(homeButton, "click", () => {
    const currentMode = appState.getSnapshot().mode;
    if (currentMode === "friction") returnFocusTarget = frictionButton;
    else if (currentMode === "ideal") returnFocusTarget = idealButton;
    appState.clearMode();
    scrollViewportToTop();
    returnFocusTarget?.focus?.({ preventScroll: true });
  });

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (["mode-change", "mode-cleared", "subscription"].includes(meta.reason)) {
      sync(snapshot);
    }
  }, { emitCurrent: true });

  return Object.freeze({
    sync,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}

return Object.freeze({ bindModeSelector });
})();

modules.parameterControls = (() => {

const PLAYBACK_CONTROLS = Object.freeze({
  range: "#playback-speed-range",
  number: "#playback-speed-number",
});

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de paramétrage introuvable : ${selector}`);
  }
  return element;
}

function setPairValue(pair, value) {
  const normalized = String(value);
  pair.range.value = normalized;
  pair.number.value = normalized;
}

function setInvalid(pair, invalid) {
  const value = invalid ? "true" : "false";
  pair.range.setAttribute("aria-invalid", value);
  pair.number.setAttribute("aria-invalid", value);
}

/** Relie uniquement la vitesse de lecture à l'état central. */
function bindParameterControls(root, appState) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const playbackPair = {
    range: getRequiredElement(root, PLAYBACK_CONTROLS.range),
    number: getRequiredElement(root, PLAYBACK_CONTROLS.number),
  };
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function sync(snapshot = appState.getSnapshot()) {
    setPairValue(playbackPair, snapshot.playbackSpeed);
    setInvalid(playbackPair, false);
  }

  function commit(rawValue) {
    try {
      setInvalid(playbackPair, false);
      appState.setPlaybackSpeed(Number(rawValue));
      sync();
    } catch {
      sync();
      setInvalid(playbackPair, true);
    }
  }

  listen(playbackPair.range, "input", () => {
    playbackPair.number.value = playbackPair.range.value;
    commit(playbackPair.range.value);
  });
  listen(playbackPair.number, "change", () => {
    playbackPair.range.value = playbackPair.number.value;
    commit(playbackPair.number.value);
  });

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (meta.reason !== "simulation-change") sync(snapshot);
  });

  sync();

  return Object.freeze({
    sync,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}

return Object.freeze({ bindParameterControls });
})();

modules.massSelector = (() => {

const MASS_EPSILON = 1e-9;
const TAP_MOVEMENT_THRESHOLD_PX = 8;

function asFiniteNumber(value, name) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new TypeError(`${name} doit être un nombre fini.`);
  }
  return normalized;
}

function sameMass(left, right) {
  return Math.abs(Number(left) - Number(right)) <= MASS_EPSILON;
}

function isPointInsideRect(point, rect) {
  if (!point || typeof point !== "object") {
    throw new TypeError("Un point est requis.");
  }
  if (!rect || typeof rect !== "object") {
    throw new TypeError("Un rectangle est requis.");
  }

  const x = asFiniteNumber(point.x, "point.x");
  const y = asFiniteNumber(point.y, "point.y");
  const left = asFiniteNumber(rect.left, "rect.left");
  const right = asFiniteNumber(rect.right, "rect.right");
  const top = asFiniteNumber(rect.top, "rect.top");
  const bottom = asFiniteNumber(rect.bottom, "rect.bottom");

  return x >= left && x <= right && y >= top && y <= bottom;
}

function getSvgScale(svg) {
  const clientRect = svg.getBoundingClientRect?.();
  const viewBox = svg.viewBox?.baseVal;

  if (
    clientRect
    && clientRect.width > 0
    && clientRect.height > 0
    && viewBox
    && viewBox.width > 0
    && viewBox.height > 0
  ) {
    return Object.freeze({
      x: viewBox.width / clientRect.width,
      y: viewBox.height / clientRect.height,
    });
  }

  return Object.freeze({ x: 1, y: 1 });
}

function getMassValue(element) {
  return asFiniteNumber(
    element.dataset?.massValue ?? element.getAttribute?.("data-mass-value"),
    "data-mass-value",
  );
}

/**
 * Relie les masses dessinées dans le SVG au paramètre m2. Une masse est
 * déplacée au pointeur vers S2 ; un appui bref la sélectionne directement et,
 * au clavier, Entrée ou Espace effectue le même remplacement. Le changement de paramètre reconstruit ensuite le montage,
 * ce qui remet automatiquement l'ancienne masse sur le support de rangement.
 */
function createMassSelector(svg, options = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (typeof options.onSelect !== "function") {
    throw new TypeError("onSelect doit être une fonction.");
  }

  const target = svg.querySelector("#layer-hanging-mass");
  if (!target) {
    throw new Error("La masse suspendue est introuvable.");
  }

  const choices = Array.from(
    svg.querySelectorAll?.('[data-role="mass-choice"]') ?? [],
  );
  const listeners = [];
  let active = null;
  let destroyed = false;

  function listen(element, name, callback) {
    element.addEventListener?.(name, callback);
    listeners.push(() => element.removeEventListener?.(name, callback));
  }

  function setDropState(overTarget) {
    svg.setAttribute?.("data-mass-dragging", active ? "true" : "false");
    target.classList?.toggle("mass-drop-target--active", Boolean(active && overTarget));
  }

  function restoreActive() {
    if (!active) return;
    active.element.setAttribute?.("transform", active.originTransform);
    active.element.classList?.remove("mass-choice--dragging");
    active.element.releasePointerCapture?.(active.pointerId);
    active = null;
    setDropState(false);
  }

  function isOverTarget(event) {
    if (!target.getBoundingClientRect) return false;
    return isPointInsideRect(
      { x: Number(event.clientX), y: Number(event.clientY) },
      target.getBoundingClientRect(),
    );
  }

  function beginDrag(element, event) {
    if (destroyed || active) return;
    if (event.button !== undefined && event.button !== 0) return;

    const value = getMassValue(element);
    if (sameMass(value, options.selectedMass)) return;

    active = {
      element,
      value,
      pointerId: event.pointerId,
      startClientX: Number(event.clientX) || 0,
      startClientY: Number(event.clientY) || 0,
      originX: asFiniteNumber(element.dataset?.originX ?? 0, "data-origin-x"),
      originY: asFiniteNumber(element.dataset?.originY ?? 0, "data-origin-y"),
      originTransform: element.getAttribute?.("transform")
        ?? `translate(${element.dataset?.originX ?? 0} ${element.dataset?.originY ?? 0})`,
      moved: false,
    };

    element.classList?.add("mass-choice--dragging");
    element.setPointerCapture?.(event.pointerId);
    setDropState(isOverTarget(event));
    event.preventDefault?.();
  }

  function moveDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    const clientDx = (Number(event.clientX) || 0) - active.startClientX;
    const clientDy = (Number(event.clientY) || 0) - active.startClientY;
    if (Math.hypot(clientDx, clientDy) >= TAP_MOVEMENT_THRESHOLD_PX) {
      active.moved = true;
    }
    const scale = getSvgScale(svg);
    const dx = clientDx * scale.x;
    const dy = clientDy * scale.y;

    active.element.setAttribute?.(
      "transform",
      `translate(${active.originX + dx} ${active.originY + dy})`,
    );
    setDropState(isOverTarget(event));
    event.preventDefault?.();
  }

  function endDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    const selectedValue = active.value;
    const accepted = isOverTarget(event);
    const tapped = !active.moved;
    restoreActive();

    if ((accepted || tapped) && !sameMass(selectedValue, options.selectedMass)) {
      options.onSelect(selectedValue);
    }
    event.preventDefault?.();
  }

  function cancelDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    restoreActive();
    event.preventDefault?.();
  }

  function selectByKeyboard(element, event) {
    if (!event || !["Enter", " "].includes(event.key)) return;
    const value = getMassValue(element);
    if (!sameMass(value, options.selectedMass)) {
      options.onSelect(value);
    }
    event.preventDefault?.();
  }

  for (const choice of choices) {
    listen(choice, "pointerdown", (event) => beginDrag(choice, event));
    listen(choice, "keydown", (event) => selectByKeyboard(choice, event));
  }
  listen(svg, "pointermove", moveDrag);
  listen(svg, "pointerup", endDrag);
  listen(svg, "pointercancel", cancelDrag);

  setDropState(false);

  return Object.freeze({
    getChoiceCount: () => choices.length,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      restoreActive();
      listeners.splice(0).forEach((remove) => remove());
      return true;
    },
  });
}

return Object.freeze({ isPointInsideRect, createMassSelector });
})();

modules.mobileMassSelector = (() => {

const MASS_EPSILON = 1e-9;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de sélection mobile de masse introuvable : ${selector}`);
  }
  return element;
}

function normalizeMass(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new TypeError("La masse sélectionnée doit être un nombre strictement positif.");
  }
  return normalized;
}

function sameMass(left, right) {
  return Math.abs(Number(left) - Number(right)) <= MASS_EPSILON;
}

/**
 * Relie la rangée de boutons tactiles à la masse suspendue. Cette commande est
 * masquée sur grand écran par CSS et complète le glisser-déposer SVG sur les
 * écrans étroits.
 */
function bindMobileMassSelector(root, appState, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (
    !appState
    || typeof appState.getSnapshot !== "function"
    || typeof appState.updateParameters !== "function"
    || typeof appState.subscribe !== "function"
  ) {
    throw new TypeError("Un état central prenant en charge les paramètres est requis.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.subscribe !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const selector = getRequiredElement(root, "#mobile-mass-selector");
  const buttons = Array.from(
    selector.querySelectorAll?.("[data-mobile-mass-value]") ?? [],
  );
  if (buttons.length === 0) {
    throw new Error("Aucun bouton tactile de masse n'est disponible.");
  }

  const listeners = [];
  let destroyed = false;

  function listen(element, name, callback) {
    element.addEventListener?.(name, callback);
    listeners.push(() => element.removeEventListener?.(name, callback));
  }

  function localizeButton(button) {
    const mass = button.getAttribute?.("data-mobile-mass-value")
      ?? button.dataset?.mobileMassValue;
    const label = i18n.t("mass.select", { mass });
    button.setAttribute?.("aria-label", label);
    button.setAttribute?.("title", label);
  }

  function sync(snapshot = appState.getSnapshot()) {
    const selectedMass = snapshot.parameters.m2;
    for (const button of buttons) {
      const value = normalizeMass(
        button.getAttribute?.("data-mobile-mass-value")
          ?? button.dataset?.mobileMassValue,
      );
      const selected = sameMass(value, selectedMass);
      button.classList?.toggle("mobile-mass-button--selected", selected);
      button.setAttribute?.("aria-pressed", String(selected));
    }
    selector.setAttribute?.("data-selected-mass", String(selectedMass));
    return selectedMass;
  }

  function localize() {
    for (const button of buttons) localizeButton(button);
    return i18n.getLocale?.();
  }

  for (const button of buttons) {
    listen(button, "click", () => {
      if (destroyed) return;
      const value = normalizeMass(
        button.getAttribute?.("data-mobile-mass-value")
          ?? button.dataset?.mobileMassValue,
      );
      if (!sameMass(value, appState.getSnapshot().parameters.m2)) {
        appState.updateParameters({ m2: value });
      }
    });
  }

  const unsubscribeState = appState.subscribe((snapshot, meta) => {
    if (["mode-change", "parameters-change", "experiment-reset", "subscription"].includes(meta.reason)) {
      sync(snapshot);
    }
  }, { emitCurrent: true });
  const unsubscribeLanguage = i18n.subscribe(localize);
  localize();

  return Object.freeze({
    sync,
    localize,
    getButtonCount: () => buttons.length,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      unsubscribeState();
      unsubscribeLanguage();
      return true;
    },
  });
}

return Object.freeze({ bindMobileMassSelector });
})();

modules.responsiveApparatus = (() => {

const APPARATUS_VIEWPORTS = Object.freeze({
  desktop: Object.freeze({
    id: "desktop",
    viewBox: "0 0 1200 620",
  }),
  mobilePortrait: Object.freeze({
    id: "mobile-portrait",
    viewBox: "70 60 1130 535",
  }),
  shortLandscape: Object.freeze({
    id: "short-landscape",
    viewBox: "45 55 1155 545",
  }),
});

function normalizeViewportSize(viewport = {}) {
  const width = Number(viewport.width);
  const height = Number(viewport.height);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new TypeError("La largeur et la hauteur de la fenêtre doivent être strictement positives.");
  }
  return Object.freeze({ width, height });
}

/** Sélectionne le cadrage visuel sans modifier la géométrie physique du montage. */
function selectApparatusViewport(viewport) {
  const { width, height } = normalizeViewportSize(viewport);
  if (height <= 500 && width > height && width <= 1000) {
    return APPARATUS_VIEWPORTS.shortLandscape;
  }
  if (width <= 760 && height >= width) {
    return APPARATUS_VIEWPORTS.mobilePortrait;
  }
  return APPARATUS_VIEWPORTS.desktop;
}

function applyApparatusViewport(svg, viewport) {
  if (!svg || typeof svg.setAttribute !== "function") {
    throw new TypeError("Un élément SVG modifiable est requis.");
  }
  const normalized = normalizeViewportSize(viewport);
  const selected = selectApparatusViewport(normalized);
  svg.setAttribute("viewBox", selected.viewBox);
  svg.setAttribute("data-responsive-layout", selected.id);
  svg.setAttribute("data-viewport-width", String(Math.round(normalized.width)));
  svg.setAttribute("data-viewport-height", String(Math.round(normalized.height)));
  return selected;
}

/**
 * Met à jour le cadrage du SVG lors des changements de taille ou d'orientation.
 * Les coordonnées du montage restent inchangées ; seule la fenêtre SVG évolue.
 * Les événements de la fenêtre, du visual viewport et de Screen Orientation
 * sont pris en charge pour couvrir les navigateurs mobiles les plus courants.
 */
function createResponsiveApparatusViewport(svg, options = {}) {
  const windowRef = options.windowRef ?? globalThis.window;
  if (!windowRef || typeof windowRef.addEventListener !== "function") {
    return Object.freeze({
      update: () => applyApparatusViewport(svg, { width: 1200, height: 620 }),
      destroy: () => false,
    });
  }

  let destroyed = false;
  let frameId = null;
  const removeListeners = [];

  function listen(target, eventName, callback) {
    if (!target || typeof target.addEventListener !== "function") return;
    target.addEventListener(eventName, callback);
    removeListeners.push(() => target.removeEventListener?.(eventName, callback));
  }

  function readViewport() {
    const visualViewport = windowRef.visualViewport;
    return Object.freeze({
      width: Number(visualViewport?.width ?? windowRef.innerWidth),
      height: Number(visualViewport?.height ?? windowRef.innerHeight),
    });
  }

  function update() {
    if (destroyed) return null;
    frameId = null;
    return applyApparatusViewport(svg, readViewport());
  }

  function scheduleUpdate() {
    if (destroyed || frameId !== null) return;
    if (typeof windowRef.requestAnimationFrame === "function") {
      frameId = windowRef.requestAnimationFrame(update);
    } else {
      update();
    }
  }

  listen(windowRef, "resize", scheduleUpdate);
  listen(windowRef, "orientationchange", scheduleUpdate);
  listen(windowRef, "pageshow", scheduleUpdate);
  listen(windowRef.visualViewport, "resize", scheduleUpdate);
  listen(windowRef.screen?.orientation, "change", scheduleUpdate);
  update();

  return Object.freeze({
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      removeListeners.splice(0).forEach((remove) => remove());
      if (frameId !== null && typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(frameId);
      }
      frameId = null;
      return true;
    },
  });
}

return Object.freeze({ APPARATUS_VIEWPORTS, selectApparatusViewport, applyApparatusViewport, createResponsiveApparatusViewport });
})();

modules.simulationControls = (() => {
const { createI18n } = modules.i18n;
const DEFAULT_MANUAL_STEP_DURATION = 0.05;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de commande introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state.status);
}

function isInitialState(state) {
  return state.time === 0 && state.position === 0 && state.velocity === 0;
}

function shouldIgnoreKeyboardShortcut(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  const target = event.target;
  const tagName = String(target?.tagName ?? "").toLowerCase();
  return target?.isContentEditable
    || ["input", "textarea", "select", "button"].includes(tagName);
}

/**
 * Relie les quatre commandes principales à la boucle temporelle courante.
 * La boucle est obtenue à la demande afin que la liaison reste valide après
 * toute reconstruction du montage provoquée par un changement de paramètre.
 */
function bindSimulationControls(root, configuration = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!configuration.appState || typeof configuration.appState.resetExperiment !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }
  if (typeof configuration.getLoop !== "function") {
    throw new TypeError("getLoop doit être une fonction.");
  }

  const manualStepDuration = Number(
    configuration.manualStepDuration ?? DEFAULT_MANUAL_STEP_DURATION,
  );
  if (!Number.isFinite(manualStepDuration) || manualStepDuration <= 0) {
    throw new RangeError("La durée du pas manuel doit être strictement positive.");
  }

  const startButton = getRequiredElement(root, "#start-button");
  const pauseButton = getRequiredElement(root, "#pause-button");
  const stepButton = getRequiredElement(root, "#step-button");
  const resetButton = getRequiredElement(root, "#reset-button");
  const announcer = root.querySelector("#simulation-announcer");
  const keyboardTarget = configuration.keyboardTarget
    ?? (typeof root.addEventListener === "function" ? root : null);
  const listeners = [];
  const i18n = configuration.i18n ?? createI18n("fr");
  const ownsI18n = !configuration.i18n;
  let lastState = configuration.appState.getSnapshot().simulation;
  let lastMeta = {};
  let lastAnnouncementKey = null;
  let destroyed = false;

  startButton.setAttribute("aria-keyshortcuts", "Space");
  pauseButton.setAttribute("aria-keyshortcuts", "Space");
  stepButton.setAttribute("aria-keyshortcuts", "ArrowRight");
  resetButton.setAttribute("aria-keyshortcuts", "Home");


  function getAnnouncementKey(state, running, terminal, initial) {
    if (state.status === "blocked") return "controls.status.blocked";
    if (terminal) return "controls.status.finished";
    if (running) return "controls.status.running";
    if (state.status === "paused") return "controls.status.paused";
    if (initial) return "controls.status.ready";
    return "controls.status.paused";
  }

  function announceState(state, running, terminal, initial, force = false) {
    if (!announcer) return null;
    const key = getAnnouncementKey(state, running, terminal, initial);
    if (!force && key === lastAnnouncementKey) return key;
    lastAnnouncementKey = key;
    announcer.textContent = i18n.t(key);
    return key;
  }

  function localizedDuration() {
    return new Intl.NumberFormat(i18n.getLocale() === "fr" ? "fr-FR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(manualStepDuration);
  }

  function localize() {
    const pauseLabel = i18n.t("controls.pause");
    const stepLabel = i18n.t("controls.step", { duration: localizedDuration() });
    const resetLabel = i18n.t("controls.reset");
    pauseButton.setAttribute("aria-label", pauseLabel);
    pauseButton.setAttribute("title", pauseLabel);
    stepButton.setAttribute("aria-label", stepLabel);
    stepButton.setAttribute("title", stepLabel);
    resetButton.setAttribute("aria-label", resetLabel);
    resetButton.setAttribute("title", resetLabel);
    const loop = getLoop();
    lastAnnouncementKey = null;
    update(loop?.getState?.() ?? lastState, loop?.getDiagnostics?.() ?? lastMeta);
    return i18n.getLocale();
  }

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function getLoop() {
    if (destroyed) return null;
    return configuration.getLoop() ?? null;
  }

  function resolveRunning(meta = {}) {
    if (typeof meta.running === "boolean") return meta.running;
    return Boolean(getLoop()?.getDiagnostics?.().running);
  }

  function update(state = configuration.appState.getSnapshot().simulation, meta = {}) {
    lastState = state;
    lastMeta = meta;
    const running = resolveRunning(meta);
    const terminal = isTerminalState(state);
    const initial = isInitialState(state);

    startButton.disabled = running || terminal;
    pauseButton.disabled = !running;
    stepButton.disabled = running || terminal;
    resetButton.disabled = initial && !running;

    const startLabel = i18n.t(initial ? "controls.start" : "controls.resume");
    startButton.setAttribute("aria-label", startLabel);
    startButton.setAttribute("title", startLabel);
    startButton.dataset.actionState = initial ? "start" : "resume";
    startButton.setAttribute("aria-pressed", String(running));
    pauseButton.setAttribute("aria-pressed", String(!running && !initial && !terminal));
    const announcementKey = announceState(state, running, terminal, initial);
    const result = Object.freeze({ running, terminal, initial, announcementKey });
    configuration.onUpdate?.(state, { ...meta, running }, result);
    return result;
  }

  function start() {
    const loop = getLoop();
    const changed = Boolean(loop?.start());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function pause() {
    const loop = getLoop();
    const changed = Boolean(loop?.pause());
    if (loop) update(loop.getState(), loop.getDiagnostics());
    return changed;
  }

  function step() {
    const loop = getLoop();
    if (!loop) return null;
    const result = loop.step(manualStepDuration);
    update(loop.getState(), loop.getDiagnostics());
    return result;
  }

  function reset() {
    const loop = getLoop();
    loop?.pause();
    configuration.appState.resetExperiment();
    const currentLoop = getLoop();
    if (currentLoop) update(currentLoop.getState(), currentLoop.getDiagnostics());
    return true;
  }

  function onKeyDown(event) {
    if (shouldIgnoreKeyboardShortcut(event)) return;

    if (event.code === "Space" || event.key === " ") {
      event.preventDefault?.();
      if (resolveRunning()) pause();
      else start();
      return;
    }

    if (event.code === "ArrowRight" || event.key === "ArrowRight") {
      event.preventDefault?.();
      step();
      return;
    }

    if (event.code === "Home" || event.key === "Home") {
      event.preventDefault?.();
      reset();
    }
  }

  listen(startButton, "click", start);
  listen(pauseButton, "click", pause);
  listen(stepButton, "click", step);
  listen(resetButton, "click", reset);
  if (keyboardTarget && typeof keyboardTarget.addEventListener === "function") {
    listen(keyboardTarget, "keydown", onKeyDown);
  }

  const unsubscribeLanguage = i18n.subscribe(localize);
  localize();

  return Object.freeze({
    start,
    pause,
    step,
    reset,
    update,
    localize,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      unsubscribeLanguage();
      if (ownsI18n) i18n.destroy();
      return true;
    },
  });
}

return Object.freeze({ DEFAULT_MANUAL_STEP_DURATION, bindSimulationControls });
})();

modules.personController = (() => {

function getRequiredElement(svg, selector) {
  const element = svg.querySelector(selector);
  if (!element) {
    throw new Error(`Personnage interactif introuvable : ${selector}`);
  }
  return element;
}

function isInitialState(state) {
  return state.time === 0 && state.position === 0 && state.velocity === 0;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state.status);
}

/**
 * Rend le personnage actionnable à la souris et au clavier. Le contrôleur
 * reste indépendant de la boucle temporelle : l'appelant lui transmet l'état
 * après chaque rendu et lors d'une réinitialisation.
 */
function createPersonController(svg, configuration = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (typeof configuration.onActivate !== "function") {
    throw new TypeError("onActivate doit être une fonction.");
  }
  if (!configuration.i18n || typeof configuration.i18n.t !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const person = getRequiredElement(svg, "#layer-person");
  const personTitle = getRequiredElement(svg, "#person-title");
  const cueLabel = getRequiredElement(svg, "#person-click-cue-label");
  const { i18n } = configuration;
  const listeners = [];
  let lastState = configuration.initialState ?? {
    time: 0,
    position: 0,
    velocity: 0,
    status: "ready",
  };
  let lastMeta = {};
  let destroyed = false;

  function listen(eventName, callback) {
    person.addEventListener(eventName, callback);
    listeners.push(() => person.removeEventListener?.(eventName, callback));
  }

  function resolveRunning(meta = lastMeta) {
    return typeof meta.running === "boolean"
      ? meta.running
      : lastState.status === "running";
  }

  function localize() {
    const initial = isInitialState(lastState) && lastState.status === "ready";
    const label = i18n.t(initial ? "svg.personStart" : "svg.personResume");
    person.setAttribute("aria-label", label);
    person.setAttribute("title", label);
    personTitle.textContent = label;
    cueLabel.textContent = i18n.t(initial ? "controls.start" : "controls.resume");
    return label;
  }

  function update(state = lastState, meta = lastMeta) {
    lastState = state;
    lastMeta = meta;
    const running = resolveRunning(meta);
    const terminal = isTerminalState(state);
    const released = state.status !== "ready" || !isInitialState(state) || running || terminal;

    svg.setAttribute("data-person-state", released ? "released" : "holding");
    person.setAttribute("aria-disabled", String(running || terminal));
    localize();
    return Object.freeze({ running, terminal, released });
  }

  function activate(event) {
    if (destroyed || person.getAttribute?.("aria-disabled") === "true") {
      return false;
    }
    event?.preventDefault?.();
    const changed = Boolean(configuration.onActivate());
    if (changed) {
      svg.setAttribute("data-person-state", "released");
      person.setAttribute("aria-disabled", "true");
    }
    return changed;
  }

  function onKeyDown(event) {
    if (["Enter", " "].includes(event.key) || event.code === "Space") {
      activate(event);
    }
  }

  listen("click", activate);
  listen("keydown", onKeyDown);
  const unsubscribeLanguage = i18n.subscribe(localize);
  update(lastState, lastMeta);

  return Object.freeze({
    activate,
    update,
    localize,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      unsubscribeLanguage();
      return true;
    },
  });
}

return Object.freeze({ createPersonController });
})();

modules.sensorController = (() => {

const SENSOR_EPSILON = 1e-10;

function assertFinitePosition(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} doit être un nombre fini.`);
  }
}

function normalizeTriggeredIds(triggeredIds) {
  if (triggeredIds === undefined) return new Set();
  if (!triggeredIds || typeof triggeredIds[Symbol.iterator] !== "function") {
    throw new TypeError("triggeredIds doit être itérable.");
  }
  return new Set(triggeredIds);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Détermine les capteurs franchis lors d'un déplacement monotone.
 * Les positions fournies doivent être exprimées dans le même repère que les
 * positions des capteurs. Les capteurs déjà déclenchés sont ignorés.
 */
function detectSensorCrossings(
  sensors,
  previousPosition,
  currentPosition,
  triggeredIds = [],
) {
  if (!Array.isArray(sensors)) {
    throw new TypeError("sensors doit être un tableau.");
  }
  assertFinitePosition("previousPosition", previousPosition);
  assertFinitePosition("currentPosition", currentPosition);

  if (currentPosition + SENSOR_EPSILON < previousPosition) {
    return Object.freeze([]);
  }

  const triggered = normalizeTriggeredIds(triggeredIds);
  const crossings = sensors
    .filter((sensor) => {
      if (!sensor || !Number.isInteger(sensor.id) || !Number.isFinite(sensor.position)) {
        throw new TypeError("Chaque capteur doit posséder un identifiant entier et une position finie.");
      }
      return !triggered.has(sensor.id)
        && sensor.position > previousPosition + SENSOR_EPSILON
        && sensor.position <= currentPosition + SENSOR_EPSILON;
    })
    .sort((left, right) => left.position - right.position)
    .map((sensor) => Object.freeze({ id: sensor.id, position: sensor.position }));

  return Object.freeze(crossings);
}

function requireSensorElement(svg, sensorId) {
  const element = svg.querySelector(`#sensor-${sensorId}`);
  if (!element) {
    throw new Error(`Élément SVG du capteur ${sensorId} introuvable.`);
  }
  return element;
}

function setSensorVisualState(element, sensor, state) {
  element.setAttribute("data-sensor-state", state);
  const suffix = state === "idle"
    ? "non déclenché"
    : state === "active"
      ? "vient d’être déclenché"
      : "déjà déclenché";
  element.setAttribute(
    "aria-label",
    `Capteur ${sensor.id}, position ${sensor.position.toFixed(3)} mètre, ${suffix}`,
  );
}

/**
 * Retourne la position SVG du bord gauche de S1 pour une position physique du
 * moteur. Le calcul est identique à celui utilisé par l'animation du mobile.
 */
function mobileLeftEdgeX(layout, simulationPosition) {
  const normalizedPosition = clamp(
    simulationPosition,
    0,
    layout.parameters.trackLength,
  );
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  return layout.mobile.x + normalizedPosition * pixelsPerMeter;
}

/** Retourne la position du moteur lorsque le bord gauche atteint une abscisse SVG. */
function simulationPositionForLeftEdgeX(layout, leftEdgeX) {
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    throw new RangeError("L’échelle graphique du mobile doit être strictement positive.");
  }
  return clamp(
    (leftEdgeX - layout.mobile.x) / pixelsPerMeter,
    0,
    layout.parameters.trackLength,
  );
}

/** Calcule la position effectivement affichée pendant l'interpolation visuelle. */
function displayedSimulationPosition(currentState, previousState, meta) {
  const terminal = ["blocked", "finished"].includes(currentState.status);
  const snapToCurrent = terminal || Boolean(meta?.reason) || meta?.running === false;
  const alpha = snapToCurrent ? 1 : clamp(meta?.interpolationAlpha ?? 1, 0, 1);
  return interpolate(previousState.position, currentState.position, alpha);
}

/**
 * Relie les capteurs SVG au déplacement de S1. Le déclenchement se produit au
 * moment où le bord gauche visible du mobile traverse le faisceau du capteur.
 * Un capteur devient brièvement actif, puis reste marqué comme déclenché
 * jusqu'à la réinitialisation de l'expérience.
 */
function createSensorController(svg, layout, options = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (!layout || !Array.isArray(layout.sensors)) {
    throw new TypeError("Un layout contenant les capteurs est requis.");
  }
  if (options === null || typeof options !== "object") {
    throw new TypeError("Les options des capteurs doivent être un objet.");
  }

  const onCrossings = options.onCrossings ?? (() => {});
  if (typeof onCrossings !== "function") {
    throw new TypeError("onCrossings doit être une fonction.");
  }

  const elements = new Map(
    layout.sensors.map((sensor) => [sensor.id, requireSensorElement(svg, sensor.id)]),
  );
  const sensorsInSvgCoordinates = layout.sensors.map((sensor) => Object.freeze({
    id: sensor.id,
    position: sensor.x,
  }));
  const sensorsById = new Map(layout.sensors.map((sensor) => [sensor.id, sensor]));
  const triggeredIds = new Set();
  let activeIds = new Set();
  let lastPosition = null;
  let lastLeftEdgeX = null;
  let destroyed = false;

  function assertUsable() {
    if (destroyed) throw new Error("Ce contrôleur de capteurs a été détruit.");
  }

  function applyIdleState() {
    for (const sensor of layout.sensors) {
      setSensorVisualState(elements.get(sensor.id), sensor, "idle");
    }
  }

  function reset(position = 0) {
    assertUsable();
    assertFinitePosition("position", position);
    triggeredIds.clear();
    activeIds = new Set();
    lastPosition = position;
    lastLeftEdgeX = mobileLeftEdgeX(layout, position);
    applyIdleState();
    return getSnapshot();
  }

  function getSnapshot(crossings = []) {
    return Object.freeze({
      crossings: Object.freeze([...crossings]),
      triggeredIds: Object.freeze([...triggeredIds].sort((a, b) => a - b)),
      activeIds: Object.freeze([...activeIds].sort((a, b) => a - b)),
      triggeredCount: triggeredIds.size,
      totalCount: layout.sensors.length,
      lastPosition,
      lastLeftEdgeX,
    });
  }

  function render(currentState, previousState = currentState, meta = {}) {
    assertUsable();
    if (!currentState || !Number.isFinite(currentState.position)) {
      throw new TypeError("currentState.position doit être un nombre fini.");
    }
    if (!previousState || !Number.isFinite(previousState.position)) {
      throw new TypeError("previousState.position doit être un nombre fini.");
    }

    const displayedPosition = displayedSimulationPosition(
      currentState,
      previousState,
      meta,
    );
    const currentLeftEdgeX = mobileLeftEdgeX(layout, displayedPosition);
    const reason = meta?.reason;
    const resetRequested = ["initialization", "reset", "replace-state"].includes(reason)
      || lastLeftEdgeX === null
      || currentLeftEdgeX + SENSOR_EPSILON < lastLeftEdgeX;

    if (resetRequested) {
      return reset(displayedPosition);
    }

    for (const sensorId of activeIds) {
      const sensor = sensorsById.get(sensorId);
      setSensorVisualState(elements.get(sensorId), sensor, "triggered");
    }
    activeIds = new Set();

    const svgCrossings = detectSensorCrossings(
      sensorsInSvgCoordinates,
      lastLeftEdgeX,
      currentLeftEdgeX,
      triggeredIds,
    );
    const crossings = svgCrossings.map((crossing) => {
      const sensor = sensorsById.get(crossing.id);
      return Object.freeze({
        id: sensor.id,
        position: sensor.position,
        beamX: sensor.x,
        triggerPosition: simulationPositionForLeftEdgeX(layout, sensor.x),
      });
    });

    for (const crossing of crossings) {
      triggeredIds.add(crossing.id);
      activeIds.add(crossing.id);
      const sensor = sensorsById.get(crossing.id);
      // Le capteur passe directement à l’état vert déclenché, sans état
      // visuel orange intermédiaire.
      setSensorVisualState(elements.get(crossing.id), sensor, "triggered");
    }

    lastPosition = displayedPosition;
    lastLeftEdgeX = currentLeftEdgeX;

    if (crossings.length > 0) {
      onCrossings(Object.freeze(crossings), currentState, previousState, meta);
    }

    return getSnapshot(crossings);
  }

  applyIdleState();

  return Object.freeze({
    render,
    reset,
    getSnapshot: () => getSnapshot(),
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      triggeredIds.clear();
      activeIds.clear();
      return true;
    },
  });
}

return Object.freeze({ detectSensorCrossings, createSensorController });
})();

modules.measurementRecorder = (() => {
const { computePhase1Acceleration, computePhase2Acceleration, validateParameters } = modules.physics;
const MEASUREMENT_EPSILON = 1e-10;

function validateNoiseStdDev(value) {
  const normalized = Number(value ?? 0);
  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new RangeError("noiseStdDev doit être un nombre positif ou nul.");
  }
  return normalized;
}

function validateRandom(random) {
  if (typeof random !== "function") {
    throw new TypeError("random doit être une fonction.");
  }
  return random;
}

/** Produit un écart normal centré réduit par la transformation de Box-Muller. */
function sampleStandardNormal(random = Math.random) {
  const source = validateRandom(random);
  const first = Number(source());
  const second = Number(source());
  if (
    !Number.isFinite(first) || first < 0 || first >= 1
    || !Number.isFinite(second) || second < 0 || second >= 1
  ) {
    throw new RangeError("random doit produire des valeurs appartenant à [0, 1[.");
  }
  const u1 = Math.max(first, Number.MIN_VALUE);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * second);
}

function addVelocityMeasurementNoise(velocity, noiseStdDev = 0, random = Math.random) {
  const exactVelocity = Number(velocity);
  if (!Number.isFinite(exactVelocity) || exactVelocity < 0) {
    throw new RangeError("La vitesse exacte doit être positive ou nulle.");
  }
  const sigma = validateNoiseStdDev(noiseStdDev);
  if (sigma === 0) return exactVelocity;
  return Math.max(0, exactVelocity + sigma * sampleStandardNormal(random));
}

/** Ajoute une incertitude normale à l'instant de déclenchement mesuré. */
function addTimeMeasurementNoise(time, noiseStdDev = 0, random = Math.random) {
  const exactTime = Number(time);
  if (!Number.isFinite(exactTime) || exactTime < 0) {
    throw new RangeError("L’instant exact doit être positif ou nul.");
  }
  const sigma = validateNoiseStdDev(noiseStdDev);
  if (sigma === 0) return exactTime;
  return Math.max(0, exactTime + sigma * sampleStandardNormal(random));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function assertLayout(layout) {
  if (!layout || typeof layout !== "object") {
    throw new TypeError("Un layout de montage est requis.");
  }
  if (!layout.parameters || !layout.track || !layout.mobile || !Array.isArray(layout.sensors)) {
    throw new TypeError("Le layout doit contenir les paramètres, le banc, le mobile et les capteurs.");
  }
}

function assertSensor(sensor) {
  if (!sensor || !Number.isInteger(sensor.id) || !Number.isFinite(sensor.position)) {
    throw new TypeError("Le capteur doit posséder un identifiant entier et une position finie.");
  }
  if (!Number.isFinite(sensor.x)) {
    throw new TypeError("Le capteur doit posséder une coordonnée SVG finie.");
  }
}

/**
 * Retourne le déplacement physique de S1 pour lequel son bord gauche visible
 * est exactement aligné avec le faisceau d'un capteur.
 */
function computeSensorTriggerPosition(layout, sensor) {
  assertLayout(layout);
  assertSensor(sensor);

  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? layout.track.width / layout.parameters.trackLength;
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    throw new RangeError("L’échelle graphique du mobile doit être strictement positive.");
  }

  return clamp(
    (sensor.x - layout.mobile.x) / pixelsPerMeter,
    0,
    layout.parameters.trackLength,
  );
}

/**
 * Calcule l'état cinématique exact au déplacement demandé à partir des lois à
 * accélération constante utilisées par le moteur. Retourne null si la position
 * n'est pas atteignable (système bloqué ou arrêt antérieur par frottement).
 */
function computeKinematicStateAtPosition(parameters, targetPosition) {
  const p = validateParameters(parameters);
  const x = Number(targetPosition);

  if (!Number.isFinite(x)) {
    throw new TypeError("targetPosition doit être un nombre fini.");
  }
  if (x < -MEASUREMENT_EPSILON || x > p.trackLength + MEASUREMENT_EPSILON) {
    throw new RangeError("targetPosition doit rester comprise sur le banc.");
  }

  const position = clamp(x, 0, p.trackLength);
  const a1 = computePhase1Acceleration(p);

  if (position <= MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: 0,
      position: 0,
      velocity: 0,
      acceleration: a1,
      phase: 1,
    });
  }

  if (a1 <= MEASUREMENT_EPSILON) {
    return null;
  }

  const phase1EndPosition = Math.min(p.dropHeight, p.trackLength);

  if (position < phase1EndPosition - MEASUREMENT_EPSILON) {
    const velocity = Math.sqrt(Math.max(0, 2 * a1 * position));
    return Object.freeze({
      time: velocity / a1,
      position,
      velocity,
      acceleration: a1,
      phase: 1,
    });
  }

  const transitionVelocity = Math.sqrt(
    Math.max(0, 2 * a1 * phase1EndPosition),
  );
  const transitionTime = transitionVelocity / a1;

  // Si le banc se termine avant la fin de chute, la phase 2 n'existe pas.
  if (p.trackLength <= p.dropHeight + MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: transitionTime,
      position,
      velocity: transitionVelocity,
      acceleration: a1,
      phase: 1,
    });
  }

  if (position <= p.dropHeight + MEASUREMENT_EPSILON) {
    return Object.freeze({
      time: transitionTime,
      position: p.dropHeight,
      velocity: transitionVelocity,
      acceleration: computePhase2Acceleration(p, transitionVelocity),
      phase: 2,
    });
  }

  const a2 = computePhase2Acceleration(p, transitionVelocity);
  const phase2Distance = position - p.dropHeight;

  if (Math.abs(a2) <= MEASUREMENT_EPSILON) {
    if (transitionVelocity <= MEASUREMENT_EPSILON) return null;
    return Object.freeze({
      time: transitionTime + phase2Distance / transitionVelocity,
      position,
      velocity: transitionVelocity,
      acceleration: 0,
      phase: 2,
    });
  }

  const velocitySquared = transitionVelocity ** 2 + 2 * a2 * phase2Distance;
  if (velocitySquared < -MEASUREMENT_EPSILON) {
    return null;
  }

  const velocity = Math.sqrt(Math.max(0, velocitySquared));
  const phase2Time = (velocity - transitionVelocity) / a2;

  return Object.freeze({
    time: transitionTime + phase2Time,
    position,
    velocity,
    acceleration: velocity <= MEASUREMENT_EPSILON ? 0 : a2,
    phase: 2,
  });
}

/**
 * Transforme un franchissement de faisceau en mesure scientifique immuable.
 * `position` et `mobilePosition` utilisent le même repère physique : elles
 * correspondent au déplacement de S1 lorsque son bord gauche franchit le
 * faisceau. Cette convention garantit la cohérence entre x, t et v.
 */
function createMeasurement(
  layout,
  crossing,
  parameters = layout?.parameters,
  options = {},
) {
  assertLayout(layout);
  if (!crossing || !Number.isInteger(crossing.id)) {
    throw new TypeError("Le franchissement doit posséder un identifiant entier.");
  }

  const sensor = layout.sensors.find((candidate) => candidate.id === crossing.id);
  if (!sensor) {
    throw new RangeError(`Capteur ${crossing.id} absent du layout.`);
  }

  const mobilePosition = Number.isFinite(crossing.triggerPosition)
    ? crossing.triggerPosition
    : computeSensorTriggerPosition(layout, sensor);
  const kinematics = computeKinematicStateAtPosition(parameters, mobilePosition);

  if (!kinematics) return null;

  return Object.freeze({
    sensorId: sensor.id,
    position: kinematics.position,
    mobilePosition: kinematics.position,
    time: addTimeMeasurementNoise(
      kinematics.time,
      options.timeNoiseStdDev ?? 0,
      options.random ?? Math.random,
    ),
    velocity: addVelocityMeasurementNoise(
      kinematics.velocity,
      options.noiseStdDev ?? 0,
      options.random ?? Math.random,
    ),
    acceleration: kinematics.acceleration,
    phase: kinematics.phase,
  });
}

/**
 * Enregistre chaque capteur au plus une fois au cours d'une expérience.
 */
function createMeasurementRecorder(
  layout,
  parameters = layout?.parameters,
  options = {},
) {
  assertLayout(layout);
  const validatedParameters = validateParameters(parameters);
  const noiseStdDev = validateNoiseStdDev(options.noiseStdDev ?? 0);
  const timeNoiseStdDev = validateNoiseStdDev(options.timeNoiseStdDev ?? 0);
  const random = validateRandom(options.random ?? Math.random);
  const recordedSensorIds = new Set();
  let destroyed = false;

  function assertUsable() {
    if (destroyed) {
      throw new Error("Cet enregistreur de mesures a été détruit.");
    }
  }

  function recordCrossings(crossings) {
    assertUsable();
    if (!Array.isArray(crossings)) {
      throw new TypeError("crossings doit être un tableau.");
    }

    const measurements = [];
    for (const crossing of crossings) {
      if (recordedSensorIds.has(crossing.id)) continue;
      const measurement = createMeasurement(layout, crossing, validatedParameters, {
        noiseStdDev,
        timeNoiseStdDev,
        random,
      });
      if (!measurement) continue;
      recordedSensorIds.add(crossing.id);
      measurements.push(measurement);
    }

    measurements.sort((left, right) => left.time - right.time || left.sensorId - right.sensorId);
    return Object.freeze(measurements);
  }

  function reset() {
    assertUsable();
    recordedSensorIds.clear();
    return getSnapshot();
  }

  function getSnapshot() {
    return Object.freeze({
      recordedSensorIds: Object.freeze([...recordedSensorIds].sort((a, b) => a - b)),
      count: recordedSensorIds.size,
    });
  }

  return Object.freeze({
    recordCrossings,
    reset,
    getSnapshot,
    destroy() {
      if (destroyed) return false;
      recordedSensorIds.clear();
      destroyed = true;
      return true;
    },
  });
}

return Object.freeze({ sampleStandardNormal, addVelocityMeasurementNoise, addTimeMeasurementNoise, computeSensorTriggerPosition, computeKinematicStateAtPosition, createMeasurement, createMeasurementRecorder });
})();

modules.measurementExport = (() => {
const { createI18n, formatNumber, translate } = modules.i18n;
const CSV_HEADER_KEYS = Object.freeze([
  "measurements.sensorNumber",
  "measurements.position",
  "measurements.triggerTime",
  "measurements.velocity",
]);

function resolveTranslator(options = {}) {
  if (options.i18n?.t && options.i18n?.getLocale) return options.i18n;
  const locale = options.locale ?? "fr";
  return Object.freeze({
    getLocale: () => locale,
    t: (key, parameters = {}) => translate(locale, key, parameters),
  });
}

const CSV_NUMBER_PRECISION = 6;

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de mesures introuvable : ${selector}`);
  }
  return element;
}

function isTerminalState(state) {
  return ["blocked", "finished"].includes(state?.status);
}

function formatCsvNumber(value, locale = "en") {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new TypeError("Les valeurs exportées doivent être des nombres finis.");
  }

  const fixed = normalized.toFixed(CSV_NUMBER_PRECISION);
  const compact = fixed.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
  return locale === "fr" ? compact.replace(".", ",") : compact;
}

function normalizeMeasurements(measurements) {
  if (!Array.isArray(measurements)) {
    throw new TypeError("Les mesures à exporter doivent être fournies dans un tableau.");
  }

  return [...measurements]
    .map((measurement) => {
      if (!measurement || typeof measurement !== "object") {
        throw new TypeError("Chaque mesure doit être un objet.");
      }

      const sensorId = Number(measurement.sensorId);
      if (!Number.isInteger(sensorId) || sensorId <= 0) {
        throw new RangeError("Le numéro de capteur doit être un entier strictement positif.");
      }

      const position = Number(measurement.position);
      const time = Number(measurement.time);
      const velocity = Number(measurement.velocity);
      for (const [name, value] of Object.entries({ position, time, velocity })) {
        if (!Number.isFinite(value)) {
          throw new TypeError(`${name} doit être un nombre fini.`);
        }
      }

      return Object.freeze({ sensorId, position, time, velocity });
    })
    .sort((left, right) => left.sensorId - right.sensorId);
}

/**
 * Retourne les quatre valeurs textuelles utilisées à la fois dans le tableau
 * et dans le fichier CSV. Les lignes sont triées par numéro de capteur.
 */
function buildMeasurementsTableRows(measurements, options = {}) {
  const i18n = resolveTranslator(options);
  const numberOptions = Object.freeze({
    minimumFractionDigits: 0,
    maximumFractionDigits: CSV_NUMBER_PRECISION,
  });

  return Object.freeze(
    normalizeMeasurements(measurements).map((measurement) => Object.freeze([
      String(measurement.sensorId),
      formatNumber(i18n.getLocale(), measurement.position, numberOptions),
      formatNumber(i18n.getLocale(), measurement.time, numberOptions),
      formatNumber(i18n.getLocale(), measurement.velocity, numberOptions),
    ])),
  );
}

/**
 * Construit un CSV à quatre colonnes, trié par numéro de capteur.
 * En français, les nombres utilisent la virgule décimale et les colonnes sont
 * séparées par des points-virgules. En anglais, le point décimal et la virgule
 * de séparation sont conservés. La précision maximale est de six décimales.
 */
function buildMeasurementsCsv(measurements, options = {}) {
  const i18n = resolveTranslator(options);
  const locale = i18n.getLocale();
  const delimiter = locale === "fr" ? ";" : ",";
  const rows = normalizeMeasurements(measurements).map((measurement) => [
    String(measurement.sensorId),
    formatCsvNumber(measurement.position, locale),
    formatCsvNumber(measurement.time, locale),
    formatCsvNumber(measurement.velocity, locale),
  ]);
  const headers = CSV_HEADER_KEYS.map((key) => i18n.t(key));
  const lines = [headers.map((header) => `"${header}"`).join(delimiter)];

  for (const row of rows) {
    lines.push(row.join(delimiter));
  }

  return `${lines.join("\r\n")}\r\n`;
}

/** Déclenche le téléchargement local d'un fichier CSV sans dépendance externe. */
function downloadMeasurementsCsv(measurements, options = {}) {
  const documentRef = options.documentRef ?? globalThis.document;
  const urlApi = options.urlApi ?? globalThis.URL;
  const BlobConstructor = options.BlobConstructor ?? globalThis.Blob;
  const i18n = resolveTranslator(options);
  const filename = options.filename ?? i18n.t("measurements.filename");

  if (!documentRef || typeof documentRef.createElement !== "function") {
    throw new Error("Un document capable de créer un lien est requis pour le téléchargement.");
  }
  if (!urlApi || typeof urlApi.createObjectURL !== "function" || typeof urlApi.revokeObjectURL !== "function") {
    throw new Error("Une API URL valide est requise pour le téléchargement.");
  }
  if (typeof BlobConstructor !== "function") {
    throw new Error("Le constructeur Blob est indisponible.");
  }

  const csv = buildMeasurementsCsv(measurements, { i18n });
  const blob = new BlobConstructor(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = urlApi.createObjectURL(blob);
  const link = documentRef.createElement("a");

  link.href = url;
  link.download = filename;
  link.hidden = true;
  documentRef.body?.appendChild?.(link);

  try {
    link.click();
  } finally {
    link.remove?.();
    urlApi.revokeObjectURL(url);
  }

  return Object.freeze({ filename, csv });
}

function renderMeasurementRows(tableBody, measurements, i18n) {
  const rows = buildMeasurementsTableRows(measurements, { i18n });
  if (rows.length === 0) {
    tableBody.innerHTML = `<tr><td class="measurement-table-empty" colspan="4">${i18n.t("measurements.empty")}</td></tr>`;
    return rows;
  }

  const labels = CSV_HEADER_KEYS.map((key) => escapeHtmlAttribute(i18n.t(key)));
  tableBody.innerHTML = rows
    .map((row) => `<tr>${row.map((value, index) => `<td data-label="${labels[index]}">${value}</td>`).join("")}</tr>`)
    .join("");
  return rows;
}

/**
 * Active le bouton d'affichage uniquement lorsque l'expérience est terminée.
 * Le tableau apparaît au-dessus de la simulation et conserve un bouton de
 * téléchargement CSV dans son en-tête. Le dialogue piège le focus, rend le
 * montage sous-jacent inerte et restitue le focus au bouton d'ouverture.
 */
function bindMeasurementResults(root, appState, options = {}) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!appState || typeof appState.getSnapshot !== "function" || typeof appState.subscribe !== "function") {
    throw new TypeError("Un état central valide est requis.");
  }

  const showButton = getRequiredElement(root, "#show-data-button");
  const overlay = getRequiredElement(root, "#measurement-table-overlay");
  const dialog = root.querySelector(".measurement-table-dialog") ?? overlay;
  const tableBody = getRequiredElement(root, "#measurement-table-body");
  const closeButton = getRequiredElement(root, "#measurement-table-close-button");
  const downloadButton = getRequiredElement(root, "#measurement-table-download-button");
  const background = root.querySelector(".apparatus-card");
  const documentRef = options.documentRef ?? root.ownerDocument ?? root;
  const body = documentRef?.body ?? root.body ?? null;
  const keyboardTarget = options.keyboardTarget ?? root;
  const i18n = options.i18n ?? createI18n(options.locale ?? "fr");
  const ownsI18n = !options.i18n;
  const downloader = options.downloader
    ?? ((measurements) => downloadMeasurementsCsv(measurements, { ...options, i18n }));
  let destroyed = false;
  let open = false;
  let restoreFocusTarget = showButton;
  let previousBackgroundAriaHidden = null;
  let previousBackgroundInert = false;

  function setBodyLocked(locked) {
    body?.classList?.toggle?.("measurement-dialog-open", Boolean(locked));
  }

  function setBackgroundInert(inert) {
    if (!background) return;
    if (inert) {
      previousBackgroundAriaHidden = background.getAttribute?.("aria-hidden") ?? null;
      previousBackgroundInert = Boolean(background.inert);
      background.inert = true;
      background.setAttribute?.("aria-hidden", "true");
      return;
    }

    background.inert = previousBackgroundInert;
    if (previousBackgroundAriaHidden === null) background.removeAttribute?.("aria-hidden");
    else background.setAttribute?.("aria-hidden", previousBackgroundAriaHidden);
  }

  function getFocusableElements() {
    const selector = [
      "button:not([disabled])",
      "[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex=\"-1\"])",
    ].join(",");
    const queried = Array.from(dialog.querySelectorAll?.(selector) ?? [])
      .filter((element) => !element.hidden && element.getAttribute?.("aria-hidden") !== "true");
    const fallback = [downloadButton, closeButton].filter((element) => !element.disabled && !element.hidden);
    return [...new Set(queried.length > 0 ? queried : fallback)];
  }

  function setOpen(nextOpen, configuration = {}) {
    const shouldOpen = Boolean(nextOpen);
    const restoreFocus = configuration.restoreFocus !== false;
    if (shouldOpen === open) return open;

    if (shouldOpen) {
      restoreFocusTarget = documentRef?.activeElement?.focus ? documentRef.activeElement : showButton;
      open = true;
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      showButton.setAttribute("aria-expanded", "true");
      setBackgroundInert(true);
      setBodyLocked(true);
      closeButton.focus?.({ preventScroll: true });
      return true;
    }

    open = false;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    showButton.setAttribute("aria-expanded", "false");
    setBackgroundInert(false);
    setBodyLocked(false);
    if (restoreFocus) restoreFocusTarget?.focus?.({ preventScroll: true });
    restoreFocusTarget = showButton;
    return false;
  }

  function close(configuration) {
    return setOpen(false, configuration);
  }

  function openTable() {
    const snapshot = appState.getSnapshot();
    if (!isTerminalState(snapshot.simulation)) return false;
    const rows = renderMeasurementRows(tableBody, snapshot.measurements, i18n);
    downloadButton.disabled = rows.length === 0;
    downloadButton.setAttribute("aria-disabled", String(rows.length === 0));
    return setOpen(true);
  }

  function update(snapshot = appState.getSnapshot()) {
    if (destroyed) return false;
    const enabled = isTerminalState(snapshot.simulation);
    showButton.disabled = !enabled;
    showButton.setAttribute("aria-disabled", String(!enabled));
    if (!enabled) close();
    return enabled;
  }

  function localize() {
    if (open) {
      const snapshot = appState.getSnapshot();
      renderMeasurementRows(tableBody, snapshot.measurements, i18n);
    }
    return i18n.getLocale();
  }

  function onShowClick() {
    openTable();
  }

  function onCloseClick() {
    close();
  }

  function onDownloadClick() {
    const snapshot = appState.getSnapshot();
    if (!isTerminalState(snapshot.simulation) || snapshot.measurements.length === 0) return;
    downloader(snapshot.measurements);
  }

  function onOverlayClick(event) {
    if (event?.target === overlay) close();
  }

  function onKeyDown(event) {
    if (!open) return;
    event?.stopImmediatePropagation?.();

    if (event?.key === "Escape") {
      event.preventDefault?.();
      event.stopPropagation?.();
      close();
      return;
    }

    if (event?.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault?.();
      dialog.focus?.({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    const current = event.target ?? documentRef?.activeElement;
    const outside = !focusable.includes(current);
    const wrapsBackward = Boolean(event.shiftKey) && (current === first || outside);
    const wrapsForward = !event.shiftKey && (current === last || outside);
    if (!wrapsBackward && !wrapsForward) return;

    event.preventDefault?.();
    event.stopPropagation?.();
    (wrapsBackward ? last : first)?.focus?.({ preventScroll: true });
  }

  showButton.addEventListener("click", onShowClick);
  closeButton.addEventListener("click", onCloseClick);
  downloadButton.addEventListener("click", onDownloadClick);
  overlay.addEventListener("click", onOverlayClick);
  keyboardTarget?.addEventListener?.("keydown", onKeyDown);
  const unsubscribe = appState.subscribe((snapshot) => update(snapshot));
  const unsubscribeLanguage = i18n.subscribe(localize);
  update();

  return Object.freeze({
    update,
    open: openTable,
    close,
    localize,
    isOpen: () => open,
    destroy() {
      if (destroyed) return false;
      close({ restoreFocus: false });
      destroyed = true;
      showButton.removeEventListener?.("click", onShowClick);
      closeButton.removeEventListener?.("click", onCloseClick);
      downloadButton.removeEventListener?.("click", onDownloadClick);
      overlay.removeEventListener?.("click", onOverlayClick);
      keyboardTarget?.removeEventListener?.("keydown", onKeyDown);
      unsubscribe();
      unsubscribeLanguage();
      if (ownsI18n) i18n.destroy();
      return true;
    },
  });
}

/** Alias conservé pour les intégrations antérieures. */
const bindMeasurementExport = bindMeasurementResults;

return Object.freeze({ buildMeasurementsTableRows, buildMeasurementsCsv, downloadMeasurementsCsv, bindMeasurementResults, bindMeasurementExport });
})();

modules.app = (() => {
const { computeApparatusLayout } = modules.geometry;
const { createApparatusAnimator } = modules.animation;
const { localizeStaticApparatus, mountStaticApparatus } = modules.view;
const { createAppState } = modules.appState;
const { createI18n, formatNumber } = modules.i18n;
const { bindLanguageSelector } = modules.languageSelector;
const { bindModeSelector } = modules.modeSelector;
const { bindParameterControls } = modules.parameterControls;
const { createPersonController } = modules.personController;
const { createMassSelector } = modules.massSelector;
const { bindMobileMassSelector } = modules.mobileMassSelector;
const { createResponsiveApparatusViewport } = modules.responsiveApparatus;
const { bindSimulationControls } = modules.simulationControls;
const { createSensorController } = modules.sensorController;
const { createMeasurementRecorder } = modules.measurementRecorder;
const { bindMeasurementResults } = modules.measurementExport;
const { createTimeLoop } = modules.timeLoop;
const IMPACT_SENSOR_ID = 5;

/** Retourne la mesure du capteur placé à la fin de la chute, si elle existe. */
function getImpactSensorMeasurement(measurements = []) {
  if (!Array.isArray(measurements)) {
    throw new TypeError("measurements doit être un tableau.");
  }
  return measurements.find((measurement) => measurement?.sensorId === IMPACT_SENSOR_ID) ?? null;
}

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément d'interface introuvable : ${selector}`);
  }
  return element;
}

/**
 * Monte l'application animée. Le moteur physique n'est créé qu'après le choix
 * explicite d'un mode sur l'écran d'accueil.
 */
function createAnimatedApp(root = document, options = {}) {
  const host = getRequiredElement(root, "#apparatus-host");
  const timeValue = getRequiredElement(root, "#time-value");
  const s2StopTimeItem = getRequiredElement(root, "#s2-stop-time-item");
  const s2StopTimeValue = getRequiredElement(root, "#s2-stop-time-value");
  const s2ContactVelocityItem = getRequiredElement(root, "#s2-contact-velocity-item");
  const s2ContactVelocityValue = getRequiredElement(root, "#s2-contact-velocity-value");

  const i18n = options.i18n ?? createI18n(options.locale ?? "fr");
  const ownsI18n = !options.i18n;
  const languageSelector = bindLanguageSelector(root, i18n);

  const appState = options.appState ?? createAppState({
    mode: options.mode ?? null,
    parameters: options.parameters,
    sensorCount: options.sensorCount,
    playbackSpeed: options.playbackSpeed,
  });
  let runtime = null;
  let simulationControls = null;
  let destroyed = false;

  function formatReadoutNumber(value) {
    return formatNumber(i18n.getLocale(), value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function clearReadout() {
    timeValue.textContent = `${formatReadoutNumber(0)} s`;
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", true);
      item.setAttribute("aria-disabled", "true");
    }
    s2StopTimeValue.textContent = "";
    s2ContactVelocityValue.textContent = "";
  }

  function updateReadout(state) {
    timeValue.textContent = `${formatReadoutNumber(state.time)} s`;

    const impactMeasurement = getImpactSensorMeasurement(
      appState.getSnapshot().measurements,
    );
    const measurementAvailable = Boolean(impactMeasurement);
    for (const item of [s2StopTimeItem, s2ContactVelocityItem]) {
      item.classList.toggle("readout-item--pending", !measurementAvailable);
      item.setAttribute("aria-disabled", String(!measurementAvailable));
    }

    if (!measurementAvailable) {
      s2StopTimeValue.textContent = "";
      s2ContactVelocityValue.textContent = "";
      return;
    }

    s2StopTimeValue.textContent = `${formatReadoutNumber(impactMeasurement.time)} s`;
    s2ContactVelocityValue.textContent = `${formatReadoutNumber(impactMeasurement.velocity)} m/s`;
  }

  function destroyRuntime({ clearHost = false } = {}) {
    if (runtime) {
      runtime.personController?.destroy();
      runtime.massSelector?.destroy();
      runtime.responsiveViewport?.destroy();
      runtime.sensorController?.destroy();
      runtime.measurementRecorder?.destroy();
      runtime.loop.destroy();
      runtime = null;
    }
    if (clearHost) host.innerHTML = "";
  }

  function mountRuntime(snapshot) {
    if (!snapshot.mode) return null;
    destroyRuntime();
    clearReadout();
    const sensorCount = snapshot.experimental.sensorCount;
    const layout = computeApparatusLayout({
      ...snapshot.parameters,
      sensorCount,
    });
    const svg = mountStaticApparatus(host, {
      ...snapshot.parameters,
      sensorCount,
      i18n,
    });
    const animator = createApparatusAnimator(svg, layout);
    const responsiveViewport = createResponsiveApparatusViewport(svg, {
      windowRef: options.windowRef ?? root.defaultView ?? globalThis.window,
    });
    const massSelector = createMassSelector(svg, {
      selectedMass: snapshot.parameters.m2,
      onSelect(value) {
        appState.updateParameters({ m2: value });
      },
    });
    const measurementRecorder = createMeasurementRecorder(
      layout,
      snapshot.parameters,
      {
        noiseStdDev: snapshot.experimental.measurementNoiseStdDev,
        timeNoiseStdDev: snapshot.experimental.timeMeasurementNoiseStdDev,
        random: options.random ?? Math.random,
      },
    );
    const sensorController = createSensorController(svg, layout, {
      onCrossings(crossings) {
        const measurements = measurementRecorder.recordCrossings(crossings);
        if (measurements.length > 0) {
          appState.addMeasurements(measurements);
        }
      },
    });
    host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
    host.setAttribute("data-simulation-mode", snapshot.mode);
    let personController = null;
    const loop = createTimeLoop({
      parameters: snapshot.parameters,
      physicsStep: options.physicsStep ?? 0.002,
      playbackSpeed: snapshot.playbackSpeed,
      requestFrame: options.requestFrame,
      cancelFrame: options.cancelFrame,
      onRender(state, previousState, meta) {
        animator.render(state, previousState, meta);
        sensorController.render(state, previousState, meta);
        appState.setSimulationState(state);
        updateReadout(state);
        simulationControls?.update(state, meta);
      },
    });
    personController = createPersonController(svg, {
      i18n,
      initialState: loop.getState(),
      onActivate: () => simulationControls?.start() ?? false,
    });

    runtime = Object.freeze({
      loop,
      layout,
      svg,
      animator,
      massSelector,
      responsiveViewport,
      sensorController,
      measurementRecorder,
      personController,
    });
    simulationControls?.update(loop.getState(), loop.getDiagnostics());
    personController.update(loop.getState(), loop.getDiagnostics());
    return runtime;
  }

  const unsubscribe = appState.subscribe((snapshot, meta) => {
    if (destroyed) return;

    if (meta.reason === "mode-change") {
      mountRuntime(snapshot);
    } else if (meta.reason === "mode-cleared") {
      destroyRuntime({ clearHost: true });
      clearReadout();
    } else if (["parameters-change", "experimental-change"].includes(meta.reason)) {
      if (snapshot.mode) mountRuntime(snapshot);
    } else if (meta.reason === "playback-speed-change" && runtime) {
      runtime.loop.setPlaybackSpeed(snapshot.playbackSpeed);
    } else if (meta.reason === "measurements-recorded") {
      host.setAttribute("data-measurement-count", String(snapshot.measurements.length));
      updateReadout(snapshot.simulation);
    } else if (meta.reason === "experiment-reset" && runtime) {
      host.setAttribute("data-measurement-count", "0");
      runtime.measurementRecorder.reset();
      runtime.loop.reset(snapshot.parameters);
      runtime.personController.update(runtime.loop.getState(), runtime.loop.getDiagnostics());
      clearReadout();
    }
  });

  const modeSelector = bindModeSelector(root, appState);
  const mobileMassSelector = bindMobileMassSelector(root, appState, i18n);
  const measurementResults = bindMeasurementResults(root, appState, {
    ...options.exportOptions,
    i18n,
    keyboardTarget: options.keyboardTarget ?? root,
  });
  simulationControls = bindSimulationControls(root, {
    appState,
    i18n,
    getLoop: () => runtime?.loop,
    manualStepDuration: options.manualStepDuration,
    keyboardTarget: options.keyboardTarget,
    onUpdate(state, meta) {
      runtime?.personController.update(state, meta);
    },
  });
  const parameterControls = bindParameterControls(root, appState);
  const unsubscribeLanguage = i18n.subscribe(() => {
    if (runtime) {
      localizeStaticApparatus(runtime.svg, runtime.layout, i18n);
      updateReadout(runtime.loop.getState());
    } else {
      clearReadout();
    }
  });

  const initialSnapshot = appState.getSnapshot();
  clearReadout();
  if (initialSnapshot.mode) mountRuntime(initialSnapshot);

  return Object.freeze({
    appState,
    i18n,
    getRuntime: () => runtime,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      simulationControls?.destroy();
      measurementResults.destroy();
      parameterControls.destroy();
      modeSelector.destroy();
      mobileMassSelector.destroy();
      languageSelector.destroy();
      unsubscribeLanguage();
      unsubscribe();
      destroyRuntime({ clearHost: true });
      if (!options.appState) appState.destroy();
      if (ownsI18n) i18n.destroy();
      return true;
    },
  });
}

return Object.freeze({ IMPACT_SENSOR_ID, getImpactSensorMeasurement, createAnimatedApp });
})();
modules.app.createAnimatedApp(document);
})();