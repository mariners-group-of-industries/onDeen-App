import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import {Formik} from 'formik';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {sendOtp} from '../../redux/slices/sendOtpSlice';
import styles from './styles';
import InputFields from '../../components/inputFields';
import GradientButton from '../../components/gradientButton';
import SocialLogin from '../../common/SocialLogin';
import {ROLE_TYPES, roleLabel} from '../../helpers/roleRoutes';

const SignupScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [roleType, setRoleType] = React.useState(ROLE_TYPES.ORGANISER);

  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  const handleSubmitForm = async (values: {
    country_code: string;
    mobile_number: string;
  }) => {
    try {
      // Country picker versions in the legacy organiser app sometimes return
      // `44` while the API stores `+44`. Normalize once so invited Speaker /
      // Buddy accounts are recognised consistently with Organiser accounts.
      const countryCode = String(values.country_code || '').startsWith('+')
        ? values.country_code
        : `+${values.country_code || ''}`;
      const response = await dispatch(
        sendOtp({
          country_code: countryCode,
          mobile_number: values.mobile_number,
          roleType,
        }),
      ).unwrap();

      if (response.status) {
        if (response.response.is_register === true) {
            navigation.navigate('Otp', {
              mobile_number: values.mobile_number,
              country_code: countryCode,
              roleType,
            });
        } else {
          if (roleType !== ROLE_TYPES.ORGANISER) {
            Alert.alert(
              `${roleLabel(roleType)} access`,
              'This role must be invited and activated by an organisation.',
            );
            return;
          }
          Alert.alert('Success', response.response.message || 'OTP sent successfully');
          navigation.navigate('Otp', {
              mobile_number: values.mobile_number,
              country_code: countryCode,
            roleType,
          });
        }
      } else {
        Alert.alert('Error', response.response.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send OTP. Please try again.',
      );
    }
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={handlePressOutside}>
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('../../assets/images/splash_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>Welcome to Ondeen!</Text>
            <Text style={styles.loginText}>Log in or sign up to get started.</Text>
          </View>
          <View style={{paddingHorizontal: 24, paddingTop: 8}}>
            <Text style={{color: '#17121C', fontSize: 15, fontWeight: '700', marginBottom: 10}}>
              Sign in as
            </Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              {[ROLE_TYPES.ORGANISER, ROLE_TYPES.SPEAKER, ROLE_TYPES.BUDDY].map(option => {
                const selected = roleType === option;
                return (
                  <TouchableOpacity
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{selected}}
                    accessibilityLabel={`Continue as ${roleLabel(option)}`}
                    onPress={() => setRoleType(option)}
                    style={{
                      backgroundColor: selected ? '#461477' : '#F1E8FA',
                      borderColor: selected ? '#461477' : '#D9CBE7',
                      borderRadius: 18,
                      borderWidth: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}>
                    <Text style={{color: selected ? '#FFFFFF' : '#461477', fontSize: 12, fontWeight: '700'}}>
                      {roleLabel(option)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <Formik
            initialValues={{country_code: '+44', mobile_number: ''}}
            // validationSchema={signupValidationSchema}
            onSubmit={handleSubmitForm}>
            {({handleSubmit}) => (
              <>
                <View style={styles.inputContainer}>
                  <InputFields
                    name="mobile_number"
                    placeholder="Enter your phone number"
                    keyboardType="numeric"
                    title="Enter your mobile no."
                    isPhoneNumber={true}
                    inputStyle={styles.phoneInput}
                  />
                </View>
                <Text style={styles.secureText}>
                  Securing personal information is our priority
                </Text>
                <GradientButton
                  onPress={() => {
                    handleSubmit();
                  }}
                  title="Continue"
                  containerStyle={styles.customButtonContainer}
                  textStyle={styles.customButtonText}
                />
              </>
            )}
          </Formik>
          {roleType === ROLE_TYPES.ORGANISER ? <SocialLogin /> : null}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
