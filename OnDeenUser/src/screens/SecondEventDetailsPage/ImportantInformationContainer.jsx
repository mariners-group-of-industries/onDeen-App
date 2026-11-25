import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles'
import UpDownIcon from '../../../src/assets/svg/upDown.svg';
import RenderHtmlCustome from '../../components/RenderHtmlCustome';

export default function ImportantInformationContainer({
    eventDetail,
    isItineraries,
    toggleItenariesDetails
}) {
    return (
        <View style={styles.rulesContainer}>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={toggleItenariesDetails}
                style={styles.courseDropdownContainer}>
                <Text style={styles.breakdownText}>
                    Important Information
                </Text>
                <UpDownIcon
                    width={24}
                    height={24}
                    style={{
                        transform: [{ rotate: isItineraries ? '0deg' : '180deg' }],
                    }}
                />
            </TouchableOpacity>

            {isItineraries && (
                <View>
                    {!!eventDetail?.eligibility?.length && (
                        <>
                            <Text style={[styles.classHeading, { paddingTop: 6 }]}>
                                Eligibility
                            </Text>
                            <View style={styles.itineraryContainer}>
                                <View style={[styles.renderHtmlContainer, { gap: 0 }]}>
                                    <RenderHtmlCustome text={eventDetail?.eligibility} />
                                </View>
                            </View>
                        </>
                    )}

                    {!!eventDetail?.rule?.length && (
                        <>
                            <Text style={[styles.classHeading, { paddingTop: 6 }]}>
                                What's Included
                            </Text>
                            <View style={styles.itineraryContainer}>
                                <View style={[styles.renderHtmlContainer, { gap: 0 }]}>
                                    <RenderHtmlCustome text={eventDetail?.rule} />
                                </View>
                            </View>
                        </>
                    )}

                    {!!eventDetail?.cancellation_policy?.length && (
                        <>
                            <Text style={[styles.classHeading, { paddingTop: 6 }]}>
                                Cancellation policy
                            </Text>
                            <View style={styles.itineraryContainer}>
                                <View style={[styles.renderHtmlContainer, { gap: 0 }]}>
                                    <RenderHtmlCustome
                                        text={eventDetail?.cancellation_policy}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {!!eventDetail?.terms_condition?.length && (
                        <>
                            <Text style={[styles.classHeading, { paddingTop: 6 }]}>
                                Terms & Condition
                            </Text>
                            <View style={styles.itineraryContainer}>
                                <View style={[styles.renderHtmlContainer, { gap: 0 }]}>
                                    <RenderHtmlCustome
                                        text={eventDetail?.terms_condition}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    )
}