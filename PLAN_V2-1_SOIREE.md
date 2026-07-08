# Le Bar Clandestin — Plan V2.1 « Soirée »

> Préparé le 2026-07-08 · Base : V2 déployée (https://alemoine4.github.io/bar-clandestin/)
> Objectif : gérer les choix des invités pendant une soirée pour savoir quoi servir.
>
> ✅ **RÉALISÉ le 2026-07-08** (v0.3.0) — kiosque invité + tableau barman + file de préparation + exports + nouvelle soirée, tous les tests du §6.5 passés en navigateur. Inclut aussi la passe design demandée : midtones remontés d'un cran (bordures, textes, surfaces), CTA ambre plus francs, nav mobile sans débordement (flex-wrap + padding réduit).

## 1. Décision d'architecture

**localStorage, mode « un appareil qui circule »** (téléphone du barman ou tablette sur le bar).

| Critère | localStorage (retenu) | Supabase/Firebase (écarté pour l'instant) |
|---|---|---|
| Plusieurs téléphones | ❌ non | ✅ oui |
| Fonctionne sans wifi/4G | ✅ oui | ❌ non |
| Compte / clé API / config | aucun | compte + clé exposée + RLS à configurer |
| Complexité | ~0 | backend léger mais réel |
| Philosophie local-first | ✅ | ❌ |

Garde-fou : toutes les lectures/écritures passent par un petit **adaptateur de stockage** (`partyStore`) — 4 fonctions (lire, ajouter/modifier, changer statut, vider). Si le besoin multi-téléphones se confirme un jour, on écrit un driver Supabase derrière la même interface, sans toucher à l'UI.

## 2. Vue d'ensemble UX

Nouvel onglet **« Soirée »** (4e onglet, badge = nombre « à servir »). Il contient la face **barman** et lance la face **invité** :

### Face invité (plein écran, type kiosque)
1. Écran prénom : « Bienvenue au Bar Clandestin » + champ prénom (+ liste des prénoms déjà passés pour se retrouver en un clic).
2. Écran choix : cartes des whiskies **en stock uniquement** (nom, type, région, jauge tourbe, robe) + recherche. Gros boutons pensés pour être utilisés debout, verre à la main.
3. Confirmation : « C'est noté, [Prénom] ! [Whisky] arrive. » → bouton « Invité suivant » (retour écran 1).
- Un invité déjà enregistré qui revient voit son choix actuel et peut **le modifier**.
- Sortie du mode kiosque : bouton discret « barman » en bas (pas de mot de passe — soirée entre amis).

### Face barman (dans l'onglet Soirée)
- **Tableau récap** : Prénom · Whisky choisi · Heure (HH:MM) · Statut, tri « à servir d'abord puis par heure ».
- Bouton **« Servi » / « À servir »** (bascule) par ligne + modifier le whisky + supprimer l'invité.
- **File de préparation** : regroupement par whisky (« 2 × Laphroaig 10, 1 × Tomatin 12 ») pour préparer les verres par bouteille.
- Compteurs : X invités · Y à servir · Z servis.
- **Export CSV** (séparateur `;`, Excel FR : Prénom;Whisky;Heure;Statut) et **JSON**.
- **« Nouvelle soirée »** : vide la liste (avec confirmation + export automatique de sauvegarde JSON avant purge).
- Bouton **« Ouvrir le bar »** → lance le mode invité plein écran.

## 3. Modèle de données

Clé localStorage `whisky_v2_party` :
```json
[{
  "id": "guest-<uuid>",
  "name": "Marie",
  "whiskyId": "default-1",
  "chosenAt": "2026-07-08T21:34:00.000Z",
  "status": "pending" | "served",
  "servedAt": "…" | null
}]
```
- 1 invité = 1 choix courant (modifier = remplacer, `chosenAt` mis à jour, statut repasse « à servir »).
- Prénoms dédupliqués sans casse/accents (réutilise `normalizeText`).
- Whisky supprimé de la cave entre-temps → ligne conservée avec mention « (retiré de la cave) ».
- Export/backup global (bouton Sauvegarder existant) : la soirée est incluse (`party`) et validée à l'import.

## 4. Points d'intégration

- Liste proposée aux invités = `allWhiskies.filter(w => w.owned)` (déjà dérivé du stock quantitatif).
- Aucun décrément de stock au « servi » (un verre ≠ une bouteille) — hors périmètre, dit explicitement.
- Nav 4 onglets : padding réduit en mobile (`px-4 sm:px-8`) pour tenir sur petit écran ; libellés conservés.
- A11y : mêmes standards que le reste (44 px, aria-pressed sur statut, focus visible, live region pour la confirmation invité).
- Design : mêmes composants (pilules, chips, panneaux translucides sur le fond photo).

## 5. Exclusions volontaires

- Pas de Supabase/Firebase (voir §1) — architecture prête si besoin réel plus tard.
- Pas de mot de passe admin (soirée privée).
- Pas de multi-choix par invité ni d'historique multi-soirées (une soirée = une liste ; l'export JSON sert d'archive).
- Pas de décrément automatique du stock.

## 6. Étapes d'exécution

1. `partyStore` (adaptateur localStorage) + état React + validation backup étendue (`party`).
2. Onglet Soirée : tableau barman, file de préparation, compteurs, statuts, suppression.
3. Mode invité plein écran (prénom → choix → confirmation, modification d'un choix existant).
4. Exports CSV/JSON + « Nouvelle soirée » (backup auto avant purge).
5. Tests navigateur (port 8191) : parcours invité complet ×3 prénoms, modification d'un choix, doublon de prénom, bascule servi/à servir, file de préparation groupée, exports, nouvelle soirée, backup global incluant `party`, whisky supprimé de la cave.
6. Build + commit + push → déploiement auto GitHub Pages, vérification de l'URL en ligne.

## 7. Risques / attention

- **Un seul appareil** : si deux personnes ouvrent le site sur deux téléphones, chacun a SA liste (localStorage) — c'est le comportement attendu, à expliquer aux invités (« ça se passe sur la tablette du bar »).
- Onglet Soirée visible par les invités en mode kiosque ? Non : le kiosque est plein écran par-dessus, la sortie « barman » ramène à l'onglet Soirée.
- `Date.now()` vs fuseaux : stockage ISO UTC, affichage en heure locale (`toLocaleTimeString`).
