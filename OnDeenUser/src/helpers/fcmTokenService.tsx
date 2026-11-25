import { getMessaging } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENABLE_FCM_NOTIFICATIONS } from './Constant';

const FCM_TOKEN_KEY = 'fcmToken';

/**
 * Fetches and saves the FCM token in AsyncStorage.
 * Avoids re-fetching if the token already exists.
 */
export const getAndSaveFcmToken = async (): Promise<string | null> => {
  if (!ENABLE_FCM_NOTIFICATIONS) {
    return null;
  }

  try {
    let storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

    if (!storedToken) {
      const newToken = await getMessaging().getToken();
      
      if (newToken) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
        return newToken;
      }
    }

    return storedToken;
  } catch (error) {

    return null;
  }
};

/**
 * Retrieves the stored FCM token without re-fetching.
 */
export const getStoredFcmToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(FCM_TOKEN_KEY);
  } catch (error) {

    return null;
  }
};
