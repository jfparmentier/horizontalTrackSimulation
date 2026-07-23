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
