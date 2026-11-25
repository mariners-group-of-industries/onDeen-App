import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLogoutHandler } from '../services/api';
import { logout, setIsSkippedLogin, setLoginState } from '../redux/slices/loginSlice';
import { resetOtpState } from '../redux/slices/verifyOtpSlice';
import { resetRegisterState } from '../redux/slices/registerUserSlice';
import { resetProfileState } from '../redux/slices/profileSlice';
import { clearLastEventId } from '../helpers/storage';
import { persistor } from '../redux/store';

export default function AppAutologout() {
  const dispatch = useDispatch();

  useEffect(() => {
    const globalAutoLogoutHandler = async () => {
      console.log('🔄 Auto logout triggered from AppAutologout');
      
      try {
        // Use Promise.all for parallel operations where possible
        await Promise.all([
          AsyncStorage.removeItem('isNewUser'),
          AsyncStorage.removeItem('otherData'),
          clearLastEventId(),
        ]);

        // Dispatch reset actions
        dispatch(resetOtpState());
        dispatch(resetRegisterState());
        dispatch(resetProfileState());
        dispatch(setIsSkippedLogin(false));
        dispatch(setLoginState(false));
        dispatch(logout());

        // Purge persisted store
        await persistor.purge();

        console.log('✅ Auto logout completed successfully');
      } catch (error) {
        console.error('❌ Error during auto logout:', error);
      }
    };

    // Set the global logout handler
    setLogoutHandler(globalAutoLogoutHandler);
    console.log('✅ Auto logout handler registered in AppAutologout');

    // Cleanup when component unmounts
    return () => {
      setLogoutHandler(null);
    };
  }, [dispatch]);

  return null;
}
