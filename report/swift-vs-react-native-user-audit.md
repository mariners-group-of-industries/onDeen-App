# Audit de parité OnDeen User — Swift vers React Native

> **Statut : audit initial avant implémentation.** Les mentions « absent »,
> « manquant » ou « cassé » décrivent l'état observé le 11 août 2026. Pour
> l'état actuel, les corrections livrées et les tests finaux, consulter le
> [rapport de livraison Swift → React Native](./swift-react-native-parity-delivery-report.md)
> et la [documentation complète de parité](../docs/swift-react-native-parity/index.md).

Date de l'audit : 11 août 2026  
Applications comparées : `OnDeenUserSwiftApp` et `OnDeenUser`  
Document de périmètre protégé : `ondeen-v2-p0-scope.md`

## 1. Verdict

L'application React Native n'est pas « une autre application » sur le plan fonctionnel. Elle contient déjà la grande majorité des parcours visibles dans l'application Swift, appelle les mêmes familles d'API et ajoute les fonctionnalités P0 développées depuis le scope V2.

La bonne stratégie n'est donc pas de jeter ou de réécrire `OnDeenUser`. Il faut :

1. prendre l'application Swift comme référence visuelle pour les écrans où elle est réellement meilleure ;
2. conserver React Native comme base fonctionnelle et comme source de vérité pour le P0 ;
3. ajouter les quelques fonctions Swift réellement absentes ;
4. ne pas recopier les écrans Swift cassés, incomplets ou trompeurs.

Les écarts les plus importants sont concentrés :

- authentification : parcours initial, véritable Sign in with Apple et présentation OTP ;
- paiement iOS : Apple Pay est présent dans Swift, mais absent du paiement React Native ;
- entrée de recherche Home : écran existant dans React Native, mais l'appui n'a pas fonctionné pendant le test iOS ;
- navigation : barre d'onglets flottante Swift et quelques actions manquantes ;
- Calendar : en-tête, jour courant, premier jour de semaine et présentation des événements ;
- détails d'événement : proportions de l'image et densité typographique ;
- routage de deux types de notifications ;
- accès plus direct à Change Password.

Le profil React Native, les parcours P0 et plusieurs comportements métier sont déjà meilleurs que leurs équivalents Swift. Ils doivent être protégés explicitement pendant la synchronisation.

## 2. Méthode et niveau de preuve

L'audit combine quatre sources :

- lecture du scope P0, du rapport fonctionnel, du guide de test et des notes iOS/Android ;
- inventaire complet des sources des deux applications ;
- comparaison des routes, écrans, services et endpoints ;
- compilation, lancement et parcours manuel des deux apps sur le même simulateur.

Environnement visuel commun :

- iPhone 17 Pro Max ;
- iOS 26.4 ;
- même compte de test et mêmes données serveur ;
- applications installées l'une après l'autre, car elles partagent le bundle ID `com.ondeen.user`.

Les preuves visuelles sont locales et ignorées par Git :

- [Swift — Home authentifié](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-07-authenticated-home.png)
- [Swift — Calendar](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-08-calendar.png)
- [Swift — Bookings](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-09-bookings.png)
- [Swift — Profile](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-10-profile.png)
- [Swift — Event detail](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-14-event-detail.png)
- [Swift — Booking detail](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-15-booking-detail.png)
- [React Native — Home authentifié](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/432A7383-843B-41EC-B405-15CB839B3DF4.png)
- [React Native — Calendar](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/59292AD5-BB8E-4D6D-A5BD-9F26D3786347.png)
- [React Native — Bookings](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/39265AFF-3BE2-4980-9994-358A22F127B7.png)
- [React Native — Profile](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/108BD9BE-D722-4DFF-A9B2-749DD760BBB8.png)
- [React Native — Event detail](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/A98942CA-7EE0-4DA4-B549-F76DE5218132.png)
- [React Native — Booking detail](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/E7EC4109-9143-4B39-8C64-CA429FA40BD0.png)

## 3. Taille, architecture et couverture API

