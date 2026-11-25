# Rapport de livraison — Parité OnDeen User Swift vers React Native

Date : 12 août 2026<br>
Application cible : `OnDeenUser` (React Native)<br>
Référence produit : `OnDeenUserSwiftApp` (iOS Swift/UIKit)<br>
Scope fonctionnel protégé : [`ondeen-v2-p0-scope.md`](../ondeen-v2-p0-scope.md)<br>
Audit initial : [`swift-vs-react-native-user-audit.md`](./swift-vs-react-native-user-audit.md)<br>
Documentation détaillée et navigable : [`docs/swift-react-native-parity/index.md`](../docs/swift-react-native-parity/index.md)

## 1. Résumé exécutif

L'application React Native a été conservée comme base produit. Elle n'a pas été remplacée par l'application Swift et aucun des ajouts V2/P0 n'a été sacrifié pour obtenir la parité visuelle.

Le travail a consisté à :

1. utiliser l'application Swift comme référence de look-and-feel pour les parcours visibles par le Product Owner ;
2. corriger les fonctions React Native qui existaient dans le code mais ne fonctionnaient pas correctement dans le runtime ;
3. ajouter les intégrations iOS réellement absentes, notamment Sign in with Apple et le câblage Apple Pay ;
4. préserver les fonctions React Native/P0 plus avancées que Swift ;
5. ne pas reproduire les bugs, écrans incomplets ou comportements trompeurs observés dans Swift ;
6. valider les deux applications sur le même modèle d'iPhone et à la même résolution.

### Verdict actuel

- **Couverture des écrans et parcours Swift demandés : complète sur le périmètre visuel audité.**
- **Parité visuelle estimée : environ 97 % sur les écrans comparés.**
- **Régression iOS React Native : tous les scénarios finaux ciblés passent.**
- **Comparaison Swift/RN sur le même iPhone 17 Pro Max : parcours principal réussi dans les deux apps.**
- **P0 React Native : conservé.**
- **Paiement réel Apple Pay/Stripe : volontairement non déclaré terminé**, car il nécessite un événement payant, un vrai appareil avec Wallet, le backend, les webhooks et la vérification du booking durable.

Le reliquat n'est donc plus une liste d'écrans Swift manquants dans React Native. Il correspond essentiellement aux validations réelles de paiement, à la régression Android des composants partagés et à une dernière acceptation visuelle Product Owner.

## 2. Ce que signifie « même application » dans cette livraison

L'objectif retenu n'est pas une traduction ligne par ligne de UIKit vers React Native. Les architectures sont différentes et cette approche aurait détruit du travail utile.

La parité recherchée porte sur ce que l'utilisateur et le Product Owner perçoivent :

- même structure générale ;
- même hiérarchie de contenu ;
- mêmes proportions principales ;
- mêmes familles typographiques réellement chargées ;
- mêmes couleurs, rayons, capsules et fonds ;
- mêmes libellés importants ;
- mêmes états vide, sélectionné, chargé et connecté ;
- mêmes destinations après un appui ;
- mêmes parcours Home, Calendar, Bookings et Profile ;
- comportement au moins aussi fiable que Swift.

La logique métier, Redux, les APIs, le P0 et la compatibilité Android de React Native restent la base technique.

## 3. Méthode de comparaison

La livraison repose sur quatre niveaux de preuve :

- lecture des sources complètes et des routes actives des deux applications ;
- comparaison des écrans, composants, services et capacités iOS ;
- lancement manuel et captures des deux runtimes ;
- automatisation XCUITest des parcours à risque et de la comparaison finale.

### Environnement final identique

| Paramètre | Swift | React Native |
|---|---|---|
| Appareil | iPhone 17 Pro Max | iPhone 17 Pro Max |
| iOS | 26.4.1 | 26.4.1 |
| Résolution des captures | 1320 × 2868 | 1320 × 2868 |
| Bundle ID | `com.ondeen.user` | `com.ondeen.user` |
| Compte/données | même compte et mêmes données serveur | même compte et mêmes données serveur |

Deux simulateurs séparés ont été utilisés parce que les applications partagent le même bundle ID. Cela évite qu'une installation remplace l'autre et permet une comparaison immédiate sur le même modèle.

