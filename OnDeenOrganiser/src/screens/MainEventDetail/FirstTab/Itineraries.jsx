import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Dropup from '../../../assets/svg/dropup.svg';
import Course from '../../../assets/svg/course.svg';
import styles from './styles';

export default function Itineraries({ itineraries }) {
    const [isCourseExpanded, setIsCourseExpanded] = useState(true);

    const toggleCourseDetails = () => {
        setIsCourseExpanded(prevState => !prevState);
    };

    return (
        <>
            {itineraries?.length > 0 && (
                <View style={styles.courseContainer}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={toggleCourseDetails}
                        style={styles.courseDropdownContainer}>
                        <Text style={styles.breakdownText}>Itinerary breakdown</Text>
                        <Dropup style={{ transform: [{ rotate: isCourseExpanded ? '180deg' : '0deg' }], }} />
                    </TouchableOpacity>
                    {isCourseExpanded && (
                        <View>
                            {itineraries.map((item, index) => (
                                <View key={item.id}>
                                    <View style={styles.courseItems}>
                                        <Course />
                                        <View>
                                        <Text style={styles.classNumber}>
                                            DAY {item.day}
                                        </Text>
                                        <View style={styles.classDetailTxtContainer}>
                                            <Text style={styles.classDescription}>{item.title} </Text>
                                            <Text style={styles.classtime}>{item.start_time}  {item.end_time} </Text>
                                        </View>
                                            </View>
                                    </View>

                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </>
    );
}

