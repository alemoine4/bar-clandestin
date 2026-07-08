# Audit — Le Bar Clandestin (V2)

> Date : 2026-07-08 · Version auditée : 0.6.1 · Auditeur : Claude Code
> Périmètre demandé : santé du code, cas limites, dette technique, a11y résiduelle, sécurité.
> **Phases 1–4 = lecture seule. Aucune correction avant validation explicite (phase 5).**

## 1. Synthèse

L'application est **saine** : aucun constat 🔴 critique, aucune faille, aucun bug bloquant, aucune perte de données identifiée. Les flux principaux (Sommelier, Inventaire/stock, Commande, Soirée, import/export) fonctionnent et ont été retestés sans régression. Les trois constats majeurs sont **de la dette de maintenabilité, pas des bugs** : (1) le moteur de score est **dupliqué et divergent** entre Sommelier et Kiosque, (2) tout tient dans **un fichier de 2 758 lignes**, (3) quelques finitions d'accessibilité (ordre des titres) et de robustesse (échecs d'écriture silencieux). Score de consolidation : **16,5/20** — surtout du polish structurel.

## 2. Cartographie

```
V2/
├── index.html               Point d'entrée, <div id=root>, favicon ./logo-icon.png
├── src/
│   ├── main.jsx             Monte <WhiskyBarApp/> (React 19, StrictMode)
│   └── styles.css           Directives Tailwind
├── whisky-bar-caviste.jsx  ⚠️ 2 758 lignes — TOUTE l'app (données + composants + styles inline)
├── public/
│   ├── fond.jpg  (183 Ko)   Fond photo (body)
│   ├── logo.jpg  (63 Ko)    Logo d'en-tête
│   └── logo-icon.png (76 Ko) Favicon / apple-touch-icon
├── assets-src/             Originaux PNG (5 Mo) — gitignorés, conservés comme sources
├── vite.config.js          base:'./' (obligatoire GitHub Pages)
├── tailwind.config.js      content.relative + globs (fix cwd)
├── postcss.config.js       chemin absolu vers tailwind.config (fix cwd)
├── .github/workflows/deploy.yml  Déploiement auto GitHub Pages sur push main
└── PLAN_V2*.md, README.md  Docs

Flux de données : saisie (formulaire / kiosque) → état React → useLocalStorage → localStorage.
Export/Import JSON global (bouton Gestion). Aucun réseau à l'exécution.
```

**Dépendances** : `react`, `react-dom`, `lucide-react` — **toutes bundlées par Vite**. **Aucun CDN, aucune URL runtime** → hors-ligne garanti après build. ✅
**Fichiers morts** : aucun. `assets-src/` = originaux volontairement gardés (gitignorés). Pas de copies/backups parasites.
**Clés localStorage (contrat à préserver)** : `whisky_custom_bottles`, `whisky_v2_stock_qty`, `whisky_v2_order`, `whisky_v2_party`, `whisky_favorites`, `whisky_selectedProfiles`, `whisky_selectedMoods`, + `whisky_stock_status` (V1, lue seule pour migration).

## 3. Constats

| ID | Axe | Priorité | Emplacement | Description | Impact |
|----|-----|----------|-------------|-------------|--------|
| A1 | Robustesse | 🟢 | `useLocalStorage` l.82-91 | Un échec de `setItem` (quota plein) est seulement `console.error`, sans toast. L'état revient à `prev` silencieusement. | Une modif pourrait ne pas être sauvée sans que l'utilisateur le voie. Probabilité très faible (données petites). |
| A2 | Robustesse | 🟢 | `isValidWhisky` l.42 / import l.1675 | L'import ne bloque pas une bouteille custom dont l'`id` collisionne avec le catalogue (`default-*`). | Clé React dupliquée + lookups owned/favori ambigus. Improbable (ids générés `custom-<uuid>`). |
| A3 | Robustesse | 🟢 | champs `name` (invité l.~806, bouteille l.~1240) | Aucun `maxLength` sur les noms saisis. | Un nom très long peut déborder/casser une carte. Cosmétique. |
| A4 | Maintenabilité | 🟠 | Sommelier l.1917-1940 **et** Kiosque l.807-820 | **Scoring dupliqué ET divergent** : Sommelier pondère (ambiance ×4 > arôme ×3 + bonus favori) ; Kiosque compte +1 égalitaire par tag, sans bonus. | Changer la logique d'un côté ne suit pas l'autre → reco incohérente entre les deux vues, et double maintenance. |
| A5 | Maintenabilité | 🟠 | `whisky-bar-caviste.jsx` (2 758 l.) | Fichier unique ; le composant `WhiskyBarApp` fait ~1 000 lignes. Données, composants et logique mélangés. | Navigation/relecture difficile, risque d'erreur à chaque évolution. (Découpage en modules reste 100 % compatible Vite — pas de changement de stack.) |
| A6 | Maintenabilité | 🟢 | `readInitialStock` l.165-169 | Relit et re-parse `whisky_v2_stock_qty` alors que `useLocalStorage` le refait juste après (l.1516). | Double lecture/parse redondante au montage. Sans effet visible. |
| A7 | Accessibilité | 🟢 | Liste Inventaire l.~2285 | Noms de bouteilles en `<h4>` directement sous le `<h1>` de page (saut de h2/h3). | Ordre des titres non conforme (best practice WCAG). Lecteurs d'écran : navigation par titres bancale. |
| A8 | Accessibilité | 🟢 | Kiosque l.~912, Dégustation l.~648 | Plusieurs `<h1>` selon les overlays (« Pour X », nom du whisky). | Acceptable (contextes modaux isolés par `inert`), mais techniquement > 1 h1. |
| A9 | Performance | 🟢 | Kiosque `filteredWhiskies` l.795 | Recherche du kiosque non *debouncée* (l'inventaire l'est via `useDebounce`). | Négligeable sur 14 bouteilles ; à surveiller si le catalogue grossit. |

**Sécurité — RAS (à souligner)** : pas d'injection HTML brute (aucune écriture `innerHTML`, pas d'`eval`), données rendues comme texte (React échappe), import validé par type + plafond de taille (1 Mo), pas de CDN, pas de secret en dur. Modèle 100 % local respecté.

