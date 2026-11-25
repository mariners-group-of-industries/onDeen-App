import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Country} from '../types/Country';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

interface CustomCountryPickerProps {
  countryCode?: string;
  onSelect?: (country: Country) => void;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: any;
  values?:object;
}

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  countryCode,
  onSelect,
  containerStyle,
  textStyle,
  disabled,
  values
}) => {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
    null,
  );

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setIsPickerVisible(false);
    onSelect(country);
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={() => !disabled && setIsPickerVisible(true)}
      activeOpacity={disabled ? 1 : 0.2}>
      <CountryPicker
        withFilter
        withFlag
        withCallingCode
        withCallingCodeButton={false}
        countryCode={values?.cca2 || selectedCountry?.cca2 || 'GB'}
        visible={isPickerVisible}
        onSelect={handleSelect}
        onClose={() => setIsPickerVisible(false)}
        disable={disabled}
      />
      <Icon name="menu-down" color="#161616" size={22} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthScale(12),
    paddingVertical: heightScale(16),
    height: '100%',
  },
  countryCodeText: {
    fontSize: fontScale(16),
    color: '#161616',
  },
});

export default CustomCountryPicker;
