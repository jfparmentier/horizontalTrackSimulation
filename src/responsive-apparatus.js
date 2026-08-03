export const APPARATUS_VIEWPORTS = Object.freeze({
  desktop: Object.freeze({
    id: "desktop",
    viewBox: "0 0 1200 620",
  }),
  mobilePortrait: Object.freeze({
    id: "mobile-portrait",
    viewBox: "70 60 1130 535",
  }),
  shortLandscape: Object.freeze({
    id: "short-landscape",
    viewBox: "45 55 1155 545",
  }),
});

function normalizeViewportSize(viewport = {}) {
  const width = Number(viewport.width);
  const height = Number(viewport.height);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new TypeError("La largeur et la hauteur de la fenêtre doivent être strictement positives.");
  }
  return Object.freeze({ width, height });
}

/** Sélectionne le cadrage visuel sans modifier la géométrie physique du montage. */
export function selectApparatusViewport(viewport) {
  const { width, height } = normalizeViewportSize(viewport);
  if (height <= 500 && width > height && width <= 1000) {
    return APPARATUS_VIEWPORTS.shortLandscape;
  }
  if (width <= 760 && height >= width) {
    return APPARATUS_VIEWPORTS.mobilePortrait;
  }
  return APPARATUS_VIEWPORTS.desktop;
}

export function applyApparatusViewport(svg, viewport) {
  if (!svg || typeof svg.setAttribute !== "function") {
    throw new TypeError("Un élément SVG modifiable est requis.");
  }
  const normalized = normalizeViewportSize(viewport);
  const selected = selectApparatusViewport(normalized);
  svg.setAttribute("viewBox", selected.viewBox);
  svg.setAttribute("data-responsive-layout", selected.id);
  svg.setAttribute("data-viewport-width", String(Math.round(normalized.width)));
  svg.setAttribute("data-viewport-height", String(Math.round(normalized.height)));
  return selected;
}

/**
 * Met à jour le cadrage du SVG lors des changements de taille ou d'orientation.
 * Les coordonnées du montage restent inchangées ; seule la fenêtre SVG évolue.
 * Les événements de la fenêtre, du visual viewport et de Screen Orientation
 * sont pris en charge pour couvrir les navigateurs mobiles les plus courants.
 */
export function createResponsiveApparatusViewport(svg, options = {}) {
  const windowRef = options.windowRef ?? globalThis.window;
  if (!windowRef || typeof windowRef.addEventListener !== "function") {
    return Object.freeze({
      update: () => applyApparatusViewport(svg, { width: 1200, height: 620 }),
      destroy: () => false,
    });
  }

  let destroyed = false;
  let frameId = null;
  const removeListeners = [];

  function listen(target, eventName, callback) {
    if (!target || typeof target.addEventListener !== "function") return;
    target.addEventListener(eventName, callback);
    removeListeners.push(() => target.removeEventListener?.(eventName, callback));
  }

  function readViewport() {
    const visualViewport = windowRef.visualViewport;
    return Object.freeze({
      width: Number(visualViewport?.width ?? windowRef.innerWidth),
      height: Number(visualViewport?.height ?? windowRef.innerHeight),
    });
  }

  function update() {
    if (destroyed) return null;
    frameId = null;
    return applyApparatusViewport(svg, readViewport());
  }

  function scheduleUpdate() {
    if (destroyed || frameId !== null) return;
    if (typeof windowRef.requestAnimationFrame === "function") {
      frameId = windowRef.requestAnimationFrame(update);
    } else {
      update();
    }
  }

  listen(windowRef, "resize", scheduleUpdate);
  listen(windowRef, "orientationchange", scheduleUpdate);
  listen(windowRef, "pageshow", scheduleUpdate);
  listen(windowRef.visualViewport, "resize", scheduleUpdate);
  listen(windowRef.screen?.orientation, "change", scheduleUpdate);
  update();

  return Object.freeze({
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      removeListeners.splice(0).forEach((remove) => remove());
      if (frameId !== null && typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(frameId);
      }
      frameId = null;
      return true;
    },
  });
}