| Sujet | Swift | React Native | Conclusion |
|---|---|---|---|
| Sources principales | 288 fichiers Swift, environ 37 808 lignes | 342 fichiers JS/TS, environ 56 479 lignes | Les deux sont des applications importantes, pas des prototypes |
| Écrans | 48 classes `UIViewController` repérées | 45 dossiers d'écrans, plus composants et modales | Surface comparable |
| UI | UIKit, Storyboards et XIB | React Native 0.78, React 19 | Il faut reproduire le rendu, pas traduire le code ligne par ligne |
| État/navigation | MVC, singletons et contrôleurs UIKit | Redux Toolkit/Persist et React Navigation | React Native est mieux placé pour conserver les ajouts P0 |
| iOS minimum | iOS 13 | iOS 15.3 | À garder en tête pour la cible produit |
| Endpoints Swift | 53 valeurs enregistrées dans `APIPath` | équivalents statiques ou dynamiques trouvés pour les 53 | Aucun manque d'API Swift évident côté RN |
| Endpoints supplémentaires | aucun P0 récent repéré | guest booking/migration, check-in, gamification, feedback, debug, version, etc. | React Native est un superset du P0 utilisateur |

La couverture d'endpoint signifie qu'un appel équivalent existe dans les sources React Native. Elle ne garantit pas, à elle seule, que chaque réponse ou cas d'erreur se comporte exactement comme Swift. Les parcours critiques devront être validés après synchronisation.

Deux points d'architecture demandent une attention particulière :

- les deux apps contiennent des versions anciennes et nouvelles de certains détails d'événement ; il faut modifier seulement les routes réellement actives ;
- React Native utilise encore l'ancienne architecture iOS. La solution de repli cartographique du simulateur est volontaire et ne doit pas être retirée sans migration/test sur appareil réel.

## 4. Comparaison écran par écran

### 4.1 Premier lancement, mode invité et demande de connexion

**Swift**

- écran de connexion plein écran avec hero en dégradé ;
- téléphone mis en avant en premier ;
- boutons séparés pour e-mail, Apple, Google et Skip ;
- navigation visuellement plus proche de ce que le Product Owner considère comme l'app de référence.

**React Native**

- visite guidée en six étapes au premier lancement, absente de Swift ;
- mode invité fonctionnel ;
- un appui invité sur Calendar/Profile ouvre une modale `Confirm Login` avec Yes/No ;
- l'intention correspond au parcours décrit, mais le titre et les libellés ne reprennent pas exactement `Continue to login` / `Continue with email`.

**Action recommandée**

Conserver le mode invité, le tour d'accueil et surtout le guest booking P0. Reprendre la hiérarchie visuelle et les libellés attendus par le PO, sans supprimer les capacités supplémentaires de React Native.

Preuves : [Swift login](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-04-login.png), [RN modale invité](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-step-04-continue-login.png), [RN login](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-step-05-login.png).

### 4.2 Authentification e-mail, téléphone, Apple et Google

**Parité existante**

- e-mail/password ;
- e-mail OTP ;
- mobile OTP ;
- Google Sign-In ;
- création et récupération de mot de passe.

**Écarts réels**

- Swift est phone-first. React Native ouvre d'abord l'écran e-mail/password.
- Swift possède une intégration Apple native via `AuthenticationServices`.
- Sur iOS, React Native affiche `Continue with Apple`, mais utilise l'icône Google et appelle le handler Google. Il ne s'agit pas d'un Sign in with Apple.
- Swift sépare correctement Apple et Google.
- L'écran e-mail OTP Swift est compact ; React Native utilise un grand hero qui change fortement la perception de l'app.
- Le conteneur tactile de la page e-mail OTP React Native fusionne mal l'arbre d'accessibilité : le champ était visible, mais pas ciblable correctement par XCTest.
- Swift contient aussi un défaut : après un OTP e-mail, le titre affiché est `Verify Phone`. Il ne faut pas recopier ce texte.

**Action recommandée**

Reproduire l'ordre et la composition Swift, implémenter un véritable bouton Apple distinct, conserver e-mail/password comme option additionnelle et corriger l'accessibilité des champs OTP.

Preuves : [Swift e-mail](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-05-email-login.png), [Swift OTP](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-06-email-otp.png), [RN e-mail OTP](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-step-06-email-otp-login.png).

### 4.3 Home

La structure React Native est déjà très proche de Swift : localisation, recherche, catégories, listes horizontales, cartes d'événement, wishlist, notifications et onglets principaux.

Différences visibles :

- Swift affiche une barre d'onglets flottante en forme de pilule, avec capsule grise sur l'onglet actif ; React Native utilise une barre plate.
- Swift place Wishlist avant Notifications ; React Native inverse les deux icônes.
- Swift utilise une typographie légèrement plus forte et plus dense.
- Quelques libellés diffèrent : `Community Services`/`Tours` contre `Community Service`/`Tour`.
- Swift affiche seulement la ville ; React Native préfixe par `In`.
- Sur le simulateur, Swift a utilisé San Francisco et a affiché des distances incohérentes pour les événements de Londres. Le repli React Native sur Londres donne ici une information plus utile.

