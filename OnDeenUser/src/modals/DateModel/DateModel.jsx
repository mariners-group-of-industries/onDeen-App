import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTypeModel from './DateTypeModel';
import PickDateModel from './PickDateModel';
import Calendar from '../../../src/assets/svg/calendar.svg';
import Down from '../../../src/assets/svg/down.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import moment from 'moment';
import { formatDateType, getLabelDateType } from '../../components/common';
import { useFilter } from '../../context/FilterContext';

export default function DateModel() {
  const { filter1, setFilter1 } = useFilter();
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState('anydate');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Memoize the date label to prevent unnecessary recalculations
  const twoDateLabel = useMemo(() => {
    if (!startDate || !endDate) return 'Choose Date';
    try {
      const start = moment(startDate).isValid() ? formatDateType(startDate) : 'Invalid Date';
      const end = moment(endDate).isValid() ? formatDateType(endDate) : 'Invalid Date';
      return `${start} - ${end}`;
    } catch (e) {
      return 'Choose Date';
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Always store dates as strings in state
    if (filter1.start_date) {
      setStartDate(filter1.start_date);
    } else {
      setStartDate(null);
    }
    
    if (filter1.end_date) {
      setEndDate(filter1.end_date);
    } else {
      setEndDate(null);
    }
    
    if (filter1.date_type) {
      setSelectedDateType(filter1.date_type);
    }
  }, [filter1.start_date, filter1.end_date, filter1.date_type]);

  const handleDateRangeSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setFilter1('date_type', 'anydate');
    setFilter1('start_date', start);
    setFilter1('end_date', end);
  };

  const handleDateChange = (value) => {
    const today = moment().local().startOf('day');
    let newStartDate = null;
    let newEndDate = null;

    switch (value) {
      case 'today':
        newStartDate = today.format('YYYY-MM-DD');
        newEndDate = today.format('YYYY-MM-DD');
        break;
      case 'tomorrow':
        newStartDate = today.add(1, 'days').format('YYYY-MM-DD');
        newEndDate = newStartDate;
        break;
      case 'week':
        newStartDate = today.startOf('isoWeek').format('YYYY-MM-DD');
        newEndDate = today.endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'month':
        newStartDate = today.startOf('month').format('YYYY-MM-DD');
        newEndDate = today.endOf('month').format('YYYY-MM-DD');
        break;
      case 'anydate':
        newStartDate = null;
        newEndDate = null;
        break;
      default:
        newStartDate = today.format('YYYY-MM-DD');
        newEndDate = today.format('YYYY-MM-DD');
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setFilter1('date_type', value);
    setFilter1('start_date', newStartDate);
    setFilter1('end_date', newEndDate);
  };

  const handleDateTypeSelect = (value) => {
    setSelectedDateType(value);
    handleDateChange(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>Event Date</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity 
          style={styles.dateContainer}
          onPress={() => setModal1Visible(true)}
        >
          <Text style={styles.title}>{getLabelDateType(selectedDateType)}</Text>
          <Down />
        </TouchableOpacity>
        {selectedDateType === 'anydate' && (
          <TouchableOpacity
            style={styles.dateContainer}
            onPress={() => setModal2Visible(true)}
          >
            <Text style={styles.title}>{twoDateLabel}</Text>
            <Calendar />
          </TouchableOpacity>
        )}
      </View>

      <DateTypeModel
        visible={modal1Visible}
        onClose={() => setModal1Visible(false)}
        onSelect={handleDateTypeSelect}
        selectedValue={selectedDateType}
      />

      <PickDateModel
        visible={modal2Visible}
        onClose={() => setModal2Visible(false)}
        onSelectDates={handleDateRangeSelect}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  fieldLabel: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#000000',
    marginRight: 8,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F4F4F',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 18,
  },
});
