import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiRequest} from '../../services/api';

const statusLabel = value => ({0: 'Pending', 1: 'Confirmed', 2: 'Cancelled', 3: 'Approved', 4: 'Declined', 5: 'Reschedule requested', 6: 'Completed'}[value] || 'Session');

const SpeakerSessions = () => {
  const navigation = useNavigation();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    const result = await apiRequest({url: '/speaker_app/event/get_request_buddy', method: 'POST', data: {type: 2}, authToken, bearerToken, contentType: 'application/json'});
    if (result?.status === false) { setError(result?.response?.message || 'Unable to load one-to-one sessions.'); setSessions([]); }
    else { setError(''); setSessions(Array.isArray(result?.response) ? result.response : []); }
    setLoading(false); setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const update = async (session, action) => {
    const result = await apiRequest({url: '/speaker_app/event/update_status_request_buddy', method: 'POST', data: {id: session.id, action}, authToken, bearerToken, contentType: 'application/json'});
    if (result?.status) load(); else Alert.alert('Unable to update session', result?.response?.message || 'Please try again.');
  };

  return <View style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to Speaker home" onPress={() => navigation.goBack()}><Text style={styles.back}>‹  Speaker home</Text></Pressable>
    <Text style={styles.eyebrow}>SPEAKER SESSIONS</Text><Text style={styles.title}>One-to-One</Text><Text style={styles.subtitle}>Review requests, availability and session details.</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Loading one-to-one sessions" color="#DF416B" /> : null}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!loading && !error && !sessions.length ? <Text style={styles.empty}>No one-to-one sessions yet.</Text> : null}
    {!loading && !error && sessions.map(session => <View key={String(session.id)} style={styles.card}><Text style={styles.cardTitle}>{session.event_title || 'One-to-one session'}</Text><Text style={styles.meta}>{session.date || 'Date to be confirmed'}{session.time ? ` · ${String(session.time).slice(0, 5)}` : ''}</Text><Text style={styles.meta}>{statusLabel(session.status)}</Text>{session.user_comment ? <Text style={styles.comment}>{session.user_comment}</Text> : null}{Number(session.status) === 0 ? <View style={styles.row}><Pressable accessibilityRole="button" accessibilityLabel={`Approve session ${session.event_title || ''}`} onPress={() => update(session, 'approve')} style={styles.primary}><Text style={styles.primaryText}>Approve</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Decline session ${session.event_title || ''}`} onPress={() => update(session, 'decline')} style={styles.secondary}><Text style={styles.secondaryText}>Decline</Text></Pressable></View> : null}</View>)}
  </ScrollView></View>;
};

const styles = StyleSheet.create({safeArea: {backgroundColor: '#FDFBFF', flex: 1}, content: {padding: 24, paddingBottom: 56}, back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 28}, eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2}, title: {color: '#17121C', fontSize: 30, fontWeight: '800', marginTop: 6}, subtitle: {color: '#6C6572', fontSize: 15, lineHeight: 21, marginBottom: 22, marginTop: 8}, card: {backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 17}, cardTitle: {color: '#17121C', fontSize: 16, fontWeight: '800'}, meta: {color: '#514B58', fontSize: 14, marginTop: 7}, comment: {color: '#6C6572', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginTop: 10}, row: {flexDirection: 'row', gap: 9, marginTop: 16}, primary: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 22, flex: 1, padding: 12}, primaryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '800'}, secondary: {alignItems: 'center', borderColor: '#461477', borderRadius: 22, borderWidth: 1, flex: 1, padding: 11}, secondaryText: {color: '#461477', fontSize: 13, fontWeight: '800'}, empty: {color: '#6C6572', fontSize: 15, paddingVertical: 24, textAlign: 'center'}, error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12}});

export default SpeakerSessions;
