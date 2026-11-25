import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  StatusBar,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {Formik} from 'formik';
import {useNavigation} from '@react-navigation/native';
import GradientButton from '../../components/gradientButton';
import InputFields from '../../components/inputFields';
import {loginUser} from '../../redux/slices/loginSlice';
import styles from './styles';
import {loginValidationSchema} from '../../helpers/loginValidations';
import Firstpagelogo from '../../assets/svg/firstpagelogo.svg';
import {useToast} from '../../context/ToastContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const showToast = useToast();

  const handleSubmit = async (values, actions) => {
    try {
      const resultAction = await dispatch(
        loginUser({
          email_id: values.email_id,
          password: values.password,
          showToast,
        }),
      );

      if (resultAction?.payload?.status) {
        const response = resultAction.payload.response || {};
        if (Number(response.user_status) !== 1 || response.application_status !== 'APPROVED') {
          navigation.navigate('ApplicationStatus', {
            access_token: response.access_token,
            application_status: response.application_status || 'UNDER_REVIEW',
            review_note: response.review_note,
          });
        }
      }

      if (!resultAction.payload?.status) {
        Keyboard.dismiss();
      }
    } catch {
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={handlePressOutside}>
      <ScrollView
        style={{backgroundColor: '#ffff'}}
        showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.container}>
          <View style={[styles.backgroundImage]}>
            <Firstpagelogo resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>Hello, Welcome to Ondeen</Text>
            <Text style={styles.loginText}>Sign in to your organizer account</Text>
          </View>
        </View>
        <View style={styles.formikContainer}>
          <Formik
            initialValues={{email_id: '', password: ''}}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}>
            {({handleSubmit: submitForm}) => (
              <>
                <InputFields
                  name="email_id"
                  placeholder="Enter email ID"
                  title="Email ID"
                  containerStyle={styles.inputContainer}
                  titleStyle={styles.inputTitle}
                />
                <InputFields
                  name="password"
                  placeholder="Enter password"
                  secureTextEntry
                  iconName="eye-off"
                  title="Password"
                  containerStyle={styles.inputContainer}
                  titleStyle={styles.inputTitle}
                />
                <GradientButton
                  onPress={submitForm}
                  title="Sign in"
                  containerStyle={styles.customButtonContainer}
                  textStyle={styles.customButtonText}
                />
                <View style={styles.textWrapper}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                    <Text style={styles.forgotText}>Forgot your password?</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('Signup')}
          style={styles.returnOptionsButton}>
          <Text style={styles.returnOptionsText}>Return to other sign-in options</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
