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
import GradientButton from '../components/gradientButton';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';
import Close from '../../src/assets/svg/close.svg';

const CalenderDatePickerModal = ({ visible, onClose, onSelectDates, initialStartDate, initialEndDate }) => {
  const insets = useSafeAreaInsets();
  const [selectedDates, setSelectedDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setSelectedDates(getMarkedDates(initialStartDate, initialEndDate));
    } else {
      setStartDate(null);
      setEndDate(null);
      setSelectedDates({});
    }
  }, [initialStartDate, initialEndDate, visible]);

  const handleDayPress = day => {
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
    } else if (moment(date).isAfter(startDate)) {
      setEndDate(date);
      setSelectedDates(getMarkedDates(startDate, date));
    }
  };

  const getMarkedDates = (start, end) => {
    let range = {};
    let currentDate = moment(start);

    while (currentDate.isSameOrBefore(end)) {
      range[currentDate.format('YYYY-MM-DD')] = {
        selected: true,
        color:
          currentDate.format('YYYY-MM-DD') === start ||
            currentDate.format('YYYY-MM-DD') === end
            ? '#DB3171'
            : '#FFEAF2',
        textColor: '#FFFFFF',
        height: heightScale(32),
        width: widthScale(32),
        borderRadius: 20,
        backgroundColor: '#DB3171',
      };
      currentDate.add(1, 'day');
    }
    return range;
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
                {startDate
                  ? moment(startDate).format('DD MMM YYYY')
                  : 'Start Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (startDate) {
                  setEndDate(null);
                  setSelectedDates({});
                }
              }}
              style={endDate ? styles.inputBox : styles.addEndDate}>
              <Text style={styles.dateText}>
                {endDate
                  ? moment(endDate).format('DD MMM YYYY')
                  : '+ Add End Date'}
              </Text>
            </TouchableOpacity>
          </View>
          <Calendar
            current={moment().format('YYYY-MM-DD')}
            minDate={moment().format('YYYY-MM-DD')}
            hideExtraDays
            theme={styles.calendarTheme}
            markedDates={selectedDates}
            markingType={'period'}
            onDayPress={handleDayPress}
            style={{ backgroundColor: '#FDFBFF' }}
          />
          <View>
            <GradientButton
              containerStyle={styles.applyButton}
              onPress={() => {
                onSelectDates(startDate, endDate);
                onClose();
              }}
              title={'APPLY FILTERS'}
              textStyle={styles.applyButtonText}
              colors={['#DB3171', '#FFCC33']}
              start={{ x: 0.9, y: 0 }}
              end={{ x: 0.1, y: 1 }}
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
    // borderRadius: 32,
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
    marginTop: heightScale(14),
  },
  closeButton: {
    position: 'absolute',
    right: widthScale(10),
    padding: 8,
  },
  closeText: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: '#000000',
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
    height: heightScale(42),
    width: widthScale(168),
    paddingVertical: heightScale(10),
    paddingHorizontal: widthScale(24),
  },
  dateText: {
    fontSize: fontScale(14),
    color: '#000000',
  },
  addEndDate: {
    marginLeft: widthScale(12),
    marginRight: widthScale(28)
  },
  addEndDateText: {
    color: '#8C8C8C',
    fontSize: fontScale(14),
  },
  selectButton: {
    backgroundColor: '#B72A68',
    borderRadius: 10,
    paddingVertical: heightScale(12),
    alignItems: 'center',
    marginTop: heightScale(20),
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: heightScale(16),
    fontWeight: 'bold',
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
    // backgroundColor: '#f57c00',
    borderRadius: 90,
    marginRight: widthScale(12),
    marginLeft: widthScale(16),
    // paddingVertical: heightScale(0),
    // height: heightScale(52),
    width: widthScale(344),
    paddingVertical: heightScale(4),
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 14,
  },
});

export default CalenderDatePickerModal;
