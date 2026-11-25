import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch, useSelector} from 'react-redux';
import CustomeInput from '../../components/CustomeInput';
import GradientButton from '../../components/gradientButton';
import SocialButton from '../../components/socialButton';
import {fontFamilies} from '../../assets/themes/fonts';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {useToast} from '../../context/ToastContext';
import {organizerEmailSendOtpAPI} from '../../services/authService';
import {handleGoogleLogin} from './checkGoogleLogin';
import {GOOGLESIGNINWEBCLIENTID} from '../../helpers/Constant';

const SignupEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const showToast = useToast();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const [isLoading, setIsLoading] = useState(false);
  const isFromForgotPassword = Boolean(route.params?.isFromForgotPassword);

  const formik = useFormik({
    initialValues: {email_id: ''},
    validationSchema: Yup.object({
      email_id: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async values => {
      try {
        setIsLoading(true);
        const response = await organizerEmailSendOtpAPI({
          email_id: values.email_id.trim(),
          authToken,
        });

        if (response?.status) {
          showToast?.(response?.response?.message || 'OTP sent successfully');
          navigation.navigate('VerifyEmailOTP', {
            email_id: values.email_id.trim(),
            isFromForgotPassword,
          });
          return;
        }

        showToast?.(response?.response?.message || 'Failed to send OTP');
      } catch (error) {
        showToast?.('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

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
    <>
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}>
        <View style={styles.loaderBackground}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <View style={styles.container}>
            <Image
              source={require('../../assets/images/splash_bg.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            <View style={styles.textContainer}>
              <Text style={styles.greetingText}>Welcome to Ondeen!</Text>
              <Text style={styles.loginText}>
                {isFromForgotPassword
                  ? 'Reset with email OTP'
                  : 'Continue with email OTP'}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <CustomeInput
                formik={formik}
                name="email_id"
                label="Email"
                placeholder="Enter Email"
                type="email-address"
              />
            </View>

            <Text style={styles.secureText}>
              Keeping your organizer account safe is our top priority.
            </Text>

            <GradientButton
              onPress={formik.handleSubmit}
              title={
                isLoading
                  ? 'Sending...'
                  : isFromForgotPassword
                    ? 'Reset with Email OTP'
                    : 'Continue with Email OTP'
              }
              containerStyle={styles.customButtonContainer}
              textStyle={styles.customButtonText}
            />

            <View style={styles.passwordRow}>
              <Text style={styles.passwordText}>
                {isFromForgotPassword ? 'Remember password?' : 'Have a password?'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.passwordLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialbuttonMainContainer}>
              <SocialButton
                onPress={() =>
                  navigation.navigate('signinwithMobile', {
                    isFromForgotPassword,
                  })
                }
                title={
                  isFromForgotPassword
                    ? 'Reset with Mobile OTP'
                    : 'Continue with Mobile OTP'
                }
                iconName="phone"
                iconSize={22}
                containerStyle={styles.socialButtonContainer}
                textStyle={styles.socialButtonLabel}
              />
              {!isFromForgotPassword && GOOGLESIGNINWEBCLIENTID && (
                <SocialButton
                  onPress={handleGooglePress}
                  title="Continue with Google"
                  iconName="google"
                  iconSize={22}
                  containerStyle={styles.socialButtonContainerApple}
                  textStyle={styles.socialButtonLabel}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: heightScale(240),
    position: 'absolute',
    top: 0,
  },
  textContainer: {
    marginTop: heightScale(210),
    alignItems: 'center',
    width: widthScale(270),
  },
  greetingText: {
    fontSize: fontScale(16),
    color: '#676767',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  loginText: {
    fontSize: fontScale(28),
    color: '#191719',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    textAlign: 'center',
    lineHeight: heightScale(34),
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: widthScale(24),
    marginTop: heightScale(26),
  },
  secureText: {
    width: '100%',
    paddingHorizontal: widthScale(24),
    paddingRight: widthScale(86),
    fontSize: fontScale(12),
    color: '#A1A1A1',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  customButtonContainer: {
    height: heightScale(56),
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(24),
  },
  customButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: heightScale(2),
  },
  passwordText: {
    color: '#676767',
    fontSize: fontScale(13),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  passwordLink: {
    color: '#DB3171',
    fontSize: fontScale(13),
    marginLeft: widthScale(6),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(42),
  },
  separatorLine: {
    flex: 1,
    backgroundColor: '#989898',
    height: 1,
  },
  separatorText: {
    fontSize: fontScale(14),
    color: '#989898',
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: widthScale(6),
  },
  socialbuttonMainContainer: {
    width: '100%',
    marginBottom: heightScale(34),
  },
  socialButtonContainer: {
    marginTop: heightScale(16),
    marginHorizontal: widthScale(24),
  },
  socialButtonContainerApple: {
    marginTop: heightScale(8),
    marginHorizontal: widthScale(24),
  },
  socialButtonLabel: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  loaderBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default SignupEmailScreen;
