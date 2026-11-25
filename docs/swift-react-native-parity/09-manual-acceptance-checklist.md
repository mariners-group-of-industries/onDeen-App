# 09 — Checklist d'acceptation manuelle

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · [Protocole visuel](./06-visual-comparison-protocol.md) · **Acceptation** · [Risques](./11-remaining-work-and-risks.md)

## But

Cette checklist permet au Product Owner ou à la QA de valider le résultat par parcours courts, sans devoir comprendre React Native, Swift, Redux ou XCUITest.

## Préparation obligatoire

- [ ] Utiliser le même modèle d'iPhone pour Swift et RN.
- [ ] Utiliser la même version iOS.
- [ ] Utiliser le mode clair et la taille de texte par défaut.
- [ ] Connecter les deux apps au même backend.
- [ ] Utiliser le même compte de test.
- [ ] Préparer au moins quatre événements seed.
- [ ] Préparer un booking upcoming et un completed.
- [ ] Préparer trois notifications comparables.
- [ ] Définir la même localisation simulée si les distances sont comparées.
- [ ] Fermer le clavier, les alerts système et les modales transitoires.
- [ ] Ne pas comparer un iPhone Pro à un Pro Max.

## A. Mode invité et authentification

- [ ] Lancer RN en mode invité.
- [ ] Appuyer sur Calendar ou Profile.
- [ ] Vérifier que `Continue to login` apparaît depuis le bas, pas au centre.
- [ ] Vérifier `Not now` et `Continue`.
- [ ] Continuer puis ouvrir le parcours e-mail.
- [ ] Saisir un e-mail commençant par une minuscule.
- [ ] Vérifier que la première lettre reste minuscule.
- [ ] Tester Sign in e-mail/password et vérifier un loader/une erreur utile ou la Home.
- [ ] Ouvrir Email OTP et vérifier que le champ est utilisable.
- [ ] Vérifier que Apple et Google sont deux boutons/actions distincts.
- [ ] Vérifier que l'annulation Apple ne bloque pas l'app.

Résultat A : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## B. Home

- [ ] Vérifier ville, chevron, Wishlist et Notifications dans le bon ordre.
- [ ] Vérifier le badge Notifications.
- [ ] Appuyer sur la recherche et confirmer l'ouverture de Search.
- [ ] Revenir et ouvrir Filters.
- [ ] Vérifier les catégories et leurs pluriels.
- [ ] Vérifier `HAPPENING AROUND YOU` et `Sort By` sur la même ligne.
- [ ] Vérifier qu'une liste d'événements apparaît lorsque le backend fournit des événements publics.
- [ ] Comparer hauteur d'image, titre, date, type, prix et distance/online à Swift.
- [ ] Vérifier la tab bar flottante et sa capsule active.

Résultat B : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## C. Sort et Filters

- [ ] Ouvrir `Sort By`.
- [ ] Vérifier la grande bottom sheet, le X, cinq options radio et le CTA unique.
- [ ] Sélectionner une option et appliquer.
- [ ] Ouvrir Filters.
- [ ] Vérifier Date, Ticket Type, Journey Level, Category, Organisers et Gender.
- [ ] Vérifier que les chips reviennent à la ligne au lieu d'être coupées horizontalement.
- [ ] Vérifier le footer fixe `CLEAR ALL` / `APPLY FILTERS`.
- [ ] Appliquer et confirmer que Home reste utilisable.

Résultat C : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## D. Wishlist

- [ ] Commencer avec le premier événement non sélectionné.
- [ ] Appuyer sur son cœur.
- [ ] Vérifier l'état sélectionné.
- [ ] Ouvrir Wishlist depuis le header.
- [ ] Vérifier que l'événement apparaît avec image, type, titre, date et prix.
- [ ] Supprimer l'événement.
- [ ] Vérifier l'état vide `NO EVENTS FOUND` et `Explore Events`.
- [ ] Revenir Home et confirmer que le cœur n'est plus sélectionné.

Résultat D : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## E. Localisation

- [ ] Appuyer sur la ville Home.
- [ ] Vérifier qu'aucun écran rouge `Animated node ...` n'apparaît.
- [ ] Comparer le header, le champ, la carte et le CTA à Swift.
- [ ] Sur Simulator, accepter le fallback explicite.
- [ ] Sur vrai iPhone, tester permission, recherche, pin, sélection et sauvegarde.
- [ ] Revenir Home et confirmer la ville choisie.

Résultat E : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## F. Calendar

- [ ] Ouvrir Calendar depuis la tab bar.
- [ ] Vérifier mois + année.
- [ ] Vérifier dimanche comme premier jour.
- [ ] Vérifier la mise en évidence du jour courant.
- [ ] Vérifier les dots d'événements.
- [ ] Vérifier le mois suivant dans la continuité du scroll.
- [ ] Comparer la densité et les espacements à Swift.
- [ ] Vérifier la capsule Calendar active dans la tab bar.

Résultat F : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## G. Bookings

