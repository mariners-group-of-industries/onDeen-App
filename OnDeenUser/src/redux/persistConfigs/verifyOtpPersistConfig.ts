import AsyncStorage from '@react-native-async-storage/async-storage';

export const verifyOtpPersistConfig = {
  key: 'verifyOtp',
  storage: AsyncStorage,
  whitelist: ['is_register', 'access_token','isLogin','verifyOtp_access_token','pendingBooking'],
};
