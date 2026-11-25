import React, { useEffect, useState } from 'react';
import { CalendarList } from 'react-native-calendars';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import styles from './styles';
import { currentDate, nextYearCurrentDate } from '../../common/datetimeformate';
import { eventOccursOnDate, markedOccurrenceDates } from './calendarOccurrence';

const YearCalender = ({ filteredData = [], setTab, setData }) => {
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    setMarkedDates(markedOccurrenceDates(filteredData));
  }, [filteredData]);

  const handleDayPress = (day) => {
    const selectedDate = day?.dateString;
    if (!selectedDate) {
      setData({});
      return;
    }
    const selectedMonth = new Date(selectedDate).getMonth();
    const selectedYear = new Date(selectedDate).getFullYear();

    const eventData = (Array.isArray(filteredData) ? filteredData : []).find(event => {
      if (!event?.start_date || !event?.end_date) {
        return false;
      }
      return eventOccursOnDate(event, selectedDate);
    });

    // Unmarked days stay in the year view. Marked days represent at least one
    // occurrence, so keep the selected date and switch to the month/session
    // view only after the occurrence lookup succeeds.
    if (!eventData) {
      setData({});
      return;
    }

    setData({
      ...eventData,
      date: selectedDate,
      month: selectedMonth + 1,
      year: selectedYear
    });
    setTab(1);
  };

  // CalendarList's built-in day renderer can swallow taps on a marked
  // one-off day (notably the current day when a period mark is present).
  // Keep the calendar's visual treatment but own the press target so every
  // marked occurrence follows the same Year -> Month flow.
  const renderDay = ({ date, state, marking, onPress }) => {
    const parsedDate = date?.dateString
      ? new Date(`${date.dateString}T00:00:00Z`)
      : null;
    const accessibleDate = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
      : date?.dateString || '';
    const isMarked = Boolean(marking?.color);

    return (
      <TouchableWithoutFeedback
        accessibilityRole="button"
        accessibilityLabel={accessibleDate}
        disabled={state === 'disabled'}
        onPress={() => {
          // Keep the library callback in the loop as well as the local
          // transition; this covers marked-day implementations that attach
          // date metadata in the parent CalendarList.
          onPress?.(date);
          handleDayPress(date);
        }}
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          backgroundColor: isMarked ? marking.color : 'transparent',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: isMarked ? marking.color : 'transparent',
          }}
        >
          <Text
            style={{
              color: isMarked ? '#ffffff' : state === 'disabled' ? '#d9e1e8' : '#2d4150',
              fontSize: 16,
            }}
          >
            {date?.day}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleVisibleMonthsChange = (months) => {
    ;
  };

  return (
    <CalendarList
      theme={{
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
        textDisabledColor: '#dd99ee',
      }}
      // The period renderer uses a different native touch wrapper for marked
      // days and drops presses on today's one-off occurrence on iOS. The
      // custom day below keeps the same filled visual marker without relying
      // on that renderer.
      markingType={'dot'}
      markedDates={markedDates}
      dayComponent={renderDay}
      showScrollIndicator={false}
      current={new Date().toISOString().split('T')[0]}
      onDayPress={handleDayPress}
      firstDay={1}
      staticHeader={true}
      scrollEnabled={true}
      style={{
        height: '93%',
        width: '100%',
        backgroundColor: '#fff',
      }}
      horizontal={false}
      pagingEnabled={false}
      onVisibleMonthsChange={handleVisibleMonthsChange}
      minDate={currentDate} 
      maxDate={nextYearCurrentDate} 
      pastScrollRange={0} 
      futureScrollRange={12} 
    />
  );
};

export default YearCalender;
