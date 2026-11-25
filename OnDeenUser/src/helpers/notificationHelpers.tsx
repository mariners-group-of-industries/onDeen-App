import {Platform} from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import {createNavigationContainerRef} from '@react-navigation/native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import { ENABLE_FCM_NOTIFICATIONS } from './Constant';

export const navigationRef = createNavigationContainerRef();

export const isIOS = () => Platform.OS === 'ios';

export const generateDeviceFcmToken = async () => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return null;
  }

  try {
    const token = await getMessaging().getToken();
    return token;
  } catch (error) {

  }
};

export const onDisplayNotification = async (remoteMessage:any) => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return;
  }

  // Request permissions (required for iOS)
  if (isIOS()) {
    await notifee.requestPermission();
  }

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
    data: remoteMessage?.data,
    android: {
      channelId,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
        launchActivity: 'default',
        importance: AndroidImportance.HIGH,
      },
    },
  });
};
