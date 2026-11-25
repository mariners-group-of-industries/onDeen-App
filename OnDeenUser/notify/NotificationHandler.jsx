// NotificationHandler.js
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { navigationRef } from './GlobalNavigationRef';

// This function decides where to navigate
function handleNotificationNavigation(data) {
    console.log(data, 'NAVIGATE TO THIS URL');

    if (!data?.type) return;

    switch (data.type) {
        case '4':
            navigationRef.current?.navigate('OneToOneSession', { data: data });
            break;
        case '3':
        case '5':
        case '6':
        case '7':
            navigationRef.current?.navigate('BookingDetails', { id: data?.odid || data?.event_id });
            break;
        case '2':
            navigationRef.current?.navigate('CourseDetails', { eventId: data?.odid || data?.event_id });
            break;
        case '1':
        case '8':
            navigationRef.current?.navigate('Calendar');
            break;
        default:
            navigationRef.current?.navigate('Profile');
    }
}

export async function registerNotificationListeners() {
    // Foreground Notifications
    messaging().onMessage(async remoteMessage => {
        console.log('📩 Foreground message11:', remoteMessage);
        await notifee.displayNotification({
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            android: {
                channelId: 'default',
                pressAction: { id: 'default' },
            },
        });
    });

    // Background & Quit State Clicks
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📩 Opened from background:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
    });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('📩 Opened from quit state:', remoteMessage);
                handleNotificationNavigation(remoteMessage.data);
            }
        });

    // Notifee Foreground Click Events
    notifee.onForegroundEvent(({ type, detail }) => {
        if (type == EventType.PRESS) {
            console.log('📩 Notifee press:', JSON.stringify(detail.notification));
            console.log('📩 Notifee onpresss data:', JSON.stringify(detail.notification.data));
            handleNotificationNavigation(detail.notification.data);
        }
    });

    // Notifee Background Click Events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('📩 Notifee background press:', detail.notification);
            handleNotificationNavigation(detail.notification.data);
        }
    });
}
