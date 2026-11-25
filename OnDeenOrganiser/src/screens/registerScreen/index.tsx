import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import {Formik, FormikHelpers} from 'formik';
import InputFields from '../../components/inputFields';
import * as Yup from 'yup';
import styles from './styles';
import GradientButton from '../../components/gradientButton';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {registerUser} from '../../redux/slices/registerUserSlice';
import {useRoute} from '@react-navigation/native';
import CustomCountryPicker from '../../components/CustomCountryPicker';

const RegisterScreen = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const route = useRoute();
  const {mobile_number, country_code, otp} = route.params;

  const combinedOtp = otp.join('');
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  
  const genderMapping: {[key: string]: number} = {
    Male: 1,
    Female: 2,
    Other: 3,
  };

  const selectGender = (gender: string) => {
    setSelectedGender(gender);
    toggleDropdown();
  };

  const handleSubmit = async (values: any, actions: any) => {
    try {
      const genderValue = genderMapping[selectedGender] || 0;
      const formValues = {
        otp: combinedOtp,
        first_name: values.first_name,
        last_name: values.last_name,
        email_id: values.email_id,
        password: values.password,
        mobile_number: mobile_number,
        country_code: country_code,
        gender: genderValue,
        profile_image:
          'https://images.unsplash.com/photo-1719937206930-84afb0daf141?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8', // Ensure this is the correct profile image URI
      };


      const resultAction = dispatch(registerUser(formValues));

      if (registerUser.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        actions.resetForm();
        Alert.alert(
          'Registration Successful',
          'You have registered successfully!',
        );
      } else {
        const errorMessage: any =
          resultAction.payload || 'Registration failed.';
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 80,
      height: 80,
      cropping: false,
      compressImageQuality: 0.7,
      includeBase64: true,
    })
      .then(image => {
        setProfileImage(image?.path);
      })
      .catch(error => {
        if (error.message !== 'User cancelled image selection') {
          Alert.alert('Error', 'Failed to select an image');
        }
      });
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Validation schema for the form
  const loginValidationSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email_id: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    gender: Yup.string().required('Please select a gender'),
  });
  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
        {/* Profile Pic Section */}
        <View style={styles.profilePicContainer}>
          <Text style={styles.profileText}>Profile pic</Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={choosePhotoFromLibrary}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{uri: profileImage}}
                  style={styles.profileImage}
                />
              ) : (
                <Image source={require('../../assets/images/camera-01.png')} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View>
          <Formik
            initialValues={{
              first_name: '',
              last_name: '',
              email_id: '',
              password: '',
              confirmPassword: '',
              gender: '',
            }}
            // validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              setFieldValue,
              errors,
              touched,
            }) => (
              <>
                <InputFields
                  name="first_name"
                  placeholder="Enter First Name"
                  title="First Name"
                  keyboardType="default"
                  containerStyle={styles.inputContainer}
                  inputStyle={{height: 48}}
                  onChangeText={handleChange('first_name')}
                  value={values.first_name}
                  errorMessage={touched.first_name && errors.first_name}
                />
                <InputFields
                  name="last_name"
                  placeholder="Enter Last Name"
                  title="Last Name"
                  keyboardType="default"
                  containerStyle={styles.inputContainer}
                  inputStyle={{height: 48}}
                  onChangeText={handleChange('last_name')}
                  onBlur={handleBlur('lastName')}
                  value={values.last_name}
                  errorMessage={touched.last_name && errors.last_name}
                />
                <InputFields
                  name="email_id"
                  placeholder="Enter Email ID"
                  title="Email ID"
                  keyboardType="email-address"
                  containerStyle={styles.inputContainer}
                  inputStyle={{height: 48}}
                  onChangeText={handleChange('email_id')}
                  onBlur={handleBlur('email')}
                  value={values.email_id}
                  errorMessage={touched.email_id && errors.email_id}
                />
                <InputFields
                  name="password"
                  placeholder="Enter password"
                  title="Password"
                  keyboardType="default"
                  containerStyle={styles.inputContainer}
                  inputStyle={{height: 48}}
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  errorMessage={touched.password && errors.password}
                />
                <InputFields
                  name="confirmPassword"
                  placeholder="Repeat password"
                  title="Confirm Password"
                  keyboardType="default"
                  containerStyle={styles.inputContainer}
                  inputStyle={{height: 48}}
                  secureTextEntry
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                  }
                />

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <TouchableOpacity
                    onPress={toggleDropdown}
                    activeOpacity={0.6}
                    style={styles.dropdownButton}>
                    <Text style={styles.dropdownText}>
                      {selectedGender || 'Select Gender'}
                    </Text>
                    <Image
                      source={require('../../assets/images/chevron-down.png')}
                    />
                  </TouchableOpacity>

                  {/* Dropdown List */}
                  {isDropdownVisible && (
                    <View style={styles.dropdownList}>
                      {['Male', 'Female', 'Other'].map(gender => (
                        <TouchableOpacity
                          key={gender}
                          style={styles.dropdownItem}
                          activeOpacity={0.6}
                          onPress={() => selectGender(gender)}>
                          <Text style={styles.dropdownItemText}>{gender}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.phoneInputContainer}>
                  <InputFields
                    name="Mobile number"
                    placeholder="Enter your phone number"
                    keyboardType="numeric"
                    title="Enter your mobile no."
                    isPhoneNumber={false}
                    inputStyle={styles.phoneInput}
                    disabled={true}
                  />
                  <CustomCountryPicker
                    countryCode={country_code}
                    containerStyle={styles.countryCodeContainer}
                    textStyle={styles.countryCodeText}
                    disabled={true}
                  />
                </View>
                <GradientButton
                  containerStyle={{height: 48, marginTop: 40}}
                  onPress={() => {
                    ;
                  }}
                  title={'Save & Continue'}
                  colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
                  start={{x: -1.39, y: 0}}
                  end={{x: 2.39, y: 1}}
                  textStyle={styles.buttonText}
                />
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