**Décision**

Il s'agit d'un travail de finition, pas d'une reconstruction. Reprendre la barre flottante, l'ordre des icônes, les tokens typographiques et les libellés. Conserver la meilleure gestion de localisation RN.

### 4.4 Recherche et filtres

Les deux apps possèdent une recherche globale, un historique, des résultats et des filtres. L'endpoint de search history existe aussi dans React Native, bien qu'il soit assemblé dynamiquement et n'apparaisse pas comme une constante simple.

Pendant le test :

- l'écran de recherche Swift s'est ouvert ;
- plusieurs appuis réels et accessibles sur la zone de recherche Home React Native n'ont pas changé d'écran ;
- la capture nommée `rn-step-15-search` est donc encore la Home, pas le résultat attendu.

La cause probable est le `TextInput` non éditable imbriqué dans un `Pressable` dans `SearchInput.jsx`, le champ enfant interceptant l'appui sur iOS. L'écran `GlobalSearch` et ses services existent déjà.

**Action recommandée**

Corriger le point d'entrée tactile et ajouter un test de navigation Home → Search. Ne pas réécrire la recherche.

Preuves : [Swift Search](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-16-search.png), [RN tentative Search](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/CCF954BD-D022-4CEC-9FBC-AFC07FF1F3B5.png).

### 4.5 Détail d'événement

Le contenu métier est déjà en parité : image, tags, prix, date, journey level, organisateur, overview, carte, wishlist/share et CTA de réservation.

Écarts visuels :

- le hero React Native est environ deux fois plus haut sur le même appareil ;
- il repousse l'overview et la carte beaucoup plus bas ;
- l'ordre et la casse des tags diffèrent ;
- Swift utilise une hiérarchie typographique plus compacte ;
- le CTA collant existe dans les deux apps.

**Action recommandée**

Réduire le hero et aligner spacing, casse, ordre des tags et typographie. Conserver le routing, le partage/deep link et les actions RN.

### 4.6 Wishlist

La wishlist existe dans les deux applications. L'état vide Swift testé affiche simplement `NO RESULTS FOUND`. React Native a déjà le bouton wishlist réutilisable, la liste et le comportement connecté/invité.

Il n'y a pas de fonctionnalité Swift majeure à ajouter ici. L'alignement concerne surtout le shell, le header et les états visuels.

Preuve : [Swift Wishlist vide](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-18-wishlist.png).

### 4.7 Calendar

**Swift**

- titre complet `August 2026` ;
- jour courant mis en rose ;
- semaine affichée dimanche en premier dans le runtime ;
- bouton de changement de présentation en haut à droite ;
- événements affichables dans une liste/grille intégrée ;
- barre d'onglets flottante.

**React Native**

- titre limité à `2026` ;
- lundi en premier via `firstDay={1}` ;
- styles `todayContainer`/`todayText` présents, mais non appliqués dans le custom day rendu ;
- dates avec événements correctement marquées ;
- appui sur une date ouvrant une bottom sheet ;
- absence du switch Swift ;
- barre d'onglets plate.

**Action recommandée**

Aligner le mois/année, le jour courant, le premier jour de semaine et le switch de vue. Le Product Owner doit choisir si l'interaction finale est la liste intégrée Swift ou la bottom sheet RN ; pour une parité maximale, la liste intégrée est la référence.

### 4.8 Bookings et détail d'une réservation

La parité est forte : onglets active/upcoming et completed, cartes horizontales, détails, Event Material, Q&A, ajout au calendrier, menu, ticket, request buddy, organisateur et overview.

Différences restantes :

- Swift dit `Upcoming Bookings`, React Native `Active Bookings` ;
- Swift possède une icône de recherche en haut à droite ;
- dimensions des cartes, aperçu de la carte suivante et graisse des textes ;
- quelques différences de casse et d'icônes dans le détail.

Le détail React Native est déjà suffisamment proche pour être restylé localement. Il ne doit pas être remplacé.

### 4.9 Ticket, QR, téléchargements, matériel, Q&A et notes

Ces capacités existent dans les deux bases : affichage du ticket, QR codes, téléchargement, matériel d'événement, Q&A et notes. React Native possède aussi l'écran de code de check-in P0.

Attention au libellé Swift `Add to Wallet` :

