# Debug APK, login et erreurs observees

Ce document explique pourquoi le debug APK affichait beaucoup d'erreurs, ce qui venait vraiment du backend, et comment tester maintenant.

## Resume rapide

Le backend ne semblait pas completement casse. L'erreur importante etait surtout liee au debug login local.

On a ajoute un OTP debug `0000`. Quand cet OTP est accepte, l'app cree une session locale avec un faux token:

```text
debug-token
```

Ce token n'existe pas cote backend. Donc, si l'app appelle les APIs protegees avec ce token, le backend repond normalement:

```text
403 Unauthorized access
```

Cela veut dire que le backend repondait, mais qu'il refusait notre token de debug. Ce n'est pas la meme chose qu'un backend hors service.

## Les erreurs vues

### `Unable to load script`

Message vu sur l'ecran rouge React Native:

```text
Unable to load script. Make sure you're either running Metro
or that your bundle 'index.android.bundle' is packaged correctly for release.
```

Cause:

- Le debug APK etait installe sans bundle JavaScript embarque.
- Metro n'etait pas lance sur la machine.
- Donc l'app native demarrait, mais React Native ne trouvait pas le code JS.

Correction:

- `build.sh debug` et `build.sh installDebug` generent maintenant `index.android.bundle`.
- Le bundle est inclus dans l'APK debug.
- Le debug APK peut donc tourner sur le telephone sans Metro.

## `403 Unauthorized access`

Message observe dans les logs:

```text
Unauthorized access
status: 403
```

Cause:

- Le debug OTP `0000` connecte l'app avec `debug-token`.
- Ce token est uniquement local.
- Le backend ne connait pas ce token.
- Les APIs protegees comme profile, dashboard, events ou wallet refusaient donc l'appel.

Important:

- Ce n'est pas une preuve que le backend est down.
- C'est plutot la consequence normale d'une session debug locale.
- Pour verifier le vrai backend, il faut tester avec un vrai OTP/password et un vrai token backend.

Correction:

- En debug, quand le token est `debug-token`, l'app retourne des donnees locales pour les endpoints essentiels:
  - profile
  - dashboard
  - event listing
  - wallet transactions
- Cela permet d'ouvrir l'app et de tester l'interface sans session backend reelle.

## `ReactImageView: Image source "null" doesn't exist`

Cause:

- Le profil debug n'avait pas d'image.
- L'app essayait d'afficher:

```js
{ uri: null }
```

Correction:

- Si `profile_image` est vide ou null, l'app utilise maintenant l'image locale `profile.png`.

## Warning Redux non-serializable

Erreur observee:

```text
A non-serializable value was detected in an action
```

Cause:

- Certains thunks Redux recevaient `showToast`, qui est une fonction.
- Redux Toolkit affiche un warning en debug quand une action contient une fonction.
- `redux-persist` ajoute aussi des actions internes qui peuvent declencher ce type de warning.

Correction:

- Le store ignore maintenant les chemins connus:
  - `meta.arg.showToast`
  - actions internes de `redux-persist`

## Warning Reactotron standalone debug

Erreur observee:

```text
getHost: "Invalid URL - host not found"
```

Cause:

- Reactotron etait lance en mode debug.
- Mais le debug APK standalone utilise un bundle embarque, pas une URL Metro.
- Reactotron essayait de trouver un host depuis une URL qui n'existait pas.

Correction:

- Reactotron ne demarre maintenant que si l'app est lancee depuis une vraie URL Metro.
- Le debug APK standalone garde `__DEV__`, mais ne lance pas Reactotron inutilement.

## Google login

Etat actuel:

- Le bouton Google existe dans l'UI.
- Mais le repo ne contient pas de vraie integration Google Sign-In.
- `google-services.json` ne montre pas de configuration OAuth utilisable pour un login Google complet.
- Aucun flow Google Sign-In n'est implemente dans le code.

Donc si le bouton Google ne connecte pas, ce n'est pas un bug backend: la feature n'est pas encore implementee dans ce repo.

Correction actuelle:

- Le bouton affiche un toast clair:

```text
Google login is not configured yet.
```

## Email login

Avant:

