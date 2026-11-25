import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import AddToCalendarModal1 from './AddToCalendarModal1';
import { useToastForPopup } from '../../context/ToastContext';

const AddToCalendar1 = forwardRef(({ eventDetail }, ref) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const showToast = useToastForPopup();

    useImperativeHandle(ref, () => ({
        openModel: () => {
            if (Platform.OS === 'android') setModalVisible(true);
            else Alert.alert('Unavailable', 'Calendar integration is available only on Android.');
        },
    }));

    const formatDate = (dateString) => {
        if (!dateString || isNaN(Date.parse(dateString))) return '';
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    };

    const formatForCalendar = (dateString, timeString) => {
        if (!dateString) return new Date().toISOString();
        const date = new Date(dateString);
        if (timeString) {
            const [hours, minutes] = timeString.split(':');
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        }
        return date.toISOString();
    };

    const requestCalendarPermission = async () => {
        try {
            const statuses = await requestMultiple([
                PERMISSIONS.ANDROID.READ_CALENDAR,
                PERMISSIONS.ANDROID.WRITE_CALENDAR,
            ]);
            return (
                statuses[PERMISSIONS.ANDROID.READ_CALENDAR] === RESULTS.GRANTED &&
                statuses[PERMISSIONS.ANDROID.WRITE_CALENDAR] === RESULTS.GRANTED
            );
        } catch {
            return false;
        }
    };

    const findGoogleCalendar = async () => {
        const calendars = await RNCalendarEvents.findCalendars();
        return calendars.find(c =>
            c.allowsModifications &&
            ['google', 'gmail', 'com.google'].some(k =>
                (c.title?.toLowerCase() || '').includes(k) ||
                (c.source?.toLowerCase() || '').includes(k)
            )
        );
    };

    const handleAddToCalendar = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Unavailable', 'This feature works only on Android.');
            return;
        }

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

            const googleCalendar = await findGoogleCalendar();
            if (!googleCalendar) {
                Alert.alert('Google Calendar Not Found', 'Please install Google Calendar', [
                    { text: 'Cancel' },
                    {
                        text: 'Install',
                        onPress: () =>
                            Linking.openURL('market://details?id=com.google.android.calendar'),
                    },
                ]);
                return;
            }

            // ====== ⏰ OCCUSR_TYPE BASED NOTIFICATION HANDLING ======
            const startDate = new Date(eventDetail.start_date);
            const endDate = new Date(eventDetail.end_date);

            let eventDates = [];

            // once (type 1)
            if (eventDetail.occusr_type == 1) {
                eventDates = [startDate];
            }

            // daily (type 2)
            else if (eventDetail.occusr_type == 2) {
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    eventDates.push(new Date(d));
                }
            }

            // weekly (type 3)
            else if (eventDetail.occusr_type == 3) {
                const weekdays = eventDetail.occusr_weekday
                    ?.split(',')
                    .map(n => parseInt(n.trim()));
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const adjusted = (d.getDay() + 6) % 7; // Monday = 0
                    if (weekdays.includes(adjusted)) eventDates.push(new Date(d));
                }
            }

            // monthly (type 4)
            else if (eventDetail.occusr_type == 4) {
                if (eventDetail.occusr_month == 1) {
                    // same date each month
                    for (let m = startDate.getMonth(); m <= endDate.getMonth(); m++) {
                        const d = new Date(startDate);
                        d.setMonth(m);
                        eventDates.push(new Date(d));
                    }
                } else if (eventDetail.occusr_month == 2) {
                    // same weekday occurrence
                    eventDates.push(startDate); // simplified — can extend as needed
                }
            }

            // ====== ADD TO CALENDAR FOR EACH DATE ======
            for (const date of eventDates) {
                const eventId = await RNCalendarEvents.saveEvent(eventDetail.title, {
                    calendarId: googleCalendar.id,
                    startDate: formatForCalendar(date, eventDetail.start_time),
                    endDate: formatForCalendar(date, eventDetail.end_time),
                    location: eventDetail.location || '',
                    notes: eventDetail.description || '',
                    alarms: [{ date: -15 * 60 }], // 15 min before
                    allDay: false,
                });
            }

            showToast(`Added ${eventDates.length} event(s) to ${googleCalendar.title}`);
        } catch (error) {
            Alert.alert('Error', error.message || 'Could not add event');
        } finally {
            setIsAdding(false);
            setModalVisible(false);
        }
    };

    if (Platform.OS !== 'android') return null;

    return (
        <AddToCalendarModal1
            visible={modalVisible}
            eventDetail={eventDetail}
            isAdding={isAdding}
            onClose={() => setModalVisible(false)}
            onAddToCalendar={handleAddToCalendar}
            formatDate={formatDate}
        />
    );
});

export default AddToCalendar1;
