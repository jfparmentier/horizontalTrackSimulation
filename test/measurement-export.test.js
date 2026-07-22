import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import {
  bindMeasurementExport,
  buildMeasurementsCsv,
  downloadMeasurementsCsv,
} from "../src/measurement-export.js";

const MEASUREMENTS = Object.freeze([
  Object.freeze({ sensorId: 2, position: 0.4444444, time: 0.81234567, velocity: 1.23456789 }),
  Object.freeze({ sensorId: 1, position: 0.2222222, time: 0.512, velocity: 0.8 }),
]);

class FakeButton {
  constructor() {
    this.disabled = false;
    this.attributes = new Map();
    this.listeners = new Map();
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  click() {
    for (const callback of this.listeners.get("click") ?? []) callback({ target: this });
  }
}

function terminalSimulation(status = "finished") {
  return {
    time: 2,
    position: 1.8,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0.5,
    phase: 2,
    status,
    endReason: status === "blocked" ? "insufficient-force" : "track-end",
  };
}

test("le CSV contient exactement quatre colonnes et trie les capteurs", () => {
  const csv = buildMeasurementsCsv(MEASUREMENTS);
  const lines = csv.trim().split("\r\n");

  assert.equal(lines.length, 3);
  assert.equal(
    lines[0],
    '"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"',
  );
  assert.equal(lines[1], "1,0.222222,0.512,0.8");
  assert.equal(lines[2], "2,0.444444,0.812346,1.234568");
  assert.ok(lines.every((line) => line.split(",").length === 4));
});

test("un tableau vide produit un CSV avec uniquement l'en-tête", () => {
  const csv = buildMeasurementsCsv([]);
  assert.equal(csv.trim().split("\r\n").length, 1);
});

test("le téléchargement crée un fichier UTF-8 et libère l'URL temporaire", () => {
  let clicked = false;
  let appended = false;
  let removed = false;
  let revoked = null;
  let createdBlob = null;
  const link = {
    href: "",
    download: "",
    hidden: false,
    click() { clicked = true; },
    remove() { removed = true; },
  };
  class FakeBlob {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
      createdBlob = this;
    }
  }
  const documentRef = {
    body: { appendChild() { appended = true; } },
    createElement(tagName) {
      assert.equal(tagName, "a");
      return link;
    },
  };
  const urlApi = {
    createObjectURL(blob) {
      assert.equal(blob, createdBlob);
      return "blob:test";
    },
    revokeObjectURL(url) { revoked = url; },
  };

  const result = downloadMeasurementsCsv(MEASUREMENTS, {
    documentRef,
    urlApi,
    BlobConstructor: FakeBlob,
  });

  assert.equal(result.filename, "mesures-capteurs.csv");
  assert.equal(link.download, "mesures-capteurs.csv");
  assert.equal(link.href, "blob:test");
  assert.equal(createdBlob.parts[0], "\uFEFF");
  assert.equal(createdBlob.options.type, "text/csv;charset=utf-8");
  assert.equal(appended, true);
  assert.equal(clicked, true);
  assert.equal(removed, true);
  assert.equal(revoked, "blob:test");
});

test("le bouton reste inactif avant la fin puis s'active à l'état terminal", () => {
  const button = new FakeButton();
  const root = { querySelector: (selector) => selector === "#download-data-button" ? button : null };
  const store = createAppState({ measurements: MEASUREMENTS.map((item, index) => ({
    ...item,
    mobilePosition: item.position,
    acceleration: 0,
    phase: index === 0 ? 2 : 1,
  })) });
  const exported = [];
  const binding = bindMeasurementExport(root, store, {
    downloader(measurements) { exported.push(measurements); },
  });

  assert.equal(button.disabled, true);
  button.click();
  assert.equal(exported.length, 0);

  store.setSimulationState(terminalSimulation());
  assert.equal(button.disabled, false);
  assert.equal(button.attributes.get("aria-disabled"), "false");

  button.click();
  assert.equal(exported.length, 1);
  assert.equal(exported[0].length, 2);

  store.resetExperiment();
  assert.equal(button.disabled, true);
  assert.equal(binding.destroy(), true);
});

test("un système bloqué est considéré comme une simulation terminée", () => {
  const button = new FakeButton();
  const root = { querySelector: () => button };
  const store = createAppState();
  bindMeasurementExport(root, store, { downloader() {} });

  store.setSimulationState({
    ...terminalSimulation("blocked"),
    position: 0,
    time: 0,
    hangingDisplacement: 0,
    phase: 1,
  });
  assert.equal(button.disabled, false);
});

test("le CSV conserve les positions nominales des neuf capteurs", () => {
  const measurements = Array.from({ length: 9 }, (_, index) => ({
    sensorId: index + 1,
    position: (index + 1) * 0.2,
    time: index + 0.1,
    velocity: index + 0.2,
  }));
  const lines = buildMeasurementsCsv(measurements).trim().split("\r\n").slice(1);

  assert.deepEqual(
    lines.map((line) => Number(line.split(",")[1])),
    [0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8],
  );
});
