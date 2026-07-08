# Le Bar Clandestin — Plan V2

> Préparé le 2026-07-07 · Base : `APP\WHISKY` (V1 corrigée du 06/07/2026, build OK)
> Dossier cible : `APP\WHISKY\V2` (copie indépendante, la V1 reste intacte à la racine)
>
> ✅ **RÉALISÉ le 2026-07-07** — toutes les étapes du §7 exécutées, tests navigateur du §7.6 passés (migration V1→V2, compteur, panier, bon de commande, texte généré, réception, import V1, exclusion sommelier à 0), `npm run build` OK. Preview « whisky-v2 » port 8191.

## 1. Objectifs

1. **Stock quantitatif** : remplacer le statut binaire « en stock / manquant » par un **nombre de bouteilles** par référence, modifiable en un geste (+ / −).
2. **Passer commande** : constituer un **bon de commande** (références + quantités), l'envoyer facilement (copie, partage, e-mail), puis **pointer la réception** pour mettre à jour le stock en un clic.
3. Zéro régression sur l'existant : sommelier, favoris, dégustation, import/export, accessibilité.

## 2. Périmètre

### Inclus
- Nouvel onglet **« Commande »** (3e onglet de navigation, avec badge du nombre de bouteilles commandées).
- Compteur **+ / − quantité** sur chaque ligne de l'inventaire (remplace la coche en stock/manquant).
- Bouton **panier** sur chaque ligne d'inventaire (ajoute 1 à la commande, badge de quantité).
- Vue Commande :
  - section **« En rupture »** : les références à quantité 0 non encore commandées, ajout en un clic ;
  - **bon de commande** éditable (quantités + / −, retrait d'une ligne) ;
  - actions : **Copier** le texte, **Partager** (navigator.share, repli presse-papiers), **E-mail** (mailto pré-rempli) ;
  - bouton **« Commande reçue »** : confirmation → les quantités commandées s'ajoutent au stock, la commande se vide.
- En-tête : « X Références • Y Bouteilles en Cave ».
- Migration automatique des données V1 (voir §4).

### Exclus (volontairement)
- Pas de compte caviste / envoi API : la « commande » reste un texte à transmettre (philosophie local-first, aucune dépendance réseau).
- Pas de prix ni de budget (ajout possible en V3 si besoin).
- Pas de suivi du niveau des bouteilles entamées.

## 3. Modèle de données

| Clé localStorage | Contenu | Statut |
|---|---|---|
| `whisky_custom_bottles` | bouteilles ajoutées (inchangé) | conservée |
| `whisky_favorites` | favoris (inchangé) | conservée |
| `whisky_v2_stock_qty` | `{ [id]: nombre ≥ 0 }` — **absence de clé = 1** (comme la V1 où tout est « en stock » par défaut) | nouvelle |
| `whisky_v2_order` | `{ [id]: quantité commandée ≥ 1 }` | nouvelle |
| `whisky_stock_status` | ancien booléen V1 | lue une fois pour migration, jamais réécrite |

- `owned` devient dérivé : `qty > 0` (le sommelier et la carte complète filtrent comme avant).
- Quantités bornées 0–99.

## 4. Migration V1 → V2

Au premier lancement : si `whisky_v2_stock_qty` est absente et `whisky_stock_status` présente, conversion `true → 1`, `false → 0`. Aucune donnée V1 n'est supprimée (retour arrière possible).

## 5. Import / Export

- Export : ajoute `stockQty` et `order` au JSON (en plus de `customWhiskies`, `favorites` ; `timestamp` conservé).
- Import : accepte les **deux formats** — un backup V1 (`stock` booléen, converti à la volée) ou V2 (`stockQty`/`order`) ; validation stricte étendue (maps de nombres finis ≥ 0).
- Le partage de liste (« Ma Cave ») affiche désormais `× quantité`.

## 6. UI / Design

- Même identité (noir/or, serif, chips existantes) — aucun nouveau langage visuel.
- Compteur de l'inventaire : pilule sombre `[−] 3 [+]`, quantité en ambre, **rouge à 0** ; ligne grisée à 0 (comportement V1 conservé).
- Badges (onglet Commande, panier de ligne) : pastille ambre, texte noir.
- Icônes lucide : `ShoppingCart`, `Minus`, `Copy`, `PackageCheck` (en plus de l'existant).
- A11y : boutons ≥ 44 px, `aria-label` explicites (« Ajouter une bouteille de X »), quantité annoncée, confirmation avant « Commande reçue ».

## 7. Étapes d'exécution

1. Copier la V1 dans `V2\` (index.html, package*.json, configs, src\, whisky-bar-caviste.jsx) + `npm install`.
2. Modèle : clés V2, migration, `allWhiskies` avec `qty`, validation backup étendue.
3. Inventaire : compteur + / −, bouton panier, reset stock adapté.
4. Vue Commande complète (ruptures, bon, actions, réception).
5. Import/export/partage mis à jour ; suppression d'une bouteille custom purge aussi stock + commande.
6. Preview « whisky-v2 » (port 8191) + tests navigateur :
   - migration V1→V2, stepper 0↔99, ligne grisée à 0 ;
   - ajout panier → badge onglet → édition du bon → texte généré correct ;
   - « Commande reçue » : stock incrémenté, commande vidée ;
   - export puis ré-import (V2), import d'un backup V1 ;
   - sommelier : les références à 0 n'apparaissent plus.
7. `npm run build` de la V2 + mise à jour mémoire.

## 8. Risques / points d'attention

- **localStorage partagé par origine** : en preview, V1 (8190) et V2 (8191) ont des stockages séparés — la migration ne se verra qu'en déploiement réel ou en copiant les clés. Test de migration simulé en injectant `whisky_stock_status` avant chargement.
- `mailto:` avec un long corps : certains clients tronquent au-delà de ~1 800 caractères — acceptable pour une commande de cave personnelle.
- Les entrées de commande orphelines (bouteille custom supprimée) sont filtrées à l'affichage et purgées à la suppression.
