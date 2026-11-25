# 02 — Parité UI écran par écran

> Navigation : [Index](./index.md) · **UI écran par écran** · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · [Tests](./05-test-catalog.md) · [Acceptation](./09-manual-acceptance-checklist.md)

## Objet de ce document

Ce chapitre décrit la partie la plus visible du chantier : ce que React Native montrait avant, ce que Swift a fourni comme référence, ce qui a été changé, et comment le résultat a été vérifié.

Les captures fournies pendant le travail ont été complétées par des captures XCUITest sur deux iPhone 17 Pro Max identiques. La conclusion actuelle est une parité perceptible d'environ 97 % sur le périmètre comparé, avec quelques différences volontaires ou liées aux données.

## 1. Système visuel global

### Typographie

Le code Swift charge deux familles principales :

- `SFProRounded-*` pour le texte courant, les métadonnées, les boutons et les contrôles ;
- `FONTSPRINGDEMO-AllRoundGothic*` pour certains titres et éléments de marque.

Le mapping React Native a été corrigé pour pointer vers les vrais noms PostScript des fontes embarquées. Les graisses Regular, Medium, Bold et Black sont ensuite utilisées selon la hiérarchie Swift. La mise à l'échelle RN part d'une largeur de référence de 375 points, comme `Utils.size()` côté Swift.

Conséquence : la comparaison doit être faite sur le même appareil. Une capture iPhone 17 Pro comparée à une capture 17 Pro Max produit naturellement une différence globale de taille, même avec les mêmes proportions.

### Couleurs, surfaces et formes

| Élément | Référence retenue |
|---|---|
| Fond principal | lavande très clair, généralement `#F9F6FD` ou `#FDFBFF` selon l'écran |
| Accent | rose OnDeen autour de `#DB3171` |
| Texte | noir/brun très sombre, généralement `#161616` ou `#17101F` |
| Contrôles actifs | rose ou capsule gris-lavande |
| CTA | dégradé jaune/orange/rose/violet selon le bouton |
| Cartes | blanc ou fonds teintés, coins fortement arrondis |
| Bottom sheets | fond blanc, grands coins supérieurs arrondis |
| Séparateurs | lavande/gris très léger |

### Navigation principale

| Avant React Native | Référence Swift | Résultat React Native |
|---|---|---|
| Barre basse plate, sélection peu lisible et safe area différente | Pilule blanche flottante, quatre tabs, capsule grise derrière l'onglet actif | Barre absolue avec marges latérales, rayon 36, ombre, capsule active, icônes actives/inactives et labels SF Pro Rounded |

La tab bar est masquée sur les sous-écrans comme Event Details, Booking Details, Payment et Profile Settings, puis réapparaît sur Home, Calendar, Bookings et Profile.

Preuve : `test42CoreScreenParity`, exécuté sur RN puis Swift au même format.

## 2. Mode invité et authentification

### Bottom sheet `Continue to login`

| Avant RN | Swift | Après RN | État |
|---|---|---|---|
| Modale centrée `Confirm Login`, actions Yes/No | Sheet présentée depuis le bas avec une intention claire de connexion | Bottom sheet `Continue to login`, texte invité, `Not now` et `Continue`, overlay sombre et coins arrondis | Aligné visuellement et fonctionnel |

Le mode invité et le guest booking P0 ont été conservés. La sheet ne force pas une perte de l'état métier ; elle redirige vers le parcours d'authentification attendu.

### Login e-mail/password

| Avant RN | Swift | Après RN | État |
|---|---|---|---|
| Hero et composition différents ; le bouton pouvait ne rien faire ; `user` devenait `User` | Composition compacte, e-mail non capitalisé, CTA clair | Shell rapproché de Swift, `autoCapitalize="none"`, soumission Redux fiable, loader, erreurs visibles, double appui bloqué | Réparé |

Le login e-mail/password reste disponible même si Swift privilégie un autre ordre de connexion. Il s'agit d'une capacité utile de RN qui n'a pas été supprimée.

