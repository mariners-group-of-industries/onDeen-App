import messaging from '@react-native-firebase/messaging';
import { displayNotification } from './notificationHandler';
import { handleNotificationNavigation } from './notificationNavigator';
import { ENABLE_FCM_NOTIFICATIONS } from '../helpers/Constant';

// Request user permission for notifications
export const requestUserPermission = async () => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return false;
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getFCMToken();
  }
};

// Get FCM token
export const getFCMToken = async () => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return null;
  }

  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

// Setup foreground message handler
export const setupForegroundHandler = () => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return () => {};
  }

  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);
    displayNotification(remoteMessage);
  });
};

// Setup background/quit state message handler
export const setupBackgroundHandler = () => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return undefined;
  }

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);
    displayNotification(remoteMessage);
  });
};

// Setup notification opened handler
export const setupNotificationOpenedHandler = (navigationRef) => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return () => {};
  }

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
    handleNotificationNavigation(remoteMessage, navigationRef);
  });

  // Check if app was opened from a quit state via notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage);
        handleNotificationNavigation(remoteMessage, navigationRef);
      }
    });
};
