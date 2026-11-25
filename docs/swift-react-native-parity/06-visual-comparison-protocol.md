# 06 — Protocole de comparaison visuelle Swift/RN

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · [Tests](./05-test-catalog.md) · **Protocole visuel** · [Acceptation](./09-manual-acceptance-checklist.md)

## Pourquoi un protocole strict est nécessaire

Une capture iPhone 17 Pro et une capture iPhone 17 Pro Max ne peuvent pas servir à conclure que toutes les fontes RN sont trop petites : les deux écrans ne possèdent pas les mêmes dimensions. De même, London et Paris, un nombre de notifications différent ou une Wishlist déjà remplie sont des différences d'état, pas forcément de UI.

L'objectif du protocole est de séparer :

- différence réelle de layout ;
- différence de modèle d'appareil ;
- différence de données serveur ;
- différence de localisation ;
- différence d'état connecté/invité ;
- différence de technologie UIKit/React Native acceptable.

## Environnement de référence

| Paramètre | Valeur obligatoire pour une comparaison finale |
|---|---|
| Device type | iPhone 17 Pro Max des deux côtés |
| Runtime | iOS 26.4.1 des deux côtés |
| Orientation | Portrait |
| Résolution | 1320 × 2868 |
| Appearance | Light |
| Taille de texte système | Default |
| Zoom display | Default |
| Langue | même langue, anglais pour la campagne actuelle |
| Compte | même compte test |
| Données | même seed/backend |
| Heure | idéalement captures dans la même minute |
| Localisation | même ville simulée, ou différence explicitement annotée |

Deux simulateurs séparés sont utilisés parce que Swift et RN partagent le bundle ID `com.ondeen.user`.

## Préparation des états

### État global

1. Construire et installer la version à comparer.
2. Utiliser le même backend.
3. Vérifier que les deux apps sont authentifiées avec le même compte.
4. Fermer onboarding, alerts système et modales transitoires.
5. Revenir à Home.
6. Vérifier que l'heure, le mode clair et le clavier n'altèrent pas l'écran.

### Home

- même catégorie sélectionnée : `All categories` ;
- aucun filtre non visible laissé actif ;
- même option Sort ;
- même ville si l'on compare les distances ;
- même ordre de seed events ;
- même état du cœur Wishlist du premier événement.

### Calendar

- même mois et année ;
- même jour courant système ;
- même dataset d'événements ;
- même position de scroll, avec le mois suivant visible de manière comparable.

### Bookings

- un booking upcoming connu ;
- un booking completed connu ;
- même tab sélectionné ;
- même compte et même seed afin que titres/images/dates correspondent.

### Notifications

- même nombre de notifications ;
- mêmes états seen/unseen ;
- filtre `All` sélectionné ;
- liste scrollée au sommet.

### Wishlist

- décider avant la capture si l'état attendu est vide ou rempli ;
- nettoyer l'état serveur si nécessaire ;
- attendre le rafraîchissement Home après ajout/suppression.

## Parcours de capture de référence

Le test `test42CoreScreenParity` capture dans cet ordre :

1. Home ;
2. Notifications ;
3. Calendar ;
4. Upcoming Bookings ;
5. Completed Bookings ;
6. Profile ;
7. Profile Settings.

Des scénarios ciblés complètent la série :

- `test36` : Event Details, Important Information, Facilities ;
- `test37` : Sort et Filters ;
- `test38` : Wishlist remplie puis vide ;
- `test39` : Location ;
- `test40` : Organizer Profile ;
- `test41` : Booked Event, Material, Q&A, Participants.

## Captures finales locales

Les captures ne sont pas versionnées. Les noms suivants permettent néanmoins de les retrouver dans la campagne locale `20260812-104413`.

### React Native — `test42-core-final-attachments`

