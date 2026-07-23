import test from "node:test";
import assert from "node:assert/strict";

import { createI18n } from "../src/i18n.js";
import { bindLanguageSelector } from "../src/language-selector.js";

class FakeElement {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.textContent = "";
    this.listeners = new Map();
    this.classes = new Set();
    this.classList = {
      toggle: (name, force) => {
        if (force) this.classes.add(name);
        else this.classes.delete(name);
      },
    };
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  removeEventListener(name) { this.listeners.delete(name); }
  click() { this.listeners.get("click")?.({ target: this }); }
}

test("le sélecteur démarre en français puis traduit l'interface en anglais", () => {
  const fr = new FakeElement();
  const en = new FakeElement();
  const title = new FakeElement({ "data-i18n": "mode.title" });
  const home = new FakeElement({ "data-i18n-aria-label": "home", "data-i18n-title": "home" });
  const html = new FakeElement();
  const elements = new Map([
    ["#language-fr-button", fr],
    ["#language-en-button", en],
  ]);
  const root = {
    title: "",
    documentElement: html,
    querySelector(selector) { return elements.get(selector) ?? null; },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") return [title];
      if (selector === "[data-i18n-aria-label]") return [home];
      if (selector === "[data-i18n-title]") return [home];
      return [];
    },
  };
  const i18n = createI18n();
  const binding = bindLanguageSelector(root, i18n);

  assert.equal(html.getAttribute("lang"), "fr");
  assert.equal(title.textContent, "Choisir un mode d’exploration");
  assert.equal(fr.getAttribute("aria-pressed"), "true");

  en.click();
  assert.equal(html.getAttribute("lang"), "en");
  assert.equal(title.textContent, "Choose an exploration mode");
  assert.equal(home.getAttribute("aria-label"), "Return to mode selection");
  assert.equal(en.getAttribute("aria-pressed"), "true");
  assert.equal(root.title, "Horizontal track simulation");

  binding.destroy();
});
