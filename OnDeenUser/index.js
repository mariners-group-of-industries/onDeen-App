import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { hitapitogetdatafilter } from './src/checkpurpose/notificationHelpers';
import { NavigationService } from './src/checkpurpose/NavigationService';
import { ENABLE_FCM_NOTIFICATIONS } from './src/helpers/Constant';

LogBox.ignoreLogs([
  "The 'navigation' object hasn't been initialized",
]);
LogBox.ignoreAllLogs(true);

if (ENABLE_FCM_NOTIFICATIONS) {
  const messagingModule = require('@react-native-firebase/messaging');
  const messaging = messagingModule.default || messagingModule;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await hitapitogetdatafilter();

    const type = remoteMessage?.data?.type;
    const eventId = remoteMessage?.data?.event_id;
    const data = remoteMessage?.data;

    setTimeout(() => {
      if (type && NavigationService.isReady()) {
        NavigationService.navigateBasedOnNotification(data, type, eventId);
      }
    }, 100);
  });
}

AppRegistry.registerComponent(appName, () => App);
