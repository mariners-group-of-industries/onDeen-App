import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  StatusBar,
} from 'react-native';
import {Formik} from 'formik';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {sendOtp} from '../../redux/slices/sendOtpSlice';
import styles from './styles';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import Firstpagelogo from '../../assets/svg/firstpagelogo.svg';
import {useToast} from '../../context/ToastContext';
import * as Yup from 'yup';
import SocialLogin from '../../common/SocialLogin';

const DEBUG_OTP = '123456';
const DEBUG_OTP_ENABLED = __DEV__;

const SignupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const showToast = useToast();
  const routeParams = (route.params || {}) as {isFromForgotPassword?: boolean};
  const isFromForgotPassword = Boolean(routeParams.isFromForgotPassword);

  const validationSchema = Yup.object({
    country_code: Yup.string()
      .required('Country code is required')
      .matches(/^\+\d{1,4}$/, 'Invalid country code format'),
    mobile_number: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d+$/, 'Mobile number must only contain digits')
      .min(9, 'Mobile number must be at least 9 digits')
      .max(10, 'Mobile number cannot be longer than 10 digits'),
  });
  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  const handleSubmitForm = async (values: {
    country_code: string;
    mobile_number: string;
    cca2?: string;
  }) => {
    if (DEBUG_OTP_ENABLED && !isFromForgotPassword) {
      showToast?.(`Debug OTP is ${DEBUG_OTP}.`);
      navigation.navigate('Otp', {
        mobile_number: values.mobile_number,
        country_code: values.country_code,
        cca2: values.cca2,
        isFromForgotPassword,
      });
      return;
    }

    try {
      const response = await dispatch(
        sendOtp({
          country_code: values.country_code,
          mobile_number: values.mobile_number,
          showToast,
        }),
      ).unwrap();
      if (response.status) {
        if (response.response.is_register === true) {
          navigation.navigate('Otp', {
            mobile_number: values.mobile_number,
            country_code: values.country_code,
            cca2: values.cca2,
            isFromForgotPassword,
          });
        } else {
          navigation.navigate('Otp', {
            mobile_number: values.mobile_number,
            country_code: values.country_code,
            cca2: values.cca2,
            isFromForgotPassword,
          });
        }
      }
    } catch (error) {
      console.log(
        'Error',
        error.message || 'Failed to send OTP. Please try again.',
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <ScrollView style={{backgroundColor: '#ffff'}}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.container}>
          <View style={[styles.backgroundImage]}>
            <Firstpagelogo resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>Hello, Welcome to Ondeen</Text>
            <Text style={styles.loginText}>
              {isFromForgotPassword
                ? 'Reset with mobile OTP'
                : 'Continue with mobile OTP'}
            </Text>
          </View>
          <Formik
            initialValues={{country_code: '+44', mobile_number: ''}}
            validationSchema={validationSchema}
            onSubmit={handleSubmitForm}>
            {({handleSubmit}) => (
              <>
                <View style={styles.inputContainer}>
                  <InputFields
                    name="mobile_number"
                    placeholder="Enter phone number"
                    keyboardType="numeric"
                    title="Enter your mobile no."
                    isPhoneNumber={true}
                    inputStyle={styles.phoneInput}
                  />
                </View>
                <Text style={styles.secureText}>
                  Securing personal information is our priority
                </Text>
                <GradientButton
                  onPress={() => {
                    handleSubmit();
                  }}
                  title={
                    isFromForgotPassword
                      ? 'Reset with Mobile OTP'
                      : 'Continue with Mobile OTP'
                  }
                  containerStyle={styles.customButtonContainer}
                  textStyle={styles.customButtonText}
                />
              </>
            )}
          </Formik>
          {isFromForgotPassword && (
            <View style={styles.otpLinkContainer}>
              <Text style={styles.otpLinkText}>Prefer email?</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SignupEmailScreen', {
                    isFromForgotPassword: true,
                  })
                }>
                <Text style={styles.otpLinkAction}>Reset with Email OTP</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {!isFromForgotPassword && <SocialLogin />}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
