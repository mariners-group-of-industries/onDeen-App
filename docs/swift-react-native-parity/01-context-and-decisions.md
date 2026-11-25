# 01 — Contexte, objectifs et décisions

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · [Tests](./05-test-catalog.md) · [Acceptation](./09-manual-acceptance-checklist.md)

## Contexte du projet

OnDeen possède historiquement deux applications React Native, User et Organiser. Une équipe précédente a ensuite développé `OnDeenUserSwiftApp`, une application iOS native en Swift/UIKit. Cette version Swift est devenue la référence visuelle du Product Owner.

En parallèle, l'application `OnDeenUser` React Native a reçu les développements décrits dans [`ondeen-v2-p0-scope.md`](../../ondeen-v2-p0-scope.md), notamment le profil de progression, la gamification, le guest booking, le feedback, le check-in et les deep links.

Le problème produit n'était donc pas « quelle base contient le plus de code ? ». Il était :

- le Product Owner reconnaît le rendu Swift comme son application ;
- React Native contient davantage de travail produit utile ;
- remplacer React Native par Swift ferait perdre le partage iOS/Android et une partie du P0 ;
- ignorer Swift laisserait les écarts visuels visibles et le désaccord produit entier.

## Décision principale

`OnDeenUser` React Native reste l'application produit. `OnDeenUserSwiftApp` sert de référence de look-and-feel et de source d'information fonctionnelle, pas de codebase à recopier ligne par ligne.

Cette décision permet de réunir :

- le design reconnu par le Product Owner ;
- le fonctionnement et le scope P0 déjà développés dans React Native ;
- la compatibilité iOS/Android de la base React Native ;
- les intégrations iOS réellement nécessaires ;
- une meilleure robustesse lorsque Swift présente un défaut.

## Définition de la parité retenue

Deux écrans sont considérés en parité produit lorsque l'utilisateur perçoit :

- la même hiérarchie générale ;
- les mêmes zones et actions principales ;
- les mêmes proportions de cartes, boutons, headers et onglets ;
- la même famille typographique ou son mapping exact ;
- des tailles, graisses et interlignes comparables ;
- les mêmes couleurs, fonds, rayons, capsules et séparateurs ;
- des espacements comparables ;
- les mêmes libellés utiles ;
- les mêmes états sélectionné, vide, chargé, invité et connecté ;
- la même destination après les actions visibles.

La parité ne signifie pas :

- utiliser la même architecture ;
- supprimer Redux, les APIs ou le P0 ;
- recopier un bug UIKit ;
- imiter une distance erronée liée au simulateur ;
- considérer un bouton paiement comme une preuve de paiement réel ;
- imposer une exactitude pixel par pixel entre deux tailles d'appareil différentes.

## Hiérarchie des sources de vérité

En cas de contradiction, les décisions ont suivi cet ordre :

1. demande explicite la plus récente du propriétaire du projet ;
2. fonctions P0 documentées et déjà opérationnelles dans React Native ;
3. application Swift pour le rendu et les parcours visibles ;
4. meilleur comportement technique lorsque Swift présente un bug ;
5. cohérence iOS/Android de la base partagée.

Exemple important : une première reprise du hero Profile Swift a été retirée à la demande explicite du propriétaire. Le Profile P0 React Native est donc conservé, mais son bouton Settings et l'écran de réglages restent accessibles.

## Classification utilisée dans cette documentation

Chaque différence est classée dans l'une des quatre catégories suivantes :

| Catégorie | Définition | Exemple |
|---|---|---|
| Ajout fonctionnel | La capacité n'existait pas réellement dans RN | Sign in with Apple natif, routing notifications 8/9 |
| Réparation fonctionnelle | Le code ou l'écran existait, mais le parcours était cassé ou instable | login password, Home vide, Wishlist round-trip, appui Search |
| Parité UI | La fonction existait ; seul le rendu ou la hiérarchie différait | tab bar, Calendar, Bookings, Sort, Filters |
| Exception volontaire | Swift contient un défaut ou une version moins riche qui ne doit pas être copiée | bas de Profile `Coming Soon`, overflow Notifications |

Cette classification empêche de gonfler artificiellement la liste de nouvelles fonctionnalités et explique précisément l'apport du code Swift.

## Règles de mise en œuvre

- Modifier les routes réellement actives, car les deux bases contiennent des écrans historiques ou dupliqués.
- Réutiliser les composants et services RN existants lorsque la fonction existe déjà.
- Préserver les données, Redux, API calls, bookings, tickets, notes, Q&A et deep links.
- Ajouter des labels d'accessibilité sur les actions nécessaires aux tests sans transformer toute une carte en élément unique.
- Utiliser le bundle JavaScript embarqué pour les tests iOS automatisés afin d'éviter une dépendance fragile à Metro.
- Tester Swift et RN sur deux simulateurs séparés car les deux apps partagent `com.ondeen.user`.
- Ne jamais stocker les identifiants, mots de passe ou OTP de test dans Git.

## Environnement de référence final

| Paramètre | Swift | React Native |
|---|---|---|
| Modèle | iPhone 17 Pro Max | iPhone 17 Pro Max |
| Version iOS | 26.4.1 | 26.4.1 |
| Résolution de capture | 1320 × 2868 | 1320 × 2868 |
| Bundle ID | `com.ondeen.user` | `com.ondeen.user` |
| Simulateur | `OnDeen Swift iPhone 17 Pro Max` | `iPhone 17 Pro Max` |
| Données | même compte et données serveur | même compte et données serveur |

Les villes peuvent différer si l'état de localisation des deux simulateurs n'a pas été normalisé. Cet écart doit être classé « données/état », pas « layout ».

## Ce qui est inclus

- lecture du code Swift et React Native ;
- audit initial documenté ;
- comparaison manuelle des applications lancées ;
- corrections fonctionnelles RN ciblées ;
- alignement UI des principaux parcours ;
- tests XCUITest réutilisables ;
- captures comparables sur appareil identique ;
- contrôle rapide Apple Pay ;
- documentation finale.

## Ce qui n'est pas déclaré terminé

- transaction Apple Pay réelle sur un vrai iPhone avec Wallet ;
- confirmation Stripe webhook et booking durable ;
- Stripe Connect, wallet organisateur, split, remboursements et payouts ;
- validation Google Pay Android ;
- régression Android complète ;
- localisation interactive finale sur vrai iPhone ;
- réparation de la configuration ESLint/Jest existante ;
- acceptation finale par le Product Owner.

---

Précédent : [Index](./index.md) · Suite : [02 — Parité UI écran par écran](./02-ui-parity-screen-by-screen.md)
