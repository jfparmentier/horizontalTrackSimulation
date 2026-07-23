const MASS_EPSILON = 1e-9;

function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) {
    throw new Error(`Élément de sélection mobile de masse introuvable : ${selector}`);
  }
  return element;
}

function normalizeMass(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new TypeError("La masse sélectionnée doit être un nombre strictement positif.");
  }
  return normalized;
}

function sameMass(left, right) {
  return Math.abs(Number(left) - Number(right)) <= MASS_EPSILON;
}

/**
 * Relie la rangée de boutons tactiles à la masse suspendue. Cette commande est
 * masquée sur grand écran par CSS et complète le glisser-déposer SVG sur les
 * écrans étroits.
 */
export function bindMobileMassSelector(root, appState, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (
    !appState
    || typeof appState.getSnapshot !== "function"
    || typeof appState.updateParameters !== "function"
    || typeof appState.subscribe !== "function"
  ) {
    throw new TypeError("Un état central prenant en charge les paramètres est requis.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.subscribe !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const selector = getRequiredElement(root, "#mobile-mass-selector");
  const buttons = Array.from(
    selector.querySelectorAll?.("[data-mobile-mass-value]") ?? [],
  );
  if (buttons.length === 0) {
    throw new Error("Aucun bouton tactile de masse n'est disponible.");
  }

  const listeners = [];
  let destroyed = false;

  function listen(element, name, callback) {
    element.addEventListener?.(name, callback);
    listeners.push(() => element.removeEventListener?.(name, callback));
  }

  function localizeButton(button) {
    const mass = button.getAttribute?.("data-mobile-mass-value")
      ?? button.dataset?.mobileMassValue;
    const label = i18n.t("mass.select", { mass });
    button.setAttribute?.("aria-label", label);
    button.setAttribute?.("title", label);
  }

  function sync(snapshot = appState.getSnapshot()) {
    const selectedMass = snapshot.parameters.m2;
    for (const button of buttons) {
      const value = normalizeMass(
        button.getAttribute?.("data-mobile-mass-value")
          ?? button.dataset?.mobileMassValue,
      );
      const selected = sameMass(value, selectedMass);
      button.classList?.toggle("mobile-mass-button--selected", selected);
      button.setAttribute?.("aria-pressed", String(selected));
    }
    selector.setAttribute?.("data-selected-mass", String(selectedMass));
    return selectedMass;
  }

  function localize() {
    for (const button of buttons) localizeButton(button);
    return i18n.getLocale?.();
  }

  for (const button of buttons) {
    listen(button, "click", () => {
      if (destroyed) return;
      const value = normalizeMass(
        button.getAttribute?.("data-mobile-mass-value")
          ?? button.dataset?.mobileMassValue,
      );
      if (!sameMass(value, appState.getSnapshot().parameters.m2)) {
        appState.updateParameters({ m2: value });
      }
    });
  }

  const unsubscribeState = appState.subscribe((snapshot, meta) => {
    if (["mode-change", "parameters-change", "experiment-reset", "subscription"].includes(meta.reason)) {
      sync(snapshot);
    }
  }, { emitCurrent: true });
  const unsubscribeLanguage = i18n.subscribe(localize);
  localize();

  return Object.freeze({
    sync,
    localize,
    getButtonCount: () => buttons.length,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      listeners.splice(0).forEach((remove) => remove());
      unsubscribeState();
      unsubscribeLanguage();
      return true;
    },
  });
}
