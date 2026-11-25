import React, { useState, useRef, useCallback } from 'react';
import { Dimensions, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';

const fallbackImage = require('../../../assets/images/eventDetails.png');

export default function CarouselComponent({ eventbyid }) {
  const navigation = useNavigation();
  const images = Array.isArray(eventbyid?.images) ? eventbyid.images : [];

  const imageseee = images.length ? images.map(item => ({
    id: item?.id,
    title: 'Luxury Desert Safari Dubai...',
    date: '24 Aug 2024',
    price: '£ 200',
    image: item?.full_screen_image ? { uri: item.full_screen_image } : fallbackImage,
  })) : [{ id: 'fallback', image: fallbackImage }];

  const firstCarouselRef = useRef(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [activeSlide, setActiveSlide] = useState(0);

  const _renderItem1 = ({ item }) => (
    <View style={[styles.carouselItem, { borderRadius: 24, overflow: 'hidden' }]}>
      <ImageBackground source={item.image} style={styles.carouselImage} imageStyle={styles.carouselImageStyle} resizeMode="cover">
        <View style={styles.touchableLabelContainer}>
          <View style={styles.eventDetailContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={navigation.goBack}
              style={[styles.heartIcon]}>
              <Image
                source={require('../../../assets/images/chevron-left.png')}
                resizeMode="contain"
                tintColor={'#FFFFFF'}
              />
            </TouchableOpacity>
            <Text style={styles.eventDetailText}>Event details</Text>
          </View>
        </View>
        <View style={styles.paginationContainer}>
          <View style={styles.paginationSubContainer}>
            <Text style={styles.indexText}>{`${activeSlide + 1} / ${imageseee.length}`}</Text>
          </View>
          <Pagination
            dotsLength={imageseee.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.pagination}
            dotStyle={styles.activeDot}
            inactiveDotStyle={styles.inactiveDot}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <Carousel
      ref={firstCarouselRef}
      data={imageseee}
      renderItem={_renderItem1}
      sliderWidth={screenWidth}
      itemWidth={screenWidth-20}
      inactiveSlideScale={0.8}
      inactiveSlideOpacity={0.7}
      pagingEnabled={true}
      onSnapToItem={index => setActiveSlide(index)}
      useScrollView={true}
      getItemLayout={(data, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
      })}
      activeSlideAlignment="center"
      layout="default"

    />
  );
}
