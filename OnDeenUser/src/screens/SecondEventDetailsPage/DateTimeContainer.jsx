import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

import { getOnlyDayName } from '../../components/datetimeformate';
import { formatTimeOnly } from '../../timezone/maintimezone';

import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import ClockIcon from '../../../src/assets/svg/clock.svg';

export default function DateTimeContainer({ eventDetail }) {
    const formatDate = (dateString) => {
        if (!dateString || isNaN(Date.parse(dateString))) return '';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const startDate = formatDate(eventDetail?.start_date);
    const endDate = formatDate(eventDetail?.end_date);
    const startTime = eventDetail?.start_time
        ? formatTimeOnly(eventDetail?.start_time, eventDetail?.time_zone, 'time-only')
        : '';
    const endTime = eventDetail?.end_time
        ? formatTimeOnly(eventDetail?.end_time, eventDetail?.time_zone, 'time-only')
        : '';
    const dayName = eventDetail?.start_date ? getOnlyDayName(eventDetail?.start_date) : '';

    const formattedDate =
        startDate && endDate && startDate !== endDate ? `${startDate} - ${endDate}` : startDate;

    const formattedTime = [dayName, startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime]
        .filter(Boolean)
        .join(', ');

    // const formattedTime = `${getOnlyDayName(eventDetail?.start_date)} ${formatTimeOnly(
    //     eventDetail?.start_time,
    //     eventDetail?.time_zone,
    //     'time-only'
    // )} - ${getOnlyDayName(eventDetail?.end_date)} ${formatTimeOnly(
    //     eventDetail?.end_time,
    //     eventDetail?.time_zone,
    //     'time-only'
    // )}`;


    return (
        <View style={styles.dateContainer}>
            <View style={styles.dateSubContainer}>
                <CalendarIcon />
                <Text style={styles.carouselDate}>{formattedDate || 'Date to be confirmed'}</Text>
            </View>
            {formattedTime ? (
                <View style={styles.dateSubContainer}>
                    <ClockIcon />
                    <Text style={styles.carouselDate}>{formattedTime}</Text>
                </View>
            ) : null}
        </View>
    );
}
