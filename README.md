# Simulation du glissement d’un mobile sur un banc horizontal

Simulation pédagogique autonome d’un mobile horizontal entraîné par une masse suspendue. Elle permet d’étudier les deux phases du mouvement, d’exploiter des capteurs de vitesse virtuels et, dans un mode expérimental, d’estimer un coefficient de frottement à partir de mesures répétées et bruitées.

> [!NOTE]
> Le fichier [`index.html`](./index.html) est autonome. Il fonctionne hors ligne, sans serveur, sans bibliothèque externe et sans installation.

## Objectifs pédagogiques

La simulation est conçue pour aider les élèves à :

- distinguer une phase accélérée d’une phase de mouvement libre avec ou sans frottement ;
- relier masse, accélération, position, durée et vitesse ;
- comparer un modèle idéal à une situation expérimentale bruitée ;
- exploiter des mesures répétées pour réduire l’incertitude ;
- estimer une grandeur physique inconnue à partir de données expérimentales ;
- exporter des mesures afin de les traiter dans un tableur ou un logiciel scientifique.

## Démarrage rapide

1. Télécharger ou cloner le projet.
2. Ouvrir [`index.html`](./index.html) dans un navigateur récent.
3. Choisir l’un des deux modes de simulation.
4. Sélectionner une masse suspendue en la faisant glisser vers l’emplacement de `S2`.
5. Lancer l’expérience avec le bouton de lecture.
6. À la fin de la simulation, télécharger les mesures au format CSV.

La masse suspendue sélectionnée par défaut est `0.5 kg`.

## Modes de simulation

| Mode | Frottement | Mesure de la vitesse | Mesure du temps | Finalité pédagogique |
|---|---:|---:|---:|---|
| **Cas idéal** | `μ = 0` | parfaite | parfaite | Identifier les concepts généraux et les deux phases du mouvement |
| **Cas avec frottement** | `μ = 0.058` | bruit normal, `σ = 0.1 m·s⁻¹` | bruit normal, `σ = 0.1 s` | Estimer expérimentalement le coefficient de frottement par répétition des mesures |

Dans le second mode, la valeur de `μ` n’est pas affichée dans l’interface. Une nouvelle réalisation du bruit est produite lors de chaque expérience réinitialisée.

Les valeurs bruitées de vitesse et de temps sont bornées à zéro afin d’éviter des mesures négatives non physiques.

## Utilisation

### Choisir la masse suspendue

Quatre masses sont disponibles :

- `0.2 kg` ;
- `0.5 kg` ;
- `1 kg` ;
- `2 kg`.

Chaque masse possède une couleur distincte. Elle peut être placée à la position de `S2` par glisser-déposer. L’ancienne masse revient automatiquement sur le support de rangement. Son emplacement vide conserve une étiquette grisée indiquant sa valeur.

La sélection est également utilisable au clavier : placer le focus sur une masse, puis appuyer sur `Entrée` ou `Espace`.

### Piloter l’animation

Les commandes sont intégrées dans la partie inférieure du SVG :

- lecture ou reprise ;
- pause ;
- progression pas à pas de `0.05 s` ;
- réinitialisation ;
- vitesse de lecture de `0.2×` à `1×`, par pas de `0.2×`.

Le bouton d’accueil, placé en haut à droite du SVG, ramène à l’écran de sélection du mode.

### Lire les résultats

La zone de résultats affiche :

- le temps courant avec deux décimales ;
- la **Durée de chute** ;
- la **Vitesse d’impact** ;
- le bouton de téléchargement des données.

La Durée de chute et la Vitesse d’impact correspondent aux mesures du capteur n° 5, situé à `0.60 m`. Dans le mode avec frottement, elles incluent donc les incertitudes de mesure temporelle et de vitesse.

Ces deux résultats sont visibles mais grisés avant le franchissement du capteur n° 5. Ils sont renseignés et activés dès que sa mesure est disponible.

## Paramètres physiques

### Paramètres fixes

