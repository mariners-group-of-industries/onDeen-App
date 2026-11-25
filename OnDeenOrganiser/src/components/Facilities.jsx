import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fontScale, heightScale } from '../helpers/scale';
import { fontColor, fontFamilies } from '../assets/themes/fonts';

export default function Facilities({ options, onRadioChange, questionId, selectedValue }) {
  const [selectedValues, setSelectedValues] = useState(selectedValue || []);
  ;

  useEffect(() => {
    if (selectedValue !== selectedValues) {
      setSelectedValues(selectedValue);
    }
  }, [selectedValue]);

  const handleSelect = (value) => {
    let updatedSelectedValues;
    // Check if the value is already in the selectedValues array
    if (selectedValues.some(item => item.facilities_id === value)) {
      updatedSelectedValues = selectedValues.filter(item => item.facilities_id !== value); // Remove if already selected
    } else {
      updatedSelectedValues = [...selectedValues, { 'facilities_id': value }]; // Add to selected values in required format
    }

    setSelectedValues(updatedSelectedValues);

    // Call the onRadioChange callback if provided
    if (onRadioChange) {
      onRadioChange(updatedSelectedValues, questionId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        {options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioButton}
            onPress={() => handleSelect(option.value)}
          >
            <View
              style={[
                styles.radioCircle,
                selectedValues.some(item => item.facilities_id === option.value) && styles.selectedRadio,
              ]}
            />
            <Text style={styles.radioLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(5),
    marginBottom: heightScale(5),
  },
  radioContainer: {},
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: fontColor.GRAISHVIOLET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    backgroundColor: '#ffff',
    borderColor: fontColor.CERISERED,
    borderWidth: 4,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: fontScale(12),
    fontWeight: '500',
    color: fontColor.CHINESEBLACK,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});
