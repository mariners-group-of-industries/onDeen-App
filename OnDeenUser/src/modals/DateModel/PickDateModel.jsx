import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientButton from '../../components/gradientButton';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import Close from '../../../src/assets/svg/close.svg';

const isValidDateString = (dateStr) => {
  return dateStr && moment(dateStr, 'YYYY-MM-DD', true).isValid();
};

const formatDateDisplay = (dateStr) => {
  if (!isValidDateString(dateStr)) return 'Invalid Date';
  return moment(dateStr).format('DD MMM YYYY');
};

const PickDateModel = ({ visible, onClose, onSelectDates, initialStartDate, initialEndDate }) => {
  const insets = useSafeAreaInsets();
  const [selectedDates, setSelectedDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [canApply, setCanApply] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM-DD'));

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    
    // Convert any moment objects to strings
    const startStr = moment.isMoment(initialStartDate) ? initialStartDate.format('YYYY-MM-DD') : initialStartDate;
    const endStr = moment.isMoment(initialEndDate) ? initialEndDate.format('YYYY-MM-DD') : initialEndDate;
    
    const validStart = isValidDateString(startStr) ? startStr : null;
    const validEnd = isValidDateString(endStr) ? endStr : null;
    
    setStartDate(validStart);
    setEndDate(validEnd);
    
    if (validStart && validEnd) {
      setSelectedDates(getMarkedDates(validStart, validEnd));
      setCurrentMonth(validStart);
      setCanApply(true);
    } else {
      setSelectedDates({});
      setCurrentMonth(today);
      setCanApply(false);
    }
  }, [initialStartDate, initialEndDate, visible]);

  const handleDayPress = (day) => {
    if (!day?.dateString) return;
    
    const date = day.dateString;
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setSelectedDates({
        [date]: {
          selected: true,
          color: '#B72A68',
          textColor: '#FFFFFF',
        },
      });
      setCanApply(false);
    } else if (moment(date).isAfter(startDate)) {
      setEndDate(date);
      setSelectedDates(getMarkedDates(startDate, date));
      setCanApply(true);
    }
  };

  const getMarkedDates = (startStr, endStr) => {
    const range = {};
    
    if (!isValidDateString(startStr) || !isValidDateString(endStr)) return range;
    
    const start = moment(startStr);
    const end = moment(endStr);
    
    if (start.isAfter(end)) return range;
    
    let current = start.clone();
    
    while (current.isSameOrBefore(end)) {
      const dateStr = current.format('YYYY-MM-DD');
      range[dateStr] = {
        selected: true,
        color: dateStr === startStr || dateStr === endStr ? '#DB3171' : '#FFEAF2',
        textColor: '#FFFFFF',
        height: heightScale(32),
        width: widthScale(32),
        borderRadius: 20,
        backgroundColor: '#DB3171',
      };
      current.add(1, 'day');
    }
    
    return range;
  };

  const onMonthChange = (month) => {
    if (month?.dateString) {
      setCurrentMonth(month.dateString);
    }
  };

  const handleApply = () => {
    if (canApply && isValidDateString(startDate) && isValidDateString(endDate)) {
      onSelectDates(startDate, endDate);
      onClose();
    }
  };

  const bottomPadding = Math.max(insets.bottom + heightScale(12), heightScale(16));

  return (
    <Modal statusBarTranslucent transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
          <View style={styles.headers}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Close width={widthScale(24)} height={widthScale(24)} />
            </TouchableOpacity>
            <Text style={styles.title}>Choose Date</Text>
          </View>
          <View style={styles.dateInputs}>
            <TouchableOpacity style={styles.inputBox}>
              <Text style={styles.dateText}>
                {startDate ? formatDateDisplay(startDate) : 'Start Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (startDate) {
                  setEndDate(null);
                  setSelectedDates({});
                  setCanApply(false);
                }
              }}
              style={endDate ? styles.inputBox : styles.addEndDate}
            >
              <Text style={styles.dateText}>
                {endDate ? formatDateDisplay(endDate) : '+ Add End Date'}
              </Text>
            </TouchableOpacity>
          </View>
          <Calendar
            current={currentMonth}
            minDate={moment().format('YYYY-MM-DD')}
            hideExtraDays
            theme={styles.calendarTheme}
            markedDates={selectedDates}
            markingType={'period'}
            onDayPress={handleDayPress}
            onMonthChange={onMonthChange}
            style={{ backgroundColor: '#FDFBFF' }}
          />
          <View>
            <GradientButton
              containerStyle={[
                styles.applyButton,
                !canApply && styles.disabledButton
              ]}
              onPress={handleApply}
              title={'SELECT DATES'}
              textStyle={styles.applyButtonText}
              colors={canApply ? ['#DB3171', '#FFCC33'] : ['#CCCCCC', '#CCCCCC']}
              start={{ x: 0.9, y: 0 }}
              end={{ x: 0.1, y: 1 }}
              disabled={!canApply}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FDFBFF',
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: heightScale(16),
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
  },
  headers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: heightScale(24),
    paddingHorizontal: 10
  },
  closeButton: {
    position: 'absolute',
    right: widthScale(10),
    padding: 8,
  },
  title: {
    fontSize: fontScale(16),
    marginBottom: heightScale(10),
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    lineHeight: 20,
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: heightScale(16),
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#4F4F4F',
    borderRadius: 24,
    alignItems: 'center',
    width: widthScale(168),
    paddingVertical: heightScale(6),
    paddingHorizontal: widthScale(24),
    marginTop: 10
  },
  dateText: {
    fontSize: fontScale(14),
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  addEndDate: {
    marginLeft: widthScale(12),
    marginRight: widthScale(28)
  },
  calendarTheme: {
    calendarBackground: '#FFFFFF',
    textSectionTitleColor: '#000000',
    selectedDayBackgroundColor: '#B72A68',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#B72A68',
    arrowColor: '#000000',
    textMonthFontWeight: fontFamilies.SFProRoundedBlackBold,
    textDayFontSize: fontScale(16),
  },
  applyButton: {
    borderRadius: 90,
    marginRight: widthScale(12),
    marginLeft: widthScale(16),
    width: widthScale(344),
    paddingVertical: heightScale(4),
  },
  disabledButton: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 14,
  },
});

export default PickDateModel;
