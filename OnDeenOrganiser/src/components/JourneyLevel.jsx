import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { fontScale, heightScale } from '../helpers/scale';
import { fontColor } from '../assets/themes/fonts';

export default function JourneyLevel({ selectedValue, onRadioChange, questionId, options }) {

  return (
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        {options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioButton}
            onPress={() => onRadioChange(option.value, questionId)}
          >
            <View style={[styles.radioCircle, selectedValue == option.value && styles.selectedRadio]} />
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
  label: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: fontColor.CHINESEBLACK,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',  // Allows wrapping for longer lists
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,  // Adds space between the rows when wrapping
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
  },
});
