import { View, Text } from 'react-native';
import React from 'react';
import styles from './styles';

export default function ShowStatusComponent({ item, activeTab }) {
  const getStatusDetails = () => {
    if (item?.status == 1) {
      return {
        label: activeTab == 'active' ? 'Confirmed' : 'Completed',
        color: activeTab == 'active' ? '#2ecc71' : '#3498db', // green or blue
        bg: activeTab == 'active' ? '#eafaf1' : '#e8f3fc',
      };
    } else if (item?.status == 2 || item?.status == 4) {
      return {
        label: 'Cancelled',
        color: '#e74c3c', // red
        bg: '#fdecea',
      };
    } else {
      return {
        label: 'Confirmed',
        color: '#2ecc71',
        bg: '#eafaf1',
      };
    }
  };

  const { label, color, bg } = getStatusDetails();

  return (
    <View style={{ width: '50%' }}>
      <View style={[styles.statusBadge]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    </View>
  );
}
