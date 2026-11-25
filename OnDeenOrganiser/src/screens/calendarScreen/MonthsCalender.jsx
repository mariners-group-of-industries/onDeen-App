import React, { useEffect, useState } from 'react';
import { CalendarList } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { eventOccursOnDate, markedOccurrenceDates } from './calendarOccurrence';

const MonthsCalender = ({ filteredData = [], setTab, setData, data }) => {
  const [markedDates, setMarkedDates] = useState({});
  const navigation = useNavigation();

  const dateString = data?.date;
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() returns 0-11, so we add 1
  ;


  useEffect(() => {
    setMarkedDates(markedOccurrenceDates(filteredData));
  }, [filteredData]);

  const selectedDateEvents = data?.date
    ? filteredData.filter(event => {
      if (!event?.start_date || !event?.end_date) {
        return false;
      }
      return eventOccursOnDate(event, data.date);
    })
    : [];

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    const selectedMonth = new Date(selectedDate).getMonth();
    const selectedYear = new Date(selectedDate).getFullYear();

    const eventData = (Array.isArray(filteredData) ? filteredData : []).find(event => {
      if (!event?.start_date || !event?.end_date) {
        return false;
      }
      return eventOccursOnDate(event, selectedDate);
    });

    if (eventData) {
      setData({
        ...eventData,
        date: selectedDate,
        month: selectedMonth + 1,
        year: selectedYear,
      });
      // Pass the freshly selected day explicitly. React state updates are
      // asynchronous, so reading data?.date here would reopen the previous
      // session (for example Jan 28) instead of the occurrence the organiser
      // just selected (for example Sep 9).
      movetoMainEventDetails(eventData, selectedDate);
    }
  };

  const movetoMainEventDetails = (eventData, sessionDate = data?.date) => {
    navigation.navigate('MainEventDetail', { id: eventData?.id, sessionDate });
  };

  const renderEventItem = ({ item }) => {
    const selectedSessionDate = data?.date;
    const eventDate =
      selectedSessionDate && !isNaN(Date.parse(`${selectedSessionDate}T00:00:00`))
        ? new Date(`${selectedSessionDate}T00:00:00`)
        : item?.start_date && !isNaN(Date.parse(item.start_date))
        ? new Date(item.start_date)
        : null;
    const eventEndDate =
      item?.end_date && !isNaN(Date.parse(item.end_date))
        ? new Date(item.end_date)
        : null;

    if (!eventDate) {
      return null;
    }

    const timeString = eventDate
      ? eventDate.toISOString().split('T')[1].substring(0, 5)
      : '';

    const formattedDate = eventDate
      ? `${eventDate.toLocaleString('default', {
        month: 'long',
      })} ${eventDate.getDate()}, ${eventDate.getFullYear()}`
      : '';

    const formattedEndDate = eventEndDate
      ? `${eventEndDate.toLocaleString('default', {
        month: 'long',
      })} ${eventEndDate.getDate()}, ${eventEndDate.getFullYear()}`
      : '';

    return (
      <View>
        <View
          style={{
            height: 18,
            top: 26,
            left: 12,
            width: 3,
            backgroundColor: '#DB3171',
            borderRadius: 1.5,
          }}
        />
        <TouchableOpacity
          accessibilityLabel={`Open calendar event ${item.title} on ${formattedDate}`}
          accessibilityRole="button"
          style={styles.eventItem}
          onPress={() => {
            if (
              item.start_date &&
              !isNaN(Date.parse(item.start_date)) &&
              item.end_date &&
              !isNaN(Date.parse(item.end_date))
            ) {
              movetoMainEventDetails(item, data?.date);
            } else {
              Alert.alert('Error', 'This event has invalid date information.');
            }
          }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription}>
            {formattedDate}
            {/* - {formattedEndDate} */}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>

      <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} backgroundColor={'#fff'}>
        <View style={[styles.container]}>
          <CalendarList
            theme={{
              calendarBackground: '#FFF',
            }}
            markingType={'period'}
            markedDates={markedDates}
            pastScrollRange={0}
            futureScrollRange={0}
            scrollEnabled={false}
            showScrollIndicator={false}
            current={data?.date}
            onDayPress={handleDayPress}
            firstDay={1}
            hideArrows={true}
            style={{
              backgroundColor: '#fff',
            }}
          />
          <FlatList
            data={selectedDateEvents}
            keyExtractor={item => item?.id?.toString()}
            renderItem={renderEventItem}
            ListHeaderComponent={
              <Text style={styles.currentDateText}>
                {/* Display current date or header here */}
              </Text>
            }
            ListEmptyComponent={
              <Text style={styles.noEventsText}>No events for the day</Text>
            }
          />
        </View >
      </ScrollView>
    </>

  );
};

export default MonthsCalender;
