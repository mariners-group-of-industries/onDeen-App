import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import CustomHeader from '../../components/customHeader';
import {apiGetRequest, apiRequest} from '../../services/api';

const readPreferences = payload => {
  if (Array.isArray(payload?.response?.preferences)) return payload.response.preferences;
  if (Array.isArray(payload?.preferences)) return payload.preferences;
  return [];
};

const NotificationPreferences = () => {
  const navigation = useNavigation();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [preferences, setPreferences] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [savingType, setSavingType] = useState(null);
  const [error, setError] = useState('');

  const requestConfig = {
    authToken,
    bearerToken,
    contentType: 'application/json',
  };

  const load = useCallback(async () => {
    setRefreshing(true);
    setError('');
    const result = await apiGetRequest({
      url: '/organizer_app/profile/notification_preferences',
      method: 'GET',
      ...requestConfig,
    });
    if (result?.status === false) {
      setError(result?.response?.message || 'Unable to load notification preferences.');
      setPreferences([]);
    } else {
      setPreferences(readPreferences(result));
    }
    setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const toggle = async item => {
    const enabled = !item.push_enabled;
    const previous = preferences;
    const next = preferences.map(row => (
      row.notification_type === item.notification_type
        ? {...row, push_enabled: enabled}
        : row
    ));
    setPreferences(next);
    setSavingType(item.notification_type);
    setError('');
    const result = await apiRequest({
      url: '/organizer_app/profile/notification_preferences',
      method: 'POST',
      data: {
        preferences: [{
          notification_type: item.notification_type,
          push_enabled: enabled,
        }],
      },
      ...requestConfig,
    });
    setSavingType(null);
    if (result?.status === false) {
      setPreferences(previous);
      setError(result?.response?.message || 'Unable to save notification preferences.');
    } else {
      setPreferences(readPreferences(result));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Notification preferences"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        <Text style={styles.intro}>
          Choose which push notifications you receive. Your Notifications inbox keeps the history.
        </Text>
        {refreshing && !preferences.length ? (
          <ActivityIndicator accessibilityLabel="Loading notification preferences" color="#DF416B" />
        ) : null}
        {preferences.map(item => (
          <View key={item.notification_type} style={styles.card}>
            <View style={styles.copy}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Switch
              accessibilityRole="switch"
              accessibilityLabel={`Push notifications: ${item.label}`}
              accessibilityState={{checked: Boolean(item.push_enabled)}}
              disabled={savingType === item.notification_type}
              value={Boolean(item.push_enabled)}
              onValueChange={() => toggle(item)}
              trackColor={{false: '#D7D1DF', true: '#E9B2C5'}}
              thumbColor={item.push_enabled ? '#DF416B' : '#8A8493'}
            />
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!refreshing && !preferences.length && !error ? (
          <Text style={styles.empty}>No notification preferences available.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FDFBFF'},
  content: {padding: 20, paddingBottom: 40},
  intro: {color: '#69627B', fontSize: 15, lineHeight: 22, marginBottom: 18},
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E0EF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 86,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  copy: {flex: 1, paddingRight: 12},
  label: {color: '#251044', fontSize: 16, fontWeight: '700'},
  description: {color: '#69627B', fontSize: 13, lineHeight: 18, marginTop: 4},
  error: {color: '#B3261E', fontSize: 14, marginTop: 12},
  empty: {color: '#69627B', fontSize: 15, paddingVertical: 30, textAlign: 'center'},
});

export default NotificationPreferences;
