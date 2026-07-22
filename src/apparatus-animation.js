const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function assertFiniteState(state, name) {
  if (state === null || typeof state !== "object") {
    throw new TypeError(`${name} doit être un objet d'état.`);
  }

  for (const field of ["position", "hangingDisplacement"]) {
    if (!Number.isFinite(state[field])) {
      throw new TypeError(`${name}.${field} doit être un nombre fini.`);
    }
  }
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Calcule la géométrie affichée entre deux états physiques consécutifs.
 * Cette fonction pure permet de tester l'animation sans navigateur.
 */
export function computeAnimatedApparatusFrame(
  layout,
  currentState,
  previousState = currentState,
  interpolationAlpha = 1,
) {
  if (layout === null || typeof layout !== "object") {
    throw new TypeError("Un layout de montage est requis.");
  }

  assertFiniteState(currentState, "currentState");
  assertFiniteState(previousState, "previousState");

  if (!Number.isFinite(interpolationAlpha)) {
    throw new TypeError("interpolationAlpha doit être un nombre fini.");
  }

  const alpha = clamp(interpolationAlpha, 0, 1);
  const position = clamp(
    interpolate(previousState.position, currentState.position, alpha),
    0,
    layout.parameters.trackLength,
  );
  const hangingDisplacement = clamp(
    interpolate(
      previousState.hangingDisplacement,
      currentState.hangingDisplacement,
      alpha,
    ),
    0,
    layout.parameters.dropHeight,
  );

  // Les deux solides utilisent la même échelle graphique : un déplacement
  // physique identique produit le même déplacement en pixels à l'écran.
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? (layout.track.width - layout.mobile.width) / layout.parameters.trackLength;
  const mobileX = layout.mobile.x + position * pixelsPerMeter;
  const mobileY = layout.mobile.y;

  // En phase 1, S2 descend exactement du même nombre de pixels que S1 avance.
  // Le support a été placé à h × pixelsPerMeter sous la position initiale.
  const hangingMassY = layout.hangingMass.y
    + hangingDisplacement * pixelsPerMeter;

  const ropeStartX = mobileX + layout.mobile.width;
  const ropeY = layout.string.startY;
  const ropeEntryX = layout.string.pulleyEntryX;
  const ropeEntryY = layout.string.pulleyEntryY;
  const ropeExitX = layout.string.pulleyExitX;
  const ropeExitY = layout.string.pulleyExitY;
  const ropeEndY = hangingMassY;
  const afterDropDistance = Math.max(0, position - layout.parameters.dropHeight);
  const afterDropRatio = layout.parameters.trackLength > layout.parameters.dropHeight
    ? clamp(
        afterDropDistance
          / (layout.parameters.trackLength - layout.parameters.dropHeight),
        0,
        1,
      )
    : 0;
  const slack = currentState.phase === 2 || afterDropDistance > 0;

  let ropePath;
  if (slack) {
    const horizontalSpan = Math.max(1, ropeEntryX - ropeStartX);
    const sag = 10 + 34 * afterDropRatio;
    const firstControlX = ropeStartX + horizontalSpan * 0.34;
    const secondControlX = ropeStartX + horizontalSpan * 0.7;

    ropePath = `M ${ropeStartX} ${ropeY}
      C ${firstControlX} ${ropeY + sag}, ${secondControlX} ${ropeY + sag}, ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  } else {
    ropePath = `M ${ropeStartX} ${ropeY}
      L ${ropeEntryX} ${ropeEntryY}
      A ${layout.pulley.radius} ${layout.pulley.radius} 0 0 1 ${ropeExitX} ${ropeExitY}
      L ${ropeExitX} ${ropeEndY}`;
  }

  return Object.freeze({
    position,
    hangingDisplacement,
    mobileX,
    mobileY,
    hangingMassX: layout.hangingMass.x,
    hangingMassY,
    ropePath,
    slack,
  });
}

function requireSvgElement(svg, selector) {
  const element = svg.querySelector(selector);
  if (!element) {
    throw new Error(`Élément SVG introuvable : ${selector}`);
  }
  return element;
}

/**
 * Relie un SVG déjà monté au moteur temporel. Le rendu ne modifie que les
 * transformations de S1 et S2 ainsi que le tracé du fil.
 */
export function createApparatusAnimator(svg, layout) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }

  const mobileLayer = requireSvgElement(svg, "#layer-mobile");
  const hangingMassLayer = requireSvgElement(svg, "#layer-hanging-mass");
  const stringPath = requireSvgElement(svg, "#string-path");
  const description = svg.querySelector("#apparatus-description");

  function render(currentState, previousState = currentState, meta = {}) {
    const terminal = ["blocked", "finished"].includes(currentState.status);
    const snapToCurrent = terminal || Boolean(meta.reason) || meta.running === false;
    const interpolationAlpha = snapToCurrent ? 1 : (meta.interpolationAlpha ?? 1);
    const frame = computeAnimatedApparatusFrame(
      layout,
      currentState,
      previousState,
      interpolationAlpha,
    );

    mobileLayer.setAttribute(
      "transform",
      `translate(${frame.mobileX} ${frame.mobileY})`,
    );
    hangingMassLayer.setAttribute(
      "transform",
      `translate(${frame.hangingMassX} ${frame.hangingMassY})`,
    );
    stringPath.setAttribute("d", frame.ropePath);
    stringPath.setAttribute("data-tension", frame.slack ? "slack" : "taut");
    svg.setAttribute("data-phase", String(currentState.phase));
    svg.setAttribute("data-status", String(currentState.status));

    if (description) {
      const ropeState = frame.slack ? "fil détendu" : "fil tendu";
      description.textContent = `S1 à ${frame.position.toFixed(3)} m, S2 descendue de ${frame.hangingDisplacement.toFixed(3)} m, ${ropeState}.`;
    }

    return frame;
  }

  return Object.freeze({ render });
}
