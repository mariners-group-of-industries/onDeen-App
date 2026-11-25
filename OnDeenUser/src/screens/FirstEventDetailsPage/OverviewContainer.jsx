import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'
import RenderHtmlCustome from '../../components/RenderHtmlCustome'

export default function OverviewContainer({ eventDetail }) {
    return (
        <View>
            {
                eventDetail?.description &&
                <View style={[styles.aboutEventConatiner, { marginTop: 6 }]}>
                    <Text style={styles.breakdownText}>Overview</Text>
                    <RenderHtmlCustome text={eventDetail?.description} />
                </View>
            }
        </View>
    )
}