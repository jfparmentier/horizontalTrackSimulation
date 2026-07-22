const MASS_EPSILON = 1e-9;

function asFiniteNumber(value, name) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    throw new TypeError(`${name} doit être un nombre fini.`);
  }
  return normalized;
}

function sameMass(left, right) {
  return Math.abs(Number(left) - Number(right)) <= MASS_EPSILON;
}

export function isPointInsideRect(point, rect) {
  if (!point || typeof point !== "object") {
    throw new TypeError("Un point est requis.");
  }
  if (!rect || typeof rect !== "object") {
    throw new TypeError("Un rectangle est requis.");
  }

  const x = asFiniteNumber(point.x, "point.x");
  const y = asFiniteNumber(point.y, "point.y");
  const left = asFiniteNumber(rect.left, "rect.left");
  const right = asFiniteNumber(rect.right, "rect.right");
  const top = asFiniteNumber(rect.top, "rect.top");
  const bottom = asFiniteNumber(rect.bottom, "rect.bottom");

  return x >= left && x <= right && y >= top && y <= bottom;
}

function getSvgScale(svg) {
  const clientRect = svg.getBoundingClientRect?.();
  const viewBox = svg.viewBox?.baseVal;

  if (
    clientRect
    && clientRect.width > 0
    && clientRect.height > 0
    && viewBox
    && viewBox.width > 0
    && viewBox.height > 0
  ) {
    return Object.freeze({
      x: viewBox.width / clientRect.width,
      y: viewBox.height / clientRect.height,
    });
  }

  return Object.freeze({ x: 1, y: 1 });
}

function getMassValue(element) {
  return asFiniteNumber(
    element.dataset?.massValue ?? element.getAttribute?.("data-mass-value"),
    "data-mass-value",
  );
}

/**
 * Relie les masses dessinées dans le SVG au paramètre m2. Une masse est
 * déplacée au pointeur vers S2 ; au clavier, Entrée ou Espace effectue le même
 * remplacement. Le changement de paramètre reconstruit ensuite le montage,
 * ce qui remet automatiquement l'ancienne masse sur le support de rangement.
 */
export function createMassSelector(svg, options = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (typeof options.onSelect !== "function") {
    throw new TypeError("onSelect doit être une fonction.");
  }

  const target = svg.querySelector("#layer-hanging-mass");
  if (!target) {
    throw new Error("La masse suspendue est introuvable.");
  }

  const choices = Array.from(
    svg.querySelectorAll?.('[data-role="mass-choice"]') ?? [],
  );
  const listeners = [];
  let active = null;
  let destroyed = false;

  function listen(element, name, callback) {
    element.addEventListener?.(name, callback);
    listeners.push(() => element.removeEventListener?.(name, callback));
  }

  function setDropState(overTarget) {
    svg.setAttribute?.("data-mass-dragging", active ? "true" : "false");
    target.classList?.toggle("mass-drop-target--active", Boolean(active && overTarget));
  }

  function restoreActive() {
    if (!active) return;
    active.element.setAttribute?.("transform", active.originTransform);
    active.element.classList?.remove("mass-choice--dragging");
    active.element.releasePointerCapture?.(active.pointerId);
    active = null;
    setDropState(false);
  }

  function isOverTarget(event) {
    if (!target.getBoundingClientRect) return false;
    return isPointInsideRect(
      { x: Number(event.clientX), y: Number(event.clientY) },
      target.getBoundingClientRect(),
    );
  }

  function beginDrag(element, event) {
    if (destroyed || active) return;
    if (event.button !== undefined && event.button !== 0) return;

    const value = getMassValue(element);
    if (sameMass(value, options.selectedMass)) return;

    active = {
      element,
      value,
      pointerId: event.pointerId,
      startClientX: Number(event.clientX) || 0,
      startClientY: Number(event.clientY) || 0,
      originX: asFiniteNumber(element.dataset?.originX ?? 0, "data-origin-x"),
      originY: asFiniteNumber(element.dataset?.originY ?? 0, "data-origin-y"),
      originTransform: element.getAttribute?.("transform")
        ?? `translate(${element.dataset?.originX ?? 0} ${element.dataset?.originY ?? 0})`,
    };

    element.classList?.add("mass-choice--dragging");
    element.setPointerCapture?.(event.pointerId);
    setDropState(isOverTarget(event));
    event.preventDefault?.();
  }

  function moveDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    const scale = getSvgScale(svg);
    const dx = ((Number(event.clientX) || 0) - active.startClientX) * scale.x;
    const dy = ((Number(event.clientY) || 0) - active.startClientY) * scale.y;

    active.element.setAttribute?.(
      "transform",
      `translate(${active.originX + dx} ${active.originY + dy})`,
    );
    setDropState(isOverTarget(event));
    event.preventDefault?.();
  }

  function endDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    const selectedValue = active.value;
    const accepted = isOverTarget(event);
    restoreActive();

    if (accepted && !sameMass(selectedValue, options.selectedMass)) {
      options.onSelect(selectedValue);
    }
    event.preventDefault?.();
  }

  function cancelDrag(event) {
    if (!active || (event.pointerId !== undefined && event.pointerId !== active.pointerId)) return;
    restoreActive();
    event.preventDefault?.();
  }

  function selectByKeyboard(element, event) {
    if (!event || !["Enter", " "].includes(event.key)) return;
    const value = getMassValue(element);
    if (!sameMass(value, options.selectedMass)) {
      options.onSelect(value);
    }
    event.preventDefault?.();
  }

  for (const choice of choices) {
    listen(choice, "pointerdown", (event) => beginDrag(choice, event));
    listen(choice, "keydown", (event) => selectByKeyboard(choice, event));
  }
  listen(svg, "pointermove", moveDrag);
  listen(svg, "pointerup", endDrag);
  listen(svg, "pointercancel", cancelDrag);

  setDropState(false);

  return Object.freeze({
    getChoiceCount: () => choices.length,
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      restoreActive();
      listeners.splice(0).forEach((remove) => remove());
      return true;
    },
  });
}
