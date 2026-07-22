/**
 * Constantes physiques et limites retenues pour la première version.
 */

export const GRAVITY = Object.freeze({
  earth: 9.81,
});

export const FIXED_TRACK_LENGTH = 2.0;
export const FIXED_M1 = 1.0;
export const FIXED_DROP_HEIGHT = 0.6;
export const FIXED_SENSOR_COUNT = 9;
export const FIXED_MOBILE_LENGTH = 0.2;

export const PARAMETER_LIMITS = Object.freeze({
  m1: Object.freeze({ min: 0.1, max: 2.0, unit: "kg" }),
  m2: Object.freeze({ min: 0.1, max: 2.0, step: 0.1, unit: "kg" }),
  dropHeight: Object.freeze({ min: 0.2, max: 1.0, unit: "m" }),
  trackLength: Object.freeze({ min: 1.0, max: 3.0, unit: "m" }),
  friction: Object.freeze({ min: 0.0, max: 0.2, unit: "1" }),
});

export const DEFAULT_PARAMETERS = Object.freeze({
  m1: FIXED_M1,
  m2: 0.1,
  dropHeight: FIXED_DROP_HEIGHT,
  trackLength: FIXED_TRACK_LENGTH,
  friction: 0.0,
  gravityMode: "earth",
});

export const NUMERICAL_EPSILON = 1e-12;
