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

class FakeClassList {
  constructor() { this.items = new Set(); }
  toggle(name, force) {
    if (force) this.items.add(name);
    else this.items.delete(name);
  }
  contains(name) { return this.items.has(name); }
}

class FakeElement {
  constructor(documentRef = null) {
    this.disabled = false;
    this.hidden = false;
    this.innerHTML = "";
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
    this.inert = false;
    this.classList = new FakeClassList();
    this.documentRef = documentRef;
    this.focusableChildren = [];
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  dispatch(name, event = {}) {
    const normalized = { target: this, preventDefault() {}, stopPropagation() {}, ...event };
    for (const callback of this.listeners.get(name) ?? []) callback(normalized);
  }
  click() {
    this.dispatch("click");
  }
  focus() {
    this.focused = true;
    if (this.documentRef) this.documentRef.activeElement = this;
  }
  querySelectorAll() { return this.focusableChildren; }
}

function createResultsDom() {
  const documentRef = {
    activeElement: null,
    body: { classList: new FakeClassList() },
  };
  const showButton = new FakeElement(documentRef);
  const overlay = new FakeElement(documentRef);
  const dialog = new FakeElement(documentRef);
  const tableBody = new FakeElement(documentRef);
  const closeButton = new FakeElement(documentRef);
  const downloadButton = new FakeElement(documentRef);
  const apparatusCard = new FakeElement(documentRef);
  dialog.focusableChildren = [downloadButton, closeButton];
  const elements = new Map([
    ["#show-data-button", showButton],
    ["#measurement-table-overlay", overlay],
    [".measurement-table-dialog", dialog],
    ["#measurement-table-body", tableBody],
    ["#measurement-table-close-button", closeButton],
    ["#measurement-table-download-button", downloadButton],
    [".apparatus-card", apparatusCard],
  ]);
  overlay.hidden = true;
  const root = {
    body: documentRef.body,
    activeElement: null,
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
      for (const callback of this.listeners?.get(name) ?? []) callback({ preventDefault() {}, stopPropagation() {}, ...event });
    },
  };
  return { elements, root, documentRef };
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

test("le tableau et le CSV français utilisent la virgule décimale", () => {
  const rows = buildMeasurementsTableRows(MEASUREMENTS, { locale: "fr" });
  const csv = buildMeasurementsCsv(MEASUREMENTS, { locale: "fr" });
  const lines = csv.trim().split("\r\n");

  assert.deepEqual(rows, [
    ["1", "0,222222", "0,512", "0,8"],
    ["2", "0,444444", "0,812346", "1,234568"],
  ]);
  assert.equal(lines.length, 3);
  assert.equal(
    lines[0],
    '"Numéro du capteur";"Position (m)";"Instant de déclenchement (s)";"Vitesse mesurée (m/s)"',
  );
  assert.equal(lines[1], "1;0,222222;0,512;0,8");
  assert.equal(lines[2], "2;0,444444;0,812346;1,234568");
  assert.ok(lines.every((line) => line.split(";").length === 4));
});

test("le tableau anglais utilise le point décimal", () => {
  assert.deepEqual(buildMeasurementsTableRows(MEASUREMENTS, { locale: "en" }), [
    ["1", "0.222222", "0.512", "0.8"],
    ["2", "0.444444", "0.812346", "1.234568"],
  ]);
});

test("un tableau vide produit un CSV avec uniquement l'en-tête", () => {
  const csv = buildMeasurementsCsv([], { locale: "fr" });
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
  const { root, elements, documentRef } = createResultsDom();
  const store = createAppState({ measurements: measurementsForStore() });
  const exported = [];
  const binding = bindMeasurementResults(root, store, {
    documentRef,
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
  assert.equal(elements.get(".apparatus-card").inert, true);
  assert.equal(elements.get(".apparatus-card").attributes.get("aria-hidden"), "true");
  assert.equal(documentRef.body.classList.contains("measurement-dialog-open"), true);
  assert.match(tableBody.innerHTML, /<td data-label="Numéro du capteur">1<\/td><td data-label="Position \(m\)">0,222222<\/td><td data-label="Instant de déclenchement \(s\)">0,512<\/td><td data-label="Vitesse mesurée \(m\/s\)">0,8<\/td>/);
  assert.match(tableBody.innerHTML, /<td data-label="Numéro du capteur">2<\/td><td data-label="Position \(m\)">0,444444<\/td><td data-label="Instant de déclenchement \(s\)">0,812346<\/td><td data-label="Vitesse mesurée \(m\/s\)">1,234568<\/td>/);

  downloadButton.click();
  assert.equal(exported.length, 1);
  assert.equal(exported[0].length, 2);

  closeButton.click();
  assert.equal(overlay.hidden, true);
  assert.equal(showButton.focused, true);
  assert.equal(elements.get(".apparatus-card").inert, false);
  assert.equal(documentRef.body.classList.contains("measurement-dialog-open"), false);
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
  const lines = buildMeasurementsCsv(measurements, { locale: "fr" }).trim().split("\r\n").slice(1);

  assert.deepEqual(
    lines.map((line) => Number(line.split(";")[1].replace(",", "."))),
    positions,
  );
});

test("le CSV adapte ses en-têtes et son nom à la langue anglaise", () => {
  const csv = buildMeasurementsCsv(MEASUREMENTS, { locale: "en" });
  assert.match(csv, /^"Sensor number","Position \(m\)","Trigger time \(s\)","Measured speed \(m\/s\)"/);
  assert.match(csv, /1,0\.222222,0\.512,0\.8/);

  const clicks = [];
  class FakeBlob {
    constructor(parts) { this.parts = parts; }
  }
  const result = downloadMeasurementsCsv(MEASUREMENTS, {
    locale: "en",
    documentRef: {
      body: { appendChild() {} },
      createElement() {
        return {
          click() { clicks.push(true); },
          remove() {},
          hidden: false,
          href: "",
          download: "",
        };
      },
    },
    urlApi: {
      createObjectURL() { return "blob:test"; },
      revokeObjectURL() {},
    },
    BlobConstructor: FakeBlob,
  });

  assert.equal(result.filename, "sensor-measurements.csv");
  assert.equal(clicks.length, 1);
});


test("le dialogue piège le focus entre les actions et le restitue à la fermeture", () => {
  const { root, elements, documentRef } = createResultsDom();
  const store = createAppState({ measurements: measurementsForStore() });
  bindMeasurementResults(root, store, { documentRef, downloader() {} });
  store.setSimulationState(terminalSimulation());

  const show = elements.get("#show-data-button");
  const download = elements.get("#measurement-table-download-button");
  const close = elements.get("#measurement-table-close-button");
  show.focus();
  show.click();

  let prevented = 0;
  root.dispatch("keydown", { key: "Tab", target: close, preventDefault() { prevented += 1; } });
  assert.equal(download.focused, true);
  root.dispatch("keydown", { key: "Tab", shiftKey: true, target: download, preventDefault() { prevented += 1; } });
  assert.equal(close.focused, true);
  assert.equal(prevented, 2);

  root.dispatch("keydown", { key: "Escape", target: close });
  assert.equal(elements.get("#measurement-table-overlay").hidden, true);
  assert.equal(documentRef.activeElement, show);
});
