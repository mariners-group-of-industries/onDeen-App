import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';

const CalendarDataList = () => {
  const [calendars, setCalendars] = useState([]);

  // Request calendar permissions
  const requestCalendarPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const statuses = await requestMultiple([
          PERMISSIONS.ANDROID.READ_CALENDAR,
          PERMISSIONS.ANDROID.WRITE_CALENDAR
        ]);

        return (
          statuses[PERMISSIONS.ANDROID.READ_CALENDAR] === RESULTS.GRANTED &&
          statuses[PERMISSIONS.ANDROID.WRITE_CALENDAR] === RESULTS.GRANTED
        );
      } else {
        const status = await RNCalendarEvents.authorizationStatus();
        if (status !== 'authorized') {
          const auth = await RNCalendarEvents.authorizeEventStore();
          return auth === 'authorized';
        }
        return true;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const fetchCalendars = async () => {
    const hasPermission = await requestCalendarPermission();

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow calendar access in settings.');
      return;
    }

    try {
      const calendarList = await RNCalendarEvents.findCalendars();
      setCalendars(calendarList);
      console.log('Calendars:', calendarList);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      Alert.alert('Error', 'Unable to fetch calendars');
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Available Calendars</Text>
      <FlatList
        data={calendars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.details}>ID: {item.id}</Text>
            <Text style={styles.details}>Type: {item.type}</Text>
            <Text style={styles.details}>Writable: {item.allowsModifications ? 'Yes' : 'No'}</Text>
            {item.isPrimary !== undefined && (
              <Text style={styles.details}>Primary: {item.isPrimary ? 'Yes' : 'No'}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No calendars found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#555' },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16 }
});

export default CalendarDataList;
