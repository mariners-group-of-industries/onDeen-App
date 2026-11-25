# 05 — Catalogue complet des tests de parité

> Navigation : [Index](./index.md) · [UI écran par écran](./02-ui-parity-screen-by-screen.md) · **Tests** · [Protocole visuel](./06-visual-comparison-protocol.md) · [Driver iOS](./07-ios-ui-driver-guide.md)

## Périmètre de preuve

La validation combine :

- lecture du code et des routes actives ;
- lancement/build des deux applications ;
- parcours manuels et captures ;
- helpers XCUITest unitaires pour explorer un écran ;
- scénarios XCUITest composites avec assertions ;
- comparaison finale Swift/RN sur le même modèle d'iPhone.

Le driver versionné est [`OnDeenUIDriverTests.swift`](../../.ios-run/ui-driver/Tests/OnDeenUIDriverTests.swift). Les `.xcresult`, captures et vidéos restent locaux sous un dossier ignoré.

Pour l'inventaire des campagnes de juin, juillet et août, consulter également [05A — Chronologie complète des preuves locales](./05a-test-evidence-timeline.md). Ce catalogue décrit les méthodes et résultats ; la chronologie distingue les tests assertifs des inspections manuelles et captures historiques.

## Environnement final

| Paramètre | Valeur |
|---|---|
| RN device | iPhone 17 Pro Max, UDID `A4599E3E-754E-4DA8-971F-883905155053` |
| Swift device | `OnDeen Swift iPhone 17 Pro Max`, UDID `86BF0536-B5A2-434B-9C10-D5203149ED28` |
| iOS | 26.4.1 sur les deux |
| Résolution | 1320 × 2868 sur les deux |
| Bundle ID piloté | `com.ondeen.user` |
| Dossier local de cette campagne | `OnDeenUser/artifacts/ios-ui-tests/20260812-104413/` |
| JS RN | bundle embarqué forcé par `ONDEEN_IOS_USE_BUNDLED_JS=1` |

Deux simulateurs sont nécessaires car une installation RN remplacerait Swift avec le même bundle ID, et inversement.

## Catalogue de toutes les méthodes du driver

### Tests 00–17 : primitives de navigation et authentification

| Test | But | Assertion/effet principal |
|---|---|---|
| `test00Prepare` | Lancer l'app, fermer une alerte système et passer l'onboarding si présent | Prépare un état pilotable |
| `test01DumpHierarchy` | Imprimer l'arbre d'accessibilité courant | Diagnostic des labels/types UIKit/RN |
| `test02OpenHome` | Ouvrir Home | Label puis fallback coordonnée |
| `test03OpenCalendar` | Ouvrir Calendar | Label puis fallback coordonnée |
| `test04OpenBookings` | Ouvrir Booking/Bookings | Supporte les deux libellés |
| `test05OpenProfile` | Ouvrir Profile | Label puis fallback coordonnée |
| `test06ConfirmGuestLogin` | Confirmer une demande de connexion invité | Support alert native et sheet custom |
| `test07OpenFirstVisibleEvent` | Ouvrir le premier événement seed visible | Label `Seed:` puis coordonnée |
| `test08TapBack` | Revenir en arrière | Bouton, navigation bar, image ou coordonnée |
| `test09OpenSearch` | Ouvrir Global Search | SearchField/TextField/texte/coordonnée |
| `test10OpenWishlist` | Ouvrir Wishlist | Label puis coordonnée |
| `test11OpenNotifications` | Ouvrir Notifications | Singulier/pluriel puis coordonnée |
| `test12OpenEmailLogin` | Ouvrir le parcours e-mail | Supporte `Continue with Email` et `Email OTP` |
| `test13SubmitSeedEmail` | Remplir l'e-mail de test et continuer | Exige `ONDEEN_UI_TEST_EMAIL` |
| `test14SubmitSeedOTP` | Remplir et soumettre l'OTP | Exige `ONDEEN_UI_TEST_OTP` |
| `test15ReactNativePasswordLogin` | Authentifier RN par e-mail/password | Exige e-mail + password ; asserts les champs |
| `test16OpenProfileSettings` | Ouvrir Settings | Texte ou icône par coordonnée |
| `test17DismissReactNativeWalkthrough` | Fermer une carte/tour RN | Helper de préparation historique |

