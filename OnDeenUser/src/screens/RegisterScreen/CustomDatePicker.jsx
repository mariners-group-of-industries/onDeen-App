import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { fontFamilies } from '../../assets/fonts/fonts';

const CustomDatePicker = ({ formik, fieldName = 'dob', label = 'Age' }) => {
    const [open, setOpen] = useState(false);

    const calculateAge = (dob) => {
        const birthDate = moment(dob);
        if (!birthDate.isValid()) return 0;
        const today = moment();
        let age = today.diff(birthDate, 'years');

        const hasHadBirthdayThisYear = today.isSameOrAfter(
            birthDate.clone().add(age, 'years'),
            'day'
        );
        if (!hasHadBirthdayThisYear) {
            age -= 1;
        }
        return age;
    };

    const handleDateChange = (event, selectedDate) => {
        setOpen(false);
        if (event.type === 'set' && selectedDate) {
            // Format the date to YYYY-MM-DD before setting it in formik
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            formik.setFieldValue(fieldName, formattedDate);
            formik.setFieldValue('age', calculateAge(formattedDate));
        }
    };

    return (
        <>
            <Text style={styles.ageTitle}>{label}</Text>
            <TouchableOpacity
                style={{ marginBottom: 16 }}
                onPress={() => setOpen(true)}
                activeOpacity={0.7}>
                <View style={styles.datePickerContainer}>
                    <Text style={[
                        styles.dateText,
                        { color: formik.values[fieldName] ? '#000' : '#aaa' }
                    ]}>
                        {formik.values[fieldName] ? (
                            `${calculateAge(formik.values[fieldName])} Years`
                        ) : (
                            'Select Date of Birth'
                        )}
                    </Text>
                </View>
            </TouchableOpacity>

            {formik.touched[fieldName] && formik.errors[fieldName] && (
                <Text style={styles.errorText}>{formik.errors[fieldName]}</Text>
            )}

            {open && (
                <DateTimePicker
                    value={formik.values[fieldName] ? new Date(formik.values[fieldName]) : new Date()}
                    mode="date"
                    maximumDate={new Date()}
                    display="spinner"
                    onChange={handleDateChange}
                    themeVariant="light"
                    accentColor="#C43D5E"
                    textColor="#000"
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    ageTitle: {
        marginBottom: 4,
        fontSize: 12,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        fontSize: 14,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#F3F0F7',
        borderRadius: 50,
        paddingRight: 50,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    dateText: {
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});

export default CustomDatePicker;