import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {fontFamilies} from '../assets/themes/fonts';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

const recurrenceOptions = [
  {label: 'One-off', value: 1},
  {label: 'Daily', value: 2},
  {label: 'Weekly', value: 3},
  {label: 'Monthly', value: 4},
];

const weekdayOptions = [
  {label: 'Mon', fullLabel: 'Monday', value: 0},
  {label: 'Tue', fullLabel: 'Tuesday', value: 1},
  {label: 'Wed', fullLabel: 'Wednesday', value: 2},
  {label: 'Thu', fullLabel: 'Thursday', value: 3},
  {label: 'Fri', fullLabel: 'Friday', value: 4},
  {label: 'Sat', fullLabel: 'Saturday', value: 5},
  {label: 'Sun', fullLabel: 'Sunday', value: 6},
];

const selectedWeekdays = value => String(value || '')
  .split(',')
  .filter(Boolean)
  .map(Number);

export default function ScheduleSelector({formik}) {
  const occurrenceType = Number(formik.values.occusr_type || 1);
  const weekdays = selectedWeekdays(formik.values.occusr_weekday);

  const selectRecurrence = value => {
    formik.setFieldValue('occusr_type', value);
    if (value !== 3) {
      formik.setFieldValue('occusr_weekday', '');
    }
    if (value === 1 && formik.values.start_date) {
      formik.setFieldValue('end_date', formik.values.start_date);
    }
    if (value === 4) {
      formik.setFieldValue('occusr_month', 1);
    }
  };

  const toggleWeekday = value => {
    const next = weekdays.includes(value)
      ? weekdays.filter(item => item !== value)
      : [...weekdays, value];
    formik.setFieldValue('occusr_weekday', next.sort().join(','));
  };

  return (
    <View>
      <Text style={styles.label}>Recurrence</Text>
      <View style={styles.optionRow}>
        {recurrenceOptions.map(option => {
          const selected = occurrenceType === option.value;
          return (
            <TouchableOpacity
              accessibilityLabel={`Recurrence ${option.label}`}
              accessibilityRole="radio"
              accessibilityState={{checked: selected}}
              key={option.value}
              onPress={() => selectRecurrence(option.value)}
              style={[styles.option, selected && styles.selectedOption]}>
              <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {occurrenceType === 3 ? (
        <View>
          <Text style={styles.label}>Repeat on</Text>
          <View style={styles.weekdayRow}>
            {weekdayOptions.map(option => {
              const selected = weekdays.includes(option.value);
              return (
                <TouchableOpacity
                  accessibilityLabel={option.fullLabel}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked: selected}}
                  key={option.value}
                  onPress={() => toggleWeekday(option.value)}
                  style={[styles.weekday, selected && styles.selectedWeekday]}>
                  <Text style={[styles.weekdayText, selected && styles.selectedOptionText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {formik.touched.occusr_weekday && formik.errors.occusr_weekday ? (
            <Text style={styles.error}>{formik.errors.occusr_weekday}</Text>
          ) : null}
        </View>
      ) : null}

      {occurrenceType === 4 ? (
        <Text style={styles.hint}>Repeats monthly on the selected start-date day.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(12),
    marginBottom: heightScale(6),
    marginTop: heightScale(6),
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: widthScale(8),
    marginBottom: heightScale(8),
  },
  option: {
    backgroundColor: '#F3F0F7',
    borderColor: '#DDD7E7',
    borderRadius: widthScale(18),
    borderWidth: 1,
    paddingHorizontal: widthScale(14),
    paddingVertical: heightScale(9),
  },
  selectedOption: {
    backgroundColor: '#DB3171',
    borderColor: '#DB3171',
  },
  optionText: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(12),
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: widthScale(7),
  },
  weekday: {
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
    borderColor: '#DDD7E7',
    borderRadius: widthScale(20),
    borderWidth: 1,
    height: widthScale(40),
    justifyContent: 'center',
    width: widthScale(40),
  },
  selectedWeekday: {
    backgroundColor: '#422199',
    borderColor: '#422199',
  },
  weekdayText: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(10),
  },
  hint: {
    color: '#66616B',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(11),
    marginTop: heightScale(4),
  },
  error: {
    color: 'red',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(11),
    marginTop: heightScale(4),
  },
});