| Paramètre | Valeur |
|---|---:|
| Masse de `S1` | `1 kg` |
| Longueur de `S1` | `0.2 m` |
| Hauteur de chute | `0.6 m` |
| Longueur du banc | `2 m` |
| Gravité | `9.81 m·s⁻²` |
| Position initiale | `x₀ = 0` |
| Vitesse initiale | `v₀ = 0` |

`S1` s’arrête lorsque son bord droit atteint l’extrémité du banc. Son bord gauche ne dépasse donc pas `1.8 m`.

### Capteurs

Les onze capteurs sont placés aux positions suivantes :

```text
0.12, 0.24, 0.36, 0.48, 0.60, 0.80,
1.00, 1.20, 1.40, 1.60 et 1.80 m
```

Un capteur se déclenche lorsque le bord gauche de `S1` traverse son faisceau. Il passe alors directement au vert et n’enregistre qu’une mesure par expérience.

## Modèle physique

Le modèle suppose :

- un fil sans masse et inextensible ;
- une poulie idéale, sans inertie ni frottement ;
- un banc horizontal ;
- un coefficient de frottement constant ;
- aucune résistance de l’air ;
- une vitesse identique pour `S1` et `S2` pendant la première phase.

### Phase 1 — descente de la masse suspendue

Tant que `S2` descend, l’accélération commune vaut :

```text
a₁ = (m₂g − μm₁g) / (m₁ + m₂)
```

Si la force motrice ne suffit pas à vaincre le frottement, le système reste immobile.

### Phase 2 — masse suspendue sur le support

Lorsque `S2` atteint le support, le fil se détend et `S1` n’est plus entraîné :

```text
a₂ = −μg
```

Dans le cas idéal, `a₂ = 0` et la vitesse reste constante. Dans le cas avec frottement, la vitesse diminue jusqu’à l’arrêt ou jusqu’à l’extrémité du banc.

### Intégration et événements

Pour une accélération constante pendant un intervalle `Δt`, le moteur utilise les relations cinématiques exactes :

```text
x(t + Δt) = x(t) + v(t)Δt + ½aΔt²
v(t + Δt) = v(t) + aΔt
```

La boucle temporelle utilise un pas physique fixe. Le changement de phase, l’arrêt par frottement, le franchissement des capteurs et l’arrivée en bout de banc sont localisés à leur instant exact, même lorsqu’ils surviennent entre deux images de l’animation.

## Mesures et export CSV

Le bouton de téléchargement devient actif lorsque la simulation atteint un état terminal.

Le fichier `mesures-capteurs.csv` contient exactement quatre colonnes :

```csv
"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"
1,0.12,0.431628,0.541907
```

Caractéristiques de l’export :

- une ligne par capteur déclenché ;
- tri par numéro de capteur ;
- positions exprimées dans le même repère que la règle du SVG ;
- point comme séparateur décimal ;
- six décimales au maximum ;
- encodage UTF-8 avec marque d’ordre des octets pour faciliter l’ouverture dans les tableurs.

## Raccourcis clavier

| Touche | Action |
|---|---|
| `Espace` | Démarrer, reprendre ou mettre en pause |
| `Flèche droite` | Avancer de `0.05 s` |
| `Début` / `Home` | Réinitialiser l’expérience |
| `Entrée` ou `Espace` sur une masse | Sélectionner cette masse suspendue |

Les raccourcis globaux sont ignorés lorsqu’un champ de saisie ou un bouton possède le focus.

## Architecture du projet

