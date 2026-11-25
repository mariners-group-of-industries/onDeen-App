import {organizerRegisterSocialAPI} from '../../services/authService';
import {setLoginToken} from '../../redux/slices/loginSlice';
import {GOOGLESIGNINWEBCLIENTID} from '../../helpers/Constant';

const googleErrorMessage = error => {
  const code = error?.code || '';

  if (code === 'SIGN_IN_CANCELLED') {
    return 'Google sign-in was cancelled';
  }
  if (code === 'IN_PROGRESS') {
    return 'Google sign-in is already in progress';
  }
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    return 'Google Play Services is not available';
  }
  if (code === 'NOT_CONFIGURED') {
    return 'Google sign-in is not configured on this build';
  }

  return 'Google sign-in failed. Please try again.';
};

const backendErrorMessage = response => {
  const message = response?.response?.message || '';
  if (message.includes('Repository error') || message.includes('psycopg2')) {
    return 'Google login failed. Please try again.';
  }
  return message || 'Google login failed';
};

const isDeveloperConfigurationError = error => {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return (
    code.includes('10') ||
    code.includes('DEVELOPER_ERROR') ||
    message.includes('DEVELOPER_ERROR') ||
    message.includes('ApiException: 10')
  );
};

const googleConfig = GOOGLESIGNINWEBCLIENTID
  ? {webClientId: GOOGLESIGNINWEBCLIENTID, offlineAccess: false}
  : null;

let googleLoginInFlight = false;

const signInWithGoogle = async GoogleSignin => {
  if (!googleConfig) {
    const error = new Error('Google sign-in is not configured for this build');
    error.code = 'NOT_CONFIGURED';
    throw error;
  }
  GoogleSignin.configure(googleConfig);

  try {
    return await GoogleSignin.signIn();
  } catch (error) {
    if (!isDeveloperConfigurationError(error) || !GOOGLESIGNINWEBCLIENTID) {
      throw error;
    }

    GoogleSignin.configure(googleConfig);
    return GoogleSignin.signIn();
  }
};

export const handleGoogleLogin = async ({
  dispatch,
  navigation,
  GoogleSignin,
  showToast,
  authToken,
}) => {
  if (googleLoginInFlight) {
    return;
  }

  googleLoginInFlight = true;
  try {
    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    if (!hasPlayServices) {
      showToast?.('Google Play Services is not available');
      return;
    }

    const userInfo = await signInWithGoogle(GoogleSignin);
    const googleUser = userInfo?.data?.user || userInfo?.user;

    if (!googleUser?.email || !googleUser?.id) {
      showToast?.('Google did not return a usable organizer account');
      return;
    }

    const tokens = await GoogleSignin.getTokens().catch(() => ({}));
    const payload = {
      provider: 'google2',
      sub: googleUser.id,
      email: googleUser.email,
      first_name: googleUser.givenName,
      last_name: googleUser.familyName,
      name: googleUser.name,
      profile_image: googleUser.photo,
      access_token: tokens?.idToken || tokens?.accessToken || googleUser.id,
    };

    const response = await organizerRegisterSocialAPI({
      data: payload,
      authToken,
    });

    if (response?.response?.access_token) {
      dispatch(
        setLoginToken({
          loginToken: response.response.access_token,
          isLogin: true,
        }),
      );
      return;
    }

    if (response?.status === false) {
      showToast?.(backendErrorMessage(response));
      return;
    }

    const socialUser = response?.response || payload;
    navigation.navigate('CreateAccount', {
      email_id: socialUser.email_id || socialUser.email || googleUser.email,
      userData: googleUser,
      IsGoogleLogin: true,
      social_id: socialUser.social_id || socialUser.sub || googleUser.id,
      social_access_token: payload.access_token,
      provider: 'google',
    });
  } catch (error) {
    showToast?.(googleErrorMessage(error));
  } finally {
    googleLoginInFlight = false;
  }
};
