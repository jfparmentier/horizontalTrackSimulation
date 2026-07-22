/**
 * Constantes physiques et paramètres fixes de la simulation.
 */

export const GRAVITY = Object.freeze({
  earth: 9.81,
});

export const FIXED_TRACK_LENGTH = 2.0;
export const FIXED_M1 = 1.0;
export const FIXED_DROP_HEIGHT = 0.6;
export const FIXED_SENSOR_POSITIONS = Object.freeze([
  0.12, 0.24, 0.36, 0.48, 0.6,
  0.8, 1.0, 1.2, 1.4, 1.6, 1.8,
]);
export const FIXED_SENSOR_COUNT = FIXED_SENSOR_POSITIONS.length;
export const FIXED_MOBILE_LENGTH = 0.2;
export const AVAILABLE_HANGING_MASSES = Object.freeze([0.2, 0.5, 1.0, 2.0]);

export const SIMULATION_MODE_IDS = Object.freeze({
  ideal: "ideal",
  friction: "friction",
});

/**
 * Le coefficient du second mode est volontairement absent de l'interface :
 * il constitue la grandeur à déterminer expérimentalement par les élèves.
 * Le bruit est appliqué uniquement aux vitesses mesurées par les capteurs.
 */
export const SIMULATION_MODES = Object.freeze({
  [SIMULATION_MODE_IDS.ideal]: Object.freeze({
    id: SIMULATION_MODE_IDS.ideal,
    label: "Cas idéal",
    shortLabel: "Idéal",
    friction: 0,
    measurementNoiseStdDev: 0,
    measurementsAreNoisy: false,
  }),
  [SIMULATION_MODE_IDS.friction]: Object.freeze({
    id: SIMULATION_MODE_IDS.friction,
    label: "Cas avec frottement",
    shortLabel: "Frottement",
    friction: 0.058,
    measurementNoiseStdDev: 0.02,
    measurementsAreNoisy: true,
  }),
});

export const PARAMETER_LIMITS = Object.freeze({
  m1: Object.freeze({ min: 0.1, max: 2.0, unit: "kg" }),
  m2: Object.freeze({ min: 0.1, max: 2.0, step: 0.1, unit: "kg" }),
  dropHeight: Object.freeze({ min: 0.2, max: 1.0, unit: "m" }),
  trackLength: Object.freeze({ min: 1.0, max: 3.0, unit: "m" }),
  friction: Object.freeze({ min: 0.0, max: 0.2, unit: "1" }),
});

export const DEFAULT_PARAMETERS = Object.freeze({
  m1: FIXED_M1,
  m2: 0.2,
  dropHeight: FIXED_DROP_HEIGHT,
  trackLength: FIXED_TRACK_LENGTH,
  friction: SIMULATION_MODES[SIMULATION_MODE_IDS.ideal].friction,
  gravityMode: "earth",
});

export const NUMERICAL_EPSILON = 1e-12;
