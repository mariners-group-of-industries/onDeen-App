import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles'
import ImageWithFallback from '../../components/ImageWithFallback'
import LinearGradient from 'react-native-linear-gradient'
import TouchableLabel from '../../components/customLabels'
import { useNavigation } from '@react-navigation/native'
import { fontFamilies } from '../../assets/fonts/fonts'

export default function AboutOrganisedby({ eventDetail }) {
    const navigation = useNavigation();

    const handleOrganizerClick = () => {
        if (!eventDetail?.organizer) return;
        navigation.navigate('organizerProfile', {
            'user_id': eventDetail?.user_id,
            from: 'CourseDetails',
            eventId: eventDetail?.id
        });
    };

    // Don't render anything if there's no organizer data
    if (!eventDetail?.organizer?.name) {
        return null;
    }

    return (
        <View style={[{
            marginHorizontal: 12,
            gap: 8,
        }]}>
            <View style={[styles.separatorContainer, { marginTop: 4 }]}>
                <View style={styles.separatorLine} />
            </View>
            <Text style={{
                fontSize: 12,
                color: '#545454',
                lineHeight: 16,
                fontFamily: fontFamilies.SFProRoundedBlackMedium,
                marginHorizontal: 8,
            }}>Organised by:</Text>
            <View style={{
                paddingLeft: 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 8,
            }}>
                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        borderWidth: 0.4,
                        borderColor: '#ddd'
                    }}>
                        <ImageWithFallback
                            imageurl={eventDetail?.organizer?.logo}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                            }}
                        />
                    </View>
                    <View>
                        <Text style={styles.organizername}>
                            {eventDetail?.organizer?.name || 'Unknown Organizer'}
                        </Text>
                        <Text style={styles.eventCounts}>
                            {eventDetail?.organizer?.event_count > 1
                                ? `${eventDetail?.organizer?.event_count} more courses`
                                : `${eventDetail?.organizer?.event_count} course available`}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoBtnContainer}>
                    <LinearGradient
                        colors={['#DB3171', '#FFCC33']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.gradientBorder}>
                        <TouchableLabel
                            label={'VIEW INFO'}
                            onPress={handleOrganizerClick}
                            containerStyle={styles.viewallContainer}
                            labelStyle={styles.viewallLabel}
                        />
                    </LinearGradient>
                </View>
            </View>
            <View style={[styles.separatorContainer, { marginTop: 4 }]}>
                <View style={styles.separatorLine} />
            </View>
        </View>
    )
}