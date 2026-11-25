# 08 — Audit rapide Apple Pay

> Navigation : [Index](./index.md) · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · **Apple Pay** · [Acceptation](./09-manual-acceptance-checklist.md) · [Risques](./11-remaining-work-and-risks.md)

## Limite volontaire de cet audit

Le besoin était un contrôle rapide, pas l'ouverture du grand chantier Stripe/marketplace. Ce document vérifie donc que le frontend RN possède les pièces Apple Pay attendues et identifie précisément ce qui n'a pas encore été validé.

La conclusion ne doit pas être reformulée en « Apple Pay production terminé ».

## Ce que Swift a apporté comme référence

Le code Swift contient un parcours Apple Pay basé sur PassKit et Stripe :

- vérification de la capacité Apple Pay ;
- configuration d'une demande de paiement ;
- présentation du contrôleur d'autorisation ;
- création/usage d'un PaymentMethod Stripe ;
- confirmation du PaymentIntent ;
- mise à jour du statut backend.

Cette lecture a confirmé qu'Apple Pay était une capacité iOS réelle attendue, distincte du Google Pay Android listé dans le P0.

## Contrôles réalisés dans React Native

### Provider Stripe

[`App.jsx`](../../OnDeenUser/App.jsx) enveloppe l'application dans `StripeProvider` et fournit :

- la publishable key configurée par l'application ;
- `merchantIdentifier="merchant.com.ondeen.user"`.

### Capability et entitlements iOS

[`OnDeen.entitlements`](../../OnDeenUser/ios/OnDeen/OnDeen.entitlements) contient :

```text
com.apple.developer.in-app-payments
└── merchant.com.ondeen.user
```

Le projet Xcode référence ce fichier d'entitlements. Le merchant ID correspond à celui du `StripeProvider`.

### Package Stripe installé

La dépendance déclarée est `@stripe/stripe-react-native` version `^0.45.0`. Les types et APIs employés dans le code correspondent à cette intégration :

- `usePlatformPay()` ;
- `isPlatformPaySupported()` ;
- `confirmPlatformPayPayment()` ;
- `PlatformPayButton` ;
- `PlatformPay.PaymentType`.

### Sélection du moyen de paiement

[`PaymentMethodContainer.jsx`](../../OnDeenUser/src/screens/PaymentsScreen/PaymentMethodContainer.jsx) présente Apple Pay comme un moyen réel, avec un état désactivé lorsque la plateforme ou l'appareil ne le supporte pas.

Le paiement carte existant reste disponible en fallback.

### Construction du panier

[`PaymentsScreen.jsx`](../../OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx) :

- calcule le montant depuis les tickets sélectionnés ;
- utilise `GB` comme pays marchand ;
- utilise `GBP` comme devise ;
- crée les cart items Apple Pay ;
- affiche le bouton natif lorsque Apple Pay est sélectionné.

### Confirmation Stripe

Le client secret du PaymentIntent backend est transmis à `confirmPlatformPayPayment`. Le code gère l'erreur retournée et ne poursuit vers la confirmation qu'après un retour de succès du SDK.

## Résultat de l'audit local

| Contrôle | Résultat |
|---|---|
| Provider Stripe racine | Présent |
| Merchant ID RN | Présent |
| Entitlement in-app payments | Présent |
| Cohérence merchant ID provider/entitlement | Cohérente |
| Détection du support | Présente |
| Option Apple Pay UI | Présente |
| Bouton natif | Présent |
| Pays/devise | GB/GBP |
| Montant basé sur les tickets | Présent |
| Confirmation PaymentIntent | Câblée |
| Transaction réelle Wallet | Non testée |
| Webhook + booking durable | Non testés |

Verdict : **aucun manque évident de câblage frontend local n'a été trouvé**. Cela justifie le statut « Apple Pay frontend câblé », pas « paiement end-to-end validé ».

## Pourquoi le Simulator ne suffit pas

Une preuve de paiement exige au minimum :

- un vrai iPhone compatible ;
- Wallet configuré avec une carte de test/conditions compatibles ;
- merchant ID et signing corrects dans le bon compte Apple Developer ;
- événement réellement payant ;
- PaymentIntent Stripe cohérent avec le montant/devise ;
- validation de l'autorisation Apple Pay ;
- webhook Stripe reçu et vérifié ;
- booking durable créé une seule fois ;
- statut visible côté User, Organiser et backend.

Une animation de succès ou une navigation vers un écran de confirmation ne démontre pas ces points.

## Scénario E2E à exécuter plus tard

1. Créer un événement payant seed avec tickets et capacité connue.
2. Vérifier que l'organisateur est correctement configuré pour le futur modèle Stripe Connect.
3. Ouvrir l'événement sur un vrai iPhone.
4. Choisir ticket/date/participant.
5. Sélectionner Apple Pay.
6. Vérifier le montant, le marchand et la devise dans la sheet système.
7. Autoriser le paiement.
8. Vérifier le PaymentIntent dans Stripe.
9. Vérifier la réception/idempotence du webhook.
10. Vérifier le booking durable et son ticket dans User.
11. Vérifier la réservation et le montant côté Organiser/admin.
12. Rejouer le webhook et confirmer qu'aucun doublon n'est créé.
13. Tester annulation, refus, timeout et retour app.
14. Documenter remboursement et état du wallet lorsque ce scope sera implémenté.

## Chantier paiement explicitement différé

- Stripe Connect onboarding organisateur ;
- blocage de publication payante si compte non connecté ;
- split et application fee ;
- wallet organisateur ;
- migration des soldes ;
- remboursements partiels/complets ;
- payouts ;
- disputes ;
- ledger et réconciliation ;
- idempotence transverse ;
- Google Pay Android ;
- observabilité et support admin.

Ces sujets concernent User + Organiser + Backend + Admin. Ils ne doivent pas être cachés derrière le bouton Apple Pay maintenant visible.

## Formulation recommandée au Product Owner

> L'option Apple Pay et sa configuration iOS/Stripe sont maintenant présentes dans l'application React Native. La validation d'un paiement réel sur iPhone, du webhook et de la réservation durable fera partie du chantier paiement complet.

---

Précédent : [07 — Guide du driver iOS](./07-ios-ui-driver-guide.md) · Suite : [09 — Checklist d'acceptation manuelle](./09-manual-acceptance-checklist.md)
