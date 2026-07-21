# Étape 6 — Paramètres reliés à l’état central

Cette version ajoute une source unique de vérité pour les paramètres, l’état physique courant et les réglages de l’expérience.

## Fonctionnalités ajoutées

- état central immuable avec abonnement aux changements ;
- paramètres physiques reliés à des curseurs et champs numériques synchronisés ;
- choix Terre ou Lune ;
- réglage du nombre de capteurs ;
- réglage de la vitesse de lecture ;
- validation des valeurs et affichage des erreurs ;
- réinitialisation automatique de l’expérience après modification d’un paramètre physique ;
- reconstruction cohérente du SVG lorsque la longueur du banc, la hauteur, la gravité ou le nombre de capteurs change ;
- synchronisation de l’état central avec la boucle temporelle ;
- conservation des réglages d’affichage futurs pour les mesures et courbes ;
- fichier `index.html` autonome, ouvrable directement par double-clic.

## Fichiers principaux

- `src/app-state.js` : état central de l’application ;
- `src/parameter-controls.js` : liaison bidirectionnelle entre les champs et l’état central ;
- `src/animated-app.js` : orchestration du moteur, du SVG et de l’état central ;
- `src/apparatus-animation.js` : animation de S1, S2 et du fil ;
- `src/time-loop.js` : boucle temporelle à pas fixe ;
- `index.html` : application autonome ;
- `scripts/build-standalone.mjs` : génération du fichier HTML autonome ;
- `scripts/smoke-standalone.mjs` : contrôle d’exécution du paquet autonome.

## Utilisation

Ouvrir directement `index.html` dans un navigateur récent.

## Validation

```bash
npm test
npm run build
npm run smoke
```

La suite comprend 106 tests automatisés. Le test d’exécution autonome est également validé.
