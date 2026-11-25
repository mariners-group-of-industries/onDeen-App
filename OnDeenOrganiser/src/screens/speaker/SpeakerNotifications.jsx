import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {apiGetRequest} from '../../services/api';

const SpeakerNotifications = () => {
  const navigation = useNavigation();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    const result = await apiGetRequest({url: '/speaker_app/profile/get_notifications', method: 'GET', params: {page: 1}, authToken, bearerToken});
    if (result?.status === false) { setError(result?.response?.message || 'Unable to load notifications.'); setItems([]); }
    else { setError(''); setItems(Array.isArray(result?.response) ? result.response : []); }
    setLoading(false); setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <View style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to Speaker home" onPress={() => navigation.goBack()}><Text style={styles.back}>‹  Speaker home</Text></Pressable>
    <Text style={styles.eyebrow}>SPEAKER INBOX</Text><Text style={styles.title}>Notifications</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Loading Speaker notifications" color="#DF416B" /> : null}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!loading && !error && !items.length ? <Text style={styles.empty}>No notifications yet.</Text> : null}
    {!loading && !error && items.map(item => <View key={String(item.id)} style={styles.card}><Text style={styles.cardTitle}>{item.event_title || 'Speaker update'}</Text><Text style={styles.meta}>{item.question || 'A listing or one-to-one session needs your attention.'}</Text><Text style={styles.type}>{item.type === 4 ? '1-to-1 session' : 'Listing update'}</Text></View>)}
  </ScrollView></View>;
};

const styles = StyleSheet.create({safeArea: {backgroundColor: '#FDFBFF', flex: 1}, content: {padding: 24, paddingBottom: 56}, back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 28}, eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2}, title: {color: '#17121C', fontSize: 30, fontWeight: '800', marginBottom: 22, marginTop: 6}, card: {backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 17}, cardTitle: {color: '#17121C', fontSize: 16, fontWeight: '800'}, meta: {color: '#514B58', fontSize: 14, lineHeight: 21, marginTop: 6}, type: {color: '#461477', fontSize: 12, fontWeight: '800', marginTop: 10}, empty: {color: '#6C6572', fontSize: 15, paddingVertical: 24, textAlign: 'center'}, error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12}});

export default SpeakerNotifications;