### E-mail OTP, mobile OTP, Apple et Google

| Zone | Référence/écart | Résultat RN |
|---|---|---|
| E-mail OTP | Swift utilise un écran compact ; l'ancien RN avait un arbre tactile difficile à piloter | Composition et champs rendus accessibles, navigation conservée |
| Mobile OTP | Présent dans les deux apps | Conservé, shell rapproché |
| Apple | Swift avait une vraie requête Apple ; l'ancien bouton RN lançait Google | Vraie intégration `appleAuth`, bouton et handler séparés |
| Google | Bouton distinct dans Swift | Handler Google conservé séparément |

Exception : le libellé Swift `Verify Phone` après un OTP e-mail n'a pas été copié, car il est faux.

## 3. Home et découverte

### Header Home

| Avant RN | Swift | Après RN |
|---|---|---|
| Ville préfixée ou disposition différente ; ordre Notifications/Wishlist inversé | Ville seule, Wishlist puis Notifications avec badge | Ville compacte, chevron, Wishlist puis Notifications, badge et espacements rapprochés |

La différence London/Paris/San Francisco aperçue sur certaines captures vient des données de localisation, pas du layout.

### Recherche et filtre

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Le `TextInput` non éditable pouvait intercepter l'appui du parent | Grande capsule blanche, icône Search, placeholder, bouton réglages | Surface tactile corrigée, même hiérarchie visuelle, route Global Search accessible | Audit de navigation + inspection |

La recherche n'a pas été réécrite : l'écran et ses services existaient déjà. Le point d'entrée a été réparé.

### Catégories

| Avant RN | Swift | Après RN |
|---|---|---|
| Dimensions, contours, ordre et pluriels variables | Cartes verticales étroites, illustration centrale, contours en dégradé, libellés sur deux lignes si nécessaire | `All categories`, `Community Services`, `Courses`, `Tours`, proportions et espacement horizontal rapprochés |

### Liste `HAPPENING AROUND YOU`

| Avant RN | Swift | Après RN |
|---|---|---|
| Écran parfois vide ; cartes plus grandes ou métadonnées dispersées | Liste dense : image, petite catégorie, date/heure, titre, organisateur, prix, distance/online et cœur | Fallback vers les événements publics, densité rapprochée, mêmes niveaux d'information, séparateurs et cœur accessible |

L'état `NO EVENTS FOUND` reste disponible lorsqu'aucune source exploitable n'existe. Il n'est plus affiché à tort lorsque des événements publics peuvent être montrés.

### Sort By

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Sheet courte avec cases carrées, deux boutons Close/Apply et gradient différent | Grande sheet basse, titre, fermeture X, radios à droite, un CTA `APPLY FILTERS` | Hauteur, rayons, liste, radios, X et grand CTA en dégradé rapprochés | `test37HomeSortAndFilters` passé |

Options couvertes : nearest distance, ongoing, upcoming, price high-to-low et low-to-high.

### Filters

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Sections très grandes, chips horizontales tronquées et footer déséquilibré | Écran compact : date, ticket type, journey chips multi-lignes, category, organiser, gender, footer fixe | Hiérarchie, grille de chips, cases, séparateurs, marges et doubles CTA rapprochés ; contenu scrollable | `test37HomeSortAndFilters` passé |

Les options dynamiques continuent de venir de l'API RN. L'alignement n'a pas remplacé la logique de filtre.

### Wishlist

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| État visuel/serveur parfois instable ; cœur enfant masqué dans l'arbre d'accessibilité | Liste de cartes verticales, header simple, état vide | Liste multi-type dédupliquée, cartes rapprochées, état vide avec `Explore Events`, cœur enfant accessible et état synchronisé | `test38WishlistRoundTrip` passé |

Le test vérifie l'ajout depuis Home, la présence dans Wishlist, la suppression et le retour du cœur Home à l'état initial. Ce n'est donc pas seulement une capture.

