# Simulation du glissement d’un mobile sur un banc horizontal

Simulation pédagogique autonome reproduisant le mouvement d’un mobile `S1` entraîné par une masse suspendue `S2`, puis poursuivant son déplacement après l’arrivée de `S2` sur son support.

Le projet vise à permettre l’étude expérimentale de l’évolution de la vitesse en fonction de la position, à l’aide de onze capteurs virtuels et d’un export des mesures au format CSV.

## Aperçu

La simulation représente deux phases successives :

1. **Phase 1 — chute de la masse suspendue** : `S2` descend et entraîne `S1` par l’intermédiaire d’un fil passant sur une poulie.
2. **Phase 2 — mouvement après impact** : `S2` atteint son support, le fil se détend et `S1` poursuit son mouvement sous l’effet éventuel des frottements.

Le fichier `index.html` est entièrement autonome : il peut être ouvert directement dans un navigateur, sans serveur, sans installation et sans connexion réseau.

## Fonctionnalités principales

- animation SVG synchronisée de `S1`, `S2`, de la poulie et du fil ;
- sélection de la masse suspendue par glisser-déposer directement dans le SVG ;
- moteur physique à pas temporel fixe ;
- traitement exact du changement de phase ;
- détection des capteurs lorsque le bord gauche de `S1` traverse leur faisceau ;
- onze capteurs placés aux positions `0.12 m`, `0.24 m`, `0.36 m`, `0.48 m`, `0.60 m`, puis `0.80 m`, `1.00 m`, `1.20 m`, `1.40 m`, `1.60 m` et `1.80 m` ;
- passage direct des capteurs au vert lors du franchissement ;
- commandes par icônes pour démarrer/reprendre, mettre en pause, avancer pas à pas et réinitialiser ;
- panneau des commandes et des résultats intégré dans la zone centrale basse du montage ;
- vitesse de lecture réglable de `0.2×` à `1.0×`, par pas de `0.2×` ;
- affichage du temps avec deux décimales ;
- affichage de la **Durée de chute** et de la **Vitesse d’impact** à partir des mesures du capteur n° 5, placé à `0.60 m` ; les bruits temporel et de vitesse du mode avec frottement sont donc pris en compte ;
- téléchargement des mesures au format CSV lorsque la simulation est terminée ;
- fonctionnement hors ligne, sans bibliothèque externe.

## Démarrage rapide

### Utilisation directe

1. Télécharger ou extraire les fichiers du projet.
2. Ouvrir `index.html` dans un navigateur récent.
3. Choisir le mode **Cas idéal** ou **Cas avec frottement**.
4. Faire glisser l’une des masses disponibles (`0.2 kg`, `0.5 kg`, `1 kg` ou `2 kg`) sur la masse suspendue.
5. Utiliser l’icône de lecture pour démarrer la simulation.
6. À la fin de l’expérience, utiliser l’icône de téléchargement pour exporter les mesures.

Aucune installation de Node.js n’est nécessaire pour cette utilisation.

### Serveur local de développement

```bash
npm run serve
```

Ouvrir ensuite la page indiquée par le serveur, généralement `http://localhost:8000`.

## Paramètres

### Paramètres réglables

| Paramètre | Plage | Pas | Valeur initiale |
|---|---:|---:|---:|
| Masse suspendue `m2` | `0.2 kg`, `0.5 kg`, `1.0 kg` ou `2.0 kg` | sélection SVG | `0.5 kg` |
| Vitesse de lecture | `0.2×` à `1.0×` | `0.2×` | `1.0×` |

### Modes de simulation

| Mode | Coefficient de frottement | Mesures des capteurs |
|---|---:|---|
| Cas idéal | `μ = 0` | parfaites |
| Cas avec frottement | `μ = 0.058` | bruits gaussiens d’écart-type `0.1 m·s⁻¹` sur la vitesse et `0.1 s` sur l’instant de déclenchement |

Dans le second mode, la valeur de `μ` n’est pas affichée dans l’interface : elle constitue la grandeur à estimer expérimentalement.

### Paramètres fixes

| Paramètre | Valeur |
|---|---:|
| Masse de `S1` | `1.0 kg` |
| Longueur physique de `S1` | `0.2 m` |
| Hauteur de chute | `0.6 m` |
| Longueur du banc | `2.0 m` |
| Nombre de capteurs | `11` |
| Gravité | `9.81 m·s⁻²` |
| Position initiale | `x0 = 0` |
| Vitesse initiale | `v0 = 0` |

`S1` s’arrête lorsque son bord droit atteint l’extrémité du banc. Son bord gauche ne peut donc pas dépasser `1.8 m`.

## Modèle physique

Le fil est supposé inextensible et sans masse. La poulie est idéale et le banc est horizontal.

### Phase 1

Tant que `S2` descend, l’accélération commune des deux masses est :

```text
a1 = (m2·g − μ·m1·g) / (m1 + m2)
```

Si la force motrice n’est pas suffisante pour vaincre le frottement, l’accélération est nulle et le système reste bloqué.

### Phase 2

Lorsque `S2` atteint son support, `S1` n’est plus entraîné par le fil :

```text
a2 = −μ·g
```

Sans frottement, la vitesse de `S1` reste constante. Avec frottement, elle diminue jusqu’à l’arrêt ou jusqu’à l’extrémité du banc.

### Intégration temporelle

Pour une accélération constante sur un pas de durée `Δt`, le moteur utilise les relations cinématiques exactes :

