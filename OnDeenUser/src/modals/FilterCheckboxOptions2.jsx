import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { Search, ChevronDown, X, ChevronRight } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import UnCheck from '../../src/assets/svg/unCheck.svg';
import Checked from '../../src/assets/svg/checked.svg';
import { fontFamilies } from '../assets/fonts/fonts';
import TouchableLabel from '../components/customLabels';
import GradientButton from '../components/gradientButton';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
// Create a custom Checked icon component since it might be missing in newer versions

const FilterCheckboxOptions2 = React.memo(({
  options = [],
  onRadioChange,
  selectedValue = [],
  checkbox = true,
  title = '',
  initialVisibleCount = 0
}) => {
  const insets = useSafeAreaInsets();
  const [selectedValuesState, setSelectedValuesState] = useState(selectedValue);
  const [modalSelectedValues, setModalSelectedValues] = useState(selectedValue);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Sync with parent component's selectedValue
  useEffect(() => {
    setSelectedValuesState(selectedValue);
    setModalSelectedValues(selectedValue);
  }, [selectedValue]);

  const handleSelect = useCallback((value) => {
    setModalSelectedValues(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  }, []);

  const handleApply = useCallback(() => {
    const newValues = [...modalSelectedValues];
    setSelectedValuesState(newValues);
    onRadioChange(newValues);
    setModalVisible(false);
  }, [modalSelectedValues, onRadioChange]);

  const handleReset = useCallback(() => {
    setModalSelectedValues([]);
    setModalVisible(false)
  }, []);

  const handleToggleOption = useCallback((value) => {
    const newValues = selectedValuesState.includes(value)
      ? selectedValuesState.filter(v => v !== value)
      : [...selectedValuesState, value];
    setSelectedValuesState(newValues);
    onRadioChange(newValues);
  }, [selectedValuesState, onRadioChange]);

  const filteredOptions = options.filter(option =>
    option?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const visibleOptions = options.slice(0, initialVisibleCount);

  const renderItem = useCallback(({ item }) => {
    const isSelected = modalSelectedValues.includes(item.value);
    return (
      <Pressable
        style={styles.speakerRow}
        onPress={() => handleSelect(item.value)}
      >
        <Text style={styles.speakerName} numberOfLines={1} ellipsizeMode="tail">
          {item.label}
        </Text>
        <View style={styles.checkboxContainer}>
          {isSelected ? (
            <Checked size={22} />
          ) : (
            <View style={[
              styles.radioCircle,
              isSelected && styles.selectedRadio
            ]} />
          )}
        </View>
      </Pressable>
    );
  }, [modalSelectedValues, handleSelect]);

  const ContainerComponent = Platform.OS === 'ios' ? SafeAreaView : View;
  const modalBottomPadding = Platform.OS === 'ios'
    ? heightScale(16)
    : insets.bottom + heightScale(16);

  return (
    <View style={styles.container}>
      <View style={[{}]}>
        {visibleOptions.map((option) => {
          const isSelected = selectedValuesState.includes(option.value);
          return (
            <Pressable
              key={String(option.value)}
              style={styles.speakerRow}
              onPress={() => handleToggleOption(option.value)}
            >
              <Text style={styles.speakerName} numberOfLines={1} ellipsizeMode="tail">
                {option.label}
              </Text>
              <View style={styles.checkboxContainer}>
                {isSelected ? (
                  <Checked size={22} />
                ) : (
                  <View style={[
                    styles.radioCircle,
                    isSelected && styles.selectedRadio
                  ]} />
                )}
              </View>
            </Pressable>
          );
        })}
        <TouchableOpacity
          onPress={() => {
            setModalSelectedValues([...selectedValuesState]);
            setModalVisible(true);
          }}
          style={[styles.seeMoreButton, { justifyContent: 'space-between' }]}
        >
          <Text style={styles.fieldLabel}>{title}</Text>
          <ChevronRight size={24} color="#000" />
        </TouchableOpacity>
        {/* {options.length > initialVisibleCount && (
          <TouchableOpacity
            onPress={() => {
              setModalSelectedValues([...selectedValuesState]);
              setModalVisible(true);
            }}
            style={styles.seeMoreButton}
          >
            <Text style={styles.seeMoreText}>Show All</Text>
            <ChevronDown size={16} color="#DB3171" />
          </TouchableOpacity>
        )} */}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ContainerComponent style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {title}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={'#888'}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={filteredOptions}
            renderItem={renderItem}
            keyExtractor={item => String(item.value)}
            contentContainerStyle={styles.modalListContainer}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.modalButtonContainer, { paddingBottom: modalBottomPadding }]}>
            <TouchableLabel
              containerStyle={styles.cancelButton}
              label="RESET"
              onPress={handleReset}
              labelStyle={styles.resetButtonText}
            />
            <GradientButton
              containerStyle={styles.applyButton}
              onPress={handleApply}
              title={'APPLY'}
              textStyle={styles.applyButtonText}
            />
          </View>
        </ContainerComponent>
      </Modal>
      <View style={styles?.bbw} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18, color: '#000', fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  searchContainer: {
    backgroundColor: '#FEFDFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#DBD4E3',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#131313',
    fontFamily: fontFamilies.SFProRoundedBlackRegular
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
  },
  speakerName: {
    fontSize: 16,
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    alignItems: 'flex-end',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  selectedRadio: {
    backgroundColor: '#ffff',
    borderColor: '#DB3171',
    borderWidth: 4,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 12,
  },
  seeMoreText: {
    color: '#DB3171',
    fontSize: 16,
    marginRight: 6,
    fontFamily: fontFamilies.SFProRoundedBlackMedium

  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  resetButton: {
    borderRadius: 50,
    padding: 16,
    borderWidth: 1,
    borderColor: '#161616',
    backgroundColor: '#FEFDFF',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    borderRadius: 50,
    padding: 16,
    backgroundColor: '#DB3171',
    alignItems: 'center',
    flex: 1,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetButtonText: {
    fontWeight: 'bold',
  },
  bbw: {
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 12, marginBottom: -12, marginHorizontal: 10 },
  cancelButton: { borderRadius: 90, paddingVertical: 13, width: widthScale(160), borderWidth: 1, borderColor: '#161616', backgroundColor: '#FEFDFF' },
  cancelButtonText: { color: '#222222', fontSize: fontScale(12), fontFamily: fontFamilies.SFProRoundedBlackBold },
  applyButton: { borderRadius: 90, paddingLeft: 16, width: widthScale(188) },
  applyButtonText: { color: '#FFFFFF', fontSize: fontScale(14), fontFamily: fontFamilies.SFProRoundedBlackBold, lineHeight: 16 },
  fieldLabel: { fontSize: 20, color: '#000', fontFamily: fontFamilies.SFProRoundedBlackMedium },

});

export default FilterCheckboxOptions2;
