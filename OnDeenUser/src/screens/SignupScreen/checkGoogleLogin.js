import AsyncStorage from "@react-native-async-storage/async-storage";
import { createRegisterSocial } from "../../redux/callapis/CommonService";
import { setIsSkippedLoginAllow, setLoginState, setLoginToken } from "../../redux/slices/loginSlice";
import { setAccessToken } from "../../redux/slices/verifyOtpSlice";
import { GOOGLESIGNINWEBCLIENTID } from "../../helpers/Constant";

let googleLoginInFlight = false;

const isDeveloperConfigurationError = (error) => {
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
    ? { webClientId: GOOGLESIGNINWEBCLIENTID, offlineAccess: false }
    : null;

const signInWithGoogle = async (GoogleSignin) => {
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

export const handleGoogleLogin = async (dispatch, navigation, GoogleSignin, showToast) => {
    if (googleLoginInFlight) {
        return;
    }

    googleLoginInFlight = true;
    try {
        // Check for Play Services
        const hasPlayService = await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
        });
        if (!hasPlayService) {
            showToast('Google Play Services not available');
            return;
        }

        // Sign in with Google
        const userInfo = await signInWithGoogle(GoogleSignin);
        const googleUser = userInfo?.data?.user || userInfo?.user;
        const userEmail = googleUser?.email;
        if (!userEmail) {
            showToast('No email found from Google account');
            return;
        }

        // Get tokens
        const tokens = await GoogleSignin.getTokens().catch(() => ({}));
        const accessToken = tokens?.idToken || tokens?.accessToken || googleUser?.id;

        if (!accessToken) {
            showToast('Failed to get authentication token from Google');
            return;
        }

        // Prepare data for backend
        const data = {
            provider: "google2",
            sub: googleUser?.id,
            email: googleUser?.email,
            first_name: googleUser?.givenName,
            last_name: googleUser?.familyName,
            name: googleUser?.name,
            profile_image: googleUser?.photo,
            access_token: accessToken,
        };

        try {
            // Attempt to login/register with backend
            const response = await createRegisterSocial({ data });

            if (response?.response?.access_token) {
                // Successful login
                await AsyncStorage.setItem('first_time_login', 'true');
                const tokenData = {
                    access_token: response.response.access_token
                };

                dispatch(setAccessToken(tokenData));
                dispatch(setLoginToken(tokenData));
                dispatch(setLoginState(true));
                dispatch(setIsSkippedLoginAllow(false));
            } else if (response?.status === false || response?.error) {
                // Handle specific backend errors
                const errorMessage = response?.response?.message || response?.error?.message || 'Account exists but login failed';
                showToast(errorMessage);

                // Optionally, you could navigate to a retry screen or stay on current screen
            } else {
                // This should only happen for new registrations
                navigation.navigate('Registration', {
                    userData: googleUser,
                    IsGoogleLogin: true,
                    isVerified: false,
                    socialAccessToken: accessToken,
                    socialId: googleUser?.id,
                    socialProvider: 'google',
                });
            }
        } catch (apiError) {
            console.error('Backend API error:', apiError);

            if (apiError.response) {
                // Handle HTTP errors (4xx, 5xx)
                const status = apiError.response.status;

                if (status == 401) {
                    showToast('Authentication failed - please try again');
                } else if (status == 409) {
                    showToast('Account already exists but login failed');
                } else {
                    showToast('Server error - please try again later');
                }
            } else if (apiError.request) {
                // Network errors
                showToast('Network error - please check your connection');
            } else {
                // Other errors
                showToast('Login failed - please try again');
            }
        }

    } catch (e) {
        console.error('Google Sign-In error:', e);

        if (e.code == 'SIGN_IN_CANCELLED') {
            showToast('Sign in was cancelled');
        } else if (e.code == 'IN_PROGRESS') {
            showToast('Sign in already in progress');
        } else if (e.code == 'PLAY_SERVICES_NOT_AVAILABLE') {
            showToast('Google Play Services not available');
        } else if (e?.code === 'NOT_CONFIGURED') {
            showToast('Google sign-in is not available on this build');
        } else {
            showToast('Google sign-in could not start. Please use another option.');
        }
    } finally {
        googleLoginInFlight = false;
    }
};
