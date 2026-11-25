# 05A — Chronologie complète des preuves locales

> Navigation : [Index](./index.md) · [Catalogue des tests](./05-test-catalog.md) · **Chronologie** · [Protocole visuel](./06-visual-comparison-protocol.md) · [Driver iOS](./07-ios-ui-driver-guide.md)

## Règle de lecture

Le dossier local contient plusieurs types de preuves :

- **capture manuelle** : confirme un rendu observé, mais ne prouve pas automatiquement le parcours complet ;
- **attachment XCUITest** : capture produite pendant une méthode de test ;
- **test avec assertion** : vérifie un élément ou un changement d'état ;
- **result bundle final** : donne un statut Passed/Failed reproductible ;
- **capture de debug/failure** : sert à expliquer un problème, pas à revendiquer une réussite.

Cette distinction est essentielle. Une image portant `after-fix` dans son nom n'est pas, à elle seule, une preuve automatisée.

## Vue d'ensemble des campagnes locales

| Période/dossier | Nature | Volume observé | Rôle dans ce chantier |
|---|---|---:|---|
| `20260613-231908` | captures manuelles RN | 5 PNG | lancement initial, choix du simulator, redbox |
| `20260613-234038` | captures manuelles RN | 3 PNG | rebuild/relaunch/splash |
| `20260626-211530` | captures manuelles RN | 2 PNG | lancement et Event Detail |
| `20260626-214951` | captures manuelles RN | 4 PNG | Home, input helper, map bypass, safe area |
| `20260626-222525` | captures manuelles RN | 4 PNG | booking/payment/ticket/QR/notification/download |
| `20260626-230800` | captures manuelles RN | 2 PNG | modal/QR après attente |
| `20260626-231600` | capture manuelle RN | 1 PNG | auth directe/QR |
| `20260627-001249` | capture manuelle RN | 1 PNG | safe areas |
| `profile-debug-*` juillet | captures manuelles RN | 6 PNG utiles | chargement Profile et fallback fetch |
| `20260811-185946` RN | audit + XCUITest attachments | 24 PNG, 3 manifests | baseline RN avant synchronisation |
| `20260811-185946` Swift | parcours manuel référence | 19 PNG | baseline Swift écran par écran |
| `20260811-200606` | captures manuelles de mise en œuvre | 28 PNG | progression Home/Auth/Calendar/Location/Profile |
| `20260811-214327` | captures + attachments | 18 PNG, 1 manifest | Notifications, fontes, Sort/Filters/Location, sections event |
| `20260812-104413` | régression finale | 51 PNG, 3 vidéos, 11 manifests et `.xcresult` | preuve assertive finale et comparaison même device |

Tous ces dossiers sont ignorés par Git. Leur présence dépend de la machine locale.

## Juin 2026 — stabilisation iOS antérieure à la parité Swift

Ces campagnes ne sont pas des comparaisons Swift/RN. Elles montrent le travail de stabilisation qui existait déjà et explique pourquoi la base RN ne devait pas être jetée.

### `20260613-231908`

- `ios-step-01-current` ;
- `ios-step-02-iphone15-current` ;
- `ios-step-03-launched` ;
- `ios-step-04-after-run-ios` ;
- `ios-step-05-after-redbox-fixes`.

### `20260613-234038`

- rebuild ;
- relaunch ;
- attente du splash.

### `20260626-211530` à `20260627-001249`

Les noms d'artifacts documentent les vérifications manuelles successives :

- Event Detail sur iPhone 17 ;
- Home après correction ;
- contournement carte iOS ;
- safe area et fetch detail ;
- booking/payment ;
- formatter/ticket ;
- participant du ticket ;
- QR, notification et download ;
- modal QR ;
- auth directe ;
- safe areas globales.

Niveau de preuve : captures manuelles historiques. Elles ne sont pas comptées dans le score final 7/7 XCUITest.

## Juillet 2026 — debug Profile RN

Les dossiers `profile-debug-20260710-*` suivent le Profile à travers :

- relaunch ;
- bundle/live JS ;
- état loaded ;
- seconde vérification loaded ;
- fallback fetch iOS ;
- vérification finale du fallback.

Cette chronologie confirme que le Profile P0 avait déjà fait l'objet d'un travail spécifique avant la copie visuelle Swift. C'est l'une des raisons de sa conservation.

Niveau de preuve : captures de diagnostic, non tests de parité finaux.

## 11 août 2026 — audit initial Swift/RN

### Parcours manuel Swift `20260811-185946`

Les 19 captures couvrent :

1. launch ;
2. notification dismissed ;
3. guest Home ;
4. login ;
5. e-mail login ;
6. e-mail OTP ;
7. authenticated Home ;
8. Calendar ;
9. Bookings ;
10. Profile ;
11. Profile Settings ;
12. Event Detail ;
13. Help & Support ;
14. relaunched Home ;
15. second Event Detail ;
16. Booking Detail ;
17. Search ;
18. Notifications ;
19. Wishlist.

