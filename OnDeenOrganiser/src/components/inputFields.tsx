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
  Platform,
} from 'react-native';
import { useField, useFormikContext } from 'formik';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomCountryPicker from './CustomCountryPicker';
import { Country } from '../types/Country';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';

interface InputFieldProps {
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  iconName?: string;
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorMessageStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  isPhoneNumber?: boolean;
  disabled?: boolean;
}

const InputFields: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  secureTextEntry = false,
  iconName,
  title,
  containerStyle,
  inputStyle,
  errorMessageStyle,
  titleStyle,
  autoCapitalize = 'none',
  keyboardType = 'default',
  isPhoneNumber = false,
  disabled,
}) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [showError, setShowError] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('+44');

  // Define max length for phone numbers
  const maxPhoneNumberLength = 15;

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  useEffect(() => {
    if (meta.touched && meta.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        helpers.setError('');
      }, 3000);
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
              setFieldValue('country_code', `+${country.callingCode}`);
              setFieldValue('cca2', country.cca2);
              setFieldValue('country', country.name);
            }}
            containerStyle={[styles.countryCodeContainer, { paddingVertical: Platform.OS === 'android' ? 18 : 14 }]}
            textStyle={styles.countryCodeText}
          />
        )}

        <TextInput
          accessibilityLabel={placeholder}
          value={field.value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={[styles.input, inputStyle]}
          onChangeText={text => !disabled && helpers.setValue(text)}
          onBlur={() => helpers.setTouched(true)}
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
              name={isPasswordVisible ? 'eye-off' : 'eye'}
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
    marginVertical: heightScale(4),
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(14),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular
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
    paddingVertical: heightScale(14),
    marginRight: widthScale(8),
    justifyContent: 'center',
  },
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
    backgroundColor: '#0000',
    borderRadius: widthScale(24),
    paddingRight: widthScale(50),
    fontFamily: fontFamilies.SFProRoundedBlackRegular
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
});

export default React.memo(InputFields);
