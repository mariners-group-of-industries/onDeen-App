import { View, Text, Pressable } from 'react-native'
import React from 'react'
import TouchableLabel from '../../components/customLabels';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import Completion from '../../../src/assets/svg/completion.svg';
import ParticipantImages from '../../components/participants';
import { fontFamilies } from '../../assets/fonts/fonts';

export default function ConformCompleteParticipantLabel({ eventDetail }) {
    const navigation = useNavigation()
    const handleParticipantsClick = () => {
        navigation.navigate('AllParticipants', { event_id: eventDetail?.id });
    };
    const checkPercentage =
        eventDetail?.percentage_completion == '' ||
        eventDetail?.percentage_completion == 'undefined' ||
        eventDetail?.percentage_completion == 'null' ||
        eventDetail?.percentage_completion == undefined ||
        eventDetail?.percentage_completion == null;
    console.log(eventDetail?.status, 'statusstatusstatusstatus');

    return (
        <View style={{
            flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, alignItems: 'center',
            marginBottom: -2,
            marginTop: 5,
            marginLeft: -5,
        }}>
            <View style={{
                flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 10,
                flex: 1
            }}>
                {
                    eventDetail?.status == 2 &&
                    <TouchableLabel
                        label={eventDetail?.status == 2 ? 'Cancelled' : 'Confirmed'}
                        onPress={() => { }}
                        containerStyle={[styles.customLableCarouselSecondaryContainer, {
                            borderWidth: 0.3,
                            borderColor: '#ddd',
                            marginRight: 5
                        }]}
                        labelStyle={{
                            color: eventDetail?.status == 2 ? 'red' : '#4D8D26',
                            fontFamily: fontFamilies.SFProRoundedBlackBold,
                            fontSize: 10,
                        }}
                    />
                }
                {eventDetail?.category_id == 2 && !checkPercentage && (

                    <TouchableLabel
                        labelSecondary={'Complete'}
                        label={`${checkPercentage ? 0 : eventDetail?.percentage_completion}`}
                        onPress={() => { }}
                        containerStyle={styles.customSessionCompleteContainer}
                        labelStyle={styles.customLableSecondaryCarousel}
                        leftImage={<Completion />}
                        labelSecondaryStyle={[
                            styles.customLableSecondaryCarousel,
                            { left: 4 },
                        ]}
                    />
                )}
            </View>
            {(eventDetail?.participant_images?.length > 0 ||
                eventDetail?.total_participants_count > 0) && (
                    <View style={[styles.participantContainer, {
                        flexDirection: 'row', alignItems: 'flex-end', flex: 1, justifyContent: 'flex-end',
                    }]}>
                        <Pressable
                            accessibilityLabel="View participants"
                            accessibilityRole="button"
                            onPress={() => {
                                handleParticipantsClick();
                            }}
                            style={{ paddingRight: 12 }}>
                            <ParticipantImages
                                item={{
                                    participant_images: eventDetail?.participant_images,
                                    total_participants_count: eventDetail?.total_participants_count,
                                }}
                            />
                        </Pressable>
                    </View>
                )}
        </View>
    )
}
