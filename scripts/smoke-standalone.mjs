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
  "time-value", "position-value", "velocity-value", "phase-value",
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
const document = {
  querySelector(selector) {
    return elements.get(selector) ?? null;
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

elements.get("#m2-range").value = "0.4";
elements.get("#m2-range").dispatch("input");
if (!host._innerHTML.includes("8 capteurs")) {
  throw new Error("Le montage n'a pas été reconstruit après modification.");
}
if (elements.get("#m2-number").value !== "0.4") {
  throw new Error("La paire de contrôles m2 n'est pas synchronisée.");
}
console.log("Smoke test autonome réussi.");