- dans un contrôleur, l'action ferme seulement l'écran ;
- dans un autre, l'action appelée `addAppleWallet` ajoute en réalité l'événement au calendrier via EventKit.

Ce n'est pas une vraie intégration Apple Wallet/PassKit à prendre comme modèle.

### 4.10 Profile

Le haut du profil Swift est une bonne référence visuelle : grand hero en dégradé, photo, identité et statistiques Journey/Events/Courses.

En revanche, son bas d'écran est visuellement inachevé dans le runtime : engrenages/illustrations mal rendus et blocs `Coming Soon`.

Le profil React Native est nettement plus riche et cohérent avec le P0 :

- rang actuel ;
- XP et niveau ;
- streak ;
- lifetime progress ;
- certificats ;
- OnDeen Radar ;
- carte de progression structurée.

**Décision recommandée**

Créer un profil hybride : reprendre le hero/identité Swift si c'est le rendu validé par le PO, puis conserver toutes les cartes de progression React Native. Ne jamais remplacer le corps P0 par le `Coming Soon` Swift.

### 4.11 Profile Settings et compte

Présents dans les deux apps : edit profile, one-to-one, privacy, help/support, report issue, logout et delete account.

Écart : Swift montre `Change password` directement dans Profile Settings. React Native possède déjà la route et l'écran `ChangePassword`, et l'édition de profil peut y naviguer, mais l'option n'est pas exposée au même niveau dans la liste principale.

**Action recommandée**

Ajouter l'entrée directe dans Profile Settings, sans recréer l'écran.

Preuves : [Swift Settings](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-11-profile-settings.png), [RN Settings](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/74E7CA3A-900D-4822-805F-CDF468A10496.png), [Swift Help](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-12b-help-support.png).

### 4.12 Notifications

Les deux écrans sont proches et partagent même un défaut visuel : l'action `Mark as Seen All` déborde/se coupe dans le header sur le grand simulateur.

Swift route les types numériques :

- 2 vers Event detail ;
- 4 vers One-to-One ;
- 3, 5, 6, 7 vers Booking detail ;
- 8 vers une réservation completed ;
- 9 vers l'onglet Q&A du booking.

React Native route 2 à 7, mais pas 8 et 9. Le composant contient aussi deux fois la prop `onPress`, ce qui doit être nettoyé.

En revanche, le P0 React Native est plus avancé pour les liens présents dans le texte d'une notification :

- extraction des URLs ;
- distinction lien OnDeen/lien externe ;
- ouverture interne sécurisée ou navigateur ;
- indication visuelle des liens externes.

**Action recommandée**

Ajouter les types 8/9, corriger le header et préserver entièrement le système de liens P0.

Preuves : [Swift Notifications](../OnDeenUserSwiftApp/artifacts/ios-ui-tests/20260811-185946/swift-step-17-notifications.png), [RN Notifications](../OnDeenUser/artifacts/ios-ui-tests/20260811-185946/rn-screen-attachments/4281F278-AB32-448E-9ECF-AC7B86C1BE1F.png).

### 4.13 Paiement

**Swift**

- carte via Stripe ;
- Apple Pay via `PassKit` et `PKPaymentAuthorizationViewController` ;
- création d'un PaymentMethod Stripe ;
- confirmation du PaymentIntent ;
- mise à jour du statut backend.

**React Native**

- carte via Stripe PaymentSheet ;
- Google Pay uniquement sur Android ;
- sur iOS, Google Pay est désactivé et le parcours retombe sur la carte ;
- aucune configuration Apple Pay trouvée dans `initPaymentSheet` ni ailleurs.

**Conclusion**

Apple Pay est une vraie fonctionnalité Swift manquante dans React Native. Elle est distincte du Google Pay demandé par le P0. La présence du code Swift a été vérifiée, mais le paiement Apple Pay complet n'a pas pu être exécuté avec l'événement gratuit disponible et le simulateur.

### 4.14 Localisation et cartes

Swift utilise MapKit et `MKLocalSearchCompleter`. React Native possède la recherche de lieu, la géolocalisation, Google Places/Geocoding et les cartes.

Sur le simulateur iOS, React Native utilise volontairement un fallback Londres/carte statique pour éviter un crash connu de `react-native-maps` sous l'ancienne architecture. Sur un vrai iPhone, le sélecteur reste activé.

Il ne s'agit pas d'un manque de fonctionnalité Swift → RN. La suppression du fallback sans validation appareil réel créerait un risque de régression.

### 4.15 Organizer, speaker, one-to-one et memberships

