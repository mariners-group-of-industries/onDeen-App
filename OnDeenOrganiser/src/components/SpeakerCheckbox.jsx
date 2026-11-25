import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontColor, fontFamilies } from '../assets/themes/fonts';
import Check from '../assets/svg/check.svg';

export default function SpeakerRadioButton({ options = [], onRadioChange, questionId, selectedValue, image, checkbox }) {
  const [selectedValueState, setSelectedValueState] = useState(selectedValue || null);

  useEffect(() => {
    if (selectedValue !== selectedValueState) {
      setSelectedValueState(selectedValue);
    }
  }, [selectedValue]);

  const handleSelect = (value) => {
    setSelectedValueState(value);

    if (onRadioChange) {
      onRadioChange(value, questionId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.radioContainer}>
        {Array.isArray(options) && options?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioButton}
            onPress={() => handleSelect(option.value)}
          >
            {
              (checkbox && selectedValueState == option.value) ?
                <Check /> :
                <View
                  style={[
                    styles.radioCircle,
                    selectedValueState == option.value && styles.selectedRadio,
                    { borderRadius: checkbox ? 4 : 10 }
                  ]}
                />
            }

            {
              image &&
              <Image
                style={styles.speakerImage}
                source={{ uri: option?.image }}
              />
            }

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
    borderColor: '#D0D0D0',
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
    fontSize: fontScale(14),
    fontWeight: '500',
    color: fontColor.CHINESEBLACK,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,

  },
  speakerImage: {
    height: heightScale(25),
    width: widthScale(25),
    borderRadius: widthScale(90),
    borderWidth: heightScale(1),
    borderColor: '#F9F6FD',
    marginLeft:10
  },
});
