import test from "node:test";
import assert from "node:assert/strict";

import {
  IMPACT_SENSOR_ID,
  getImpactSensorMeasurement,
} from "../src/animated-app.js";

test("les résultats de chute utilisent exclusivement la mesure du capteur numéro 5", () => {
  const measurements = [
    { sensorId: 4, time: 0.51, velocity: 1.62 },
    { sensorId: 5, time: 0.73, velocity: 1.91 },
    { sensorId: 6, time: 0.84, velocity: 1.83 },
  ];

  assert.equal(IMPACT_SENSOR_ID, 5);
  assert.equal(getImpactSensorMeasurement(measurements), measurements[1]);
});

test("la mesure d'impact conserve les valeurs bruitées enregistrées", () => {
  const noisyMeasurement = Object.freeze({
    sensorId: 5,
    position: 0.6,
    time: 0.812,
    velocity: 2.074,
  });

  const result = getImpactSensorMeasurement([noisyMeasurement]);

  assert.equal(result.time, 0.812);
  assert.equal(result.velocity, 2.074);
  assert.equal(getImpactSensorMeasurement([]), null);
  assert.throws(() => getImpactSensorMeasurement(null), /tableau/i);
});
