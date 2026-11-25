# OnDeen User iOS Fixes Diff Backup

Generated: 2026-06-13T22:00:24.920Z

This file is a backup of the working tree diff before restoring the repository. It is intentionally left untracked so it stays after `git restore`.

## What This Patch Does

- Fixes iOS startup/build support that was needed to run the user app locally, including Ruby/Bundler/CocoaPods-related lockfile changes and iOS app metadata updates.
- Moves the user app toward Railway-backed runtime behavior and removes old fallback assumptions where the app should use backend data.
- Fixes auth state so a generated/general token does not make a guest look like a logged-in user. Real login must have the real login token; guest-only access should stay gated.
- Fixes multiple iOS safe-area/header issues by making screens use the same SafeAreaView structure consistently across Android and iOS.
- Fixes event detail and booked-event detail data loading by merging route data with fresh backend event detail responses instead of relying on partial objects.
- Fixes course booking availability on iOS: category `2` course events now use date/time slot availability instead of the empty top-level tickets array. This is why `Seed: Beginner Quran Circle` should not show as sold out when its slot has availability.
- Fixes payment/date/slot ID matching where Android tolerated number/string ID differences but iOS flows could miss the selected slot.
- Fixes Profile so it uses backend profile fields only: name, email/profile image, and gamification. It removes fake `Aisha`, fake join date, fake location, and fake profile fallback behavior.
- Makes Profile fetch gamification from the backend so completed-event XP/rank data can update from real backend state.
- Fixes iOS redbox/crash paths seen during testing: removes unsupported `onLongPress` native prop usage in Notes and removes problematic SVG gradients from gamification/Profile visuals.
- Keeps Android behavior covered by verifying the Android Metro bundle after the changes.

## Verification Performed Before Backup

- Parsed the touched JS/TS/JSX files with Babel parser.
- Built the iOS Metro bundle successfully.
- Built the Android Metro bundle successfully.
- Ran `ONDEEN_IOS_RESET_APP_DATA=0 ./run-ios.sh user`; the simulator launched the app.
- Checked current simulator logs for the reported iOS redbox signatures: `setOnLongPress`, `removedChildren`, `REASwizzledUIManager`, and current `NSException` matches.
- Queried Railway event `2` and confirmed `Seed: Beginner Quran Circle` has slot availability: `available: 80`, `booked: 0`.

## Git Status Before Restore

```text
 M OnDeenUser/Gemfile.lock
 M OnDeenUser/ios/OnDeen/Info.plist
 M OnDeenUser/ios/Podfile.lock
 M OnDeenUser/package.json
 M OnDeenUser/src/FileDownload/FileDownload.jsx
 M OnDeenUser/src/FileDownload/downloadit.js
 M OnDeenUser/src/FileDownload/filedownload.js
 M OnDeenUser/src/components/SlotCard.jsx
 M OnDeenUser/src/components/gamification/XpRing.jsx
 M OnDeenUser/src/helpers/Constant.tsx
 M OnDeenUser/src/navigation/RootNavigator.jsx
 M OnDeenUser/src/redux/slices/loginSlice.tsx
 M OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx
 M OnDeenUser/src/screens/AllParticipantLists/AllParticipantLists.jsx
 M OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx
 M OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx
 M OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx
 M OnDeenUser/src/screens/ChangePassword/ChangePassword.jsx
 M OnDeenUser/src/screens/CreatePassword/CreatePasswordScreen.jsx
 M OnDeenUser/src/screens/EditProfile/EditProfile.jsx
 M OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx
 M OnDeenUser/src/screens/ForgotPassword/ForgotPassword.jsx
 M OnDeenUser/src/screens/GlobalSearchResults/GlobalSearchResults.jsx
 M OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx
 M OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx
 M OnDeenUser/src/screens/Notification/Notification.jsx
 M OnDeenUser/src/screens/OneToOne/OneToOneSession.jsx
 M OnDeenUser/src/screens/OrganizerProfile/OrganizerProfile.jsx
 M OnDeenUser/src/screens/PaymentConfirmation/PaymentConfirmation.jsx
 M OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx
 M OnDeenUser/src/screens/PaymentsScreen/SelectDateSLOTContainer.jsx
 M OnDeenUser/src/screens/PaymentsScreen/SelectTicketsContainer.jsx
 M OnDeenUser/src/screens/PrivacySetting/PrivacySetting.jsx
 M OnDeenUser/src/screens/ProfileScreen/HelpSupportPage.jsx
 M OnDeenUser/src/screens/ProfileScreen/ProfileScreen.jsx
 M OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx
 M OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx
 M OnDeenUser/src/screens/RegisterScreen/Registration.jsx
 M OnDeenUser/src/screens/RequestSessions/RequestSessions.jsx
 M OnDeenUser/src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx
 M OnDeenUser/src/screens/SecondEventDetailsPage/downloadfile.js
 M OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx
 M OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx
 M OnDeenUser/src/screens/SignupScreen/checkGoogleLogin.js
 M OnDeenUser/src/screens/SpeakerProfile/SpeakerProfile.jsx
 M OnDeenUser/src/screens/VerifyOTP/VerifyEmailOTP.jsx
 M OnDeenUser/src/screens/VerifyOTP/VerifyMobileOTP.jsx
 M OnDeenUser/src/screens/Wishlist/Wishlist.jsx
 M OnDeenUser/src/screens/allQrCodeScreen/AllQRCodeDownload.jsx
 M OnDeenUser/src/screens/badgesScreen/index.tsx
 M OnDeenUser/src/screens/splashScreen/index.jsx
```

## Diff Stat Before Restore

```text
 OnDeenUser/Gemfile.lock                            |  14 +-
 OnDeenUser/ios/OnDeen/Info.plist                   |   8 +
 OnDeenUser/ios/Podfile.lock                        | 168 ++++++++---------
 OnDeenUser/package.json                            |   2 +-
 OnDeenUser/src/FileDownload/FileDownload.jsx       |  30 ++-
 OnDeenUser/src/FileDownload/downloadit.js          |  25 ++-
 OnDeenUser/src/FileDownload/filedownload.js        |  21 ++-
 OnDeenUser/src/components/SlotCard.jsx             |   7 +-
 OnDeenUser/src/components/gamification/XpRing.jsx  |  11 +-
 OnDeenUser/src/helpers/Constant.tsx                |   1 +
 OnDeenUser/src/navigation/RootNavigator.jsx        |   4 +-
 OnDeenUser/src/redux/slices/loginSlice.tsx         |   4 +-
 OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx |   2 +-
 .../AllParticipantLists/AllParticipantLists.jsx    |   2 +-
 .../src/screens/BottomHomePage/BottomHomePage.jsx  |   2 +-
 .../src/screens/BottomHomePage/GlobalSearch.jsx    |   2 +-
 .../src/screens/BottomHomePage/UpdateLocation.jsx  |   2 +-
 .../src/screens/ChangePassword/ChangePassword.jsx  |   2 +-
 .../CreatePassword/CreatePasswordScreen.jsx        |   2 +-
 OnDeenUser/src/screens/EditProfile/EditProfile.jsx |   2 +-
 .../FirstEventDetailsPage.jsx                      |  29 ++-
 .../src/screens/ForgotPassword/ForgotPassword.jsx  |   2 +-
 .../GlobalSearchResults/GlobalSearchResults.jsx    |   2 +-
 .../LoginEmailPassword/LoginEmailPassword.jsx      |   8 +-
 OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx |  25 ++-
 .../src/screens/Notification/Notification.jsx      |   2 +-
 .../src/screens/OneToOne/OneToOneSession.jsx       |   2 +-
 .../screens/OrganizerProfile/OrganizerProfile.jsx  |   2 +-
 .../PaymentConfirmation/PaymentConfirmation.jsx    |   2 +-
 .../src/screens/PaymentsScreen/PaymentsScreen.jsx  | 146 +++++++++++---
 .../PaymentsScreen/SelectDateSLOTContainer.jsx     |  31 +--
 .../PaymentsScreen/SelectTicketsContainer.jsx      |  19 +-
 .../src/screens/PrivacySetting/PrivacySetting.jsx  |   2 +-
 .../src/screens/ProfileScreen/HelpSupportPage.jsx  |   2 +-
 .../src/screens/ProfileScreen/ProfileScreen.jsx    | 209 ++++++++++++++++++---
 OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx |   2 +-
 .../src/screens/ProfileSetting/ProfileSetting.jsx  |   2 +-
 .../src/screens/RegisterScreen/Registration.jsx    |   2 +-
 .../screens/RequestSessions/RequestSessions.jsx    |   2 +-
 .../SecondEventDetailsPage.jsx                     |  55 +++++-
 .../screens/SecondEventDetailsPage/downloadfile.js |   3 +-
 .../src/screens/SignupScreen/SignupEmailScreen.jsx |   2 -
 .../screens/SignupScreen/SignupMobileScreen.jsx    |   2 -
 .../src/screens/SignupScreen/checkGoogleLogin.js   |  30 +--
 .../src/screens/SpeakerProfile/SpeakerProfile.jsx  |   2 +-
 .../src/screens/VerifyOTP/VerifyEmailOTP.jsx       |   2 +-
 .../src/screens/VerifyOTP/VerifyMobileOTP.jsx      |   2 +-
 OnDeenUser/src/screens/Wishlist/Wishlist.jsx       |   2 +-
 .../screens/allQrCodeScreen/AllQRCodeDownload.jsx  |   2 +-
 OnDeenUser/src/screens/badgesScreen/index.tsx      |   2 +-
 OnDeenUser/src/screens/splashScreen/index.jsx      |   2 +-
 51 files changed, 635 insertions(+), 273 deletions(-)
```

## Full Diff

