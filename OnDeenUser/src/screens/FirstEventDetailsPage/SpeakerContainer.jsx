import { View, Text, Pressable } from 'react-native'
import React from 'react'
import ImageWithFallback from '../../components/ImageWithFallback'
import { useNavigation } from '@react-navigation/native';
import styles from './styles';

export default function SpeakerContainer({ eventDetail }) {
    const navigation = useNavigation()
    const handleSpeakerClick = (id) => {
        navigation.navigate('SpeakerScreen', {
            speakerId: id,
            eventId: eventDetail?.id,
            from: 'CourseDetails',
        });
    };

    return (
        <View>
            {eventDetail?.speakers?.length > 0 && (
                <View style={styles.speakerContainer}>
                    <Text style={styles.speakerText}>Speakers</Text>
                    <View style={styles.rowContainer}>
                        {eventDetail?.speakers?.map((speaker, index) => (
                            <Pressable
                                accessibilityLabel={`Open speaker profile: ${speaker?.first_name || ''} ${speaker?.last_name || ''}`.trim()}
                                accessibilityRole="button"
                                onPress={() => handleSpeakerClick(speaker?.id)}
                                key={index}
                                style={styles.speakerImageContainer}>
                                <ImageWithFallback
                                    style={styles.speakerImage}
                                    imageurl={speaker?.profile_image}
                                />
                                <Text style={styles.speakerName}>
                                    {speaker?.first_name} {speaker?.last_name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}
        </View>
    )
}
