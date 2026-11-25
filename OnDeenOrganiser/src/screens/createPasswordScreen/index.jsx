import React, {useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import {fontFamilies} from '../../assets/themes/fonts';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {useToast} from '../../context/ToastContext';
import {organizerChangePasswordAPI} from '../../services/authService';

const passwordSchema = Yup.object({
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot be longer than 128 characters')
    .matches(/[A-Za-z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

const CreatePasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const showToast = useToast();
  const resetToken = route.params?.resetToken;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async values => {
    if (!resetToken) {
      showToast?.('Please verify OTP again.');
      navigation.navigate('Login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await organizerChangePasswordAPI({
        new_password: values.new_password,
        bearerToken: resetToken,
      });

      if (response?.status) {
        showToast?.(response?.response?.message || 'Password updated successfully');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Login'}],
          }),
        );
        return;
      }

      showToast?.(response?.response?.message || 'Failed to update password.');
    } catch (error) {
      showToast?.('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Modal
          transparent
          animationType="fade"
          visible={isLoading}
          onRequestClose={() => setIsLoading(false)}>
          <View style={styles.loaderBackground}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>

        <View style={styles.header}>
          <Text style={styles.greetingText}>Organizer password</Text>
          <Text style={styles.title}>Create a new password</Text>
          <Text style={styles.subtitle}>
            Use this password next time you sign in with email.
          </Text>
        </View>

        <Formik
          initialValues={{new_password: '', confirm_password: ''}}
          validationSchema={passwordSchema}
          onSubmit={handleSubmit}>
          {({handleSubmit: submitForm}) => (
            <View style={styles.formContainer}>
              <InputFields
                name="new_password"
                placeholder="Enter new password"
                secureTextEntry
                iconName="eye-off"
                title="New Password"
                containerStyle={styles.inputContainer}
              />
              <InputFields
                name="confirm_password"
                placeholder="Repeat password"
                secureTextEntry
                iconName="eye-off"
                title="Confirm Password"
                containerStyle={styles.inputContainer}
              />
              <GradientButton
                onPress={submitForm}
                title={isLoading ? 'Saving...' : 'Save Password'}
                containerStyle={styles.customButtonContainer}
                textStyle={styles.customButtonText}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: heightScale(32),
  },
  header: {
    alignItems: 'center',
    paddingTop: heightScale(118),
    paddingHorizontal: widthScale(24),
  },
  greetingText: {
    fontSize: fontScale(16),
    color: '#676767',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  title: {
    marginTop: heightScale(8),
    fontSize: fontScale(28),
    color: '#191719',
    textAlign: 'center',
    lineHeight: heightScale(34),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  subtitle: {
    marginTop: heightScale(12),
    fontSize: fontScale(13),
    color: '#676767',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  formContainer: {
    marginTop: heightScale(30),
  },
  inputContainer: {
    paddingHorizontal: widthScale(24),
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
  loaderBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

export default CreatePasswordScreen;