## 4. Plan d'action par lots

### Lot 1 — 🔴 Critique
**Aucun.** Rien à corriger en urgence.

### Lot 2 — 🟠 Important (dette structurelle)
- **A4 — Centraliser le scoring.** Extraire une fonction pure `scoreWhisky(whisky, { profiles, moods, favorite })` unique, utilisée par le Sommelier ET le Kiosque (le Kiosque peut ignorer le bonus favori via un paramètre). Décision à prendre : le Kiosque adopte-t-il la pondération du Sommelier (recommandé, cohérence) ou garde-t-il l'égalitaire ?
  - Estimation : **~25 min, 1 fichier**. Régression : **moyenne** (touche les 2 moteurs). Test : multi-filtre Sommelier (Cosy+Sherry → % + alternatives) **et** Kiosque (Doux+Épicé → doubles-matches en tête), aucun résultat vide.
- **A5 — Découper le fichier.** Sortir dans des modules séparés : `data.js` (DEFAULT_WHISKIES, TASTE_PROFILES, MOODS…), `storage.js` (useLocalStorage, migration, validation), `components/` (Modal, SearchInput, WhiskyCard, GuestKiosk, ServingScreen…). `whisky-bar-caviste.jsx` ne garde que `WhiskyBarApp`.
  - Estimation : **~50 min, ~8 fichiers**. Régression : **moyenne** (recâblage imports/exports). Test : build OK + smoke test des 4 vues + import/export.
  - ⚠️ Gros refactor structurel invisible pour l'utilisateur final — à ne lancer que si tu comptes faire évoluer l'app.

### Lot 3 — 🟢 Améliorations (rapides, risque faible)
- **A7** — Passer les noms de bouteilles de l'Inventaire en `<h3>` (ou ajouter un `<h2>` de section « Ma cave »). ~5 min, 1 fichier.
- **A1** — Toast d'erreur si `setItem` échoue (quota). ~10 min, 1 fichier.
- **A6** — Simplifier `readInitialStock` / éviter la double lecture. ~10 min, 1 fichier.
- **A3** — `maxLength` sur les champs nom (invité + bouteille). ~5 min, 1 fichier.
- **A2** — Forcer un `id` neuf sur les bouteilles importées en collision avec `default-*`. ~10 min, 1 fichier.
- **A9** — *Debounce* la recherche du kiosque (réutiliser `useDebounce`). ~5 min, 1 fichier.
- **A8** — Rétrograder les `<h1>` d'overlay en `<h2>` (ou garder — acceptable). ~5 min, 1 fichier.

## 5. Validation

Correctifs validés le 2026-07-08 : **A4 + lot 🟢 (A1, A2, A3, A6, A7, A9), sans A5**. Kiosque aligné sur la pondération du Sommelier. Backup dans `archives\2026-07-08\`. Testés navigateur (Sommelier %, Kiosque doubles-matches, debounce, migration V1, import anti-collision, Commande, Soirée) — aucune régression.

- [x] **A1** — Toast si échec d'écriture localStorage 🟢 — *corrigé 2026-07-08* (événement `ls-write-error` + écouteur)
- [x] **A2** — Anti-collision d'`id` à l'import 🟢 — *corrigé 2026-07-08*
- [x] **A3** — `maxLength` sur les noms 🟢 — *corrigé 2026-07-08* (invité 40, bouteille 80)
- [x] **A4** — Centraliser le scoring Sommelier/Kiosque 🟠 — *corrigé 2026-07-08* (`scoreWhisky`, Kiosque adopte la pondération)
- [ ] **A5** — Découper le fichier en modules 🟠 — *non retenu (refactor optionnel)*
- [x] **A6** — Supprimer la double lecture de stock 🟢 — *corrigé 2026-07-08*
- [x] **A7** — Corriger l'ordre des titres (Inventaire) 🟢 — *corrigé 2026-07-08* (h2 sr-only « Ma cave » + noms en h3)
- [ ] **A8** — Rétrograder les h1 d'overlay 🟢 — *non retenu (acceptable)*
- [x] **A9** — Debounce recherche kiosque 🟢 — *corrigé 2026-07-08*
