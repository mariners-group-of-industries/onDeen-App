import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import CustomHeader from '../../components/customHeader';
import {apiGetRequest, apiRequest} from '../../services/api';

const readList = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.response?.data)) return payload.response.data;
  return [];
};

const BuddyAssignment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const notification = route.params?.notification || {};
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [buddies, setBuddies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestId = notification.request_buddy_id || notification.event_id;
  const requesterName = useMemo(
    () => [notification.user_first_name, notification.user_last_name].filter(Boolean).join(' ') || 'User',
    [notification.user_first_name, notification.user_last_name],
  );

  const requestConfig = {
    authToken,
    bearerToken,
    contentType: 'application/json',
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await apiGetRequest({
      url: '/organizer_app/profile/buddy_list',
      method: 'GET',
      ...requestConfig,
    });
    if (result?.status === false) {
      setError(result?.response?.message || 'Unable to load Buddies.');
      setBuddies([]);
    } else {
      setBuddies(readList(result));
    }
    setLoading(false);
  }, [authToken, bearerToken]);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async () => {
    if (!requestId || !selectedId || saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const result = await apiRequest({
      url: '/organizer_app/event/assign_buddy',
      method: 'POST',
      data: {request_buddy_id: requestId, buddy_id: selectedId},
      ...requestConfig,
    });
    setSaving(false);
    if (result?.status === false) {
      setError(result?.response?.message || 'Unable to assign this Buddy.');
      return;
    }
    setSuccess(result?.response?.message || 'Buddy assigned successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Assign a Buddy"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.requestCard}>
          <Text style={styles.eyebrow}>Buddy support request</Text>
          <Text style={styles.requester}>{requesterName}</Text>
          {!!notification.event_title && <Text style={styles.event}>{notification.event_title}</Text>}
          {!!notification.user_mobile_number && (
            <Text style={styles.meta}>{notification.user_country_code || ''} {notification.user_mobile_number}</Text>
          )}
          <Text style={styles.help}>Choose an active Buddy from your organisation to welcome this attendee.</Text>
        </View>
        <Text style={styles.sectionTitle}>Select a Buddy</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Loading Buddies" color="#DF416B" /> : null}
        {!loading && !buddies.length ? <Text style={styles.empty}>No active Buddies are available.</Text> : null}
        {buddies.map(buddy => {
          const isSelected = Number(selectedId) === Number(buddy.id);
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={`Assign ${[buddy.first_name, buddy.last_name].filter(Boolean).join(' ')}`}
              key={buddy.id}
              onPress={() => setSelectedId(buddy.id)}
              style={[styles.buddyCard, isSelected && styles.buddyCardSelected]}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{(buddy.first_name || 'B').charAt(0).toUpperCase()}</Text></View>
              <View style={styles.buddyCopy}>
                <Text style={styles.buddyName}>{buddy.first_name} {buddy.last_name}</Text>
                {!!buddy.email_id && <Text style={styles.buddyMeta}>{buddy.email_id}</Text>}
              </View>
              <Text style={[styles.radio, isSelected && styles.radioSelected]}>{isSelected ? '✓' : ''}</Text>
            </Pressable>
          );
        })}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!!success && <Text accessibilityRole="status" style={styles.success}>{success}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Assign selected Buddy"
          disabled={!selectedId || saving}
          onPress={assign}
          style={[styles.assignButton, (!selectedId || saving) && styles.assignButtonDisabled]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.assignText}>Assign Buddy</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FDFBFF'},
  content: {padding: 20, paddingBottom: 44},
  requestCard: {backgroundColor: '#F1E8FA', borderRadius: 20, padding: 18},
  eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '700', textTransform: 'uppercase'},
  requester: {color: '#17121C', fontSize: 21, fontWeight: '800', marginTop: 8},
  event: {color: '#461477', fontSize: 15, fontWeight: '700', marginTop: 4},
  meta: {color: '#6C6572', fontSize: 13, marginTop: 6},
  help: {color: '#514B58', fontSize: 14, lineHeight: 20, marginTop: 14},
  sectionTitle: {color: '#17121C', fontSize: 17, fontWeight: '800', marginBottom: 12, marginTop: 24},
  empty: {color: '#6C6572', fontSize: 15, paddingVertical: 28, textAlign: 'center'},
  buddyCard: {alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 10, padding: 14},
  buddyCardSelected: {borderColor: '#DF416B', borderWidth: 2},
  avatar: {alignItems: 'center', backgroundColor: '#F1E8FA', borderRadius: 20, height: 40, justifyContent: 'center', width: 40},
  avatarText: {color: '#461477', fontSize: 17, fontWeight: '800'},
  buddyCopy: {flex: 1, marginLeft: 12},
  buddyName: {color: '#17121C', fontSize: 16, fontWeight: '700'},
  buddyMeta: {color: '#6C6572', fontSize: 12, marginTop: 3},
  radio: {borderColor: '#CEC1D9', borderRadius: 12, borderWidth: 1, color: '#FFFFFF', fontSize: 16, height: 24, lineHeight: 21, textAlign: 'center', width: 24},
  radioSelected: {backgroundColor: '#DF416B', borderColor: '#DF416B'},
  error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', marginTop: 14, padding: 12},
  success: {backgroundColor: '#E8F5E1', borderRadius: 12, color: '#3F7426', marginTop: 14, padding: 12},
  assignButton: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 26, justifyContent: 'center', marginTop: 24, minHeight: 50},
  assignButtonDisabled: {opacity: 0.5},
  assignText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
});

export default BuddyAssignment;
