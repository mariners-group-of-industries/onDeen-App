import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {apiGetRequest} from '../../services/api';
import {setLoginToken} from '../../redux/slices/loginSlice';

const statusCopy = {
  UNDER_REVIEW: {
    title: 'Application under review',
    body: 'Thanks for applying. OnDeen Admin is reviewing your organisation details.',
  },
  NEEDS_MORE_INFO: {
    title: 'More information needed',
    body: 'OnDeen Admin needs more information before your organisation can be approved.',
  },
  REJECTED: {
    title: 'Application not approved',
    body: 'Your organisation application was not approved. Please contact support for help.',
  },
};

const ApplicationStatusScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const accessToken = route.params?.access_token;
  const [status, setStatus] = useState(route.params?.application_status || 'UNDER_REVIEW');
  const [reviewNote, setReviewNote] = useState(route.params?.review_note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    const response = await apiGetRequest({
      url: '/organizer_app/login/application_status',
      method: 'GET',
      bearerToken: accessToken,
    });
    setLoading(false);
    if (!response?.status) {
      setError(response?.response?.message || 'Unable to refresh application status.');
      return;
    }
    const nextStatus = response.response?.application_status || 'UNDER_REVIEW';
    setStatus(nextStatus);
    setReviewNote(response.response?.review_note || '');
    if (nextStatus === 'APPROVED' || Number(response.response?.user_status) === 1) {
      dispatch(setLoginToken({loginToken: accessToken, isLogin: true, roleType: 3}));
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const copy = statusCopy[status] || statusCopy.UNDER_REVIEW;

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>OnDeen Organiser</Text>
      <Text accessibilityRole="header" style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      {reviewNote ? <Text style={styles.note}>Admin note: {reviewNote}</Text> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Refresh application status"
        disabled={loading}
        onPress={refresh}
        style={styles.primary}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Refresh status</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Return to sign-in options"
        onPress={() => navigation.navigate('Signup')}
        style={styles.secondary}>
        <Text style={styles.secondaryText}>Return to sign-in options</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FDFBFF', padding: 28, justifyContent: 'center'},
  eyebrow: {color: '#6B3B94', fontSize: 14, fontWeight: '700', marginBottom: 12},
  title: {color: '#17121C', fontSize: 28, fontWeight: '800', marginBottom: 16},
  body: {color: '#4C4653', fontSize: 17, lineHeight: 25, marginBottom: 18},
  note: {color: '#4C4653', fontSize: 15, lineHeight: 22, marginBottom: 18},
  error: {color: '#B3261E', fontSize: 14, marginBottom: 16},
  primary: {minHeight: 54, borderRadius: 28, backgroundColor: '#461477', alignItems: 'center', justifyContent: 'center', marginTop: 8},
  primaryText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  secondary: {minHeight: 54, borderRadius: 28, borderWidth: 1, borderColor: '#461477', alignItems: 'center', justifyContent: 'center', marginTop: 14},
  secondaryText: {color: '#461477', fontSize: 16, fontWeight: '700'},
});

export default ApplicationStatusScreen;
