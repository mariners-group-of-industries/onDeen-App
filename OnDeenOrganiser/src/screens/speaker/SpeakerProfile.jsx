import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {apiGetRequest, apiRequest} from '../../services/api';
import {logout} from '../../redux/slices/loginSlice';

const SpeakerProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    const [profileResult, availabilityResult] = await Promise.all([
      apiGetRequest({url: '/speaker_app/profile/get_profile', method: 'GET', authToken, bearerToken}),
      apiGetRequest({url: '/speaker_app/speakers/get_availability_days', method: 'GET', authToken, bearerToken}),
    ]);
    if (profileResult?.status === false) setError(profileResult?.response?.message || 'Unable to load profile.');
    else setProfile(profileResult?.response || null);
    if (availabilityResult?.status) setAvailability(availabilityResult.response);
    setLoading(false);
    setRefreshing(false);
  }, [authToken, bearerToken]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const expertise = profile?.expertise_2 || [];
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Speaker';

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Speaker home" onPress={() => navigation.goBack()}><Text style={styles.back}>‹  Speaker home</Text></Pressable>
        <Text style={styles.eyebrow}>SPEAKER PROFILE</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Loading Speaker profile" color="#DF416B" /> : null}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!loading && !error && profile && <>
          <View style={styles.identity}>
            {profile.profile_image ? <Image source={{uri: profile.profile_image}} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{name.charAt(0)}</Text></View>}
            <View style={styles.identityCopy}><Text style={styles.title}>{name}</Text><Text style={styles.meta}>{profile.country_of_residence || 'Speaker account'}</Text></View>
          </View>
          <View style={styles.card}><Text style={styles.sectionTitle}>Expertise</Text><View style={styles.chips}>{expertise.map(item => <View key={String(item.id)} style={styles.chip}><Text style={styles.chipText}>{item.title}</Text></View>)}</View></View>
          {!!profile.about_us && <View style={styles.section}><Text style={styles.sectionTitle}>About</Text><Text style={styles.body}>{profile.about_us}</Text></View>}
          <View style={styles.section}><Text style={styles.sectionTitle}>Availability</Text><Text style={styles.body}>{availability?.availability_days?.length || availability?.availability_dates?.length ? 'Availability is configured for one-to-one sessions.' : 'No availability slots configured yet.'}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open one-to-one sessions" onPress={() => navigation.navigate('SpeakerSessions')} style={styles.primary}><Text style={styles.primaryText}>Manage 1-to-1 sessions</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Sign out of Speaker account" onPress={() => dispatch(logout())} style={styles.secondary}><Text style={styles.secondaryText}>Sign out</Text></Pressable>
        </>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#FDFBFF', flex: 1}, content: {padding: 24, paddingBottom: 56}, back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 28}, eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2}, identity: {alignItems: 'center', flexDirection: 'row', marginTop: 20}, identityCopy: {flex: 1, marginLeft: 15}, avatar: {backgroundColor: '#F1E8FA', borderRadius: 38, height: 76, width: 76}, avatarFallback: {alignItems: 'center', backgroundColor: '#F1E8FA', borderRadius: 38, height: 76, justifyContent: 'center', width: 76}, avatarText: {color: '#461477', fontSize: 28, fontWeight: '800'}, title: {color: '#17121C', fontSize: 26, fontWeight: '800'}, meta: {color: '#6C6572', fontSize: 15, marginTop: 5}, card: {backgroundColor: '#FFFFFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, marginTop: 26, padding: 18}, section: {marginTop: 25}, sectionTitle: {color: '#17121C', fontSize: 19, fontWeight: '800', marginBottom: 10}, chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8}, chip: {backgroundColor: '#F1E8FA', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8}, chipText: {color: '#461477', fontSize: 13, fontWeight: '700'}, body: {color: '#514B58', fontSize: 15, lineHeight: 22}, primary: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 26, marginTop: 28, padding: 15}, primaryText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'}, secondary: {alignItems: 'center', borderColor: '#D9CBE7', borderRadius: 26, borderWidth: 1, marginTop: 12, padding: 14}, secondaryText: {color: '#461477', fontSize: 15, fontWeight: '800'}, error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12},
});

export default SpeakerProfile;
