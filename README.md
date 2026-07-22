# Étape 8 — Capteurs de vitesse actifs

Cette version raccorde les capteurs SVG au déplacement réel du mobile S1.

## Fonctionnalités ajoutées

- huit capteurs régulièrement répartis par défaut sur le banc ;
- nombre de capteurs toujours réglable de 1 à 16 ;
- déclenchement au moment exact où le bord gauche visible de S1 traverse le faisceau ;
- prise en compte de l’interpolation graphique afin que l’état du capteur reste synchronisé avec l’animation ;
- détection de tous les capteurs franchis, y compris lors d’un grand pas temporel ;
- prévention des doubles déclenchements au cours d’une même expérience ;
- signal visuel orange au moment du franchissement ;
- maintien en vert des capteurs déjà franchis ;
- remise à zéro automatique lors d’une réinitialisation ou d’un changement de paramètre ;
- compteur « capteurs déclenchés / capteurs totaux » dans le panneau de lecture ;
- attributs SVG et libellés accessibles mis à jour avec l’état de chaque capteur ;
- fichier `index.html` entièrement autonome.

Cette étape prépare l’enregistrement numérique des vitesses, qui sera ajouté à l’étape suivante.

## Fichiers principaux

- `src/sensor-controller.js` : détection des franchissements et état visuel des capteurs ;
- `src/animated-app.js` : raccordement des capteurs à la boucle temporelle ;
- `src/apparatus.css` : états visuels inactif, actif et déclenché ;
- `test/sensor-controller.test.js` : tests unitaires ;
- `test/sensor-integration.test.js` : tests avec la boucle temporelle ;
- `scripts/build-standalone.mjs` : génération du fichier HTML autonome.

## Utilisation

Ouvrir directement `index.html` dans un navigateur récent.

## Validation

```bash
npm test
npm run build
npm run smoke
```