```text
x(t + Δt) = x(t) + v(t)·Δt + 1/2·a·Δt²
v(t + Δt) = v(t) + a·Δt
```

Les événements physiques — changement de phase, arrêt par frottement et fin du banc — sont localisés à leur instant exact, y compris lorsqu’ils surviennent entre deux images de l’animation.

## Mesures et export CSV

Une mesure est enregistrée une seule fois pour chaque capteur, au moment exact où le bord gauche de `S1` traverse son faisceau.

Le fichier `mesures-capteurs.csv` contient exactement quatre colonnes :

```csv
"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"
1,0.12,0.123456,0.654321
```

Les mesures sont :

- triées par numéro de capteur ;
- exprimées dans le même repère que la règle SVG ;
- écrites avec un point décimal ;
- limitées à six décimales ;
- précédées d’une marque UTF-8 afin de faciliter l’ouverture dans les tableurs.

Le bouton d’export reste désactivé tant que la simulation n’est pas terminée.

## Commandes clavier

| Touche | Action |
|---|---|
| `Espace` | Démarrer, reprendre ou mettre en pause |
| `Flèche droite` | Avancer de `0.05 s` |
| `Début` / `Home` | Réinitialiser l’expérience |

Les raccourcis sont ignorés lorsqu’un champ de saisie ou un bouton possède le focus.

## Structure du projet

```text
.
├── index.html                    # Version autonome utilisable directement
├── dist-standalone.js            # JavaScript assemblé pour la version autonome
├── package.json                  # Scripts et métadonnées du projet
├── scripts/
│   ├── build-standalone.mjs      # Construction du fichier HTML autonome
│   └── smoke-standalone.mjs      # Vérification minimale du fichier construit
├── src/
│   ├── animated-app.js           # Initialisation générale de l’application
│   ├── app-state.js              # État central et immuable
│   ├── apparatus-animation.js    # Mise à jour de l’animation SVG
│   ├── apparatus-geometry.js     # Géométrie et conversions mètres–pixels
│   ├── apparatus-view.js         # Construction du SVG
│   ├── constants.js              # Constantes physiques et paramètres fixes
│   ├── measurement-export.js     # Génération et téléchargement du CSV
│   ├── measurement-recorder.js   # Calcul des mesures aux capteurs
│   ├── mass-selector.js          # Glisser-déposer et sélection clavier des masses
│   ├── parameter-controls.js     # Liaison des paramètres numériques à l’état central
│   ├── physics.js                # Fonctions physiques élémentaires
│   ├── sensor-controller.js      # Détection et affichage des capteurs
│   ├── simulation-controls.js    # Commandes et raccourcis clavier
│   ├── time-loop.js              # Boucle temporelle à pas fixe
│   └── transitions.js            # Gestion exacte des événements physiques
└── test/                         # Tests unitaires et tests d’intégration
```

## Développement

### Prérequis

- Node.js `18` ou version ultérieure ;
- npm, fourni avec Node.js.

Le projet n’utilise aucune dépendance npm externe.

### Installation

```bash
npm install
```

Cette commande initialise l’environnement npm. Aucun paquet tiers n’est téléchargé dans l’état actuel du projet.

### Scripts disponibles

```bash
npm test
```

Exécute l’ensemble des tests avec le module natif `node:test`.

```bash
npm run build
```

Reconstruit `index.html` à partir des modules présents dans `src/`.

```bash
npm run smoke
```

Effectue un test minimal du fichier HTML autonome construit.

```bash
npm run serve
```

Démarre un serveur HTTP local sur le port `8000`.

### Vérification avant modification

```bash
npm test
npm run build
npm run smoke
```

Toute modification du moteur physique, de la géométrie SVG ou de l’enregistrement des mesures devrait être accompagnée d’un test reproduisant le comportement attendu.

## Accessibilité

L’interface comprend notamment :

- des libellés explicites pour les paramètres et les commandes ;
- une sélection des masses utilisable au pointeur, à la souris, au tactile et au clavier (`Entrée` ou `Espace`) ;
- des états `disabled` et `aria-disabled` cohérents ;
- des raccourcis clavier déclarés avec `aria-keyshortcuts` ;
- une description accessible du montage SVG ;
- une icône de téléchargement accompagnée d’un nom accessible ;
- des changements d’état des capteurs qui ne reposent pas uniquement sur une animation transitoire.

## Limites du modèle

Cette version repose sur un modèle volontairement simplifié :

- fil sans masse et inextensible ;
- poulie sans inertie ni frottement ;
- banc parfaitement horizontal ;
- coefficient de frottement constant ;
- absence de résistance de l’air ;
- masse suspendue et mobile partageant la même vitesse durant la phase 1 ;
- bruits de mesure modélisés par des lois normales indépendantes, sans dérive systématique ni corrélation entre capteurs ;
- instants bruités bornés à `0 s` afin d’éviter une valeur temporelle négative.

## Contribution

Pour proposer une modification :

1. créer une branche dédiée ;
2. conserver la séparation entre modèle physique, état, rendu et interface ;
3. ajouter ou mettre à jour les tests concernés ;
4. exécuter `npm test`, `npm run build` et `npm run smoke` ;
5. décrire clairement le comportement modifié et sa justification scientifique.

## Licence

Aucun fichier de licence n’est fourni dans cette version. Une licence explicite doit être ajoutée avant toute diffusion publique ou réutilisation par des tiers.
