# Domino Web — Site agence premium

Site one-page pour **Domino Web**, agence web premium, innovante et créative.
HTML / CSS / JS pur, animations haut de gamme, formulaire de contact branché sur **Web3Forms**.

---

## Démarrage rapide

### Tester en local

Le plus simple :

```bash
# Depuis le dossier du projet
npx serve .

# ou avec Python
python -m http.server 8080
```

Puis ouvrir **http://localhost:8080** (ou le port indiqué).

> ⚠️ Ouvrir `index.html` directement via `file://` ne marche pas : Web3Forms et Spline ont besoin d'un contexte HTTP.

---

## Structure

```
Site web Agence Web/
├── index.html            # page unique
├── 404.html              # page d'erreur custom (GitHub Pages)
├── .nojekyll             # désactive Jekyll sur GitHub Pages
├── robots.txt            # SEO
├── sitemap.xml           # SEO
├── css/
│   ├── reset.css                # reset moderne
│   ├── variables.css            # design tokens (palette LED, typo, spacing)
│   ├── typography.css           # styles typographiques + titres dégradés
│   ├── layout.css               # grilles, sections, navbar, hero, services…
│   ├── components.css           # boutons, cartes, formulaires
│   ├── animations.css           # keyframes + reveal states
│   ├── carousel.css             # styles du carrousel vertical 3D
│   └── responsive.css           # media queries
├── js/
│   ├── lenis.js                 # smooth scroll
│   ├── loader.js                # écran d'intro
│   ├── cursor.js                # curseur custom + magnétisme
│   ├── nav.js                   # navbar flottante + menu mobile
│   ├── animations.js            # GSAP reveal + tilt 3D
│   ├── robot.js                 # suivi des yeux / animations robot
│   ├── testimonials.js          # slider témoignages
│   ├── carousel.js              # carrousel vertical 3D (drag, wheel, dots, clavier)
│   ├── project-name-animation.js # animation 3D + reveal lettre par lettre du nom
│   ├── form.js                  # Web3Forms submission
│   └── main.js                  # entry point (icônes Lucide, etc.)
├── assets/
│   ├── images/                  # visuels / placeholders
│   │   └── gallery/             # mockups SVG des projets (4 projets)
│   ├── icons/                   # SVG custom si besoin
│   └── textures/                # bruit, grain
└── README.md
```

---

## Personnalisation rapide

### 1. Palette de couleurs

Toute la palette se gère dans **`css/variables.css`**. Le site utilise un style **néomorphique** avec un **dégradé LED signature** (vert pomme → vert fluo → blanc) sur les titres, boutons importants et effets lumineux autour des cartes. Le reste du site reste en **noir & blanc** :

```css
--c-bg: #0A0A0A;            /* fond global noir */
--c-text: #FFFFFF;          /* texte principal blanc */
--c-accent: #7CFF00;        /* vert pomme vif (LED) */
--c-accent-2: #00FF7F;      /* vert fluo menthe (LED) */

--grad-led-text: linear-gradient(135deg, #7CFF00 0%, #00FF7F 50%, #FFFFFF 100%);
--grad-led:      linear-gradient(135deg, #7CFF00 0%, #00FF7F 60%, #FFFFFF 100%);
--grad-led-line: linear-gradient(90deg,  #7CFF00 0%, #00FF7F 50%, #FFFFFF 100%);
```

Pour appliquer le dégradé à un titre : ajoutez la classe `.text-gradient` (déjà présente sur certains éléments via `<em>`).

### 2. Polices

Polices chargées depuis **Google Fonts** (déclarées dans `index.html` + `css/variables.css`) :

- `Bricolage Grotesque` → display, titres
- `Manrope` → corps de texte
- `Caveat` → manuscrite (accents `<em>`)
- `JetBrains Mono` → labels, chiffres

Remplacez par les vôtres en gardant au moins 3 familles différentes (display / body / manuscrite).