- Le bouton email etait visible mais ne faisait rien.

Correction:

- Le bouton `Continue with Email` navigue maintenant vers l'ecran email/password.

## Quel mode choisir dans `build.sh`

Pour tester sur le telephone reel:

```bash
./build.sh installDebug
```

Ou dans le menu interactif:

```text
3
```

Modes disponibles:

- `install`: lance seulement `npm install`
- `debug`: construit le debug APK local avec `__DEV__ = true`, OTP `0000`, et fallback `debug-token`
- `installDebug`: construit `debug`, met a jour l'app installee avec `adb install -r -t`, puis lance l'app
- `realDebug`: construit un APK signe debug, mais avec JS `--dev false`; il n'a pas OTP `0000` ni fallback profile/dashboard
- `installRealDebug`: construit `realDebug`, met a jour l'app installee avec `adb install -r -t`, puis lance l'app
- `test`: lance les tests Jest

Important:

- `installDebug` et `installRealDebug` ne desinstallent pas l'app.
- Ils mettent a jour l'installation existante.

## Comment tester le login debug

1. Lancer:

```bash
./build.sh installDebug
```

2. Sur l'app, entrer un numero de telephone valide, par exemple:

```text
7700000000
```

3. Appuyer sur `Continue`.

4. Sur l'ecran OTP, entrer:

```text
0000
```

5. Appuyer sur `Verify`.

Resultat attendu:

- L'app ouvre le dashboard.
- Le nom affiche est `Debug Organizer`.
- Le dashboard affiche des donnees locales de debug.
- Il ne doit pas y avoir d'ecran rouge pour les erreurs 403 du backend.

## Comment tester le vrai backend avec un APK debug

Pour tester sans le bypass `0000` et sans les donnees fake:

```bash
./build.sh installRealDebug
```

Ce mode:

- utilise toujours la variante Android `debug`
- ne demande pas de JKS release
- installe avec `adb install -r -t`
- embarque le bundle React Native avec `--dev false`
- desactive `__DEV__`, donc:
  - pas de OTP `0000`
  - pas de `debug-token`
  - pas de faux profile/dashboard/events/wallet

Ce mode est utile pour verifier si le vrai OTP backend et le vrai SMS marchent.

## Release APK / AAB

Pour le moment, `build.sh` ne build pas de release.

Raison:

- Le repo ne contient pas le vrai fichier JKS de production.
- Le repo ne contient pas non plus un `keystore.properties` de production confirme.
- L'app est deja en production, donc l'ancien developpeur ou la CI a probablement le signing setup.

Avant d'ajouter release dans `build.sh`, il faut confirmer:

- ou se trouve le JKS
- quel alias est utilise
- ou sont stockes les mots de passe
- si la release est faite localement ou par CI
- si Google Play App Signing est active

## Conclusion

Les erreurs venaient de plusieurs endroits:

- debug APK sans bundle JS
- faux token local `debug-token`
- rendu d'image avec source null
- warnings Redux en mode debug
- Reactotron lance dans un APK standalone
- Google login non implemente

Le probleme principal n'etait pas forcement un backend casse. Le backend refusait surtout notre session debug locale, ce qui est attendu avec un faux token.

## Ce que montre le backend local

Le backend donne par Othmane est ici:

```text
/home/othmane/APP-STORE-PROJECTS/ondeen
```

Ce backend est une app Flask. Les routes utilisees par l'app mobile existent bien:

```text
/organizer_app/login/send_otp
/organizer_app/login/verify_otp
/organizer_app/login/login_password
/organizer_app/profile/dashboard
```

Le mobile utilise actuellement:

```text
http://43.205.18.14:8080
```

Le serveur deploye sur cette IP repond avec le meme style que le code Flask local:

- `/generate_token` retourne un JWT `token_type: auth`
- `/organizer_app/profile/dashboard` sans vrai login token retourne `403 Unauthorized access`
- `/organizer_app/login/send_otp` valide bien `mobile_number` et `country_code`
- `/organizer_app/login/verify_otp` valide bien `mobile_number`, `country_code` et `otp`

Donc l'IP utilisee par l'app semble correspondre a ce backend, ou au moins a une version tres proche.