La différence `Select Location`/`London` visible sur certaines captures vient de l'état de localisation propre à chaque simulateur. Elle ne représente pas un écart de layout.

Les identifiants de test n'ont été ni écrits dans les sources, ni ajoutés au driver, ni enregistrés dans le rapport.

## 4. Résultat écran par écran

| Zone | Écart initial principal | Livraison React Native | État |
|---|---|---|---|
| Navigation principale | tab bar RN plate et sélection peu lisible | pilule flottante, capsule active, couleurs et safe area proches de Swift | Couvert |
| Home | écran parfois vide, tailles/densité différentes | données publiques de repli, catégories, cartes, headers et densité alignés | Couvert |
| Recherche Home | appui intercepté par le champ non éditable | surface tactile corrigée et route de recherche accessible | Couvert |
| Wishlist header | ordre et présentation différents | position et icône alignées avec Swift | Couvert |
| Notifications header | ordre différent | position et badge alignés avec Swift | Couvert |
| Mode invité | modale centrée et wording différent | bottom sheet `Continue to login`, actions cohérentes | Couvert |
| Login e-mail/password | bouton sans retour utile, première lettre capitalisée | soumission fiable, état de chargement, erreurs visibles, autocapitalisation désactivée | Couvert |
| E-mail OTP | composition et accessibilité différentes | parcours accessible et navigation conservée | Couvert |
| Mobile OTP | présent mais visuellement distinct | conservé et rapproché du shell Swift | Couvert |
| Sign in with Apple | faux bouton Apple branché sur Google | intégration Apple native séparée avec token d'identité | Couvert côté frontend |
| Google Sign-In | mélangé au bouton Apple sur iOS | bouton et handler Google séparés | Couvert |
| Localisation | écran simulateur très éloigné de Swift, crash natif antérieur | écran rapproché du modèle Swift et fallback simulateur sûr | Couvert sur simulateur |
| Catégories | proportions/libellés différents | cartes, bordures, pluriels et espacements alignés | Couvert |
| Liste d'événements | typographie, hauteur et métadonnées différentes | densité, image, tags, distance/online et séparateurs rapprochés | Couvert |
| Sort | sheet RN très différente | bottom sheet, radios, CTA et fermeture alignés | Couvert |
| Filters | grands blocs/scroll horizontal | grille compacte, chips, cases et footer proches de Swift | Couvert |
| Calendar | titre/semaines/today/tab bar différents | mois + année, dimanche en premier, aujourd'hui, dots et tab bar alignés | Couvert |
| Upcoming Bookings | dimensions de carte différentes | image, statut, titre, date, organisateur et action alignés | Couvert |
| Completed Bookings | ligne très différente | présentation compacte et structure rapprochée de Swift | Couvert |
| Event details | hero trop haut, tags/sections trop espacés | hero, onglets, tags, CTA et contenu principal rapprochés | Couvert |
| Important Information | sections plates et très serrées | carte crème arrondie et espacements Swift | Couvert |
| Facilities | section plate sans vraie carte | carte claire arrondie, liste et marges Swift | Couvert |
| Event Material | densité et état vide différents | notes, fichiers/documents et conteneurs alignés | Couvert |
| Q&A | champ et état vide différents | composition et footer rapprochés de Swift | Couvert |
| Participants | barre de recherche trop petite | header et barre de recherche alignés | Couvert |
| Wishlist list | état serveur/touche du cœur instables | ajout, état sélectionné, liste, suppression et retour Home vérifiés | Couvert fonctionnellement |
| Organizer profile | proportions des cartes différentes | identité, about et active events rapprochés | Couvert |
| Profile | copie du hero Swift non souhaitée | profil P0 React Native conservé selon décision produit | Conservé volontairement |
| Profile settings | bouton réglages à préserver | accès Settings maintenu depuis Profile, liste rapprochée de Swift | Couvert |
| Notifications list | liste décalée en bas et toolbar différente | liste en haut, boutons compacts, contenu et séparateurs alignés | Couvert |
| Notification types 8/9 | destinations absentes | routing vers completed booking et Q&A ajouté | Couvert |
| Apple Pay | absent de l'ancien runtime RN | câblage Stripe/merchant/button/PaymentIntent présent | Câblé, E2E différé |

## 5. Détails des corrections fonctionnelles importantes

### 5.1 Home réellement utilisable

