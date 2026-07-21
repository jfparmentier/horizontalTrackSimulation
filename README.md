# Étape 2 — Gestion exacte des changements de phase

Cette archive prolonge l'étape 1 du moteur physique. Elle isole la détection et le traitement des événements physiques afin qu'un changement de phase soit calculé à son instant exact, même lorsqu'il se produit au milieu d'un grand pas de temps.

## Événements traités

- arrivée de `S2` sur le socle : passage exact de la phase 1 à la phase 2 ;
- arrivée de `S1` à la fin du banc ;
- arrêt de `S1` par frottement en phase 2 ;
- système initialement bloqué lorsque la force motrice est insuffisante.

## Propriétés garanties

- continuité de la position et de la vitesse au changement de phase ;
- mise à jour immédiate de l'accélération de phase 2, y compris si la transition se produit exactement à la fin du pas ;
- traitement du temps restant après une transition ;
- gestion de plusieurs événements dans un seul grand pas ;
- priorité donnée à la fin du banc en cas d'événements simultanés ;
- absence de dépassement de la fin du banc et de vitesse négative ;
- résultats indépendants du fractionnement temporel, à la précision numérique près ;
- fonctions pures et objets de résultat immuables.

## Structure

```text
physics-step2/
├── package.json
├── README.md
├── test-report.txt
├── src/
│   ├── constants.js
│   ├── physics.js
│   ├── transitions.js
│   └── index.js
└── test/
    ├── physics.test.js
    └── transitions.test.js
```

## Interface principale

- `getNextPhysicalEvent(state, parameters)` : détermine le prochain événement et son temps relatif ;
- `advanceWithinCurrentPhase(state, parameters, duration)` : intègre un intervalle sans changer de phase ;
- `advanceToPhysicalEvent(state, parameters, event)` : avance exactement jusqu'à un événement et l'applique ;
- `advanceSimulationWithEvents(state, parameters, dt)` : traite tous les événements rencontrés et retourne `{ state, events }` ;
- `advanceSimulation(state, parameters, dt)` : interface compatible avec l'étape 1, retournant uniquement l'état.

Chaque événement enregistré contient son type, son temps absolu, sa position, sa vitesse, la phase de départ, la phase d'arrivée et l'état final éventuel.

## Exécution des tests

Pré-requis : Node.js 18 ou plus récent.

```bash
npm test
```

Le projet ne possède aucune dépendance externe.
