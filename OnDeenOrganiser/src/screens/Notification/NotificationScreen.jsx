import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { apiGetRequest, apiRequest } from '../../services/api';

const readNotifications = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.response?.notifications)) return payload.response.notifications;
  if (Array.isArray(payload?.response?.data)) return payload.response.data;
  return [];
};

const formatDate = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const requestConfig = {
    authToken,
    bearerToken,
    contentType: 'application/json',
  };

  const load = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const result = await apiGetRequest({
        url: '/organizer_app/profile/get_notifications',
        method: 'GET',
        ...requestConfig,
      });
      if (result?.status === false) {
        setError(result?.response?.message || 'Unable to load notifications.');
        setItems([]);
      } else {
        setItems(readNotifications(result));
      }
    } catch (requestError) {
      setError('Unable to load notifications.');
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [authToken, bearerToken]);

  useEffect(() => {
    load();
  }, [load]);

  const markSeen = useCallback(async item => {
    if (!item?.id || Number(item.seen) === 1) return;
    try {
      await apiRequest({
        url: '/organizer_app/profile/seen_notification',
        method: 'POST',
        data: { id: item.id },
        ...requestConfig,
      });
      setItems(previous => previous.map(row => (
        row.id === item.id ? { ...row, seen: 1 } : row
      )));
    } catch (requestError) {
      // Opening the linked entity remains useful even when the read receipt is offline.
    }
  }, [authToken, bearerToken]);

  const openNotification = useCallback(async item => {
    await markSeen(item);
    if (Number(item?.type) === 3) {
      navigation.navigate('BuddyAssignment', { notification: item });
      return;
    }
    if (Number(item?.type) === 4) {
      navigation.navigate('OneToOneSessions');
      return;
    }
    if (item?.event_id) {
      navigation.navigate('MainEventDetail', { id: item.event_id });
    }
  }, [markSeen, navigation]);

  const deleteNotification = useCallback(async item => {
    if (!item?.id) return;
    try {
      await apiRequest({
        url: '/organizer_app/profile/delete_notification',
        method: 'POST',
        data: { id: item.id },
        ...requestConfig,
      });
      setItems(previous => previous.filter(row => row.id !== item.id));
    } catch (requestError) {
      setError('Unable to delete notification.');
    }
  }, [authToken, bearerToken]);

  const renderItem = ({ item }) => (
    <View style={[styles.card, Number(item?.seen) !== 1 && styles.unreadCard]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item?.title || 'Open notification'}
        onPress={() => openNotification(item)}
        style={styles.content}>
        <View style={styles.dot} />
        <View style={styles.copy}>
          <Text style={styles.title}>{item?.title || 'Notification'}</Text>
          <Text style={styles.message}>{item?.message || ''}</Text>
          <Text style={styles.date}>{formatDate(item?.created_on)}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Delete ' + (item?.title || 'notification')}
        onPress={() => deleteNotification(item)}
        hitSlop={10}
        style={styles.delete}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh notifications"
          onPress={load}
          hitSlop={12}>
          <Text style={styles.refresh}>↻</Text>
        </Pressable>
      </View>
      {refreshing && items.length === 0 ? (
        <ActivityIndicator accessibilityLabel="Loading notifications" style={styles.loader} color="#DF416B" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{error || 'No notifications yet.'}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBFF' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  back: { color: '#3E146F', fontSize: 38, lineHeight: 30 },
  headerTitle: { color: '#161616', fontSize: 22, fontWeight: '700' },
  refresh: { color: '#DF416B', fontSize: 28 },
  loader: { marginTop: 40 },
  list: { padding: 20, paddingBottom: 40 },
  emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: '#69627B', fontSize: 16, textAlign: 'center' },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  unreadCard: { borderColor: '#DF416B', borderWidth: 1 },
  content: { alignItems: 'flex-start', flex: 1, flexDirection: 'row' },
  dot: { backgroundColor: '#DF416B', borderRadius: 5, height: 10, marginRight: 10, marginTop: 5, width: 10 },
  copy: { flex: 1 },
  title: { color: '#251044', fontSize: 16, fontWeight: '700' },
  message: { color: '#3A3545', fontSize: 14, lineHeight: 20, marginTop: 4 },
  date: { color: '#8A8493', fontSize: 12, marginTop: 6 },
  delete: { marginLeft: 10, padding: 4 },
  deleteText: { color: '#B3261E', fontSize: 12, fontWeight: '600' },
});

export default NotificationScreen;