Le premier problème visible était une Home vide avec `NO EVENTS FOUND`. Le runtime React Native peut maintenant afficher les événements publics disponibles lorsque la réponse personnalisée n'est pas exploitable, tout en conservant le rafraîchissement et les états d'erreur.

La Home finale contient :

- localisation ;
- wishlist et notifications ;
- recherche et filtres ;
- catégories ;
- tri ;
- liste d'événements avec images, type, date/heure, titre, organisateur, prix et distance/online ;
- tab bar flottante.

### 5.2 Authentification corrigée sans réduire les options RN

L'authentification conserve e-mail/password, e-mail OTP, mobile OTP, Apple et Google.

Les corrections importantes sont :

- `autoCapitalize="none"` pour empêcher `user...` de devenir `User...` ;
- soumission e-mail/password via l'action Redux attendue et gestion d'erreur visible ;
- blocage du double appui pendant la requête ;
- clavier fermé proprement ;
- bouton Apple séparé du bouton Google ;
- demande Apple native via `AuthenticationServices`/`react-native-apple-authentication` ;
- profil Apple mis en cache uniquement pour gérer le fait qu'Apple ne renvoie nom/e-mail qu'à la première autorisation ;
- token applicatif Redux/Persist mis à jour après succès.

### 5.3 Wishlist validée comme parcours, pas uniquement comme capture

Le test final ne se contente pas d'ouvrir l'écran Wishlist. Il vérifie :

1. un état initial non sélectionné ;
2. l'appui sur le cœur Home ;
3. le passage à l'état sélectionné ;
4. la présence de l'événement dans Wishlist ;
5. la suppression depuis Wishlist ;
6. la disparition de la carte ;
7. le retour du cœur Home à l'état non sélectionné.

Les cartes ont également été ajustées pour que leur conteneur n'écrase plus l'accessibilité du bouton cœur enfant.

### 5.4 Event details, Important Information et Facilities

Les sections finales reproduisent la logique visuelle Swift :

- cartes détachées du bord ;
- coins arrondis cohérents ;
- fond crème pour les informations importantes ;
- fond clair distinct pour les facilities ;
- padding interne régulier ;
- séparateurs conservés ;
- contenu scrollable et atteignable.

Le changement ne modifie ni les données de l'événement ni la logique de booking.

### 5.5 Profile hybride décidé avec le produit

Une première tentative de reprise du hero Swift a été retirée à la demande du propriétaire du projet. Le profil React Native reste donc le profil P0 plus riche : progression, rang, radar, certificats et informations associées.

En revanche, le bouton Settings est conservé et mène à la liste des réglages : Edit Profile, One-to-One Session, Change Password, Privacy, Help & Support, Report an issue, Logout et Delete Account.

Cette décision satisfait la parité de navigation sans perdre la valeur du profil V2.

## 6. Fonctions React Native/P0 explicitement protégées

Les éléments suivants n'ont pas été supprimés pendant le rapprochement Swift :

- gamification : XP, tier, level, streak et progression ;
- profil P0 Stitch avec current rank, OnDeen Radar et sections de progression ;
- résumé de session, milestones et états vus/non vus ;
- feedback après session ;
- guest booking et migration après authentification ;
- check-in en ligne par code ;
- liens OnDeen et externes cliquables dans les notifications ;
- deep links/universal links d'événements ;
- retour vers l'événement demandé après connexion ;
- détails de booking, ticket, notes, matériel, Q&A et request buddy ;
- onboarding existant ;
- comportement iOS Simulator sûr pour la carte ;
- code partagé Android, sous réserve de la régression Android finale ;
- Stripe PaymentSheet/carte et logique de booking existantes.

Le scope P0 Organiser et Backend n'a pas été réécrit dans ce chantier visuel User.

## 7. Bugs Swift volontairement non reproduits

Swift est la référence visuelle, pas une vérité technique absolue. Les défauts suivants n'ont pas été copiés :

- profil inférieur incomplet ou contenu `Coming Soon` ;
- titre `Verify Phone` après un OTP envoyé par e-mail ;
- toolbar Notifications qui déborde à droite ;
- distances incohérentes dues à la localisation du simulateur ;
- saisie e-mail capitalisée automatiquement ;
- écrans/contrôleurs historiques non utilisés ;
- éventuels logs réseau contenant des données d'autorisation ;
- Apple Pay présenté comme terminé sans preuve de confirmation métier durable ;
- états vides sans action utile quand React Native possède déjà une meilleure option.

