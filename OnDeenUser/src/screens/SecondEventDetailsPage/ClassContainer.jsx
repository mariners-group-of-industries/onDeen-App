import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'

export default function ClassContainer({ eventDetail }) {
    const explicitTotal = Number(eventDetail?.total_no_class);
    const derivedDays = eventDetail?.start_date && eventDetail?.end_date
        ? Math.max(
            1,
            Math.round((new Date(eventDetail.end_date) - new Date(eventDetail.start_date)) / (1000 * 60 * 60 * 24)) + 1,
        )
        : null;
    const total = Number.isFinite(explicitTotal) && explicitTotal > 0 ? explicitTotal : derivedDays;

    if (!total) {
        return null;
    }

    const label = eventDetail?.category_id == 2
        ? total == 1 ? 'Class' : 'Classes'
        : total == 1 ? 'Day' : 'Days';

    return (
        <View style={styles.classContainer}>
            <Text style={styles.classSubTextJourney}>
                {`${total} ${label}`}
            </Text>
        </View>
    )
}
