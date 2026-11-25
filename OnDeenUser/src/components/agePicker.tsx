import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

interface AgePickerSectionProps {
  name: string;
  label: string;
}

const AgePickerSection: React.FC<AgePickerSectionProps> = ({ name, label }) => {
  const [date, setDate] = useState(new Date(2000, 0, 1)); // Default date
  const [isPickerOpen, setPickerOpen] = useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setPickerOpen(false);
  };

  return (
    <View style={styles.ageContainer}>
      {/* Use the label prop */}
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.ageInput}
        onPress={() => setPickerOpen(true)}
      >
        <Text style={styles.ageText}>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={isPickerOpen}
        onBackdropPress={() => setPickerOpen(false)}
        backdropOpacity={0.5}
        useNativeDriver={true}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <DatePicker
            date={date}
            mode="date"
            maximumDate={new Date()} // Restricts future dates
            onDateChange={setDate}
            textColor="#000" // Ensures visibility on light backgrounds
          />
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => handleConfirm(date)}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  ageContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  ageInput: {
    flex: 1,
    fontSize: fontScale(14),
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(50),
    paddingRight: widthScale(50),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  ageText: {
    fontSize: 16,
    color: '#333',
  },
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FDFBFF',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AgePickerSection;