- [ ] Ouvrir Bookings.
- [ ] Vérifier titre, recherche et segmented control.
- [ ] Vérifier le heading `UPCOMING BOOKINGS`.
- [ ] Comparer badge, image, titre, date, avatar et flèche à Swift.
- [ ] Ouvrir `Completed Bookings`.
- [ ] Vérifier que le contenu `COMPLETED BOOKINGS` apparaît réellement.
- [ ] Comparer la ligne completed à Swift.
- [ ] Revenir sur Upcoming et ouvrir un booking.

Résultat G : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## H. Event/Booking Details

- [ ] Vérifier header, tabs, hero, tags, titre, prix et date.
- [ ] Vérifier Journey Level.
- [ ] Vérifier `REQUEST BUDDY` et `EVENT LINK` lorsque présents.
- [ ] Vérifier Organizer, `VIEW INFO` et Overview.
- [ ] Vérifier Event Location et la carte.
- [ ] Scroller vers `Important Information`.
- [ ] Vérifier la carte crème, les coins, marges et quatre sous-sections.
- [ ] Vérifier la carte Facilities séparée.
- [ ] Ouvrir Event Material et vérifier Notes + Files/Documents.
- [ ] Ouvrir Q&A et vérifier état vide/composer.
- [ ] Ouvrir Participants et vérifier la barre Search.
- [ ] Vérifier que notes, ticket, liens et documents restent accessibles.

Résultat H : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## I. Organizer Profile

- [ ] Depuis Event Details, appuyer sur `VIEW INFO`.
- [ ] Vérifier avatar/identité centrés.
- [ ] Vérifier `About the Organiser`.
- [ ] Vérifier `All Active events`.
- [ ] Comparer la taille des cartes et leur grille à Swift.
- [ ] Ouvrir un événement organizer et vérifier la navigation.

Résultat I : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## J. Profile et Settings

- [ ] Ouvrir Profile.
- [ ] Vérifier le Profile P0 RN : rang, progression, Radar, etc.
- [ ] Ne pas demander le bas `Coming Soon` de Swift.
- [ ] Vérifier la présence du bouton Settings.
- [ ] Ouvrir Settings.
- [ ] Vérifier Edit Profile.
- [ ] Vérifier One-to-One Session.
- [ ] Vérifier Change password au premier niveau.
- [ ] Vérifier Privacy, Help, Report, Logout et Delete Account.
- [ ] Vérifier le retour Profile et la tab bar.

Résultat J : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## K. Notifications

- [ ] Ouvrir Notifications depuis Home.
- [ ] Vérifier que la liste commence sous la toolbar, pas au milieu de l'écran.
- [ ] Vérifier All, Unread, Delete All et Mark all as seen sans overflow.
- [ ] Comparer cloche, titre, description, action et séparateur à Swift.
- [ ] Tester filtre Unread.
- [ ] Tester Mark all as seen.
- [ ] Tester une notification type 8 vers Completed Booking.
- [ ] Tester une notification type 9 vers Q&A.
- [ ] Tester un lien OnDeen interne.
- [ ] Tester un lien externe et son indication.

Résultat K : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## L. Contrôle rapide Apple Pay

- [ ] Vérifier que l'option Apple Pay apparaît sur iOS compatible.
- [ ] Vérifier qu'elle est désactivée proprement lorsqu'indisponible.
- [ ] Vérifier que le paiement carte reste disponible.
- [ ] Ne pas déclarer l'E2E passé sans vrai iPhone, Wallet, événement payant, Stripe et webhook.

Résultat L : ☐ UI pass ☐ UI fail ☐ E2E différé
Commentaire :

## M. Régression générale

- [ ] Aucun écran rouge/crash pendant les parcours.
- [ ] Aucun bouton principal sans effet.
- [ ] Back fonctionne sur tous les sous-écrans.
- [ ] Les tabs reviennent au bon écran.
- [ ] Le clavier ne cache pas les CTA critiques.
- [ ] Les loaders ne restent pas indéfiniment.
- [ ] Les états vides ont une explication/action utile.
- [ ] Le P0 Profile/guest/deep-link/check-in/feedback n'a pas disparu.
- [ ] Les captures comparées viennent du même modèle d'iPhone.

Résultat M : ☐ Pass ☐ Fail ☐ Bloqué
Commentaire :

## Compte rendu final

- Date :
- Build/commit RN :
- Build/commit Swift :
- Device RN :
- Device Swift :
- iOS :
- Backend :
- Localisation :
- Compte/dataset :

| Groupe | Résultat | Bug/écart associé |
|---|---|---|
| A Auth |  |  |
| B Home |  |  |
| C Sort/Filters |  |  |
| D Wishlist |  |  |
| E Location |  |  |
| F Calendar |  |  |
| G Bookings |  |  |
| H Details |  |  |
| I Organizer |  |  |
| J Profile/Settings |  |  |
| K Notifications |  |  |
| L Apple Pay |  |  |
| M Régression |  |  |

Décision : ☐ Accepté ☐ Accepté avec écarts mineurs ☐ Refusé ☐ Bloqué par données/environnement

Écarts acceptés explicitement :

1.
2.
3.

Signataire Product Owner/QA :

---

Précédent : [08 — Audit Apple Pay](./08-apple-pay-audit.md) · Suite : [10 — Inventaire des changements](./10-change-inventory.md)