Les profils organizer/speaker, one-to-one/request buddy et les écrans de membership existent dans les deux sources. Certaines entrées membership sont cachées ou commentées dans les deux runtimes, donc elles ne constituent pas un écart Swift visible à reproduire immédiatement.

## 5. Fonctions Swift réellement manquantes ou cassées dans React Native

### Priorité critique

| Écart | Nature | Travail recommandé |
|---|---|---|
| Sign in with Apple réel | Fonction absente | Intégration native RN + backend/provider, bouton Apple distinct |
| Apple Pay | Fonction absente | Configurer Stripe/merchant/capabilities iOS et valider webhook/statut métier |
| Recherche Home non ouvrable pendant le test | Bug probable | Corriger la cible tactile et ajouter un test de navigation |
| Authentification visuellement différente | Parité produit | Passer au phone-first Swift, garder les autres méthodes disponibles |
| OTP e-mail peu accessible | Qualité fonctionnelle | Défusionner l'arbre tactile, labels/accessibility IDs, test clavier/OTP |

### Priorité haute

| Écart | Nature | Travail recommandé |
|---|---|---|
| Notifications types 8 et 9 | Routage absent | Completed booking et sélection automatique du Q&A |
| Change Password non visible au premier niveau | Navigation | Rebrancher la route existante dans Settings |
| Calendar | Visuel + comportement | Mois/année, aujourd'hui, semaine, switch et liste intégrée |
| Barre d'onglets | Design global | Pilule flottante et capsule active sur les quatre tabs |
| Event hero | Design | Réduire hauteur, réaligner tags/typographie/spacing |

### Priorité de finition

- ordre Wishlist/Notifications ;
- catégories au pluriel et cohérence des libellés ;
- `Upcoming Bookings` et recherche Bookings ;
- typographie, graisse et densité communes ;
- headers, icônes et états vides ;
- correction du débordement `Mark as Seen All` dans les deux références.

## 6. Fonctionnalités React Native/P0 à protéger

Ces éléments ne doivent pas disparaître pendant la synchronisation visuelle :

- gamification : rang, XP, niveaux, streak, lifetime et certificats ;
- résumé/milestones et états `seen` ;
- feedback de session et possibilité de skip ;
- guest booking et migration après connexion ;
- code de check-in en ligne ;
- profil P0 inspiré du design Stitch ;
- liens cliquables OnDeen et externes dans les notifications ;
- partage d'événement et décodage des deep links/universal links ;
- redirection vers l'événement après connexion ;
- sécurité de repli de la carte iOS Simulator ;
- détails Bookings, Q&A, material, notes, tickets et request buddy ;
- onboarding/tour si le produit souhaite le garder ;
- compatibilité Android de chaque composant partagé.

Le scope paiement transverse implique aussi l'app Organiser et le backend. Une modification du paiement User ne doit pas être déclarée terminée sans validation PaymentIntent, webhook, booking durable et statut côté organisateur.

## 7. Défauts Swift à ne pas recopier

- profil inférieur incomplet avec `Coming Soon` et visuels cassés ;
- titre `Verify Phone` après une demande OTP par e-mail ;
- header Notifications qui déborde ;
- `Add to Wallet` qui ne crée pas de pass Wallet ;
- localisation de simulateur produisant des distances très éloignées des données testées ;
- logs qui impriment le token d'autorisation dans `APIManager.swift` ;
- coexistence d'anciens/nouveaux contrôleurs qui augmente le risque de modifier le mauvais écran ;
- absence de cible de tests applicatifs automatisés clairement exploitable dans le projet Swift.

La règle proposée est : Swift est la référence de look-and-feel validée par le PO, pas une vérité technique absolue.

## 8. Cohérence du scope P0 et dette de test

### État du P0 observé

- les fonctionnalités utilisateur non-paiement documentées sont présentes dans React Native ;
- Google Pay reste incomplet selon le scope et doit être validé sur Android réel/émulateur compatible ;
- Stripe Connect/wallet/payout côté organiser/backend reste hors de ce seul audit User ;
- le raccourci de complétion de booking est un outil de debug, pas un comportement de production ;
- le guide P0 indique `Profile settings → Debug stuff`, mais `P0DebugScreens` n'est enregistré dans aucun navigator actuel : le guide est devenu obsolète sur ce point ;
- `ChangePassword` existe bien, même si son entrée directe manque dans Profile Settings.

### Résultats techniques