Les numéros 18 et 19 ne sont pas utilisés. Ils sont volontairement laissés disponibles pour de futurs helpers sans renommer l'historique.

### Tests 20–35 : audits exploratoires et helpers de stabilisation

| Test | But | Nature |
|---|---|---|
| `test20ReactNativeAuthenticatedAudit` | Login password puis Home, Calendar, Bookings, Profile et Settings | Audit authentifié composite |
| `test21ReactNativeScreenAudit` | Capturer tabs, booking detail, profile, settings, event detail, search et notifications | Audit visuel historique par coordonnées |
| `test22ReactNativeSearchAudit` | Isoler Home → Search | Diagnostic du champ qui interceptait l'appui |
| `test23OpenCalendarCoordinate` | Ouvrir Calendar sans dépendre des labels | Helper coordonnée |
| `test24OpenBookingsCoordinate` | Ouvrir Bookings sans dépendre des labels | Helper coordonnée |
| `test25OpenProfileCoordinate` | Ouvrir Profile sans dépendre des labels | Helper coordonnée |
| `test26OpenHomeCoordinate` | Ouvrir Home sans dépendre des labels | Helper coordonnée |
| `test27OpenLocationCoordinate` | Ouvrir Location | Reproduction du crash initial |
| `test28OpenGuestBottomSheet` | Passer en guest puis ouvrir un tab protégé | Capture de `Continue to login` |
| `test29OpenEmailFlow` | Continuer depuis la sheet puis ouvrir Email | Audit du parcours demandé |
| `test30DismissCurrentTourCard` | Fermer un élément transitoire | Stabilisation d'état |
| `test31LogoutFromSettings` | Ouvrir la confirmation Logout puis confirmer | Assertions sur les actions |
| `test32DismissGuestAndOpenLocation` | Fermer la sheet invité puis ouvrir Location | Capture du fallback Simulator |
| `test33ReturnHomeAndOpenLocation` | Revenir depuis une pile inconnue puis ouvrir Location | Stabilisation de navigation |
| `test34OpenNotificationsFromHome` | Ouvrir Notifications par coordonnée | Diagnostic historique |
| `test35OpenAccessibleNotifications` | Ouvrir Notifications par son vrai label accessible | Assertion du bouton header |

### Tests 36–42 : régression finale ciblée

| Test | Parcours vérifié | Assertions clés | Résultat final RN |
|---|---|---|---|
| `test36EventInformationAndFacilities` | Home → event → scroll | `Important Information` et `Facilities` atteignables | Passé |
| `test37HomeSortAndFilters` | Home → Sort → close → Filters | retour Home, action Sort, X accessible, écran Filters | Passé |
| `test38WishlistRoundTrip` | état propre → add → list → remove → Home | transitions `Add/Remove`, titre présent puis absent | Passé |
| `test39LocationLayout` | Home → Location | navigation et capture stable sans crash | Passé |
| `test40OrganizerProfileParity` | event → `VIEW INFO` | heading Organizer présent | Passé |
| `test41BookedEventTabsAndParticipants` | booking → Details → Material → Q&A → Participants | tabs et heading Participants présents | Passé |
| `test42CoreScreenParity` | Home → Notifications → Calendar → Upcoming → Completed → Profile → Settings | navigation robuste et `COMPLETED BOOKINGS` réellement ouvert | Passé |

Résultat de la série finale ciblée RN : **7 scénarios, 7 réussites, 0 échec**.

## Result bundles finaux à retenir

