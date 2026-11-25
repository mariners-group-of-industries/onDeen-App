import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GradientButton from '../../components/gradientButton';
import CustomeInput from '../../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import CustomeSelectFile from '../../components/CustomeSelectFile';
import CustomeMobilewithCountryCode from '../../components/CustomeMobilewithCountryCode';
import CustomePassword from '../../components/CustomePassword';
import { fontFamilies } from '../../assets/themes/fonts';



const BasicDetails = ({ account, setAccount, setActivetab, movetolocationpage, address, latitude, longitude, update }) => {

  const validationSchema = Yup.object({
    profile_image: Yup.string()
      .required('Profile image is required'),
    organization_name: Yup.string()
      .required('Organization name is required')
      .test('not-only-spaces', 'Please enter a valid value', value => Boolean(value && value.trim())),
    manager_name: Yup.string()
      .required('Manager name is required')
      .test('not-only-spaces', 'Please enter a valid value', value => Boolean(value && value.trim())),
    country_code: Yup.string()
      .required('Country code is required')
      .matches(/^\+\d+$/, 'Invalid country code format'),
    mobile_number: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d+$/, 'Mobile number must only contain digits')
      .min(9, 'Mobile number must be at least 9 digits')
      .max(11, 'Mobile number cannot be longer than 11 digits'),
    password: update ? Yup.string() : Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot be longer than 128 characters')
      .matches(/[A-Za-z]/, 'Password must contain at least one letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required')
      .test('not-only-spaces', 'Please enter a valid value', value => Boolean(value && value.trim())),
    email_id: Yup.string().email('Invalid email format').required('Email is required'),
    post_code: Yup.string().required('Post code is required'),
    location: address ? Yup.string() : Yup.string().required('Location is required'),
    latitude: Yup.string().required('latitude is required'),
    longitude: Yup.string().required('longitude is required'),
  });

  const formik = useFormik({
    initialValues: account,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setAccount({
        ...values,
        location: address || values.location,
        latitude: latitude || values.latitude,
        longitude: longitude || values.longitude,
      });
      setActivetab(2);
    },
  });



  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (formik.touched || formik.errors) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched]);

  useEffect(() => {
    if (formik.isSubmitting) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <CustomeSelectFile
            formik={formik}
            name={'profile_image'}
            label={'Upload Logo'}
            placeholder={'Enter Upload Logo'}
          />
          <CustomeInput
            formik={formik}
            name={'organization_name'}
            label={'Organization Name'}
            placeholder={'Enter Organization Name'}
          />
          <CustomeInput
            formik={formik}
            name={'manager_name'}
            label={'Manager Name'}
            placeholder={'Enter Manager Name'}
          />
          <CustomeMobilewithCountryCode
            formik={formik}
            disabled={Boolean(account?.mobile_number)}
          />

          {(formik.touched?.['mobile_number'] && showError && formik.errors?.['mobile_number']) && (
            <Text style={[styles.errorMessage]}>
              {formik.errors?.['mobile_number']}
            </Text>
          )}
          <CustomeInput
            formik={formik}
            name={'email_id'}
            label={'Contact Email'}
            placeholder={'Enter Contact Email'}
            type='email-address'
          />
          <CustomePassword
            formik={formik}
            name={'password'}
            label={'Password'}
            placeholder={'Enter Password'}
            keyboardType="default"
            iconName="eye-off"
          />
          <View onPress={() => movetolocationpage(formik.values)}>
            <Text style={[styles.title]}>Add Location</Text>
            <TouchableOpacity onPress={() => movetolocationpage(formik.values)} style={styles.input}>
              <Text style={{ color: address ? '#000' : '#888' , fontSize:12}}>{address ? address : 'Enter Location'}</Text>
            </TouchableOpacity>
          </View>
          {(formik.touched?.['location'] && showError && formik.errors?.['location']) && (
            <Text style={[styles.errorMessage]}>
              {formik.errors?.['location']}
            </Text>
          )}
          <CustomeInput
            formik={formik}
            name={'post_code'}
            label={'Post Code'}
            placeholder={'Enter Post Code'}
            type={'number-pad'}
          />

          <GradientButton
            onPress={formik.handleSubmit}
            title="Save & Continue"
            containerStyle={styles.customButtonContainer}
            textStyle={styles.customButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: heightScale(2),
    marginBottom: heightScale(10),
  },
  formikContainer: {
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#161616',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#161616',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  customButtonContainer: {
    marginTop: 20,
    width: '100%',
    marginBottom: heightScale(32),
  },
  customButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(50),
    paddingRight: widthScale(50),
    marginTop: heightScale(2),
    marginBottom: heightScale(10),
  },
  description: {
    height: 120,
    textAlignVertical: 'top',
  },
});

export default BasicDetails;
