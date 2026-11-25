import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Keyboard, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { OtpInput } from 'react-native-otp-entry';
import GradientButton from '../../components/gradientButton';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../../redux/slices/verifyOtpSlice';
import styles from './styles';
import Toast from '../../components/toastMessage';
import { setIsSkippedLoginAllow, setLoginState, setLoginToken } from '../../redux/slices/loginSlice';
import { fontFamilies } from '../../assets/fonts/fonts';
import { fontScale } from '../../helpers/scale';
import Lock from '../../assets/svg/lock.svg';
import LatestHeader from '../../components/LatestHeader';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOtpAPI } from '../../redux/callapis/CommonService';
import { setAccessToken } from '../../redux/slices/verifyOtpSlice';
import { DEBUG_OTP, DEBUG_USER_TOKEN, isDebugApiMocksEnabled } from '../../helpers/debugApiMocks';

const VerifyOTP = () => {
  const route = useRoute();
  const {
    mobile_number,
    country_code,
    country,
    isFromForgotPassword,
    cca2,
    IsGoogleLogin,
    confirmation,
    userdata
  } = route.params || {};

  const otpInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const { status, message } = useSelector((state) => state.verifyOtp);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [confirmResult, setConfirmResult] = useState(confirmation || null);
  const [isLoading, setIsLoading] = useState(false);

  useStatusBar({ backgroundColor: '#FDFBFF', barStyle: 'dark-content' });
  const showToast = useToastForPopup();

  const sendFirebaseOtp = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setOtp('');
    otpInputRef.current?.clear();

    try {
      const cleanNumber = mobile_number.replace(/^0+/, '');
      const data = {
        country_code: country_code,
        mobile_number: cleanNumber
      }
      const response = await sendOtpAPI({ data })
     
      if (!response.status) {
        throw new Error(response.response?.message || 'Failed to send OTP');
      }
      setConfirmResult({});
      showToast('OTP sent successfully');
      setIsResendDisabled(true);
      setCooldownTime(60);

    } catch (error) {
      showToast(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    if (value.length === 6) {
      Keyboard.dismiss();
    }
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return; 
    setIsResendDisabled(true);
    setCooldownTime(60); 
    await sendFirebaseOtp();
  };

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prevTime => {
          if (prevTime <= 1) {
            setIsResendDisabled(false);
            clearInterval(timer);
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  useEffect(() => {
    setConfirmResult(confirmation);
  }, []);

  const handleSubmit = async () => {
    console.log('API 111');

    setIsLoading(true);
    try {
      if (isDebugApiMocksEnabled() && otp === DEBUG_OTP) {
        if (isFromForgotPassword) {
          showToast('Debug OTP verified successfully');
          Keyboard.dismiss();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{
                name: 'CreatePasswordScreen',
                params: {
                  country_code,
                  mobile_number,
                  otp,
                  country,
                  isFromForgotPassword,
                },
              }],
            })
          );
          return;
        }

        showToast('Debug OTP verified successfully');
        dispatch(setIsSkippedLoginAllow(false));
        dispatch(setLoginState(true));
        dispatch(setAccessToken({ access_token: DEBUG_USER_TOKEN }));
        Keyboard.dismiss();
        return;
      }

      const data = {
        'mobile_number': mobile_number,
        'otp': otp, 
        'country_code': country_code,
      }
      console.log(data, 'data');

      const response = await dispatch(verifyOtp({ data }));
      console.log(JSON.stringify(response), 'responseresponse');
      console.log(JSON.stringify(response?.payload), 'response?.payload');

      if (response?.payload?.status) {
        if (response?.payload?.response?.is_register) {
          if (isFromForgotPassword) {
            showToast(response?.payload?.response?.message || 'OTP verified successfully');
            Keyboard.dismiss();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{
                  name: 'CreatePasswordScreen',
                  params: {
                    country_code,
                    mobile_number,
                    otp,
                    country,
                    isFromForgotPassword,
                    resetToken: response?.payload?.response?.access_token,
                  },
                }],
              })
            );
          } else {
            showToast(response?.payload?.response?.message || 'OTP verified successfully!');
            dispatch(setIsSkippedLoginAllow(false));
            dispatch(setLoginState(true));
            const datawithtoken = {
              access_token: response?.payload?.response?.access_token
            }
            dispatch(setAccessToken(datawithtoken));
            dispatch(setLoginToken(datawithtoken));
            Keyboard.dismiss();
          }
        } else {
          showToast(response?.payload?.response?.message || 'Please complete your registration.');
          Keyboard.dismiss();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{
                name: 'Registration',
                params: {
                  country_code,
                  mobile_number,
                  otp,
                  country,
                  cca2,
                  isVerified: true,
                  userdata: userdata,
                  IsGoogleLogin: IsGoogleLogin
                },
              }],
            })
          );
        }
      }
      else {
        showToast(response?.payload?.response?.message || 'Something went wrong.');
      }
    } catch (error) {
      showToast(error.message || JSON.stringify(error) || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ backgroundColor: '#FDFBFF', flex: 1 }}>
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
          </View>
        </View>
      </Modal>
      <LatestHeader
        statusBarColor="#FDFBFF"
        title="Back"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        containerStyle={{ paddingTop: 24 }}
      />
      <View style={[styles.container]}>
        <View style={styles.logoContainer}>
          <Lock />
          <Text style={styles.greetingText}>Verify OTP</Text>
          <Text style={styles.instructionsText}>
            OTP has been sent to {country_code} {mobile_number}
          </Text>
          <Text
            onPress={() => navigation.goBack()}
            style={{
              textDecorationLine: 'underline',
              color: '#DB3171',
              fontSize: 16,
              fontFamily: fontFamilies.SFProRoundedBlackRegular,
            }}>
            Change
          </Text>
        </View>

        <Text style={styles.otpText}>Enter One time password (OTP)</Text>
        <View style={styles.otpContainer}>
          <View style={styles.containerOtp}>
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={6}
              focusColor="#DB3171"
              onTextChange={handleOtpChange}
              focusStickBlinkingDuration={500}
              theme={{
                pinCodeContainerStyle: styles.otpBox,
                pinCodeTextStyle: styles.otpInput,
              }}
            />
          </View>
        </View>
        <View style={styles.otptextContainer}>
          <Text style={styles.didnotText}>Didn’t receive the OTP?</Text>
          <Text
            onPress={handleResendOtp}
            style={[styles.resendText, { opacity: isResendDisabled ? 0.5 : 1 }]}
            disabled={isResendDisabled}>
            {isResendDisabled ? `Resend in ${cooldownTime}s` : 'Resend OTP'}
          </Text>
        </View>
        <GradientButton
          onPress={handleSubmit}
          title={status === 'loading' ? 'Verifying OTP...' : 'Verify'}
          containerStyle={styles.customButtonContainer}
          textStyle={styles.customButtonText}
        />
        <Toast message={toastMessage} />
      </View>
    </ContainerComponent>
  );
};

const loaderStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    margin: 0,
  },
  activityIndicatorWrapper: {
    marginTop: 10,
    color: '#fff',
    fontSize: fontScale(16),
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

export default VerifyOTP;
