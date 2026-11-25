import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import TouchableLabel from '../../../components/customLabels';
import LinearGradient from 'react-native-linear-gradient';
import CountdownTimer from '../../../components/CountdownTimer';
import { getDatewithmonthname } from '../../../common/datetimeformate';
import EventGraph from '../../../components/EventGraph';
import Calendar from '../../../assets/svg/blackcalendar.svg';
import Share from '../../../assets/svg/share.svg';
import ParticipantImages from '../../../common/ParticipantImages';
import SpeakerList from './SpeakerList';
import LocationMap from './LocationMap';
import Curriculum from './Curriculum';
import Itineraries from './Itineraries';
import RulesandEligibility from './RulesandEligibility';
import CarouselComponent from './CarouselComponent';
import EventTages from './EventTages';
import Feather from 'react-native-vector-icons/Feather';
import RenderHtmlCustome from '../../../common/RenderHtmlCustome';
import { apiRequest } from '../../../services/api';
import { showResponce } from '../../../responce/showResponce';

const DetailsScreen = ({ eventbyid, onRefreshEvent, sessionDate }) => {
  const navigation = useNavigation();
  const { width: screenWidth } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const [onlineCode, setOnlineCode] = useState(null);
  const [onlineCodeLoading, setOnlineCodeLoading] = useState(false);
  const [localTitle, setLocalTitle] = useState(eventbyid?.title || '');
  const [titleDraft, setTitleDraft] = useState(eventbyid?.title || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [guestBookingEnabled, setGuestBookingEnabled] = useState(true);
  const [savingGuestSetting, setSavingGuestSetting] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const token = useSelector((state) => state.token.token?.access_token);
  const bearerToken = useSelector((state) => state.user.loginToken);
  const MINIMUM_LINES = 2;

  const movetoEventDetails = () => {
    const checkInEnabled = Number(eventbyid?.category_id) !== 2
      || Number(eventbyid?.swipe_checkin) === 1;
    navigation.navigate('Participants', {
      id: eventbyid?.id,
      checkInEnabled,
    });
  };

  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const loadOnlineCode = useCallback(async (regenerate = false) => {
    if (!eventbyid?.id || ![0, 2].includes(Number(eventbyid?.location_type))) {
      return;
    }

    try {
      setOnlineCodeLoading(true);
      const response = await apiRequest({
        url: '/organizer_app/event/online_checkin_code',
        method: 'POST',
        data: {
          event_id: eventbyid.id,
          regenerate,
        },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });

      if (response?.status) {
        setOnlineCode(response?.response);
        if (regenerate) {
          showResponce('Online check-in code regenerated.', 1);
        }
      } else {
        showResponce(response?.response?.message || response?.message || 'Unable to load online code.', 3);
      }
    } catch (error) {
      showResponce('Unable to load online code.', 3);
    } finally {
      setOnlineCodeLoading(false);
    }
  }, [eventbyid?.id, eventbyid?.location_type, token, bearerToken]);

  useEffect(() => {
    if ([0, 2].includes(Number(eventbyid?.location_type))) {
      loadOnlineCode(false);
    } else {
      setOnlineCode(null);
    }
  }, [eventbyid?.id, eventbyid?.location_type, loadOnlineCode]);

  useEffect(() => {
    setLocalTitle(eventbyid?.title || '');
    setTitleDraft(eventbyid?.title || '');
    setEditingTitle(false);
    setGuestBookingEnabled(eventbyid?.guest_booking_enabled === false || eventbyid?.guest_booking_enabled === 0 ? false : true);
  }, [eventbyid?.id, eventbyid?.title, eventbyid?.guest_booking_enabled]);

  const saveTitle = useCallback(async () => {
    const title = titleDraft.trim();
    if (!eventbyid?.id || savingTitle) {
      return;
    }
    if (title.length < 3) {
      showResponce('Event title must be at least 3 characters.', 3);
      return;
    }

    try {
      setSavingTitle(true);
      const response = await apiRequest({
        url: '/organizer_app/event/update_title',
        method: 'POST',
        data: {
          event_id: eventbyid.id,
          title,
        },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });

      if (response?.status) {
        setLocalTitle(response?.response?.title || title);
        setTitleDraft(response?.response?.title || title);
        setEditingTitle(false);
        showResponce('Event title updated.', 1);
        onRefreshEvent?.();
      } else {
        showResponce(response?.response?.message || response?.message || 'Unable to update event title.', 3);
      }
    } catch (error) {
      showResponce('Unable to update event title.', 3);
    } finally {
      setSavingTitle(false);
    }
  }, [bearerToken, eventbyid?.id, onRefreshEvent, savingTitle, titleDraft, token]);

  const updateGuestBookingSetting = useCallback(async (enabled) => {
    if (!eventbyid?.id || savingGuestSetting) {
      return;
    }
    const previous = guestBookingEnabled;
    setGuestBookingEnabled(enabled);
    try {
      setSavingGuestSetting(true);
      const response = await apiRequest({
        url: '/organizer_app/event/guest_booking_setting',
        method: 'POST',
        data: {
          event_id: eventbyid.id,
          enabled,
        },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });

      if (response?.status) {
        setGuestBookingEnabled(response?.response?.guest_booking_enabled === false ? false : true);
        showResponce(enabled ? 'Guest booking enabled.' : 'Guest booking disabled.', 1);
        onRefreshEvent?.();
      } else {
        setGuestBookingEnabled(previous);
        showResponce(response?.response?.message || response?.message || 'Unable to update guest booking.', 3);
      }
    } catch (error) {
      setGuestBookingEnabled(previous);
      showResponce('Unable to update guest booking.', 3);
    } finally {
      setSavingGuestSetting(false);
    }
  }, [bearerToken, eventbyid?.id, guestBookingEnabled, onRefreshEvent, savingGuestSetting, token]);

  const tags = Array.isArray(eventbyid?.tags) ? eventbyid.tags : [];
  const speakers = Array.isArray(eventbyid?.speakers) ? eventbyid.speakers : [];

  const closeAnnouncement = (force = false) => {
    if (savingAnnouncement && !force) {
      return;
    }
    setAnnouncementVisible(false);
    setAnnouncementTitle('');
    setAnnouncementMessage('');
  };

  const sendAnnouncement = async () => {
    const message = announcementMessage.trim();
    if (!eventbyid?.id || savingAnnouncement) {
      return;
    }
    if (!message) {
      showResponce('Announcement message is required.', 3);
      return;
    }

    try {
      setSavingAnnouncement(true);
      const response = await apiRequest({
        url: '/organizer_app/event/announcement',
        method: 'POST',
        data: {
          event_id: eventbyid.id,
          title: announcementTitle.trim() || localTitle || eventbyid.title,
          message,
        },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
        showResponce('Announcement sent to booked attendees.', 1);
        closeAnnouncement(true);
      } else {
        showResponce(response?.response?.message || 'Unable to send announcement.', 3);
      }
    } catch (error) {
      showResponce('Unable to send announcement.', 3);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.detailsContainer, {
          backgroundColor: '#fff', borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }]}>
          <CarouselComponent eventbyid={eventbyid} />
          <EventTages tags={tags} eventbyid={eventbyid} />
          <View style={styles.titleManagementCard}>
            <View style={styles.titleManagementHeader}>
              <Text style={styles.titleManagementLabel}>EVENT TITLE</Text>
              {!editingTitle ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setEditingTitle(true)}
                  style={styles.titleEditButton}
                >
                  <Text style={styles.titleEditButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {editingTitle ? (
              <>
                <TextInput
                  value={titleDraft}
                  onChangeText={setTitleDraft}
                  placeholder="Event title"
                  placeholderTextColor="#8D8595"
                  style={styles.titleInput}
                  selectTextOnFocus
                  maxLength={255}
                  editable={!savingTitle}
                />
                <View style={styles.titleActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setTitleDraft(localTitle);
                      setEditingTitle(false);
                    }}
                    disabled={savingTitle}
                    style={[styles.titleSecondaryButton, savingTitle && styles.titleButtonDisabled]}
                  >
                    <Text style={styles.titleSecondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={saveTitle}
                    disabled={savingTitle}
                    style={[styles.titlePrimaryButton, savingTitle && styles.titleButtonDisabled]}
                  >
                    {savingTitle ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.titlePrimaryButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.eventName}>{localTitle || eventbyid?.title}</Text>
            )}
            <View style={styles.guestBookingRow}>
              <View style={styles.guestBookingCopy}>
                <Text style={styles.guestBookingTitle}>Guest booking</Text>
                <Text style={styles.guestBookingHint}>Allow one-off event guests to book without signing in.</Text>
              </View>
              {savingGuestSetting ? (
                <ActivityIndicator size="small" color="#3E146F" />
              ) : (
                <Switch
                  value={guestBookingEnabled}
                  onValueChange={updateGuestBookingSetting}
                  trackColor={{ false: '#DFD7E8', true: '#EBDDFB' }}
                  thumbColor={guestBookingEnabled ? '#3E146F' : '#FFFFFF'}
                />
              )}
            </View>
          </View>
          <View style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementCopy}>
                <Text style={styles.announcementLabel}>ANNOUNCEMENTS</Text>
                <Text style={styles.announcementHint}>Send a listing update to booked attendees.</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Send announcement"
                accessibilityRole="button"
                activeOpacity={0.75}
                onPress={() => setAnnouncementVisible(true)}
                style={styles.announcementButton}
              >
                <Text style={styles.announcementButtonText}>New</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <View style={styles.dateSubContainer}>
              <Calendar width={16} height={16} />
              <Text
                accessibilityLabel={sessionDate ? `Selected session ${getDatewithmonthname(sessionDate)}` : undefined}
                style={styles.carouselDate}
              >
                {getDatewithmonthname(sessionDate || eventbyid?.start_date)}
              </Text>
            </View>
            <View style={styles.dateSubContainer}>
              <CountdownTimer startDate={eventbyid?.start_date} />
            </View>
          </View>

          {[0, 2].includes(Number(eventbyid?.location_type)) && (
            <View style={styles.onlineCodeCard}>
              <View style={styles.onlineCodeHeader}>
                <View>
                  <Text style={styles.onlineCodeEyebrow}>ONLINE SESSION CODE</Text>
                  <Text style={styles.onlineCodeHint}>Share this with attendees during the session.</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => loadOnlineCode(true)}
                  disabled={onlineCodeLoading}
                  style={[styles.onlineCodeButton, onlineCodeLoading && styles.onlineCodeButtonDisabled]}
                >
                  <Text style={styles.onlineCodeButtonText}>
                    {onlineCodeLoading ? 'Loading' : 'Regenerate'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.onlineCodeValue} selectable>
                {onlineCode?.code || '------'}
              </Text>
              {onlineCode?.session_date ? (
                <Text style={styles.onlineCodeDate}>For {onlineCode.session_date}</Text>
              ) : null}
            </View>
          )}

          {Array.isArray(eventbyid?.participant_images) && eventbyid?.participant_images.length > 0 && (
            <>
              <View style={styles.organizeContainer}>
                <Text style={styles.organizedText}>Participants:</Text>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
                  <ParticipantImages item={eventbyid} />
                  <View style={styles.infoBtnContainer}>
                    <LinearGradient
                      colors={['#DB3171', '#FFCC33']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.gradientBorder}>
                      <TouchableLabel
                        label={'VIEW INFO'}
                        accessibilityLabel="View participants"
                        onPress={movetoEventDetails}
                        containerStyle={styles.viewallContainer}
                        labelStyle={styles.viewallLabel}
                      />
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.aboutEventConatiner}>
            <Text style={styles.organizedText}>About event</Text>
            <RenderHtmlCustome text={eventbyid?.description} />
          </View>
        </View>

        <View style={[styles.detailsContainer, {}]}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Registration Trends</Text>
            <EventGraph item={eventbyid?.get_participant_count_by_event_and_date} />
          </View>
        </View>

        {[1, 2].includes(Number(eventbyid?.location_type)) && (
          <View style={[styles.detailsContainer, {}]}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Event location</Text>
              <View style={[styles.locationSubContainer, { marginTop: 5, marginBottom: -5 }]}>
                <View style={{ flexDirection: 'row', width: '70%' }}>
                  <Feather style={styles.locationIcon} name="map-pin" size={16} color={'#161616'} />
                  <Text style={[styles.addressText, { paddingLeft: 5, marginTop: -5 }]}>
                    {eventbyid?.location}
                  </Text>
                </View>
                <Share name="map-pin" />
              </View>
              <View style={styles.maps}>
                <LocationMap eventbyid={eventbyid} />
              </View>
            </View>
          </View>
        )}

        <SpeakerList eventbyid={eventbyid} />
        <Curriculum curriculum={eventbyid?.curriculum} />
        <Itineraries itineraries={eventbyid?.itineraries} />
        <RulesandEligibility eventbyid={eventbyid} />
      </ScrollView>
      <Modal
        visible={announcementVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAnnouncement}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.announcementBackdrop}>
            <View style={styles.announcementModal}>
            <Text style={styles.announcementModalTitle}>New announcement</Text>
            <Text style={styles.announcementModalHint}>Booked attendees will receive an Inbox notification and push when enabled.</Text>
            <TextInput
              value={announcementTitle}
              onChangeText={setAnnouncementTitle}
              placeholder="Title (optional)"
              placeholderTextColor="#8D8595"
              style={styles.announcementInput}
              editable={!savingAnnouncement}
              maxLength={120}
            />
            <TextInput
              value={announcementMessage}
              onChangeText={setAnnouncementMessage}
              placeholder="Write your announcement"
              placeholderTextColor="#8D8595"
              style={[styles.announcementInput, styles.announcementMessageInput]}
              editable={!savingAnnouncement}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <View style={styles.announcementActions}>
              <TouchableOpacity
                onPress={closeAnnouncement}
                disabled={savingAnnouncement}
                style={styles.announcementCancelButton}
              >
                <Text style={styles.announcementCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={sendAnnouncement}
                disabled={savingAnnouncement}
                style={styles.announcementSendButton}
              >
                {savingAnnouncement ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.announcementSendText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default DetailsScreen;
