import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import {
  bindMeasurementResults,
  buildMeasurementsCsv,
  buildMeasurementsTableRows,
  downloadMeasurementsCsv,
} from "../src/measurement-export.js";

const MEASUREMENTS = Object.freeze([
  Object.freeze({ sensorId: 2, position: 0.4444444, time: 0.81234567, velocity: 1.23456789 }),
  Object.freeze({ sensorId: 1, position: 0.2222222, time: 0.512, velocity: 0.8 }),
]);

class FakeElement {
  constructor() {
    this.disabled = false;
    this.hidden = false;
    this.innerHTML = "";
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
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
  dispatch(name, event = {}) {
    const normalized = { target: this, preventDefault() {}, ...event };
    for (const callback of this.listeners.get(name) ?? []) callback(normalized);
  }
  click() {
    this.dispatch("click");
  }
  focus() {
    this.focused = true;
  }
}

function createResultsDom() {
  const elements = new Map([
    ["#show-data-button", new FakeElement()],
    ["#measurement-table-overlay", new FakeElement()],
    ["#measurement-table-body", new FakeElement()],
    ["#measurement-table-close-button", new FakeElement()],
    ["#measurement-table-download-button", new FakeElement()],
  ]);
  elements.get("#measurement-table-overlay").hidden = true;
  return {
    elements,
    root: {
      querySelector(selector) { return elements.get(selector) ?? null; },
      addEventListener(name, callback) {
        const callbacks = this.listeners?.get(name) ?? new Set();
        if (!this.listeners) this.listeners = new Map();
        callbacks.add(callback);
        this.listeners.set(name, callbacks);
      },
      removeEventListener(name, callback) {
        this.listeners?.get(name)?.delete(callback);
      },
      dispatch(name, event = {}) {
        for (const callback of this.listeners?.get(name) ?? []) callback({ preventDefault() {}, ...event });
      },
    },
  };
}

function terminalSimulation(status = "finished") {
  return {
    time: 2,
    position: 1.8,
    velocity: 0,
    acceleration: 0,
    hangingDisplacement: 0.6,
    phase: 2,
    status,
    endReason: status === "blocked" ? "insufficient-force" : "track-end",
  };
}

function measurementsForStore() {
  return MEASUREMENTS.map((item, index) => ({
    ...item,
    mobilePosition: item.position,
    acceleration: 0,
    phase: index === 0 ? 2 : 1,
  }));
}

test("les lignes du tableau et du CSV utilisent les mêmes valeurs triées", () => {
  const rows = buildMeasurementsTableRows(MEASUREMENTS);
  const csv = buildMeasurementsCsv(MEASUREMENTS);
  const lines = csv.trim().split("\r\n");

  assert.deepEqual(rows, [
    ["1", "0.222222", "0.512", "0.8"],
    ["2", "0.444444", "0.812346", "1.234568"],
  ]);
  assert.equal(lines.length, 3);
  assert.equal(
    lines[0],
    '"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"',
  );
  assert.equal(lines[1], rows[0].join(","));
  assert.equal(lines[2], rows[1].join(","));
  assert.ok(lines.every((line) => line.split(",").length === 4));
});

test("un tableau vide produit un CSV avec uniquement l'en-tête", () => {
  const csv = buildMeasurementsCsv([]);
  assert.equal(csv.trim().split("\r\n").length, 1);
  assert.deepEqual(buildMeasurementsTableRows([]), []);
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

test("le bouton ouvre le tableau uniquement après la fin de la simulation", () => {
  const { root, elements } = createResultsDom();
  const store = createAppState({ measurements: measurementsForStore() });
  const exported = [];
  const binding = bindMeasurementResults(root, store, {
    downloader(measurements) { exported.push(measurements); },
  });
  const showButton = elements.get("#show-data-button");
  const overlay = elements.get("#measurement-table-overlay");
  const tableBody = elements.get("#measurement-table-body");
  const closeButton = elements.get("#measurement-table-close-button");
  const downloadButton = elements.get("#measurement-table-download-button");

  assert.equal(showButton.disabled, true);
  showButton.click();
  assert.equal(overlay.hidden, true);

  store.setSimulationState(terminalSimulation());
  assert.equal(showButton.disabled, false);
  assert.equal(showButton.attributes.get("aria-disabled"), "false");

  showButton.click();
  assert.equal(overlay.hidden, false);
  assert.equal(overlay.attributes.get("aria-hidden"), "false");
  assert.equal(showButton.attributes.get("aria-expanded"), "true");
  assert.equal(closeButton.focused, true);
  assert.match(tableBody.innerHTML, /<td>1<\/td><td>0\.222222<\/td><td>0\.512<\/td><td>0\.8<\/td>/);
  assert.match(tableBody.innerHTML, /<td>2<\/td><td>0\.444444<\/td><td>0\.812346<\/td><td>1\.234568<\/td>/);

  downloadButton.click();
  assert.equal(exported.length, 1);
  assert.equal(exported[0].length, 2);

  closeButton.click();
  assert.equal(overlay.hidden, true);
  assert.equal(showButton.attributes.get("aria-expanded"), "false");

  showButton.click();
  root.dispatch("keydown", { key: "Escape" });
  assert.equal(overlay.hidden, true);

  store.resetExperiment();
  assert.equal(showButton.disabled, true);
  assert.equal(binding.destroy(), true);
});

test("un système bloqué permet d'ouvrir un tableau vide mais pas de télécharger", () => {
  const { root, elements } = createResultsDom();
  const store = createAppState();
  bindMeasurementResults(root, store, { downloader() {} });

  store.setSimulationState({
    ...terminalSimulation("blocked"),
    position: 0,
    time: 0,
    hangingDisplacement: 0,
    phase: 1,
  });
  elements.get("#show-data-button").click();

  assert.equal(elements.get("#show-data-button").disabled, false);
  assert.equal(elements.get("#measurement-table-overlay").hidden, false);
  assert.equal(elements.get("#measurement-table-download-button").disabled, true);
  assert.match(elements.get("#measurement-table-body").innerHTML, /Aucune mesure disponible/);
});

test("le CSV conserve les positions nominales des onze capteurs", () => {
  const positions = [0.12, 0.24, 0.36, 0.48, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8];
  const measurements = positions.map((position, index) => ({
    sensorId: index + 1,
    position,
    time: index + 0.1,
    velocity: index + 0.2,
  }));
  const lines = buildMeasurementsCsv(measurements).trim().split("\r\n").slice(1);

  assert.deepEqual(
    lines.map((line) => Number(line.split(",")[1])),
    positions,
  );
});
