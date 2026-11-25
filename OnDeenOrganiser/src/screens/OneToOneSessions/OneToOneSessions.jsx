import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment-timezone';

import CustomHeader from '../../components/customHeader';
import {
  clearOneToOneError,
  fetchOneToOneSessions,
  updateOneToOneSession,
} from '../../redux/slices/oneToOneSessionsSlice';
import {
  SESSION_BUCKETS,
  sessionStatusLabel,
  sessionsForBucket,
} from './sessionLifecycle';
import AvailabilityEditor from './AvailabilityEditor';
import {getallmastereventListing} from '../../redux/slices/getallmastereventListing';

const formatSessionTime = session => {
  const source = session?.time_zone || 'UTC';
  const value = `${session?.date} ${session?.time}`;
  const parsed = moment.tz(value, 'YYYY-MM-DD HH:mm:ss', source);
  return parsed.isValid() ? parsed.tz(moment.tz.guess()).format('ddd, D MMM YYYY · hh:mm A') : value;
};

const OneToOneSessions = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {data, status, updateStatus, error} = useSelector(state => state.oneToOneSessions);
  const [bucket, setBucket] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [locationType, setLocationType] = useState(0);
  const [meetLink, setMeetLink] = useState('');
  const [location, setLocation] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const {getmasterdata} = useSelector(state => state.getmasterdata);

  const load = useCallback(() => dispatch(fetchOneToOneSessions()), [dispatch]);
  useFocusEffect(useCallback(() => {
    load();
  }, [load]));
  useEffect(() => {
    if (!getmasterdata?.speakers?.length) {
      dispatch(getallmastereventListing());
    }
  }, [dispatch, getmasterdata?.speakers?.length]);

  const visibleSessions = useMemo(
    () => sessionsForBucket(data, bucket),
    [bucket, data],
  );

  const openSession = session => {
    dispatch(clearOneToOneError());
    setSelected(session);
    setLocationType(Number(session?.location_type ?? 0));
    setMeetLink(session?.meet_link || '');
    setLocation(session?.location || '');
    setStatusReason(session?.status_reason || '');
    setSessionDate(session?.date || '');
    setSessionTime(String(session?.time || '').slice(0, 5));
  };

  const closeSession = () => {
    setSelected(null);
    dispatch(clearOneToOneError());
  };

  const mutate = async (action, extra = {}) => {
    try {
      await dispatch(updateOneToOneSession({
        id: selected.id,
        action,
        ...(statusReason ? {status_reason: statusReason} : {}),
        ...extra,
      })).unwrap();
      await dispatch(fetchOneToOneSessions()).unwrap();
      closeSession();
      if (action === 'approve' || action === 'confirm') {
        setBucket('confirmed');
      } else if (action === 'complete') {
        setBucket('completed');
      } else if (action === 'decline' || action === 'cancel') {
        setBucket('cancelled');
      }
    } catch (_) {
      // The persisted Redux error is rendered in the modal.
    }
  };

  const confirmDetails = () => mutate('confirm', {
    location_type: locationType,
    meet_link: locationType === 1 ? '' : meetLink.trim(),
    location: locationType === 0 ? '' : location.trim(),
    date: sessionDate.trim(),
    time: sessionTime.trim(),
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="One-to-One Sessions"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.availabilityBanner}>
        <View style={styles.availabilityCopy}>
          <Text style={styles.availabilityTitle}>Speaker availability</Text>
          <Text style={styles.availabilityHint}>Days, slots, duration and unavailable dates</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Configure one-to-one availability"
          onPress={() => setAvailabilityVisible(true)}
          style={styles.availabilityButton}>
          <Text style={styles.availabilityButtonText}>Configure</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroller}
        contentContainerStyle={styles.tabs}>
        {SESSION_BUCKETS.map(item => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{selected: bucket === item.id}}
            key={item.id}
            onPress={() => setBucket(item.id)}
            style={[styles.tab, bucket === item.id && styles.tabActive]}>
            <Text style={[styles.tabText, bucket === item.id && styles.tabTextActive]}>
              {item.label} ({sessionsForBucket(data, item.id).length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {status === 'loading' && !data.length ? (
        <View style={styles.centered}><ActivityIndicator color="#DF416B" /></View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={status === 'loading'} onRefresh={load} />}
          contentContainerStyle={styles.list}>
          {!visibleSessions.length ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No {bucket} sessions</Text>
              <Text style={styles.emptyCopy}>Session requests will appear here when their status changes.</Text>
            </View>
          ) : visibleSessions.map(session => {
            const customerName = `${session.user_first_name || ''} ${session.user_last_name || ''}`.trim() || 'User';
            const label = sessionStatusLabel(session);
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`One-to-one request ${session.id}, ${label}, ${customerName}`}
                key={session.id}
                onPress={() => openSession(session)}
                style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeading}>
                    <Text style={styles.name}>{customerName}</Text>
                    <Text style={styles.event}>{session.event_title}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{label}</Text>
                  </View>
                </View>
                <Text style={styles.date}>{formatSessionTime(session)}</Text>
                {!!session.user_comment && <Text style={styles.comment}>“{session.user_comment}”</Text>}
                <Text style={styles.open}>Manage session</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Modal animationType="slide" transparent visible={Boolean(selected)} onRequestClose={closeSession}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Manage one-to-one session</Text>
              <Text style={styles.sheetStatus}>{sessionStatusLabel(selected)}</Text>
              <Text style={styles.sheetName}>
                {selected?.user_first_name} {selected?.user_last_name}
              </Text>
              <Text style={styles.sheetMeta}>{selected ? formatSessionTime(selected) : ''}</Text>
              {!!selected?.user_comment && <Text style={styles.sheetComment}>{selected.user_comment}</Text>}

              {[0, 3, 1, 5].includes(Number(selected?.status)) && (
                <>
                  <Text style={styles.label}>Session type</Text>
                  <View style={styles.typeRow}>
                    {[
                      {id: 0, label: 'Online'},
                      {id: 1, label: 'In person'},
                    ].map(item => (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={{selected: locationType === item.id}}
                        key={item.id}
                        onPress={() => setLocationType(item.id)}
                        style={[styles.typeButton, locationType === item.id && styles.typeButtonActive]}>
                        <Text style={locationType === item.id ? styles.typeTextActive : styles.typeText}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {locationType === 0 ? (
                    <TextInput
                      accessibilityLabel="One-to-one meeting link"
                      autoCapitalize="none"
                      keyboardType="url"
                      onChangeText={setMeetLink}
                      placeholder="https://meeting-link"
                      style={styles.input}
                      value={meetLink}
                    />
                  ) : (
                    <TextInput
                      accessibilityLabel="One-to-one meeting location"
                      onChangeText={setLocation}
                      placeholder="Meeting location"
                      style={styles.input}
                      value={location}
                    />
                  )}
                  <TextInput
                    accessibilityLabel="One-to-one status reason"
                    onChangeText={setStatusReason}
                    placeholder="Optional note for the User"
                    style={styles.input}
                    value={statusReason}
                  />
                  <Text style={styles.label}>Date and time</Text>
                  <View style={styles.dateTimeRow}>
                    <TextInput
                      accessibilityLabel="One-to-one session date"
                      autoCapitalize="none"
                      onChangeText={setSessionDate}
                      placeholder="YYYY-MM-DD"
                      style={[styles.input, styles.dateTimeInput]}
                      value={sessionDate}
                    />
                    <TextInput
                      accessibilityLabel="One-to-one session time"
                      autoCapitalize="none"
                      onChangeText={setSessionTime}
                      placeholder="HH:MM"
                      style={[styles.input, styles.dateTimeInput]}
                      value={sessionTime}
                    />
                  </View>
                </>
              )}

              {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              {updateStatus === 'loading' ? <ActivityIndicator color="#DF416B" style={styles.loader} /> : (
                <View style={styles.actions}>
                  {Number(selected?.status) === 0 && (
                    <TouchableOpacity
                      accessibilityLabel={`Approve one-to-one request ${selected?.id}`}
                      onPress={() => mutate('approve')}
                      style={styles.primaryButton}>
                      <Text style={styles.primaryText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {[0, 5].includes(Number(selected?.status)) && (
                    <TouchableOpacity
                      accessibilityLabel={`Decline one-to-one request ${selected?.id}`}
                      onPress={() => mutate('decline')}
                      style={styles.secondaryButton}>
                      <Text style={styles.secondaryText}>Decline</Text>
                    </TouchableOpacity>
                  )}
                  {[0, 3, 1, 5].includes(Number(selected?.status)) && (
                    <TouchableOpacity
                      accessibilityLabel={`Confirm one-to-one details ${selected?.id}`}
                      onPress={confirmDetails}
                      style={styles.primaryButton}>
                      <Text style={styles.primaryText}>Save & confirm details</Text>
                    </TouchableOpacity>
                  )}
                  {[1, 3].includes(Number(selected?.status)) && (
                    <TouchableOpacity
                      accessibilityLabel={`Complete one-to-one session ${selected?.id}`}
                      onPress={() => mutate('complete')}
                      style={styles.secondaryButton}>
                      <Text style={styles.secondaryText}>Mark completed</Text>
                    </TouchableOpacity>
                  )}
                  {[1, 3].includes(Number(selected?.status)) && (
                    <TouchableOpacity
                      accessibilityLabel={`Cancel one-to-one session ${selected?.id}`}
                      onPress={() => mutate('cancel')}
                      style={styles.dangerButton}>
                      <Text style={styles.dangerText}>Cancel session</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={closeSession} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AvailabilityEditor
        onClose={() => setAvailabilityVisible(false)}
        speakers={getmasterdata?.speakers || []}
        visible={availabilityVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FDFBFF'},
  availabilityBanner: {marginHorizontal: 20, marginTop: 10, padding: 14, borderRadius: 18, backgroundColor: '#F1E8FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  availabilityCopy: {flex: 1, paddingRight: 12},
  availabilityTitle: {fontSize: 14, fontWeight: '800', color: '#17121C'},
  availabilityHint: {fontSize: 11, color: '#6C6572', marginTop: 3},
  availabilityButton: {backgroundColor: '#461477', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9},
  availabilityButtonText: {color: '#FFFFFF', fontSize: 12, fontWeight: '800'},
  tabsScroller: {flexGrow: 0, marginTop: 8},
  tabs: {paddingHorizontal: 20, gap: 8},
  tab: {paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#EEE8F5'},
  tabActive: {backgroundColor: '#461477'},
  tabText: {fontSize: 13, color: '#514B58', fontWeight: '600'},
  tabTextActive: {color: '#FFFFFF'},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {padding: 20, paddingBottom: 44, gap: 14},
  empty: {marginTop: 80, alignItems: 'center', paddingHorizontal: 30},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: '#17121C'},
  emptyCopy: {fontSize: 14, color: '#6C6572', textAlign: 'center', marginTop: 8, lineHeight: 20},
  card: {backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E8E0EF'},
  cardHeader: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  cardHeading: {flex: 1},
  name: {fontSize: 17, fontWeight: '700', color: '#17121C'},
  event: {fontSize: 13, color: '#6C6572', marginTop: 3},
  statusPill: {backgroundColor: '#F1E8FA', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6},
  statusText: {fontSize: 10, fontWeight: '800', color: '#461477'},
  date: {fontSize: 14, color: '#17121C', marginTop: 16, fontWeight: '600'},
  comment: {fontSize: 13, color: '#6C6572', marginTop: 10, lineHeight: 18},
  open: {fontSize: 13, color: '#DF416B', marginTop: 16, fontWeight: '700'},
  backdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,10,30,0.45)'},
  sheet: {maxHeight: '92%', backgroundColor: '#FDFBFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24},
  sheetTitle: {fontSize: 21, fontWeight: '800', color: '#17121C'},
  sheetStatus: {alignSelf: 'flex-start', color: '#461477', backgroundColor: '#F1E8FA', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, fontSize: 11, fontWeight: '800', marginTop: 12},
  sheetName: {fontSize: 18, fontWeight: '700', color: '#17121C', marginTop: 18},
  sheetMeta: {fontSize: 14, color: '#6C6572', marginTop: 5},
  sheetComment: {fontSize: 14, color: '#514B58', backgroundColor: '#F2EDF6', padding: 14, borderRadius: 14, marginTop: 14},
  label: {fontSize: 13, fontWeight: '700', color: '#17121C', marginTop: 20, marginBottom: 8},
  typeRow: {flexDirection: 'row', gap: 10},
  typeButton: {flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#CEC1D9'},
  typeButtonActive: {backgroundColor: '#461477', borderColor: '#461477'},
  typeText: {color: '#461477', fontWeight: '700'},
  typeTextActive: {color: '#FFFFFF', fontWeight: '700'},
  input: {backgroundColor: '#F2EDF6', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: '#17121C', marginTop: 12},
  dateTimeRow: {flexDirection: 'row', gap: 10},
  dateTimeInput: {flex: 1, marginTop: 0},
  error: {color: '#B42318', backgroundColor: '#FEE4E2', padding: 12, borderRadius: 12, marginTop: 14},
  loader: {marginVertical: 30},
  actions: {gap: 10, marginTop: 20, paddingBottom: 18},
  primaryButton: {backgroundColor: '#461477', borderRadius: 24, alignItems: 'center', paddingVertical: 14},
  primaryText: {color: '#FFFFFF', fontWeight: '800'},
  secondaryButton: {borderColor: '#461477', borderWidth: 1, borderRadius: 24, alignItems: 'center', paddingVertical: 14},
  secondaryText: {color: '#461477', fontWeight: '800'},
  dangerButton: {borderColor: '#D92D20', borderWidth: 1, borderRadius: 24, alignItems: 'center', paddingVertical: 14},
  dangerText: {color: '#D92D20', fontWeight: '800'},
  closeButton: {alignItems: 'center', paddingVertical: 12},
  closeText: {color: '#6C6572', fontWeight: '700'},
});

export default OneToOneSessions;
