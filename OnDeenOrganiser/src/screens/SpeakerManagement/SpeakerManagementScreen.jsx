import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {apiRequest} from '../../services/api';

const EMPTY_FORM = {
  id: null,
  first_name: '',
  last_name: '',
  email_id: '',
  country_code: '+44',
  mobile_number: '',
  password: '123456',
  country_of_residence: 'United Kingdom',
  about_us: '',
  qualification: '',
  status: 1,
  expertise: [],
};

const listResponse = result => (Array.isArray(result?.response) ? result.response : []);

const SpeakerManagementScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const authToken = useSelector(state => state.token?.token?.access_token);
  const bearerToken = useSelector(state => state.user?.loginToken);
  const [speakers, setSpeakers] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const request = useCallback((config) => apiRequest({
    ...config,
    authToken,
    bearerToken,
    contentType: config.contentType || 'application/json',
  }), [authToken, bearerToken]);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    const [listing, expertise] = await Promise.all([
      request({url: '/organizer_app/speakers/listing', method: 'POST', data: {}}),
      request({url: '/organizer_app/speakers/get_expertise', method: 'GET'}),
    ]);
    if (listing?.status === false) {
      setError(listing?.response?.message || 'Unable to load managed Speakers.');
      setSpeakers([]);
    } else {
      setSpeakers(listResponse(listing));
    }
    if (expertise?.status !== false) setExpertiseOptions(listResponse(expertise));
    setLoading(false);
    setRefreshing(false);
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({...EMPTY_FORM});
    setVisible(true);
  };

  const openEdit = async speaker => {
    setError('');
    const result = await request({url: '/organizer_app/speakers/get_by_id', method: 'POST', data: {id: speaker.id || speaker.user_id}});
    if (result?.status === false) {
      Alert.alert('Unable to open Speaker', result?.response?.message || 'Please try again.');
      return;
    }
    setForm({...EMPTY_FORM, ...(result?.response || {}), id: speaker.id || speaker.user_id, password: '123456'});
    setVisible(true);
  };

  const setField = (key, value) => setForm(current => ({...current, [key]: value}));
  const toggleExpertise = id => setForm(current => ({
    ...current,
    expertise: current.expertise.includes(id)
      ? current.expertise.filter(item => item !== id)
      : [...current.expertise, id],
  }));

  const save = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email_id.trim() || !form.mobile_number.trim()) {
      Alert.alert('Required fields', 'First name, last name, email and mobile are required.');
      return;
    }
    setSaving(true);
    const result = await request({
      url: '/organizer_app/speakers/create',
      method: 'POST',
      data: {
        ...form,
        id: form.id || undefined,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email_id: form.email_id.trim(),
        mobile_number: form.mobile_number.trim(),
        status: Number(form.status),
        expertise: form.expertise.map(Number),
        sect_types: [],
        schools_of_thought: [],
        social_media_links: [],
        additional_information: [],
      },
    });
    setSaving(false);
    if (result?.status === false) {
      Alert.alert('Unable to save Speaker', result?.response?.message || 'Please check the fields and try again.');
      return;
    }
    setVisible(false);
    await load(true);
  };

  const remove = speaker => Alert.alert(
    'Remove Speaker',
    'The Speaker will be inactive but historical event relationships remain available.',
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: async () => {
        const result = await request({url: '/organizer_app/speakers/delete', method: 'POST', data: {id: speaker.id || speaker.user_id}});
        if (result?.status === false) Alert.alert('Unable to remove Speaker', result?.response?.message || 'Please try again.');
        else load(true);
      }},
    ],
  );

  const statusText = useMemo(() => ({1: 'Available', 2: 'Inactive', 3: 'Removed'}), []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Settings" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹  Settings</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View><Text style={styles.eyebrow}>ORGANISER TEAM</Text><Text style={styles.title}>Speakers</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Create Speaker" onPress={openCreate} style={styles.addButton}>
            <Text style={styles.addText}>＋ Add</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Manage public profiles, expertise, qualifications and availability status.</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Loading managed Speakers" color="#DF416B" /> : null}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!loading && !error && !speakers.length ? <Text style={styles.empty}>No Speakers managed yet.</Text> : null}
        {!loading && !error && speakers.map(speaker => (
          <View style={styles.card} key={String(speaker.id || speaker.user_id)}>
            <View style={styles.cardMain}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{(speaker.first_name || 'S').charAt(0)}</Text></View>
              <View style={styles.copy}><Text style={styles.name}>{speaker.first_name} {speaker.last_name}</Text><Text style={styles.meta}>{speaker.email_id || 'No email'}</Text><Text style={[styles.status, Number(speaker.status) === 2 && styles.inactive]}>{statusText[speaker.status] || 'Available'}</Text></View>
            </View>
            <View style={styles.cardActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit Speaker ${speaker.first_name} ${speaker.last_name}`} onPress={() => openEdit(speaker)} style={styles.editButton}><Text style={styles.editText}>Edit profile</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove Speaker ${speaker.first_name} ${speaker.last_name}`} onPress={() => remove(speaker)}><Text style={styles.removeText}>Remove</Text></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.modalContent,
              {
                paddingTop: Math.max(insets.top + 12, 24),
                paddingBottom: Math.max(insets.bottom + 28, 70),
              },
            ]}
            keyboardShouldPersistTaps="handled">
            <Pressable accessibilityRole="button" accessibilityLabel="Close Speaker editor" onPress={() => setVisible(false)}><Text style={styles.back}>‹  Speakers</Text></Pressable>
            <Text style={styles.eyebrow}>{form.id ? 'EDIT SPEAKER' : 'NEW SPEAKER'}</Text>
            <Text style={styles.modalTitle}>{form.id ? 'Edit profile' : 'Create a Speaker'}</Text>
            <Text style={styles.formHint}>Public identity and private organiser fields stay separated by the backend.</Text>
            <Text style={styles.label}>First name</Text><TextInput accessibilityLabel="Speaker first name" value={form.first_name} onChangeText={value => setField('first_name', value)} style={styles.input} placeholder="First name" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <Text style={styles.label}>Last name</Text><TextInput accessibilityLabel="Speaker last name" value={form.last_name} onChangeText={value => setField('last_name', value)} style={styles.input} placeholder="Last name" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <Text style={styles.label}>Email</Text><TextInput accessibilityLabel="Speaker email" value={form.email_id} onChangeText={value => setField('email_id', value)} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholder="speaker@example.com" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <Text style={styles.label}>Mobile</Text><TextInput accessibilityLabel="Speaker mobile" value={form.mobile_number} onChangeText={value => setField('mobile_number', value)} style={styles.input} keyboardType="phone-pad" placeholder="700002010" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <Text style={styles.label}>About (public)</Text><TextInput accessibilityLabel="Speaker biography" value={form.about_us || ''} onChangeText={value => setField('about_us', value)} style={[styles.input, styles.multiline]} multiline placeholder="Short biography" />
            <Text style={styles.label}>Qualification (organiser record)</Text><TextInput accessibilityLabel="Speaker qualification" value={form.qualification || ''} onChangeText={value => setField('qualification', value)} style={styles.input} placeholder="Qualification" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <Text style={styles.label}>Expertise</Text>
            <View style={styles.chips}>{expertiseOptions.map(option => { const selected = form.expertise.includes(Number(option.id)); return <Pressable key={String(option.id)} accessibilityRole="button" accessibilityLabel={`Toggle expertise ${option.title}`} onPress={() => toggleExpertise(Number(option.id))} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.title}</Text></Pressable>; })}</View>
            <View style={styles.statusRow}><View><Text style={styles.label}>Available for public listings</Text><Text style={styles.statusHint}>{Number(form.status) === 1 ? 'Visible to Users' : 'Hidden from new public projections'}</Text></View><Switch accessibilityLabel="Speaker availability status" value={Number(form.status) === 1} onValueChange={value => setField('status', value ? 1 : 2)} trackColor={{false: '#D9CBE7', true: '#C9F7B1'}} thumbColor="#461477" /></View>
            <Pressable accessibilityRole="button" accessibilityLabel={form.id ? 'Save Speaker changes' : 'Create Speaker'} onPress={save} disabled={saving} style={styles.primary}><Text style={styles.primaryText}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create Speaker'}</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: '#FDFBFF', flex: 1}, content: {padding: 24, paddingBottom: 56}, modalContainer: {backgroundColor: '#FDFBFF', flex: 1}, modalContent: {padding: 24, paddingBottom: 70}, back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 28}, headerRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}, eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2}, title: {color: '#17121C', fontSize: 30, fontWeight: '800', marginTop: 6}, subtitle: {color: '#6C6572', fontSize: 15, lineHeight: 21, marginBottom: 22, marginTop: 8}, addButton: {backgroundColor: '#461477', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10}, addText: {color: '#FFF', fontSize: 14, fontWeight: '800'}, card: {backgroundColor: '#FFF', borderColor: '#E8E0EF', borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 16}, cardMain: {alignItems: 'center', flexDirection: 'row'}, avatar: {alignItems: 'center', backgroundColor: '#F1E8FA', borderRadius: 24, height: 48, justifyContent: 'center', width: 48}, avatarText: {color: '#461477', fontSize: 20, fontWeight: '800'}, copy: {flex: 1, marginLeft: 13}, name: {color: '#17121C', fontSize: 16, fontWeight: '800'}, meta: {color: '#6C6572', fontSize: 13, marginTop: 4}, status: {color: '#258A2B', fontSize: 12, fontWeight: '800', marginTop: 5}, inactive: {color: '#9B6C00'}, cardActions: {alignItems: 'center', borderTopColor: '#F0EAF4', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12}, editButton: {backgroundColor: '#F1E8FA', borderRadius: 17, paddingHorizontal: 13, paddingVertical: 8}, editText: {color: '#461477', fontSize: 13, fontWeight: '800'}, removeText: {color: '#B42318', fontSize: 13, fontWeight: '700'}, empty: {color: '#6C6572', fontSize: 15, paddingVertical: 24, textAlign: 'center'}, error: {backgroundColor: '#FEE4E2', borderRadius: 12, color: '#B42318', padding: 12}, modalTitle: {color: '#17121C', fontSize: 30, fontWeight: '800', marginTop: 6}, formHint: {color: '#6C6572', fontSize: 14, lineHeight: 20, marginBottom: 22, marginTop: 8}, label: {color: '#17121C', fontSize: 14, fontWeight: '700', marginBottom: 7, marginTop: 15}, input: {backgroundColor: '#F4F0F7', borderColor: '#E2D8EA', borderRadius: 14, borderWidth: 1, color: '#17121C', fontSize: 16, paddingHorizontal: 14, paddingVertical: 12}, multiline: {minHeight: 90, textAlignVertical: 'top'}, chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8}, chip: {borderColor: '#D9CBE7', borderRadius: 16, borderWidth: 1, marginBottom: 7, paddingHorizontal: 11, paddingVertical: 8}, chipSelected: {backgroundColor: '#461477', borderColor: '#461477'}, chipText: {color: '#461477', fontSize: 13, fontWeight: '700'}, chipTextSelected: {color: '#FFF'}, statusRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}, statusHint: {color: '#6C6572', fontSize: 12, marginTop: 3}, primary: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 26, marginTop: 30, padding: 15}, primaryText: {color: '#FFF', fontSize: 15, fontWeight: '800'},
});

export default SpeakerManagementScreen;
