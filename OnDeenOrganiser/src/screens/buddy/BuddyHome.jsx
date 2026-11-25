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
import {useDispatch, useSelector} from 'react-redux';
import {apiRequest} from '../../services/api';
import {logout} from '../../redux/slices/loginSlice';

const readList = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.response?.data)) return payload.response.data;
  return [];
};

const BuddyHome = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    const result = await apiRequest({
      url: '/buddy_app/event/get_request_buddy',
      method: 'POST',
      data: {},
      authToken,
      bearerToken,
      contentType: 'application/json',
    });
    if (result?.status === false) {
      setError(result?.response?.message || 'Unable to load assigned tasks.');
      setTasks([]);
    } else {
      setTasks(readList(result));
    }
    setLoading(false);
    setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => {
    loadTasks();
  }, [loadTasks]));

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTasks(true)} />}>
        <Text style={styles.eyebrow}>ONDEEN SUPPORT</Text>
        <Text style={styles.title}>Buddy tasks</Text>
        <Text style={styles.subtitle}>Only support requests assigned to you are shown here.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out of Buddy account"
          onPress={() => dispatch(logout())}
          style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Assigned support</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Loading assigned Buddy tasks" color="#DF416B" /> : null}
        {!loading && error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {!loading && !error && !tasks.length ? (
          <Text style={styles.empty}>No Buddy tasks are assigned to you.</Text>
        ) : null}
        {!loading && !error && tasks.map(task => {
          const name = [task.user_first_name, task.user_last_name].filter(Boolean).join(' ') || 'User';
          const eventTitle = task.event_title || 'Assigned listing';
          return (
            <Pressable
              key={String(task.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open Buddy assignment ${eventTitle}`}
              onPress={() => navigation.navigate('BuddyTask', {task})}
              style={styles.taskCard}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.taskCopy}>
                <Text style={styles.taskTitle}>{eventTitle}</Text>
                <Text style={styles.taskMeta}>Support {name}</Text>
                <Text style={styles.taskMeta}>{task.status === 1 ? 'Assigned' : 'Completed'}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#FDFBFF', flex: 1},
  content: {padding: 24, paddingBottom: 48},
  eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  title: {color: '#17121C', fontSize: 30, fontWeight: '800', marginTop: 6},
  subtitle: {color: '#6C6572', fontSize: 15, lineHeight: 21, marginTop: 8},
  sectionTitle: {color: '#17121C', fontSize: 19, fontWeight: '800', marginBottom: 12, marginTop: 28},
  taskCard: {alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginBottom: 12, padding: 15},
  avatar: {alignItems: 'center', backgroundColor: '#F1E8FA', borderRadius: 24, height: 48, justifyContent: 'center', width: 48},
  avatarText: {color: '#461477', fontSize: 20, fontWeight: '800'},
  taskCopy: {flex: 1, marginLeft: 14},
  taskTitle: {color: '#17121C', fontSize: 16, fontWeight: '800'},
  taskMeta: {color: '#6C6572', fontSize: 13, marginTop: 4},
  chevron: {color: '#461477', fontSize: 28, marginLeft: 8},
  empty: {color: '#6C6572', fontSize: 15, paddingVertical: 24, textAlign: 'center'},
  error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12},
  signOutButton: {alignSelf: 'flex-start', borderColor: '#D9CBE7', borderRadius: 16, borderWidth: 1, marginTop: 14, paddingHorizontal: 12, paddingVertical: 7},
  signOutText: {color: '#461477', fontSize: 12, fontWeight: '700'},
});

export default BuddyHome;
