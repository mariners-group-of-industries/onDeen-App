import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard, ScrollView, StatusBar, Platform, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../redux/slices/sendOtpSlice';
import styles from './styles';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import SocialButton from '../../components/socialButton';
import { signupValidationSchema } from '../../helpers/otpValidations';
import Toast from '../../components/toastMessage';
import { setIsSkippedLogin, setIsSkippedLoginAllow, setLoginState } from '../../redux/slices/loginSlice';
import Loader from '../../components/loader';
import { fontFamilies } from '../../assets/fonts/fonts';
import { useToastForPopup } from '../../context/ToastContext';
import { DEBUG_OTP, isDebugApiMocksEnabled } from '../../helpers/debugApiMocks';
import { handleAppleLogin } from './checkAppleLogin';

const SignupMobileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSelector((state) => state.verifyOtp);

  const showToast = useToastForPopup();

  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  const handleSubmitForm = async (values) => {
    setIsLoading(true);
    try {
      const countryCode = values?.country_code || '+44';
      const cca2 = values?.cca2 || 'GB';
      const country = values?.country || 'United Kingdom';
      const cleanNumber = values?.mobile_number.replace(/^0+/, '');

      if (isDebugApiMocksEnabled()) {
        showToast(`Debug OTP is ${DEBUG_OTP}`);
        navigation.navigate('Otp', {
          mobile_number: cleanNumber,
          country_code: countryCode,
          country,
          cca2: cca2,
          confirmation: {},
        });
        return;
      }

      const response = await dispatch(
        sendOtp({
          country_code: countryCode,
          mobile_number: cleanNumber,
        })
      ).unwrap();

      if (response.status) {
        navigation.navigate('Otp', {
          mobile_number: cleanNumber,
          country_code: countryCode,
          country,
          cca2: cca2,
          confirmation: {},
        });
      } else {
        showToast(response.response.message || 'Failed to send OTP');
      }
    } catch (error) {

      showToast(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}>
        <View style={loaderStyles.modalBackground}>
          <View style={loaderStyles.activityIndicatorWrapper}>
            <ActivityIndicator
              animating={isLoading}
              size="large"
              color="#fff"
            />
            <Text style={loaderStyles.loadingText}>Sending OTP...</Text>
          </View>
        </View>
      </Modal>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <TouchableWithoutFeedback accessible={false} onPress={handlePressOutside}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <Toast message={toastMessage} />
            <Image
              source={require('../../assets/images/splash_bg.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            <View style={styles.textContainer}>
              <Text style={styles.greetingText}>Welcome to Ondeen!</Text>
              <Text style={styles.loginText}>Log in or sign up to get started.</Text>
            </View>

            <Formik
              initialValues={{ country_code: '+44', mobile_number: '' }}
              validationSchema={signupValidationSchema}
              onSubmit={handleSubmitForm}>
              {({ handleSubmit, isValid }) => (
                <>
                  <View style={styles.inputContainer}>
                    <InputFields
                      name="mobile_number"
                      placeholder="Enter your phone number"
                      keyboardType="numeric"
                      title="Mobile number"
                      isPhoneNumber={true}
                      inputStyle={styles.phoneInput}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      dispatch(setIsSkippedLogin(true));
                      dispatch(setIsSkippedLoginAllow(false));
                      dispatch(setLoginState(true));
                      navigation.navigate('MainNavigator');
                    }}
                    style={[styles.skipContainer, { top: insets.top + 20 }]}
                    activeOpacity={0.7}>
                    <Text style={styles.title}>Skip & continue</Text>
                    <Icon name={'chevron-right'} size={24} color="#FFFFFF" style={styles.iconButton} />
                  </TouchableOpacity>

                  <Text style={styles.secureText}>
                    Keeping your personal information safe is our top priority.
                  </Text>

                  <GradientButton
                    onPress={handleSubmit}
                    title="Continue"
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    containerStyle={styles.customButtonContainer}
                    textStyle={styles.customButtonText}
                  />

                  <View style={styles.separatorContainer}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>OR</Text>
                    <View style={styles.separatorLine} />
                  </View>

                  <View style={styles.socialbuttonMainContainer}>
                    <SocialButton
                      onPress={() => navigation.navigate('SignupEmailScreen')}
                      title="Continue with Email"
                      iconName={'email'}
                      iconSize={22}
                      containerStyle={styles.socialButtonContainer}
                      textStyle={styles.socialButtonLabel}
                    />
                    {Platform.OS === 'ios' ? (
                      <SocialButton
                        onPress={() => handleAppleLogin({ dispatch, navigation, showToast })}
                        title="Continue with Apple"
                        iconName={'apple'}
                        iconSize={22}
                        containerStyle={styles.socialButtonContainerApple}
                        textStyle={styles.socialButtonLabel}
                      />
                    ) : null}
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => navigation.navigate('Login')}
                      style={styles.passwordLoginLink}>
                      <Text style={styles.passwordLoginText}>Sign in with email and password</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Formik>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </>
  );
};

const loaderStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    padding: 50,
    borderRadius: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default SignupMobileScreen;
