# 11 — Travail restant et risques

> Navigation : [Index](./index.md) · [P0 préservé](./04-react-native-p0-preserved.md) · [Tests](./05-test-catalog.md) · [Acceptation](./09-manual-acceptance-checklist.md) · **Risques**

## Ce qui ne reste plus

Il ne reste pas une liste importante d'écrans Swift visibles absents de React Native sur le périmètre audité. Les parcours principaux ont été couverts et rapprochés : auth, Home, recherche, tri, filtres, Wishlist, Location, Calendar, Bookings, Details, Material, Q&A, Participants, Organizer, Settings et Notifications.

Le reliquat concerne surtout les validations réelles multi-plateformes, le paiement et l'acceptation produit finale.

## Priorité 1 — Acceptation Product Owner

Exécuter [la checklist manuelle](./09-manual-acceptance-checklist.md) avec :

- même iPhone ;
- même iOS ;
- même compte ;
- même localisation ;
- même dataset ;
- captures côte à côte.

Le Profile doit être présenté comme une décision explicite : RN garde son P0 et son bouton Settings, au lieu de recopier le bas Swift incomplet.

## Priorité 2 — Apple Pay et paiement transverse

### Validation immédiate minimale

- vrai iPhone ;
- Wallet ;
- signing/capability ;
- événement payant ;
- autorisation Apple Pay ;
- PaymentIntent confirmé ;
- webhook reçu ;
- booking durable ;
- absence de doublon.

### Chantier complet ultérieur

- User checkout ;
- Organiser Stripe Connect onboarding/status ;
- blocage de publication payante ;
- backend PaymentIntent et webhook ;
- split/application fee ;
- wallet et soldes ;
- remboursements ;
- payouts ;
- disputes ;
- ledger/réconciliation ;
- admin/support ;
- idempotence et observabilité.

Le [contrôle rapide Apple Pay](./08-apple-pay-audit.md) ne remplace pas ce chantier.

## Priorité 3 — Régression Android

De nombreux composants RN modifiés sont partagés avec Android :

- fonts et scaling ;
- tab bar ;
- Home/cards ;
- Sort/Filters ;
- Calendar ;
- Bookings ;
- Details ;
- Wishlist ;
- Notifications ;
- Profile Settings.

À vérifier sur Android :

- safe areas/navigation bar ;
- font loading et line height ;
- hauteur des modales ;
- back hardware ;
- clavier ;
- cartes/permissions ;
- Google Pay ;
- performance des listes ;
- accessibilité TalkBack.

La [note de parité Android](../android-ui-parity-note.md) doit être actualisée après cette campagne.

## Priorité 4 — Localisation sur vrai iPhone

Le fallback Simulator est volontaire. La validation réelle doit couvrir :

- permission When In Use ;
- refus initial et nouvelle tentative ;
- position courante ;
- autocomplete ;
- géocodage ;
- déplacement du pin ;
- sauvegarde ville/coordonnées ;
- retour Home ;
- distances recalculées ;
- absence du crash Animated/react-native-maps.

## Priorité 5 — Dette de tests du projet RN

### ESLint

Le script `npm run lint` existe, mais l'audit a observé une configuration absente ou non trouvée. Il faut :

- choisir la configuration compatible RN 0.78 ;
- éliminer les erreurs de parsing avant les règles stylistiques ;
- éviter un formatage massif non lié ;
- ajouter le lint à la CI.

### Jest/Babel

La suite est détectée mais échoue avant les assertions à cause de la transformation des imports. Il faut :

- aligner Babel/Jest avec RN 0.78 ;
- configurer `transformIgnorePatterns` pour les modules RN nécessaires ;
- mocker les modules natifs ;
- ajouter des tests unitaires sur normalisation Home/Notifications, routing 8/9 et montant paiement.

### Tests UI

- ajouter une assertion dédiée Home → Search ;
- ajouter auth RN complet dans un seul scénario déterministe ou conserver staged avec orchestration ;
- tester notifications 8/9 avec fixtures serveur ;
- tester booking gratuit complet ;
- tester erreurs et états vides ;
- exécuter un subset sur CI Simulator.

## Priorité 6 — Sécurité et logs

- réduire les `console.log` RN ;
- supprimer/masquer tout log Authorization côté Swift ;
- vérifier les restrictions des clés Google Maps présentes dans les sources ;
- empêcher les tokens dans artifacts/CI ;
- ne jamais versionner les comptes de test ;
- nettoyer les anciens shortcuts debug avant production.

## Priorité 7 — Dette d'architecture

- documenter route → composant actif ;
- consolider les anciennes/nouvelles versions de Event Details ;
- consolider les helpers de paiement dupliqués ;
- centraliser davantage les tokens UI ;
- décider d'une stratégie de scaling partagée ;
- planifier la migration de l'ancienne architecture iOS RN avant de retirer les fallbacks.

## Risques résiduels

| Risque | Impact | Mitigation |
|---|---|---|
| Données serveur changeantes | Captures/tests instables | Seeds déterministes et préparation d'état |
| Même bundle ID Swift/RN | Une app remplace l'autre | Deux simulateurs dédiés |
| Metro absent | Faux crash RN Debug | Bundle JS forcé dans le driver |
| Accessibilité différente UIKit/RN | Sélecteur fragile | Labels stables + fallback + assertion destination |
| Wishlist persistée serveur | Run non déterministe | Nettoyage initial et attente de transition |
| Scaling Pro/Pro Max | Fausse conclusion UI | Même modèle obligatoire |
| Paiement testé uniquement en UI | Faux sentiment de sécurité | Webhook + état durable obligatoires |
| Composants partagés Android | Régression Android | Campagne Android dédiée |
| Profile Swift moins riche | Perte du P0 si recopié | Décision Profile documentée |
| Logs historiques sensibles | Fuite de tokens | Redaction et artifacts ignorés |

## Ordre conseillé

1. Test manuel du propriétaire sur RN actuel.
2. Corrections uniquement sur écarts reproductibles au même device.
3. Commit/push de la passe finale et de cette documentation après validation.
4. Régression Android.
5. Vrai iPhone pour Location et Apple Sign-In.
6. Chantier Apple Pay/Stripe complet avec backend et Organiser.
7. Réparation ESLint/Jest et automatisation CI.
8. Nettoyage architectural/logs.

## Définition de « terminé » pour la parité actuelle

La phase peut être clôturée lorsque :

- la checklist PO est acceptée ;
- les écarts mineurs acceptés sont écrits ;
- les 7 scénarios RN ciblés restent verts ;
- le test core Swift/RN reste vert au même device ;
- le Profile P0 est accepté comme exception ;
- Android ne présente pas de régression bloquante ;
- Apple Pay reste explicitement différé ou reçoit une vraie preuve E2E ;
- code, tests et docs sont commités sans artifacts ni secrets.

## Conclusion

La stratégie reste la bonne : garder React Native comme application produit, utiliser Swift comme référence perceptible, et ne copier que ce qui améliore réellement le produit. Le travail restant doit renforcer la preuve technique et multi-plateforme, pas recommencer l'interface.

---

Précédent : [10 — Inventaire des changements](./10-change-inventory.md) · Retour : [Index du dossier](./index.md)