### Localisation

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Écran simulateur vide et crash natif `Animated node with tag ...` observé après appui | Search/Back, champ, carte MapKit, pin, CTA `SAVE & CONTINUE` | Header compact, champ, carte/fallback, pin, CTA bas en dégradé ; aucune erreur Animated sur le parcours final | `test39LocationLayout` passé |

Sur simulateur, RN conserve un fallback Londres/statique pour éviter un crash connu de `react-native-maps` sous l'ancienne architecture. Sur vrai iPhone, le sélecteur interactif reste prévu. Les distances absurdes observées dans Swift n'ont pas été copiées.

## 4. Calendar

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Titre parfois limité à l'année, lundi en premier, style Today non appliqué, tab bar plate | `August 2026`, semaine dimanche → samedi, dates d'événements marquées, mois suivant visible | Mois + année, dimanche en premier, today, dots, deux mois et tab bar Swift-like | `test42CoreScreenParity` RN + Swift passé |

Les événements restent reliés aux données RN. La mise en page a été rapprochée sans réimplémenter le moteur calendrier Swift.

## 5. Bookings

### Upcoming Bookings

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Carte, preview suivante, intitulé et proportions différents | Titre `My Bookings`, recherche, segmented control, heading, grande carte avec badge, image, titre, date, avatar et flèche | Même composition, dimensions et ordre d'information rapprochés | `test42CoreScreenParity` passé |

### Completed Bookings

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Présentation de ligne très différente | Ligne compacte avec image, date, titre, statut/métadonnées, participant et flèche | Ligne compacte alignée et onglet réellement ouvert | Assertion explicite `COMPLETED BOOKINGS` dans `test42` |

## 6. Détail d'événement

### Haut de page et onglets

| Avant RN | Swift | Après RN |
|---|---|---|
| Hero trop haut, contenu repoussé, tags et spacings différents | Header compact, segmented control `Details / Event Material / Q&A`, hero contenu, tags, prix et métadonnées denses | Header, tabs, hero, tags, prix `FREE`, date, horaire, journey level, CTA et organizer rapprochés |

Les actions RN existantes restent actives : wishlist, partage/deep link, add calendar, notes, request buddy, ticket et réservation.

### Overview, organisateur et lieu

La hiérarchie Swift a servi à regrouper l'organisateur, `VIEW INFO`, l'overview et la carte de localisation sans écraser les données RN. Le lieu peut afficher une carte native ou le fallback adapté à l'environnement.

### Important Information

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Section plate et serrée | Grande carte crème détachée des bords, rayon important, titre, sous-sections et séparateurs | Fond `#FFFBF1`, rayon 32, marges horizontales, padding interne et séparateurs rapprochés | `test36EventInformationAndFacilities` passé |

Sous-sections : Eligibility, What's included, Cancellation policy, Terms & Conditions.

### Facilities

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Liste plate, coins incohérents | Carte claire indépendante avec titre et lignes | Carte `#FDFBFF`, rayon 32, marge, overflow propre et lignes accessibles | `test36EventInformationAndFacilities` passé |

La suppression du conteneur interne aux rayons contradictoires évite les coins visuellement cassés.

## 7. Détail d'une réservation

### Event Material

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Cartes et état vide plus lourds | `MY NOTES`, ligne compacte avec flèche ; `FILES AND DOCUMENT`, état vide simple | Hiérarchie, capsules, espacement et wording rapprochés | Capture dans `test41BookedEventTabsAndParticipants` |

### Q&A

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| État vide et champ bas différents | État vide centré dans une carte, champ `Type a question...` en bas | Tabs, carte vide et composer bas rapprochés ; envoi RN conservé | Capture dans `test41` |

### Participants

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Barre de recherche très petite et marges différentes | Header simple et grande capsule Search | Header, largeur, hauteur, fond et placement de Search rapprochés | Écran ouvert et heading asserté dans `test41` |

### Notes, documents, liens et ticket

