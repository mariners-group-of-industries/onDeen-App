import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import CustomCountryPicker from './CustomCountryPicker';
import CustomeInput from './CustomeInput';
import { fontFamilies } from '../assets/fonts/fonts';

export default function CustomeMobileWithCountryCode({
  formik,
  inputStyle,
  cca2,
  isGoogleLogin,
  isVerified = false,
  showerror = true
}) {
  const [countryCode, setCountryCode] = useState(formik?.values?.country_code);

  const handleCountrySelect = (country) => {



    const code = `+${country?.country_code}`;
    setCountryCode(code);
    formik.setFieldValue('country_code', code);  // Ensure 'country_code' is set correctly in Formik
    formik.setFieldValue('cca2', country?.cca2);  // Ensure 'country_code' is set correctly in Formik
    formik.setFieldValue('country', country?.name);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'Mobile Number'}</Text>
      <View style={[styles.inputContainer, !isGoogleLogin ? styles?.disableinputContainer : isVerified ? styles?.disableinputContainer : '']}>
        <View style={styles.inputContainer1}>
          <CustomCountryPicker
            cca2={cca2}
            values={formik?.values}
            countryCode={countryCode}
            onSelect={handleCountrySelect}
            containerStyle={styles.countryCodeContainer}
            textStyle={styles.countryCodeText}
            disabled={isGoogleLogin}
            showDropdownIcon={false}
          />
        </View>
        <View style={styles.inputContainer2}>
          <CustomeInput
            formik={formik}
            name={'mobile_number'}
            placeholder={'Enter Contact No.'}
            type="phone-pad"
            style={[styles.input, inputStyle]}
            // disabled={isGoogleLogin}
            showerror={showerror}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(2),
    marginBottom: heightScale(0),
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  // inputContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   // position: 'relative',
  //   // pointerEvents: 'none',
  // },
  disableinputContainer: {

    position: 'relative',
    pointerEvents: 'none',
  },
  inputContainer1: {
    width: '30%',
    marginTop: heightScale(-8),
  },
  inputContainer2: {
    width: '70%',
    marginTop: heightScale(0),
  },
  // countryCodeContainer: {
  //   backgroundColor: '#F3F0F7',
  //   borderRadius: widthScale(28),
  //   paddingHorizontal: widthScale(16),
  //   paddingVertical: heightScale(16),
  //   marginRight: widthScale(8),
  //   justifyContent: 'center',
  // },
  countryCodeText: {
    fontSize: fontScale(16),
    color: '#161616',
  },
  iconContainer: {
    position: 'absolute',
    right: widthScale(10),
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    // paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    paddingRight: widthScale(50),
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  countryCodeContainer: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingHorizontal: widthScale(16),
    // paddingVertical: heightScale(14),
    marginRight: widthScale(8),
    justifyContent: 'center',
    height: heightScale(54)
  },
});
