import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import Toast from '../../components/toastMessage';
import Loader from '../../components/loader';
import Fingerprint from '../../assets/svg/fingerprint.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import LatestHeader from '../../components/LatestHeader';
import { fontScale } from '../../helpers/scale';
import { forgotPassword } from '../../redux/slices/createPasswordSlice';
import { persistor } from '../../redux/store';

import styles from './styles';
import PasswordSuccessModal from '../../modals/PasswordSuccessModal';
import { logoutUser } from '../../redux/slices/logoutSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetOtpState } from '../../redux/slices/verifyOtpSlice';
import { resetRegisterState } from '../../redux/slices/registerUserSlice';
import { resetProfileState } from '../../redux/slices/profileSlice';
import { clearLastEventId } from '../../helpers/storage';
import { logout } from '../../redux/slices/loginSlice';
import { passwordvalidation } from '../../helpers/loginValidations';
import { useToastForPopup } from '../../context/ToastContext';

const ChangePassword = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [toastMessage, setToastMessage] = useState(null);
  const [isModalShow, setIsModalShow] = useState(false);

  const {
    status,
    forgotPasswordError,
    responseMessage,
    forgotPasswordApiStatus,
    forgotPasswordResponseMessage,
  } = useSelector((state) => state.createPasswordSlice);

  const isSkippedLogin = useSelector(
    (state) => state.user.isSkippedLogin,
  );
  useEffect(() => {
    if (forgotPasswordApiStatus === true) {
      setLoading(false);
      setIsModalShow(true); // Show modal instead of toast
    } else if (forgotPasswordApiStatus === false) {
      setLoading(false);
      showToast(forgotPasswordError);
    }
  }, [forgotPasswordApiStatus]);

  const handleModalConfirm = () => {
    setIsModalShow(false);
    navigation.navigate('Home');
  };

  useEffect(() => {
    setIsModalShow(false);
    // if (isSkippedLogin) {
    //   setIsModalShow(true);
    // }
  }, [isSkippedLogin, status]);

  const handleSubmitPassword = async (values) => {
    setLoading(true);
    const result = await dispatch(forgotPassword({
      old_password: values.old_password,
      new_password: values.new_password,
    }));
    // Only end the session once the password really changed (the backend
    // invalidates old tokens then). On failure, e.g. a wrong current password,
    // stay signed in so the user can correct it; the error toast comes from the
    // forgotPasswordApiStatus effect above.
    if (forgotPassword.fulfilled.match(result)) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    dispatch(logoutUser());
    await AsyncStorage.removeItem('isNewUser');
    await AsyncStorage.removeItem('otherData');
    dispatch(resetOtpState());
    dispatch(resetRegisterState());
    dispatch(resetProfileState());
    setIsModalShow(false);
    await clearLastEventId();
    dispatch(logout());
    await persistor.purge();
    // navigation.replace('Signup'); // Navigate to Login screen after logout
  };

  const handlePressOutside = () => Keyboard.dismiss();
  const showToast = useToastForPopup();

  const validationSchema = Yup.object().shape({
    old_password: Yup.string().required('Current password is required'),
    new_password: passwordvalidation.notOneOf(
      [Yup.ref('old_password')],
      'New password must be different from the current password',
    ),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], 'Passwords do not match')
      .required('Confirm password is required'),
  });
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
            return true; 
          }
          return false;
        };
  
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
        return () => {
          backHandler.remove();
        };
      }, [navigation])
    );
  

  if (loading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{
          backgroundColor: '#FDFBFF',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        animationSource={require('../../../src/assets/loader.json')}
      />
    );
  }
  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ flex: 1 , backgroundColor:'#fff'}}>

      <LatestHeader
        statusBarColor="#fff"
        title="Change Password"
        leftIconName="chevron-left"
        onLeftPress={() => {
          navigation.goBack();
        }}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
          fontFamilies: fontFamilies.SFProRoundedBlackMedium,
        }}
      />
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <ScrollView
          style={{ backgroundColor: '#fff' }}
          showsVerticalScrollIndicator={false}>
          <PasswordSuccessModal
            isVisible={isModalShow}
            message={forgotPasswordResponseMessage}
            onConfirm={handleModalConfirm}
          />

          <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
            <View style={styles.logoContainer}>
              <Fingerprint />
              <Text style={styles.greetingText}>CHANGE PASSWORD?</Text>
              <Text style={styles.instructionsText}>
                Please choose a new password to continue
              </Text>
            </View>
            <Formik
              initialValues={{ old_password: '', new_password: '', confirm_password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmitPassword}>
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
              }) => (
                <>
                  <View style={styles.inputContainer}>
                    <InputFields
                      name="old_password"
                      placeholder="Enter current password"
                      secureTextEntry
                      iconName="eye-off"
                      title="Current Password"
                      titleStyle={styles.inputLabel}
                      inputStyle={{ height: 48, paddingVertical: 0, top: 0 }}
                      value={values.old_password}
                      onChangeText={handleChange('old_password')}
                      onBlur={handleBlur('old_password')}
                      error={touched.old_password && errors.old_password}
                    />
                    <InputFields
                      name="new_password"
                      placeholder="Enter new password"
                      secureTextEntry
                      iconName="eye-off"
                      title="New Password"
                      titleStyle={styles.inputLabel}
                      inputStyle={{ height: 48, paddingVertical: 0, top: 0 }}
                      value={values.new_password}
                      onChangeText={handleChange('new_password')}
                      onBlur={handleBlur('new_password')}
                      error={touched.new_password && errors.new_password}
                    />
                    <InputFields
                      name="confirm_password"
                      placeholder="Repeat password"
                      secureTextEntry
                      iconName="eye-off"
                      title="Confirm Password"
                      titleStyle={styles.inputLabel}
                      inputStyle={{ height: 48, paddingVertical: 0, top: 0 }}
                      value={values.confirm_password}
                      onChangeText={handleChange('confirm_password')}
                      onBlur={handleBlur('confirm_password')}
                      error={
                        touched.confirm_password && errors.confirm_password
                      }
                    />
                  </View>
                  <GradientButton
                    onPress={handleSubmit}
                    title="Change Password"
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

export default ChangePassword;
