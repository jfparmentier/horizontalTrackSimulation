function getRequiredElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Élément de langue introuvable : ${selector}`);
  return element;
}

function applyTextTranslations(root, i18n) {
  for (const element of root.querySelectorAll?.("[data-i18n]") ?? []) {
    element.textContent = i18n.t(element.getAttribute("data-i18n"));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-aria-label]") ?? []) {
    element.setAttribute("aria-label", i18n.t(element.getAttribute("data-i18n-aria-label")));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-title]") ?? []) {
    element.setAttribute("title", i18n.t(element.getAttribute("data-i18n-title")));
  }
  for (const element of root.querySelectorAll?.("[data-i18n-content]") ?? []) {
    element.setAttribute("content", i18n.t(element.getAttribute("data-i18n-content")));
  }
}

export function applyInterfaceLanguage(root, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!i18n || typeof i18n.t !== "function" || typeof i18n.getLocale !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  applyTextTranslations(root, i18n);
  const documentElement = root.documentElement ?? root.ownerDocument?.documentElement;
  documentElement?.setAttribute?.("lang", i18n.getLocale());
  if (typeof root.title === "string") root.title = i18n.t("meta.title");
  return i18n.getLocale();
}

export function bindLanguageSelector(root, i18n) {
  if (!root || typeof root.querySelector !== "function") {
    throw new TypeError("Une racine DOM interrogeable est requise.");
  }
  if (!i18n || typeof i18n.setLocale !== "function" || typeof i18n.subscribe !== "function") {
    throw new TypeError("Un gestionnaire de langue valide est requis.");
  }

  const frenchButton = getRequiredElement(root, "#language-fr-button");
  const englishButton = getRequiredElement(root, "#language-en-button");
  const listeners = [];

  function listen(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    listeners.push(() => element.removeEventListener?.(eventName, callback));
  }

  function refresh() {
    applyInterfaceLanguage(root, i18n);
    const locale = i18n.getLocale();
    for (const [button, code] of [[frenchButton, "fr"], [englishButton, "en"]]) {
      const active = locale === code;
      button.classList?.toggle("language-button--active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("lang", code);
    }
    return locale;
  }

  listen(frenchButton, "click", () => i18n.setLocale("fr"));
  listen(englishButton, "click", () => i18n.setLocale("en"));
  const unsubscribe = i18n.subscribe(refresh, { emitCurrent: true });

  return Object.freeze({
    refresh,
    destroy() {
      unsubscribe();
      listeners.splice(0).forEach((remove) => remove());
    },
  });
}
