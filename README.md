# Étape 5 — Animation SVG de S1, S2 et du fil

Cette version relie le moteur physique des étapes précédentes au montage SVG.

## Fonctionnalités ajoutées

- déplacement horizontal de S1 selon la position physique calculée ;
- descente de S2 pendant la phase 1 ;
- immobilisation de S2 lorsque son bord inférieur atteint le haut du support ;
- fil horizontal et tendu pendant la phase 1 ;
- fil détendu et incurvé pendant la phase 2 ;
- interpolation entre deux pas physiques pour un rendu fluide ;
- arrêt visuel exact de S1 au bord du banc ;
- commandes minimales de démonstration : démarrer, pause, pas à pas et réinitialiser ;
- fichier `index.html` entièrement autonome, ouvrable directement par double-clic.

## Fichiers principaux

- `src/apparatus-animation.js` : calcul pur de la géométrie animée et rendu DOM/SVG ;
- `src/animated-app.js` : raccordement du montage, de l’animateur et de la boucle temporelle ;
- `src/apparatus-view.js` : construction du SVG statique ;
- `src/time-loop.js` : boucle à pas physique fixe ;
- `index.html` : démonstration autonome sans ressource externe ;
- `scripts/build-standalone.mjs` : reconstruction du fichier HTML autonome ;
- `scripts/smoke-standalone.mjs` : contrôle d’exécution du JavaScript autonome.

## Utilisation

Ouvrir directement `index.html` dans un navigateur récent.

## Tests

```bash
npm test
npm run build
npm run smoke
```

La suite comprend 95 tests automatisés portant sur le moteur physique, les changements de phase, la boucle temporelle, le SVG et l’intégration de l’animation.
