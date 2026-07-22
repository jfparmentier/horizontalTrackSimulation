# Étape 9 — Enregistrement et export des mesures

Cette version enregistre automatiquement une mesure scientifique lors du franchissement de chaque capteur par le bord gauche de S1.

## Fonctionnalités

- enregistrement d’une mesure unique pour chaque capteur déclenché ;
- calcul analytique de l’instant et de la vitesse au franchissement ;
- stockage centralisé et immuable des données ;
- affichage inférieur limité au temps et à la position ;
- temps affiché avec exactement deux décimales ;
- bouton « Télécharger les données » désactivé pendant l’expérience ;
- activation automatique du bouton à la fin de la simulation ;
- export CSV autonome, sans bibliothèque externe ;
- quatre colonnes exportées : numéro du capteur, position, instant de déclenchement et vitesse mesurée ;
- fichier `index.html` entièrement autonome.

## Format CSV

```csv
"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"
1,0.222222,0.559583,0.793697
```

Les données sont triées par numéro de capteur. Les nombres utilisent le point décimal et au plus six décimales.

## Validation

```bash
npm test
npm run build
npm run smoke
```
