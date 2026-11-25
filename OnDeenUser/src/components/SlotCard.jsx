import React, { useMemo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';
import { formatSessionTime, formatTimeOnly } from '../timezone/maintimezone';
import { ticketAvailabilityStatus } from '../helpers/ticketSelection';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
};


const SlotCard = ({
  item,
  date,
  time,
  time_zone,
  seatsLeft,
  isSelected,
  onPress,
  accessibilityLabel,
  selectedColor = '#422199',
}) => {
  const formattedTime = date
    ? formatSessionTime(date, item?.start_time || time, time_zone)
    : formatTimeOnly(item?.start_time || time, time_zone, 'time-only');

  return (
    <Pressable
      disabled={item?.status == 2}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `Session slot ${formattedTime}`}
      accessibilityState={{
        disabled: item?.status == 2,
        selected: Boolean(isSelected),
      }}
      style={[styles.slotContainer,
      {
        backgroundColor: item?.status == 2 ? '#EFEAF3' : '#EFEAF3',
        opacity: item?.status == 2 ? 0.5 : 1,
      }, isSelected && { backgroundColor: selectedColor }]}
      onPress={onPress}>
      <Text style={[styles.timeText, isSelected && { color: '#FFFFFF' }]}>
        {formattedTime}
      </Text>
      {seatsLeft != undefined && (
        <Text style={[styles.seatsText, isSelected && { color: '#FFFFFF' }]}>
          {ticketAvailabilityStatus(seatsLeft)}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  slotContainer: {
    borderRadius: 8,
    padding: heightScale(12),
    backgroundColor: '#EFEAF3',
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    margin: 5,
    marginLeft: 0

  },
  selectedSlot: {
    backgroundColor: '#422199',
  },
  timeText: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(16),
    color: '#17101F',
    lineHeight: 20,
    textAlign: 'center',
  },
  seatsText: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 9,
    color: '#9977F2',
    lineHeight: 12,
    textAlign: 'center',
  },
});

export default SlotCard;