| Écran | Fichier exporté |
|---|---|
| Home | `646C8843-F62A-4CA6-8FC8-E25C93A3D101.png` |
| Notifications | `60E75375-F167-435E-B315-C1B61BA2707C.png` |
| Calendar | `C1A96D74-6706-487F-A81C-AE93ED1D1F69.png` |
| Upcoming Bookings | `070C9FA7-E65D-4BBC-8FB5-B8A2DE914652.png` |
| Completed Bookings | `BD3EC0B8-3A56-44DD-BA1F-F195255D0B3E.png` |
| Profile | `6C3309E1-632A-439F-8778-31FD6E22AC62.png` |
| Profile Settings | `D0AD33C3-43DF-41E0-8228-DE78295CB80C.png` |

### Swift — `swift-max-core-parity-final-attachments`

| Écran | Fichier exporté |
|---|---|
| Home | `2D703FD5-5070-4BAC-9627-57DDF55D3287.png` |
| Notifications | `505A887A-8ACB-45DD-83C6-04CC5BB0F1E9.png` |
| Calendar | `50438AFF-EE22-4CF4-95D0-E2981FA91F06.png` |
| Upcoming Bookings | `73853BF5-C532-42E8-A28B-A937B61F794E.png` |
| Completed Bookings | `08AF0295-5BAC-4267-89FD-11C11161CBDA.png` |
| Profile | `68D132B4-B2BF-4A9E-91ED-5FDEE7749F5A.png` |
| Profile Settings | `81A30D64-6388-4927-9F07-83C4928DEA8F.png` |

Ces chemins sont des preuves locales et peuvent disparaître lors d'un nettoyage d'artifacts. La documentation durable est le protocole, le driver et les résultats résumés.

## Grille d'analyse d'une paire de captures

Pour chaque écran, comparer dans cet ordre :

1. **Frame système** : même appareil, safe areas et orientation.
2. **Structure** : mêmes blocs visibles et même ordre.
3. **Ancrage** : distances haut/bas/gauche/droite.
4. **Typographie** : famille, taille, graisse, interligne, casse.
5. **Contrôles** : hauteur, largeur, rayon, état sélectionné.
6. **Densité** : nombre de cartes et quantité de texte visibles.
7. **Icônes** : position, taille optique et couleur.
8. **Surfaces** : fonds, ombres, bordures, séparateurs.
9. **Contenu** : distinguer texte/donnée dynamique du layout.
10. **Interaction** : vérifier qu'un écran ressemblant mène aussi à la bonne destination.

## Classification d'un écart

| Classe | Exemple | Action |
|---|---|---|
| Bloquant fonctionnel | Sign in ne fait rien, Location crash | Corriger et ajouter une assertion |
| Majeur visuel | Filters avec structure entièrement différente | Restyler avant acceptation |
| Mineur visuel | Icône optiquement 1–2 pt différente | Ajuster lors de la finition |
| Donnée/état | London contre Paris, compteur différent | Normaliser ou annoter |
| Exception produit | Profile P0 RN différent | Conserver et documenter |
| Défaut Swift | overflow toolbar | Ne pas copier |

## Critère d'acceptation

Un écran peut être déclaré aligné si :

- la hiérarchie et les actions principales sont immédiatement reconnaissables ;
- aucun bloc majeur n'est absent ;
- les proportions, fontes et espacements ne créent pas une identité visuelle différente ;
- les données différentes sont expliquées ;
- l'interaction essentielle est testée ;
- toute exception volontaire figure dans la documentation.

La note globale d'environ 97 % vient de cette lecture produit. Elle ne doit pas être présentée comme un score algorithmique de pixels.

## Erreurs de comparaison à éviter

- comparer Pro à Pro Max ;
- comparer guest à authenticated ;
- juger un écran RN pendant le chargement contre Swift chargé ;
- comparer Wishlist vide à Wishlist remplie sans le signaler ;
- comparer une carte London à une carte San Francisco puis conclure à un problème de composant ;
- oublier que Swift et RN rasterisent les fontes différemment ;
- prendre un bouton visible pour preuve que l'action fonctionne ;
- corriger RN pour imiter un bug Swift connu.

---

Précédent : [05A — Chronologie des preuves](./05a-test-evidence-timeline.md) · Suite : [07 — Guide du driver iOS](./07-ios-ui-driver-guide.md)
