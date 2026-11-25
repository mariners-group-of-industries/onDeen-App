import { View, Text, Pressable, Share, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import MarkerPinIcon from '../../../src/assets/svg/markerpin.svg';
import styles from './styles';
import ShareIcon from '../../../src/assets/svg/share.svg';
import CommonMapMarker from '../../components/CommonMapMarker';
import OpenMeetLink from './OpenMeetLink';

export default function LocationContainer({ eventDetail }) {
    const onShareDestinationLocation = async () => {
        const latitude = eventDetail?.to_latitude || 13.0468;
        const longitude = eventDetail?.to_longitude || 77.6267;
        const location = eventDetail?.to_location || '';

        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationMessage = `Address: ${location}. location url: ${googleMapsUrl}`;

        try {
            const result = await Share.share({
                message: locationMessage, // The message includes latitude, longitude, and address
                url: googleMapsUrl, // The URL is the Google Maps link for the location
                title: 'Share Location', // Optional title for iOS
            });

            if (result.action == Share.sharedAction) {
                if (result.activityType) {
                } else {
                }
            } else if (result.action == Share.dismissedAction) {
            }
        } catch (error) {

        }
    };
    const onShareLocation = async () => {
        const latitude = eventDetail?.latitude || 13.0468;
        const longitude = eventDetail?.longitude || 77.6267;
        const location = eventDetail?.location || '';

        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationMessage = `Address: ${location}. location url: ${googleMapsUrl}`;


        try {
            const result = await Share.share({
                message: locationMessage, // The message includes latitude, longitude, and address
                url: googleMapsUrl, // The URL is the Google Maps link for the location
                title: 'Share Location', // Optional title for iOS
            });

            if (result.action == Share.sharedAction) {
                if (result.activityType) {
                    // Handle share with activityType (optional)
                } else {
                    // Handle standard share
                }
            } else if (result.action == Share.dismissedAction) {
                // Handle dismissed action
            }
        } catch (error) {

        }
    };
    return (
        <>
            {[0, 2].includes(Number(eventDetail?.location_type)) && eventDetail?.meet_link && (
                <OpenMeetLink eventDetail={eventDetail}/>
            )}
            {[1, 2].includes(Number(eventDetail?.location_type)) && (
                <View style={[{
                    padding: 12,
                    paddingBottom: 24,
                    borderRadius: 32,
                    backgroundColor: '#FDFBFF',
                    elevation: 1,
                    marginTop: 4,
                    paddingHorizontal: 24,
                },]}>


                    {eventDetail?.to_location && [1, 2].includes(Number(eventDetail?.location_type)) && (
                        <View style={{ marginTop: 10, }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                // backgroundColor: 'red'
                                width: '100%'
                            }}>
                                <View style={{ width: '85%' }}>
                                    {eventDetail?.to_location ? (
                                        <Text style={styles.locationText}>Destination Location</Text>
                                    ) : (
                                        <></>
                                    )}
                                    <View>
                                        <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
                                            <MarkerPinIcon />
                                            {eventDetail?.to_location?.trim() ? (
                                                <Text style={styles.addressText}>
                                                    {eventDetail.to_location}
                                                </Text>
                                            ) : eventDetail?.location?.trim() ? (
                                                <Text style={styles.addressText}>
                                                    {eventDetail.location}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>

                                </View>

                                <Pressable
                                    onPress={onShareDestinationLocation}
                                    style={styles.locationSubContainer}>


                                    <View style={styles.shareImageContainer}>
                                        <ShareIcon />
                                    </View>
                                </Pressable>
                            </View>
                            <View style={[styles.maps]}>
                                <CommonMapMarker
                                    data={{
                                        latitude: eventDetail?.to_latitude,
                                        longitude: eventDetail?.to_longitude,
                                    }}
                                />
                            </View>
                        </View>

                    )}
                    <View style={{ marginTop: 15, }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            <View style={{ width: '85%' }}>
                                {eventDetail?.to_location ? (
                                    <Text style={styles.locationText}>Enquiry Location</Text>
                                ) : (
                                    <Text style={styles.locationText}>
                                        Event Location
                                    </Text>
                                )}
                                <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
                                    <MarkerPinIcon />
                                    <Text style={styles.addressText}>
                                        {eventDetail?.location}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={onShareLocation}
                                style={styles.locationSubContainer}>

                                <View style={styles.shareImageContainer}>
                                    <ShareIcon />
                                </View>
                            </Pressable>
                        </View>

                        <View style={styles.maps}>
                            <CommonMapMarker
                                data={{
                                    latitude: eventDetail?.latitude,
                                    longitude: eventDetail?.longitude,
                                }}
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    )
}
