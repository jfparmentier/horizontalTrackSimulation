import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.disabled = false;
    this.hidden = false;
    this.textContent = "";
    this.value = "";
    this.checked = false;
    this.attributes = new Map();
    this.dataset = {};
    this.listeners = new Map();
    this.classes = new Set();
    this.classList = {
      toggle: (name, force) => {
        const enabled = force === undefined ? !this.classes.has(name) : Boolean(force);
        if (enabled) this.classes.add(name);
        else this.classes.delete(name);
        return enabled;
      },
      contains: (name) => this.classes.has(name),
    };
    this._innerHTML = "";
    this.focused = false;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
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
  querySelector() {
    return null;
  }
  focus() {
    this.focused = true;
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
    this.massChoices = [0.2, 1, 2].map((value) => {
      const element = new FakeElement(`mass-choice-${value}`);
      element.dataset.massValue = String(value);
      element.dataset.originX = "0";
      element.dataset.originY = "0";
      element.setAttribute("transform", "translate(0 0)");
      return element;
    });
  }
  querySelector(selector) {
    return this.nodes.get(selector) ?? null;
  }
  querySelectorAll(selector) {
    return selector === '[data-role="mass-choice"]' ? this.massChoices : [];
  }
}

class FakeHost extends FakeElement {
  constructor() {
    super("apparatus-host");
    this.svg = null;
  }
  set innerHTML(value) {
    this._innerHTML = String(value);
    this.svg = this._innerHTML.trim() ? new FakeSvg() : null;
  }
  querySelector(selector) {
    return selector === "#apparatus-svg" ? this.svg : null;
  }
}

const elements = new Map();
for (const id of [
  "mode-selection", "simulation-screen", "mode-ideal-button", "mode-friction-button",
  "mode-home-button", "language-fr-button", "language-en-button",
  "start-button", "pause-button", "step-button", "reset-button", "show-data-button",
  "measurement-table-overlay", "measurement-table-body",
  "measurement-table-close-button", "measurement-table-download-button",
  "time-value", "s2-stop-time-item", "s2-stop-time-value",
  "s2-contact-velocity-item", "s2-contact-velocity-value",
  "playback-speed-range", "playback-speed-number",
]) {
  elements.set(`#${id}`, new FakeElement(id));
}
const host = new FakeHost();
elements.set("#apparatus-host", host);
const documentListeners = new Map();
const document = {
  documentElement: new FakeElement("html"),
  title: "",
  body: { appendChild() {} },
  createElement() {
    return {
      click() {},
      remove() {},
      href: "",
      download: "",
      hidden: false,
    };
  },
  querySelector(selector) {
    return elements.get(selector) ?? null;
  },
  querySelectorAll() {
    return [];
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
  Blob: class Blob {},
  URL: {
    createObjectURL() { return "blob:smoke"; },
    revokeObjectURL() {},
  },
});
context.globalThis = context;

const bundle = fs.readFileSync(path.join(root, "dist-standalone.js"), "utf8");
vm.runInContext(bundle, context, { filename: "dist-standalone.js" });

if (document.documentElement.attributes.get("lang") !== "fr") {
  throw new Error("Le français devrait être la langue par défaut.");
}
if (elements.get("#language-fr-button").attributes.get("aria-pressed") !== "true") {
  throw new Error("Le bouton français devrait être actif au démarrage.");
}

if (host.svg) throw new Error("Le SVG ne doit pas être monté avant le choix du mode.");
if (elements.get("#mode-selection").hidden) {
  throw new Error("L'écran de sélection du mode devrait être visible au démarrage.");
}
if (!elements.get("#simulation-screen").hidden) {
  throw new Error("La simulation devrait être masquée avant le choix du mode.");
}

