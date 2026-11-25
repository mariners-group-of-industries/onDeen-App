import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchIcon from '../../src/assets/svg/search.svg';
import Filters from '../../src/assets/svg/filters.svg';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';

const SearchInput = ({
  placeholder = 'Search...',
  containerStyle,
  inputContainerStyle,
  inputStyle,
  value,
  onChangeText,
  onFilterPress,
  showFilter = true,
  hellonavigate = false,
  autoFocusInitially = false,
}) => {
  const navigation = useNavigation();
   const handleSearchSubmit = async () => {
  // if (!query.trim()) return; // Prevent empty search calls

  navigation.navigate('GlobalSearchResults',{keyword:value}); // Navigate after successful API call
  
};


  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}>
      <View
        style={[
          styles.inputContainer,
          inputContainerStyle,
        ]}>
        <SearchIcon width={widthScale(24)} height={widthScale(24)} />

        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            if (hellonavigate) {
              navigation.navigate('GlobalSearch');
            }
          }}
          disabled={!hellonavigate}>
          <TextInput
            pointerEvents={hellonavigate ? 'none' : 'auto'}
            accessible={!hellonavigate}
            value={value}
            onChangeText={(text) => {
              onChangeText?.(text);
            }}
            style={[styles.input, inputStyle]}
            placeholderTextColor={'#969696'}
            placeholder={placeholder}
            editable={!hellonavigate}
            selectTextOnFocus={!hellonavigate}
            autoFocus={autoFocusInitially}
            onSubmitEditing={handleSearchSubmit}
          />
        </Pressable>

        {value?.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            style={styles.clearIconContainer}>
            <Icon name="close" size={20} color="#131313" />
          </Pressable>
        )}

        {showFilter && (
          <Pressable
            accessibilityLabel="Filters"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onFilterPress}>
            <Filters width={widthScale(24)} height={heightScale(24)} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: widthScale(50),
    backgroundColor: '#F3F0F7',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthScale(24),
    backgroundColor: '#FEFEFF',
    justifyContent: 'center',
    borderRadius: widthScale(50),
    height: heightScale(52),
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#969696',
    paddingHorizontal: 12,
  },
  clearIconContainer: {
    paddingHorizontal: widthScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchInput;
