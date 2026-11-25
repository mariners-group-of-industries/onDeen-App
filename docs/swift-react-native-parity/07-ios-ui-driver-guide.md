# 07 — Guide du driver iOS de parité

> Navigation : [Index](./index.md) · [Tests](./05-test-catalog.md) · [Protocole visuel](./06-visual-comparison-protocol.md) · **Driver iOS** · [Acceptation](./09-manual-acceptance-checklist.md)

## Emplacement

- guide court historique : [`.ios-run/README.md`](../../.ios-run/README.md) ;
- projet Xcode : `.ios-run/ui-driver/OnDeenUIDriver.xcodeproj` ;
- scheme : `UIDriverHost` ;
- tests : [`.ios-run/ui-driver/Tests/OnDeenUIDriverTests.swift`](../../.ios-run/ui-driver/Tests/OnDeenUIDriverTests.swift).

Le driver est une app hôte XCUITest indépendante. Il pilote une application déjà installée grâce à son bundle ID. Cela permet d'utiliser les mêmes scénarios avec Swift et React Native.

## Prérequis

- Xcode et ses command-line tools ;
- runtime iOS Simulator installé ;
- CocoaPods pour construire les applications si nécessaire ;
- application cible construite et installée ;
- bundle ID par défaut `com.ondeen.user` ;
- données seed appropriées pour les scénarios 36–42.

## Construire/lancer React Native

Depuis la racine du dépôt, le runner principal sait construire User ou Organiser :

```sh
ONDEEN_USER_IOS_SIMULATOR='iPhone 17 Pro Max' \
ONDEEN_IOS_USE_BUNDLED_JS=1 \
./run-ios.sh user
```

Le mode bundle JS est le mode recommandé pour les tests. Il évite que l'app Debug affiche une erreur parce que Metro n'écoute pas sur `localhost:8081`.

Le runner remet les données de l'app à zéro par défaut. Pour préserver une session déjà authentifiée :

```sh
ONDEEN_USER_IOS_SIMULATOR='iPhone 17 Pro Max' \
ONDEEN_IOS_RESET_APP_DATA=0 \
ONDEEN_IOS_USE_BUNDLED_JS=1 \
./run-ios.sh user
```

## Construire/lancer Swift

Le runner Swift permet un lancement direct ou une reconstruction :

```sh
RUN_MODE=rebuild \
SIMULATOR_NAME='OnDeen Swift iPhone 17 Pro Max' \
DERIVED_DATA_PATH="$PWD/OnDeenUserSwiftApp/DerivedData-Parity-Max" \
./OnDeenUserSwiftApp/run-ios.sh
```

Une fois l'app installée :

```sh
RUN_MODE=direct \
SIMULATOR_NAME='OnDeen Swift iPhone 17 Pro Max' \
./OnDeenUserSwiftApp/run-ios.sh
```

Le dossier `OnDeenUserSwiftApp/DerivedData-Parity-Max/` est explicitement ignoré par Git.

## Lancer un test non authentifié

```sh
xcodebuild test \
  -project .ios-run/ui-driver/OnDeenUIDriver.xcodeproj \
  -scheme UIDriverHost \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' \
  -derivedDataPath .ios-run/ui-driver/DerivedData \
  -only-testing:UIDriverTests/OnDeenUIDriverTests/test42CoreScreenParity
```

Remplacer le nom final par la méthode voulue, par exemple :

- `test36EventInformationAndFacilities` ;
- `test37HomeSortAndFilters` ;
- `test38WishlistRoundTrip` ;
- `test39LocationLayout` ;
- `test40OrganizerProfileParity` ;
- `test41BookedEventTabsAndParticipants` ;
- `test42CoreScreenParity`.

## Conserver le result bundle

Utiliser un chemin explicite et unique :

```sh
xcodebuild test \
  -project .ios-run/ui-driver/OnDeenUIDriver.xcodeproj \
  -scheme UIDriverHost \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' \
  -derivedDataPath .ios-run/ui-driver/DerivedData \
  -resultBundlePath OnDeenUser/artifacts/ios-ui-tests/manual-run/test42.xcresult \
  -only-testing:UIDriverTests/OnDeenUIDriverTests/test42CoreScreenParity
```

Le parent doit exister avant le run. Les artifacts restent ignorés par Git.

## Authentification sans secret dans le dépôt

Les valeurs sensibles sont fournies uniquement dans la session terminal :

```sh
export ONDEEN_UI_TEST_EMAIL='test-account@example.invalid'
export ONDEEN_UI_TEST_PASSWORD='temporary-test-password'
export ONDEEN_UI_TEST_OTP='temporary-test-otp'
```

Ne jamais remplacer ces placeholders dans un fichier versionné. Ne pas copier les valeurs réelles dans une issue, un rapport ou une capture.

Tests utilisant ces variables :

- `test13SubmitSeedEmail` ;
- `test14SubmitSeedOTP` ;
- `test15ReactNativePasswordLogin` ;
- `test20ReactNativeAuthenticatedAudit`.

Pour un flow multi-étapes Swift, les runs staged 00/12/13/14 sont plus faciles à diagnostiquer qu'une grosse suite qui dépend d'un état d'application partagé.

