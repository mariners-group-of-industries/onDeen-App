// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_EVENT_KEY = 'lastAttemptedEventId';

export const saveLastEventId = async (eventId: number) => {
  try {
    await AsyncStorage.setItem(LAST_EVENT_KEY, JSON.stringify(eventId));
  } catch (err) {

  }
};

export const getLastEventId = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(LAST_EVENT_KEY);
    return value ? parseInt(value, 10) : null;
  } catch (err) {

    return null;
  }
};

export const clearLastEventId = async () => {
  try {
    await AsyncStorage.removeItem(LAST_EVENT_KEY);
  } catch (err) {

  }
};