### 3. Scène 3D Spline (hero)

Dans **`index.html`**, cherchez :

```html
<iframe src="https://my.spline.design/dominohero-000/embed" ...>
```

Remplacez l'URL par l'embed de votre scène Spline (Spline → Share → Embed).

Si vous n'avez pas de scène, **ne changez rien** : un fallback en CSS (orb animé) prend le relais après 4.5s.

### 4. Contenu des sections

Tous les textes sont dans **`index.html`**, sections clairement commentées :

- `#hero` → titre + sous-titre hero
- `#manifeste` → manifeste + 4 cartes
- `#services` → 6 cartes services (modifier le contenu + le tag `/01` à `/06`)
- `#process` → 4 étapes
- `#projets` → carrousel 3D des projets (voir ci-dessous)
- `#testimonials` → 3 témoignages
- `#faq` → 6 questions/réponses
- `#contact` → formulaire (déjà branché Web3Forms)

### 5. Carrousel 3D des projets (NOUVEAU)

La section `#projets` affiche un **carrousel vertical 3D** avec animation spring et effets LED néon autour des cartes. Contrôles supportés :

- **Wheel** (molette) sur la zone du stack
- **Drag vertical** sur la carte centrale
- **Boutons** ↑ / ↓
- **Dots** de navigation
- **Clavier** (flèches ↑↓ ←→)
- **Autoplay** (désactivé par défaut, hook présent dans `carousel.js`)

Pour ajouter / modifier un projet, éditez le bloc `<article class="carousel-card" data-carousel-slide>` dans `index.html` (section `#projets`). Les attributs `data-name`, `data-desc`, `data-tags` pilotent le contenu du panneau de gauche (nom, description, chips).

Les images sont des **mockups SVG** dans `assets/images/gallery/` (4 projets livrés). Pour ajouter de nouveaux visuels, déposez vos images (SVG, JPG, WebP) dans ce dossier et référencez-les dans `data-name` / `<img src>`.

### 6. Email de contact

Déjà configuré avec Web3Forms :

