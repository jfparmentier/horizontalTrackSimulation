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

function approximateSlackCurveLength(horizontalSpan, sag, segments = 48) {
  let length = 0;
  let previousX = 0;
  let previousY = 0;

  for (let index = 1; index <= segments; index += 1) {
    const t = index / segments;
    const oneMinusT = 1 - t;
    const x = 3 * oneMinusT ** 2 * t * horizontalSpan * 0.34
      + 3 * oneMinusT * t ** 2 * horizontalSpan * 0.7
      + t ** 3 * horizontalSpan;
    const y = 3 * oneMinusT * t * sag;
    length += Math.hypot(x - previousX, y - previousY);
    previousX = x;
    previousY = y;
  }

  return length;
}

function solveSlackSag(horizontalSpan, targetLength) {
  if (targetLength <= horizontalSpan + 1e-6) return 0;

  let lowerSag = 0;
  let upperSag = Math.max(16, targetLength / 2);
  while (approximateSlackCurveLength(horizontalSpan, upperSag) < targetLength) {
    upperSag *= 2;
  }

  for (let iteration = 0; iteration < 32; iteration += 1) {
    const candidate = (lowerSag + upperSag) / 2;
    if (approximateSlackCurveLength(horizontalSpan, candidate) < targetLength) {
      lowerSag = candidate;
    } else {
      upperSag = candidate;
    }
  }

  return (lowerSag + upperSag) / 2;
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
    layout.motionScale?.maximumMobilePosition ?? layout.parameters.trackLength,
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
    ?? layout.track.width / layout.parameters.trackLength;
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
  const slack = currentState.phase === 2 || afterDropDistance > 0;

  let ropePath;
  let slackCurveLength = null;
  if (slack) {
    const horizontalSpan = Math.max(1, ropeEntryX - ropeStartX);
    // S2 étant immobile, la portion verticale et l'arc sur la poulie gardent
    // une longueur fixe. La courbe détendue conserve donc la longueur qu'avait
    // la portion horizontale au moment où S2 a atteint son support : plus S1
    // approche de la poulie, plus la flèche augmente au lieu d'étirer le fil.
    const transitionRopeStartX = layout.mobile.x + layout.mobile.width
      + layout.parameters.dropHeight * pixelsPerMeter;
    const targetSlackLength = Math.max(1, ropeEntryX - transitionRopeStartX);
    const sag = solveSlackSag(horizontalSpan, targetSlackLength);
    const firstControlX = ropeStartX + horizontalSpan * 0.34;
    const secondControlX = ropeStartX + horizontalSpan * 0.7;
    slackCurveLength = approximateSlackCurveLength(horizontalSpan, sag);

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
    slackCurveLength,
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
