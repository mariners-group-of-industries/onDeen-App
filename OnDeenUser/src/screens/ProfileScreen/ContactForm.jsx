import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getSelfProfileAPI, sendEmailAPI } from '../../redux/callapis/CommonService';
import { useToastForPopup } from '../../context/ToastContext';
import GradientButton from '../../components/gradientButton';
import { fontFamilies } from '../../assets/fonts/fonts';
import Loader from '../../components/loader';
import { useFocusEffect } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

const validationSchema = Yup.object().shape({
  fullname: Yup.string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .required('Full name is required'),
  // email: Yup.string()
  //   .trim()
  //   .email('Invalid email address')
  //   .required('Email is required'),
  message: Yup.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

export default function ContactForm({ type = 1, title = "Customer Support" }) {
  const showToast = useToastForPopup();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useFocusEffect(
    useCallback(() => {

      fetchSelfData();
    }, [])
  );



  const fetchSelfData = async () => {
    setIsLoading(true);
    try {
      const res = await getSelfProfileAPI();
      setProfileData(res?.response || []);

    } catch (err) {
      setProfileData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      fullname: '',
      email: '',
      message: '',
      type: type || 1,
    },
    validationSchema,
    onSubmit: (values) => {
      handleFormSubmit(values)
    },
  });

  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);

      const payload = {
        ...values,
        platform: Platform.OS,
        osVersion: Platform.Version,
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        deviceId: DeviceInfo.getDeviceId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        // uniqueId: DeviceInfo.getUniqueId(),
        email: profileData?.email_id,
        mobileNumber: `${profileData?.country_code} ${profileData?.mobile_number}`,
      };


      const resultAction = await sendEmailAPI(payload);

      if (resultAction?.status) {
        showToast(resultAction?.response?.message || 'Sent Successfully');
        formik.resetForm();
      } else {
        if (!resultAction?.response?.status) {
          showToast(
            resultAction?.response[0] ||
            resultAction?.response?.message ||
            'Sent Failed'
          );
        } else {
          showToast('Unexpected registration response');
        }
      }
    } catch (error) {
      console.log(error);
      showToast('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{type == 1
          ? 'Please fill out this form for Help & Support'
          : 'Please fill out this form to Report an Issue'}</Text>

        <Text style={styles.organizerHeading}>Full Name</Text>

        <TextInput
          style={[
            styles.input,
            formik.touched.fullname && formik.errors.fullname && styles.inputError,
          ]}
          placeholder="Full Name"
          value={formik.values.fullname}
          placeholderTextColor={'#999'}
          onChangeText={formik.handleChange('fullname')}
          onBlur={formik.handleBlur('fullname')}
        />
        {formik.touched.fullname && formik.errors.fullname && (
          <Text style={styles.errorText}>{formik.errors.fullname}</Text>
        )}

        {/* <TextInput
          style={[
            styles.input,
            formik.touched.email && formik.errors.email && styles.inputError,
          ]}
          placeholder="Email"
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {formik.touched.email && formik.errors.email && (
          <Text style={styles.errorText}>{formik.errors.email}</Text>
        )} */}
        <Text style={styles.organizerHeading}>Message</Text>

        <TextInput
          style={[
            styles.input,
            styles.messageInput,
            formik.touched.message && formik.errors.message && styles.inputError,
          ]}
          placeholder="Message"
          value={formik.values.message}
          onChangeText={formik.handleChange('message')}
          onBlur={formik.handleBlur('message')}
          placeholderTextColor={'#999'}
          multiline
          numberOfLines={4}
        />
        {formik.touched.message && formik.errors.message && (
          <Text style={styles.errorText}>{formik.errors.message}</Text>
        )}

        <View style={{ paddingTop: 10 }}>
          <GradientButton
            containerStyle={styles.applyButton}
            onPress={formik.handleSubmit}
            title={isLoading ? 'Loading...' : 'SUBMIT'}
            textStyle={styles.applyButtonText}
            colors={['#DB3171', '#FFCC33']}
            start={{ x: 0.9, y: 0 }}
            disabled={isLoading}
            end={{ x: 0.1, y: 1 }}>
            {isLoading && (
              <Loader
                isLoading={true}
                containerStyle={{ backgroundColor: '#FDFBFF' }}
                animationSource={require('../../assets/loader.json')}
              />
            )}
          </GradientButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  organizerHeading: {
    fontSize: 12,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#131313',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingTop: 32,
    paddingBottom: 10,
    paddingHorizontal: 50,
    lineHeight: 35
  },
  input: {
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    fontSize: 14,
    color: '#161616',
    padding: 20,
    paddingVertical: 15,
    marginVertical: 10
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 6,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: 90,
    paddingVertical: 0,
    width: '100%',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
});
