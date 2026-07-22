import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.disabled = false;
    this.textContent = "";
    this.value = "";
    this.checked = false;
    this.attributes = new Map();
    this.dataset = {};
    this.listeners = new Map();
    this._innerHTML = "";
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
  dispatch(name) {
    for (const callback of this.listeners.get(name) ?? []) callback({ target: this });
  }
  querySelector() {
    return null;
  }
  set innerHTML(value) {
    this._innerHTML = String(value);
  }
  get innerHTML() {
    return this._innerHTML;
  }
}

class FakeSvg extends FakeElement {
  constructor() {
    super("apparatus-svg");
    this.nodes = new Map([
      ["#layer-mobile", new FakeElement("layer-mobile")],
      ["#layer-hanging-mass", new FakeElement("layer-hanging-mass")],
      ["#string-path", new FakeElement("string-path")],
      ["#apparatus-description", new FakeElement("apparatus-description")],
      ...Array.from({ length: 16 }, (_, index) => [
        `#sensor-${index + 1}`,
        new FakeElement(`sensor-${index + 1}`),
      ]),
    ]);
  }
  querySelector(selector) {
    return this.nodes.get(selector) ?? null;
  }
}

class FakeHost extends FakeElement {
  constructor() {
    super("apparatus-host");
    this.svg = null;
  }
  set innerHTML(value) {
    this._innerHTML = String(value);
    this.svg = new FakeSvg();
  }
  querySelector(selector) {
    return selector === "#apparatus-svg" ? this.svg : null;
  }
}

const elements = new Map();
for (const id of [
  "start-button", "pause-button", "step-button", "reset-button",
  "time-value", "position-value", "velocity-value", "phase-value", "sensor-value", "control-status",
  "parameter-error",
  "m1-range", "m1-number", "m2-range", "m2-number",
  "drop-height-range", "drop-height-number",
  "track-length-range", "track-length-number",
  "friction-range", "friction-number",
  "sensor-count-range", "sensor-count-number",
  "playback-speed-range", "playback-speed-number",
  "gravity-earth", "gravity-moon",
]) {
  elements.set(`#${id}`, new FakeElement(id));
}
const host = new FakeHost();
elements.set("#apparatus-host", host);
const documentListeners = new Map();
const document = {
  querySelector(selector) {
    return elements.get(selector) ?? null;
  },
  addEventListener(name, callback) {
    const callbacks = documentListeners.get(name) ?? new Set();
    callbacks.add(callback);
    documentListeners.set(name, callbacks);
  },
  removeEventListener(name, callback) {
    documentListeners.get(name)?.delete(callback);
  },
};

let nextFrameId = 1;
const callbacks = new Map();
const context = vm.createContext({
  console,
  document,
  requestAnimationFrame(callback) {
    const id = nextFrameId++;
    callbacks.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    callbacks.delete(id);
  },
  Intl,
  Object,
  Array,
  Map,
  Set,
  Math,
  Number,
  String,
  Boolean,
  TypeError,
  RangeError,
  Error,
});
context.globalThis = context;

const bundle = fs.readFileSync(path.join(root, "dist-standalone.js"), "utf8");
vm.runInContext(bundle, context, { filename: "dist-standalone.js" });

if (!host.svg) throw new Error("Le SVG n'a pas été monté.");
if (!host.svg.nodes.get("#string-path").attributes.get("d")) {
  throw new Error("Le fil n'a pas reçu son tracé initial.");
}
if (elements.get("#time-value").textContent !== "0.00 s") {
  throw new Error("L'affichage initial du temps est incorrect.");
}
if (elements.get("#m1-number").value !== "0.5") {
  throw new Error("Les paramètres n'ont pas été synchronisés avec l'état central.");
}
if (elements.get("#control-status").textContent !== "Simulation prête.") {
  throw new Error("L'état initial des commandes est incorrect.");
}
if (elements.get("#sensor-value").textContent !== "0 / 8") {
  throw new Error("L'état initial des capteurs est incorrect.");
}
if (elements.get("#reset-button").disabled !== true) {
  throw new Error("Le bouton de réinitialisation devrait être désactivé à l'état initial.");
}

elements.get("#m2-range").value = "0.4";
elements.get("#m2-range").dispatch("input");
if (!host._innerHTML.includes("8 capteurs")) {
  throw new Error("Le montage n'a pas été reconstruit après modification.");
}
if (elements.get("#m2-number").value !== "0.4") {
  throw new Error("La paire de contrôles m2 n'est pas synchronisée.");
}
elements.get("#step-button").dispatch("click");
if (elements.get("#time-value").textContent === "0.00 s") {
  throw new Error("Le bouton pas à pas n'a pas fait progresser la simulation.");
}
if (elements.get("#start-button").textContent !== "Reprendre") {
  throw new Error("Le libellé de reprise n'a pas été actualisé.");
}
const firstSensorState = host.svg.nodes.get("#sensor-1").attributes.get("data-sensor-state");
if (!firstSensorState) {
  throw new Error("Les capteurs n'ont pas été initialisés.");
}
for (let index = 0; index < 20; index += 1) {
  elements.get("#step-button").dispatch("click");
}
const measurementCount = Number(host.attributes.get("data-measurement-count"));
if (!Number.isInteger(measurementCount) || measurementCount <= 0) {
  throw new Error("Aucune mesure de capteur n'a été enregistrée dans l'état central.");
}
console.log("Smoke test autonome réussi.");
