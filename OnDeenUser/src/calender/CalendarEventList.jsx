import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';

const CalendarEventList = ({ refreshKey }) => {
  const [events, setEvents] = useState([]);

  const requestCalendarPermission = async () => {
    if (Platform.OS !== 'android') return false;
    const statuses = await requestMultiple([
      PERMISSIONS.ANDROID.READ_CALENDAR,
      PERMISSIONS.ANDROID.WRITE_CALENDAR
    ]);
    return (
      statuses[PERMISSIONS.ANDROID.READ_CALENDAR] === RESULTS.GRANTED &&
      statuses[PERMISSIONS.ANDROID.WRITE_CALENDAR] === RESULTS.GRANTED
    );
  };

  const fetchEvents = async () => {
    const hasPermission = await requestCalendarPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow calendar access.');
      return;
    }

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // last month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // next 3 months

      const eventList = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );

      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Unable to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Calendar Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.details}>
              {new Date(item.startDate).toLocaleString()} - {new Date(item.endDate).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noData}>No events found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 16, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#555' },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16 }
});

export default CalendarEventList;
