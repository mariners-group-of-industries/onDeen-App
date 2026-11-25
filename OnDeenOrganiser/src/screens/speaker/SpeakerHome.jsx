import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiRequest} from '../../services/api';

const listFrom = result => {
  if (Array.isArray(result?.response)) return result.response;
  if (Array.isArray(result?.response?.events)) return result.response.events;
  if (Array.isArray(result?.events)) return result.events;
  return [];
};

const SpeakerHome = () => {
  const navigation = useNavigation();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    const result = await apiRequest({
      url: '/speaker_app/event/get_all_event',
      method: 'POST',
      data: {},
      authToken,
      bearerToken,
      contentType: 'application/json',
    });
    if (result?.status === false) {
      setError(result?.response?.message || 'Unable to load assigned listings.');
      setEvents([]);
    } else {
      setEvents(listFrom(result));
    }
    setLoading(false);
    setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => {
    loadEvents();
  }, [loadEvents]));

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadEvents(true)} />}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>ONDEEN SPEAKER</Text>
            <Text style={styles.title}>My listings</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Open Speaker notifications" onPress={() => navigation.navigate('SpeakerNotifications')} style={styles.iconButton}>
              <Text style={styles.iconText}>♧</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Open Speaker profile" onPress={() => navigation.navigate('SpeakerProfile')} style={styles.iconButton}>
              <Text style={styles.iconText}>◎</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.subtitle}>Listings associated with your Speaker account.</Text>

        <View style={styles.actionRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open one-to-one sessions" onPress={() => navigation.navigate('SpeakerSessions')} style={styles.actionButton}>
            <Text style={styles.actionText}>1-to-1 sessions</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Open Speaker profile" onPress={() => navigation.navigate('SpeakerProfile')} style={[styles.actionButton, styles.secondaryAction]}>
            <Text style={[styles.actionText, styles.secondaryActionText]}>My profile</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Assigned listings</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Loading Speaker listings" color="#DF416B" /> : null}
        {!loading && error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {!loading && !error && !events.length ? <Text style={styles.empty}>No listings are associated with your account yet.</Text> : null}
        {!loading && !error && events.map(event => (
          <Pressable
            accessible={true}
            key={String(event.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open Speaker listing ${event.title || 'listing'}`}
            onPress={() => navigation.navigate('SpeakerEvent', {eventId: event.id, event})}
            style={styles.eventCard}>
            <View style={styles.eventIcon}><Text style={styles.eventIconText}>▦</Text></View>
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{event.title || 'Assigned listing'}</Text>
              <Text style={styles.eventMeta}>{event.status === 1 ? 'Published' : 'Completed or archived'}</Text>
              {!!event.start_date && <Text style={styles.eventMeta}>{String(event.start_date).slice(0, 10)}{event.start_time ? ` · ${String(event.start_time).slice(0, 5)}` : ''}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#FDFBFF', flex: 1},
  content: {padding: 24, paddingBottom: 56},
  headerRow: {alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between'},
  headerActions: {flexDirection: 'row', gap: 8},
  iconButton: {alignItems: 'center', backgroundColor: '#F1E8FA', borderRadius: 19, height: 38, justifyContent: 'center', width: 38},
  iconText: {color: '#461477', fontSize: 20, fontWeight: '800'},
  eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  title: {color: '#17121C', fontSize: 30, fontWeight: '800', marginTop: 6},
  subtitle: {color: '#6C6572', fontSize: 15, lineHeight: 21, marginTop: 8},
  actionRow: {flexDirection: 'row', gap: 10, marginTop: 20},
  actionButton: {backgroundColor: '#461477', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11},
  actionText: {color: '#FFFFFF', fontSize: 13, fontWeight: '800'},
  secondaryAction: {backgroundColor: '#FFFFFF', borderColor: '#461477', borderWidth: 1},
  secondaryActionText: {color: '#461477'},
  sectionTitle: {color: '#17121C', fontSize: 19, fontWeight: '800', marginBottom: 12, marginTop: 30},
  eventCard: {alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginBottom: 12, padding: 15},
  eventIcon: {alignItems: 'center', backgroundColor: '#F8E5EE', borderRadius: 24, height: 48, justifyContent: 'center', width: 48},
  eventIconText: {color: '#DF416B', fontSize: 22, fontWeight: '800'},
  eventCopy: {flex: 1, marginLeft: 14},
  eventTitle: {color: '#17121C', fontSize: 16, fontWeight: '800'},
  eventMeta: {color: '#6C6572', fontSize: 13, marginTop: 4},
  chevron: {color: '#461477', fontSize: 28, marginLeft: 8},
  empty: {color: '#6C6572', fontSize: 15, paddingVertical: 24, textAlign: 'center'},
  error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12},
});

export default SpeakerHome;