| Scénario | Bundle final local | Résultat |
|---|---|---|
| Important Information/Facilities | `test36-information-facilities-relaunch-2.xcresult` | Passed 1/1 |
| Sort/Filters | `test37-sort-filters-final-3.xcresult` | Passed 1/1 |
| Wishlist | `test38-wishlist-final.xcresult` | Passed 1/1 |
| Location | `test39-location-final.xcresult` | Passed 1/1 |
| Organizer | `test40-organizer-final.xcresult` | Passed 1/1 |
| Booking tabs | `test41-tabs-final.xcresult` | Passed 1/1 |
| Core RN avec assertion Completed | `test42-core-asserted-final.xcresult` | Passed 1/1 |
| Core Swift même appareil | `swift-max-core-parity-final.xcresult` | Passed 1/1 |
| Core Swift avec assertion Completed | `swift-max-core-asserted-final.xcresult` | Passed 1/1 |
| Retour Home RN sur Pro Max | `rn-max-return-home.xcresult` | Passed 1/1 |
| Préparation Swift | `swift-max-prepare.xcresult` | Passed 1/1 |
| E-mail Swift staged | `swift-max-email-2.xcresult` | Passed 1/1 |
| OTP Swift staged | `swift-max-otp-2.xcresult` | Passed 1/1 |

## Historique exhaustif des result bundles de la campagne

Les échecs exploratoires ci-dessous ne sont pas masqués : ils expliquent comment le driver et les scénarios ont été durcis.

| Bundle | Résultat brut | Cause/lecture | Résolution |
|---|---|---|---|
| `rn-max-return-home.xcresult` | Passed 1/1 | Validation du helper Home RN | Conservé |
| `swift-max-auth-flow.xcresult` | Failed : 3 pass, 2 fail | Les variables d'auth exportées dans le shell n'étaient pas transmises comme prévu à chaque test du runner | Parcours découpé en étapes indépendantes |
| `swift-max-prepare.xcresult` | Passed 1/1 | Préparation Swift | Étape staged retenue |
| `swift-max-email-2.xcresult` | Passed 1/1 | Écran e-mail piloté | Étape staged retenue |
| `swift-max-otp-2.xcresult` | Passed 1/1 | OTP soumis | Étape staged retenue |
| `swift-max-core-parity.xcresult` | Failed 0/1 | Le segmented control Swift ne publiait pas toujours `Completed Bookings` comme bouton accessible | Fallback coordonnée puis vérification du contenu |
| `swift-max-core-parity-final.xcresult` | Passed 1/1 | Parcours core Swift après fallback | Bundle Swift final |
| `swift-max-core-asserted-final.xcresult` | Passed 1/1 | Même parcours relancé avec l'assertion explicite `COMPLETED BOOKINGS` | Bundle Swift final le plus strict |
| `test36-information-facilities.xcresult` | Passed 1/1 | Première validation ciblée | Remplacée ensuite par relaunch final |
| `test36-information-facilities-final.xcresult` | Failed 0/1 | Route/position scroll restaurée après relance ; l'information n'était pas atteinte | Navigation de retour/relaunch durcie |
| `test36-information-facilities-relaunch.xcresult` | Unknown 0/0 | Run interrompu/incomplet, aucune conclusion app | Ignoré comme preuve |
| `test36-information-facilities-relaunch-2.xcresult` | Passed 1/1 | Navigation corrigée | Bundle RN final |
| `test37-sort-filters-final.xcresult` | Failed 0/1 | L'action Sort n'était pas trouvée par la query d'accessibilité | Fallback coordonnée + assertion sur X |
| `test37-sort-filters-final-2.xcresult` | Failed 0/1 | Même famille de fragilité de sélection | Query finale durcie |
| `test37-sort-filters-final-3.xcresult` | Passed 1/1 | Sheet Sort et Filters capturés | Bundle RN final |
| `test38-wishlist.xcresult` | Passed 1/1 | Ancienne version moins stricte | Supplantée par round-trip strict |
| `test38-wishlist-strict.xcresult` | Failed 0/1 | État Wishlist serveur/Home stale après un run interrompu | Nettoyage initial + attente de transition |
| `test38-wishlist-strict-2.xcresult` | Passed 1/1 | Round-trip strict stabilisé | Confirmation intermédiaire |
| `test38-wishlist-final.xcresult` | Passed 1/1 | Version finale avec labels accessibles | Bundle RN final |
| `test39-location-final.xcresult` | Passed 1/1 | Location stable sur Simulator | Bundle RN final |
| `test40-organiser.xcresult` | Passed 1/1 | Première passe organizer | Confirmation intermédiaire |
| `test40-organizer-final.xcresult` | Passed 1/1 | Nommage et parcours final | Bundle RN final |
| `test41-details-tabs.xcresult` | Passed 1/1 | Details/Material/Q&A/Participants | Confirmation intermédiaire |
| `test41-tabs-final.xcresult` | Passed 1/1 | Parcours final | Bundle RN final |
| `test42-core.xcresult` | Passed 1/1 | Première capture core | Confirmation intermédiaire |
| `test42-core-final.xcresult` | Passed 1/1 | Captures RN finales comparables | Référence visuelle RN |
| `test42-core-asserted-final.xcresult` | Passed 1/1 | Assertion explicite sur le contenu Completed | Bundle RN final le plus strict |

