import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  StatusBar,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import styles from './styles';
import GradientButton from '../../components/gradientButton';
import {
  loginUser,
  setIsSkippedLoginAllow,
  setLoginState,
} from '../../redux/slices/loginSlice';
import { loginValidationSchema } from '../../helpers/loginValidations';
import LatestHeader from '../../components/LatestHeader';
import CustomeInput from '../../components/CustomeInput';
import CustomePassword from '../../components/CustomePassword';
import { useToastForPopup } from '../../context/ToastContext';
import { REFERENCE_DEMO_LOGIN } from '../../helpers/referenceDemoCredentials';

const LoginEmailPassword = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const showToast = useToastForPopup();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const goToSignup = () => navigation.navigate('Signup');

  const formik = useFormik({
    initialValues: REFERENCE_DEMO_LOGIN,
    validationSchema: loginValidationSchema,
    onSubmit: (values) => {
      loginUseCheck(values);
    },
  });

  const loginUseCheck = async (values) => {
    setIsSubmitting(true);
    Keyboard.dismiss();
    try {
      const payload = await dispatch(
        loginUser({ email_id: values.email_id, password: values.password })
      ).unwrap();

      if (!payload?.status) {
        showToast(payload?.response?.message || 'Unable to sign in. Please check your details.');
        return;
      }

      showToast('Login successful!');
      dispatch(setIsSkippedLoginAllow(false));
      dispatch(setLoginState(true));
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error?.message || 'Unable to reach the server. Please try again.';
      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar backgroundColor={'#fff'} />
      <View style={styles.container}>
        <LatestHeader
          statusBarColor={'#FFF'}
          title="Sign in with email"
          onLeftPress={goToSignup}
          signup={true}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 0,
            backgroundColor: '#fff',
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <ImageBackground
              style={styles.imageBackground}
              resizeMode="cover"
              source={require('../../assets/images/login_bg.png')}
            />
            <Text style={styles.loginText}>Sign in to your account</Text>
          </View>
          <View style={styles.formikContainer}>
            <View style={{ paddingHorizontal: 20 }}>
              <CustomeInput
                formik={formik}
                name="email_id"
                label="Email"
                title="Email"
                placeholder="Enter email ID"
                disableAutoCapitalize={'none'}
              />
              <CustomePassword
                formik={formik}
                name="password"
                placeholder="Enter password"
                label="Password"
                title="Email"
                iconName="eye-off"
                disableAutoCapitalize={'none'}
              />
            </View>
            <View style={{ backgroundColor: '#fff', alignSelf: 'flex-end' }}>
              <Text
                onPress={() => navigation.navigate('ForgotPasswordScreen')}
                style={styles.forgotText}
              >
                Forgot your password?
              </Text>
            </View>
            <GradientButton
              onPress={formik.handleSubmit}
              title={isSubmitting ? 'Signing in...' : 'Sign in'}
              disabled={isSubmitting}
              containerStyle={styles.customButtonContainer}
              textStyle={styles.customButtonText}
            />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate('Signup')}
              style={styles.returnOptionsButton}>
              <Text style={styles.returnOptionsText}>Return to other sign-in options</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ContainerComponent>
  );
};

export default LoginEmailPassword;
