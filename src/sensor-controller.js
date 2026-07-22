const SENSOR_EPSILON = 1e-10;

function assertFinitePosition(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} doit être un nombre fini.`);
  }
}

function normalizeTriggeredIds(triggeredIds) {
  if (triggeredIds === undefined) return new Set();
  if (!triggeredIds || typeof triggeredIds[Symbol.iterator] !== "function") {
    throw new TypeError("triggeredIds doit être itérable.");
  }
  return new Set(triggeredIds);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(left, right, alpha) {
  return left + (right - left) * alpha;
}

/**
 * Détermine les capteurs franchis lors d'un déplacement monotone.
 * Les positions fournies doivent être exprimées dans le même repère que les
 * positions des capteurs. Les capteurs déjà déclenchés sont ignorés.
 */
export function detectSensorCrossings(
  sensors,
  previousPosition,
  currentPosition,
  triggeredIds = [],
) {
  if (!Array.isArray(sensors)) {
    throw new TypeError("sensors doit être un tableau.");
  }
  assertFinitePosition("previousPosition", previousPosition);
  assertFinitePosition("currentPosition", currentPosition);

  if (currentPosition + SENSOR_EPSILON < previousPosition) {
    return Object.freeze([]);
  }

  const triggered = normalizeTriggeredIds(triggeredIds);
  const crossings = sensors
    .filter((sensor) => {
      if (!sensor || !Number.isInteger(sensor.id) || !Number.isFinite(sensor.position)) {
        throw new TypeError("Chaque capteur doit posséder un identifiant entier et une position finie.");
      }
      return !triggered.has(sensor.id)
        && sensor.position > previousPosition + SENSOR_EPSILON
        && sensor.position <= currentPosition + SENSOR_EPSILON;
    })
    .sort((left, right) => left.position - right.position)
    .map((sensor) => Object.freeze({ id: sensor.id, position: sensor.position }));

  return Object.freeze(crossings);
}

function requireSensorElement(svg, sensorId) {
  const element = svg.querySelector(`#sensor-${sensorId}`);
  if (!element) {
    throw new Error(`Élément SVG du capteur ${sensorId} introuvable.`);
  }
  return element;
}

function setSensorVisualState(element, sensor, state) {
  element.setAttribute("data-sensor-state", state);
  const suffix = state === "idle"
    ? "non déclenché"
    : state === "active"
      ? "vient d’être déclenché"
      : "déjà déclenché";
  element.setAttribute(
    "aria-label",
    `Capteur ${sensor.id}, position ${sensor.position.toFixed(3)} mètre, ${suffix}`,
  );
}

/**
 * Retourne la position SVG du bord gauche de S1 pour une position physique du
 * moteur. Le calcul est identique à celui utilisé par l'animation du mobile.
 */
function mobileLeftEdgeX(layout, simulationPosition) {
  const normalizedPosition = clamp(
    simulationPosition,
    0,
    layout.parameters.trackLength,
  );
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? (layout.track.width - layout.mobile.width) / layout.parameters.trackLength;
  return layout.mobile.x + normalizedPosition * pixelsPerMeter;
}

/** Retourne la position du moteur lorsque le bord gauche atteint une abscisse SVG. */
function simulationPositionForLeftEdgeX(layout, leftEdgeX) {
  const pixelsPerMeter = layout.motionScale?.pixelsPerMeter
    ?? (layout.track.width - layout.mobile.width) / layout.parameters.trackLength;
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    throw new RangeError("L’échelle graphique du mobile doit être strictement positive.");
  }
  return clamp(
    (leftEdgeX - layout.mobile.x) / pixelsPerMeter,
    0,
    layout.parameters.trackLength,
  );
}

/** Calcule la position effectivement affichée pendant l'interpolation visuelle. */
function displayedSimulationPosition(currentState, previousState, meta) {
  const terminal = ["blocked", "finished"].includes(currentState.status);
  const snapToCurrent = terminal || Boolean(meta?.reason) || meta?.running === false;
  const alpha = snapToCurrent ? 1 : clamp(meta?.interpolationAlpha ?? 1, 0, 1);
  return interpolate(previousState.position, currentState.position, alpha);
}

/**
 * Relie les capteurs SVG au déplacement de S1. Le déclenchement se produit au
 * moment où le bord gauche visible du mobile traverse le faisceau du capteur.
 * Un capteur devient brièvement actif, puis reste marqué comme déclenché
 * jusqu'à la réinitialisation de l'expérience.
 */
