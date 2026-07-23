import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  createI18n,
  normalizeLocale,
  translate,
} from "../src/i18n.js";

test("le français est la langue par défaut et les deux langues sont déclarées", () => {
  assert.equal(DEFAULT_LOCALE, "fr");
  assert.deepEqual(SUPPORTED_LOCALES, ["fr", "en"]);
  assert.equal(normalizeLocale("fr-FR"), "fr");
  assert.equal(normalizeLocale("en_US"), "en");
  assert.equal(normalizeLocale("de"), "fr");
});

test("les traductions françaises et anglaises sont disponibles", () => {
  assert.equal(translate("fr", "controls.start"), "Démarrer");
  assert.equal(translate("en", "controls.start"), "Start");
  assert.equal(
    translate("en", "controls.step", { duration: "0.05" }),
    "Advance the simulation by 0.05 seconds",
  );
});

test("le gestionnaire de langue notifie uniquement les changements effectifs", () => {
  const i18n = createI18n();
  const events = [];
  i18n.subscribe((locale, meta) => events.push([locale, meta.previousLocale]));

  assert.equal(i18n.getLocale(), "fr");
  assert.equal(i18n.setLocale("fr-FR"), false);
  assert.equal(i18n.setLocale("en"), true);
  assert.equal(i18n.t("readout.time"), "Time");
  assert.deepEqual(events, [["en", "fr"]]);
});
