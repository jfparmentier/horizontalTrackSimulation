# Étape 4 — Montage expérimental statique en SVG

Cette archive prolonge les trois premières étapes du projet. Elle ajoute le dessin statique et accessible du montage expérimental, entièrement en SVG et sans dépendance externe.

## Contenu du montage

- banc horizontal avec origine `x = 0` ;
- règle graduée adaptée à la longueur physique du banc ;
- mobile `S1` à sa position initiale ;
- poulie et support ;
- fil tendu ;
- masse suspendue `S2` ;
- socle et indication de la hauteur de chute ;
- huit capteurs régulièrement espacés par défaut ;
- indication de la phase initiale et du milieu gravitationnel ;
- aucune représentation des vecteurs force, vitesse ou accélération.

Le SVG possède des groupes, identifiants et attributs `data-role` stables. Ils prépareront l'étape suivante, consacrée à l'animation du mobile, de la masse suspendue et du fil.

## Structure

```text
physics-step4/
├── index.html
├── package.json
├── README.md
├── test-report.txt
├── preview.png
├── src/
│   ├── apparatus.css
│   ├── apparatus-geometry.js
│   ├── apparatus-view.js
│   ├── constants.js
│   ├── index.js
│   ├── physics.js
│   ├── static-app.js
│   ├── time-loop.js
│   └── transitions.js
└── test/
    ├── apparatus-geometry.test.js
    ├── apparatus-view.test.js
    ├── physics.test.js
    ├── time-loop.test.js
    └── transitions.test.js
```

## Visualisation

Depuis le dossier décompressé :

```bash
npm run serve
```

Puis ouvrir `http://localhost:8000`.

Le fichier `index.html` peut aussi être ouvert directement dans un navigateur moderne. Aucun téléchargement de ressource externe n'est effectué.

## Tests

Pré-requis : Node.js 18 ou plus récent.

```bash
npm test
```

Les tests couvrent le moteur physique des étapes précédentes, la géométrie SVG, la répartition des capteurs, l'accessibilité du SVG et la présence des futurs points d'ancrage de l'animation.

## Ouverture locale

Le fichier `index.html` est entièrement autonome pour cet aperçu statique : le CSS et le SVG sont intégrés directement dans le document. Il peut donc être ouvert par double-clic avec une adresse `file://`, sans serveur local. Les modules du dossier `src/` restent disponibles pour les étapes suivantes du développement.
