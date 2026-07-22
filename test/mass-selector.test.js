import test from "node:test";
import assert from "node:assert/strict";

import { createMassSelector, isPointInsideRect } from "../src/mass-selector.js";

class FakeClassList {
  constructor() { this.items = new Set(); }
  add(name) { this.items.add(name); }
  remove(name) { this.items.delete(name); }
  toggle(name, force) {
    const active = force === undefined ? !this.items.has(name) : Boolean(force);
    if (active) this.items.add(name);
    else this.items.delete(name);
    return active;
  }
  contains(name) { return this.items.has(name); }
}

class FakeElement {
  constructor({ massValue, x = 0, y = 0, rect = { left: 0, right: 0, top: 0, bottom: 0 } } = {}) {
    this.dataset = {};
    if (massValue !== undefined) this.dataset.massValue = String(massValue);
    this.dataset.originX = String(x);
    this.dataset.originY = String(y);
    this.attributes = new Map([["transform", `translate(${x} ${y})`]]);
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this.rect = rect;
  }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  dispatch(name, event = {}) {
    const normalized = { target: this, preventDefault() {}, ...event };
    for (const callback of this.listeners.get(name) ?? []) callback(normalized);
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getBoundingClientRect() { return this.rect; }
  setPointerCapture() {}
  releasePointerCapture() {}
}

function createSvg() {
  const target = new FakeElement({ rect: { left: 400, right: 500, top: 100, bottom: 200 } });
  const choices = [
    new FakeElement({ massValue: 0.5, x: 50, y: 450 }),
    new FakeElement({ massValue: 1, x: 150, y: 450 }),
    new FakeElement({ massValue: 2, x: 250, y: 450 }),
  ];
  const svg = new FakeElement({ rect: { left: 0, right: 1200, top: 0, bottom: 620 } });
  svg.viewBox = { baseVal: { width: 1200, height: 620 } };
  svg.querySelector = (selector) => selector === "#layer-hanging-mass" ? target : null;
  svg.querySelectorAll = (selector) => selector === '[data-role="mass-choice"]' ? choices : [];
  return { svg, target, choices };
}

test("isPointInsideRect inclut les bords du rectangle", () => {
  const rect = { left: 10, right: 20, top: 30, bottom: 40 };
  assert.equal(isPointInsideRect({ x: 10, y: 30 }, rect), true);
  assert.equal(isPointInsideRect({ x: 20, y: 40 }, rect), true);
  assert.equal(isPointInsideRect({ x: 9, y: 35 }, rect), false);
});

test("un glisser-déposer sur S2 sélectionne la nouvelle masse", () => {
  const { svg, choices } = createSvg();
  const selections = [];
  createMassSelector(svg, { selectedMass: 0.2, onSelect: (value) => selections.push(value) });

  choices[0].dispatch("pointerdown", { pointerId: 1, button: 0, clientX: 60, clientY: 470 });
  svg.dispatch("pointermove", { pointerId: 1, clientX: 450, clientY: 150 });
  svg.dispatch("pointerup", { pointerId: 1, clientX: 450, clientY: 150 });

  assert.deepEqual(selections, [0.5]);
  assert.equal(choices[0].getAttribute("transform"), "translate(50 450)");
});

test("une masse relâchée hors de S2 revient à sa place", () => {
  const { svg, choices } = createSvg();
  const selections = [];
  createMassSelector(svg, { selectedMass: 0.2, onSelect: (value) => selections.push(value) });

  choices[1].dispatch("pointerdown", { pointerId: 2, button: 0, clientX: 170, clientY: 470 });
  svg.dispatch("pointermove", { pointerId: 2, clientX: 300, clientY: 300 });
  svg.dispatch("pointerup", { pointerId: 2, clientX: 300, clientY: 300 });

  assert.deepEqual(selections, []);
  assert.equal(choices[1].getAttribute("transform"), "translate(150 450)");
});

test("Entrée et Espace permettent une sélection accessible", () => {
  const { svg, choices } = createSvg();
  const selections = [];
  createMassSelector(svg, { selectedMass: 0.2, onSelect: (value) => selections.push(value) });

  choices[1].dispatch("keydown", { key: "Enter" });
  choices[2].dispatch("keydown", { key: " " });

  assert.deepEqual(selections, [1, 2]);
});

test("destroy retire les interactions", () => {
  const { svg, choices } = createSvg();
  const selections = [];
  const selector = createMassSelector(svg, {
    selectedMass: 0.2,
    onSelect: (value) => selections.push(value),
  });

  assert.equal(selector.getChoiceCount(), 3);
  assert.equal(selector.destroy(), true);
  assert.equal(selector.destroy(), false);
  choices[0].dispatch("keydown", { key: "Enter" });
  assert.deepEqual(selections, []);
});
