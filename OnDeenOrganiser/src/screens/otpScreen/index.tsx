import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import OTPVerify from 'react-native-otp-verify';
import GradientButton from '../../components/gradientButton';
import {useDispatch} from 'react-redux';
import {verifyOtp} from '../../redux/slices/verifyOtpSlice';
import styles from './styles';
import Secondpagelogo from '../../assets/svg/secondpagelogo.svg';
import {sendOtp} from '../../redux/slices/sendOtpSlice';
import {setLoginToken} from '../../redux/slices/loginSlice';
import {useToast} from '../../context/ToastContext';
import {ROLE_TYPES, roleLabel} from '../../helpers/roleRoutes';

const DEBUG_OTP = '123456';
const DEBUG_OTP_ENABLED = __DEV__;

const OTPScreen = () => {
  const route = useRoute();
  const {mobile_number, country_code, cca2, isFromForgotPassword, roleType = ROLE_TYPES.ORGANISER} =
    (route.params || {}) as {
      mobile_number?: string;
      country_code?: string;
      cca2?: string;
      isFromForgotPassword?: boolean;
      roleType?: number;
    };
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const otpLength = DEBUG_OTP_ENABLED ? DEBUG_OTP.length : 6;
  const [otp, setOtp] = useState<string[]>(() => Array(otpLength).fill(''));
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const showToast = useToast();

  const otpHandler = useCallback((message: string) => {
    const detectedOtp = message.match(/\d{4,6}/);
    if (detectedOtp) {
      const otpArray = detectedOtp[0].slice(0, otpLength).split('');
      setOtp(otpArray);
      otpArray.forEach((digit, index) => {
        otpInputs.current[index]?.focus();
      });
      OTPVerify.removeListener();
      Keyboard.dismiss();
    }
  }, [otpLength]);

  useEffect(() => {
    OTPVerify.getHash().then(console.log).catch(console.error);
    OTPVerify.getOtp()
      .then(() => OTPVerify.addListener(otpHandler))
      .catch(console.error);

    return () => {
      OTPVerify.removeListener();
    };
  }, [otpHandler]);

  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = otp.map((digit, idx) => (idx === index ? value : digit));
      setOtp(newOtp);

      // Auto-focus next or previous input
      if (value !== '' && index < otp.length - 1) {
        otpInputs.current[index + 1]?.focus();
      } else if (value === '' && index > 0) {
        otpInputs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join('');
    // Keep the local organiser shortcut for development, but role-specific
    // Speaker/Buddy sessions must always verify against the backend so their
    // protected APIs receive a real User_session token.
    if (DEBUG_OTP_ENABLED && roleType === ROLE_TYPES.ORGANISER && !isFromForgotPassword && otpValue === DEBUG_OTP) {
      showToast?.('Debug OTP accepted.');
      dispatch(
        setLoginToken({
          loginToken: 'debug-token',
          isLogin: true,
          roleType,
        }),
      );
      return;
    }

    if (otpValue.length === otpLength) {
      const resultAction = await dispatch(
        verifyOtp({
          mobile_number,
          // Railway stores OTPs as varchar; preserving the six-digit string
          // avoids PostgreSQL's varchar = integer failure on role logins.
          otp: otpValue,
          country_code,
          roleType,
          showToast,
        }),
      );
      if (resultAction?.payload) {
        if (resultAction?.payload?.response?.is_register) {
          if (isFromForgotPassword) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'CreatePasswordScreen',
                    params: {
                      resetToken: resultAction?.payload?.response?.access_token,
                    },
                  },
                ],
              }),
            );
            return;
          }

          const response = resultAction.payload.response;
          if (roleType === ROLE_TYPES.ORGANISER && (Number(response.user_status) !== 1 || response.application_status !== 'APPROVED')) {
            navigation.navigate('ApplicationStatus', {
              access_token: response.access_token,
              application_status: response.application_status || 'UNDER_REVIEW',
              review_note: response.review_note,
            });
          } else {
            dispatch(
              setLoginToken({
                loginToken: response.access_token,
                isLogin: response.is_register,
                roleType,
              }),
            );
          }
        } else if (resultAction?.payload?.response?.is_register === false) {
          if (isFromForgotPassword) {
            showToast?.('No organizer account found for this mobile number.');
            return;
          }

          if (roleType !== ROLE_TYPES.ORGANISER) {
            showToast?.(`${roleLabel(roleType)} access requires an active invitation.`);
          } else {
            navigation.navigate('CreateAccount', {
              mobile_number: mobile_number,
              country_code: country_code,
              cca2: cca2,
              latitude: '',
              longitude: '',
              address: '',
            });
          }
        }
      }
    } else {
      setErrorMessage(`Please enter a valid ${otpLength}-digit OTP.`);
      setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const resendotp = async () => {
    try {
      const response = await dispatch(
        sendOtp({
          country_code: country_code,
          mobile_number: mobile_number,
          roleType,
          showToast,
        }),
      ).unwrap();

      if (response.status) {
        showToast?.('OTP sent successfully.');
      }
    } catch {
      showToast?.('Failed to resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={[styles.backgroundImage]}>
          <Secondpagelogo resizeMode="contain" />
        </View>
        <Text style={styles.greetingText}>Verify {roleLabel(roleType)} phone</Text>
        <Text style={styles.instructionsText}>
          OTP has been sent to {country_code} {mobile_number}
        </Text>
        <Text
          onPress={() => navigation.goBack()}
          style={styles?.changetext}>
          Change
        </Text>
      </View>

      <Text style={styles.otpText}>Enter One time password (OTP)</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <View key={index} style={styles.otpBox}>
            <TextInput
              ref={ref => (otpInputs.current[index] = ref)}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              style={styles.otpInput}
              onKeyPress={({nativeEvent}) => {
                if (nativeEvent.key === 'Backspace' && otp[index] === '') {
                  if (index > 0) {
                    otpInputs.current[index - 1]?.focus();
                  }
                }
              }}
            />
          </View>
        ))}
      </View>

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <GradientButton
        onPress={handleSubmit}
        title="Verify"
        containerStyle={styles.customButtonContainer}
        textStyle={styles.customButtonText}
      />

      <View style={styles.otptextContainer}>
        <Text style={styles.didnotText}>Didn’t receive the OTP?</Text>
        <TouchableOpacity onPress={resendotp}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OTPScreen;
