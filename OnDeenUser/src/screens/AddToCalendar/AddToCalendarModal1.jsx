// AddToCalendarModal1.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, CalendarPlus } from 'lucide-react-native';
import ReactNativeModal from 'react-native-modal';
import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import ClockIcon from '../../../src/assets/svg/clock.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import { getOnlyDayName } from '../../components/datetimeformate';
import { formatTimeOnly } from '../../timezone/maintimezone';

export default function AddToCalendarModal1({
  visible,
  eventDetail,
  isAdding,
  onClose,
  onAddToCalendar,
  formatDate,
}) {
  const renderDateTimeInfo = () => {
    const startDate = formatDate(eventDetail?.start_date);
    const endDate = formatDate(eventDetail?.end_date);
    const formattedDate = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    return (
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <CalendarIcon width={16} height={16} />
          <Text style={styles.dateTimeText}>{formattedDate}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <ClockIcon width={16} height={16} />
          <Text style={styles.dateTimeText}>
            {getOnlyDayName(eventDetail?.start_date)}{' '}
            {formatTimeOnly(eventDetail?.start_time, eventDetail?.time_zone, 'time-only')} -{' '}
            {getOnlyDayName(eventDetail?.end_date)}{' '}
            {formatTimeOnly(eventDetail?.end_time, eventDetail?.time_zone, 'time-only')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
      statusBarTranslucent
      deviceHeight="100%"
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.8}
        >
          <X color="#000" size={24} />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Add to Google Calendar</Text>
        <Text style={styles.eventTitle}>{eventDetail.title}</Text>

        {renderDateTimeInfo()}

        {eventDetail.location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{eventDetail.location}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmButton, isAdding && styles.disabledButton]}
          onPress={onAddToCalendar}
          disabled={isAdding}
          activeOpacity={0.7}
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CalendarPlus color="#fff" size={18} style={styles.buttonIcon} />
              <Text style={styles.confirmButtonText}>Add to Google Calendar</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Requires Google Calendar app with an active account
        </Text>
      </View>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'center', margin: 0 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 24, margin: 20 },
  closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  modalTitle: { fontSize: 18, color: '#000', marginBottom: 16, fontFamily: fontFamilies.SFProRoundedBlackMedium },
  eventTitle: { fontSize: 16, color: '#000', marginBottom: 10, fontFamily: fontFamilies.SFProRoundedBlackMedium },
  dateTimeContainer: { marginBottom: 14 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateTimeText: { color: '#000', marginLeft: 8, fontSize: 12, fontFamily: fontFamilies.SFProRoundedBlackRegular },
  detailRow: { flexDirection: 'row', marginBottom: 12 },
  detailLabel: { color: '#666', width: 80, fontSize: 14, fontFamily: fontFamilies.SFProRoundedBlackRegular },
  detailValue: { color: '#222', flex: 1, fontSize: 14, fontFamily: fontFamilies.SFProRoundedBlackRegular },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#5E35B1',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: { opacity: 0.7 },
  confirmButtonText: { color: '#fff', fontSize: 14, marginLeft: 8, fontFamily: fontFamilies.SFProRoundedBlackRegular },
  buttonIcon: { marginRight: 8 },
  noteText: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 12, fontFamily: fontFamilies.SFProRoundedBlackRegular },
});