## Incidents de test qui n'étaient pas des bugs UI produit

### Metro indisponible

Des runs initiaux ont produit un écran RCTFatal indiquant que l'app ne pouvait pas joindre `localhost:8081`. Ce n'était pas une régression de l'écran testé ; le runner activait une app Debug dépendante de Metro.

Correction : le driver place toujours `ONDEEN_IOS_USE_BUNDLED_JS=1` avant le lancement. Les tests ne dépendent plus de Metro.

### Accessibilité UIKit/RN différente

Certains contrôles Swift apparaissent comme images ou éléments génériques, tandis que RN publie des boutons. Le driver privilégie :

1. label accessible ;
2. variante de libellé ;
3. image UIKit connue ;
4. coordonnée normalisée en dernier recours ;
5. assertion sur le contenu de destination pour éviter un faux positif.

### État serveur Wishlist

La Wishlist est persistée côté serveur. Un run interrompu peut laisser l'événement sélectionné. Le test final nettoie l'état, attend le vrai label `Add to wishlist`, puis vérifie toutes les transitions.

## Tests techniques hors XCUITest

| Contrôle | Résultat de l'audit |
|---|---|
| Build/lancement Swift | Réussi |
| Build/lancement RN iOS avec bundle JS | Réussi |
| Lint RN | Non exécutable : configuration ESLint absente/incompatible |
| Jest RN | Échec avant assertions : transformation import/Babel |
| Tests API P0 shell | Présents mais non relancés comme partie de cet audit visuel |
| Android | Non lancé dans cette campagne iOS |

Lint/Jest et Android restent des dettes réelles ; les passes XCUITest ne doivent pas être utilisées pour prétendre le contraire.

## Politique des identifiants de test

- Aucun e-mail, mot de passe ou OTP n'est écrit dans les sources du driver.
- Les valeurs sont fournies au processus de test par variables d'environnement temporaires.
- Elles ne doivent pas apparaître dans les rapports, captures versionnées ou commandes copiées dans Git.
- Les artifacts restent ignorés, notamment parce que des logs tiers peuvent contenir des données de session.

## Critère de réussite d'un nouveau test

Un scénario est accepté comme preuve finale seulement si :

1. son `.xcresult` indique `Passed` ;
2. l'assertion confirme la destination, pas uniquement l'appui ;
3. la capture correspond au bon écran ;
4. l'état serveur requis est préparé ou nettoyé ;
5. l'app est lancée avec le bundle JS embarqué ;
6. toute différence de données est séparée de la différence de layout ;
7. le bundle final est nommé sans ambiguïté dans ce document.

---

Précédent : [04 — P0 RN préservé](./04-react-native-p0-preserved.md) · Suite : [05A — Chronologie des preuves](./05a-test-evidence-timeline.md)
