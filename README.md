# Étape 9 — Enregistrement des mesures

Cette version enregistre automatiquement une mesure scientifique lors du franchissement de chaque capteur par le bord gauche de S1.

## Fonctionnalités ajoutées

- création d’une mesure unique pour chaque capteur déclenché ;
- calcul exact du déplacement du mobile correspondant à l’alignement visuel avec le faisceau ;
- calcul analytique du temps et de la vitesse au franchissement ;
- prise en compte des deux phases du mouvement ;
- prise en compte du ralentissement dû aux frottements en phase 2 ;
- absence de mesure pour une position physiquement inaccessible ;
- enregistrement centralisé et immuable des données ;
- numérotation chronologique des mesures ;
- prévention des doublons pour un même capteur ;
- effacement automatique lors d’une réinitialisation ou d’un changement de paramètre ;
- métadonnée DOM `data-measurement-count` permettant de vérifier l’enregistrement sans afficher les mesures ;
- conservation du masquage des valeurs mesurées dans l’interface ;
- fichier `index.html` entièrement autonome.

## Structure d’une mesure

```js
{
  sequence: 1,
  sensorId: 1,
  position: 0.222,
  mobilePosition: 0.257,
  time: 0.560,
  velocity: 0.916,
  acceleration: 1.635,
  phase: 1
}
```

- `position` : position graduée du capteur sur le banc ;
- `mobilePosition` : déplacement interne du moteur au moment où le bord gauche de S1 traverse le faisceau ;
- `time` : instant exact du franchissement ;
- `velocity` : vitesse instantanée calculée au franchissement ;
- `acceleration` : accélération dans la phase concernée ;
- `phase` : phase 1 ou phase 2.

## Fichiers principaux

- `src/measurement-recorder.js` : calcul et enregistrement des mesures ;
- `src/sensor-controller.js` : transmission de la position exacte de déclenchement ;
- `src/app-state.js` : stockage central, validation, numérotation et déduplication ;
- `src/animated-app.js` : raccordement entre capteurs, enregistreur et état central ;
- `test/measurement-recorder.test.js` : validation des calculs analytiques ;
- `test/measurement-integration.test.js` : validation de l’intégration complète.

## Utilisation

Ouvrir directement `index.html` dans un navigateur récent.

Les mesures sont enregistrées en arrière-plan. Leur affichage sera ajouté lors d’une étape ultérieure.

## Validation

```bash
npm test
npm run build
npm run smoke
```