## Points importants dans le flow OTP backend

Dans le backend local, `send_otp` fait plusieurs choses:

1. Verifie que le numero est valide.
2. Cherche si l'utilisateur organizer existe deja.
3. Bloque si l'utilisateur est inactive ou deleted.
4. Cree un OTP dans la table `Users_otp`.
5. Refuse si plus de 5 OTPs ont ete demandes en 10 minutes.
6. Envoie le SMS via `send_sms`.
7. Retourne `OTP sent successfully`.

Mais il y a un point important: le service ne verifie pas vraiment si `send_sms` a reussi.

Dans `app/services/organizer/organizer.py`:

```py
send_sms(country_code, mobile_number, otp_code)

return {
    'message': 'OTP sent successfully',
    'is_register': is_register
}
```

Donc si le provider SMS est ferme, bloque, expire, ou refuse la requete, l'API peut quand meme repondre comme si tout allait bien.

## Point suspect: format du numero SMS

Dans `app/utils/notification.py`, le numero est construit comme ca:

```py
full_number = f"+{country_code}{mobile_number}"
```

Mais l'app mobile envoie deja le country code avec `+`, par exemple:

```json
{
  "country_code": "+44",
  "mobile_number": "7700000000"
}
```

Avec le code backend actuel, le numero SMS devient donc potentiellement:

```text
++447700000000
```

Si `country_code` arrivait sans `+`, par exemple `44`, il deviendrait:

```text
+447700000000
```

Le format propre attendu par un provider SMS est normalement:

```text
+447700000000
```

En pratique, avec `country_code = "+44"`, il faudrait construire:

```py
full_number = f"{country_code}{mobile_number}"
```

ou normaliser:

```py
full_number = f"+{country_code.lstrip('+')}{mobile_number}"
```

Ce point peut expliquer un cas ou l'OTP est bien cree en DB, mais le SMS n'arrive jamais.

Correction cote front:

- Pour les appels `/organizer_app/login/send_otp` et `/organizer_app/login/verify_otp`, le front retire maintenant le `+`.
- Exemple: l'UI peut garder `+44`, mais l'API recoit `44`.
- Comme le backend ajoute deja le `+` dans `send_sms`, le numero final devient `+447700000000`.
- On garde le format UI avec `+` ailleurs pour ne pas casser les ecrans et endpoints qui peuvent encore attendre ce format.

## OTP backend attendu

Le backend local ne connait pas `0000`.

Il genere:

- un OTP aleatoire a 6 chiffres en production
- `123456` si `ENV == "staging"`
- `123456` pour le numero special `555999120`

Donc:

- `0000` est uniquement notre bypass local dans le debug APK
- le vrai backend attend normalement 6 chiffres
- si le SMS n'arrive pas, l'utilisateur ne peut pas connaitre le vrai OTP

## Pourquoi un vrai token peut devenir `Unauthorized access`

Le middleware backend ne verifie pas seulement que le JWT est decodeable.

Il verifie aussi:

- le JWT contient `token_type: login`
- le user existe encore
- le user est actif
- le token existe dans la table `User_session`
- le password stocke dans le token correspond encore au password en DB
- le status stocke dans le token correspond encore au status en DB

Donc un token peut devenir invalide si:

- l'utilisateur a ete desactive
- le password a change
- la session a ete supprimee
- le token vient d'un autre environnement
- le token est faux, comme notre `debug-token`
- la production utilise une autre DB ou un autre `JWT_SECRET_KEY`

Dans tous ces cas, le backend retourne:

```text
403 Unauthorized access
```

## Domaine production

Le code mobile contient aussi:

```text
https://api.ondeen.app/
```

Mais l'app utilise actuellement `BASE_URL`, donc:

```text
http://43.205.18.14:8080
```

Depuis cette machine, `api.ondeen.app` resolvait vers une autre IP mais timeout au moment du test. L'app mobile actuelle n'utilise pas ce domaine dans `src/services/api.tsx`.

Si la prod officielle utilise `api.ondeen.app`, il faudra confirmer avec l'ancien developpeur ou la CI quelle URL est supposee etre active.
