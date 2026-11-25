import React from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Formik} from 'formik';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import * as Yup from 'yup';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import SocialButton from '../../components/socialButton';
import {sendOtp} from '../../redux/slices/sendOtpSlice';
import {fontFamilies} from '../../assets/themes/fonts';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {useToast} from '../../context/ToastContext';

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

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const showToast = useToast();

  const handleSubmitForm = async values => {
    try {
      const countryCode = values.country_code || '+44';
      const cleanNumber = values.mobile_number.replace(/^0+/, '');

      const response = await dispatch(
        sendOtp({
          country_code: countryCode,
          mobile_number: cleanNumber,
          showToast,
        }),
      ).unwrap();

      if (!response?.status) {
        showToast?.(response?.response?.message || 'Failed to send OTP');
        return;
      }

      navigation.navigate('Otp', {
        mobile_number: cleanNumber,
        country_code: countryCode,
        cca2: values.cca2 || 'GB',
        isFromForgotPassword: true,
      });
    } catch (error) {
      showToast?.(error?.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.container}>
          <Image
            source={require('../../assets/images/splash_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>Forgot password?</Text>
            <Text style={styles.loginText}>Reset with mobile OTP</Text>
          </View>

          <Formik
            initialValues={{country_code: '+44', mobile_number: ''}}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={false}
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
                  Securing organizer account access is our priority.
                </Text>

                <GradientButton
                  onPress={handleSubmit}
                  title="Reset with Mobile OTP"
                  containerStyle={styles.customButtonContainer}
                  textStyle={styles.customButtonText}
                />
              </>
            )}
          </Formik>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialbuttonMainContainer}>
            <SocialButton
              onPress={() =>
                navigation.navigate('SignupEmailScreen', {
                  isFromForgotPassword: true,
                })
              }
              title="Reset with Email OTP"
              iconName="email"
              iconSize={22}
              containerStyle={styles.socialButtonContainer}
              textStyle={styles.socialButtonLabel}
            />
          </View>

          <View style={styles.passwordRow}>
            <Text style={styles.passwordText}>Remember password?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.passwordLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
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
    width: widthScale(290),
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
  inputContainer: {
    width: '90%',
    marginTop: heightScale(28),
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(24),
    color: '#131313',
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
    marginBottom: heightScale(16),
  },
  socialButtonContainer: {
    marginTop: heightScale(16),
    marginHorizontal: widthScale(24),
  },
  socialButtonLabel: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: heightScale(34),
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
});

export default ForgotPasswordScreen;
