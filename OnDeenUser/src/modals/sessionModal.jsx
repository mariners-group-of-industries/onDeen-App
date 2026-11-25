import React, {useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import RNCalendarEvents from 'react-native-calendar-events';
import { fontFamilies } from '../assets/fonts/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from '../assets/svg/video.svg';
import Component from '../assets/svg/Component.svg';
import TouchableLabel from '../components/customLabels';
import { useNavigation } from '@react-navigation/native';
import { formatSessionTime } from '../timezone/maintimezone';
import OnetoOneMeetLink from '../screens/FirstEventDetailsPage/OnetoOneMeetLink';
import { useToastForPopup } from '../context/ToastContext';
import { updateStatusRequestBuddy } from '../redux/callapis/CommonService';
import {buildOneToOneCalendarEvent} from '../screens/AddToCalendar/deviceCalendarEvent';

const CALENDAR_ACCESS = new Set(['authorized', 'fullAccess', 'writeOnly']);

const defaultImage =
  'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', // Mon
    day: '2-digit', // 27
    month: 'short', // Aug
    year: 'numeric', // 2024
  });
};


const SessionDetailsModal = ({
  visible,
  session,
  onClose,
}) => {
  const navigation = useNavigation();
  const showToast = useToastForPopup();
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  if (!session) return null;

  const findWritableCalendar = async () => {
    const calendars = (await RNCalendarEvents.findCalendars()) || [];
    const writable = calendars.filter(calendar => calendar.allowsModifications !== false);
    return writable.find(calendar => calendar.isPrimary) || writable[0] || null;
  };

  const addSessionToCalendar = async () => {
    if (isAddingToCalendar) return;
    setIsAddingToCalendar(true);
    try {
      let permission = await RNCalendarEvents.checkPermissions();
      if (!CALENDAR_ACCESS.has(permission)) {
        permission = await RNCalendarEvents.requestPermissions();
      }
      if (!CALENDAR_ACCESS.has(permission)) {
        Alert.alert('Permission Required', 'Please enable calendar permissions', [
          {text: 'Cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ]);
        return;
      }

      const calendar = await findWritableCalendar();
      if (!calendar) {
        Alert.alert('Calendar unavailable', 'No writable calendar is configured on this device.');
        return;
      }

      const mapped = buildOneToOneCalendarEvent(session);
      let alreadySaved = false;
      try {
        const events = await RNCalendarEvents.fetchAllEvents(
          mapped.details.startDate,
          mapped.details.endDate,
          [calendar.id],
        );
        alreadySaved = events.some(event =>
          `${event?.notes || ''}\n${event?.description || ''}`.includes(mapped.marker),
        );
      } catch {
        // The duplicate lookup is defensive; saving can still work without it.
      }

      if (alreadySaved) {
        showToast(`This session is already in ${calendar.title || 'your calendar'}`);
        return;
      }

      await RNCalendarEvents.saveEvent(mapped.title, {
        ...mapped.details,
        calendarId: calendar.id,
      });
      showToast(`Session added to ${calendar.title || 'your calendar'}`);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Could not add session to calendar');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const updateStatusRequestBuddyMethod = async () => {

    try {
      const data = { "id": session?.id, "action": "cancel" };

      const resultAction = await updateStatusRequestBuddy({ data });
      if (resultAction?.status) {
        showToast(resultAction?.message || 'Cancelled successfully');
        onClose()
      } else {
        showToast(resultAction?.message || 'Failed');
      }
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Unexpected error');
    }
  }


  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={styles.modal}>
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>
          Session with {session.speaker_first_name} {session.speaker_last_name}
        </Text>
        <Text style={[styles.speakerTitle, { marginTop: 20 }]}>Speaker’s information</Text>
        <View style={styles.speakerRow}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Image
              source={{ uri: session.speaker_image || defaultImage }}
              style={styles.profileImage}
            />
            {/* <BackImageWithFallback
              imageurl={session.speaker_image}
              style={styles.profileImage}
            /> */}
            <View style={{ bottom: 11, left: 6 }}>
              <Component />
            </View>
          </View>
          <View style={{ marginTop: -10 }}>
            <Text style={styles.speakerName}>
              {session.speaker_first_name} {session.speaker_last_name}
            </Text>
            <Text style={[styles.speakerTitle, { marginBottom: 0 }]}>
              {session.speaker_email || 'No email available'}
            </Text>
          </View>
        </View>

        <View style={[styles.section]}>
          <Text style={[styles.speakerTitle, {}]}>
            Session Information
          </Text>
          <View style={styles.infoRow}>
            <View>
              <Text style={[styles.speakerTitle, { marginBottom: 0 }]}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(session.date)}</Text>
            </View>
            <View>
              <Text style={[styles.speakerTitle, { marginBottom: 0 }]}>Time</Text>
              <Text style={styles.infoValue}>
                {formatSessionTime(session?.date, session?.time, session?.time_zone)}
              </Text>
            </View>
          </View>
        </View>

        {session.meet_link ? (
          <View style={styles.section}>
            <Text
              style={[
                styles.speakerTitle,
                { marginBottom: 0, color: '#161616' },
              ]}>
              Meeting Link
            </Text>
            {
              session?.meet_link &&
              <OnetoOneMeetLink meetLink={session?.meet_link} />
            }
            <View style={styles.meetingRow}>
              <Video />
              <Text style={styles.meetLabel}>Join Meeting</Text>
            </View>
          </View>
        ) :
          <View style={styles.meetingRow}>
            <Text style={styles.meetLabel}>
              {session?.location || (
                session?.status == 0
                  ? 'Pending approval'
                  : session?.status == 3
                    ? 'Approved — awaiting details'
                    : session?.status == 5
                      ? 'Reschedule requested'
                      : 'No Meet link'
              )}
            </Text>
          </View>
        }

        {[1, 3].includes(Number(session?.status)) ? (
          <TouchableLabel
            accessibilityLabel="Add one-to-one session to calendar"
            containerStyle={styles.calendarButton}
            disabled={isAddingToCalendar}
            label={isAddingToCalendar ? 'Adding to calendar…' : `Add to ${Platform.OS === 'ios' ? 'Calendar' : 'Google Calendar'}`}
            onPress={addSessionToCalendar}
            labelStyle={styles.calendarButtonText}
          />
        ) : null}

        <View style={styles.buttonContainer}>
          <View>
            <TouchableLabel
              containerStyle={styles.cancelButton}
              label="Cancel session"
              onPress={() => updateStatusRequestBuddyMethod()}
              labelStyle={styles.cancelButtonText}
            />
          </View>
          <View>
            <TouchableLabel
              containerStyle={styles.cancelButton}
              label="Reschedule session"
              onPress={() => {
                onClose();
                navigation.navigate('Session', {
                  isRequestSession: true,
                  sessionId: session?.id,
                  speakerId: session?.speaker_id,
                  eventId: session?.event_id,
                });
              }}
              labelStyle={styles.cancelButtonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FDFBFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // maxHeight: '98%',
    paddingHorizontal: 34,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  closeButton: {
    position: 'absolute',
    left: 24,
    top: 30,
  },
  closeText: {
    fontSize: 22,
  },
  title: {
    fontSize: 16,
    lineHeight: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    marginBottom: 16,
    color: '#000000',
    paddingTop: 36,
    paddingLeft: 24,
  },
  speakerTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    marginBottom: 16,
    color: '#000000',
    // paddingLeft: 24,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E2F2',
    paddingVertical: 16,
    paddingTop: 0,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 32,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  speakerName: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 20
  },
  speakerEmail: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9E2F2',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 16,
  },
  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },

  meetLabel: {
    fontSize: 12,
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginBottom: 40,
    gap: 14,
  },
  calendarButton: {
    alignItems: 'center',
    backgroundColor: '#3E146F',
    borderRadius: 90,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  calendarButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
  },
  cancelButton: {
    borderRadius: 90,
    // height: 48,
    minWidth: 135,
    borderWidth: 1,
    borderColor: '#3E146F',
    backgroundColor: '#FDFBFF',
    paddingHorizontal: 20,
    paddingVertical: 10,

  },
  cancelButtonText: {
    color: '#3E146F',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    // lineHeight:15
  },
});

export default SessionDetailsModal;
