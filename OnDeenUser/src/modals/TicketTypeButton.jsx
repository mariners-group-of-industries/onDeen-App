import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { fontFamilies } from '../assets/fonts/fonts';
import { fontScale, heightScale, widthScale } from '../helpers/scale';

export default function TicketTypeButton({ 
  toggleSelectionTemp, 
  selectedValue = [],
}) {
  const isFreeSelected = selectedValue.includes(0);
  
  const handleToggle = () => {
    if (isFreeSelected) {
      toggleSelectionTemp(selectedValue.filter(item => item != 0));
    } else {
      toggleSelectionTemp([...selectedValue, 0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.modalTitle}>
        Ticket Type
      </Text>
      <View style={styles.row}>
        <Text style={styles.subtitle}>Show only free tickets</Text>
        <Pressable
          style={[
            styles.toggleContainer,
            isFreeSelected && styles.toggleActive,
          ]}
          onPress={handleToggle}>
          <View
            style={[
              styles.toggleCircle,
              isFreeSelected && styles.circleActive,
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E7E7E7',
    },
    modalTitle: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
    },
    toggleContainer: {
        width: widthScale(45),
        height: heightScale(24),
        borderRadius: widthScale(24),
        backgroundColor: '#D9D3E0',
        padding: widthScale(3),
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#DB3171',
    },
    toggleCircle: {
        width: heightScale(21),
        height: heightScale(21),
        borderRadius: heightScale(18),
        backgroundColor: '#FFF',
        position: 'absolute',
        left: widthScale(2),
    },
    circleActive: {
        left: widthScale(20),
    },
});