elements.get("#mode-ideal-button").dispatch("click");
if (!host.svg) throw new Error("Le SVG n'a pas été monté après le choix du mode idéal.");
if (!elements.get("#mode-selection").hidden || elements.get("#simulation-screen").hidden) {
  throw new Error("Le choix du mode n'a pas ouvert la simulation.");
}
if (!host.svg.nodes.get("#string-path").attributes.get("d")) {
  throw new Error("Le fil n'a pas reçu son tracé initial.");
}
if (elements.get("#time-value").textContent !== "0,00 s") {
  throw new Error("L'affichage initial du temps est incorrect.");
}
if (!host._innerHTML.includes(">0.5 kg</text>")) {
  throw new Error("La masse suspendue initiale de 0.5 kg n'est pas affichée.");
}
if (elements.get("#show-data-button").disabled !== true) {
  throw new Error("Le bouton du tableau devrait être désactivé avant la fin de la simulation.");
}
if (
  elements.get("#s2-stop-time-item").attributes.get("aria-disabled") !== "true"
  || elements.get("#s2-contact-velocity-item").attributes.get("aria-disabled") !== "true"
  || elements.get("#s2-stop-time-value").textContent !== ""
  || elements.get("#s2-contact-velocity-value").textContent !== ""
) {
  throw new Error("Les résultats de la phase 1 doivent être visibles, grisés et vides avant la phase 2.");
}
if (elements.get("#reset-button").disabled !== true) {
  throw new Error("Le bouton de réinitialisation devrait être désactivé à l'état initial.");
}

host.svg.massChoices[0].dispatch("keydown", { key: "Enter" });
if (!host._innerHTML.includes("11 capteurs")) {
  throw new Error("Le montage n'a pas été reconstruit après remplacement de la masse.");
}
if (!host._innerHTML.includes(">0.2 kg</text>")) {
  throw new Error("La sélection accessible de la masse de 0.2 kg a échoué.");
}
elements.get("#step-button").dispatch("click");
if (elements.get("#time-value").textContent === "0.00 s") {
  throw new Error("Le bouton pas à pas n'a pas fait progresser la simulation.");
}
if (elements.get("#start-button").attributes.get("aria-label") !== "Reprendre") {
  throw new Error("Le libellé accessible de reprise n'a pas été actualisé.");
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
if (
  elements.get("#s2-stop-time-item").attributes.get("aria-disabled") !== "false"
  || elements.get("#s2-contact-velocity-item").attributes.get("aria-disabled") !== "false"
  || !/ s$/.test(elements.get("#s2-stop-time-value").textContent)
  || !/ m\/s$/.test(elements.get("#s2-contact-velocity-value").textContent)
) {
  throw new Error("La durée de chute et la vitesse d'impact doivent être renseignées dès le début de la phase 2.");
}

for (let index = 0; index < 100 && elements.get("#show-data-button").disabled; index += 1) {
  elements.get("#step-button").dispatch("click");
}
if (elements.get("#show-data-button").disabled) {
  throw new Error("La simulation autonome n'a pas atteint son état terminal.");
}
elements.get("#show-data-button").dispatch("click");
if (elements.get("#measurement-table-overlay").hidden) {
  throw new Error("Le tableau des mesures ne s'est pas affiché.");
}
if (!elements.get("#measurement-table-body").innerHTML.includes("<td>1</td>")) {
  throw new Error("Le tableau des mesures ne contient pas les données des capteurs.");
}
elements.get("#measurement-table-close-button").dispatch("click");
if (!elements.get("#measurement-table-overlay").hidden) {
  throw new Error("Le tableau des mesures ne s'est pas fermé.");
}

elements.get("#mode-home-button").dispatch("click");
if (host.svg || elements.get("#mode-selection").hidden || !elements.get("#simulation-screen").hidden) {
  throw new Error("Le retour au choix du mode n'a pas réinitialisé l'interface.");
}

elements.get("#mode-friction-button").dispatch("click");
if (!host.svg) {
  throw new Error("Le second mode n'a pas été ouvert correctement.");
}
if (host.attributes.get("data-simulation-mode") !== "friction") {
  throw new Error("Le mode avec frottement n'est pas transmis au montage.");
}

elements.get("#language-en-button").dispatch("click");
if (document.documentElement.attributes.get("lang") !== "en") {
  throw new Error("Le changement vers l'anglais n'a pas été appliqué.");
}
if (elements.get("#start-button").attributes.get("aria-label") !== "Start") {
  throw new Error("Les commandes dynamiques n'ont pas été traduites en anglais.");
}

console.log("Smoke test autonome réussi.");
