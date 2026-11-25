import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native'
import React, { useRef } from 'react'
import Carousel from 'react-native-snap-carousel'
import ParticipantImages from '../../components/participants';
import TouchableLabel from '../../components/customLabels';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import RightArrow from '../../../src/assets/svg/rightArrow.svg';
import UpArrow from '../../../src/assets/svg/upArrowWhole.svg';

export default function VerticalCarousel({ upcomingBookings }) {
    const navigation = useNavigation();
    const carouselRef = useRef(null);
    const { width: screenWidth } = Dimensions.get('window');
    const openBookingDetails = (item) => {
        navigation.navigate('BookingDetails', {
            id: item?.event_id || item?.event?.id || item?.id,
            eventId: item?.event_id || item?.event?.id || item?.id,
            participant_id: item?.participant_id || item?.ticket_id,
            booking: item,
        });
    };

    const _renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => openBookingDetails(item)}
            style={styles.carouselSecondaryItem}>
            <ImageBackground
                source={{ uri: item?.primary_image }}
                style={styles.carouselSecondaryImage}>
                {item?.status == 2 ? (
                    <View style={styles.touchableLabelSecondaryContainer}>
                        <TouchableLabel
                            label={'Cancelled'}
                            onPress={() => { }}
                            containerStyle={[styles.customLableCarouselSecondaryContainer, {
                                backgroundColor: 'red',
                            }]}
                            labelStyle={styles.customLableSecondaryCarousel}
                        />
                    </View>
                ) : (
                    <View style={styles.touchableLabelSecondaryContainer}>
                        <TouchableLabel
                            label={'Confirmed'}
                            onPress={() => { }}
                            containerStyle={styles.customLableCarouselSecondaryContainer}
                            labelStyle={styles.customLableSecondaryCarousel}
                        />
                    </View>
                )}
            </ImageBackground>
            <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ width: '70%' }}>
                    <View style={styles.carouselSecondaryGradient}>
                        <Text style={[styles.carouselTitle, { paddingBottom: 5 }]}>
                            {item?.title && item?.title?.length > 30
                                ? `${item?.title.substring(0, 30)}...`
                                : item?.title || 'Untitled Event'}
                        </Text>
                        <View style={styles.dateIconContainer}>
                            <CalendarIcon />
                            <Text style={styles.carouselDate}>
                                {new Date(item?.start_date).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ width: '30%', padding: 10 }}>
                    <TouchableOpacity
                        style={styles.carouselsubSecondaryContainer}
                        activeOpacity={0.7}
                        onPress={() => openBookingDetails(item)}>
                        <UpArrow width={36} height={36} />
                    </TouchableOpacity>
                    <ParticipantImages
                        item={{
                            participant_images: item?.participant_images,
                            total_participants_count: item?.total_participants_count,
                        }}
                        containerStyle={{
                            justifyContent: 'flex-end',
                        }}
                        imageWrapperStyle={{
                            height: 22,
                            width: 22,
                            borderRadius: 22,
                            borderColor: '#E1E1E1',
                            borderWidth: 2,
                            overflow: 'hidden',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F3F3F3',
                        }}
                        moreWrapperStyle={{
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 0,
                            height: 22,
                            width: 22,
                            borderRadius: 22,
                        }}
                        moreTextStyle={{
                            textAlign: 'center',
                            fontSize: 12,
                            bottom: 1,
                        }}
                    />
                </View>


            </View>
        </TouchableOpacity>
    );
    return (
        <View>
            <Carousel
                ref={carouselRef}
                data={upcomingBookings}
                renderItem={_renderItem}
                sliderWidth={screenWidth}
                itemWidth={screenWidth * 0.9}
                inactiveSlideScale={0.96}
                pinchGestureEnabled={true}
                removeClippedSubviews={true}
                useScrollView={true}
                getItemLayout={(data, index) => ({
                    length: screenWidth * 0.9,
                    offset: screenWidth * 0.9 * index,
                    index,
                })}
                //    onSnapToItem={index => setActiveSlide(index)}
                activeSlideAlignment="start"
                layout="default"
            />
        </View>
    )
}
