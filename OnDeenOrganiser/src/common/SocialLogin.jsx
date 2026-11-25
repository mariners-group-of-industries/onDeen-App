import React from 'react';
import {
    View,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    StyleSheet,
    Text,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SocialButton from '../components/socialButton';
import { widthScale, heightScale, fontScale } from '../helpers/scale';
import { useToast } from '../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { handleGoogleLogin } from '../screens/signupEmailScreen/checkGoogleLogin';
import { GOOGLESIGNINWEBCLIENTID } from '../helpers/Constant';

const SocialLogin = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const showToast = useToast();
    const dispatch = useDispatch();
    const authToken = useSelector(state => state.token?.token?.access_token);

    const handlePressOutside = () => {
        Keyboard.dismiss();
    };

    const isSigninWithMobile = route.name === 'signinwithMobile';
    const isSignupEmail = route.name === 'SignupEmailScreen';
    const isSignup = route.name === 'Signup';
    const isAndroid = Platform.OS === 'android';
    const googleConfigured = Boolean(GOOGLESIGNINWEBCLIENTID);
    const handleGooglePress = () => {
        handleGoogleLogin({
            dispatch,
            navigation,
            GoogleSignin,
            showToast,
            authToken,
        });
    };

    return (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
            <ScrollView style={{ backgroundColor: '#ffff' }} showsVerticalScrollIndicator={false}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <View style={styles.formikContainer}>
                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>
                    <View style={styles.socialbuttonMainContainer}>
                        {!isSignupEmail && (
                            <SocialButton
                                onPress={() => navigation.navigate('SignupEmailScreen')}
                                title="Continue with Email OTP"
                                iconName={'email'}
                                iconSize={22}
                                containerStyle={styles.socialButtonContainer}
                                textStyle={styles.socialButtonText}
                            />
                        )}
                        {!isSignup && !isSigninWithMobile && (
                            <SocialButton
                                onPress={() => navigation.navigate('signinwithMobile')}
                                title="Continue with Mobile OTP"
                                iconName={'phone'}
                                iconSize={22}
                                containerStyle={styles.socialButtonContainer}
                                textStyle={styles.socialButtonText}
                            />
                        )}
                        {!isAndroid && (
                            <SocialButton
                                onPress={() => {}}
                                title="Continue with Apple"
                                iconName={'apple'}
                                iconColor="#000"
                                iconSize={22}
                                containerStyle={styles.socialButtonContainerApple}
                                textStyle={styles.socialButtonText}
                            />
                        )}
                        {googleConfigured && (
                            <SocialButton
                                onPress={handleGooglePress}
                                title="Continue with Google"
                                iconName={'google'}
                                iconColor="#000"
                                iconSize={22}
                                containerStyle={styles.socialButtonContainerFb}
                                textStyle={styles.socialButtonText}
                            />
                        )}
                        {isSignup && (
                            <SocialButton
                                onPress={() => navigation.navigate('Login')}
                                title="Sign in with email and password"
                                iconName={'email'}
                                iconSize={22}
                                containerStyle={styles.socialButtonContainer}
                                textStyle={styles.socialButtonText}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default SocialLogin;

const styles = StyleSheet.create({
    formikContainer: {
        // marginTop: heightScale(32),
    },
    socialbuttonMainContainer: {
        marginHorizontal: widthScale(24),
        marginBottom: heightScale(30),
    },
    socialButtonContainer: {
        marginTop: heightScale(16),
    },
    socialButtonContainerFb: {
        marginTop: heightScale(8),
    },
    socialButtonContainerApple: {
        marginTop: heightScale(8),
    },
    socialButtonText: {},
    separatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: heightScale(24),
        paddingHorizontal: widthScale(42),
    },
    separatorLine: {
        width: '50%',
        backgroundColor: '#989898',
        height: 1,
    },
    separatorText: {
        fontSize: fontScale(14),
        color: '#989898',
        fontWeight: '500',
        textAlign: 'center',
        marginHorizontal: 6,
    },
});
