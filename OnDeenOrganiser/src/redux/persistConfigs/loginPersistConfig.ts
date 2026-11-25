import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['user', 'loginToken', 'isLogin', 'roleType'],
};
