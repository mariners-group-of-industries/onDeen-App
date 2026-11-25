import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../redux/slices/sendOtpSlice';
import styles from './styles';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import { signupValidationSchema } from '../../helpers/otpValidations';
import Toast from '../../components/toastMessage';
import { setIsSkippedLogin, setIsSkippedLoginAllow, setLoginState } from '../../redux/slices/loginSlice';
import Forgot from '../../assets/svg/forgot.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import LatestHeader from '../../components/LatestHeader';
import { fontScale } from '../../helpers/scale';
import { useToastForPopup } from '../../context/ToastContext';
import { DEBUG_OTP, isDebugApiMocksEnabled } from '../../helpers/debugApiMocks';

const ForgotPasswordScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [navigation])
  );



  const showToast = useToastForPopup();

  const handleSubmit = async (values) => {
    setIsLoading(true)
    try {
      const countryCode = values.country_code || '+44';
      const country = values.country || 'United Kingdom';
      const cleanNumber = values.mobile_number.replace(/^0+/, '');
      const fullNumber = `${countryCode}${cleanNumber}`;
      const cca2 = values?.cca2 || 'GB';

      if (isDebugApiMocksEnabled()) {
        showToast(`Debug OTP is ${DEBUG_OTP}`);
        navigation.navigate('Otp', {
          mobile_number: values?.mobile_number,
          country_code: countryCode,
          country,
          cca2: cca2,
          isFromForgotPassword: true,
          confirmation: {},
        });
        return;
      }

      const response = await dispatch(
        sendOtp({
          country_code: countryCode,
          mobile_number: values?.mobile_number,
          isFromForgotPassword: true,
        }),
      ).unwrap();

      const isRegistered = response?.response?.is_register; // Get directly from API response
      if (!isRegistered) {
        showToast('This number is not registered with us');
        return;
      }
      if (response.status) {
        navigation.navigate('Otp', {
          mobile_number: values?.mobile_number,
          country_code: countryCode,
          country,
          cca2: cca2,
          isFromForgotPassword: true,
          confirmation: {}, // Pass confirmation object
        });
      } else {
        showToast(response?.response?.message || 'Failed to send OTP');
      }
    } catch (error) {
      showToast(error?.message || 'Failed to send OTP. Please try again.');
    }
    finally {
      setIsLoading(false)
    }
  };

  const ContainerComponent = SafeAreaView;
  return (
    <ContainerComponent style={{ backgroundColor: '#fff', flex: 1 }}>
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
      <LatestHeader
        statusBarColor="#FFF"
        title="Forgot password"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
          fontFamily: fontFamilies.SFProRoundedBlackMedium,
        }}
      />
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: '#FFF' }} showsVerticalScrollIndicator={false}>
          <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
            <View style={styles.logoContainer}>
              <Forgot />
              <Text style={styles.greetingText}>FORGOT PASSWORD?</Text>
              <Text style={styles.instructionsText}>
                Please enter your registered mobile number.
              </Text>
            </View>
            <Formik
              initialValues={{ country_code: '+44', mobile_number: '' }}
              validationSchema={signupValidationSchema}
              validateOnChange={false}     // ✅ Do NOT validate on change
              validateOnBlur={false}
              onSubmit={handleSubmit}>
              {({ handleSubmit }) => (
                <>
                  <View style={styles.inputContainer}>
                    <InputFields
                      name="mobile_number"
                      placeholder="Enter your phone number"
                      keyboardType="numeric"
                      // title="Mobile no."
                      isPhoneNumber={true}
                      inputStyle={styles.phoneInput}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(setIsSkippedLogin(true));
                      dispatch(setIsSkippedLoginAllow(false));
                      dispatch(setLoginState(true));

                      navigation.navigate('CreatePasswordScreen', { FromForgotPass: true });
                    }}
                    style={[styles.skipContainer, { top: insets.top + 20 }]}
                    activeOpacity={0.7}>
                    <Text style={styles.title}>Skip & continue</Text>
                    <Icon name={'chevron-right'} size={24} color="#FFFFFF" style={styles.iconButton} />
                  </TouchableOpacity>
                  <GradientButton
                    onPress={handleSubmit}
                    title="Verify Mobile no."
                    containerStyle={styles.customButtonContainer}
                    textStyle={styles.customButtonText}
                    colors={['#DB3171', '#FFCC33']}
                    start={{ x: 0.9, y: 0 }}
                    end={{ x: 0.1, y: 1 }}
                  />
                </>
              )}
            </Formik>
          </View>
          <Toast message={toastMessage} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </ContainerComponent>
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
export default ForgotPasswordScreen;
