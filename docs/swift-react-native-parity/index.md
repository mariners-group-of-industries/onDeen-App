# Dossier de parité OnDeen User — Swift vers React Native

Date de référence : 12 août 2026<br>
Application produit conservée : `OnDeenUser` (React Native)<br>
Référence visuelle : `OnDeenUserSwiftApp` (Swift/UIKit)

> Navigation : **Index** · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · [Tests](./05-test-catalog.md) · [Acceptation](./09-manual-acceptance-checklist.md)

## Résultat en une phrase

L'application React Native reste la base produit, conserve le scope V2/P0, et couvre désormais le périmètre visuel Swift audité à environ **97 % de parité perceptible**, sans recopier les défauts Swift connus.

Ce pourcentage est une estimation de parité produit sur les écrans et parcours comparés. Ce n'est pas une mesure automatisée pixel par pixel. La validation finale appartient au Product Owner sur le même modèle d'iPhone, avec les mêmes données et le même état de localisation.

## Pourquoi ce dossier existe

Ce dossier répond à quatre questions qui ne doivent plus être mélangées :

1. Quelles différences UI existaient entre Swift et React Native ?
2. Quelles fonctionnalités manquaient réellement dans React Native et ont été ajoutées grâce à l'étude du code Swift ?
3. Quelles fonctionnalités existaient déjà mais étaient cassées, cachées ou visuellement différentes ?
4. Qu'est-ce qui a été testé, avec quel environnement et quel résultat ?

## Parcours de lecture

### Pour le Product Owner

1. [Parité UI écran par écran](./02-ui-parity-screen-by-screen.md)
2. [Fonctionnalités Swift ajoutées ou réparées dans React Native](./03-swift-features-added-to-react-native.md)
3. [Checklist d'acceptation manuelle](./09-manual-acceptance-checklist.md)

### Pour les développeurs

1. [Contexte, règles et décisions](./01-context-and-decisions.md)
2. [P0 React Native préservé](./04-react-native-p0-preserved.md)
3. [Guide du driver iOS](./07-ios-ui-driver-guide.md)
4. [Inventaire des changements](./10-change-inventory.md)
5. [Travail restant et risques](./11-remaining-work-and-risks.md)

### Pour la QA

1. [Catalogue complet des tests](./05-test-catalog.md)
2. [Protocole de comparaison visuelle](./06-visual-comparison-protocol.md)
3. [Checklist d'acceptation manuelle](./09-manual-acceptance-checklist.md)

## Sommaire complet

| Document | Contenu |
|---|---|
| [01 — Contexte et décisions](./01-context-and-decisions.md) | Objectif, source de vérité, règles de migration, exceptions volontaires et définition de la parité |
| [02 — UI écran par écran](./02-ui-parity-screen-by-screen.md) | Analyse visuelle détaillée : avant RN, référence Swift, résultat RN et niveau de preuve |
| [03 — Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) | Fonctions réellement ajoutées, fonctions réparées, alignements seulement visuels et défauts non copiés |
| [04 — P0 RN préservé](./04-react-native-p0-preserved.md) | Mapping du scope `ondeen-v2-p0-scope.md` et raisons de conserver la valeur React Native |
| [05 — Catalogue des tests](./05-test-catalog.md) | Tous les tests XCUITest `00` à `42`, séries finales, tentatives exploratoires, résultats et limites |
| [05A — Chronologie des preuves](./05a-test-evidence-timeline.md) | Toutes les campagnes locales connues, de la stabilisation iOS aux captures et assertions finales |
| [06 — Protocole visuel](./06-visual-comparison-protocol.md) | Même appareil, même résolution, états à normaliser, captures et méthode de comparaison |
| [07 — Guide du driver iOS](./07-ios-ui-driver-guide.md) | Installation, commandes, variables d'environnement, lancement RN/Swift et export des preuves |
| [08 — Audit Apple Pay](./08-apple-pay-audit.md) | Contrôle rapide du câblage frontend et limites du futur chantier paiement |
| [09 — Acceptation manuelle](./09-manual-acceptance-checklist.md) | Scénario Product Owner/QA reproductible et modèle de compte rendu |
| [10 — Inventaire des changements](./10-change-inventory.md) | Commits, zones de code touchées, modifications locales finales et hygiène Git |
| [11 — Restant et risques](./11-remaining-work-and-risks.md) | Paiement réel, Android, vrai appareil, dette de tests et ordre conseillé |

## Documents de référence

- [Scope V2/P0 protégé](../../ondeen-v2-p0-scope.md)
- [Audit initial avant implémentation](../../report/swift-vs-react-native-user-audit.md)
- [Rapport de livraison consolidé](../../report/swift-react-native-parity-delivery-report.md)
- [Guide P0 historique](../p0-testing-guide.md)
- [Note de parité Android](../android-ui-parity-note.md)
- [Driver XCUITest réutilisable](../../.ios-run/README.md)

## Statut synthétique

| Domaine | Statut au 12 août 2026 |
|---|---|
| Écrans Swift visibles demandés | Couverts sur le périmètre audité |
| Parité UI perceptible | Environ 97 % |
| Série RN ciblée finale | 7/7 scénarios passés |
| Parcours principal Swift sur appareil identique | Passé |
| Authentification Swift staged | Préparation, e-mail et OTP passés |
| P0 React Native | Conservé |
| Sign in with Apple | Intégration frontend/native RN ajoutée |
| Apple Pay | Câblage frontend contrôlé ; transaction réelle non validée |
| Android | Régression finale encore requise |
| Validation PO | À effectuer avec la checklist dédiée |

## Règle de maintenance

Toute future modification de parité doit mettre à jour au minimum :

- le tableau de l'écran concerné dans le document UI ;
- la ligne fonctionnelle correspondante si une capacité change ;
- le catalogue des tests si un scénario est ajouté ou modifié ;
- la checklist manuelle si le parcours Product Owner change ;
- le document des risques si une validation reste différée.

---

Suite : [01 — Contexte, objectifs et décisions](./01-context-and-decisions.md)
