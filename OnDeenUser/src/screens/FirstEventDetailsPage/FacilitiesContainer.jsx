import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'

export default function FacilitiesContainer({eventDetail}) {
  return (
    <View>
      {eventDetail?.facilities?.length > 0 && (
            <View style={[styles.rulesContainer, styles.facilitiesContainer]}>
              <View>
                <View style={styles.courseDropdownContainer}>
                  <Text style={styles.breakdownText}>Facilities</Text>
                </View>

                  <View style={styles.facilitiesList}>
                    {eventDetail?.facilities?.map((item, index) => (
                      <View key={item.id || `${item.facilities_title}-${index}`} style={styles.facilityRow}>
                        <Text style={styles.facilityText}>
                          {`${index + 1}. ${item.facilities_title}`}
                        </Text>
                      </View>
                    ))}
                  </View>
              </View>
            </View>
          )}
    </View>
  )
}
