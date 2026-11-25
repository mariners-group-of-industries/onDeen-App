import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilies } from '../../assets/fonts/fonts';
import { X } from 'lucide-react-native';
import GradientButton from '../../components/gradientButton';

export const dateoptions = [
  { value: 'anydate', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function DateTypeModel({ visible, onClose, onSelect, selectedValue }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const bottomPadding = Math.max(insets.bottom + 16, 25);

  useEffect(() => {
    if (visible) {
      setSelected(selectedValue);
    }
  }, [visible, selectedValue]);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.bottomModal}
    >
      <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Event Date</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {dateoptions.map((item) =>
          selected === item.value ? (
            <TouchableOpacity key={item.value} onPress={() => setSelected(item.value)}>
              <LinearGradient
                colors={['#FDFBFF', '#F7EFFF', '#FDFBFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.selectedGradient}
              >
                <Text style={styles.selectedText}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={item.value}
              style={styles.option}
              onPress={() => setSelected(item.value)}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          )
        )}

        <View style={{ marginTop: 20 }}>
          <GradientButton
            containerStyle={styles.applyButton}
            onPress={handleContinue}
            title={'APPLY FILTERS'}
            textStyle={styles.applyButtonText}
            disabled={!selected}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    paddingTop: 5,
   borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  option: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    // backgroundColor: '#eee',
  },
  selectedGradient: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
  },
  optionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  selectedText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000',
    fontWeight: 'bold',
  },
  applyButton: {
    borderRadius: 90,
    width: '100%',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 18,
  },
});
