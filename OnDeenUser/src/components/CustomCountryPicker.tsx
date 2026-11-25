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
import { Country } from '../types/Country';
import { fontScale, heightScale, widthScale } from '../helpers/scale';

interface CustomCountryPickerProps {
  countryCode?: string;
  onSelect?: (country: Country) => void;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: any;
  country?: string;
  cca2: any;
  showDropdownIcon?: boolean;
}

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  countryCode,
  onSelect,
  containerStyle,
  textStyle,
  disabled,
  country,
  cca2,
  showDropdownIcon = true,
}) => {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>({
    name: 'United Kingdom',
    callingCode: ['44'],
    cca2: 'GB',
    region: 'Europe',
    subregion: 'Northern Europe',
    flag: '🇬🇧',
  });

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setIsPickerVisible(false);
    onSelect?.({
      name: country?.name,
      country_code: country?.callingCode[0],
      cca2: country?.cca2,
    });
  };





  React.useEffect(() => {
    onSelect?.({
      name: selectedCountry?.name,
      country_code: selectedCountry?.callingCode[0],
      cca2: selectedCountry?.cca2,
    });
  }, []);

  React.useEffect(() => {
    onSelect?.({
      name: selectedCountry?.name,
      country_code: selectedCountry?.callingCode[0],
      cca2: cca2 || selectedCountry?.cca2,
    });
  }, [cca2]);

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
        countryCode={cca2 || selectedCountry?.cca2}
        visible={isPickerVisible}
        onSelect={handleSelect}
        onClose={() => setIsPickerVisible(false)}
        disable={false}
        country={country}
      />
      {showDropdownIcon && ( // 👈 conditionally render
        <Icon name="menu-down" color="#161616" size={22} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    height: 58
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
