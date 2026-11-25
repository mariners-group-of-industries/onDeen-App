import { openNotificationLink } from '../helpers/notificationLinks';

export const handleNotificationNavigation = async (remoteMessage, navigationRef) => {
  console.log(remoteMessage.data, 'remoteMessage.dataremoteMessage.data');
    
  if (!remoteMessage.data || !navigationRef?.isReady?.()) return;

  const { screen, id, link_url, url } = remoteMessage.data;

  if (link_url || url) {
    await openNotificationLink(link_url || url, navigationRef);
    return;
  }

  if (!screen) return;

  try {
    switch (screen.toLowerCase()) {
      case 'home':
        navigationRef.navigate('Home');
        break;
      case 'profile':
        navigationRef.navigate('Profile');
        break;
      case 'details':
        if (id) {
          navigationRef.navigate('Details', { itemId: id });
        } else {
          navigationRef.navigate('Details');
        }
        break;
      case 'settings':
        navigationRef.navigate('Settings');
        break;
      // Add more cases as needed
      default:
        console.log('Unknown screen:', screen);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
