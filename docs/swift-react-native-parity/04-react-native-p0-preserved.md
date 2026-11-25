# 04 — Scope P0 React Native préservé

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · **P0 préservé** · [Risques](./11-remaining-work-and-risks.md)

## Principe

Le rapprochement Swift n'avait pas le droit de supprimer le travail décrit dans [`ondeen-v2-p0-scope.md`](../../ondeen-v2-p0-scope.md). Le design Swift a été appliqué autour des fonctions React Native, pas à leur place.

## Mapping User App P0

| Élément P0 | État avant le chantier de parité | Décision pendant la parité | État après |
|---|---|---|---|
| Profile Stitch | Présent dans RN, plus riche que Swift | Ne pas le remplacer par le Profile Swift incomplet | Conservé |
| Current rank | Présent | Aucun retrait | Conservé |
| Level/progress | Présent | Aucun retrait | Conservé |
| OnDeen Radar | Présent | Aucun retrait | Conservé |
| Certificates/profile sections | Présentes | Aucun retrait | Conservées |
| XP/tier/level/streak | Présents | Aucun retrait | Conservés |
| Post-check-in summary | Présent | Hors des retouches Swift | Conservé |
| Feedback after session | Présent | Hors des retouches Swift | Conservé |
| Guest booking UI | Présent | Maintenir malgré le nouveau bottom sheet login | Conservé |
| Online check-in code | Présent | Hors des retouches Swift | Conservé |
| Notification links | Présents et plus avancés que Swift | Préserver lors du restyle Notifications | Conservés |
| Event deep links | Présents | Préserver les routes et le retour post-login | Conservés |
| Google Pay | Marqué incomplet dans le scope | Ne pas confondre avec Apple Pay iOS | Toujours à valider/réparer |

## Profile : décision produit explicite

Le Profile est la principale exception à la parité visuelle stricte.

La référence Swift propose un hero pastel, mais son contenu inférieur est moins complet que le P0. Une première tentative de copie du hero a été retirée à la demande du propriétaire du projet. La version finale conserve donc :

- la page de progression RN ;
- le current rank ;
- XP, level et streak ;
- OnDeen Radar ;
- certificats et informations ;
- le bouton Settings afin de ne pas perdre la navigation vers les réglages.

Cette différence est volontaire et documentée. Elle ne doit pas être corrigée ultérieurement sans une nouvelle décision produit explicite.

## Mode invité et guest booking

Le bottom sheet `Continue to login` rapproche l'apparence de Swift, mais il ne supprime pas :

- la navigation publique ;
- la possibilité de démarrer un guest booking ;
- le stockage du booking invité ;
- sa migration après authentification ;
- le retour vers l'événement demandé.

La modale visuelle et le guest booking sont deux sujets différents. Remplacer la première ne doit jamais casser le second.

## Notifications et deep links

RN conserve son avantage fonctionnel :

- extraction des URLs présentes dans le message ;
- distinction lien OnDeen/lien externe ;
- ouverture interne sécurisée lorsque possible ;
- ouverture navigateur pour l'externe ;
- indication visuelle `[external]` ;
- marquage de la notification comme lue ;
- types 8/9 ajoutés depuis la logique Swift.

Le restyle n'a donc pas réduit l'inbox à une simple liste statique.

## Bookings, sessions et progression

Les retouches visuelles sur Bookings et Event Details préservent :

- upcoming et completed ;
- détails de réservation ;
- ticket et QR ;
- ajout au calendrier ;
- notes personnelles ;
- matériel et documents ;
- Q&A ;
- participants ;
- request buddy ;
- lien de session en ligne ;
- code de check-in ;
- feedback et progression après session.

## Scope Organiser et Backend

Ce chantier est centré sur `OnDeenUser`. Les éléments Organiser/Backend du P0 n'ont pas été réécrits pour imiter Swift :

- génération/validation du code de session ;
- édition du titre d'événement ;
- feedback dashboard et export CSV ;
- réglage guest booking ;
- moteur XP/tier/streak ;
- stockage feedback ;
- migration guest booking ;
- notification/deep-link backend ;
- audit/fan-out des titres.

Les éléments paiement incomplets restent incomplets : Stripe Connect onboarding/split/wallet et Google Pay. Le câblage Apple Pay User ne change pas ce statut transverse.

## Capacités RN utiles hors P0 strict également conservées

- onboarding/tour existant ;
- recherche globale et historique ;
- filtres dynamiques ;
- Wishlist multi-type ;
- profils organizer/speaker ;
- one-to-one ;
- affichage des cartes et lieux ;
- compatibilité Android ;
- option e-mail/password en plus des OTP ;
- Stripe PaymentSheet carte.

## Garde-fous pour les prochaines modifications

Avant toute future copie d'un écran Swift :

1. vérifier si le composant RN porte une fonction P0 ;
2. identifier la route RN réellement active ;
3. comparer les actions et données, pas seulement la capture ;
4. maintenir les labels d'accessibilité utilisés par les tests ;
5. exécuter le test ciblé puis `test42CoreScreenParity` ;
6. effectuer une régression Android si le composant est partagé ;
7. documenter toute exception produit dans ce dossier.

## Sources

- [Scope P0 officiel du dépôt](../../ondeen-v2-p0-scope.md)
- [Spécification fonctionnelle archivée](../resources/ondeen-v2-functional-spec-draft4.md)
- [Guide de test P0 historique](../p0-testing-guide.md)
- [Rapport de livraison de parité](../../report/swift-react-native-parity-delivery-report.md)

---

Précédent : [03 — Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · Suite : [05 — Catalogue complet des tests](./05-test-catalog.md)
