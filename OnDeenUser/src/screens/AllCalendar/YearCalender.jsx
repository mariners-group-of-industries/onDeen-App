import React, { useState } from 'react';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { FlatList, Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { currentDate, nextYearCurrentDate } from '../../components/datetimeformate';
import { fontFamilies } from '../../assets/fonts/fonts';
import { getEventsForDate } from './filtercalenderDate';
import { formatTimeOnly } from '../../timezone/maintimezone';

LocaleConfig.locales['ondeen-en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'ondeen-en';

const YearCalender = ({ filteredData = [], setData, setSelectdate, onVisibleMonthChange }) => {
  const navigation = useNavigation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectdate(selectedDate)
    const selectedMonth = new Date(selectedDate).getMonth();
    const selectedYear = new Date(selectedDate).getFullYear();
    const eventsForDate = getEventsForDate(filteredData, selectedDate);

    if (eventsForDate.length > 0) {
      const eventData = eventsForDate[0];
      setData({
        ...eventData,
        date: selectedDate,
        month: selectedMonth + 1,
        year: selectedYear
      });
      setSelectedDate(selectedDate);
      setSelectedEvents(eventsForDate);
      setSheetVisible(true);
    }
  };

  const openBookedEvent = (event) => {
    setSheetVisible(false);
    navigation.navigate('BookingDetails', {
      id: event?.id,
      participant_id: event?.participant_id,
    });
  };

  const formatDateTitle = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(value));
  };

  const renderEvent = ({ item }) => {
    const time = item?.start_time
      ? formatTimeOnly(item.start_time, item.time_zone, 'time-only')
      : '';

    return (
      <TouchableOpacity
        activeOpacity={0.78}
        style={styles.sheetEvent}
        onPress={() => openBookedEvent(item)}
      >
        <View style={styles.sheetEventDot} />
        <View style={styles.sheetEventBody}>
          <Text numberOfLines={2} style={styles.sheetEventTitle}>{item?.title || 'Booked event'}</Text>
          {time ? <Text style={styles.sheetEventTime}>{time}</Text> : null}
        </View>
        <Text style={styles.sheetEventArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = date => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[date.getMonth()];

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{`${monthName} ${date.getFullYear()}`}</Text>
      </View>
    );
  };

  const renderDayComponentForCalendarList = ({ date, state }) => {
    const eventsForCurrentDate = getEventsForDate(filteredData, date?.dateString);
    const isToday = date?.dateString === new Date().toISOString().split('T')[0];

    return (
      <TouchableOpacity onPress={() => handleDayPress(date)} style={styles.dayContainer}>
        <Text style={[
          styles.dayText,
          state === 'disabled' && styles.disabledDayText,
          isToday && styles.todayText,
        ]}>
          {date?.day}
        </Text>
        {eventsForCurrentDate?.length > 0 && (
          <View style={styles.eventIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <CalendarList
        theme={{
          backgroundColor: '#F9F6FD',
          calendarBackground: '#F9F6FD',
          textSectionTitleColor: '#17101F',
          textDayHeaderFontFamily: fontFamilies.SFProRoundedBlackMedium,
          textDayHeaderFontSize: 12,
          weekVerticalMargin: 6,
        }}
        firstDay={0}
        markingType={'period'}
        showScrollIndicator={false}
        current={new Date().toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        staticHeader={true}
        scrollEnabled={true}
        horizontal={false}
        pagingEnabled={false}
        minDate={currentDate}
        maxDate={nextYearCurrentDate}
        pastScrollRange={0}
        futureScrollRange={12}
        calendarHeight={350}
        onVisibleMonthsChange={(months) => {
          const firstVisibleMonth = months?.[0]?.dateString;
          if (!firstVisibleMonth || !onVisibleMonthChange) {
            return;
          }
          onVisibleMonthChange(new Intl.DateTimeFormat('en-GB', {
            month: 'long',
            year: 'numeric',
          }).format(new Date(firstVisibleMonth)));
        }}
        renderHeader={renderHeader}
        style={styles.calendarContainer}
        dayComponent={renderDayComponentForCalendarList}
      />
      <Modal
        animationType="slide"
        transparent
        visible={sheetVisible}
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSheetVisible(false)}>
          <Pressable style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetLabel}>BOOKED EVENTS</Text>
            <Text style={styles.sheetTitle}>{formatDateTitle(selectedDate)}</Text>
            <FlatList
              data={selectedEvents}
              keyExtractor={(item, index) => `${item?.id || 'event'}-${item?.participant_id || index}`}
              renderItem={renderEvent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetList}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F9F6FD',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#F9F6FD',
  },
  headerText: {
    fontSize: 18,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    color: '#070707',
    textAlign: 'left',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
  },
  todayText: {
    color: '#DB3171',
  },
  disabledDayText: {
    color: '#666166',
  },
  eventIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#DB3171',
    borderRadius: 8,
    marginTop: 2,
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.24)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '54%',
    minHeight: '34%',
    paddingBottom: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#DED8E1',
    borderRadius: 999,
    height: 5,
    marginBottom: 18,
    width: 46,
  },
  sheetLabel: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 12,
    letterSpacing: 1.8,
    lineHeight: 18,
  },
  sheetTitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 22,
    lineHeight: 29,
    marginTop: 4,
  },
  sheetList: {
    paddingTop: 18,
  },
  sheetEvent: {
    alignItems: 'center',
    backgroundColor: '#F9F6FD',
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetEventDot: {
    backgroundColor: '#DB3171',
    borderRadius: 8,
    height: 12,
    marginRight: 13,
    width: 12,
  },
  sheetEventBody: {
    flex: 1,
  },
  sheetEventTitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  sheetEventTime: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  sheetEventArrow: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 30,
    lineHeight: 34,
    marginLeft: 10,
  },
});

export default YearCalender;
