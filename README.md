# Simulation du glissement d’un mobile sur un banc horizontal

Page web pédagogique autonome reproduisant le mouvement d’un mobile horizontal entraîné par une masse suspendue. La simulation permet d’étudier l’évolution de la vitesse en fonction de la position, puis d’exporter les mesures de onze capteurs virtuels au format CSV.

Le fichier `index.html` fonctionne directement hors ligne, sans serveur, sans installation et sans ressource externe.

## Modes de simulation

Au démarrage, l’utilisateur choisit l’un des deux modes proposés par un écran d’accueil à grandes cartes.

### Cas idéal

- coefficient de frottement : `μ = 0` ;
- mesures de vitesse exactes ;
- objectif : identifier les deux phases du mouvement et comprendre les relations générales entre masse, accélération et vitesse.

### Cas avec frottement

- coefficient interne : `μ = 0.058` ;
- valeur volontairement non affichée dans l’interface ;
- vitesses mesurées perturbées par un bruit normal centré d’écart-type `0.02 m/s` ;
- objectif : répéter les expériences, réduire l’incertitude par traitement statistique et estimer le coefficient de frottement.

Un bouton d’accueil permet de revenir à l’écran de choix du mode.

## Fonctionnalités

- animation SVG synchronisée du mobile, de la masse suspendue et du fil ;
- sélection de la masse suspendue par glisser-déposer ;
- masses disponibles : `0.2 kg`, `0.5 kg`, `1 kg` et `2 kg` ;
- moteur physique à pas temporel fixe ;
- localisation exacte du changement de phase ;
- déclenchement des capteurs lorsque le bord gauche du mobile traverse leur faisceau ;
- onze capteurs aux positions `0.12`, `0.24`, `0.36`, `0.48`, `0.60`, `0.80`, `1.00`, `1.20`, `1.40`, `1.60` et `1.80 m` ;
- affichage de la durée de chute et de la vitesse d’impact au début de la phase 2 ;
- export CSV à la fin de l’expérience ;
- commandes au clavier et au pointeur ;
- fonctionnement hors ligne.

## Utilisation

1. Ouvrir `index.html` dans un navigateur récent.
2. Choisir **Cas idéal** ou **Cas avec frottement**.
3. Faire glisser une masse sur la masse suspendue actuelle.
4. Lancer la simulation avec **Démarrer**.
5. Utiliser **Réinitialiser** pour répéter l’expérience avec une nouvelle réalisation du bruit dans le second mode.
6. Lorsque la simulation est terminée, télécharger les mesures avec l’icône d’export.

## Paramètres fixes

| Paramètre | Valeur |
|---|---:|
| Masse du mobile | `1.0 kg` |
| Longueur du mobile | `0.2 m` |
| Hauteur de chute | `0.6 m` |
| Longueur du banc | `2.0 m` |
| Nombre de capteurs | `11` |
| Gravité | `9.81 m·s⁻²` |
| Position initiale | `x₀ = 0` |
| Vitesse initiale | `v₀ = 0` |

Le mobile s’arrête lorsque son bord droit atteint l’extrémité du banc. Son bord gauche ne dépasse donc pas `1.8 m`.

## Paramètres manipulables

| Paramètre | Valeurs |
|---|---|
| Masse suspendue | `0.2`, `0.5`, `1.0` ou `2.0 kg` |
| Vitesse de lecture | `0.1×` à `1.0×` |
| Mode physique | idéal ou avec frottement |

Le coefficient de frottement et le niveau de bruit ne sont pas modifiables depuis l’interface : ils sont imposés par le mode choisi.

## Modèle physique

Le fil est supposé sans masse et inextensible. La poulie est idéale et le banc est horizontal.

### Phase 1

Tant que la masse suspendue descend :

```text
a₁ = (m₂g − μm₁g) / (m₁ + m₂)
```

Si la force motrice est insuffisante, le système reste immobile.

### Phase 2

Lorsque la masse suspendue atteint son support, le fil se détend :