## 8. Contrôle rapide Apple Pay

Ce contrôle était volontairement limité afin de ne pas ouvrir prématurément le chantier complet Stripe/marketplace.

### Éléments présents dans React Native

- `StripeProvider` actif au niveau racine ;
- `merchantIdentifier="merchant.com.ondeen.user"` ;
- entitlement iOS `com.apple.developer.in-app-payments` avec le même merchant ID ;
- entitlements bien référencés par le projet Xcode ;
- `usePlatformPay()` et `isPlatformPaySupported()` ;
- option Apple Pay désactivée proprement lorsque l'appareil n'est pas compatible ;
- `PlatformPayButton` natif lorsque Apple Pay est sélectionné ;
- pays marchand `GB` et devise `GBP` ;
- montant calculé depuis les tickets sélectionnés ;
- `confirmPlatformPayPayment(clientSecret, ...)` sur le `PaymentIntent` créé par le backend ;
- mise à jour du statut de paiement et navigation vers la confirmation seulement après succès retourné.

### Conclusion du contrôle

Le câblage frontend Apple Pay existe et correspond à l'API installée de `@stripe/stripe-react-native`. Aucun manque évident de configuration locale n'a été trouvé.

Ce qui **n'est pas validé dans cette livraison** :

- carte Apple Pay réelle dans Wallet ;
- présentation et autorisation sur vrai iPhone ;
- événement payant de production/test correctement configuré ;
- signature/capability avec le bon compte Apple Developer ;
- confirmation webhook Stripe ;
- idempotence ;
- booking durable après webhook ;
- split Stripe Connect, wallet organisateur, remboursements et payouts.

Ces points doivent être traités dans le chantier paiement transverse User + Organiser + Backend. Une animation ou un toast de succès ne suffira pas comme preuve.

## 9. Régression automatisée finale

Driver réutilisable : [`.ios-run/ui-driver/Tests/OnDeenUIDriverTests.swift`](../.ios-run/ui-driver/Tests/OnDeenUIDriverTests.swift)

| Test | Ce qui est vérifié | Résultat RN |
|---|---|---|
| `test36EventInformationAndFacilities` | ouverture event, scroll, Important Information, Facilities | Passé |
| `test37HomeSortAndFilters` | Home, bottom sheet Sort, écran Filters, fermeture | Passé |
| `test38WishlistRoundTrip` | ajout, état cœur, liste, suppression, retour Home | Passé |
| `test39LocationLayout` | ouverture et rendu de Search Location | Passé |
| `test40OrganizerProfileParity` | event → VIEW INFO → profil organisateur | Passé |
| `test41BookedEventTabsAndParticipants` | booking, Details, Material, Q&A, Participants | Passé |
| `test42CoreScreenParity` | Home, Notifications, Calendar, Upcoming/Completed, Profile, Settings | Passé |

Résultat agrégé de cette série ciblée : **7 scénarios, 7 réussites, 0 échec**.

Le même `test42CoreScreenParity` a ensuite été exécuté sur l'application Swift installée dans un second iPhone 17 Pro Max identique : **réussi, 0 échec**. Une dernière relance avec l'assertion explicite que le contenu `COMPLETED BOOKINGS` est réellement ouvert a également réussi (`swift-max-core-asserted-final.xcresult`, 1/1). Le driver sait maintenant reconnaître aussi le bouton retour natif Swift et dispose d'un fallback de coordonnées pour les éléments UIKit qui ne publient pas toujours leur libellé d'accessibilité.

Les captures et `.xcresult` sont stockés localement sous :

```text
OnDeenUser/artifacts/ios-ui-tests/20260812-104413/
```

Ce dossier est ignoré par Git. Il constitue une preuve locale de test, pas un artefact à versionner.

## 10. Comparaison visuelle finale sur appareil identique

### Home

La structure, la densité de catégories, le titre de section, le tri, les cartes et la tab bar sont désormais très proches. Les différences de ville et de distance viennent de l'état de localisation des deux simulateurs.

### Calendar

