# 10 — Inventaire des changements de parité

> Navigation : [Index](./index.md) · [Fonctions issues de Swift](./03-swift-features-added-to-react-native.md) · [Tests](./05-test-catalog.md) · **Inventaire** · [Risques](./11-remaining-work-and-risks.md)

## Jalons Git déjà poussés

| Commit | Objet | Volume |
|---|---|---|
| `b5f7e24` | Audit initial Swift/RN | Documentation d'audit avant implémentation |
| `7d6fefd` | Premier alignement RN avec Swift | 44 fichiers, 1 026 insertions, 347 suppressions |
| `4ffe550` | Finition visuelle des parcours | 45 entrées de fichiers, 681 insertions, 491 suppressions |
| `22e3bed` | Driver iOS réutilisable | 9 fichiers, 1 495 insertions, 1 suppression |

Les deux commits d'implémentation représentent ensemble 1 707 insertions et 838 suppressions. Le nombre de fichiers des deux stats ne doit pas être additionné comme nombre de fichiers uniques, car certaines zones ont été modifiées dans les deux commits.

Branche observée pendant la documentation : `main`, alignée avec `origin/main` avant les modifications locales finales.

## Commit `7d6fefd` — alignement fonctionnel et shell

### Infrastructure et intégrations iOS

- `App.jsx` : `StripeProvider` et merchant ID ;
- entitlements Apple Pay ;
- dépendances Apple auth/Stripe ;
- helper Sign in with Apple ;
- séparation Apple/Google.

### Authentification

- inputs e-mail sans autocapitalisation ;
- login password corrigé ;
- écrans Email/Mobile OTP rapprochés ;
- gestion d'erreur et loading ;
- modal invité transformée en bottom sheet.

### Navigation

- tab bar flottante ;
- capsule active ;
- protection des tabs en mode invité ;
- route Change Password exposée.

### Home et découverte

- fallback d'événements publics ;
- header, catégories et cards ;
- recherche tactile ;
- localisation Simulator sûre ;
- Calendar et Bookings première passe.

### Paiement et notifications

- option Apple Pay ;
- confirmation Platform Pay ;
- routage notifications types 8/9.

## Commit `4ffe550` — finition UI écran par écran

### Design system

- noms réels des fontes ;
- SF Pro Rounded / All Round Gothic ;
- headers et composants de labels ;
- densité typographique commune.

### Sort et Filters

- bottom sheet Sort Swift-like ;
- radios, X et CTA ;
- date, ticket type, journey chips ;
- catégories, organisateurs, gender ;
- footer Clear/Apply.

### Home, Calendar et Bookings

- catégories et event cards ;
- Calendar mois/année/today/dots ;
- Upcoming/Completed cards ;
- participants et recherche.

### Event Details

- carousel/hero ;
- tabs et HTML ;
- règles/Important Information ;
- Facilities ;
- Material et Q&A ;
- Organizer profile.

### Wishlist, Profile Settings et Notifications

- cartes/états Wishlist ;
- liste Settings ;
- toolbar/list/items Notifications ;
- espaces et tailles proches de Swift.

## Commit `22e3bed` — `.ios-run`

Le dossier versionné contient :

- README du driver ;
- projet Xcode hôte ;
- scheme partagé ;
- projet `project.yml` ;
- test target XCUITest ;
- driver initial `00` à `42` ;
- règles `.gitignore` locales.

Les builds, DerivedData, screenshots, vidéos, logs, tokens et `.xcresult` restent ignorés.

## Passe locale finale non encore commitée au moment de ce document

### Code RN

- [`RenderListItem.jsx`](../../OnDeenUser/src/screens/BottomHomePage/RenderListItem.jsx) : carte parent non accessible pour exposer le cœur enfant ;
- [`WishlistCart.jsx`](../../OnDeenUser/src/screens/Wishlist/WishlistCart.jsx) : même correction d'accessibilité ;
- [`FacilitiesContainer.jsx`](../../OnDeenUser/src/screens/FirstEventDetailsPage/FacilitiesContainer.jsx) : retrait d'un wrapper aux rayons contradictoires ;
- [`styles.tsx`](../../OnDeenUser/src/screens/FirstEventDetailsPage/styles.tsx) : marges, overflow, fond et espacement final Important Information/Facilities.

### Driver

- bundle JS forcé à chaque launch ;
- `returnToHome()` commun Swift/RN plus robuste ;
- support du back Swift `ic_back_navigation` ;
- Wishlist stricte par labels `Add/Remove` ;
- Sort avec fallback puis assertion sur la sheet ;
- Completed Bookings avec fallback puis assertion sur le heading.

### Git hygiene

- `OnDeenUserSwiftApp/DerivedData-Parity-Max/` ajouté explicitement au `.gitignore` ;
- artifacts locaux toujours ignorés ;
- aucun secret ajouté au driver ou aux rapports.

### Documentation

- rapport de livraison consolidé ;
- bannière de statut sur l'audit initial ;
- présent dossier `docs/swift-react-native-parity/` avec index et chapitres liés.

## Zones de code principales par écran

| Écran/feature | React Native | Référence Swift principale |
|---|---|---|
| Auth | `src/screens/SignupScreen`, `LoginEmailPassword` | `Controller/Authentication` |
| Tab bar/Home | `navigation/MainNavigator.jsx`, `BottomHomePage` | `Controller/Main/Home` |
| Search | `BottomHomePage/GlobalSearch.jsx` | `Controller/Main/Search` |
| Location | `BottomHomePage/UpdateLocation.jsx` | `Controller/Main/Address` |
| Filters | `src/modals/Filter*`, `SortFilter.jsx` | `Controller/Main/Filter` |
| Calendar | `screens/AllCalendar` | `Controller/Main/Calander` |
| Bookings | `screens/BookingListPage` | `Controller/Main/MYBookings` |
| Event Details | `FirstEventDetailsPage`, `SecondEventDetailsPage` | `Controller/Main/EventDetail`, BookingDetail |
| Wishlist | `screens/Wishlist`, `WishlistButton.jsx` | `Controller/Main/Home/Wishlist` |
| Notifications | `screens/Notification`, navigation services | `Controller/Main/Notification` |
| Organizer | `screens/OrganizerProfile` | `Controller/Main/OrganizerProfile` |
| Profile/Settings | `ProfileScreen`, `ProfileSetting` | `Controller/Main/MYProfile` |
| Payment | `screens/PaymentsScreen`, `App.jsx`, entitlements | `Controller/Main/PAYMENT` |

## Documents produits

- [Index du dossier](./index.md)
- [Audit initial](../../report/swift-vs-react-native-user-audit.md)
- [Rapport de livraison](../../report/swift-react-native-parity-delivery-report.md)
- [Scope P0](../../ondeen-v2-p0-scope.md)
- [Catalogue des tests](./05-test-catalog.md)
- [Guide du driver](./07-ios-ui-driver-guide.md)

## Règles pour le prochain commit

Avant de committer/pusher cette passe finale :

1. laisser le propriétaire tester manuellement comme demandé ;
2. vérifier `git diff --check` ;
3. vérifier tous les liens Markdown ;
4. confirmer que `DerivedData-Parity-Max` est ignoré ;
5. confirmer qu'aucun artifact `.xcresult`, screenshot ou log n'est staged ;
6. relire `git diff --cached --stat` avant le commit ;
7. ne pas inclure de secret ;
8. utiliser un message qui distingue code, tests et documentation si plusieurs commits sont préférables.

---

Précédent : [09 — Acceptation manuelle](./09-manual-acceptance-checklist.md) · Suite : [11 — Travail restant et risques](./11-remaining-work-and-risks.md)
