import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { fontFamilies } from '../../assets/fonts/fonts';
import { heightScale } from '../helpers/scale';
import GradientButton from '../components/gradientButton';
import { useFilter } from '../context/FilterContext';
import { sortoptions } from '../components/common';

const SortFilter = ({ isVisible, onClose }) => {
  const { filter1, setFilter1, hithomepageapi, setHithomepageapi } = useFilter();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(null);
  const bottomPadding = Math.max(insets.bottom + 20, 40);

  useEffect(() => {
    if (isVisible) {
      setSelectedId(filter1.sort_Filter?.[0] || 1);
    }
  }, [isVisible, filter1.sort_Filter]);

  const SortOptionItem = ({ item, selected, onToggle }) => {
    return (
      <Pressable style={styles.filterOption} onPress={() => onToggle(item.value)}>
        <Text style={styles.optionText}>{item.label}</Text>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </Pressable>
    );
  };

  const toggleSort = useCallback(
    (itemValue) => {
      setSelectedId(itemValue);
    },
    []
  );

  const handleApply = () => {
    setFilter1('sort_Filter', selectedId ? [selectedId] : []);
    onClose();
    setHithomepageapi(hithomepageapi + 1)
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      statusBarTranslucent
      onBackButtonPress={onClose}
      style={styles.bottomModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={[styles.modalContent, styles.modalTopBottom, { paddingBottom: bottomPadding }]}>
        <View style={styles.headerRow}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <Pressable
            accessibilityLabel="Close sort options"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            style={styles.closeButton}>
            <X color="#161616" size={24} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.filterSection}>
          {sortoptions.map(item => (
            <SortOptionItem
              key={item.value}
              item={item}
              selected={selectedId === item.value}
              onToggle={toggleSort}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            containerStyle={styles.applyButton}
            onPress={handleApply}
            title={'APPLY FILTERS'}
            textStyle={styles.applyButtonText}
            gradientStyle={styles.applyGradient}
            colors={['#DB3171', '#FFCC33']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FDFBFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 29,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    lineHeight: 24,
  },
  closeButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  filterSection: {
    marginTop: 18,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 43,
    paddingHorizontal: 12,
  },
  optionText: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    fontSize: 16,
    lineHeight: 20,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#D2CED9',
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    justifyContent: 'center',
    width: 14,
  },
  radioSelected: {
    borderColor: '#DB3171',
    borderWidth: 4,
  },
  radioDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 26,
  },
  applyButton: {
    borderRadius: 28,
    height: 56,
    width: '100%',
  },
  applyGradient: {
    height: 56,
    paddingVertical: 0,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 17,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalTopBottom: {
    backgroundColor: 'white',
    minHeight: 405,
  },
});

export default React.memo(SortFilter);
