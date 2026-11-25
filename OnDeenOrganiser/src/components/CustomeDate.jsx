import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, formatTime } from '../common/datetimeformate';
import Date1 from '../assets/svg/date.svg';
import Clock from '../assets/svg/clock.svg';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeDate({
  formik,
  name,
  label,
  placeholder,
  type = 'date',
  customewidth = '100%',
}) {
  const [showError, setShowError] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (formik.touched?.[name] && formik.errors?.[name]) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched, name]);

  useEffect(() => {
    if (formik.isSubmitting && formik.errors?.[name]) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors, name]);

  const handleDateChange = (event, selectedValue) => {
    if (event.type === 'set') {
      const currentDate = selectedValue || null;
      setDatePickerVisible(false);
      setSelectedDate(currentDate);

      if (currentDate) {
        if (type === 'date') {
          const formattedDate = formatDate(currentDate);
          formik.setFieldValue(name, formattedDate);
        } else if (type === 'time') {
          const formattedTime = formatTime(currentDate);
          formik.setFieldValue(name, formattedTime);
        }
      } else {
        formik.setFieldValue(name, '');
      }
    } else {
      setDatePickerVisible(false);
    }
  };

  const fieldValue = formik.values[name];
  const displayValue = fieldValue || '';

  return (
    <View style={[styles.container, { width: customewidth }]}>
      {label && <Text style={styles.title}>{label}</Text>}
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setDatePickerVisible(true)}
      >
        <TextInput
          style={styles.input}
          value={displayValue}
          placeholder={placeholder}
          placeholderTextColor={'#969696'}
          editable={false}
        />
        <View style={styles.iconContainer}>
          {type === 'date' ? <Date1 /> : <Clock />}
        </View>
      </TouchableOpacity>
      {formik.touched?.[name] && showError && formik.errors?.[name] && (
        <Text style={styles.errorMessage}>{formik.errors[name]}</Text>
      )}
      {isDatePickerVisible && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode={type}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(2),
    marginBottom: heightScale(12),
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: fontScale(14),
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(50),
    paddingRight: widthScale(50),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  errorMessage: {
    color: 'red',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  iconContainer: {
    position: 'absolute',
    right: widthScale(25),
    justifyContent: 'center',
  },
});
