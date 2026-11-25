import { View, Text, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import styles from './styles';
import UpDownIcon from '../../../src/assets/svg/upDown.svg';
import CourseIcon from '../../../src/assets/svg/course.svg';
import moment from 'moment';
import RenderHtmlCustome from '../../components/RenderHtmlCustome';
import { formatDate } from '../../components/common';

export default function CourseContainer({ eventDetail }) {
    const [isCourseExpanded, setIsCourseExpanded] = useState(false);

    const toggleCourseDetails = useCallback(() => {
        setIsCourseExpanded(prev => !prev);
    }, []);

    const formatTimeUtc = (utcTimeString) => {
        if (!utcTimeString) return '';
        const utcDateTime = moment.utc(utcTimeString, 'HH:mm'); // Treat it as UTC
        const localTime = utcDateTime.local();
        return localTime.format('h:mm A');
    };
    return (
        <View>
            {eventDetail?.curriculum?.length > 0 && (
                <View style={styles.courseContainer}>
                    <Pressable
                        onPress={toggleCourseDetails}
                        style={styles.courseDropdownContainer}>
                        <Text style={styles.breakdownText}>Course Breakdown</Text>
                        <UpDownIcon
                            width={24}
                            height={24}
                            style={{
                                transform: [{ rotate: isCourseExpanded ? '0deg' : '180deg' }],
                            }}
                        />
                    </Pressable>
                    {isCourseExpanded && (
                        <View>
                            {eventDetail?.curriculum?.map((item, index) => {
                                return (
                                    <View key={item.id} style={{ flexDirection: 'row', paddingBottom: 10 }}>
                                        <View style={styles.courseItems1}>
                                            <CourseIcon />
                                        </View>
                                        <View style={styles.itineraryDetailTxtContainer}>
                                            <Text style={styles.classNumber}>
                                                Class {index + 1}
                                            </Text>
                                            <View style={[{ flexDirection: 'row', gap: 12 },]}>
                                                <RenderHtmlCustome text={item?.description} />
                                            </View>
                                            <View
                                                style={[{ flexDirection: 'row', gap: 12 },]}>
                                                <Text style={styles.classDescription}>
                                                    {`Start Date: ${formatDate(item.start_date)}`}
                                                </Text>
                                                <Text style={styles.classDescription}>
                                                    {`End Date: ${formatDate(item.end_date)}`}
                                                </Text>
                                            </View>
                                            <View
                                                style={[
                                                    {
                                                        flexDirection: 'row',
                                                        gap: 12,
                                                        paddingVertical: 0,
                                                    },
                                                ]}>
                                                <Text style={styles.classDescription}>
                                                    {`Start Time: ${(formatTimeUtc(item.start_time))}`}
                                                </Text>
                                                <Text style={styles.classDescription}>
                                                    {`End Time: ${(formatTimeUtc(item.end_time))}`}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}