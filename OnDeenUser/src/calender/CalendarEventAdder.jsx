import React from 'react';
import { View, Button, StyleSheet, Alert, Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';

const CalendarEventAdder = ({ onEventAdded }) => {
  const requestCalendarPermission = async () => {
    if (Platform.OS === 'android') {
      const statuses = await requestMultiple([
        PERMISSIONS.ANDROID.READ_CALENDAR,
        PERMISSIONS.ANDROID.WRITE_CALENDAR
      ]);
      return (
        statuses[PERMISSIONS.ANDROID.READ_CALENDAR] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.WRITE_CALENDAR] === RESULTS.GRANTED
      );
    } else if (Platform.OS === 'ios') {
      const status = await RNCalendarEvents.authorizationStatus();
      return status === 'authorized';
    }
    return false;
  };

  const addEventToCalendar = async (date, title) => {
    try {
      const hasPermission = await requestCalendarPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please enable calendar permissions in settings.');
        return;
      }

      // Get available calendars and select the first writable one
      const calendars = await RNCalendarEvents.findCalendars();
      const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No writable calendars found');
        return;
      }

      const currentYear = new Date().getFullYear();
      const startDate = new Date(`${currentYear}-${date}T10:00:00`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

      const eventConfig = {
        calendarId: defaultCalendar.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: 'Added from my React Native app',
        alarms: [
          {
            date: -1 // 1 minute before
          }
        ]
      };

      const eventId = await RNCalendarEvents.saveEvent(title, eventConfig);
      
      Alert.alert('Success', `"${title}" added to ${defaultCalendar.title} calendar!`);
      if (onEventAdded) onEventAdded();
    } catch (error) {
      console.error('Event creation failed:', error);
      Alert.alert('Error', `Failed to create event: ${error.message}`);
    }
  };

  const events = [
    { date: '08-12', title: 'Meeting on Aug 12' },
    { date: '08-13', title: 'Conference on Aug 13' },
    { date: '10-14', title: 'Appointment on Oct 14' }
  ];

  return (
    <View style={styles.container}>
      {events.map((event, i) => (
        <View key={i} style={styles.buttonContainer}>
          <Button
            title={`Add ${event.title}`}
            onPress={() => addEventToCalendar(event.date, event.title)}
            color="#6200ee"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  buttonContainer: { marginVertical: 10 },
});

export default CalendarEventAdder;