## Bundle ID alternatif

```sh
export ONDEEN_UI_TEST_BUNDLE_ID='com.example.target'
```

Si cette variable est absente, le driver utilise `com.ondeen.user`.

## Comportement de lancement du driver

La factory `app()` :

1. crée `XCUIApplication(bundleIdentifier:)` ;
2. ajoute toujours `ONDEEN_IOS_USE_BUNDLED_JS=1` ;
3. lance l'app si elle ne tourne pas ou si un relaunch est demandé ;
4. sinon l'active ;
5. conserve l'état utile entre les tests staged.

## Stratégie de sélecteurs

Ordre recommandé :

1. `accessibilityLabel` stable et spécifique ;
2. texte exact utile ;
3. prédicat `BEGINSWITH`/`CONTAINS` lorsque les données varient ;
4. type UIKit alternatif, par exemple image back ;
5. coordonnée normalisée uniquement en fallback ;
6. assertion sur un élément de l'écran de destination.

Exemples de labels RN ajoutés/utilisés :

- `Wishlist` ;
- `Notifications` ;
- `Add to wishlist` / `Remove from wishlist` ;
- `Close sort options` ;
- `Close filters` ;
- `View participants` ;
- `Settings` ou `Profile settings`.

Une carte parent ne doit pas être `accessible` si cela fusionne et masque le bouton cœur enfant. C'est pourquoi les cartes Home/Wishlist utilisent `accessible={false}` sur leur conteneur pressable.

## Retour robuste vers Home

`returnToHome()` gère :

- le tab Home accessible RN ;
- un bouton Back accessible ;
- l'image Swift `ic_back_navigation` ;
- une coordonnée normalisée en dernier recours ;
- plusieurs niveaux de navigation ;
- une assertion finale sur `HAPPENING AROUND YOU`.

Le helper renvoie un booléen afin que les tests finaux échouent clairement s'ils ne retrouvent pas Home.

## Captures XCUITest

`keepScreenshot(name, in:)` crée une `XCTAttachment` avec durée de vie `.keepAlways`. Les noms logiques sont plus importants que les UUID exportés, par exemple :

- `rn-home-final` ;
- `rn-sort-sheet` ;
- `rn-event-important-information` ;
- `rn-wishlist-populated` ;
- `rn-participants`.

Le préfixe historique `rn-` apparaît aussi lors d'un run Swift, car les mêmes méthodes sont partagées. Le `deviceName` du manifest permet de distinguer la source réelle.

## Lire rapidement le résultat

```sh
xcrun xcresulttool get test-results summary \
  --path OnDeenUser/artifacts/ios-ui-tests/manual-run/test42.xcresult
```

Vérifier au minimum :

- `result: Passed` ;
- nombre de tests passés/échoués ;
- nom de la méthode ;
- device ciblé ;
- présence des captures attendues.

## Exporter les attachments

Avec les versions récentes de Xcode :

```sh
xcrun xcresulttool export attachments \
  --path OnDeenUser/artifacts/ios-ui-tests/manual-run/test42.xcresult \
  --output-path OnDeenUser/artifacts/ios-ui-tests/manual-run/test42-attachments
```

Consulter ensuite `manifest.json`, qui mappe le nom lisible au fichier exporté.

## Ajouter un nouveau test

1. Choisir un numéro et un nom décrivant un parcours, pas un détail d'implémentation.
2. Relancer l'app si l'état de départ doit être déterministe.
3. Utiliser `returnToHome()` si le parcours commence sur Home.
4. Préférer un label accessible.
5. Ajouter un fallback seulement si Swift/RN publient des arbres différents.
6. Asserter la destination.
7. Capturer les états importants.
8. Exécuter le test deux fois afin de détecter l'état résiduel.
9. Ajouter le scénario et le bundle final dans [le catalogue](./05-test-catalog.md).
10. Vérifier que ni secret ni artifact n'est suivi par Git.

## Dépannage

| Symptôme | Cause probable | Action |
|---|---|---|
| `Could not connect to development server` | App RN lancée sans bundle et Metro absent | Rebuild bundle ou conserver `ONDEEN_IOS_USE_BUNDLED_JS=1` |
| Élément visible mais query absente | Arbre d'accessibilité fusionné/différent | Dump hierarchy, ajouter label, vérifier parent accessible |
| Test ouvre le mauvais tab | Position/label différent Swift/RN | Query texte puis coordonnée normalisée + assertion contenu |
| Wishlist commence sélectionnée | État serveur laissé par un run | Nettoyer par le bouton Remove et attendre Add |
| App Swift remplacée par RN | Même bundle ID sur le même simulateur | Utiliser deux simulateurs |
| Capture Pro/Pro Max différente | Device mismatch | Refaire sur le même modèle |
| `.xcresult` `unknown 0/0` | Run interrompu avant exécution | Ne pas le compter, relancer avec un nouveau chemin |

---

Précédent : [06 — Protocole visuel](./06-visual-comparison-protocol.md) · Suite : [08 — Audit rapide Apple Pay](./08-apple-pay-audit.md)
