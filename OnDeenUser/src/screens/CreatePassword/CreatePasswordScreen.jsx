import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  BackHandler,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import Toast from '../../components/toastMessage';
import Loader from '../../components/loader';
import Fingerprint from '../../assets/svg/fingerprint.svg';
import LatestHeader from '../../components/LatestHeader';
import {
  clearCreatePasswordState,
  forgotPassword,
} from '../../redux/slices/createPasswordSlice';
import { setIsSkippedLogin, setIsSkippedLoginAllow, setLoginState } from '../../redux/slices/loginSlice';
import { useToastForPopup } from '../../context/ToastContext';
import { passwordvalidation } from '../../helpers/loginValidations';

const CreatePasswordScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [toastMessage, setToastMessage] = useState(null);

  const {
    forgotPasswordError,
    forgotPasswordApiStatus,
    forgotPasswordResponseMessage,
  } = useSelector((state) => state.createPasswordSlice);

 useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      navigation.navigate('ForgotPasswordScreen');
      return true; 
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => backHandler.remove();
  }, [navigation])
);


  useEffect(() => {
    if (forgotPasswordApiStatus == true) {
      setLoading(false);
      showToast(forgotPasswordResponseMessage);
      setTimeout(() => {
        dispatch(setIsSkippedLoginAllow(true));
        dispatch(setIsSkippedLogin(false));
        dispatch(setLoginState(false));
        showToast(forgotPasswordResponseMessage);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: { isBackedFromCreatePassword: true } }],
        });
        dispatch(clearCreatePasswordState());
      }, 1500);
    } else if (forgotPasswordApiStatus === false) {
      setLoading(false);
      showToast(forgotPasswordError);
    }
  }, [forgotPasswordApiStatus, navigation, dispatch]);

  const handleSubmitPassword = (values) => {
    setLoading(true);
    // resetToken comes from the OTP verification screen (forgot-password).
    dispatch(forgotPassword({
      new_password: values.new_password,
      resetToken: route?.params?.resetToken,
    }));
  };

  const handlePressOutside = () => Keyboard.dismiss();

  const showToast = useToastForPopup();


  const validationSchema = Yup.object().shape({
    new_password: passwordvalidation,
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], 'Passwords do not match')
      .required('Confirm password is required'),
  });

  const ContainerComponent = SafeAreaView;

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
        animationSource={require('../../assets/loader.json')}
      />
    );
  }
  return (
    <>
      <ContainerComponent style={{ flex: 1, backgroundColor:'#fff' }}>
        <LatestHeader
          statusBarColor={'#FFF'}
          title=""
          leftIconName="chevron-left"
          onLeftPress={() => navigation.navigate('ForgotPasswordScreen')}
        />
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ backgroundColor: '#FFF' }}
            showsVerticalScrollIndicator={false}>
            <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
              <View style={styles.logoContainer}>
                <Fingerprint />
                <Text style={styles.greetingText}>CREATE NEW PASSWORD?</Text>
                <Text style={styles.instructionsText}>
                  Please choose a new password to continue
                </Text>
              </View>
              <Formik
                initialValues={{ new_password: '', confirm_password: '' }}
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
                      title="Create Password"
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
    </>
  );
};

export default CreatePasswordScreen;
