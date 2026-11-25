import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  ViewStyle,
  Keyboard,
} from 'react-native';
import { useField, useFormikContext } from 'formik';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomCountryPicker from './CustomCountryPicker';
import { Country } from '../types/Country';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

interface InputFieldProps {
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  iconName?: string;
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  errorMessageStyle?: StyleProp<TextStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  isPhoneNumber?: boolean;
  disabled?: boolean;
  formik?: any
}

const InputFields: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  secureTextEntry = false,
  iconName,
  title,
  titleStyle,
  containerStyle,
  inputStyle,
  errorMessageStyle,
  autoCapitalize = 'none',
  keyboardType = 'default',
  isPhoneNumber = false,
  disabled,
  placeholderStyle,
  formik
}) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [showError, setShowError] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('+1');

  // Define max length for phone numbers
  const maxPhoneNumberLength = 11;

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
    Keyboard.dismiss(); // Close the keyboard when the icon is clicked
  }, []);

  useEffect(() => {
    if (meta.touched && meta.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        helpers.setError('');
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [meta.touched, meta.error, helpers]);

  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      <View style={styles.inputContainer}>
        {isPhoneNumber && (
          <CustomCountryPicker
            countryCode={countryCode}
            onSelect={(country: Country) => {
              setCountryCode(`+${country.country_code}`);
              setFieldValue('country_code', `+${country.country_code}`);
              // setFieldValue('country', country.name);
              setFieldValue('cca2', `${country.cca2}`);
            }}
            containerStyle={styles.countryCodeContainer}
            textStyle={styles.countryCodeText}
          />
        )}

        <TextInput
          value={field.value}
          placeholder={placeholder}
          placeholderStyle={placeholderStyle}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={[styles.input, inputStyle]}
          // onChangeText={text => !disabled && helpers.setValue(text)}
          onChangeText={text => {
            if (!disabled) {
              // Apply numeric filter only for the "mobile_number" field
              const processedText =
                name === 'mobile_number' ? text.replace(/[^0-9]/g, '') : text;
              helpers.setValue(processedText);
            }
          }}
          // onBlur={() => helpers.setTouched(true)}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          placeholderTextColor={'#969696'}
          editable={!disabled}
          maxLength={isPhoneNumber ? maxPhoneNumberLength : undefined}
        />

        {secureTextEntry && iconName && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}>
            <Icon
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
      {meta.touched && showError && meta.error && (
        <Text style={[styles.errorMessage, errorMessageStyle]}>
          {meta.error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: heightScale(8),
  },
  title: {
    marginBottom: heightScale(4),
    fontSize: fontScale(14),
    color: '#161616',
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
  countryCodeText: {
    fontSize: fontScale(16),
    color: '#161616',
  },
  iconContainer: {
    position: 'absolute',
    right: widthScale(10),
    justifyContent: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    height: heightScale(54), // <-- add fixed height
    paddingVertical: 0, // <-- neutralize to avoid adding on top of fixed height
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    // paddingRight: widthScale(50),
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },

});

export default React.memo(InputFields);