- build et lancement Swift : réussis ;
- build et lancement React Native iOS : réussis avec bundle JavaScript ;
- connexion et parcours authentifié des quatre tabs : réussis ;
- lint React Native : non exécutable, car le script ESLint ne trouve pas de configuration ;
- test Jest : échec avant exécution des assertions, à cause de la transformation import/Babel ;
- résultat Jest : une suite détectée, zéro test exécuté ;
- tests shell API P0 présents, mais non confondus avec des tests UI et non relancés dans cet audit visuel ;
- Android non lancé pendant cet audit iOS.

Ces échecs ne bloquent pas le constat de parité, mais ils empêchent de sécuriser une grosse refonte. La réparation du lint/Jest doit faire partie de la phase de préparation.

## 9. Risques techniques complémentaires

- Une clé Google Maps est écrite directement dans plusieurs sources React Native. Même si elle est restreinte côté Google Cloud, elle doit être traitée comme configuration et ses restrictions doivent être vérifiées.
- Swift journalise le header Authorization dans le code réseau de debug. Les tokens ne doivent pas apparaître dans les logs.
- Les deux apps contiennent beaucoup de `print`/`console.log`.
- Certaines routes ou versions d'écrans sont dupliquées. Il faut établir une table route → composant actif avant toute modification.
- Les composants React Native sont partagés iOS/Android : une synchronisation iOS sans test Android peut casser l'autre app livrée.

## 10. Plan de synchronisation recommandé

### Phase 0 — Garde-fous

- figer une liste de parcours de référence et les captures des deux apps ;
- établir la table des routes actives, surtout Event detail et Booking detail ;
- réparer lint/Jest et ajouter des smoke tests de navigation ;
- définir les données test stables : événement gratuit, événement payant, booking active/completed, notifications 2 à 9 ;
- ne toucher ni au backend ni à l'app Organiser tant qu'un besoin transverse n'est pas confirmé.

### Phase 1 — Shell visuel global

- tokens de couleurs, typographies, rayons et espacements ;
- barre d'onglets flottante Swift ;
- headers et icônes ;
- vérification safe areas, clavier, petits/grands iPhone et Android.

### Phase 2 — Authentification

- phone-first et écran e-mail OTP compact ;
- modale invité conforme aux libellés produit ;
- Apple et Google séparés ;
- véritable Sign in with Apple ;
- accessibilité et automatisation OTP ;
- maintien e-mail/password et guest booking.

### Phase 3 — Parcours de découverte

- Home et ordre des actions ;
- correction Home → Search ;
- Calendar ;
- hauteur du hero Event detail ;
- Bookings et détails, sans toucher à leur logique métier.

### Phase 4 — Profil hybride

- hero Swift ;
- contenu gamification/progression RN ;
- Change Password au premier niveau ;
- conservation privacy, support, report issue et delete account.

### Phase 5 — Paiements par plateforme

- Apple Pay iOS ;
- Google Pay Android ;
- carte en fallback ;
- validation du statut durable par webhook et du booking créé, pas seulement d'un toast succès ;
- tests coordonnés User, Organiser et backend.

### Phase 6 — Régression et acceptation PO

- comparaison côte à côte sur le même iPhone ;
- tests Android sur les écrans partagés ;
- mode invité, connexion, deep link, réservation gratuite/payante, ticket, check-in, feedback, notifications et progression ;
- présentation au PO par parcours visuels courts, pas par explication technique.

## 11. Critères de réussite

La synchronisation sera réussie si :

1. le PO reconnaît immédiatement la Home, la navigation, l'auth, Calendar, Bookings et le hero Profile de l'app Swift ;
2. aucun parcours P0 React Native n'a disparu ;
3. Apple Sign-In et Apple Pay sont réels, pas seulement des boutons ;
4. la recherche, les notifications 2–9 et Change Password sont accessibles ;
5. les paiements sont confirmés par l'état backend durable ;
6. iOS et Android passent les smoke tests ;
7. les défauts visibles de Swift listés plus haut ne sont pas reproduits.

## 12. Recommandation finale

Continuer sur `OnDeenUser` est le choix le plus sûr et le plus rentable. La base React Native possède déjà le fonctionnel Swift, le P0 et la compatibilité iOS/Android. Le travail à venir doit être présenté comme une **synchronisation visuelle et fonctionnelle ciblée vers la référence Swift**, avec un profil hybride et des intégrations Apple réelles.

Cette approche satisfait le souhait du Product Owner sans perdre le travail déjà livré dans `ondeen-v2-p0-scope.md`.
