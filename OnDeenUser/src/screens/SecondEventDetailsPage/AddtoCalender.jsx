import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import AddToCalendarModal from './AddToCalendarModal';
import { useToastForPopup } from '../../context/ToastContext';
import { buildDeviceCalendarEvent } from '../AddToCalendar/deviceCalendarEvent';

const CALENDAR_ACCESS = new Set(['authorized', 'fullAccess', 'writeOnly']);

const AddToCalendar = forwardRef(({ eventDetail }, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const showToast = useToastForPopup();

  useImperativeHandle(ref, () => ({
    openModel: () => setModalVisible(true),
  }));

  const formatDate = (dateString) => {
    if (!dateString || isNaN(Date.parse(dateString))) return '';
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  const requestCalendarPermission = async () => {
    try {
      const current = await RNCalendarEvents.checkPermissions();
      if (CALENDAR_ACCESS.has(current)) {
        return true;
      }
      const requested = await RNCalendarEvents.requestPermissions();
      return CALENDAR_ACCESS.has(requested);
    } catch {
      return false;
    }
  };

  const findWritableCalendar = async () => {
    const calendars = (await RNCalendarEvents.findCalendars()) || [];
    const writable = calendars.filter(calendar => calendar.allowsModifications !== false);
    const sourceText = calendar => {
      const source = calendar?.source;
      return typeof source === 'string'
        ? source.toLowerCase()
        : String(source?.name || source?.title || '').toLowerCase();
    };
    const googleCalendar = writable.find(calendar =>
      ['google', 'gmail', 'com.google'].some(keyword =>
        String(calendar?.title || '').toLowerCase().includes(keyword) ||
        sourceText(calendar).includes(keyword)
      ),
    );
    return (
      (Platform.OS === 'android' ? googleCalendar : null) ||
      writable.find(calendar => calendar.isPrimary) ||
      writable[0] ||
      null
    );
  };

  const handleAddToCalendar = async () => {
    setIsAdding(true);
    try {
      const hasPermission = await requestCalendarPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please enable calendar permissions', [
          { text: 'Cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }

      const calendar = await findWritableCalendar();
      if (!calendar) {
        Alert.alert(
          'Calendar unavailable',
          'No writable calendar is configured on this device.',
        );
        return;
      }

      const mappedEvent = buildDeviceCalendarEvent(eventDetail);
      let existingEvent = null;
      try {
        const rangeEnd = mappedEvent.details.recurrenceRule?.endDate || mappedEvent.details.endDate;
        const events = await RNCalendarEvents.fetchAllEvents(
          mappedEvent.details.startDate,
          rangeEnd,
          [calendar.id],
        );
        existingEvent = events.find(event =>
          `${event?.notes || ''}\n${event?.description || ''}`.includes(mappedEvent.marker),
        );
      } catch {
        // Calendar lookup is an idempotency guard; saving may still be available.
      }

      if (existingEvent) {
        showToast(`This event is already in ${calendar.title || 'your calendar'}`);
        return;
      }

      await RNCalendarEvents.saveEvent(mappedEvent.title, {
        ...mappedEvent.details,
        calendarId: calendar.id,
      });
      showToast(
        mappedEvent.isRecurring
          ? `Recurring event series added to ${calendar.title || 'your calendar'}`
          : `Event added to ${calendar.title || 'your calendar'}`,
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not add event');
    } finally {
      setIsAdding(false);
      setModalVisible(false);
    }
  };

  return (
    <AddToCalendarModal
      visible={modalVisible}
      eventDetail={eventDetail}
      isAdding={isAdding}
      onClose={() => setModalVisible(false)}
      onAddToCalendar={handleAddToCalendar}
      formatDate={formatDate}
    />
  );
});

export default AddToCalendar;