export function createSensorController(svg, layout, options = {}) {
  if (!svg || typeof svg.querySelector !== "function") {
    throw new TypeError("Un élément SVG interrogeable est requis.");
  }
  if (!layout || !Array.isArray(layout.sensors)) {
    throw new TypeError("Un layout contenant les capteurs est requis.");
  }
  if (options === null || typeof options !== "object") {
    throw new TypeError("Les options des capteurs doivent être un objet.");
  }

  const onCrossings = options.onCrossings ?? (() => {});
  if (typeof onCrossings !== "function") {
    throw new TypeError("onCrossings doit être une fonction.");
  }

  const elements = new Map(
    layout.sensors.map((sensor) => [sensor.id, requireSensorElement(svg, sensor.id)]),
  );
  const sensorsInSvgCoordinates = layout.sensors.map((sensor) => Object.freeze({
    id: sensor.id,
    position: sensor.x,
  }));
  const sensorsById = new Map(layout.sensors.map((sensor) => [sensor.id, sensor]));
  const triggeredIds = new Set();
  let activeIds = new Set();
  let lastPosition = null;
  let lastLeftEdgeX = null;
  let destroyed = false;

  function assertUsable() {
    if (destroyed) throw new Error("Ce contrôleur de capteurs a été détruit.");
  }

  function applyIdleState() {
    for (const sensor of layout.sensors) {
      setSensorVisualState(elements.get(sensor.id), sensor, "idle");
    }
  }

  function reset(position = 0) {
    assertUsable();
    assertFinitePosition("position", position);
    triggeredIds.clear();
    activeIds = new Set();
    lastPosition = position;
    lastLeftEdgeX = mobileLeftEdgeX(layout, position);
    applyIdleState();
    return getSnapshot();
  }

  function getSnapshot(crossings = []) {
    return Object.freeze({
      crossings: Object.freeze([...crossings]),
      triggeredIds: Object.freeze([...triggeredIds].sort((a, b) => a - b)),
      activeIds: Object.freeze([...activeIds].sort((a, b) => a - b)),
      triggeredCount: triggeredIds.size,
      totalCount: layout.sensors.length,
      lastPosition,
      lastLeftEdgeX,
    });
  }

  function render(currentState, previousState = currentState, meta = {}) {
    assertUsable();
    if (!currentState || !Number.isFinite(currentState.position)) {
      throw new TypeError("currentState.position doit être un nombre fini.");
    }
    if (!previousState || !Number.isFinite(previousState.position)) {
      throw new TypeError("previousState.position doit être un nombre fini.");
    }

    const displayedPosition = displayedSimulationPosition(
      currentState,
      previousState,
      meta,
    );
    const currentLeftEdgeX = mobileLeftEdgeX(layout, displayedPosition);
    const reason = meta?.reason;
    const resetRequested = ["initialization", "reset", "replace-state"].includes(reason)
      || lastLeftEdgeX === null
      || currentLeftEdgeX + SENSOR_EPSILON < lastLeftEdgeX;

    if (resetRequested) {
      return reset(displayedPosition);
    }

    for (const sensorId of activeIds) {
      const sensor = sensorsById.get(sensorId);
      setSensorVisualState(elements.get(sensorId), sensor, "triggered");
    }
    activeIds = new Set();

    const svgCrossings = detectSensorCrossings(
      sensorsInSvgCoordinates,
      lastLeftEdgeX,
      currentLeftEdgeX,
      triggeredIds,
    );
    const crossings = svgCrossings.map((crossing) => {
      const sensor = sensorsById.get(crossing.id);
      return Object.freeze({
        id: sensor.id,
        position: sensor.position,
        beamX: sensor.x,
        triggerPosition: simulationPositionForLeftEdgeX(layout, sensor.x),
      });
    });

    for (const crossing of crossings) {
      triggeredIds.add(crossing.id);
      activeIds.add(crossing.id);
      const sensor = sensorsById.get(crossing.id);
      setSensorVisualState(elements.get(crossing.id), sensor, "active");
    }

    lastPosition = displayedPosition;
    lastLeftEdgeX = currentLeftEdgeX;

    if (crossings.length > 0) {
      onCrossings(Object.freeze(crossings), currentState, previousState, meta);
    }

    return getSnapshot(crossings);
  }

  applyIdleState();

  return Object.freeze({
    render,
    reset,
    getSnapshot: () => getSnapshot(),
    destroy() {
      if (destroyed) return false;
      destroyed = true;
      triggeredIds.clear();
      activeIds.clear();
      return true;
    },
  });
}
