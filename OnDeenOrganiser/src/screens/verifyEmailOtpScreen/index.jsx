import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import CustomHeader from '../../components/customHeader';
import GradientButton from '../../components/gradientButton';
import OTPInput from '../../components/otpInput';
import {fontFamilies} from '../../assets/themes/fonts';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {useToast} from '../../context/ToastContext';
import {setLoginToken} from '../../redux/slices/loginSlice';
import {
  organizerEmailSendOtpAPI,
  organizerEmailVerifyOtpAPI,
} from '../../services/authService';

const VerifyEmailOTP = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const showToast = useToast();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const {email_id, isFromForgotPassword} = route.params || {};
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);

  useEffect(() => {
    if (cooldownTime <= 0) {
      setIsResendDisabled(false);
      return;
    }

    if (!isResendDisabled) {
      return;
    }

    const timer = setInterval(() => {
      setCooldownTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime, isResendDisabled]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (otp.length !== 6) {
      showToast?.('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await organizerEmailVerifyOtpAPI({
        email_id,
        otp,
        authToken,
      });

      if (response?.status && response?.response?.is_register) {
        if (isFromForgotPassword) {
          showToast?.(response.response.message || 'OTP verified successfully.');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'CreatePasswordScreen',
                  params: {
                    resetToken: response.response.access_token,
                  },
                },
              ],
            }),
          );
          return;
        }

        dispatch(
          setLoginToken({
            loginToken: response.response.access_token,
            isLogin: true,
          }),
        );
        return;
      }

      if (response?.status && response?.response?.is_register === false) {
        if (isFromForgotPassword) {
          showToast?.('No organizer account found for this email.');
          return;
        }

        showToast?.('Please complete your organizer registration.');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'CreateAccount',
                params: {
                  email_id,
                  isVerified: true,
                },
              },
            ],
          }),
        );
        return;
      }

      showToast?.(response?.response?.message || 'Failed to verify OTP.');
    } catch (error) {
      showToast?.('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await organizerEmailSendOtpAPI({email_id, authToken});
      if (response?.status) {
        showToast?.(response?.response?.message || 'OTP sent successfully');
        setOtp('');
        setIsResendDisabled(true);
        setCooldownTime(60);
        return;
      }
      showToast?.(response?.response?.message || 'Failed to resend OTP.');
    } catch (error) {
      showToast?.('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}>
        <View style={styles.loaderBackground}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
      <CustomHeader
        title="Back"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={styles.headerTitle}
      />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/lock.png')}
            style={styles.lockIcon}
            resizeMode="contain"
          />
          <Text style={styles.greetingText}>Verify OTP</Text>
          <Text style={styles.instructionsText}>
            OTP has been sent to {email_id}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.otpText}>Enter One time password (OTP)</Text>
        <OTPInput value={otp} onChange={setOtp} />

        <View style={styles.otptextContainer}>
          <Text style={styles.didnotText}>Didn’t receive the OTP?</Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={isResendDisabled}>
            <Text
              style={[
                styles.resendText,
                {opacity: isResendDisabled ? 0.5 : 1},
              ]}>
              {isResendDisabled ? `Resend in ${cooldownTime}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          onPress={handleSubmit}
          title="Verify"
          containerStyle={styles.customButtonContainer}
          textStyle={styles.customButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FDFBFF',
    paddingHorizontal: widthScale(24),
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
  },
  logoContainer: {
    marginTop: heightScale(30),
    alignItems: 'center',
  },
  lockIcon: {
    width: widthScale(84),
    height: heightScale(84),
    marginBottom: heightScale(20),
  },
  greetingText: {
    fontSize: fontScale(28),
    color: '#191719',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  instructionsText: {
    color: '#676767',
    fontSize: fontScale(14),
    textAlign: 'center',
    marginTop: heightScale(8),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  changeText: {
    marginTop: heightScale(12),
    color: '#DB3171',
    fontSize: fontScale(16),
    textDecorationLine: 'underline',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  otpText: {
    width: '100%',
    marginTop: heightScale(32),
    marginBottom: heightScale(14),
    color: '#161616',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  otptextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(20),
  },
  didnotText: {
    color: '#676767',
    fontSize: fontScale(13),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  resendText: {
    marginLeft: widthScale(6),
    color: '#DB3171',
    fontSize: fontScale(13),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  customButtonContainer: {
    height: heightScale(56),
    marginTop: heightScale(28),
  },
  customButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  loaderBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default VerifyEmailOTP;