- **Clé d'accès** : `01e96fdf-fafd-43b0-a96c-390864039b48` (celle fournie)
- **Email de destination** : celui lié à votre compte Web3Forms (créé sur [web3forms.com](https://web3forms.com) avec `dominolaverne24@gmail.com`)

Les champs du formulaire :
- `name`, `email`, `company`, `type` (radio), `budget` (select), `message`
- `subject` personnalisé → `Nouveau projet — Domino Web`
- Honeypot `botcheck` pour anti-spam

---

## Animations & UX

- **Smooth scroll** : Lenis (overridable via `prefers-reduced-motion`)
- **Loader** : SVG qui se dessine + barre de progression (1.4s minimum)
- **Curseur custom** : dot + ring magnétique (desktop uniquement, désactivé sur tactile)
- **Texte split** : animation lettre par lettre sur les titres `[data-split]`
- **Reveal au scroll** : `[data-reveal]` sur chaque bloc important
- **3D tilt** : `[data-tilt]` sur les cartes services
- **Bouton premium** : dégradé LED (vert → fluo → blanc) + shimmer + halo
- **Carrousel 3D** : stack vertical spring, drag, wheel, clavier, dots LED
- **Animation nom de projet** : stack 3D des noms + reveal lettre par lettre
- **Marquee** : stack technique en défilement infini
- **Grain overlay** : texture noise fixe en `mix-blend-mode: overlay`
- **Style néomorphique** : ombres douces, surfaces en relief, inputs inset

Pour **désactiver toutes les animations** automatiquement, la règle `@media (prefers-reduced-motion: reduce)` est déjà en place.

---

## Hébergement

### Option 1 — Netlify (recommandé, gratuit, 5 min)

1. Push le projet sur un repo GitHub
2. Connectez-vous sur [netlify.com](https://netlify.com)
3. **Add new site** → **Import from Git** → choisissez le repo
4. Build settings : laissez vide (site statique), publish dir = `.`
5. Deploy. Vous obtenez une URL `https://domino-web.netlify.app`

Domaine custom : achetez un domaine (ex. `dominoweb.fr` chez OVH) puis dans Netlify → **Domain settings** → **Add custom domain**.

### Option 2 — Vercel (gratuit)

Idem, [vercel.com](https://vercel.com) → **New Project** → importez le repo. Aucune config.

### Option 3 — GitHub Pages (gratuit, 100% statique)

> ⚠️ **Pourquoi une 404 sur GitHub Pages ?** Dans 90% des cas c'est **Jekyll** qui traite le site et :
> - ignore les dossiers/fichiers commençant par `_` ou `.`
> - tente d'interpréter `{% %}` / `{{ }}` dans vos fichiers
>
> **Le fix :** un fichier **`.nojekyll`** vide à la racine. Il est déjà dans ce repo, vous n'avez rien à faire.

#### A. Méthode simple (5 min)

1. Poussez le repo sur GitHub
2. **Settings** → **Pages** → **Source** : `Deploy from a branch` → branche `main` (ou `master`), dossier `/ (root)`
3. Patientez 1–2 min → URL : `https://<user>.github.io/<repo>/`

#### B. Méthode moderne (workflow, build manuel)

Créez `.github/workflows/static.yml` :

```yaml
name: Deploy static site to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

Puis **Settings** → **Pages** → **Source** : `GitHub Actions`.

#### Checklist anti-404

- [x] Fichier **`.nojekyll`** à la racine (inclus dans ce repo)
- [x] **`index.html`** à la racine (obligatoire)
- [x] **Chemins relatifs** dans le HTML (`css/`, `js/`) — déjà OK
- [x] **Pas de chemins absolus** type `/css/style.css` (sinon 404 en sous-dossier)
- [x] **Casse respectée** : GitHub Pages est sensible à la casse (`CSS/` ≠ `css/`)
- [x] **`404.html`** custom (inclus dans ce repo) — évite la 404 générique de GitHub
- [x] **`robots.txt` + `sitemap.xml`** (inclus) — adaptez l'URL avec votre `<user>/<repo>`

#### Domaine custom (optionnel)

1. Achetez un domaine (ex. `dominoweb.fr` chez OVH)
2. **Settings** → **Pages** → **Custom domain** → `dominoweb.fr`
3. Chez le registrar, créez :
   - `CNAME` `www` → `<user>.github.io.`
   - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. Cochez **Enforce HTTPS** (peut prendre 24h)

### Option 4 — OVH / Hostinger (classique)

1. Achetez un hébergement + domaine
2. Uploadez tous les fichiers (sauf `README.md`) à la racine via FTP
3. C'est en ligne.

---

## Crédits & licences

- **GSAP** — GreenSock (licence gratuite standard)
- **Lenis** — Studio Freight (MIT)
- **Lucide Icons** — Lucide (ISC)
- **Web3Forms** — Web3Forms (gratuit, 250 emails/mois)
- **Fonts** — Google Fonts (Open Font License)

Aucune dépendance backend : tout fonctionne en statique.

---

## Prochaines étapes suggérées

- [ ] Créer / uploader une vraie scène Spline (ou laisser l'orb en fallback)
- [ ] Remplacer les projets fictifs par les vrais (visuels + liens)
- [ ] Ajouter un favicon dans `assets/favicon.svg`
- [ ] Open Graph image (1200x630px) pour les partages sociaux
- [ ] Brancher un vrai domaine
- [ ] Ajouter Google Analytics / Plausible si besoin
- [ ] Adapter `robots.txt` + `sitemap.xml` avec votre URL finale (`<user>` / `<repo>`)
- [ ] Vérifier le site en navigation privée (les caches font croire à des faux bugs)

---

**Conçu avec soin, depuis la France.** ☕

Contact : **dominolaverne24@gmail.com**
