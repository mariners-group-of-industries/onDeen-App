import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import { fontScale, heightScale } from '../helpers/scale';
import { fontColor, fontFamilies } from '../assets/themes/fonts';
import Check from '../assets/svg/check.svg';

export default function RatioInput({ selectedValue, onRadioChange, questionId, labels, checkbox = false }) {

  return (
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          accessibilityLabel={labels?.one || 'Yes'}
          accessibilityRole={checkbox ? 'checkbox' : 'radio'}
          accessibilityState={{ checked: selectedValue == 1 }}
          style={styles.radioButton}
          onPress={() => onRadioChange(1, questionId)}
        >
          {
              (checkbox && selectedValue == 1) ?
                <Check /> :
                <View
                  style={[
                    styles.radioCircle,
                    selectedValue == 1 && styles.selectedRadio,
                    { borderRadius: checkbox ? 4 : 10 }
                  ]}
                />
            }

          <Text style={styles.radioLabel}>{labels?.one ? labels?.one : 'Yes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel={labels?.two || 'Yes'}
          accessibilityRole={checkbox ? 'checkbox' : 'radio'}
          accessibilityState={{ checked: selectedValue == 2 }}
          style={styles.radioButton}
          onPress={() => {
            onRadioChange(2, questionId);
          }}
        >
          {
              (checkbox && selectedValue == 2) ?
                <Check /> :
                <View
                  style={[
                    styles.radioCircle,
                    selectedValue == 2 && styles.selectedRadio,
                    { borderRadius: checkbox ? 4 : 10 }
                  ]}
                />
            }

          <Text style={styles.radioLabel}>{labels?.two ? labels?.two : 'Yes'}</Text>
        </TouchableOpacity>
        {
          labels?.three &&
          <TouchableOpacity
            accessibilityLabel={labels?.three}
            accessibilityRole={checkbox ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selectedValue == 3 }}
            style={styles.radioButton}
            onPress={() => {
              onRadioChange(3, questionId);
            }}
          >
            {
              (checkbox && selectedValue == 3) ?
                <Check /> :
                <View
                  style={[
                    styles.radioCircle,
                    selectedValue == 3 && styles.selectedRadio,
                    { borderRadius: checkbox ? 4 : 10 }
                  ]}
                />
            }

            <Text style={styles.radioLabel}>{labels?.three ? labels?.three : 'No IDEA'}</Text>
          </TouchableOpacity>
        }

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(2),
    marginBottom: heightScale(10),
  },
  label: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: fontColor.CHINESEBLACK,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    backgroundColor: '#ffff',
    borderColor: fontColor.CERISERED,
    borderWidth: 4
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: fontScale(14),
    fontWeight: '500',
    color: fontColor.CHINESEBLACK,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,

  },
});
