# Étape 3 — Boucle temporelle à pas physique fixe

Cette archive prolonge les étapes 1 et 2. Elle ajoute une boucle temporelle indépendante de la fréquence d'affichage, conçue pour être raccordée ultérieurement au rendu SVG de la simulation.

## Principes retenus

- calcul physique avec un pas fixe de `0,002 s` par défaut ;
- affichage piloté par `requestAnimationFrame` ;
- accumulation du temps mural entre deux images ;
- conservation du reliquat inférieur à un pas physique ;
- vitesse de lecture réglable de `0,1×` à `8×` ;
- limitation des longues interruptions d'affichage à `0,25 s` par image ;
- garde contre la « spirale de la mort » avec un nombre maximal de sous-pas ;
- arrêt automatique de la boucle lorsque le mobile atteint la fin du banc, s'arrête par frottement ou reste bloqué ;
- commandes `start`, `pause`, `step`, `reset`, `replaceState` et `destroy` ;
- pas à pas de `0,05 s` par défaut, avec consommation exacte d'un éventuel dernier sous-pas ;
- remontée groupée des événements physiques produits durant une image ;
- callbacks de rendu contenant l'état courant, l'état précédent et des métadonnées temporelles ;
- aucune dépendance externe.

## Structure

```text
physics-step3/
├── package.json
├── README.md
├── test-report.txt
├── src/
│   ├── constants.js
│   ├── physics.js
│   ├── transitions.js
│   ├── time-loop.js
│   └── index.js
└── test/
    ├── physics.test.js
    ├── transitions.test.js
    └── time-loop.test.js
```

## Interface principale

```javascript
const loop = createTimeLoop({
  parameters,
  onRender(state, previousState, meta) {
    // Le futur SVG sera actualisé ici.
  },
  onEvents(events, state) {
    // Les futurs capteurs et journaux seront actualisés ici.
  }
});

loop.start();
loop.pause();
loop.step();       // 0,05 s par défaut
loop.reset();
```

Dans un navigateur, `requestAnimationFrame` et `cancelAnimationFrame` sont utilisés automatiquement. Dans les tests, ces deux fonctions sont injectées au moyen d'un ordonnanceur simulé.

## Métadonnées de rendu

Le troisième argument de `onRender` contient notamment :

- `running` ;
- `interpolationAlpha` ;
- `accumulator` ;
- `playbackSpeed` ;
- `totalPhysicsSteps` ;
- `droppedSimulationTime` ;
- le nombre de sous-pas exécutés durant l'image ;
- les durées murale et physique de l'image.

## Exécution des tests

Pré-requis : Node.js 18 ou plus récent.

```bash
npm test
```
