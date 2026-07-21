# Étape 1 — Fonctions physiques et tests

Cette archive contient le moteur physique pur de la simulation du glissement d'un mobile `S1` sur un banc horizontal, relié à une masse suspendue `S2`.

## Hypothèses intégrées

- `x0 = 0 m` ;
- `v0 = 0 m·s⁻¹` ;
- `m1` comprise entre `0,1 kg` et `2,0 kg` ;
- `m2` comprise entre `0,01 kg` et `2,0 kg` ;
- hauteur de chute comprise entre `0,20 m` et `1,00 m` ;
- longueur du banc comprise entre `1,00 m` et `3,00 m` ;
- coefficient de frottement compris entre `0` et `0,20` ;
- gravité terrestre (`9,81 m·s⁻²`) ou lunaire (`1,62 m·s⁻²`) ;
- fil et poulie idéaux ;
- frottement de Coulomb appliqué à `S1` ;
- arrêt immédiat de `S1` lorsqu'il atteint la fin du banc.

## Modèle utilisé

### Phase 1 — `S2` descend

La force motrice est `m2 × g` et le frottement sur `S1` vaut `µ × m1 × g`.

```text
a1 = max(0, (m2 g - µ m1 g) / (m1 + m2))
```

Lorsque la force motrice ne dépasse pas le frottement, le système est déclaré bloqué.

### Phase 2 — `S2` repose sur le socle

```text
a2 = -µg
```

Sans frottement, `a2 = 0` et la vitesse de `S1` reste constante. Avec frottement, le moteur calcule l'instant exact où la vitesse devient nulle.

## Contenu

```text
physics-step1/
├── package.json
├── README.md
├── test-report.txt
├── src/
│   ├── constants.js
│   └── physics.js
└── test/
    └── physics.test.js
```

## Exécution des tests

Pré-requis : Node.js 18 ou plus récent.

```bash
npm test
```

Le projet ne possède aucune dépendance externe. Les tests utilisent le module natif `node:test`.

## Fonctions exposées

- `getGravity(gravityMode)` ;
- `validateParameters(parameters)` ;
- `computePhase1Acceleration(parameters)` ;
- `computePhase2Acceleration(parameters, velocity)` ;
- `computePhase1EndVelocity(parameters)` ;
- `timeToReachPosition(...)` ;
- `timeToStop(velocity, acceleration)` ;
- `integrateConstantAcceleration(...)` ;
- `createInitialState(parameters)` ;
- `advanceSimulation(state, parameters, dt)`.

`advanceSimulation` est une fonction pure. Elle traite exactement, même au milieu d'un pas de temps :

- la transition entre les deux phases ;
- l'arrêt par frottement ;
- l'arrivée à l'extrémité du banc.
