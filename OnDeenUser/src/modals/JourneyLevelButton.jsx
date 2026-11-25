import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import React from 'react';
import { fontFamilies } from '../assets/fonts/fonts';
import { fontScale, heightScale, widthScale } from '../helpers/scale';

export default function JourneyLevelButton({
  options = [],
  toggleSelectionTemp,
  selectedValue = []
}) {
  const handlePress = (value) => {
    let newSelection;

    if (selectedValue.includes(value)) {
      newSelection = selectedValue.filter(item => item !== value);
    } else {
      newSelection = [...selectedValue, value];
    }
    toggleSelectionTemp(newSelection);
  };

  return (
    <View>
      {options.length > 0 && (
        <View style={styles.container}>
          <Text style={styles.modalTitle}>Journey Level</Text>
          <ScrollView
            horizontal
            bounces={false}
            contentContainerStyle={styles.rowContainer}
            showsHorizontalScrollIndicator={false}>
            {options.map(item => (
              <Pressable
                key={String(item.value)}
                onPress={() => handlePress(item.value)}
                style={[
                  styles.journeyItem,
                  selectedValue?.includes(item.value) && styles.selectedJourney,
                ]}>
                <Text style={[
                  styles.journeyName,
                  selectedValue?.includes(item.value) && styles.selectedJourneyName,
                ]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000',
    marginBottom: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  journeyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#4F4F4F',
    height: 40,
  },
  selectedJourney: {
    borderColor: '#000000',
    borderWidth: 1,
    backgroundColor: '#000000',
  },
  journeyName: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 16,
    textAlign: 'center',
  },
  selectedJourneyName: {
    color: '#FFFFFF',
  },
});
