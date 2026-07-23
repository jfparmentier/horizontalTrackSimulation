import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../src/app-state.js";
import { createI18n } from "../src/i18n.js";
import { bindMobileMassSelector } from "../src/mobile-mass-selector.js";

class FakeClassList {
  constructor() { this.items = new Set(); }
  toggle(name, force) {
    if (force) this.items.add(name);
    else this.items.delete(name);
  }
  contains(name) { return this.items.has(name); }
}

class FakeButton {
  constructor(value) {
    this.dataset = { mobileMassValue: String(value) };
    this.attributes = new Map([["data-mobile-mass-value", String(value)]]);
    this.listeners = new Map();
    this.classList = new FakeClassList();
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener(name, callback) {
    const callbacks = this.listeners.get(name) ?? new Set();
    callbacks.add(callback);
    this.listeners.set(name, callbacks);
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  click() { for (const callback of this.listeners.get("click") ?? []) callback({ target: this }); }
}

function createDom() {
  const buttons = [0.2, 0.5, 1, 2].map((value) => new FakeButton(value));
  const selector = {
    attributes: new Map(),
    querySelectorAll(query) { return query === "[data-mobile-mass-value]" ? buttons : []; },
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
  };
  return {
    buttons,
    selector,
    root: { querySelector(query) { return query === "#mobile-mass-selector" ? selector : null; } },
  };
}

test("la rangée mobile reflète la masse sélectionnée", () => {
  const { root, buttons, selector } = createDom();
  const state = createAppState({ mode: "ideal" });
  const i18n = createI18n("fr");
  const binding = bindMobileMassSelector(root, state, i18n);

  assert.equal(buttons[1].attributes.get("aria-pressed"), "true");
  assert.equal(buttons[1].classList.contains("mobile-mass-button--selected"), true);
  assert.equal(selector.attributes.get("data-selected-mass"), "0.5");
  assert.equal(binding.getButtonCount(), 4);

  binding.destroy();
  state.destroy();
  i18n.destroy();
});

test("un appui sur un bouton mobile met à jour m2", () => {
  const { root, buttons } = createDom();
  const state = createAppState({ mode: "ideal" });
  const i18n = createI18n("en");
  const binding = bindMobileMassSelector(root, state, i18n);

  buttons[3].click();
  assert.equal(state.getSnapshot().parameters.m2, 2);
  assert.equal(buttons[3].attributes.get("aria-pressed"), "true");
  assert.equal(buttons[3].attributes.get("aria-label"), "Select the 2 kilogram mass");

  binding.destroy();
  state.destroy();
  i18n.destroy();
});
