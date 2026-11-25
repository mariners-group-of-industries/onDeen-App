import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/splashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AllAccessNavigator from './AllAccessNavigator';
import BuddyNavigator from './BuddyNavigator';
import SpeakerNavigator from './SpeakerNavigator';

const useAppInitialization = () => {
  const loginToken = useSelector((state: RootState) => state.user.loginToken);

  const [initialScreen, setInitialScreen] = useState<'Auth' | 'Main' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  const checkUserStatus = async () => {
    try {
      const isNewUser = await AsyncStorage.getItem('isNewUser');
      if (isNewUser === null) {
        await AsyncStorage.setItem('isNewUser', 'false');
        setIsFirstLaunch(true);
      }
      // Set initial screen based on login token
      setInitialScreen(loginToken ? 'Main' : 'Auth');
    } catch (error) {
      ;
      setInitialScreen('Auth'); // Default to Auth in case of error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [loginToken]);

  return { initialScreen, isLoading, isFirstLaunch };
};

const RootNavigator: React.FC = () => {
  const { initialScreen, isLoading, isFirstLaunch } = useAppInitialization();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const roleType = useSelector((state: RootState) => state.user.roleType || 3);

  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2000); // 3 seconds delay for splash screen

    // Clean up the timeout when the component unmounts
    return () => clearTimeout(splashTimeout);
  }, []);

  if (showSplashScreen || isLoading) {
    return <SplashScreen />;
  }

  if (!isLogin) return <AuthNavigator key="auth" />;
  if (Number(roleType) === 5) return <BuddyNavigator key="buddy" />;
  if (Number(roleType) === 4) return <SpeakerNavigator key="speaker" />;
  return <AllAccessNavigator key="main" />;
};

export default RootNavigator;
