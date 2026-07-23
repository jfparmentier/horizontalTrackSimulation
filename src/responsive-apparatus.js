export const APPARATUS_VIEWPORTS = Object.freeze({
  desktop: Object.freeze({
    id: "desktop",
    viewBox: "0 0 1200 620",
  }),
  mobilePortrait: Object.freeze({
    id: "mobile-portrait",
    viewBox: "70 60 1100 535",
  }),
  shortLandscape: Object.freeze({
    id: "short-landscape",
    viewBox: "45 55 1120 545",
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
  const selected = selectApparatusViewport(viewport);
  svg.setAttribute("viewBox", selected.viewBox);
  svg.setAttribute("data-responsive-layout", selected.id);
  return selected;
}

/**
 * Met à jour le cadrage du SVG lors des changements de taille ou d'orientation.
 * Les coordonnées du montage restent inchangées ; seule la fenêtre SVG évolue.
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

  windowRef.addEventListener("resize", scheduleUpdate);
  windowRef.addEventListener("orientationchange", scheduleUpdate);
  windowRef.visualViewport?.addEventListener?.("resize", scheduleUpdate);
  update();

  return Object.freeze({
    update,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      windowRef.removeEventListener?.("resize", scheduleUpdate);
      windowRef.removeEventListener?.("orientationchange", scheduleUpdate);
      windowRef.visualViewport?.removeEventListener?.("resize", scheduleUpdate);
      if (frameId !== null && typeof windowRef.cancelAnimationFrame === "function") {
        windowRef.cancelAnimationFrame(frameId);
      }
      frameId = null;
      return true;
    },
  });
}
