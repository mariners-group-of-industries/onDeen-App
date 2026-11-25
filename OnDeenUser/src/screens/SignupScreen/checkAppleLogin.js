import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { createRegisterSocial } from '../../redux/callapis/CommonService';
import { setIsSkippedLoginAllow, setLoginState, setLoginToken } from '../../redux/slices/loginSlice';
import { setAccessToken } from '../../redux/slices/verifyOtpSlice';

const APPLE_PROFILE_KEY = 'ondeen_apple_profile';
let appleLoginInFlight = false;

const readCachedProfile = async () => {
  try {
    return JSON.parse(await AsyncStorage.getItem(APPLE_PROFILE_KEY)) || {};
  } catch {
    return {};
  }
};

const cacheProfile = async (profile) => {
  const existing = await readCachedProfile();
  await AsyncStorage.setItem(APPLE_PROFILE_KEY, JSON.stringify({
    ...existing,
    ...Object.fromEntries(Object.entries(profile).filter(([, value]) => Boolean(value))),
  }));
};

export const handleAppleLogin = async ({ dispatch, navigation, showToast }) => {
  if (appleLoginInFlight) {
    return;
  }

  if (Platform.OS !== 'ios' || !appleAuth.isSupported) {
    showToast('Sign in with Apple is not available on this device');
    return;
  }

  appleLoginInFlight = true;
  try {
    const credential = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    if (!credential?.identityToken) {
      showToast('Apple did not return an identity token');
      return;
    }

    const cachedProfile = await readCachedProfile();
    const firstName = credential?.fullName?.givenName || cachedProfile?.firstName || '';
    const lastName = credential?.fullName?.familyName || cachedProfile?.lastName || '';
    const email = credential?.email || cachedProfile?.email || '';

    await cacheProfile({ firstName, lastName, email });

    const response = await createRegisterSocial({
      data: {
        email_id: email,
        provider: 'apple',
        access_token: credential.identityToken,
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (response?.response?.access_token) {
      const tokenData = { access_token: response.response.access_token };
      await AsyncStorage.setItem('first_time_login', 'true');
      dispatch(setAccessToken(tokenData));
      dispatch(setLoginToken(tokenData));
      dispatch(setLoginState(true));
      dispatch(setIsSkippedLoginAllow(false));
      return;
    }

    if (response?.status === false || response?.error) {
      showToast(response?.response?.message || response?.error?.message || 'Apple sign-in failed');
      return;
    }

    navigation.navigate('Registration', {
      IsGoogleLogin: false,
      isVerified: false,
      socialAccessToken: credential.identityToken,
      socialId: credential.user || response?.response?.social_id,
      socialProvider: 'apple',
      userData: {
        email: email || response?.response?.email_id || '',
        familyName: lastName,
        givenName: firstName,
        id: credential.user || response?.response?.social_id,
      },
    });
  } catch (error) {
    const code = String(error?.code || '');
    if (!code.includes('CANCELED') && !code.includes('1001')) {
      showToast(error?.message || 'Apple sign-in failed - please try again');
    }
  } finally {
    appleLoginInFlight = false;
  }
};
