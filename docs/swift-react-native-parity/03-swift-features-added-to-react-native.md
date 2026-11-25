# 03 — Fonctionnalités Swift ajoutées ou réparées dans React Native

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · **Fonctions issues de Swift** · [P0 préservé](./04-react-native-p0-preserved.md) · [Tests](./05-test-catalog.md)

## Lecture correcte de la liste

L'audit initial montrait trois réalités différentes : certaines capacités Swift étaient réellement absentes de React Native ; d'autres existaient déjà mais étaient cassées ou cachées ; beaucoup étaient présentes et avaient seulement un rendu différent.

Cette distinction est importante. Elle démontre l'apport concret de Swift sans effacer le travail déjà accompli dans React Native.

## A. Fonctionnalités réellement absentes et ajoutées grâce à Swift

### A1. Sign in with Apple réel

**Avant**

React Native affichait une option Apple sur iOS, mais elle réutilisait l'icône ou le handler Google. Ce n'était pas un Sign in with Apple.

**Ce que le code Swift a révélé**

La référence utilisait `AuthenticationServices` et séparait correctement Apple de Google.

**Ce qui a été ajouté dans React Native**

- dépendance `@invertase/react-native-apple-authentication` ;
- contrôle de disponibilité iOS ;
- requête native Apple ;
- scopes nom complet et e-mail ;
- récupération et transmission de l'identity token ;
- gestion de l'annulation et des erreurs ;
- conservation temporaire des informations Apple, car Apple ne renvoie généralement le nom/e-mail qu'à la première autorisation ;
- mise à jour de l'état d'authentification RN après succès ;
- boutons Apple et Google séparés.

Fichiers principaux :

- [`checkAppleLogin.js`](../../OnDeenUser/src/screens/SignupScreen/checkAppleLogin.js)
- [`SignupMobileScreen.jsx`](../../OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx)
- [`SignupEmailScreen.jsx`](../../OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx)
- [`package.json`](../../OnDeenUser/package.json)

**Statut** : intégration frontend/native ajoutée. Une validation de bout en bout avec une identité Apple de production reste distincte de la parité visuelle.

### A2. Apple Pay côté frontend iOS

**Avant**

RN possédait le paiement carte Stripe et Google Pay Android, mais aucun câblage Apple Pay détectable dans le parcours actif.

**Ce que le code Swift a révélé**

La référence possédait un parcours PassKit/Stripe : présentation Apple Pay, création de PaymentMethod et confirmation du PaymentIntent.

**Ce qui a été ajouté dans React Native**

- `StripeProvider` au niveau racine ;
- merchant ID `merchant.com.ondeen.user` ;
- entitlement iOS `com.apple.developer.in-app-payments` ;
- détection `isPlatformPaySupported()` ;
- option Apple Pay désactivée proprement lorsque non disponible ;
- `PlatformPayButton` natif ;
- panier Apple Pay en GBP, pays marchand GB ;
- calcul du montant depuis les tickets ;
- confirmation par `confirmPlatformPayPayment(clientSecret, ...)` ;
- navigation après retour de succès du PaymentIntent.

Fichiers principaux :

- [`App.jsx`](../../OnDeenUser/App.jsx)
- [`OnDeen.entitlements`](../../OnDeenUser/ios/OnDeen/OnDeen.entitlements)
- [`PaymentsScreen.jsx`](../../OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx)
- [`PaymentMethodContainer.jsx`](../../OnDeenUser/src/screens/PaymentsScreen/PaymentMethodContainer.jsx)

