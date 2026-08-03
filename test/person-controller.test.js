import test from "node:test";
import assert from "node:assert/strict";

import { createI18n } from "../src/i18n.js";
import { createPersonController } from "../src/person-controller.js";

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.textContent = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(name, callback) {
    this.listeners.set(name, callback);
  }

  removeEventListener(name) {
    this.listeners.delete(name);
  }

  dispatch(name, event = {}) {
    return this.listeners.get(name)?.(event);
  }
}

function createFixture() {
  const person = new FakeElement();
  const title = new FakeElement();
  const cue = new FakeElement();
  const svg = new FakeElement();
  const elements = new Map([
    ["#layer-person", person],
    ["#person-title", title],
    ["#person-click-cue-label", cue],
  ]);
  svg.querySelector = (selector) => elements.get(selector) ?? null;
  return { svg, person, title, cue };
}

const READY = Object.freeze({
  time: 0,
  position: 0,
  velocity: 0,
  status: "ready",
});

test("un clic sur le personnage démarre la simulation et baisse son bras", () => {
  const fixture = createFixture();
  const i18n = createI18n("fr");
  let activations = 0;
  const controller = createPersonController(fixture.svg, {
    i18n,
    initialState: READY,
    onActivate() {
      activations += 1;
      return true;
    },
    onReset: () => true,
  });

  fixture.person.dispatch("click", { preventDefault() {} });

  assert.equal(activations, 1);
  assert.equal(fixture.svg.getAttribute("data-person-state"), "released");
  assert.equal(fixture.person.getAttribute("aria-disabled"), "true");
  controller.destroy();
  i18n.destroy();
});

test("Entrée active le personnage, tandis qu'un clic terminal réinitialise", () => {
  const fixture = createFixture();
  const i18n = createI18n("fr");
  let activations = 0;
  let resets = 0;
  const controller = createPersonController(fixture.svg, {
    i18n,
    initialState: READY,
    onActivate() {
      activations += 1;
      return true;
    },
    onReset() {
      resets += 1;
      return true;
    },
  });

  fixture.person.dispatch("keydown", { key: "Enter", preventDefault() {} });
  assert.equal(activations, 1);

  controller.update({ ...READY, status: "finished" }, { running: false });
  assert.equal(fixture.cue.textContent, "Réinitialiser");
  assert.equal(fixture.person.getAttribute("aria-disabled"), "false");
  fixture.person.dispatch("click", { preventDefault() {} });
  assert.equal(activations, 1);
  assert.equal(resets, 1);
  assert.equal(fixture.svg.getAttribute("data-person-state"), "holding");
  assert.equal(fixture.person.getAttribute("aria-disabled"), "false");
  controller.destroy();
  i18n.destroy();
});

test("une réinitialisation relève le bras et la langue actualise l'indication", () => {
  const fixture = createFixture();
  const i18n = createI18n("fr");
  const controller = createPersonController(fixture.svg, {
    i18n,
    initialState: { ...READY, time: 0.2, position: 0.1, status: "paused" },
    onActivate: () => true,
    onReset: () => true,
  });

  assert.equal(fixture.svg.getAttribute("data-person-state"), "released");
  assert.equal(fixture.cue.textContent, "Reprendre");

  controller.update(READY, { running: false });
  assert.equal(fixture.svg.getAttribute("data-person-state"), "holding");
  assert.equal(fixture.cue.textContent, "Démarrer");

  i18n.setLocale("en");
  assert.equal(fixture.cue.textContent, "Start");
  assert.match(fixture.person.getAttribute("aria-label"), /Click the person/);
  controller.destroy();
  i18n.destroy();
});
