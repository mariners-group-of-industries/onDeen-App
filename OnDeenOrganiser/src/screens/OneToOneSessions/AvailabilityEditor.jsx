import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment-timezone';
import {useDispatch, useSelector} from 'react-redux';

import {
  clearOneToOneError,
  fetchOneToOneAvailability,
  saveOneToOneAvailability,
} from '../../redux/slices/oneToOneSessionsSlice';
import {availabilityToForm, buildAvailabilityPayload, WEEKDAYS} from './availabilityForm';

const EMPTY_FORM = {
  enabled: true,
  locationType: 2,
  durationMinutes: 60,
  weekdaySlots: {},
  unavailableDates: '',
};

const AvailabilityEditor = ({visible, speakers, onClose}) => {
  const dispatch = useDispatch();
  const {
    availability,
    availabilitySpeakerId,
    availabilityStatus,
    availabilitySaveStatus,
    error,
  } = useSelector(state => state.oneToOneSessions);
  const [speakerId, setSpeakerId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const speakerOptions = useMemo(() => (speakers || []).filter(item => item?.id), [speakers]);

  useEffect(() => {
    if (visible && !speakerId && speakerOptions.length) {
      setSpeakerId(Number(speakerOptions[0].id));
    }
  }, [speakerId, speakerOptions, visible]);

  useEffect(() => {
    if (visible && speakerId) {
      dispatch(clearOneToOneError());
      dispatch(fetchOneToOneAvailability(speakerId));
    }
  }, [dispatch, speakerId, visible]);

  useEffect(() => {
    if (availability && Number(availabilitySpeakerId) === Number(speakerId)) {
      setForm(availabilityToForm(availability));
      setFormError('');
    }
  }, [availability, availabilitySpeakerId, speakerId]);

  const setValue = (key, value) => setForm(current => ({...current, [key]: value}));
  const setWeekday = (weekday, value) => setForm(current => ({
    ...current,
    weekdaySlots: {...current.weekdaySlots, [weekday]: value},
  }));

  const save = async () => {
    try {
      setFormError('');
      const payload = buildAvailabilityPayload({
        speakerId,
        form,
        current: availability,
        timeZone: moment.tz.guess(),
      });
      await dispatch(saveOneToOneAvailability(payload)).unwrap();
      await dispatch(fetchOneToOneAvailability(speakerId)).unwrap();
      onClose();
    } catch (saveError) {
      if (saveError instanceof Error) {
        setFormError(saveError.message);
      }
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>One-to-One availability</Text>
            <Text style={styles.subtitle}>Configure the slots Users can request</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Close availability" onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Speaker</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {speakerOptions.map(speaker => {
              const selected = Number(speakerId) === Number(speaker.id);
              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  key={speaker.id}
                  onPress={() => setSpeakerId(Number(speaker.id))}
                  style={[styles.chip, selected && styles.chipActive]}>
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {speaker.first_name} {speaker.last_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {availabilityStatus === 'loading' ? (
            <ActivityIndicator color="#DF416B" style={styles.loader} />
          ) : speakerId ? (
            <>
              <View style={styles.toggleRow}>
                <View style={styles.toggleCopy}>
                  <Text style={styles.label}>Offer one-to-one sessions</Text>
                  <Text style={styles.hint}>Turn this off to hide all request slots.</Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel="Offer one-to-one sessions"
                  accessibilityRole="switch"
                  accessibilityState={{checked: form.enabled}}
                  onPress={() => setValue('enabled', !form.enabled)}
                  style={[styles.switch, form.enabled && styles.switchOn]}>
                  <View style={[styles.switchThumb, form.enabled && styles.switchThumbOn]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Session type</Text>
              <View style={styles.chips}>
                {[{id: 0, label: 'Online'}, {id: 1, label: 'In person'}, {id: 2, label: 'Either'}].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setValue('locationType', item.id)}
                    style={[styles.chip, form.locationType === item.id && styles.chipActive]}>
                    <Text style={[styles.chipText, form.locationType === item.id && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Session duration</Text>
              <View style={styles.chips}>
                {[30, 45, 60, 90].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    onPress={() => setValue('durationMinutes', minutes)}
                    style={[styles.chip, form.durationMinutes === minutes && styles.chipActive]}>
                    <Text style={[styles.chipText, form.durationMinutes === minutes && styles.chipTextActive]}>{minutes} min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Weekly days and start times</Text>
              <Text style={styles.hint}>Use comma-separated 24-hour times, for example 17:00, 18:30.</Text>
              {WEEKDAYS.map(day => {
                const active = Boolean(form.weekdaySlots[day.id]);
                return (
                  <View key={day.id} style={styles.dayRow}>
                    <TouchableOpacity
                      accessibilityLabel={`${day.label} availability`}
                      accessibilityRole="button"
                      accessibilityState={{selected: active}}
                      onPress={() => setWeekday(day.id, active ? '' : '17:00')}
                      style={[styles.dayButton, active && styles.dayButtonActive]}>
                      <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.short}</Text>
                    </TouchableOpacity>
                    <TextInput
                      accessibilityLabel={`${day.label} start times`}
                      autoCapitalize="none"
                      editable={active}
                      onChangeText={value => setWeekday(day.id, value)}
                      placeholder={active ? '17:00, 18:30' : 'Unavailable'}
                      style={[styles.input, !active && styles.inputDisabled]}
                      value={form.weekdaySlots[day.id] || ''}
                    />
                  </View>
                );
              })}

              <Text style={styles.label}>Unavailable dates</Text>
              <Text style={styles.hint}>Comma-separated YYYY-MM-DD dates override the weekly schedule.</Text>
              <TextInput
                accessibilityLabel="Unavailable one-to-one dates"
                autoCapitalize="none"
                onChangeText={value => setValue('unavailableDates', value)}
                placeholder="2026-09-12, 2026-09-19"
                style={styles.input}
                value={form.unavailableDates}
              />

              {!!(formError || error) && <Text accessibilityRole="alert" style={styles.error}>{formError || error}</Text>}
              <TouchableOpacity
                accessibilityLabel="Save one-to-one availability"
                disabled={availabilitySaveStatus === 'loading'}
                onPress={save}
                style={styles.saveButton}>
                {availabilitySaveStatus === 'loading'
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.saveText}>Save availability</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.empty}>No speaker is available for this organiser.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FDFBFF', paddingTop: 58},
  header: {paddingHorizontal: 22, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E8E0EF'},
  title: {fontSize: 21, fontWeight: '800', color: '#17121C'},
  subtitle: {fontSize: 13, color: '#6C6572', marginTop: 4},
  close: {color: '#DF416B', fontWeight: '800'},
  content: {padding: 22, paddingBottom: 54},
  label: {fontSize: 14, fontWeight: '800', color: '#17121C', marginTop: 20, marginBottom: 8},
  hint: {fontSize: 12, lineHeight: 17, color: '#6C6572', marginBottom: 10},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {borderRadius: 20, borderWidth: 1, borderColor: '#CEC1D9', paddingHorizontal: 13, paddingVertical: 9},
  chipActive: {backgroundColor: '#461477', borderColor: '#461477'},
  chipText: {fontSize: 12, color: '#461477', fontWeight: '700'},
  chipTextActive: {color: '#FFFFFF'},
  loader: {marginVertical: 50},
  toggleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6},
  toggleCopy: {flex: 1, paddingRight: 20},
  switch: {width: 48, height: 28, borderRadius: 16, padding: 3, backgroundColor: '#D7CEDF'},
  switchOn: {backgroundColor: '#DF416B'},
  switchThumb: {width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF'},
  switchThumbOn: {alignSelf: 'flex-end'},
  dayRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10},
  dayButton: {width: 54, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEE8F5'},
  dayButtonActive: {backgroundColor: '#461477'},
  dayText: {fontSize: 12, color: '#6C6572', fontWeight: '800'},
  dayTextActive: {color: '#FFFFFF'},
  input: {flex: 1, backgroundColor: '#F2EDF6', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: '#17121C'},
  inputDisabled: {opacity: 0.55},
  error: {color: '#B42318', backgroundColor: '#FEE4E2', padding: 12, borderRadius: 12, marginTop: 16},
  saveButton: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 26, marginTop: 24, paddingVertical: 15},
  saveText: {color: '#FFFFFF', fontWeight: '800'},
  empty: {textAlign: 'center', color: '#6C6572', marginTop: 60},
});

export default AvailabilityEditor;
