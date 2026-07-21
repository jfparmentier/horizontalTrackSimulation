# Étape 7 — Commandes de la simulation

Cette version complète la liaison entre l’interface et la boucle temporelle.

## Fonctionnalités ajoutées

- bouton **Démarrer**, automatiquement remplacé par **Reprendre** après une pause ;
- bouton **Pause** actif uniquement pendant l’exécution ;
- bouton **Pas à pas** avançant exactement de 0,05 s de temps physique ;
- bouton **Réinitialiser** restaurant l’état initial et interrompant l’exécution ;
- désactivation cohérente des commandes lorsque la simulation est en cours ou terminée ;
- message d’état accessible : prête, en cours, en pause ou terminée ;
- raccourcis clavier hors champs de saisie :
  - `Espace` : démarrer ou mettre en pause ;
  - `Flèche droite` : avancer d’un pas ;
  - `Origine` : réinitialiser ;
- maintien des commandes après toute reconstruction du montage liée à un changement de paramètre ;
- fichier `index.html` entièrement autonome.

## Fichiers principaux

- `src/simulation-controls.js` : logique des boutons, états accessibles et raccourcis clavier ;
- `src/animated-app.js` : raccordement des commandes à la boucle courante ;
- `test/simulation-controls.test.js` : tests unitaires des commandes ;
- `scripts/build-standalone.mjs` : génération du fichier HTML autonome.

## Utilisation

Ouvrir directement `index.html` dans un navigateur récent.

La suite comprend **113 tests automatisés**, complétés par un test d’exécution du fichier autonome.

## Validation

```bash
npm test
npm run build
npm run smoke
```
