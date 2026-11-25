import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerPersistConfig = {
  key: 'registerUser',
  storage: AsyncStorage,
  whitelist: ['is_register', 'access_token','isLogin','pendingBooking'],
};
