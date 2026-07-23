import test from "node:test";
import assert from "node:assert/strict";

import {
  APPARATUS_VIEWPORTS,
  applyApparatusViewport,
  selectApparatusViewport,
} from "../src/responsive-apparatus.js";

test("le cadrage de bureau conserve le viewBox historique", () => {
  assert.equal(selectApparatusViewport({ width: 1440, height: 900 }), APPARATUS_VIEWPORTS.desktop);
  assert.equal(APPARATUS_VIEWPORTS.desktop.viewBox, "0 0 1200 620");
});

test("un téléphone en portrait reçoit un cadrage resserré", () => {
  assert.equal(
    selectApparatusViewport({ width: 390, height: 844 }),
    APPARATUS_VIEWPORTS.mobilePortrait,
  );
});

test("un téléphone court en paysage reçoit le cadrage paysage", () => {
  assert.equal(
    selectApparatusViewport({ width: 844, height: 390 }),
    APPARATUS_VIEWPORTS.shortLandscape,
  );
});

test("applyApparatusViewport renseigne le viewBox et le type de disposition", () => {
  const attributes = new Map();
  const svg = { setAttribute(name, value) { attributes.set(name, String(value)); } };
  const selected = applyApparatusViewport(svg, { width: 375, height: 667 });

  assert.equal(selected.id, "mobile-portrait");
  assert.equal(attributes.get("viewBox"), APPARATUS_VIEWPORTS.mobilePortrait.viewBox);
  assert.equal(attributes.get("data-responsive-layout"), "mobile-portrait");
});

test("le cadrage mémorise les dimensions de viewport utilisées", () => {
  const attributes = new Map();
  const svg = { setAttribute(name, value) { attributes.set(name, String(value)); } };
  applyApparatusViewport(svg, { width: 844.4, height: 390.2 });

  assert.equal(attributes.get("data-viewport-width"), "844");
  assert.equal(attributes.get("data-viewport-height"), "390");
});

test("les changements d'orientation, de visual viewport et de page déclenchent un recadrage", async () => {
  const { createResponsiveApparatusViewport } = await import("../src/responsive-apparatus.js");

  class FakeEventTarget {
    constructor() { this.listeners = new Map(); }
    addEventListener(name, callback) {
      const callbacks = this.listeners.get(name) ?? new Set();
      callbacks.add(callback);
      this.listeners.set(name, callbacks);
    }
    removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
    dispatch(name) { for (const callback of this.listeners.get(name) ?? []) callback(); }
  }

  const visualViewport = new FakeEventTarget();
  visualViewport.width = 390;
  visualViewport.height = 844;
  const orientation = new FakeEventTarget();
  const windowRef = new FakeEventTarget();
  windowRef.innerWidth = 390;
  windowRef.innerHeight = 844;
  windowRef.visualViewport = visualViewport;
  windowRef.screen = { orientation };
  windowRef.requestAnimationFrame = (callback) => {
    queueMicrotask(callback);
    return 1;
  };
  windowRef.cancelAnimationFrame = () => {};
  const attributes = new Map();
  const svg = { setAttribute(name, value) { attributes.set(name, String(value)); } };

  const binding = createResponsiveApparatusViewport(svg, { windowRef });
  assert.equal(attributes.get("data-responsive-layout"), "mobile-portrait");

  visualViewport.width = 844;
  visualViewport.height = 390;
  orientation.dispatch("change");
  await Promise.resolve();
  assert.equal(attributes.get("data-responsive-layout"), "short-landscape");

  visualViewport.width = 1440;
  visualViewport.height = 900;
  windowRef.dispatch("pageshow");
  await Promise.resolve();
  assert.equal(attributes.get("data-responsive-layout"), "desktop");

  assert.equal(binding.destroy(), true);
  assert.equal(orientation.listeners.get("change")?.size ?? 0, 0);
  assert.equal(visualViewport.listeners.get("resize")?.size ?? 0, 0);
});
