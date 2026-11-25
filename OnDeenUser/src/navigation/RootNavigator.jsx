import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/splashScreen';
import AuthNavigator from './AuthNavigator';
import AllAccessNavigator from './AllAccessNavigator';

const useAppInitialization = () => {
  const loginToken = useSelector((state) => state.user.loginToken);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserStatus = async () => {
    try {
      const isNewUser = await AsyncStorage.getItem('isNewUser');
      if (isNewUser === null) {
        await AsyncStorage.setItem('isNewUser', 'false');
      }
    } catch (error) {

    } finally {
      // Delay splash screen duration
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [loginToken]);

  return { isLoading };
};

const RootNavigator = () => {
  const { isLoading } = useAppInitialization();
  const isLogin = useSelector((state) => state.user.isLogin);
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);

  if (isLoading) {
    return <SplashScreen />;
  }

  return isLogin || isSkippedLogin ? <AllAccessNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