```text
a₂ = −μg
```

Dans le cas idéal, la vitesse reste constante. Dans le cas avec frottement, elle décroît jusqu’à l’arrêt ou jusqu’à la fin du banc.

### Intégration temporelle

Pour chaque intervalle à accélération constante :

```text
x(t + Δt) = x(t) + v(t)Δt + 1/2 aΔt²
v(t + Δt) = v(t) + aΔt
```

Les événements physiques sont localisés à leur instant exact, y compris lorsqu’ils surviennent entre deux images de l’animation.

## Mesures bruitées

Dans le mode avec frottement, seule la vitesse fournie par les capteurs est perturbée :

```text
v_mesurée = max(0, v_théorique + ε)
ε ~ N(0, 0.02²)
```

La position du capteur et l’instant de déclenchement restent exacts. Une nouvelle réalisation indépendante du bruit est générée à chaque répétition de l’expérience.

## Export CSV

Le fichier exporté contient quatre colonnes :

```csv
"Numéro du capteur","Position (m)","Instant de déclenchement (s)","Vitesse mesurée (m/s)"
1,0.12,0.123456,0.654321
```

Les nombres utilisent un point décimal et sont limités à six décimales. Le bouton d’export reste désactivé tant que la simulation n’est pas terminée.

## Commandes clavier

| Touche | Action |
|---|---|
| `Espace` | démarrer, reprendre ou mettre en pause |
| `Flèche droite` | avancer de `0.05 s` |
| `Début` / `Home` | réinitialiser l’expérience |
| `Entrée` ou `Espace` sur une masse | sélectionner cette masse |

## Structure du projet

```text
.
├── index.html                    # page autonome utilisable directement
├── dist-standalone.js            # bundle JavaScript autonome
├── package.json
├── scripts/
│   ├── build-standalone.mjs
│   └── smoke-standalone.mjs
├── src/
│   ├── animated-app.js           # orchestration générale
│   ├── app-state.js              # état central et sélection du mode
│   ├── mode-selector.js          # écran de choix du mode
│   ├── apparatus-animation.js
│   ├── apparatus-geometry.js
│   ├── apparatus-view.js
│   ├── apparatus.css
│   ├── constants.js
│   ├── mass-selector.js
│   ├── measurement-recorder.js   # mesures exactes ou bruitées
│   ├── measurement-export.js
│   ├── parameter-controls.js     # vitesse de lecture
│   ├── physics.js
│   ├── sensor-controller.js
│   ├── simulation-controls.js
│   ├── time-loop.js
│   └── transitions.js
└── test/
```

## Développement

### Prérequis

- Node.js `18` ou version ultérieure ;
- npm.

Aucune dépendance npm externe n’est utilisée.

### Commandes

```bash
npm test
npm run build
npm run smoke
npm run serve
```

- `npm test` exécute les tests unitaires et d’intégration ;
- `npm run build` reconstruit `index.html` et `dist-standalone.js` ;
- `npm run smoke` vérifie le fonctionnement minimal du bundle autonome ;
- `npm run serve` lance un serveur local sur le port `8000`.

Avant toute livraison :

```bash
npm run build
npm test
npm run smoke
```

## Accessibilité

- cartes de mode utilisables au clavier ;
- sélection des masses à la souris, au tactile et au clavier ;
- descriptions accessibles du SVG ;
- états `disabled` et `aria-disabled` cohérents ;
- raccourcis déclarés avec `aria-keyshortcuts` ;
- icônes accompagnées d’un nom accessible.

## Limites du modèle

- fil sans masse et inextensible ;
- poulie sans inertie ni frottement ;
- banc parfaitement horizontal ;
- frottement cinétique constant ;
- absence de frottement statique distinct ;
- absence de résistance de l’air ;
- bruit appliqué uniquement à la vitesse des capteurs.

## Licence

Aucun fichier de licence n’est fourni. Une licence explicite doit être ajoutée avant toute diffusion publique ou réutilisation par des tiers.