```diff
diff --git a/OnDeenUser/Gemfile.lock b/OnDeenUser/Gemfile.lock
index 276457b..ccc56b3 100644
--- a/OnDeenUser/Gemfile.lock
+++ b/OnDeenUser/Gemfile.lock
@@ -25,10 +25,10 @@ GEM
     base64 (0.2.0)
     bigdecimal (3.1.8)
     claide (1.1.0)
-    cocoapods (1.15.2)
+    cocoapods (1.16.2)
       addressable (~> 2.8)
       claide (>= 1.0.2, < 2.0)
-      cocoapods-core (= 1.15.2)
+      cocoapods-core (= 1.16.2)
       cocoapods-deintegrate (>= 1.0.3, < 2.0)
       cocoapods-downloader (>= 2.1, < 3.0)
       cocoapods-plugins (>= 1.0.0, < 2.0)
@@ -42,8 +42,8 @@ GEM
       molinillo (~> 0.8.0)
       nap (~> 1.0)
       ruby-macho (>= 2.3.0, < 3.0)
-      xcodeproj (>= 1.23.0, < 2.0)
-    cocoapods-core (1.15.2)
+      xcodeproj (>= 1.27.0, < 2.0)
+    cocoapods-core (1.16.2)
       activesupport (>= 5.0, < 8)
       addressable (~> 2.8)
       algoliasearch (~> 1.0)
@@ -80,7 +80,7 @@ GEM
     logger (1.6.1)
     minitest (5.25.1)
     molinillo (0.8.0)
-    nanaimo (0.3.0)
+    nanaimo (0.4.0)
     nap (1.1.0)
     netrc (0.11.0)
     nkf (0.2.0)
@@ -92,12 +92,12 @@ GEM
       ethon (>= 0.9.0)
     tzinfo (2.0.6)
       concurrent-ruby (~> 1.0)
-    xcodeproj (1.25.1)
+    xcodeproj (1.27.0)
       CFPropertyList (>= 2.3.3, < 4.0)
       atomos (~> 0.1.3)
       claide (>= 1.0.2, < 2.0)
       colored2 (~> 3.1)
-      nanaimo (~> 0.3.0)
+      nanaimo (~> 0.4.0)
       rexml (>= 3.3.6, < 4.0)
 
 PLATFORMS
diff --git a/OnDeenUser/ios/OnDeen/Info.plist b/OnDeenUser/ios/OnDeen/Info.plist
index 8c14977..bd44551 100644
--- a/OnDeenUser/ios/OnDeen/Info.plist
+++ b/OnDeenUser/ios/OnDeen/Info.plist
@@ -30,6 +30,14 @@
 				<string>ondeen</string>
 			</array>
 		</dict>
+		<dict>
+			<key>CFBundleURLName</key>
+			<string>com.googleusercontent.apps.1015708537755-o3ct72o84sso0bgreci0k5a21096g0te</string>
+			<key>CFBundleURLSchemes</key>
+			<array>
+				<string>com.googleusercontent.apps.1015708537755-o3ct72o84sso0bgreci0k5a21096g0te</string>
+			</array>
+		</dict>
 	</array>
 	<key>CFBundleVersion</key>
 	<string>$(CURRENT_PROJECT_VERSION)</string>
diff --git a/OnDeenUser/ios/Podfile.lock b/OnDeenUser/ios/Podfile.lock
index 78191f7..bbe408d 100644
--- a/OnDeenUser/ios/Podfile.lock
+++ b/OnDeenUser/ios/Podfile.lock
@@ -2409,7 +2409,7 @@ EXTERNAL SOURCES:
 SPEC CHECKSUMS:
   AppAuth: d4f13a8fe0baf391b2108511793e4b479691fb73
   boost: 7e761d76ca2ce687f7cc98e698152abd03a18f90
-  BVLinearGradient: cb006ba232a1f3e4f341bb62c42d1098c284da70
+  BVLinearGradient: 880f91a7854faff2df62518f0281afb1c60d49a3
   DoubleConversion: cb417026b2400c8f53ae97020b2be961b59470cb
   fast_float: 06eeec4fe712a76acc9376682e4808b05ce978b6
   FBLazyVector: e053802577a711add20e45bbbf5dd1180b6ca62e
@@ -2430,12 +2430,12 @@ SPEC CHECKSUMS:
   GTMSessionFetcher: 5aea5ba6bd522a239e236100971f10cb71b96ab6
   hermes-engine: b5c9cfbe6415f1b0b24759f2942c8f33e9af6347
   lottie-ios: a881093fab623c467d3bce374367755c272bdd59
-  lottie-react-native: d446d56c0176cb8830bab17e6425b093c5492274
+  lottie-react-native: 6e89607ea6454a780077c4cb58363b9d75db55c5
   nanopb: fad817b59e0457d11a5dfbde799381cd727c1275
-  Permission-Camera: 9113542a8426755da29304e6169fd281cf275216
-  Permission-LocationWhenInUse: fb3fad1c77cccfe9e1c516eae47574f50439c301
-  Permission-MediaLibrary: 3824c16547476a48d66c7865e0661f2c3d00fe4f
-  Permission-PhotoLibrary: 084c5addb837c5d2da510a0cb7fc24de38a44eb4
+  Permission-Camera: 5d2aaf95592660b6dcb5e8d1d90ed5d0156cad02
+  Permission-LocationWhenInUse: 871e81c06c1fc578353fce962d5d8e6efa697f1a
+  Permission-MediaLibrary: e94e0a30ec5edc18b14e9df10fc78d5bb592a8ca
+  Permission-PhotoLibrary: 8227a6ed9f6a971537afe63742d54f5f23a38fe2
   PromisesObjC: f5707f49cb48b9636751c5b2e7d227e43fba9f47
   RCT-Folly: e78785aa9ba2ed998ea4151e314036f6c49e6d82
   RCTDeprecation: cf39863b43871c2031050605fb884019b6193910
@@ -2443,93 +2443,93 @@ SPEC CHECKSUMS:
   RCTTypeSafety: c9c9e64389bc545fc137030615b387ef1654dcee
   React: 14a80ea4f13387cfdaa4250b46fbfe19754c220c
   React-callinvoker: fed1dad5d6cf992c7b4b5fdbf1bf67fe2e8fb6c5
-  React-Core: 3c803e7f3be6fa68e3dabcac283a5a5f87340a60
-  React-CoreModules: 94d556b4055defb79278c3afba95e521998b9b3a
-  React-cxxreact: 21c826a567199cc2d5797bd4cfe3c0d94bb3a7de
+  React-Core: f703e7a56fcedc3e959b8b7899995e57fd58539a
+  React-CoreModules: 6e87c904cc257058c271708eef1719b5b3039131
+  React-cxxreact: 4153beeff710944832cd90ccb141e299ee16b7d3
   React-debug: a665bbe67eb786b7a7a815ce1b7212b3f9fa962c
-  React-defaultsnativemodule: 8f0bea8d0d3434aa98957302f2a8741600781edd
-  React-domnativemodule: 889d261cc9691b91063a1c1d89d408e19903923d
-  React-Fabric: eb0bde19a858807eee7d4fee07f24f036bdf5e6a
-  React-FabricComponents: 7756ddcd87ff121d0dedff69c80fd6177ccd31d9
-  React-FabricImage: c3096fe8c20a4aec77c54c271f878948efa9d477
+  React-defaultsnativemodule: 7e4a2c2b13ec2943f2f3b8adec32130443909de6
+  React-domnativemodule: dffaa482180243bd1e2b7fba329fd4adc12a2445
+  React-Fabric: bd742f0ddb6073ff14f7e51075bc0380b84e7f7a
+  React-FabricComponents: 347a74f275f989b493ab5324a2161e6b3de5556e
+  React-FabricImage: f9da31053da5aae09b7f67afdc46329c6e3a2710
   React-featureflags: 55800b546a28b63a8a0f419e1a45871d43523d32
-  React-featureflagsnativemodule: b200bca78e00f9e5c7cd5a1c9f2957223fcfa33a
-  React-graphics: fb41a6a55ecd473159452c75b3ea7b57794903a3
-  React-hermes: 3be7f73615e70b310b0457146691d39ea3752e6b
-  React-idlecallbacksnativemodule: dc10ee2e5ba5ae7ad56aa093aedda582345bce16
-  React-ImageManager: 08592583c7737aec2b2c2a12e7c4f0ad763ae5c4
-  React-jserrorhandler: eede06f57f67c8d3978ff1a9c78107aea5cbdf45
-  React-jsi: 70ca5cce94e7f81e4ff51a71b4720b5fb943eea5
-  React-jsiexecutor: 265d9fbb2a88c74892646e0012cec62ebb89edcf
-  React-jsinspector: 7a7e033c64cc40e6a1d6daf7fad4827bc1e7dd12
-  React-jsinspectortracing: 77f4d18502af6e7599e77390b35f04f02814f7ce
-  React-jsitracing: 0608ea7ee711370d42fdd2b4a474dbced68dd275
-  React-logger: 8d00d3d794041a77bd890158353361e2709b04c1
-  React-Mapbuffer: 45ca4d30efe99834a8cd8d98f803c94766db534f
-  React-microtasksnativemodule: b5901a0b15f92ce0666ee5131eb8ab646f1d5a27
-  react-native-blob-util: 55bf7c1c4c90d138e45ddfeddbec0ec91d8df8c8
-  react-native-geolocation: 4910e054549e5678e5f23f91171b3e6268d7ece9
-  react-native-geolocation-service: 32b2c2a3b91e70ce2a8d0c684801aaeb0a07e0ec
-  react-native-get-random-values: d16467cf726c618e9c7a8c3c39c31faa2244bbba
-  react-native-html-to-pdf: 7a49e6c58ac5221bcc093027b195f4b214f27a9d
-  react-native-maps: 00b1df6264f927e475dbfa7c2de515203f10cc6e
-  react-native-otp-verify: 6d153f8a8e8392c6a51f9d94c090dc16d7c756b2
-  react-native-pdf: 6a51a22ccefb23eb93298771e4bf090913e86d70
-  react-native-randombytes: 4eeddad82d1fd57adda1cd5beffe67d041c9d6de
-  react-native-render-html: 5afc4751f1a98621b3009432ef84c47019dcb2bd
-  react-native-safe-area-context: 6c8805194166a9d6b3e53ba69ca76756c9bfb052
-  React-NativeModulesApple: 7a9ec626a1852d444d0e699b016dc55a064b7569
-  React-perflogger: d06f0fd0727356651a5535f6d717130187aeb667
-  React-performancetimeline: c397114f2c025aa73412a9f21e021b08127fe820
+  React-featureflagsnativemodule: a0ea334fdd3342a2e4dc05085c3e7653e16839d3
+  React-graphics: 7360f5f3611fd5982aa0de772a73987ab401fb02
+  React-hermes: a942bebef5e9fcc31f51c6fb814e96c260a2a20d
+  React-idlecallbacksnativemodule: 74d091304aad1ceb0c5b86e5dec14372fcdc0f34
+  React-ImageManager: 6b2a95469d9a126f14410bbe10fb7378d37ed0e0
+  React-jserrorhandler: 2643140639cbf047bf45f5c1a3ea95b04d748582
+  React-jsi: b2de88284fc2cc69466a34d8b794160216d3bd2c
+  React-jsiexecutor: e947af1c9e42610affd9f4178cd4b649e8ac889b
+  React-jsinspector: 6d768dfb189027f7ff2161be31ccd69215426ded
+  React-jsinspectortracing: a6a70eb5c9d767d99391d0373330a7239fb6f9d0
+  React-jsitracing: 69280997c7a80ac0af62b95f01a241d68581fb52
+  React-logger: e6c3c1b55c18cc1b945b647ff9ada53e0e710b50
+  React-Mapbuffer: 57bea44149376ecf1241dd9f02a6222adab43e57
+  React-microtasksnativemodule: 2739fc8a8cb99486820c933ce560791c93be5337
+  react-native-blob-util: 3c3dc88417b94e750c46c185662a07b2816a6b5e
+  react-native-geolocation: 61d88937598104e531a1053481fbd2a236b290b5
+  react-native-geolocation-service: 608e1da71a1ac31b4de64d9ef2815f697978c55b
+  react-native-get-random-values: 21325b2244dfa6b58878f51f9aa42821e7ba3d06
+  react-native-html-to-pdf: 4c5c6e26819fe202971061594058877aa9b25265
+  react-native-maps: 7bb871cefc2635a854f22021dca0eae57a68089b
+  react-native-otp-verify: b524a7f44b691644bea08376d6a4782a2df57e09
+  react-native-pdf: 73accc61238e8e9bc6e376191225028af20b996e
+  react-native-randombytes: ddf6edfd3fb9091af8c6ed1b35e57c308b5f5f2c
+  react-native-render-html: 984dfe2294163d04bf5fe25d7c9f122e60e05ebe
+  react-native-safe-area-context: e48706fb09fde89f82e12bfb49b140cfdcb761f7
+  React-NativeModulesApple: 4849912ee050e6ae346f5789bd631570580d8b84
+  React-perflogger: 069d41f741187be92ed46c6ac67add03b99f3166
+  React-performancetimeline: eda794c5007eb6834e13bc6026a879b5f6d49c74
   React-RCTActionSheet: a078d5008632fed31b0024c420ee02e612b317d5
-  React-RCTAnimation: b197cc109a896c6ce23981e02e317cfc055f6fda
-  React-RCTAppDelegate: 6e7e4fcec0d72cbe2ca43a028400ebc027264e8f
-  React-RCTBlob: c12d15d40db01ac3fe57c24d3ef5233ff3333da6
-  React-RCTFabric: 267c7a5820b3d2c999e94a8b3d861e69faac756b
-  React-RCTFBReactNativeSpec: e1f4d2662a8a9fd6da4ae3b6b338c7476b4e992b
-  React-RCTImage: 7a3d9d67161c714fa4d9b93820da39a266d0f1ff
-  React-RCTLinking: f860b917500cd3974235a48d5b199a74a4ed6c26
-  React-RCTNetwork: 6a984ab1b5a81d17a2df6cc02c24b249fb055deb
-  React-RCTSettings: e9a39068d8b60d78a5271dcb68f6ea7f59569cb2
-  React-RCTText: 44457242238664a5ad69f06ec7a5f273a6967711
-  React-RCTVibration: f448ad875c60b2ddc5fc5b06d3f5e2dfc3f18c09
+  React-RCTAnimation: 82e31d191af4175e0c2df5bdac2c8569a5f3ab54
+  React-RCTAppDelegate: 183c991d0be0b05a4e1587bb2740cf954782a56b
+  React-RCTBlob: c462b8b7de6ce44ddc56dd96eebe1da0a6e54c77
+  React-RCTFabric: c2580401c3ce62c4a6268806517b9b95794b1bd0
+  React-RCTFBReactNativeSpec: bc4feee6ad7e6cce73d38000473fe8702a38e76a
+  React-RCTImage: 10fad63f1bb8adbd519c4c2ef6bec3c0d95fdd32
+  React-RCTLinking: 3843288a44dc33ec083c843f3ff31dd7d96ece41
+  React-RCTNetwork: f237299bda8bbd56c4d01d2825110e40b75c438a
+  React-RCTSettings: c24ce1ee96c9b001ff5059ddd53412a20b7d5e71
+  React-RCTText: d97cfb9c89b06de9530577dd43f178c47ea07853
+  React-RCTVibration: 2fcefee071a4f0d416e4368416bb073ea6893451
   React-rendererconsistency: c9f31b6d55877c5d49d25d69270b89f9cb208e26
-  React-rendererdebug: 939c31f97f3bbf434832b7f73d8a438cf96ee1c4
+  React-rendererdebug: 185ba0f801f29565873f7a37e410a812eddaa1ee
   React-rncore: 90e637179a4ce46643d445a9ef16f53af02a8d25
-  React-RuntimeApple: 3df87718b4a8e438b4a02d1d7d47677dfcab35a5
-  React-RuntimeCore: e188aa1b0fe0450f3a4e6098f2bb8d4b27c147cf
+  React-RuntimeApple: 713b7c24b3abed07fa39766b35deaabd679ba48e
+  React-RuntimeCore: 236d704919077fd3393a26fd0ecbaecc081ec94f
   React-runtimeexecutor: 2de0d537fc6d5b4a7074587b4459ea331c7e5715
-  React-RuntimeHermes: 5aa429111da4c0a62d94b37ad5b5144deb8f49d0
-  React-runtimescheduler: c3738ed7f0ba2e51b1612ec8d6cbe104c2b9b59a
+  React-RuntimeHermes: 3e87ad8c5160c976addacd679774a5e4fdb3c4b4
+  React-runtimescheduler: bafaf0af0f68bd761d63ff4de3bf13e391820f79
   React-timing: 7ad7dc61dfc93ceb4ec2b3e6d1a6ad9ad3652fe0
-  React-utils: d6a3bec920c7fa710e8fb5b7c28d81fe54be8c75
-  ReactAppDependencyProvider: 5df090fa3cbfc923c6bd0595b64d5ef6d89f7134
-  ReactCodegen: 0c213020a601c6adda74f8826629bff9c6c408d3
-  ReactCommon: 7f90ec8358d94ec2a078e11990f6e78542957b11
-  ReactNativeUiLib: 237cd5430e9569575778f228547d03c485b010de
-  RNCalendarEvents: f90f73666b6bcbb3cc8a491ffbb5e48c0db3de37
-  RNCAsyncStorage: b44e8a4e798c3e1f56bffccd0f591f674fb9198f
-  RNCMaskedView: aef76c02bdf36e6baa5255b36672a640df938964
-  RNDateTimePicker: 22c0ea66424371299c2fb82b342d9e384bc84d0b
-  RNDeviceInfo: bcce8752b5043a623fe3c26789679b473f705d3c
-  RNFBApp: 90cf0209fb8f0460ab069a7de857d7ec851c8476
-  RNFBMessaging: 37dd861b8600ec2ae9a06ba42ae4285cb707a731
-  RNFileViewer: 4b5d83358214347e4ab2d4ca8d5c1c90d869e251
-  RNFS: 89de7d7f4c0f6bafa05343c578f61118c8282ed8
-  RNGestureHandler: 79cc809ee68037b3dcfb62627b67f26d7fe163d7
-  RNGoogleSignin: 576a84dd0407b912e7a0adf07492de9feb79e5d9
-  RNImageCropPicker: d5387003612dd08d52fb062760136e0e473df186
-  RNLocalize: 5c5e0454cb8a73f173f27a6353630e17684f07dd
-  RNNotifee: 5e3b271e8ea7456a36eec994085543c9adca9168
-  RNPermissions: a6eda2a4f7e28a8152b9abc792ba2ae59e12e3e8
-  RNReanimated: c46b6c83adc0443cdd99dfcfee5b92ffa3e7835a
-  RNScreens: 2867c8bac4e5fa64871010bddc8376e6a1008180
-  RNShare: 0862cb4b7d540661d8af1daa6f14ba4436bb3ad5
-  RNSVG: 6f728ef50fa0a86e5be629ff8ebd5b5a4f9647c4
-  RNVectorIcons: 9220340395b3a94edad59be7d507ca0aa443e6fb
+  React-utils: cf358d29b6802cca3d1bec20a939f2f5d50d40ba
+  ReactAppDependencyProvider: ad88c80e06f29900f2e6f9ccf1d4cb0bfc3e1bbc
+  ReactCodegen: 69c7aec61821e1860aaaf959189218ecca40e811
+  ReactCommon: ef3e394efce4b78e9214587689c459cf82927368
+  ReactNativeUiLib: dc9ae72655fbabfe25eec8c538018594b697d0f6
+  RNCalendarEvents: 7e65eb4a94f53c1744d1e275f7fafcfaa619f7a3
+  RNCAsyncStorage: 23e56519cc41d3bade3c8d4479f7760cb1c11996
+  RNCMaskedView: 9953b54e4f488389ec45d8befd8687d71e7c121e
+  RNDateTimePicker: b5afe456eedb040a6c8099c5e5d17b3af4ef94af
+  RNDeviceInfo: 8b6fa8379062949dd79a009cf3d6b02a9c03ca59
+  RNFBApp: 2c88b4fc4bcecf25ff9077abde08f4b1cbaff4c6
+  RNFBMessaging: 67ede2b8c07a00902f24dd5819b2c75901a75669
+  RNFileViewer: ce7ca3ac370e18554d35d6355cffd7c30437c592
+  RNFS: 4ac0f0ea233904cb798630b3c077808c06931688
+  RNGestureHandler: 5f0ae912a06a9eaf78aa7a0d594ef8c98fb7e280
+  RNGoogleSignin: c26dada63b1a357af4f6a87f93ee70268d420c0f
+  RNImageCropPicker: 8e39c01f205e00d739c31e682f068aac315587bf
+  RNLocalize: af6a0c20ed114768c09805819b82a47de188f27d
+  RNNotifee: 4a6ee5c7deaf00e005050052d73ee6315dff7ec9
+  RNPermissions: 5df468064df661a4c8c017e2791ce90d7695eea5
+  RNReanimated: 9b5e6eebe0d4b8a46b6545e43ba2edf8ca3c43d3
+  RNScreens: 84273a0c9c1353088b181d50934fbaf3a86fda6b
+  RNShare: 138baa54b9fe3b86580d052737e8f5e2633a5a6e
+  RNSVG: 60d9624970b8a21d7cca47ce2ec31c6434a4c639
+  RNVectorIcons: dea7dc10c1942cdf080f89ba4a839316c9c62876
   SocketRocket: d4aabe649be1e368d1318fdf28a022d714d65748
   Stripe: 6a37e0d27872cb2c878d404676bd90cc3d7bf04b
-  stripe-react-native: 8e7821c72a86ce120170ed3890469f754b88a9cb
+  stripe-react-native: d54ec5d7344324c3347b00756ebfb2ee2e7a57f3
   StripeApplePay: 3caeb241c08f79b5f11024a96409317b50347e71
   StripeCore: fba9a10801900090b54a4384b85384e55643cbf6
   StripeFinancialConnections: 9eab846f1c0dc98ab14e3611e1a8436c026bea5c
diff --git a/OnDeenUser/package.json b/OnDeenUser/package.json
index 9600dda..021a888 100644
--- a/OnDeenUser/package.json
+++ b/OnDeenUser/package.json
@@ -4,7 +4,7 @@
   "private": true,
   "scripts": {
     "android": "react-native run-android",
-    "ios": "react-native run-ios",
+    "ios": "RBENV_VERSION=3.3.6 BUNDLE_PATH=vendor/bundle PATH=\"$HOME/.rbenv/shims:$PATH\" react-native run-ios",
     "lint": "eslint .",
     "start": "react-native start",
     "test": "jest",
diff --git a/OnDeenUser/src/FileDownload/FileDownload.jsx b/OnDeenUser/src/FileDownload/FileDownload.jsx
index b0c6822..2215ab8 100644
--- a/OnDeenUser/src/FileDownload/FileDownload.jsx
+++ b/OnDeenUser/src/FileDownload/FileDownload.jsx
@@ -6,6 +6,7 @@ import {
   Platform,
   Alert,
   Text,
+  Linking,
 } from 'react-native';
 import RNFS from 'react-native-fs';
 import ReactNativeBlobUtil from 'react-native-blob-util';
@@ -42,7 +43,10 @@ const FileDownloadScreen = () => {
       return;
     }
 
-    const folderPath = `${RNFS.DownloadDirectoryPath}/${folderName}`;
+    const folderPath =
+      Platform.OS === 'android'
+        ? `${RNFS.DownloadDirectoryPath}/${folderName}`
+        : `${RNFS.DocumentDirectoryPath}/${folderName}`;
     const fullPath = `${folderPath}/${fileName}`;
 
     try {
@@ -62,7 +66,9 @@ const FileDownloadScreen = () => {
 
 
             // Make visible to Android Downloads
-            ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: 'application/pdf' }]);
+            if (Platform.OS === 'android') {
+              ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: 'application/pdf' }]);
+            }
 
             Alert.alert('Success', `File downloaded to:\n${folderPath}`);
           } else {
@@ -82,19 +88,27 @@ const FileDownloadScreen = () => {
   const openPDF = () => {
     if (!filePath) return;
 
-    ReactNativeBlobUtil.android
-      .actionViewIntent(filePath, 'application/pdf')
-      .catch((err) => {
+    const openPromise = Platform.OS === 'android'
+      ? ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf')
+      : Linking.openURL(`file://${filePath}`);
+
+    openPromise.catch((err) => {
 
         Alert.alert('Error', 'Could not open the PDF file.');
       });
   };
 
 const openFolder = () => {
-  const folderPath = `${RNFS.DownloadDirectoryPath}/OndeenUser`;
+  const folderPath =
+    Platform.OS === 'android'
+      ? `${RNFS.DownloadDirectoryPath}/OndeenUser`
+      : `${RNFS.DocumentDirectoryPath}/OndeenUser`;
+
+  const openPromise = Platform.OS === 'android'
+    ? ReactNativeBlobUtil.android.actionViewIntent(folderPath, 'resource/folder')
+    : Linking.openURL(`file://${folderPath}`);
 
-  ReactNativeBlobUtil.android
-    .actionViewIntent(folderPath, 'resource/folder') // mime type for folders
+  openPromise
     .then(() => {
 
     })
diff --git a/OnDeenUser/src/FileDownload/downloadit.js b/OnDeenUser/src/FileDownload/downloadit.js
index 4a14152..e4cef7a 100644
--- a/OnDeenUser/src/FileDownload/downloadit.js
+++ b/OnDeenUser/src/FileDownload/downloadit.js
@@ -1,5 +1,5 @@
 // utils/downloadAndOpenPDF.js
-import { Platform, PermissionsAndroid, Alert } from 'react-native';
+import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
 import RNFS from 'react-native-fs';
 import ReactNativeBlobUtil from 'react-native-blob-util';
 
@@ -16,7 +16,10 @@ export const downloadAndOpenPDF = async ({
   
   const fileName = `${ticketId}.${fileExtension}`;
   const folderName = 'OndeenUser';
-  const folderPath = `${RNFS.DownloadDirectoryPath}/${folderName}`;
+  const folderPath =
+    Platform.OS === 'android'
+      ? `${RNFS.DownloadDirectoryPath}/${folderName}`
+      : `${RNFS.DocumentDirectoryPath}/${folderName}`;
   const fullPath = `${folderPath}/${fileName}`;
 
   const requestStoragePermission = async () => {
@@ -42,7 +45,11 @@ export const downloadAndOpenPDF = async ({
       if (isImage) {
         mimeType = `image/${fileExtension}`;
       }
-      await ReactNativeBlobUtil.android.actionViewIntent(fullPath, mimeType);
+      if (Platform.OS === 'android') {
+        await ReactNativeBlobUtil.android.actionViewIntent(fullPath, mimeType);
+      } else {
+        await Linking.openURL(`file://${fullPath}`);
+      }
     } catch (err) {
       Alert.alert('Error', `Could not open the ${isImage ? 'image' : 'PDF'} file.`);
     }
@@ -50,7 +57,11 @@ export const downloadAndOpenPDF = async ({
 
   const openFolder = async () => {
     try {
-      await ReactNativeBlobUtil.android.actionViewIntent(folderPath, 'resource/folder');
+      if (Platform.OS === 'android') {
+        await ReactNativeBlobUtil.android.actionViewIntent(folderPath, 'resource/folder');
+      } else {
+        await Linking.openURL(`file://${folderPath}`);
+      }
     } catch (err) {
       Alert.alert(
         'Cannot Open Folder',
@@ -84,7 +95,9 @@ export const downloadAndOpenPDF = async ({
             mimeType = `image/${fileExtension}`;
           }
           
-          await ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: mimeType }]);
+          if (Platform.OS === 'android') {
+            await ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: mimeType }]);
+          }
           
           Alert.alert(
             '✅ Success',
@@ -106,4 +119,4 @@ export const downloadAndOpenPDF = async ({
   } catch (error) {
     Alert.alert('Error', 'Unexpected error occurred');
   }
-};
\ No newline at end of file
+};
diff --git a/OnDeenUser/src/FileDownload/filedownload.js b/OnDeenUser/src/FileDownload/filedownload.js
index efeeedb..dbef071 100644
--- a/OnDeenUser/src/FileDownload/filedownload.js
+++ b/OnDeenUser/src/FileDownload/filedownload.js
@@ -22,7 +22,10 @@ export const downloadFileALLTypes = async ({
     const fileExtension = urlParts.length > 1 ? urlParts.pop().toLowerCase() : 'bin';
     const finalFileName = fileName || `${Date.now()}.${fileExtension}`;
     const folderName = 'OndeenUser';
-    const folderPath = `${RNFS.DownloadDirectoryPath}/${folderName}`;
+    const folderPath =
+      Platform.OS === 'android'
+        ? `${RNFS.DownloadDirectoryPath}/${folderName}`
+        : `${RNFS.DocumentDirectoryPath}/${folderName}`;
     const fullPath = `${folderPath}/${finalFileName}`;
 
     // Get mime type
@@ -88,12 +91,14 @@ export const downloadFileALLTypes = async ({
     const downloadResult = await ReactNativeBlobUtil.config({
       fileCache: true,
       path: fullPath,
-      addAndroidDownloads: {
-        useDownloadManager: true, // Uses Android's download manager
-        notification: true,
-        path: fullPath,
-        description: 'File download',
-      },
+      ...(Platform.OS === 'android' && {
+        addAndroidDownloads: {
+          useDownloadManager: true, // Uses Android's download manager
+          notification: true,
+          path: fullPath,
+          description: 'File download',
+        },
+      }),
     }).fetch('GET', fileUrl, {});
 
     // For progress tracking
@@ -135,4 +140,4 @@ export const downloadFileALLTypes = async ({
     onError?.(error);
     return { success: false, error: errorMessage };
   }
-};
\ No newline at end of file
+};
diff --git a/OnDeenUser/src/components/SlotCard.jsx b/OnDeenUser/src/components/SlotCard.jsx
index db717b9..b45ee63 100644
--- a/OnDeenUser/src/components/SlotCard.jsx
+++ b/OnDeenUser/src/components/SlotCard.jsx
@@ -23,14 +23,15 @@ const SlotCard = ({
   selectedColor = '#422199',
 }) => {
   const formattedTime = formatTimeOnly(item?.start_time, time_zone, 'time-only');
+  const isDisabled = item?.status == 2 || (seatsLeft !== undefined && seatsLeft <= 0);
 
   return (
     <Pressable
-      disabled={item?.status == 2}
+      disabled={isDisabled}
       style={[styles.slotContainer,
       {
-        backgroundColor: item?.status == 2 ? '#EFEAF3' : '#EFEAF3',
-        opacity: item?.status == 2 ? 0.5 : 1,
+        backgroundColor: isDisabled ? '#EFEAF3' : '#EFEAF3',
+        opacity: isDisabled ? 0.5 : 1,
       }, isSelected && { backgroundColor: selectedColor }]}
       onPress={onPress}>
       <Text style={[styles.timeText, isSelected && { color: '#FFFFFF' }]}>
diff --git a/OnDeenUser/src/components/gamification/XpRing.jsx b/OnDeenUser/src/components/gamification/XpRing.jsx
index 0f33a28..5169c94 100644
--- a/OnDeenUser/src/components/gamification/XpRing.jsx
+++ b/OnDeenUser/src/components/gamification/XpRing.jsx
@@ -1,6 +1,6 @@
 import React from 'react';
 import { StyleSheet, Text, View } from 'react-native';
-import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
+import Svg, { Circle } from 'react-native-svg';
 import { fontFamilies } from '../../../assets/fonts/fonts';
 
 const XpRing = ({
@@ -21,13 +21,6 @@ const XpRing = ({
   return (
     <View style={[styles.container, { width: size, height: size }]}>
       <Svg width={size} height={size} style={styles.svg}>
-        <Defs>
-          <SvgLinearGradient id="xpSunsetGradient" x1="0" y1="0" x2="1" y2="1">
-            <Stop offset="0" stopColor="#FFC94B" />
-            <Stop offset="0.5" stopColor="#FF7A4A" />
-            <Stop offset="1" stopColor="#E8418F" />
-          </SvgLinearGradient>
-        </Defs>
         <Circle
           cx={center}
           cy={center}
@@ -40,7 +33,7 @@ const XpRing = ({
           cx={center}
           cy={center}
           r={radius}
-          stroke="url(#xpSunsetGradient)"
+          stroke="#FF7A4A"
           strokeWidth={strokeWidth}
           strokeLinecap="round"
           fill="none"
diff --git a/OnDeenUser/src/helpers/Constant.tsx b/OnDeenUser/src/helpers/Constant.tsx
index bc71683..253dab2 100644
--- a/OnDeenUser/src/helpers/Constant.tsx
+++ b/OnDeenUser/src/helpers/Constant.tsx
@@ -1,5 +1,6 @@
 import * as Yup from 'yup';
 export const GOOGLESIGNINWEBCLIENTID = '1015708537755-64c6ol0ir2gmdoauou48c5hfjlt5thm9.apps.googleusercontent.com'
+export const GOOGLESIGNINIOSCLIENTID = '1015708537755-o3ct72o84sso0bgreci0k5a21096g0te.apps.googleusercontent.com'
 
 export const ITS_LIVE = false
 export const ENABLE_VERSION_UPDATE_CHECK = ITS_LIVE
diff --git a/OnDeenUser/src/navigation/RootNavigator.jsx b/OnDeenUser/src/navigation/RootNavigator.jsx
index b0024ed..0a797ab 100644
--- a/OnDeenUser/src/navigation/RootNavigator.jsx
+++ b/OnDeenUser/src/navigation/RootNavigator.jsx
@@ -35,13 +35,15 @@ const useAppInitialization = () => {
 const RootNavigator = () => {
   const { isLoading } = useAppInitialization();
   const isLogin = useSelector((state) => state.user.isLogin);
+  const loginToken = useSelector((state) => state.user.loginToken);
   const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
+  const hasLoginToken = typeof loginToken === 'string' && loginToken.trim().length > 0;
 
   if (isLoading) {
     return <SplashScreen />;
   }
 
-  return isLogin || isSkippedLogin ? <AllAccessNavigator /> : <AuthNavigator />;
+  return (isLogin && hasLoginToken) || isSkippedLogin ? <AllAccessNavigator /> : <AuthNavigator />;
 };
 
 export default RootNavigator;
diff --git a/OnDeenUser/src/redux/slices/loginSlice.tsx b/OnDeenUser/src/redux/slices/loginSlice.tsx
index 3ba8d81..0249dd3 100644
--- a/OnDeenUser/src/redux/slices/loginSlice.tsx
+++ b/OnDeenUser/src/redux/slices/loginSlice.tsx
@@ -92,7 +92,9 @@ const loginSlice = createSlice({
       .addCase(loginUser.fulfilled, (state, action) => {
         if (action.payload.status) {
           // Successful login
-          // state.isLogin = true;
+          state.isLogin = true;
+          state.isSkippedLogin = false;
+          state.isSkippedLoginAllow = false;
           state.user = action.payload.response;
           state.loginToken = action.payload.response.access_token;
           state.status = 'succeeded';
diff --git a/OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx b/OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx
index 28d8007..3479289 100644
--- a/OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx
+++ b/OnDeenUser/src/screens/AllCalendar/AllCalendar.jsx
@@ -138,7 +138,7 @@ const AllCalender = () => {
     );
   }
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
   return (
     <ContainerComponent style={{ flex: 1 }}>
       <LatestHeader
diff --git a/OnDeenUser/src/screens/AllParticipantLists/AllParticipantLists.jsx b/OnDeenUser/src/screens/AllParticipantLists/AllParticipantLists.jsx
index c4b0081..3fdacf3 100644
--- a/OnDeenUser/src/screens/AllParticipantLists/AllParticipantLists.jsx
+++ b/OnDeenUser/src/screens/AllParticipantLists/AllParticipantLists.jsx
@@ -54,7 +54,7 @@ export default function AllParticipantLists({ route }) {
   const [loading, setLoading] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   const fetchParticipantList = useCallback(async () => {
     setRefreshing(true);
diff --git a/OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx b/OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx
index 33dcbd1..64e1e04 100644
--- a/OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx
+++ b/OnDeenUser/src/screens/BottomHomePage/BottomHomePage.jsx
@@ -444,7 +444,7 @@ const BottomHomePage = ({ route }) => {
     return selectedValue != originalValue;
   });
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
   const topheight = Platform.OS === 'ios' ? useTopInset() : 14;
 
   return (
diff --git a/OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx b/OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx
index 9022b68..7ca9693 100644
--- a/OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx
+++ b/OnDeenUser/src/screens/BottomHomePage/GlobalSearch.jsx
@@ -86,7 +86,7 @@ const GlobalSearch = () => {
     </TouchableOpacity>
   );
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={styles.container}>
diff --git a/OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx b/OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx
index 4f7f786..142a11d 100644
--- a/OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx
+++ b/OnDeenUser/src/screens/BottomHomePage/UpdateLocation.jsx
@@ -198,7 +198,7 @@ const UpdateLocation = ({ route }) => {
     });
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
diff --git a/OnDeenUser/src/screens/ChangePassword/ChangePassword.jsx b/OnDeenUser/src/screens/ChangePassword/ChangePassword.jsx
index 6b9ab02..31a2ad7 100644
--- a/OnDeenUser/src/screens/ChangePassword/ChangePassword.jsx
+++ b/OnDeenUser/src/screens/ChangePassword/ChangePassword.jsx
@@ -142,7 +142,7 @@ const ChangePassword = () => {
       />
     );
   }
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ flex: 1 , backgroundColor:'#fff'}}>
diff --git a/OnDeenUser/src/screens/CreatePassword/CreatePasswordScreen.jsx b/OnDeenUser/src/screens/CreatePassword/CreatePasswordScreen.jsx
index e8ec855..945aa95 100644
--- a/OnDeenUser/src/screens/CreatePassword/CreatePasswordScreen.jsx
+++ b/OnDeenUser/src/screens/CreatePassword/CreatePasswordScreen.jsx
@@ -94,7 +94,7 @@ const CreatePasswordScreen = ({ route }) => {
       .required('Confirm password is required'),
   });
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   if (loading) {
     return (
diff --git a/OnDeenUser/src/screens/EditProfile/EditProfile.jsx b/OnDeenUser/src/screens/EditProfile/EditProfile.jsx
index 97fc12c..1576d4a 100644
--- a/OnDeenUser/src/screens/EditProfile/EditProfile.jsx
+++ b/OnDeenUser/src/screens/EditProfile/EditProfile.jsx
@@ -212,7 +212,7 @@ const EditProfile = () => {
       value: Number(item.id),
     })) || [];
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
diff --git a/OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx b/OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx
index f5ec654..f692fa5 100644
--- a/OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx
+++ b/OnDeenUser/src/screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx
@@ -39,6 +39,30 @@ const pickEventDetail = (payload) => {
   if (!payload) {
     return null;
   }
+  const candidates = [
+    payload,
+    payload?.response,
+    payload?.response?.data,
+    payload?.response?.event,
+    payload?.response?.event_detail,
+    payload?.response?.event_details,
+    payload?.response?.details,
+    payload?.data,
+    payload?.event,
+    payload?.event_detail,
+    payload?.event_details,
+    payload?.details,
+  ];
+
+  for (const candidate of candidates) {
+    if (candidate?.id) {
+      return candidate;
+    }
+    if (candidate?.event_id) {
+      return { ...candidate, id: candidate.event_id };
+    }
+  }
+
   if (payload?.id) {
     return payload;
   }
@@ -103,7 +127,8 @@ const mergeEventDetails = (...details) => {
   });
 
   arrayKeys.forEach((key) => {
-    const source = [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
+    const source = [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]) && detail[key].length > 0)
+      || [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
     if (source) {
       merged[key] = source[key];
     }
@@ -289,7 +314,7 @@ const FirstEventDetailsPage = ({ route }) => {
               <GradientButton
                 containerStyle={styles.bookBtnContainer}
                 onPress={() => {
-                  handlePress('PaymentScreen', { eventId: eventDetail?.id, });
+                  handlePress('PaymentScreen', { eventId: eventDetail?.id, eventDetail });
                 }}
                 title={'BOOK TICKET'}
                 colors={['#DB3171', '#FFCC33']}
diff --git a/OnDeenUser/src/screens/ForgotPassword/ForgotPassword.jsx b/OnDeenUser/src/screens/ForgotPassword/ForgotPassword.jsx
index b53ed53..791eae6 100644
--- a/OnDeenUser/src/screens/ForgotPassword/ForgotPassword.jsx
+++ b/OnDeenUser/src/screens/ForgotPassword/ForgotPassword.jsx
@@ -114,7 +114,7 @@ const ForgotPasswordScreen = ({ route }) => {
     }
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
   return (
     <ContainerComponent style={{ backgroundColor: '#fff', flex: 1 }}>
       <Modal
diff --git a/OnDeenUser/src/screens/GlobalSearchResults/GlobalSearchResults.jsx b/OnDeenUser/src/screens/GlobalSearchResults/GlobalSearchResults.jsx
index 465ff44..ace2eda 100644
--- a/OnDeenUser/src/screens/GlobalSearchResults/GlobalSearchResults.jsx
+++ b/OnDeenUser/src/screens/GlobalSearchResults/GlobalSearchResults.jsx
@@ -405,7 +405,7 @@ const GlobalSearchResults = ({ route }) => {
       </View>
     );
   }
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
 
   return (
diff --git a/OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx b/OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx
index e0b5dae..6142090 100644
--- a/OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx
+++ b/OnDeenUser/src/screens/LoginEmailPassword/LoginEmailPassword.jsx
@@ -1,4 +1,4 @@
-import React, { useCallback, useEffect, useState } from 'react';
+import React, { useCallback, useState } from 'react';
 import {
   View,
   Text,
@@ -74,11 +74,7 @@ const LoginEmailPassword = () => {
     } catch (err) {}
   };
 
-  useEffect(() => {
-    GoogleSignin.configure({});
-  }, []);
-
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
diff --git a/OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx b/OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx
index d75f9ba..c75cca6 100644
--- a/OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx
+++ b/OnDeenUser/src/screens/NotesScreen/NotesScreen.jsx
@@ -171,7 +171,7 @@ const NotesScreen = ({ route }) => {
     }, [])
   );
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
@@ -194,16 +194,23 @@ const NotesScreen = ({ route }) => {
             sections={sections}
             keyExtractor={item => item.id?.toString()}
             renderItem={({ item }) => (
-              <TouchableOpacity
-                onLongPress={() => handleNoteLongPress(item)}
-                onPress={() => handleNotePress(item)}>
+              <TouchableOpacity onPress={() => handleNotePress(item)}>
                 <View style={styles.subContainer}>
                   <View style={styles.notesContainer}>
-                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
+                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Text style={styles.notesHeading}>{item.title || 'Title'}</Text>
-                      <Text style={styles.notesTime}>
-                        {formatTimeOnly(item?.created_on, item?.time_zone, 'time-only')}
-                      </Text>
+                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
+                        <Text style={styles.notesTime}>
+                          {formatTimeOnly(item?.created_on, item?.time_zone, 'time-only')}
+                        </Text>
+                        <TouchableOpacity
+                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
+                          onPress={() => handleNoteLongPress(item)}
+                          style={{ marginLeft: 10 }}
+                        >
+                          <Icon name="trash-can-outline" size={18} color="#9977F2" />
+                        </TouchableOpacity>
+                      </View>
                     </View>
                     <Text style={styles.notesContent}> {item.notes}</Text>
                   </View>
@@ -247,4 +254,4 @@ const NotesScreen = ({ route }) => {
   );
 };
 
-export default NotesScreen;
\ No newline at end of file
+export default NotesScreen;
diff --git a/OnDeenUser/src/screens/Notification/Notification.jsx b/OnDeenUser/src/screens/Notification/Notification.jsx
index da0ca6b..8900300 100644
--- a/OnDeenUser/src/screens/Notification/Notification.jsx
+++ b/OnDeenUser/src/screens/Notification/Notification.jsx
@@ -147,7 +147,7 @@ export default function Notification() {
     />
   ), [handleNotificationPress, handleDelete, showToast]);
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={[{ flex: 1, backgroundColor: '#FDFBFF' }]}>
diff --git a/OnDeenUser/src/screens/OneToOne/OneToOneSession.jsx b/OnDeenUser/src/screens/OneToOne/OneToOneSession.jsx
index 5e3f383..65d4ea9 100644
--- a/OnDeenUser/src/screens/OneToOne/OneToOneSession.jsx
+++ b/OnDeenUser/src/screens/OneToOne/OneToOneSession.jsx
@@ -107,7 +107,7 @@ const OneToOneSession = ({ route }) => {
   const filteredUpcomingSessions = filterSessions(upcomingSessions, searchQuery);
   const filteredCompletedSessions = filterSessions(completedSessions, searchQuery);
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={[styles.container]}>
diff --git a/OnDeenUser/src/screens/OrganizerProfile/OrganizerProfile.jsx b/OnDeenUser/src/screens/OrganizerProfile/OrganizerProfile.jsx
index 51e29cb..aaa6a5f 100644
--- a/OnDeenUser/src/screens/OrganizerProfile/OrganizerProfile.jsx
+++ b/OnDeenUser/src/screens/OrganizerProfile/OrganizerProfile.jsx
@@ -140,7 +140,7 @@ const OrganizerProfile = ({ route }) => {
       />
     );
   }
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
   const topheight = Platform.OS === 'ios' ? useTopInset() : 0;
 
   return (
diff --git a/OnDeenUser/src/screens/PaymentConfirmation/PaymentConfirmation.jsx b/OnDeenUser/src/screens/PaymentConfirmation/PaymentConfirmation.jsx
index 157a3f4..e695ac4 100644
--- a/OnDeenUser/src/screens/PaymentConfirmation/PaymentConfirmation.jsx
+++ b/OnDeenUser/src/screens/PaymentConfirmation/PaymentConfirmation.jsx
@@ -82,7 +82,7 @@ const PaymentConfirmationScreen = ({ route }) => {
     setIsModalVisible(!isModalVisible);
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={[styles.container]}>
diff --git a/OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx b/OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx
index 7eb0dcf..c6ec4fb 100644
--- a/OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx
+++ b/OnDeenUser/src/screens/PaymentsScreen/PaymentsScreen.jsx
@@ -26,7 +26,7 @@ import Minus from '../../../src/assets/svg/minusBlue.svg';
 import LatestHeader from '../../components/LatestHeader';
 import Loader from '../../components/loader';
 import SlotCard from '../../components/SlotCard';
-import { eventBookingAPI, eventbyIdAPI, PaymentStatusUpdate } from '../../redux/callapis/CommonService';
+import { eventBookingAPI, eventbyIdAPI, PaymentStatusUpdate, publicEventbyIdAPI } from '../../redux/callapis/CommonService';
 import { useStatusBar } from '../../components/statusbar';
 import { useToastForPopup } from '../../context/ToastContext';
 import BookingforContainer from './BookingforContainer';
@@ -36,6 +36,9 @@ import SelectDateSLOTContainer from './SelectDateSLOTContainer';
 import PaymentMethodContainer from './PaymentMethodContainer';
 import { ITS_LIVE } from '../../helpers/Constant';
 
+const SLOT_EVENT_CATEGORY_IDS = [2, 3, 4, 9];
+const sameId = (left, right) => String(left ?? '') === String(right ?? '');
+
 const PaymentScreen = ({ route }) => {
   const navigation = useNavigation();
   const dispatch = useDispatch();
@@ -51,7 +54,10 @@ const PaymentScreen = ({ route }) => {
   const [selectedDate, setSelectedDate] = useState(null);
   const [selectedSlot, setSelectedSlot] = useState(null);
   const [slotData, setSlotData] = useState([]);
-  const [eventDetail, setEventDetail] = useState(null);
+  const routeParams = route?.params || {};
+  const routeEventDetail = routeParams?.eventDetail || null;
+  const [eventDetail, setEventDetail] = useState(routeEventDetail);
+  const [loadFailed, setLoadFailed] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
   const [bookingdetails, setBookingdetails] = useState({});
   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
@@ -59,12 +65,44 @@ const PaymentScreen = ({ route }) => {
 
   useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });
 
-  const { eventId } = route?.params;
+  const eventId = routeParams?.eventId || routeEventDetail?.id;
 
   const price = eventDetail?.price || "";
   const priceType = eventDetail?.price_type || "";
   const dateArray = eventDetail?.dates || [];
   const showToast = useToastForPopup();
+  const categoryId = Number(eventDetail?.category_id);
+  const isDatedSlotEvent = dateArray?.length > 0 && SLOT_EVENT_CATEGORY_IDS.includes(categoryId);
+
+  const getSlotAvailability = (slot) => Math.max((Number(slot?.available) || 0) - (Number(slot?.booked) || 0), 0);
+
+  const getAvailableSlots = () => {
+    if (!isDatedSlotEvent) {
+      return [];
+    }
+
+    if (selectedDate) {
+      const selectedDateData = dateArray.find((date) => sameId(date?.id, selectedDate));
+      return selectedDateData?.times || [];
+    }
+
+    return dateArray.reduce((slots, date) => slots.concat(date?.times || []), []);
+  };
+
+  const getMaxSelectableTickets = () => {
+    const perUserLimit = Number(eventDetail?.quantity_per_user) || 0;
+
+    if (isDatedSlotEvent) {
+      const selectedSlotData = getAvailableSlots().find((slot) => sameId(slot?.id, selectedSlot));
+      const slotAvailable = selectedSlotData
+        ? getSlotAvailability(selectedSlotData)
+        : Math.max(0, ...getAvailableSlots().map(getSlotAvailability));
+      return perUserLimit ? Math.min(slotAvailable, perUserLimit) : slotAvailable;
+    }
+
+    const totalAvailable = Math.max((Number(eventDetail?.available) || 0) - (Number(eventDetail?.booked) || 0), 0);
+    return perUserLimit ? Math.min(totalAvailable, perUserLimit) : totalAvailable;
+  };
 
   useEffect(() => {
     checkGooglePaySupport();
@@ -87,19 +125,36 @@ const PaymentScreen = ({ route }) => {
   const fetchEventData = async () => {
     try {
       setRefreshing(true);
+      setLoadFailed(false);
       const res = await eventbyIdAPI(eventId);
-      const fetchedEvent = res?.response || null;
-      setEventDetail(fetchedEvent);
+      let fetchedEvent = res?.status === false ? null : res?.response;
 
-      const fetchedDates = fetchedEvent?.dates || [];
+      if (!fetchedEvent?.id) {
+        const publicRes = await publicEventbyIdAPI(eventId);
+        fetchedEvent = publicRes?.status === false ? null : publicRes?.response;
+      }
+
+      const nextEventDetail = fetchedEvent?.id ? { ...(routeEventDetail || {}), ...fetchedEvent } : routeEventDetail;
+      setEventDetail(nextEventDetail || null);
+      setLoadFailed(!nextEventDetail?.id);
+
+      const fetchedDates = nextEventDetail?.dates || [];
       if (fetchedDates?.length > 0 && !selectedDate) {
-        const firstAvailableDate = fetchedDates.find(date => date.status == 1);
+        const firstAvailableDate = fetchedDates.find(date =>
+          date.status == 1 &&
+          (date?.times || []).some((slot) => getSlotAvailability(slot) > 0 && slot?.status != 2)
+        ) || fetchedDates.find(date => date.status == 1);
         if (firstAvailableDate) {
           setSelectedDate(firstAvailableDate.id);
         }
       }
     } catch (error) {
-      showToast('Failed to load event details');
+      if (routeEventDetail?.id) {
+        setEventDetail(routeEventDetail);
+      } else {
+        setLoadFailed(true);
+        showToast('Failed to load event details');
+      }
     } finally {
       setRefreshing(false);
     }
@@ -108,22 +163,36 @@ const PaymentScreen = ({ route }) => {
   useEffect(() => {
     if (eventId) {
       fetchEventData();
+    } else {
+      setLoadFailed(true);
     }
   }, [eventId]);
 
   useEffect(() => {
     const ticketsArray = eventDetail?.tickets || [];
-    const availableTickets = Math.max((eventDetail?.available ?? 0) - (eventDetail?.booked ?? 0), 0);
+    const availableTickets = getMaxSelectableTickets();
 
-    if (eventDetail?.id && ticketsArray.length === 0 && availableTickets > 0 && ticketCount === 0) {
+    if (!eventDetail?.id || ticketsArray.length > 0) {
+      return;
+    }
+
+    if (availableTickets <= 0) {
+      setTicketCount(0);
+      setShowCounter(false);
+      return;
+    }
+
+    if (ticketCount === 0) {
       setTicketCount(1);
       setShowCounter(true);
+    } else if (ticketCount > availableTickets) {
+      setTicketCount(availableTickets);
     }
-  }, [eventDetail?.id, eventDetail?.tickets, eventDetail?.available, eventDetail?.booked, ticketCount]);
+  }, [eventDetail?.id, eventDetail?.tickets, eventDetail?.available, eventDetail?.booked, dateArray, selectedDate, selectedSlot, ticketCount]);
 
   useEffect(() => {
     if (selectedDate) {
-      const selectedDateData = dateArray.find((date) => date?.id === selectedDate);
+      const selectedDateData = dateArray.find((date) => sameId(date?.id, selectedDate));
       setSlotData(selectedDateData ? selectedDateData?.times : []);
       setSelectedSlot(null);
     }
@@ -134,18 +203,15 @@ const PaymentScreen = ({ route }) => {
   };
 
   const handleIncrease = () => {
-    const totalAvailableTickets = eventDetail?.available - eventDetail?.booked;
-    const maxPerUser = eventDetail?.quantity_per_user;
-
-    const maxTickets = maxPerUser
-      ? Math.min(totalAvailableTickets, maxPerUser)
-      : totalAvailableTickets;
+    const totalAvailableTickets = getMaxSelectableTickets();
+    const maxPerUser = Number(eventDetail?.quantity_per_user) || 0;
+    const maxTickets = totalAvailableTickets;
 
     if (ticketCount < maxTickets) {
       setTicketCount(prev => prev + 1);
     } else {
       showToast(
-        maxPerUser && ticketCount >= maxPerUser
+        maxPerUser && ticketCount >= maxPerUser && maxPerUser <= totalAvailableTickets
           ? `Maximum ${maxPerUser} tickets per user`
           : `Only ${totalAvailableTickets} tickets available`
       );
@@ -298,7 +364,7 @@ const PaymentScreen = ({ route }) => {
       return;
     }
 
-    if (dateArray?.length > 0 && !selectedSlot && [3, 4, 9]?.includes(eventDetail?.category_id)) {
+    if (isDatedSlotEvent && !selectedSlot) {
       showToast('Please select a time slot');
       return;
     }
@@ -319,8 +385,8 @@ const PaymentScreen = ({ route }) => {
 
     try {
       const payload = {
-        event_id: eventId,
-        ...(dateArray?.length > 0 && { date_time_id: selectedSlot }),
+        event_id: eventDetail?.id || eventId,
+        ...(selectedSlot && { date_time_id: selectedSlot }),
         ...(tickets.length > 0 ? { tickets } : { quantity: ticketCount }),
       };
 
@@ -364,7 +430,9 @@ const PaymentScreen = ({ route }) => {
     }
   };
 
-  if (!eventDetail) {
+  const ContainerComponent = SafeAreaView;
+
+  if (!eventDetail && !loadFailed) {
     return (
       <Loader
         isLoading={true}
@@ -374,7 +442,36 @@ const PaymentScreen = ({ route }) => {
     );
   }
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  if (loadFailed) {
+    return (
+      <ContainerComponent style={{ backgroundColor: '#F9F6FD', flex: 1 }}>
+        <LatestHeader
+          statusBarColor="#F9F6FD"
+          title="Make Payment"
+          leftIconName="chevron-left"
+          onLeftPress={() => navigation.goBack()}
+          titleStyle={{
+            color: '#000000',
+            fontSize: fontScale(16),
+          }}
+        />
+        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: widthScale(24) }}>
+          <Text style={{ textAlign: 'center', color: '#000', fontSize: fontScale(15), marginBottom: heightScale(16) }}>
+            Unable to load this event. Please try again.
+          </Text>
+          <GradientButton
+            containerStyle={styles.bookBtnContainer}
+            onPress={fetchEventData}
+            title="TRY AGAIN"
+            colors={['#DB3171', '#FFCC33']}
+            start={{ x: 0.9, y: 0 }}
+            end={{ x: 0.1, y: 1 }}
+            textStyle={styles.gradientText}
+          />
+        </View>
+      </ContainerComponent>
+    );
+  }
 
   return (
     <ContainerComponent style={{ backgroundColor: '#F9F6FD', flex: 1 }}>
@@ -430,6 +527,7 @@ const PaymentScreen = ({ route }) => {
           <BookingforContainer eventDetail={eventDetail} />
           <SelectTicketsContainer
             eventDetail={eventDetail}
+            availableTickets={getMaxSelectableTickets()}
             setTicketCount={setTicketCount}
             setShowCounter={setShowCounter}
             handleDecrease={handleDecrease}
diff --git a/OnDeenUser/src/screens/PaymentsScreen/SelectDateSLOTContainer.jsx b/OnDeenUser/src/screens/PaymentsScreen/SelectDateSLOTContainer.jsx
index 58069d6..60582d7 100644
--- a/OnDeenUser/src/screens/PaymentsScreen/SelectDateSLOTContainer.jsx
+++ b/OnDeenUser/src/screens/PaymentsScreen/SelectDateSLOTContainer.jsx
@@ -4,6 +4,8 @@ import styles from './styles';
 import SlotCard from '../../components/SlotCard';
 import moment from 'moment';
 
+const SLOT_EVENT_CATEGORY_IDS = [2, 3, 4, 9];
+
 export default function SelectDateSLOTContainer({
     dateArray,
     eventDetail,
@@ -13,10 +15,15 @@ export default function SelectDateSLOTContainer({
     selectedSlot,
     selectedDate
 }) {
+    const getAvailability = (item) => Math.max((Number(item?.available) || 0) - (Number(item?.booked) || 0), 0);
+    const hasAvailableSlot = (item) => (item?.times || []).some((slot) => getAvailability(slot) > 0 && slot?.status != 2);
+    const categoryId = Number(eventDetail?.category_id);
+
     const renderDateItem = ({ item }) => {
-        const dateObj = new Date(item.date);
-        const day = dateObj.getDate();
-        const weekday = dateObj.toLocaleString('en-us', { weekday: 'short' });
+        const dateMoment = moment(item.date, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true);
+        const day = dateMoment.isValid() ? dateMoment.format('DD') : '';
+        const weekday = dateMoment.isValid() ? dateMoment.format('ddd') : '';
+        const disabled = item?.status == 2 || !hasAvailableSlot(item);
 
         return (
             <TouchableOpacity
@@ -24,12 +31,12 @@ export default function SelectDateSLOTContainer({
                 style={[
                     styles.dateItem,
                     {
-                        backgroundColor: item?.status == 2 ? '#EFEAF3' : '#EFEAF3',
-                        opacity: item?.status == 2 ? 0.5 : 1,
+                        backgroundColor: disabled ? '#EFEAF3' : '#EFEAF3',
+                        opacity: disabled ? 0.5 : 1,
                     },
                     selectedDate == item.id && styles.selectedDateItem,
                 ]}
-                disabled={item?.status == 2}
+                disabled={disabled}
                 onPress={() => handleDateSelect(item.id)}
             >
                 <Text style={[styles.dateText, selectedDate == item.id && { color: '#FFFFFF' }]}>
@@ -44,7 +51,7 @@ export default function SelectDateSLOTContainer({
 
     return (
         <View>
-            {dateArray?.length > 0 && [3, 4, 9]?.includes(eventDetail?.category_id) && (
+            {dateArray?.length > 0 && SLOT_EVENT_CATEGORY_IDS.includes(categoryId) && (
                 <View style={[styles.dateContainer, { marginTop: 18 }]}>
                     <View>
                         <Text style={[styles.selectTicket, { paddingVertical: 8 }]}>
@@ -52,10 +59,12 @@ export default function SelectDateSLOTContainer({
                         </Text>
                         <FlatList
                             data={dateArray.filter(item =>
-                                item.status && moment(item.date).isSameOrAfter(moment(), 'day')
+                                item.status &&
+                                hasAvailableSlot(item) &&
+                                moment(item.date, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).isSameOrAfter(moment(), 'day')
                             )}
                             horizontal
-                            keyExtractor={item => item.id}
+                            keyExtractor={item => item?.id?.toString()}
                             renderItem={renderDateItem}
                             showsHorizontalScrollIndicator={false}
                         />
@@ -87,7 +96,7 @@ export default function SelectDateSLOTContainer({
                                 item={item}
                                 time_zone={item?.time_zone}
                                 time={item?.start_time}
-                                seatsLeft={item?.available - item?.booked}
+                                seatsLeft={getAvailability(item)}
                                 isSelected={selectedSlot == item?.id}
                                 onPress={() => setSelectedSlot(item?.id)}
                             />
@@ -98,4 +107,4 @@ export default function SelectDateSLOTContainer({
             )}
         </View>
     )
-}
\ No newline at end of file
+}
diff --git a/OnDeenUser/src/screens/PaymentsScreen/SelectTicketsContainer.jsx b/OnDeenUser/src/screens/PaymentsScreen/SelectTicketsContainer.jsx
index 22fe227..969af07 100644
--- a/OnDeenUser/src/screens/PaymentsScreen/SelectTicketsContainer.jsx
+++ b/OnDeenUser/src/screens/PaymentsScreen/SelectTicketsContainer.jsx
@@ -5,8 +5,11 @@ import { useToastForPopup } from '../../context/ToastContext';
 import Plus from '../../../src/assets/svg/plusBlue.svg';
 import Minus from '../../../src/assets/svg/minusBlue.svg';
 
+const SLOT_EVENT_CATEGORY_IDS = [2, 3, 4, 9];
+
 export default function SelectTicketsContainer({
     eventDetail,
+    availableTickets,
     setTicketCount,
     setShowCounter,
     handleDecrease,
@@ -19,12 +22,12 @@ export default function SelectTicketsContainer({
     const ticketsArray = eventDetail?.tickets || [];
     const hasDates = dateArray.length > 0;
     const hasTickets = ticketsArray.length > 0;
+    const safeAvailableTickets = Math.max(Number(availableTickets) || 0, 0);
+    const categoryId = Number(eventDetail?.category_id);
 
     const renderTicketCounter = () => {
-        const availableTickets = Math.max((eventDetail?.available ?? 0) - (eventDetail?.booked ?? 0), 0);
-
         if (!showCounter) {
-            if (availableTickets == 0) {
+            if (safeAvailableTickets == 0) {
                 return (
                     <View style={[styles.counterButtonAdd, { backgroundColor: 'red' }]}>
                         <Text style={[styles.ticketCount, { color: '#fff' }]}>Sold Out</Text>
@@ -35,7 +38,7 @@ export default function SelectTicketsContainer({
                 <TouchableOpacity
                     style={styles.counterButtonAdd}
                     onPress={() => {
-                        if (availableTickets <= 0) {
+                        if (safeAvailableTickets <= 0) {
                             showToast('You cannot book this event because tickets are not available');
                             return;
                         }
@@ -87,15 +90,15 @@ export default function SelectTicketsContainer({
                 <Text style={styles.selectTicket}>SELECT TICKETS</Text>
                 <Text style={styles.ticketLabel}>
                     {hasDates
-                        ? `${eventDetail?.quantity_per_user} Tickets per person`
-                        : `Available ${Math.max((eventDetail?.available ?? 0) - (eventDetail?.booked ?? 0), 0)} Tickets`
+                        ? `${Number(eventDetail?.quantity_per_user) || safeAvailableTickets || 1} Tickets per person`
+                        : `Available ${safeAvailableTickets} Tickets`
                     }
                 </Text>
-                {[3, 4, 9].includes(eventDetail?.category_id) && (
+                {SLOT_EVENT_CATEGORY_IDS.includes(categoryId) && (
                     <Text style={styles.ticketLabel}>Duration {eventDetail?.duration || 1} Hour</Text>
                 )}
             </View>
             {renderTicketCounter()}
         </View>
     );
-}
\ No newline at end of file
+}
diff --git a/OnDeenUser/src/screens/PrivacySetting/PrivacySetting.jsx b/OnDeenUser/src/screens/PrivacySetting/PrivacySetting.jsx
index 51149f7..f466114 100644
--- a/OnDeenUser/src/screens/PrivacySetting/PrivacySetting.jsx
+++ b/OnDeenUser/src/screens/PrivacySetting/PrivacySetting.jsx
@@ -56,7 +56,7 @@ const PrivacySetting = () => {
     }
   }, [status]);
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ flex: 1, backgroundColor:'#fff' }}>
diff --git a/OnDeenUser/src/screens/ProfileScreen/HelpSupportPage.jsx b/OnDeenUser/src/screens/ProfileScreen/HelpSupportPage.jsx
index 6c6c5c3..00b6ea2 100644
--- a/OnDeenUser/src/screens/ProfileScreen/HelpSupportPage.jsx
+++ b/OnDeenUser/src/screens/ProfileScreen/HelpSupportPage.jsx
@@ -18,7 +18,7 @@ const HelpSupportPage = () => {
     setRefreshing(false);
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
diff --git a/OnDeenUser/src/screens/ProfileScreen/ProfileScreen.jsx b/OnDeenUser/src/screens/ProfileScreen/ProfileScreen.jsx
index 1862fda..c3b31c3 100644
--- a/OnDeenUser/src/screens/ProfileScreen/ProfileScreen.jsx
+++ b/OnDeenUser/src/screens/ProfileScreen/ProfileScreen.jsx
@@ -1,6 +1,7 @@
 import React, { useCallback, useEffect, useMemo, useState } from 'react';
 import {
   BackHandler,
+  Image,
   Modal,
   Platform,
   Pressable,
@@ -14,11 +15,8 @@ import {
 import LinearGradient from 'react-native-linear-gradient';
 import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
 import Svg, {
-  Defs,
   Line,
-  LinearGradient as SvgLinearGradient,
   Polygon,
-  Stop,
 } from 'react-native-svg';
 import {
   Bell,
@@ -36,6 +34,7 @@ import { useFocusEffect, useNavigation } from '@react-navigation/native';
 import GuestModal from '../../modals/guestModal';
 import Loader from '../../components/loader';
 import {
+  getGamificationProfileAPI,
   getPendingGamificationSummaryAPI,
   getSelfProfileAPI,
   getUserProfileAPI,
@@ -44,6 +43,7 @@ import { clearLastEventId } from '../../helpers/storage';
 import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
 import { useStatusBar } from '../../components/statusbar';
 import { fontFamilies } from '../../assets/fonts/fonts';
+import { BASE_URL } from '../../helpers/Constant';
 
 const COLORS = {
   bgApp: '#F5F3F9',
@@ -118,12 +118,12 @@ const LEVEL_HADITHS = [
 
 const formatJoinedMonth = (dateString) => {
   if (!dateString || dateString === '0000-00-00 00:00:00') {
-    return 'Mar 2025';
+    return '';
   }
 
   const date = new Date(dateString);
   if (Number.isNaN(date.getTime())) {
-    return 'Mar 2025';
+    return '';
   }
 
   return new Intl.DateTimeFormat('en-GB', {
@@ -133,16 +133,53 @@ const formatJoinedMonth = (dateString) => {
 };
 
 const getInitials = (firstName, lastName) => {
-  const first = `${firstName || 'Aisha'}`.trim().charAt(0);
-  const last = `${lastName || 'B'}`.trim().charAt(0);
+  const first = `${firstName || ''}`.trim().charAt(0);
+  const last = `${lastName || ''}`.trim().charAt(0);
   return `${first}${last}`.toUpperCase();
 };
 
+const getProfileText = (...values) => {
+  for (const value of values) {
+    if (typeof value === 'string' && value.trim()) {
+      return value.trim();
+    }
+  }
+
+  return '';
+};
+
+const getBackendImageUri = (...values) => {
+  const uri = getProfileText(...values);
+  if (!uri) {
+    return '';
+  }
+
+  if (/^(https?:|data:|file:)/i.test(uri)) {
+    return uri;
+  }
+
+  const baseUrl = String(BASE_URL || '').replace(/\/+$/, '');
+  const path = uri.startsWith('/') ? uri : `/${uri}`;
+  return `${baseUrl}${path}`;
+};
+
 const numberOrFallback = (value, fallback) => {
   const parsed = Number(value);
   return Number.isFinite(parsed) ? parsed : fallback;
 };
 
+const pickGamificationProfile = (payload) => {
+  const response = payload?.response || payload;
+  return (
+    response?.gamification ||
+    response?.profile ||
+    response?.data?.gamification ||
+    response?.data ||
+    response ||
+    null
+  );
+};
+
 const clampScore = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
 
 const deriveNextLevelLabel = (gamification) => {
@@ -317,22 +354,52 @@ const TopAppBar = ({ onNotifications, onSettings, topInset = 0 }) => (
   </View>
 );
 
+const BackendAvatar = ({ imageUri, initials }) => {
+  const [imageFailed, setImageFailed] = useState(false);
+
+  if (imageUri && !imageFailed) {
+    return (
+      <Image
+        source={{ uri: imageUri }}
+        style={styles.avatarImage}
+        resizeMode="cover"
+        onError={() => setImageFailed(true)}
+      />
+    );
+  }
+
+  return (
+    <View style={styles.avatar}>
+      {initials ? <Text style={styles.avatarText}>{initials}</Text> : null}
+    </View>
+  );
+};
+
 const UserHeader = ({ profileData }) => {
-  const firstName = profileData?.first_name || 'Aisha';
-  const lastName = profileData?.last_name || 'B.';
-  const displayLastName = lastName ? `${lastName}` : 'B.';
-  const name = `${firstName} ${displayLastName}`.trim();
-  const joined = formatJoinedMonth(profileData?.created_on);
-  const location = profileData?.location || profileData?.city || 'London';
+  const firstName = getProfileText(profileData?.first_name);
+  const lastName = getProfileText(profileData?.last_name);
+  const name = [firstName, lastName].filter(Boolean).join(' ');
+  const email = getProfileText(profileData?.email, profileData?.email_id);
+  const joined = formatJoinedMonth(profileData?.created_on || profileData?.created_at);
+  const location = getProfileText(profileData?.location, profileData?.city);
+  const metaParts = [location, email, joined ? `joined ${joined}` : ''].filter(Boolean);
+  const profileImage = getBackendImageUri(
+    profileData?.profile_image,
+    profileData?.profile_picture,
+    profileData?.user_profile_image,
+    profileData?.avatar,
+    profileData?.image_url,
+  );
+  const initials = getInitials(firstName, lastName);
 
   return (
     <View style={styles.userHeader}>
-      <View style={styles.avatar}>
-        <Text style={styles.avatarText}>{getInitials(firstName, displayLastName)}</Text>
-      </View>
+      <BackendAvatar imageUri={profileImage} initials={initials} />
       <View style={styles.userCopy}>
-        <Text style={styles.userName} numberOfLines={1}>{name}</Text>
-        <Text style={styles.userMeta} numberOfLines={1}>{location} · joined {joined}</Text>
+        {name ? <Text style={styles.userName} numberOfLines={1}>{name}</Text> : null}
+        {metaParts.length > 0 ? (
+          <Text style={styles.userMeta} numberOfLines={1}>{metaParts.join(' · ')}</Text>
+        ) : null}
       </View>
     </View>
   );
@@ -472,13 +539,6 @@ const RadarChart = ({ axes }) => (
   <View style={styles.radarWrap}>
     <View style={styles.radarCanvas}>
       <Svg width={200} height={200} viewBox="0 0 200 200">
-        <Defs>
-          <SvgLinearGradient id="sunsetGradProfile" x1="0" y1="0" x2="1" y2="1">
-            <Stop offset="0" stopColor="#FFC94B" />
-            <Stop offset="0.55" stopColor="#FF7A4A" />
-            <Stop offset="1" stopColor="#E8418F" />
-          </SvgLinearGradient>
-        </Defs>
         <Polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
         <Polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
         <Polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
@@ -487,7 +547,7 @@ const RadarChart = ({ axes }) => (
         <Line x1="20" y1="100" x2="180" y2="100" stroke="#EFEBF5" strokeWidth="1" />
         <Polygon
           points={radarPolygonPoints(axes)}
-          fill="url(#sunsetGradProfile)"
+          fill="#FF7A4A"
           fillOpacity="0.25"
           stroke="#FF7A4A"
           strokeLinejoin="round"
@@ -677,7 +737,7 @@ const ProfileScreen = ({ route }) => {
   const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
   const [refreshing, setRefreshing] = useState(false);
   const [loading, setLoading] = useState(true);
-  const [isModalVisible, setModalVisible] = useState(false);
+  const [isModalVisible, setModalVisible] = useState(isSkippedLogin);
   const [rankInfoVisible, setRankInfoVisible] = useState(false);
   const [radarInfoVisible, setRadarInfoVisible] = useState(false);
   const [profileData, setProfileData] = useState(null);
@@ -685,13 +745,33 @@ const ProfileScreen = ({ route }) => {
   const { user_id } = route?.params || {};
 
   const fetchProfile = useCallback(async () => {
+    if (!user_id && isSkippedLogin) {
+      setProfileData(null);
+      setPendingSummary(null);
+      setLoading(false);
+      setRefreshing(false);
+      return;
+    }
+
     setRefreshing(true);
     try {
       const response = user_id
         ? await getUserProfileAPI({ data: { user_id } })
         : await getSelfProfileAPI();
-      setProfileData(response?.response || null);
+      let nextProfileData = response?.response || null;
+
+      if (!nextProfileData) {
+        throw new Error('Missing profile response');
+      }
+
       if (!user_id) {
+        const gamificationResponse = await getGamificationProfileAPI();
+        const gamification = pickGamificationProfile(gamificationResponse) || nextProfileData?.gamification;
+        if (!gamification) {
+          throw new Error('Missing gamification response');
+        }
+        nextProfileData = { ...nextProfileData, gamification };
+
         try {
           const summaryResponse = await getPendingGamificationSummaryAPI();
           setPendingSummary(summaryResponse?.response?.summary || null);
@@ -701,6 +781,8 @@ const ProfileScreen = ({ route }) => {
       } else {
         setPendingSummary(null);
       }
+
+      setProfileData(nextProfileData);
     } catch (error) {
       setProfileData(null);
       setPendingSummary(null);
@@ -708,7 +790,7 @@ const ProfileScreen = ({ route }) => {
       setLoading(false);
       setRefreshing(false);
     }
-  }, [user_id]);
+  }, [user_id, isSkippedLogin]);
 
   useEffect(() => {
     const handleBackPress = () => {
@@ -752,6 +834,9 @@ const ProfileScreen = ({ route }) => {
 
   const handleCancel = () => {
     setModalVisible(false);
+    if (isSkippedLogin) {
+      navigation.getParent?.()?.navigate('Home');
+    }
   };
 
   const onSettings = () => {
@@ -762,12 +847,49 @@ const ProfileScreen = ({ route }) => {
     navigation.navigate('Notification');
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
+
+  if (!user_id && isSkippedLogin) {
+    return (
+      <ContainerComponent style={styles.root}>
+        <GuestModal
+          isVisible={isModalVisible}
+          title="Confirm Login"
+          message="You are currently using the app in guest mode. To access all features, please log in."
+          onCancel={handleCancel}
+          onConfirm={handleConfirmLogout}
+        />
+        <TopAppBar
+          onNotifications={onNotifications}
+          onSettings={onSettings}
+          topInset={Platform.OS === 'ios' ? insets.top : 0}
+        />
+      </ContainerComponent>
+    );
+  }
 
   if (loading && !profileData) {
     return <Loader />;
   }
 
+  if (!profileData) {
+    return (
+      <ContainerComponent style={styles.root}>
+        <TopAppBar
+          onNotifications={onNotifications}
+          onSettings={onSettings}
+          topInset={Platform.OS === 'ios' ? insets.top : 0}
+        />
+        <View style={styles.profileUnavailable}>
+          <Text style={styles.profileUnavailableTitle}>Could not load backend profile</Text>
+          <Text style={styles.profileUnavailableText}>
+            Please try again after the backend responds.
+          </Text>
+        </View>
+      </ContainerComponent>
+    );
+  }
+
   return (
     <ContainerComponent style={styles.root}>
       <GuestModal
@@ -1054,6 +1176,12 @@ const styles = StyleSheet.create({
     justifyContent: 'center',
     width: 52,
   },
+  avatarImage: {
+    backgroundColor: '#F0EDF8',
+    borderRadius: 26,
+    height: 52,
+    width: 52,
+  },
   avatarText: {
     color: COLORS.rank,
     fontFamily: boldFont,
@@ -1076,6 +1204,27 @@ const styles = StyleSheet.create({
     lineHeight: 18,
     marginTop: 2,
   },
+  profileUnavailable: {
+    alignItems: 'center',
+    flex: 1,
+    justifyContent: 'center',
+    paddingHorizontal: 24,
+  },
+  profileUnavailableTitle: {
+    color: COLORS.text,
+    fontFamily: boldFont,
+    fontSize: 20,
+    lineHeight: 26,
+    textAlign: 'center',
+  },
+  profileUnavailableText: {
+    color: COLORS.muted,
+    fontFamily: baseFont,
+    fontSize: 14,
+    lineHeight: 20,
+    marginTop: 8,
+    textAlign: 'center',
+  },
   rankCard: {
     ...shadowCard,
     backgroundColor: '#F0EDF8',
diff --git a/OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx b/OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx
index 14c7b7b..5a66b70 100644
--- a/OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx
+++ b/OnDeenUser/src/screens/ProfileScreen/ReportBug.jsx
@@ -18,7 +18,7 @@ const ReportBug = () => {
     setRefreshing(false);
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
diff --git a/OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx b/OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx
index 0d9db18..146d38f 100644
--- a/OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx
+++ b/OnDeenUser/src/screens/ProfileSetting/ProfileSetting.jsx
@@ -139,7 +139,7 @@ const ProfileSettings = () => {
       <Loader />
     );
   }
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={styles.container}>
diff --git a/OnDeenUser/src/screens/RegisterScreen/Registration.jsx b/OnDeenUser/src/screens/RegisterScreen/Registration.jsx
index 1414ca7..450fe07 100644
--- a/OnDeenUser/src/screens/RegisterScreen/Registration.jsx
+++ b/OnDeenUser/src/screens/RegisterScreen/Registration.jsx
@@ -396,7 +396,7 @@ const Registration = () => {
 
   console.log(formik?.values, 'VALUES');
   
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
diff --git a/OnDeenUser/src/screens/RequestSessions/RequestSessions.jsx b/OnDeenUser/src/screens/RequestSessions/RequestSessions.jsx
index 8c7bcff..dc9c55d 100644
--- a/OnDeenUser/src/screens/RequestSessions/RequestSessions.jsx
+++ b/OnDeenUser/src/screens/RequestSessions/RequestSessions.jsx
@@ -230,7 +230,7 @@ const RequestSessions = ({ route }) => {
   };
 
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={[styles.container]}>
diff --git a/OnDeenUser/src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx b/OnDeenUser/src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx
index 09672a8..e03d3e6 100644
--- a/OnDeenUser/src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx
+++ b/OnDeenUser/src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx
@@ -57,6 +57,42 @@ import AddtoCalender from './AddtoCalender';
 import ConfirmationModal from '../../components/ConfirmationModal';
 import AddToCalendar1 from '../AddToCalendar/AddToCalendar1';
 
+const pickEventDetail = (payload) => {
+  if (!payload) {
+    return null;
+  }
+
+  const candidates = [
+    payload,
+    payload?.response,
+    payload?.response?.data,
+    payload?.response?.event,
+    payload?.response?.event_detail,
+    payload?.response?.event_details,
+    payload?.response?.details,
+    payload?.data,
+    payload?.event,
+    payload?.event_detail,
+    payload?.event_details,
+    payload?.details,
+  ];
+
+  for (const candidate of candidates) {
+    if (candidate?.id) {
+      return candidate;
+    }
+    if (candidate?.event_id) {
+      return { ...candidate, id: candidate.event_id };
+    }
+  }
+
+  if (Array.isArray(payload?.response?.events)) {
+    return payload.response.events.find((event) => event?.id) || null;
+  }
+
+  return null;
+};
+
 const hasCompleteEventDetail = (detail) => {
   if (!detail?.id) {
     return false;
@@ -100,7 +136,8 @@ const mergeEventDetails = (...details) => {
   });
 
   arrayKeys.forEach((key) => {
-    const source = [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
+    const source = [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]) && detail[key].length > 0)
+      || [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
     if (source) {
       merged[key] = source[key];
     }
@@ -132,6 +169,7 @@ const SecondEventDetailsPage = ({ route }) => {
   const [showCancelModal, setShowCancelModal] = useState(false); // State for modal visibility
   const [showCancelConfromModal, setshowCancelConfromModal] = useState(false); // State for modal visibility
   const [showCancelConfromData, setshowCancelConfromData] = useState(false); // State for modal visibility
+  const topInset = useTopInset();
 
   const { message, error, apiStatus } = useSelector(
     (state) => state.checkInSlice,
@@ -175,16 +213,18 @@ const SecondEventDetailsPage = ({ route }) => {
     if (!id) {
       setEventDetail(routeBooking || {});
       setLoading(false);
+      setRefreshing(false);
       return;
     }
 
     try {
+      setRefreshing(true);
       const res = await eventbyIdAPI(id, participant_id);
-      let responseDetail = res?.status === false ? null : res?.response;
+      let responseDetail = res?.status === false ? null : pickEventDetail(res);
       let publicDetail = null;
       if (!hasCompleteEventDetail(responseDetail)) {
         const fallbackRes = await publicEventbyIdAPI(id);
-        publicDetail = fallbackRes?.status === false ? null : fallbackRes?.response;
+        publicDetail = fallbackRes?.status === false ? null : pickEventDetail(fallbackRes);
       }
       const completeDetail = publicDetail || responseDetail;
       setEventDetail(completeDetail?.id
@@ -196,6 +236,7 @@ const SecondEventDetailsPage = ({ route }) => {
       setEventDetail(routeBooking || {});
     } finally {
       setLoading(false);
+      setRefreshing(false);
     }
   };
 
@@ -217,12 +258,6 @@ const SecondEventDetailsPage = ({ route }) => {
     setNewNoteModalVisible(true);
   }, []);
 
-  useEffect(() => {
-    if (id) {
-      hitapitogetdatafilter()
-    }
-  }, [id]);
-
   const showNotification = async (title, body, filePath) => {
     await notifee.requestPermission();
 
@@ -453,7 +488,7 @@ const SecondEventDetailsPage = ({ route }) => {
           onPress={closeDropdown}
           onStartShouldSetResponder={() => true}
         >
-          <View style={[styles.dropdownContainer, { marginTop: useTopInset() + 5 }]}>
+          <View style={[styles.dropdownContainer, { marginTop: topInset + 5 }]}>
             <TouchableOpacity onPress={handleMarkComplete} style={styles.dropdownButton} disabled={isCompleting || isCancelling}>
               <Text style={styles.dropdownText}>
                 {isCompleting ? 'Completing...' : 'Mark as Completed'}
diff --git a/OnDeenUser/src/screens/SecondEventDetailsPage/downloadfile.js b/OnDeenUser/src/screens/SecondEventDetailsPage/downloadfile.js
index 3d01a2e..72b861c 100644
--- a/OnDeenUser/src/screens/SecondEventDetailsPage/downloadfile.js
+++ b/OnDeenUser/src/screens/SecondEventDetailsPage/downloadfile.js
@@ -100,11 +100,10 @@ export const openFile = async (filePath) => {
       }
     } else {
       // iOS
-      await Linking.openURL(filePath);
+      await Linking.openURL(fileUri);
     }
   } catch (err) {
 
   }
 };
 
-
diff --git a/OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx b/OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx
index 8e6ad73..1e06c3f 100644
--- a/OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx
+++ b/OnDeenUser/src/screens/SignupScreen/SignupEmailScreen.jsx
@@ -29,8 +29,6 @@ const SignupMobileScreen = () => {
     Keyboard.dismiss();
   };
 
-  GoogleSignin.configure({});
-
   if (status === 'loading') {
     return (
       <Loader
diff --git a/OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx b/OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx
index 4b59053..8f06537 100644
--- a/OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx
+++ b/OnDeenUser/src/screens/SignupScreen/SignupMobileScreen.jsx
@@ -34,8 +34,6 @@ const SignupMobileScreen = () => {
     Keyboard.dismiss();
   };
 
-  GoogleSignin.configure({});
-
   const handleSubmitForm = async (values) => {
     setIsLoading(true);
     try {
diff --git a/OnDeenUser/src/screens/SignupScreen/checkGoogleLogin.js b/OnDeenUser/src/screens/SignupScreen/checkGoogleLogin.js
index 971aa61..1f96f89 100644
--- a/OnDeenUser/src/screens/SignupScreen/checkGoogleLogin.js
+++ b/OnDeenUser/src/screens/SignupScreen/checkGoogleLogin.js
@@ -1,8 +1,9 @@
 import AsyncStorage from "@react-native-async-storage/async-storage";
+import { Platform } from "react-native";
 import { createRegisterSocial } from "../../redux/callapis/CommonService";
 import { setIsSkippedLoginAllow, setLoginState, setLoginToken } from "../../redux/slices/loginSlice";
 import { setAccessToken } from "../../redux/slices/verifyOtpSlice";
-import { GOOGLESIGNINWEBCLIENTID } from "../../helpers/Constant";
+import { GOOGLESIGNINIOSCLIENTID, GOOGLESIGNINWEBCLIENTID } from "../../helpers/Constant";
 
 let googleLoginInFlight = false;
 
@@ -18,7 +19,13 @@ const isDeveloperConfigurationError = (error) => {
 };
 
 const signInWithGoogle = async (GoogleSignin) => {
-    GoogleSignin.configure({});
+    const config = {
+        ...(GOOGLESIGNINWEBCLIENTID && { webClientId: GOOGLESIGNINWEBCLIENTID }),
+        ...(Platform.OS === 'ios' && GOOGLESIGNINIOSCLIENTID && { iosClientId: GOOGLESIGNINIOSCLIENTID }),
+        offlineAccess: false,
+    };
+
+    GoogleSignin.configure(config);
 
     try {
         return await GoogleSignin.signIn();
@@ -27,10 +34,7 @@ const signInWithGoogle = async (GoogleSignin) => {
             throw error;
         }
 
-        GoogleSignin.configure({
-            webClientId: GOOGLESIGNINWEBCLIENTID,
-            offlineAccess: false,
-        });
+        GoogleSignin.configure(config);
         return GoogleSignin.signIn();
     }
 };
@@ -43,12 +47,14 @@ export const handleGoogleLogin = async (dispatch, navigation, GoogleSignin, show
     googleLoginInFlight = true;
     try {
         // Check for Play Services
-        const hasPlayService = await GoogleSignin.hasPlayServices({
-            showPlayServicesUpdateDialog: true,
-        });
-        if (!hasPlayService) {
-            showToast('Google Play Services not available');
-            return;
+        if (Platform.OS === 'android') {
+            const hasPlayService = await GoogleSignin.hasPlayServices({
+                showPlayServicesUpdateDialog: true,
+            });
+            if (!hasPlayService) {
+                showToast('Google Play Services not available');
+                return;
+            }
         }
 
         // Sign in with Google
diff --git a/OnDeenUser/src/screens/SpeakerProfile/SpeakerProfile.jsx b/OnDeenUser/src/screens/SpeakerProfile/SpeakerProfile.jsx
index ddfe9c7..572131f 100644
--- a/OnDeenUser/src/screens/SpeakerProfile/SpeakerProfile.jsx
+++ b/OnDeenUser/src/screens/SpeakerProfile/SpeakerProfile.jsx
@@ -89,7 +89,7 @@ const SpeakerScreen = ({ route }) => {
     }, []),
   );
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={[styles.container]}>
diff --git a/OnDeenUser/src/screens/VerifyOTP/VerifyEmailOTP.jsx b/OnDeenUser/src/screens/VerifyOTP/VerifyEmailOTP.jsx
index f11f56f..3233fe5 100644
--- a/OnDeenUser/src/screens/VerifyOTP/VerifyEmailOTP.jsx
+++ b/OnDeenUser/src/screens/VerifyOTP/VerifyEmailOTP.jsx
@@ -293,7 +293,7 @@ const VerifyEmailOTP = () => {
     }
   };
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ backgroundColor: '#FDFBFF', flex: 1 }}>
diff --git a/OnDeenUser/src/screens/VerifyOTP/VerifyMobileOTP.jsx b/OnDeenUser/src/screens/VerifyOTP/VerifyMobileOTP.jsx
index fe9094a..d4cf842 100644
--- a/OnDeenUser/src/screens/VerifyOTP/VerifyMobileOTP.jsx
+++ b/OnDeenUser/src/screens/VerifyOTP/VerifyMobileOTP.jsx
@@ -219,7 +219,7 @@ const VerifyOTP = () => {
     }
   };
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   return (
     <ContainerComponent style={{ backgroundColor: '#FDFBFF', flex: 1 }}>
diff --git a/OnDeenUser/src/screens/Wishlist/Wishlist.jsx b/OnDeenUser/src/screens/Wishlist/Wishlist.jsx
index 0cdabe2..cf680eb 100644
--- a/OnDeenUser/src/screens/Wishlist/Wishlist.jsx
+++ b/OnDeenUser/src/screens/Wishlist/Wishlist.jsx
@@ -73,7 +73,7 @@ const Wishlist = () => {
   );
 
 
-  const ContainerComponent = Platform.OS == 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
   const topheight = Platform.OS == 'ios' ? useTopInset() : 0;
 
   // Show loader for first 2 seconds or while initialLoading is true
diff --git a/OnDeenUser/src/screens/allQrCodeScreen/AllQRCodeDownload.jsx b/OnDeenUser/src/screens/allQrCodeScreen/AllQRCodeDownload.jsx
index cba432c..c9a4040 100644
--- a/OnDeenUser/src/screens/allQrCodeScreen/AllQRCodeDownload.jsx
+++ b/OnDeenUser/src/screens/allQrCodeScreen/AllQRCodeDownload.jsx
@@ -113,7 +113,7 @@ const AllqrCode = ({ route }) => {
     );
   };
 
-  const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+  const ContainerComponent = SafeAreaView;
 
   useStatusBar({ backgroundColor: '#EDE9F1', barStyle: 'dark-content' });
   const openinBrowser = async (item) => {
diff --git a/OnDeenUser/src/screens/badgesScreen/index.tsx b/OnDeenUser/src/screens/badgesScreen/index.tsx
index e467e28..7ff08d6 100644
--- a/OnDeenUser/src/screens/badgesScreen/index.tsx
+++ b/OnDeenUser/src/screens/badgesScreen/index.tsx
@@ -48,7 +48,7 @@ const BadgesScreen = () => {
       )}
     </TouchableOpacity>
   );
-    const ContainerComponent = Platform.OS === 'ios' ? View : SafeAreaView;
+    const ContainerComponent = SafeAreaView;
   
   return (
     <ContainerComponent style={styles.container}>
diff --git a/OnDeenUser/src/screens/splashScreen/index.jsx b/OnDeenUser/src/screens/splashScreen/index.jsx
index d549616..1d1ed87 100644
--- a/OnDeenUser/src/screens/splashScreen/index.jsx
+++ b/OnDeenUser/src/screens/splashScreen/index.jsx
@@ -24,8 +24,8 @@ const SplashScreen = () => {
     if (tokenStatus === 'succeeded') {
       if (isSkippedLoginAllow) {
         dispatch(setIsSkippedLogin(true));
+        dispatch(setLoginState(false));
       }
-      dispatch(setLoginState(true));
     } else if (tokenStatus === 'failed') {
 
     }
```
