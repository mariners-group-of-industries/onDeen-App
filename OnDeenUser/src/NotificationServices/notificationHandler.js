import notifee from '@notifee/react-native';
import { handleNotificationNavigation } from './notificationNavigator';

export const displayNotification = async (remoteMessage) => {
  const { notification, data } = remoteMessage;

  // Create channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display notification
  await notifee.displayNotification({
    title: notification?.title || 'New Notification',
    body: notification?.body || 'You have a new message',
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
    data,
  });
};

export const setupNotificationInteractionHandler = (navigationRef) => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === 'PRESS' || type === 'ACTION_PRESS') {
      handleNotificationNavigation({ data: detail.notification.data }, navigationRef);
    }
  });
};