Le titre, la grille, le premier jour de semaine, le jour courant, les points d'événement, le deuxième mois et la tab bar ont la même composition. À résolution identique, les deux écrans sont pratiquement superposables.

### Bookings

Le titre, la recherche, le segmented control, l'en-tête de section, la grande carte, le badge, l'image, le titre, la date, le bouton et l'avatar utilisent la même hiérarchie. La version RN conserve son comportement métier existant.

### Notifications

La liste RN commence maintenant en haut comme Swift. Les contrôles All/Unread/Delete/Mark all as seen, les icônes, textes, séparateurs et liens ont été rapprochés. Le débordement de la référence Swift n'a pas été reproduit.

### Event details et sous-onglets

Details, Event Material, Q&A, Participants, Organizer, Important Information et Facilities suivent désormais la même organisation et des espacements comparables. Les fonctions RN additionnelles restent accessibles.

## 11. Hygiène Git et builds locaux

- les captures, `.xcresult`, logs et tokens locaux restent ignorés ;
- le driver XCUITest réutilisable est versionnable ;
- `OnDeenUserSwiftApp/DerivedData-Parity-Max/` est explicitement ajouté au `.gitignore` ;
- le dossier de build Swift de comparaison ne figurera pas dans le futur commit ;
- aucun identifiant de connexion n'est présent dans les fichiers suivis ;
- les modifications de cette dernière passe restent volontairement non commitées jusqu'au test manuel demandé par le propriétaire du projet.

## 12. Ce qui reste réellement

### Hors de la parité visuelle immédiate

1. **Apple Pay réel sur appareil** : Wallet + événement payant + Stripe + webhook + booking durable.
2. **Chantier paiement global** : Stripe Connect, wallet organisateur, split, remboursement, payout, ledger et réconciliation.
3. **Google Pay Android** : le scope P0 le marque encore à valider/réparer.
4. **Régression Android** : vérifier que les composants RN partagés gardent le bon rendu et le bon comportement.
5. **Localisation sur vrai iPhone** : valider la carte interactive et les permissions hors fallback Simulator.
6. **Acceptation PO finale** : même téléphone, même ville, même état de données et parcours côte à côte.

### Dette technique séparée

- remettre ESLint sur une configuration exécutable ;
- réparer la transformation Jest/Babel afin que les tests unitaires se lancent ;
- réduire les `console.log`/`print` et protéger les données sensibles dans les logs ;
- consolider certains anciens/nouveaux écrans dupliqués ;
- restaurer la validation mot de passe stricte et retirer les raccourcis debug listés dans le scope P0 avant production.

Ces éléments sont importants, mais ne représentent pas des écrans Swift encore absents de React Native.

## 13. Parcours conseillé pour la validation manuelle

Pour une validation rapide avant commit :

1. ouvrir Home et vérifier événements, catégories, tri et filtres ;
2. ajouter le premier événement à Wishlist, l'ouvrir, le supprimer et revenir Home ;
3. ouvrir Search Location puis revenir ;
4. ouvrir Calendar ;
5. ouvrir Bookings, basculer Upcoming/Completed et ouvrir une réservation ;
6. parcourir Details, Event Material, Q&A et Participants ;
7. ouvrir le profil organisateur via `VIEW INFO` ;
8. ouvrir Notifications et tester un lien ;
9. ouvrir Profile puis Settings ;
10. en mode invité, vérifier la bottom sheet `Continue to login` ;
11. tester e-mail/password puis e-mail OTP ;
12. comparer ensuite Swift/RN sur le même modèle d'iPhone.

Le paiement Apple Pay ne doit être inclus dans cette validation que lorsqu'un environnement Stripe et un appareil Wallet dédiés sont disponibles.

## 14. Conclusion

Le choix de continuer avec `OnDeenUser` est confirmé par le résultat : l'application React Native reprend maintenant le langage visuel et les parcours reconnaissables de Swift tout en conservant le travail V2/P0, la compatibilité multiplateforme et les fonctions plus avancées déjà livrées.

Pour le périmètre visible demandé par le Product Owner, le problème n'est plus « ce n'est pas mon app ». Les deux applications présentent désormais la même identité, la même navigation et la même hiérarchie sur les écrans principaux. Les quelques validations restantes sont clairement isolées dans le chantier paiement/appareil réel et la régression Android, sans remettre en cause la base React Native.