```text
.
├── index.html                     # Application autonome générée
├── dist-standalone.js             # Bundle JavaScript généré
├── package.json                   # Métadonnées et scripts npm
├── README.md                      # Documentation du projet
├── scripts/
│   ├── build-standalone.mjs       # Génération de index.html et du bundle
│   └── smoke-standalone.mjs       # Test minimal de la version autonome
├── src/
│   ├── animated-app.js            # Assemblage de l’application
│   ├── app-state.js               # État central
│   ├── apparatus-animation.js     # Animation de S1, S2 et du fil
│   ├── apparatus-geometry.js      # Géométrie SVG et échelles physiques
│   ├── apparatus-view.js          # Construction du montage SVG
│   ├── apparatus.css              # Présentation et mise en page
│   ├── constants.js               # Paramètres fixes et modes
│   ├── mass-selector.js           # Sélection des masses
│   ├── measurement-export.js      # Création et téléchargement du CSV
│   ├── measurement-recorder.js    # Calcul des mesures et du bruit
│   ├── mode-selector.js           # Écran de choix du mode
│   ├── parameter-controls.js      # Réglage de la vitesse de lecture
│   ├── physics.js                 # Fonctions physiques élémentaires
│   ├── sensor-controller.js       # Détection et état visuel des capteurs
│   ├── simulation-controls.js     # Boutons et raccourcis clavier
│   ├── time-loop.js               # Boucle temporelle à pas fixe
│   └── transitions.js             # Gestion exacte des événements
└── test/                          # Tests unitaires et d’intégration
```

`index.html` et `dist-standalone.js` sont générés par le script de construction. Les modifications fonctionnelles doivent être effectuées dans `src/`, puis propagées avec `npm run build`.

## Développement

### Prérequis

- Node.js `18` ou version ultérieure ;
- Python 3 uniquement pour le serveur local fourni par `npm run serve`.

Le projet ne dépend d’aucun paquet npm tiers.

### Commandes

```bash
npm test
```

Exécute les `205` tests unitaires et d’intégration avec le module natif `node:test`.

```bash
npm run build
```

Reconstruit [`index.html`](./index.html) et `dist-standalone.js` à partir des fichiers de `src/`.

```bash
npm run smoke
```

Vérifie que le bundle autonome démarre, affiche l’écran de sélection du mode et permet une interaction minimale.

```bash
npm run serve
```

Démarre un serveur HTTP local sur le port `8000`.

### Vérification avant contribution

```bash
npm test
npm run build
npm run smoke
```

Une modification du modèle physique, des mesures, du bruit, de la géométrie ou de l’interface doit être accompagnée d’un test reproduisant le comportement attendu.

## Accessibilité

L’interface prévoit notamment :

- des noms accessibles pour les boutons représentés par des icônes ;
- une navigation et une sélection des masses au clavier ;
- des attributs `disabled`, `aria-disabled` et `aria-keyshortcuts` cohérents ;
- une description textuelle du montage SVG ;
- des états de capteurs persistants et non fondés uniquement sur une animation transitoire ;
- un fonctionnement au pointeur, à la souris et au tactile.

## Limites connues

Cette simulation constitue un modèle pédagogique et non un dispositif de métrologie réel. En particulier :

- les frottements sont représentés par un coefficient constant ;
- la poulie et le fil sont idéalisés ;
- les incertitudes sont des bruits normaux indépendants ;
- aucune erreur systématique, corrélation entre capteurs ou dérive instrumentale n’est modélisée ;
- les mesures négatives produites par le bruit sont ramenées à zéro ;
- le coefficient de frottement du mode expérimental est fixé dans le code.

## Contribution

Pour proposer une modification :

1. créer une branche dédiée ;
2. conserver la séparation entre physique, état central, mesures et rendu ;
3. ajouter ou mettre à jour les tests concernés ;
4. exécuter la chaîne de vérification complète ;
5. documenter la justification scientifique et les effets visibles de la modification.

Pour un dépôt public accueillant des contributions externes, ces consignes devraient être déplacées et développées dans un fichier `CONTRIBUTING.md`. Un `CODE_OF_CONDUCT.md` et une politique de sécurité peuvent également être ajoutés selon les besoins du projet.

## Licence

> [!WARNING]
> Aucun fichier `LICENSE` n’est actuellement fourni. Une licence explicite doit être choisie avant toute publication, redistribution ou réutilisation du projet.
