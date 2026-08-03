export const DEFAULT_LOCALE = "fr";
export const SUPPORTED_LOCALES = Object.freeze(["fr", "en"]);

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

export function normalizeLocale(locale) {
  const normalized = String(locale ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function interpolate(template, parameters = {}) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => (
    Object.hasOwn(parameters, name) ? String(parameters[name]) : match
  ));
}

export function translate(locale, key, parameters = {}) {
  const normalized = normalizeLocale(locale);
  const template = MESSAGES[normalized]?.[key] ?? MESSAGES[DEFAULT_LOCALE]?.[key] ?? key;
  return interpolate(template, parameters);
}

export function formatNumber(locale, value, options = {}) {
  const normalizedValue = Number(value);
  if (!Number.isFinite(normalizedValue)) {
    throw new TypeError("La valeur à formater doit être un nombre fini.");
  }

  const normalizedLocale = normalizeLocale(locale);
  const localeId = normalizedLocale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(localeId, options).format(normalizedValue);
}

export function createI18n(initialLocale = DEFAULT_LOCALE) {
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
