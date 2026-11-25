import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  BackHandler,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientButton from '../../components/gradientButton';
import CustomeInput from '../../components/CustomeInput';
import CustomeSelectFile from '../../components/CustomeSelectFile';
import CustomeMobileWithCountryCode from '../../components/CustomeMobilewithCountryCode';
import CustomePassword from '../../components/CustomePassword';
import { fontFamilies } from '../../assets/fonts/fonts';
import CustomeSelect from '../../components/CustomeSelect';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsSkippedLoginAllow,
  setLoginState,
  setLoginToken,
} from '../../redux/slices/loginSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { journeylevelslistAPI } from '../../redux/slices/journeylevelsSlice';
import Toast from '../../components/toastMessage';
import LatestHeader from '../../components/LatestHeader';
import { useStatusBar } from '../../components/statusbar';
import { passwordvalidation } from '../../helpers/loginValidations';
import { sendOtp } from '../../redux/slices/sendOtpSlice';
import { createNewAccount, emailSendOtpAPI } from '../../redux/callapis/CommonService';
import { setAccessToken } from '../../redux/slices/verifyOtpSlice';
import { useToastForPopup } from '../../context/ToastContext';
import CustomDatePicker from './CustomDatePicker';

const Registration = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showError, setShowError] = useState(false);
  useStatusBar({ backgroundColor: '#FFF', barStyle: 'dark-content' });

  const dispatch = useDispatch();
  const {
    mobile_number,
    country_code = '+44',
    cca2 = 'GB',
    userData,
    IsGoogleLogin,
    isVerified,
    userdata,
    email_id,
    socialAccessToken,
    socialId,
    socialProvider,
  } = route.params || {};

  const [account, setAccount] = useState({
    country_code: userdata?.country_code || country_code || '+44',
    mobile_number: userdata?.mobile_number || mobile_number || "",
    first_name: userdata?.first_name || userData?.givenName || "",
    last_name: userdata?.last_name || userData?.familyName || "",
    password: userdata?.password || '',
    confirm_password: userdata?.confirm_password || '',
    gender: userdata?.gender || '',
    profile_image: userdata?.profile_image || userData?.photo || "",
    journey_level_id: userdata?.journey_level_id || '',
    email_id: userdata?.email_id || userData?.email || email_id || "",
    cca2: userdata?.cca2 || cca2 || 'GB',
    age: userdata?.age || userData?.age || '',
    dob: userdata?.dob || userData?.dob || '',
  });


  useEffect(() => {
    if (userdata) {
      setAccount({
        country_code: userdata?.country_code || country_code || '+44',
        mobile_number: userdata?.mobile_number || mobile_number || "",
        first_name: userdata?.first_name || userData?.givenName || "",
        last_name: userdata?.last_name || userData?.familyName || "",
        password: userdata?.password || '',
        confirm_password: userdata?.confirm_password || '',
        gender: userdata?.gender || '',
        profile_image: userdata?.profile_image || userData?.photo || "",
        journey_level_id: userdata?.journey_level_id || '',
        email_id: userdata?.email_id || userData?.email || "",
        cca2: userdata?.cca2 || cca2 || '',
        age: userdata?.age || userData?.age || '',
        dob: userdata?.dob || userData?.dob || '',
      });
    }
  }, [userdata]);

  useEffect(() => {
    dispatch(journeylevelslistAPI());
  }, []);
  const journeylevels = useSelector(
    state => state.journeylevels?.journeylevels,
  );

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email_id: Yup.string()
      .email('Please enter a valid email address')
      .required('This is required')
      .test(
        'not-only-spaces',
        'Please enter a valid value',
        value => value.trim() !== '',
      ),

    password: passwordvalidation,
    confirm_password: Yup.string()
      .required('This is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character',
      )
      .test(
        'not-only-spaces',
        'Please enter a valid value',
        value => value.trim() !== '',
      ),

    gender: Yup.string()
      .required('This is required')
      .test(
        'not-only-spaces',
        'Please enter a valid value',
        value => value.trim() !== '',
      ),
    age: Yup.date().required('Date of birth is required'),
    dob: Yup.date().required('Date of birth is required'),

    profile_image: Yup.string()
      .notRequired()
      .test(
        'not-only-spaces',
        'Please enter a valid value',
        value => !value || value.trim() !== '',
      ),

    journey_level_id: Yup.string()
      .required('This is required')
      .test(
        'not-only-spaces',
        'Please enter a valid value',
        value => value.trim() !== '',
      ),
    mobile_number: Yup.string()
      .required('Please enter your mobile number.')
      .matches(/^[0-9]{9,11}$/, 'Phone number must be between 9 and 11 digits'),
  });



  const formik = useFormik({
    initialValues: {
      ...account
    },
    validationSchema: validationSchema,
    enableReinitialize: false,
    onSubmit: values => {
      const data = {
        ...values,
        country_code: country_code,
      };
      console.log(values, 'values');

      setAccount(data);
      newRegisterUserfast(data);
    },
  });


  useEffect(() => {
    if (formik.touched || formik.errors) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched]);

  useEffect(() => {
    if (formik.isSubmitting) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);

  const genderoptions = [
    { value: 1, label: 'Male' },
    { value: 2, label: 'Female' },
  ];
  const journenyleveloption =
    (Array.isArray(journeylevels) &&
      journeylevels.map(item => ({
        label: item.title,
        value: Number(item.id),
      }))) ||
    [];

  const showToast = useToastForPopup();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Signup');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );


  const checkNumberandNavigate = async () => {
    setIsLoading(true)
    try {
      const countryCode = formik?.values?.country_code || '+44';

      const response = await dispatch(
        sendOtp({
          country_code: countryCode,
          mobile_number: formik?.values?.mobile_number,
        }),
      ).unwrap();


      const isRegistered = response?.response?.is_register;
      if (isRegistered) {
        showToast('This number is already registered with us');
        return;
      }
      if (response.status) {
        const data = {
          country_code: formik.values?.country_code || country_code || '+44',
          mobile_number: formik.values?.mobile_number || mobile_number || "",
          age: formik.values?.age || '',
          first_name: formik.values?.first_name || userData?.givenName || "",
          last_name: formik.values?.last_name || userData?.familyName || "",
          password: formik.values?.password || '',
          confirm_password: formik.values?.confirm_password || '',
          gender: formik.values?.gender || '',
          profile_image: formik.values?.profile_image || userData?.photo || "",
          journey_level_id: formik.values?.journey_level_id || '',
          email_id: formik.values?.email_id || userData?.email || "",
          cca2: formik.values?.cca2 || cca2 || '',
          age: formik.values?.age || userData?.age || '',
          dob: formik.values?.dob || userData?.dob || '',
          access_token: socialAccessToken || '',
          provider: socialProvider || '',
          social_id: socialId || userData?.id || '',
        }
        navigation.navigate('Otp', {
          IsGoogleLogin: IsGoogleLogin,
          mobile_number: formik.values?.mobile_number,
          country_code: formik.values?.country_code,
          confirmation: {},
          userdata: data
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

  const checkEmailandNavigate = async () => {
    setIsLoading(true)
    try {

      const payload = { email_id: formik.values?.email_id };
      const response = await emailSendOtpAPI(payload);
      console.log(JSON.stringify(response), 'responseresponseresponseresponse');


      const isRegistered = response?.response?.is_register;
      if (isRegistered) {
        showToast('This number is already registered with us');
        return;
      }
      if (response.status) {
        const data = {
          country_code: formik.values?.country_code || country_code || '+44',
          mobile_number: formik.values?.mobile_number || mobile_number || "",
          age: formik.values?.age || '',
          first_name: formik.values?.first_name || userData?.givenName || "",
          last_name: formik.values?.last_name || userData?.familyName || "",
          password: formik.values?.password || '',
          confirm_password: formik.values?.confirm_password || '',
          gender: formik.values?.gender || '',
          profile_image: formik.values?.profile_image || userData?.photo || "",
          journey_level_id: formik.values?.journey_level_id || '',
          email_id: formik.values?.email_id || userData?.email || "",
          cca2: formik.values?.cca2 || cca2 || '',
          access_token: socialAccessToken || '',
          provider: socialProvider || '',
          social_id: socialId || userData?.id || '',
        }
        navigation.navigate('VerifyEmailOTP', {
          IsGoogleLogin: IsGoogleLogin,
          mobile_number: formik.values?.mobile_number,
          country_code: formik.values?.country_code,
          email_id: formik.values?.email_id || userData?.email || "",
          isVerified: isVerified,
          confirmation: {},
          userdata: data
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



  const newRegisterUserfast = async (values) => {
    try {
      console.log('[STEP 1] Start Registration');
      setIsLoading(true);
      if (!isVerified) {
        showToast('Verify Mobile Number');
        return
      }

      const data = {
        ...values,
        ...((userdata?.social_id || socialId || userData?.id) && {
          social_id: userdata?.social_id || socialId || userData?.id,
          access_token: userdata?.access_token || socialAccessToken || userData?.id,
          provider: userdata?.provider || socialProvider || (IsGoogleLogin ? 'google' : undefined),
        }),
      };

      const resultAction = await createNewAccount({ data });

      if (resultAction?.status) {
        console.log('[STEP 4] Registration Success:', resultAction.response.access_token);

        const datawithtoken = {
          access_token: resultAction?.response?.access_token
        }
        console.log(datawithtoken, 'datawithtokendatawithtoken');

        dispatch(setAccessToken(datawithtoken));
        dispatch(setLoginToken(datawithtoken));
        await AsyncStorage.setItem('first_time_login', 'true');
        dispatch(setLoginState(true));
        dispatch(setIsSkippedLoginAllow(false));

      } else {
        if (!resultAction?.response?.status) {
          showToast(resultAction?.response[0] || resultAction?.response?.message || 'Registration Failed');
        } else {
          showToast('Unexpected registration response');
        }
      }

    } catch (error) {
      console.log('[STEP ERROR] Catch Block:', error?.message || error);
      showToast(error?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      console.log('[STEP FINAL] Loading stopped');
    }
  };

  console.log(isVerified, 'isVerified');
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#FFF');
      return () => {
        StatusBar.setBackgroundColor('#fff');
      };
    }, []),
  );

  console.log(formik?.values, 'VALUES');
  
  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator
              animating={isLoading}
              size="large"
              color="#fff"
            />
          </View>
        </View>
      </Modal>
      <LatestHeader
        statusBarColor="#FFF"
        title="Create an account"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.navigate('Signup')}
        titleStyle={{
          color: '#000000',
          fontSize: 16,
        }}
      />
      <Toast message={toastMessage} />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}>
          <View style={styles.formikContainer}>
            <CustomeSelectFile
              formik={formik}
              name={'profile_image'}
              label={'Profile pic'}
              placeholder={'Enter Upload Logo'}
            />

            <CustomeInput
              formik={formik}
              name={'first_name'}
              label={'First Name'}
              placeholder={'Enter First Name'}
            />
            <CustomeInput
              formik={formik}
              name={'last_name'}
              label={'Last Name'}
              placeholder={'Enter Last Name'}
            />
            <CustomeMobileWithCountryCode
              formik={formik}
              cca2={formik.values?.cca2}
              isGoogleLogin={IsGoogleLogin}
              isVerified={isVerified}
              showDropdownIcon={false}
              showerror={false}
            />

            {formik.touched?.['mobile_number'] &&
              showError &&
              formik.errors?.['mobile_number'] && (
                <Text style={[styles.errorMessage]}>
                  {formik.errors?.['mobile_number']}
                </Text>
              )}
            {IsGoogleLogin && (
              <Text
                onPress={() => {
                  if (isVerified) return;
                  const mobileNumber = formik.values?.mobile_number || '';
                  if (!mobileNumber) {
                    showToast('Please enter your mobile number');
                  } else if (!/^\d{9,}$/.test(mobileNumber)) {
                    showToast('Mobile number must be at least 9 digits');
                  } else {
                    checkNumberandNavigate()
                  }
                }}
                style={{
                  textAlign: 'right',
                  fontFamily: fontFamilies.SFProRoundedBlackMedium,
                  color: '#131313',
                }}>
                {isVerified ? 'Verified' : 'Verify Number'}
              </Text>
            )}

            <CustomeInput
              formik={formik}
              name={'email_id'}
              label={'Email'}
              placeholder={'Enter Email'}
              type="email-address"
              disableAutoCapitalize={true}
              disabled={IsGoogleLogin}
            />
            {/* {(
              <Text
                onPress={() => {
                  const emailid = formik.values?.email_id || '';

                  if (!emailid) {
                    showToast('Please enter your Email');
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailid)) {
                    showToast('Please enter a valid Email address');
                  } else {
                    IsGoogleLogin ? "" : checkEmailandNavigate();
                  }
                }}
                style={{
                  textAlign: 'right',
                  fontFamily: fontFamilies.SFProRoundedBlackMedium,
                  color: '#131313',
                }}>
                {IsGoogleLogin ? 'Verified' : 'Verify Email'}
              </Text>
            )} */}

            <CustomePassword
              formik={formik}
              name={'password'}
              label={'Password'}
              placeholder={'Enter Password'}
              keyboardType="default"
              iconName="eye-off"
              disableAutoCapitalize={'none'}
            />

            <CustomePassword
              formik={formik}
              name={'confirm_password'}
              label={'Confirm Password'}
              placeholder={'Repeat password'}
              keyboardType="default"
              iconName="eye-off"
              disableAutoCapitalize={'none'}
            />

            <CustomeSelect
              formik={formik}
              name={'gender'}
              label={'Gender'}
              placeholder={'Select Gender'}
              options={genderoptions}
            />

            <CustomDatePicker
              formik={formik}
              fieldName="dob"
              label="Age"
            />
            <CustomeSelect
              formik={formik}
              name={'journey_level_id'}
              label={'Learning preference'}
              placeholder={'Select learning preference'}
              options={journenyleveloption}
              showIcon={true}
            />
            <GradientButton
              onPress={() => { formik.handleSubmit(); }}
              title="Save & Continue"
              containerStyle={styles.customButtonContainer}
              textStyle={styles.customButtonText}
            />
          </View>
        </ScrollView>
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  formikContainer: {},
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
    marginBottom: 32,
  },
  customButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  errorMessage: {
    color: 'red',
    marginTop: 4,
  },

  title: {
    marginBottom: 4,
    fontWeight: '500',
    fontSize: 12,
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
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#F3F0F7',
    borderRadius: 50,
    paddingRight: 50,
    marginTop: 2,
    marginBottom: 10,
  },
  description: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorMessage: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    right: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FCFCFF',
    width: '85%',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  dismiss: {
    color: '#C43D5E',
    marginTop: 15,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  ageTitle: {
    marginBottom: 4,
    fontSize: 12,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
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

export default Registration;
