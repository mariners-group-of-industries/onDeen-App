import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Dropup from '../../../assets/svg/dropup.svg';
import Course from '../../../assets/svg/course.svg';
import styles from './styles';
import RenderHtmlCustome from '../../../common/RenderHtmlCustome';

export default function Curriculum({ curriculum }) {
    const [isCourseExpanded, setIsCourseExpanded] = useState(true);

    const toggleCourseDetails = () => {
        setIsCourseExpanded(prevState => !prevState);
    };
    console.log(curriculum, 'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRcurriculumcurriculumcurriculumcurriculum');

    return (
        <>
            {curriculum?.length > 0 && (
                <View style={styles.courseContainer}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={toggleCourseDetails}
                        style={styles.courseDropdownContainer}>
                        <Text style={styles.breakdownText}>Course Breakdown</Text>
                        <Dropup  width={24}  height={24}
                            style={{
                                transform: [{ rotate: isCourseExpanded ? '180deg' : '0deg' }],
                            }}
                        />
                    </TouchableOpacity>
                    {isCourseExpanded && (
                        <View>
                            {curriculum.map((item, index) => (
                                <View key={item.id} style={styles.courseItems}>
                                    <Course width={32} height={32} />
                                    <View>
                                        <Text style={styles.classNumber}> CLASS {index + 1} </Text>
                                        <RenderHtmlCustome text={item?.description} />
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