Ces images sont la source visuelle historique de l'[audit initial](../../report/swift-vs-react-native-user-audit.md).

### Baseline RN manuelle

Les captures `rn-step-01` à `rn-step-06` couvrent launch, guest Home, bottom sheet/login initial, login et Email OTP.

### `test20ReactNativeAuthenticatedAudit`

Attachments produits : authenticated Home, Calendar, Bookings, Profile et Profile Settings.

Niveau de preuve : méthode composite automatisée avec assertions sur les champs d'authentification ; captures de cinq écrans après login.

### `test21ReactNativeScreenAudit`

Attachments : Home, Calendar, Bookings, Booking Detail, Profile, Settings, Event Detail, tentative Search et Notifications.

Découverte importante : la capture appelée `rn-step-15-search` montrait encore Home. Le test d'audit a donc révélé que l'appui Search ne naviguait pas correctement ; il ne doit pas être compté comme Search réussi.

### `test22ReactNativeSearchAudit`

Test isolé de la surface Search. Il a confirmé la fragilité de l'appui avant la correction du champ non éditable imbriqué.

## 11 août 2026 — synchronisation visuelle progressive

### `20260811-200606`

Les 28 captures documentent les étapes manuelles suivantes :

- Home après première synchronisation ;
- navigation Search ;
- Calendar ;
- auth phone-first et Email OTP ;
- vérification OTP ;
- Home/Calendar/Bookings authentifiés ;
- tentative Profile hybride ;
- Settings ;
- données Home et tab fix ;
- tab pill ;
- Location style Swift ;
- guest bottom sheet ;
- reset guest ;
- carte statique Location ;
- restauration du Profile RN décidée par le propriétaire ;
- ouverture Settings ;
- logout ;
- vérifications répétées guest sheet ;
- fresh install ;
- Location ;
- guest Calendar ;
- corrections d'icônes Location.

Niveau de preuve : journal visuel de mise en œuvre. Les répétitions montrent les itérations ; seule la campagne finale tranche le statut.

### `20260811-214327`

Captures manuelles :

- Notifications avant/après build ;
- plusieurs itérations de toolbar ;
- mapping des fontes Home ;
- Home avec bundle ;
- Notifications corrigées ;
- Event Facilities/Important Information ;
- Location ;
- Wishlist avant/après correction de layout.

Attachments XCUITest exportés dans `xcresult-222635` :

- `test37HomeSortAndFilters` → Sort sheet et Filters ;
- `test39LocationLayout` → Location.

Niveau de preuve : mélange de captures de debug et d'attachments. Ces résultats ont servi à décider les dernières corrections, puis ont été rejoués dans la campagne finale.

## 12 août 2026 — régression finale

La campagne `20260812-104413` est la preuve de référence. Elle contient :

- baselines et captures de failures explicites ;
- result bundles de chaque scénario ;
- attachments Sort/Filters, Event sections, Organizer, Booking tabs et Core ;
- comparaison Swift/RN sur iPhone 17 Pro Max identique ;
- vidéos XCUITest de certains échecs exploratoires ;
- dernière relance Swift avec assertion Completed.

### Captures de failure conservées

- `ios-step-04-wishlist-strict-failure` ;
- `ios-step-05-information-final-failure` ;
- `test37-current-failure` et `test37-current-failure-2` ;
- `test36-final-failure/` ;
- `rn-wishlist-after-add-failure` dans la campagne précédente.

Elles expliquent les durcissements du driver et ne sont pas présentées comme des régressions finales encore ouvertes.

### Résultats assertifs finaux

- `test36-information-facilities-relaunch-2.xcresult` : Passed ;
- `test37-sort-filters-final-3.xcresult` : Passed ;
- `test38-wishlist-final.xcresult` : Passed ;
- `test39-location-final.xcresult` : Passed ;
- `test40-organizer-final.xcresult` : Passed ;
- `test41-tabs-final.xcresult` : Passed ;
- `test42-core-asserted-final.xcresult` : Passed ;
- `swift-max-core-asserted-final.xcresult` : Passed ;
- stages auth Swift Prepare/Email/OTP : Passed.

Le détail de toutes les tentatives, y compris Failed/Unknown, se trouve dans [05 — Catalogue complet](./05-test-catalog.md).

## Ce qui est versionné et ce qui ne l'est pas

### Versionné

- driver XCUITest ;
- labels/accessibility fixes utiles ;
- documentation du protocole ;
- noms et résultats des bundles finaux ;
- checklist reproductible.

### Local et ignoré

- PNG ;
- MP4 ;
- `.xcresult` ;
- manifests exportés ;
- logs ;
- DerivedData ;
- sessions/tokens éventuels.

La documentation conserve le sens des preuves sans exposer ni gonfler le dépôt avec des artifacts lourds.

---

Précédent : [05 — Catalogue des tests](./05-test-catalog.md) · Suite : [06 — Protocole de comparaison visuelle](./06-visual-comparison-protocol.md)