Ces fonctions existaient déjà dans RN et n'ont pas été retirées. Elles n'ont pas toutes un équivalent visible dans chaque capture Swift, mais restent accessibles dans le parcours Booking Details.

## 8. Organizer Profile

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Cartes plus grandes, identité et `About` espacés différemment | Avatar centré, identité, About, `All Active events`, deux cartes compactes | Proportions, titre, identité, about, grille et cartes rapprochés | `test40OrganizerProfileParity` passé |

Les informations e-mail/téléphone dépendent de la réponse serveur ; leur présence ne doit pas provoquer un déplacement majeur du layout.

## 9. Profile et Settings

### Profile — exception produit volontaire

Le runtime Swift montre un hero pastel avec photo, identité et trois statistiques, mais son bas d'écran est incomplet ou `Coming Soon`. Une première tentative de reprise du hero a été retirée à la demande du propriétaire du projet.

Résultat retenu :

- le Profile P0 React Native reste la source fonctionnelle ;
- progression, rang, XP, streak, OnDeen Radar et certificats restent visibles ;
- le bouton Settings reste bien accessible ;
- la différence avec Swift est documentée comme volontaire, pas comme oubli.

### Profile Settings

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Liste proche mais `Change password` non exposé au premier niveau, espacements différents | Liste compacte avec icônes, séparateurs et Delete Account | Edit Profile, One-to-One, Change password, Privacy, Help, Report, Logout et Delete Account alignés | Capture `test42` RN + Swift |

Le fond illustré RN reste discret. Les actions métier de logout et suppression de compte restent celles de RN.

## 10. Notifications

| Avant RN | Swift | Après RN | Validation |
|---|---|---|---|
| Liste descendue au milieu/bas, toolbar large, risque de débordement, types 8/9 absents | Header compact, filtres/action noirs, liste immédiatement dessous, cloche teintée | Liste en haut, contrôles compacts, alignement des cloches/textes/séparateurs ; types 8/9 ajoutés | `test42CoreScreenParity` RN + Swift |

Le débordement Swift de la dernière action n'a pas été reproduit. RN conserve en plus les URLs cliquables internes/externes du P0.

## 11. Résumé de couverture UI

| Groupe | Résultat |
|---|---|
| Shell, fontes, fonds, headers, tab bar | Aligné |
| Guest/auth | Aligné et réparé |
| Home/search/categories/cards | Aligné ; données publiques de repli ajoutées |
| Sort/Filters | Aligné et testé |
| Wishlist | Aligné et testé en round-trip |
| Location | Aligné sur simulateur, vrai appareil restant |
| Calendar | Quasi superposable sur appareil identique |
| Upcoming/Completed Bookings | Quasi superposable, onglets assertés |
| Event Details | Aligné, fonctions RN conservées |
| Important Information/Facilities | Aligné et testé après scroll |
| Material/Q&A/Participants | Aligné et testé |
| Organizer | Aligné et testé |
| Profile | Exception volontaire : P0 RN conservé |
| Settings | Aligné et testé |
| Notifications | Aligné, overflow Swift non copié |

## 12. Différences résiduelles acceptables

- contenu exact dépendant du serveur : ville, distance, compteur, date ou nombre d'événements ;
- rendu cartographique MapKit contre carte/fallback RN ;
- Profile P0 RN volontairement différent du Profile Swift incomplet ;
- légères différences de rasterisation des fontes entre UIKit et React Native ;
- quelques icônes provenant de bibliothèques différentes ;
- paiement Apple Pay non validé visuellement sur vrai Wallet ;
- tailles différentes si les captures ne viennent pas du même modèle d'iPhone.

Pour juger les écarts restants, appliquer le [protocole de comparaison visuelle](./06-visual-comparison-protocol.md), pas une comparaison de captures Pro contre Pro Max.

---

Précédent : [01 — Contexte et décisions](./01-context-and-decisions.md) · Suite : [03 — Fonctionnalités Swift ajoutées ou réparées](./03-swift-features-added-to-react-native.md)
