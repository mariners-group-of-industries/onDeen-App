import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Pressable,
} from 'react-native';
import React, { useRef, useState } from 'react';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import WishlistButton from '../../components/WishlistButton';
import ImageViewing from 'react-native-image-viewing';
import ShareIconComponent from './ShareIconComponent';

const fallbackImage = require('../../assets/images/eventDetails.png');

export default function FirstCarousel({ carouselData = [], eventDetail }) {
  const firstCarouselRef = useRef(null);
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');

  const images = Array.isArray(carouselData) && carouselData.length > 0 ? carouselData : [null];
  const imageUrl = images[0] || '';

  const _renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => item && setFullscreenVisible(true)}>
      <View style={styles.carouselItem}>
        <ImageBackground
          source={item ? { uri: item } : fallbackImage}
          style={styles.carouselImage}
          imageStyle={styles.carouselImageStyle}
          resizeMode="cover">
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={[styles.touchableLabelContainer]}>
            <Pressable
              onPress={() => navigation.navigate('MainNavigator')}
              style={[styles.eventDetailContainer]}>
              <View style={styles.heartIcon}>
                <ChevronLeft color={'#fff'} />
              </View>
              <Text style={styles.eventDetailText}>Event Details</Text>
            </Pressable>

            <View style={styles.sharelikeContainer}>
              <WishlistButton
                item={eventDetail}
                heartIconSecondary={styles.heartIcon}
                type={'eventbyid'}
                IsScreen="coursedetails"
              />
              <ShareIconComponent eventDetail={eventDetail} imageUrl={imageUrl} />
            </View>
          </View>

          <View style={styles.paginationContainer}>
            <View style={styles.paginationSubContainer}>
              <Text style={styles.indexText}>
                {`${activeSlide + 1} / ${images?.length}`}
              </Text>
            </View>
            <Pagination
              dotsLength={images?.length}
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
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.carouselContainer}>
        <Carousel
          ref={firstCarouselRef}
          data={images}
          renderItem={_renderItem}
          sliderWidth={screenWidth}
          itemWidth={screenWidth}
          inactiveSlideScale={0.8}
          inactiveSlideOpacity={0.7}
          pagingEnabled
          pinchGestureEnabled
          onSnapToItem={(index) => setActiveSlide(index)}
          useScrollView
          removeClippedSubviews={false}
          activeSlideAlignment="center"
          layout="default"
          windowSize={5}
          maxToRenderPerBatch={5}
          swipeThreshold={5}
          enableSnap
          enableMomentum
        />
      </View>

      {fullscreenVisible && (
        <View
          style={[
            styles.container,
            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
          ]}>
          <ImageViewing
            images={images.filter(Boolean).map((img) => ({ uri: img }))}
            imageIndex={activeSlide}
            visible={fullscreenVisible}
            onRequestClose={() => {
              setFullscreenVisible(false);
              StatusBar.setBarStyle('dark-content', true);
            }}
            onImageIndexChange={(index) => {
              setActiveSlide(index);
              firstCarouselRef.current?.snapToItem(index);
            }}
          />

          <View
            style={[styles.paginationContainer, { position: 'absolute', bottom: 20 }]}>
            <View style={styles.paginationSubContainer}>
              <Text style={styles.indexText}>
                {activeSlide + 1} / {images.length}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