**Statut** : câblage frontend présent et contrôlé. Le paiement réel, le webhook, le booking durable et Stripe Connect ne sont pas déclarés terminés. Voir [l'audit Apple Pay](./08-apple-pay-audit.md).

### A3. Routing des notifications de types 8 et 9

**Avant**

RN savait router les types 2 à 7 mais ignorait les destinations Swift associées aux types 8 et 9.

**Apport de l'étude Swift**

- type 8 : ouvrir le booking dans le contexte Completed ;
- type 9 : ouvrir le booking sur l'onglet Q&A.

**Après RN**

- type 8 transmet `bookingListType: 'completed'` ;
- type 9 transmet `initialTab: 'qa'` ;
- le service de navigation global et l'item visible utilisent la même logique.

Fichiers principaux :

- [`NotificationItem.jsx`](../../OnDeenUser/src/screens/Notification/NotificationItem.jsx)
- [`NavigationService.jsx`](../../OnDeenUser/src/checkpurpose/NavigationService.jsx)

**Statut** : ajouté dans le code ; une notification serveur réelle de chaque type reste le meilleur test métier final.

## B. Fonctions déjà présentes dans RN mais réparées grâce à la comparaison Swift

### B1. Home non vide lorsque des événements publics existent

Le runtime RN pouvait montrer `NO EVENTS FOUND` alors que Swift affichait des événements. L'écran, les cartes et les APIs existaient déjà ; le problème était la sélection de la réponse exploitable.

La Home RN utilise maintenant les événements publics disponibles comme repli lorsque la réponse personnalisée est vide ou incompatible. Les états de chargement, rafraîchissement et erreur sont conservés.

Fichiers : [`BottomHomePage.jsx`](../../OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx), [`RenderListItem.jsx`](../../OnDeenUser/src/screens/BottomHomePage/RenderListItem.jsx).

### B2. Appui Home → Search

`GlobalSearch` et ses services existaient. Sur iOS, le champ non éditable imbriqué interceptait l'appui destiné au parent. La surface de recherche a été rendue réellement tactile et la destination existante est maintenant accessible.

Fichiers : [`SearchInput.jsx`](../../OnDeenUser/src/components/SearchInput.jsx), [`CommonSearchInput.jsx`](../../OnDeenUser/src/components/CommonSearchInput.jsx), [`GlobalSearch.jsx`](../../OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx).

### B3. Login e-mail/password

Le formulaire existait, mais un appui sur Sign in pouvait ne produire aucune transition utile. La soumission utilise maintenant l'action attendue, gère le chargement et les erreurs, ferme le clavier et empêche les doubles soumissions.

Fichiers : [`LoginEmailPassword.jsx`](../../OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx), [`loginSlice.tsx`](../../OnDeenUser/src/redux/slices/loginSlice.tsx).

### B4. E-mail non capitalisé

Les champs e-mail utilisent maintenant `autoCapitalize="none"` ou détectent explicitement le type e-mail. La saisie `user...` n'est plus transformée en `User...`.

Fichiers : [`CustomeInput.jsx`](../../OnDeenUser/src/components/CustomeInput.jsx), [`EmailForm.jsx`](../../OnDeenUser/src/screens/SignupScreen/EmailForm.jsx), [`LoginEmailPassword.jsx`](../../OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx).

### B5. Mode invité et continuation vers le login

La logique de mode invité existait. La modale centrée et les anciennes actions ont été remplacées par une bottom sheet cohérente `Continue to login`, sans supprimer le guest booking P0.

Fichiers : [`guestModal.jsx`](../../OnDeenUser/src/modals/guestModal.jsx), [`MainNavigator.jsx`](../../OnDeenUser/src/navigation/MainNavigator.jsx).

### B6. Localisation sans crash sur Simulator

L'écran de localisation RN possédait déjà Google Places, géolocalisation, géocodage et carte. Le crash `Animated node with tag ... does not exist` et le rendu vide du Simulator ont été remplacés par un comportement sûr et un layout proche de Swift.

Le vrai picker reste prévu sur appareil réel. Le fallback Simulator ne doit pas être supprimé sans test réel.

Fichier : [`UpdateLocation.jsx`](../../OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx).

### B7. Wishlist fiable de bout en bout

La Wishlist existait déjà mais le conteneur accessible de la carte pouvait absorber le cœur enfant. Le serveur pouvait aussi laisser un état ancien après un test interrompu.

Les cartes Home et Wishlist n'écrasent plus l'accessibilité du cœur. Le parcours est maintenant testé en état propre : ajout, sélection, apparition, suppression, disparition et retour à l'état non sélectionné.

Fichiers :

- [`WishlistButton.jsx`](../../OnDeenUser/src/components/WishlistButton.jsx)
- [`RenderListItem.jsx`](../../OnDeenUser/src/screens/BottomHomePage/RenderListItem.jsx)
- [`Wishlist.jsx`](../../OnDeenUser/src/screens/Wishlist/Wishlist.jsx)
- [`WishlistCart.jsx`](../../OnDeenUser/src/screens/Wishlist/WishlistCart.jsx)

### B8. Notifications visibles en haut et données plus robustes

L'écran RN pouvait placer la liste très bas ou rester vide selon la forme exacte de la réponse. La normalisation accepte les structures de réponse observées, utilise un repli direct lorsque nécessaire et maintient les filtres/actions.

Fichiers : [`Notification.jsx`](../../OnDeenUser/src/screens/Notification/Notification.jsx), [`NotificationItem.jsx`](../../OnDeenUser/src/screens/Notification/NotificationItem.jsx).

### B9. Change Password accessible au premier niveau

L'écran et la route existaient déjà, mais Swift exposait l'action directement dans Profile Settings. RN contient maintenant une entrée directe `Change password` dans la liste principale.

Fichier : [`ProfileSetting.jsx`](../../OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx).

### B10. Accès Settings conservé depuis Profile

Après la décision de retirer le hero Swift, le Profile P0 RN est resté intact et le bouton Settings reste la porte d'entrée vers les réglages. C'est une réparation de compromis produit, pas une copie du Profile Swift incomplet.

## C. Fonctions déjà présentes : alignement UI uniquement

Les zones ci-dessous existaient fonctionnellement dans les deux apps. Swift a servi à corriger leur présentation, pas à ajouter leur logique métier.

| Zone | Ce qui existait déjà en RN | Apport du rapprochement Swift |
|---|---|---|
| Tab bar | Navigation Home/Calendar/Bookings/Profile | Pilule flottante, capsule active, safe area, icônes et labels |
| Fonts | Fichiers SF Pro Rounded et All Round Gothic | Mapping vers les vrais noms de fonte et graisses cohérentes |
| Home header | ville, Wishlist, Notifications | ordre, densité, badge et spacing |
| Catégories | navigation par catégorie | tailles, contours, pluriels et espacement |
| Event cards | image, titre, type, date, prix, distance | hauteur, hiérarchie, metadata et séparateurs |
| Sort | options et application | vraie bottom sheet, radios, X et CTA unique |
| Filters | données et logique de filtre | sections compactes, chips multi-lignes et footer |
| Calendar | mois, jours, événements | mois/année, dimanche d'abord, today et dots |
| Upcoming/Completed | listes et navigation booking | segmented control, cartes et lignes compactes |
| Event Details | données, tags, organizer, booking | hero, tabs, ordre, densité et CTA |
| Important Information | contenu des règles | carte crème, rayon, marges et séparateurs |
| Facilities | liste des facilities | carte indépendante, rayon et padding |
| Event Material | notes et documents | composition et état vide |
| Q&A | questions et envoi | onglet, carte vide et composer |
| Participants | liste/recherche | taille et placement du champ Search |
| Organizer | profil et événements | proportions de l'identité et des cartes |
| Profile Settings | actions compte | dimensions, espacements et icônes |
| Notifications | inbox, filtres, swipe/delete, liens | toolbar compacte et liste alignée en haut |

Le détail complet de chaque écran se trouve dans [02 — Parité UI écran par écran](./02-ui-parity-screen-by-screen.md).

## D. Fonctionnalités RN conservées parce qu'elles sont meilleures ou plus avancées

- profil P0 complet avec rang, progression, XP, streak, Radar et certificats ;
- liens OnDeen et externes cliquables dans les notifications ;
- guest booking et migration après connexion ;
- check-in en ligne par code ;
- feedback de session ;
- partage et deep links d'événements ;
- retour vers l'événement après authentification ;
- ticket, QR, notes, documents, Q&A et request buddy ;
- Stripe PaymentSheet/carte existant ;
- fallback carte sûr pour Simulator ;
- compatibilité Android du code partagé.

Voir le [mapping P0 complet](./04-react-native-p0-preserved.md).

## E. Défauts Swift volontairement non copiés

| Défaut observé dans Swift | Décision RN |
|---|---|
| Bas du Profile incomplet ou `Coming Soon` | Conserver le Profile P0 RN |
| `Verify Phone` après OTP e-mail | Garder un libellé cohérent avec l'e-mail |
| Toolbar Notifications coupée à droite | Compacter les boutons sans overflow |
| Distances irréalistes liées à la localisation Simulator | Conserver une localisation/fallback utile |
| `Add to Wallet` qui ferme l'écran ou ajoute au calendrier | Ne pas appeler cela une vraie intégration Wallet |
| Logs réseau pouvant contenir Authorization | Ne pas reproduire dans RN/docs/tests |
| Contrôleurs anciens et nouveaux en parallèle | Modifier uniquement la route RN active |
| Paiement déclaré réussi sans état backend durable | Reporter la validation complète au chantier paiement |
| État vide sans action utile | Conserver le CTA RN lorsqu'il améliore l'expérience |

## Synthèse chiffrée par nature

Il est plus honnête de raisonner par familles que par nombre brut d'écrans :

- **3 apports fonctionnels directs majeurs** issus de Swift : Apple Sign-In, Apple Pay frontend, notifications 8/9 ;
- **10 familles de parcours RN réparées ou rendues accessibles** ;
- **18 zones déjà fonctionnelles restylées** ;
- **9 défauts ou limitations Swift explicitement non reproduits** ;
- **toutes les fonctions User P0 non-paiement documentées préservées**.

Apple Pay reste volontairement marqué « frontend câblé, E2E différé ». Il ne doit pas être compté comme paiement de production terminé.

---

Précédent : [02 — Parité UI écran par écran](./02-ui-parity-screen-by-screen.md) · Suite : [04 — Scope P0 React Native préservé](./04-react-native-p0-preserved.md)
