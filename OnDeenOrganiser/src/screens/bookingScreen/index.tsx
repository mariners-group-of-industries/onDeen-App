import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import styles from './styles';
import Carousel from 'react-native-snap-carousel';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TouchableLabel from '../../components/customLabels';
import CustomHeader from '../../components/customHeader';
import {heightScale, widthScale} from '../../helpers/scale';
import {bookingData, homeCarouselData1} from '../../helpers/Constant';
import AnimatedSwipe from '../../components/swipeBar';

const BookingScreen = () => {
  const carouselRef = useRef(null);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [activeSlide, setActiveSlide] = useState(0);

  const _renderItem = ({item}) => (
    <View style={styles.carouselSecondaryItem}>
      <ImageBackground
        source={item.image}
        style={styles.carouselSecondaryImage}>
        <View style={styles.touchableLabelSecondaryContainer}>
          <TouchableLabel
            label={'Confirmed'}
            onPress={() => {}}
            containerStyle={styles.customLableCarouselSecondaryContainer}
            labelStyle={styles.customLableSecondaryCarousel}
          />
        </View>
      </ImageBackground>
      <View style={styles.carouselSecondaryGradient}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <View style={styles.dateIconContainer}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/calendar.png')}
            tintColor={'#000000'}
          />
          <Text style={styles.carouselDate}>{item.date}</Text>
        </View>
        <TouchableOpacity
          style={styles.carouselsubSecondaryContainer}
          activeOpacity={0.7}
          onPress={() => {}}>
          <Image
            source={require('../../assets/images/roundedArrow.png')}
            style={styles.arrowImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingItem = ({item}) => (
    <View style={styles.activeBookingContainer}>
      <View style={styles.bokkingItemsContainer}>
        <View>
          <Image source={item.image} style={styles.itemImage} />
        </View>
        <View style={styles.activeBookingSubContainer}>
          <View style={styles.dateIconContainer}>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/calendar.png')}
              tintColor={'#000000'}
            />
            <Text style={styles.carouselDate}>{item.date}</Text>
          </View>
          <Text style={styles.carouselItemTitle}>{item.title}</Text>
          <Text style={styles.statusText}>{item.status}</Text>

          <TouchableOpacity
            style={styles.carouselItemContainer}
            activeOpacity={0.7}
            onPress={() => {}}>
            <Image
              source={require('../../assets/images/rightArrow.png')}
              style={styles.arrowImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {marginBottom: insets.bottom + 60}]}>
      <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
        <CustomHeader
          statusBarColor="#FDFBFF"
          rightImageSource={require('../../assets/images/searchBlack.png')}
          containerStyle={{
            paddingVertical: heightScale(12),
            paddingHorizontal: widthScale(24),
          }}
          rightImageStyle={styles.containerImage}
          title="My Bookings"
          titleStyle={styles.headerTitle}
        />
        <View style={styles.bookingContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.tabButton,
              activeTab === 'active' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('active')}>
            <Text
              style={
                activeTab === 'active' ? styles.activeText : styles.inactiveText
              }>
              Active Bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.tabButton,
              activeTab === 'completed' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('completed')}>
            <Text
              style={
                activeTab === 'completed'
                  ? styles.activeText
                  : styles.inactiveText
              }>
              Completed Bookings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.carouselContainer}>
          <Text style={styles.carouselHeading}>Upcoming this week</Text>
          <Carousel
            ref={carouselRef}
            data={homeCarouselData1}
            renderItem={_renderItem}
            sliderWidth={screenWidth}
            itemWidth={screenWidth * 0.78}
            inactiveSlideScale={0.9}
            pinchGestureEnabled={true}
            removeClippedSubviews={true}
            useScrollView={true}
            getItemLayout={(data, index) => ({
              length: screenWidth * 0.78,
              offset: screenWidth * 0.78 * index,
              index,
            })}
            onSnapToItem={index => setActiveSlide(index)}
            activeSlideAlignment="start"
            layout="default"
            windowSize={5}
            maxToRenderPerBatch={5}
            swipeThreshold={5}
            enableSnap={true}
            enableMomentum={true}
          />
        </View>
        <Text style={styles.bookingHeading}>Active bookings</Text>
        
        {/* <AnimatedSwipe
          swipeThreshold={widthScale(250)}
          onSwipeComplete={handleSwipeComplete}
        /> */}
      </ScrollView>
    </View>
  );
};

export default BookingScreen;
