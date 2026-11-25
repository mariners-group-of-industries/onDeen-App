import { View, Text, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import UpDownIcon from '../../../src/assets/svg/upDown.svg';
import styles from './styles';
import CourseIcon from '../../../src/assets/svg/course.svg';
import ItenaryIcon from '../../../src/assets/svg/Itenary.svg';
import { formatDate, formatDateType, formatTimeUtc } from '../../components/common';
import { formatTimeOnly } from '../../timezone/maintimezone';

export default function ItinerariesContainer({ eventDetail }) {
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  const toggleRulesDetails = useCallback(() => {
    setIsRulesExpanded(prev => !prev);
  }, []);

  return (
    <View>
      {eventDetail?.itineraries &&
        eventDetail?.itineraries?.length > 0 &&
        eventDetail?.category_id == 3 && (
          <View style={[styles.rulesContainer, {}]}>
            <Pressable
              onPress={toggleRulesDetails}
              style={styles.courseDropdownContainer}>
              <Text style={styles.breakdownText}>Itineraries</Text>
              <UpDownIcon
                width={24}
                height={24}
                style={{
                  transform: [
                    { rotate: isRulesExpanded ? '0deg' : '180deg' },
                  ],
                }}
              />
            </Pressable>

            {isRulesExpanded && (
              <View>
                {[2, 3, 4, 9].includes(eventDetail?.category_id) && (
                  <View style={{ marginTop: -10 }}>
                    {eventDetail?.itineraries?.map((item, index) => (
                      <View key={item.id} style={[styles.itineraryContainer, { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10, }]}>
                        <View style={styles.courseItems}>
                          {eventDetail?.category_id == 2 ? <CourseIcon /> : <ItenaryIcon />}
                        </View>
                        <View style={[styles.itineraryDetailTxtContainer]}>
                          <Text style={styles.classNumber}>
                            {eventDetail?.category_id == 2
                              ? `Class ${index + 1}`
                              : `Destination ${index + 1}`}
                          </Text>
                          {/* Itinerary Title */}
                          <Text style={styles.classHeading}>
                            {item.title}
                          </Text>

                          {/* Start Timing */}
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Text style={styles.classDescription}>
                              {`Start Date: ${formatDate(item.start_date)}`}
                            </Text>
                            <Text style={styles.classDescription}>
                              {`End Date: ${formatDate(item.end_date)}`}
                            </Text>
                          </View>

                          {/* End Timing */}
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Text style={styles.classDescription}>
                              {`Start Time:${formatTimeUtc(item?.start_time)}`}
                            </Text>
                            <Text style={styles.classDescription}>
                              {`End Time: ${formatTimeUtc(item?.end_time)}`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

              </View>
            )}
          </View>
        )}

    </View>
  )
}