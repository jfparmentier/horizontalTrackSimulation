/**
 * Constantes physiques et limites retenues pour la première version.
 */

export const GRAVITY = Object.freeze({
  earth: 9.81,
  moon: 1.62,
});

export const PARAMETER_LIMITS = Object.freeze({
  m1: Object.freeze({ min: 0.1, max: 2.0, unit: "kg" }),
  m2: Object.freeze({ min: 0.01, max: 2.0, unit: "kg" }),
  dropHeight: Object.freeze({ min: 0.2, max: 1.0, unit: "m" }),
  trackLength: Object.freeze({ min: 1.0, max: 3.0, unit: "m" }),
  friction: Object.freeze({ min: 0.0, max: 0.2, unit: "1" }),
});

export const DEFAULT_PARAMETERS = Object.freeze({
  m1: 0.5,
  m2: 0.1,
  dropHeight: 0.5,
  trackLength: 2.0,
  friction: 0.0,
  gravityMode: "earth",
});

export const NUMERICAL_EPSILON = 1e-12;
