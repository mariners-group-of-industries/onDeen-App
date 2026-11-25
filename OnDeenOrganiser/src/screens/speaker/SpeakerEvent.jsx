import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiRequest} from '../../services/api';

const SpeakerEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const eventId = route.params?.eventId;
  const fallback = route.params?.event || {};
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [event, setEvent] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const result = await apiRequest({
      url: '/speaker_app/event/get_by_id',
      method: 'POST',
      data: {id: eventId},
      authToken,
      bearerToken,
      contentType: 'application/json',
    });
    if (result?.status === false) setError(result?.response?.message || 'Unable to load listing.');
    else if (result?.response) setEvent(result.response);
    setLoading(false);
  }, [authToken, bearerToken, eventId]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Speaker listings" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹  My listings</Text>
        </Pressable>
        {loading ? <ActivityIndicator accessibilityLabel="Loading Speaker listing" color="#DF416B" /> : null}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!loading && !error && <>
          <Text style={styles.eyebrow}>ASSOCIATED LISTING</Text>
          <Text style={styles.title}>{event.title || 'Listing details'}</Text>
          <View style={styles.card}>
            <Text style={styles.label}>SCHEDULE</Text>
            <Text style={styles.value}>{event.start_date || 'Date to be confirmed'}{event.start_time ? ` · ${String(event.start_time).slice(0, 5)}` : ''}</Text>
            {!!event.location && <Text style={styles.meta}>{event.location}</Text>}
            {!!event.meet_link && <Text style={styles.meta}>Online session</Text>}
          </View>
          {!!event.description && <View style={styles.section}><Text style={styles.sectionTitle}>About this listing</Text><Text style={styles.body}>{event.description}</Text></View>}
          <View style={styles.section}><Text style={styles.sectionTitle}>Your role</Text><Text style={styles.body}>You are associated as a Speaker. Organiser financial and settings surfaces are not available from this account.</Text></View>
        </>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#FDFBFF', flex: 1},
  content: {padding: 24, paddingBottom: 56},
  back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 32},
  eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  title: {color: '#17121C', fontSize: 28, fontWeight: '800', marginTop: 7},
  card: {backgroundColor: '#F1E8FA', borderRadius: 20, marginTop: 24, padding: 20},
  label: {color: '#6C6572', fontSize: 11, fontWeight: '800', letterSpacing: 1},
  value: {color: '#17121C', fontSize: 19, fontWeight: '800', marginTop: 9},
  meta: {color: '#514B58', fontSize: 15, lineHeight: 21, marginTop: 8},
  section: {marginTop: 28},
  sectionTitle: {color: '#17121C', fontSize: 19, fontWeight: '800', marginBottom: 8},
  body: {color: '#514B58', fontSize: 15, lineHeight: 22},
  error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12},
});

export default SpeakerEvent;
