import AsyncStorage from '@react-native-async-storage/async-storage';

export const tokenPersistConfig = {
  key: 'token',
  storage: AsyncStorage,
  whitelist: ['token'],
};
