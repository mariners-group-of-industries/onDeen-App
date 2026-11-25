import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const NavigationService = {
  navigate: (name, params) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },
  isReady: () => navigationRef.isReady(),
  navigateBasedOnNotification: (data, type) => {

    const notificationType = Number(type);
    if (isNaN(notificationType)) {

      return;
    }

    const isValidOdid = (odid) => {
      const num = Number(odid);
      return !isNaN(num) && num > 0;
    };

    switch (notificationType) {
      case 2:
      case 7:
        if (!isValidOdid(data?.odid)) {

          return;
        }
        NavigationService.navigate('CourseDetails', { id: Number(data.odid) });
        break;

      case 3:
        NavigationService.navigate('NotificationList');
        break;

      case 4:
        NavigationService.navigate('OneToOneSession', { sessionId: Number(data?.odid) || null });
        break;

      case 5:
      case 6:
      case 8:
        if (!isValidOdid(data?.odid)) {

          return;
        }
        NavigationService.navigate('Participants', { id: Number(data.odid) });
        break;

      case 9:
        if (!isValidOdid(data?.odid)) {

          return;
        }
        NavigationService.navigate('AskedQuestion', { id: Number(data.odid) });
        break;

      default:
    }
  }
};
