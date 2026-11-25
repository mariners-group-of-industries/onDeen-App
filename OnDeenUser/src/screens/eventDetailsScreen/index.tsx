import React, {useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import {widthScale} from '../../helpers/scale';
import GradientButton from '../../components/gradientButton';
import {RootState} from '../../redux/store';
import Loader from '../../components/loader';
import WishlistButton from '../../components/WishlistButton';

const EventDetails = () => {
  const firstCarouselRef = useRef(null);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const MINIMUM_LINES = 2;
  const region = {
    latitude: 24.774265,
    longitude: 46.738586,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const eventsSort1 = useSelector((state: RootState) => state.eventDetails);
  const {status} = useSelector((state: RootState) => state.eventDetails);
  const eventDetail = eventsSort1.eventDetail; // Get event details
  // const fullText =
  //   'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta.';
  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Define all fields with null checks and default values
  const title = eventDetail?.title || 'Default Title';

  const arTitle = eventDetail?.ar_title || 'Default Arabic Title';

  const description =
    eventDetail?.description.replace(/<[^>]*>?/gm, '') ||
    'Default description here';

  const arDescription =
    eventDetail?.ar_description || 'Default Arabic description here';

  const cancellationPolicy =
    eventDetail?.cancellation_policy || 'No cancellation policy available';

  const arCancellationPolicy =
    eventDetail?.ar_cancellation_policy ||
    'No Arabic cancellation policy available';

  const rule = eventDetail?.rule || 'No rules defined';

  const arRule = eventDetail?.ar_rule || 'No Arabic rules defined';

  const eligibility = eventDetail?.eligibility || 'No eligibility criteria';

  const arEligibility =
    eventDetail?.ar_eligibility || 'No Arabic eligibility criteria';

  const termsCondition =
    eventDetail?.terms_condition || 'No terms and conditions available';

  const arTermsCondition =
    eventDetail?.ar_terms_condition ||
    'No Arabic terms and conditions available';

  const price = eventDetail?.price || '0.00';
  const formattedPrice = Math.floor(price);

  const priceType = eventDetail?.price_type || 1;

  const startDate = eventDetail?.start_date || 'Date not available';

  const endDate = eventDetail?.end_date || 'Date not available';

  const tags = eventDetail?.tags || [];

  const primaryImage =
    eventDetail?.primary_image || 'https://via.placeholder.com/150';

  const speakers = eventDetail?.speakers || [];

  const facilities = eventDetail?.facilities || [];

  const location = eventDetail?.location || 'Location not specified';
  const latitude = eventDetail?.latitude || 'Location not specified';
  const longitude = eventDetail?.longitude || 'Location not specified';

  const totalClasses = eventDetail?.total_no_class || '0';

  const callPerWeek = eventDetail?.call_per_week || 0;

  const curriculum = eventDetail?.curriculum || [];

  const documents = eventDetail?.documents || [];

  const images = eventDetail?.images || [];
  const fullText = eventDetail?.description || 'Default description here';

  const _renderItem1 = ({item}) => (
    <View style={styles.carouselItem}>
      <ImageBackground
        source={{uri: item?.primary_image}}
        style={styles.carouselImage}>
        <View style={styles.touchableLabelContainer}>
          <View style={styles.eventDetailContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={navigation.goBack}
              style={[styles.heartIcon]}>
              <Image
                source={require('../../assets/images/chevron-left.png')}
                resizeMode="contain"
                tintColor={'#FFFFFF'}
              />
            </TouchableOpacity>
            <Text style={styles.eventDetailText}>Event Details</Text>
          </View>
          <View style={styles.sharelikeContainer}>
            {/* <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {}}
              style={[styles.heartIcon]}>
              <Image
                source={require('../../assets/images/heart.png')}
                resizeMode="contain"
                tintColor={'#FFFFFF'}
              />
            </TouchableOpacity> */}
            <WishlistButton item={item} heartIconSecondary={styles.heartIcon} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {}}
              style={[styles.heartIcon, {left: 26}]}>
              <Image
                source={require('../../assets/images/share.png')}
                resizeMode="contain"
                tintColor={'#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.paginationContainer}>
          <View style={styles.paginationSubContainer}>
            <Text style={styles.indexText}>{`${activeSlide + 1} / ${
              eventsSort1?.events?.length
            }`}</Text>
          </View>
          <Pagination
            dotsLength={eventsSort1?.events?.length}
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

  if (!eventDetail) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }} 
        animationSource={require('../../../src/assets/loader.json')} 
      />
    );
  }

  if (eventDetail.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Failed to load event details. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar />
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.carouselContainer}>
            <Carousel
              ref={firstCarouselRef}
              data={eventsSort1?.events}
              renderItem={_renderItem1}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              inactiveSlideScale={0.8}
              inactiveSlideOpacity={0.7}
              pagingEnabled={true}
              pinchGestureEnabled={true}
              onSnapToItem={index => setActiveSlide(index)}
              useScrollView={true}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              removeClippedSubviews={false}
              activeSlideAlignment="center"
              layout="default"
              windowSize={5}
              maxToRenderPerBatch={5}
              swipeThreshold={5}
              enableSnap={true}
              enableMomentum={true}
            />
          </View>
          {status === 'loading' && <Loader size={'large'} color="blue" />}

          <View style={styles.detailsContainer}>
            <View style={{flexDirection: 'row', gap: 4}}>
              <View style={styles.imageTouchableContainer}>
                <Image
                  source={require('../../assets/images/Events.png')}
                  resizeMode="contain"
                  style={styles.eventImage}
                />
              </View>
              <TouchableLabel
                label={'New in events'}
                onPress={() => {}}
                containerStyle={styles.newEventContainer}
                labelStyle={styles.customLableNewEvents}
              />
              <TouchableLabel
                leftImage={require('../../assets/images/thunder.png')}
                label={'Filling Fast'}
                onPress={() => {}}
                containerStyle={styles.fillingFastContainer}
                labelStyle={styles.customLableCarousel}
              />
              <TouchableLabel
                label={'Paid Event'}
                onPress={() => {}}
                containerStyle={styles.paidEventContainer}
                labelStyle={styles.customLableCarousel}
              />
              <TouchableLabel
                label={'Unisex'}
                onPress={() => {}}
                containerStyle={styles.unisexContainer}
                labelStyle={styles.customLableCarousel}
              />
            </View>
            <View style={styles.eventNameContainer}>
              {/* <Text style={styles.eventName}>{title}</Text> */}
              <Text style={styles.eventName}>
                {title && title?.length > 26
                  ? `${title?.substring(0, 26)}...`
                  : title || 'Untitled Event'}
              </Text>

              <View style={styles.dotLeft} />
              <TouchableLabel
                // label={'£ 590'}
                label={priceType === 1 ? `£${formattedPrice}` : 'Free'}
                onPress={() => {}}
                labelStyle={styles.priceLabel}
                containerStyle={
                  priceType === 1
                    ? styles.priceContainer
                    : styles.priceContainerFree
                }
              />
              <View style={styles.dotRight} />
            </View>
            <View style={styles.dateContainer}>
              <View style={styles.dateSubContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/calendar.png')}
                />
                <Text style={styles.carouselDate}>{startDate}</Text>
              </View>
              <View style={styles.dateSubContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/clock.png')}
                />
                <Text style={styles.carouselDate}>Tues, 10:30 am</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.organizeContainer}>
              <Text style={styles.organizedText}>Organized by:</Text>
              <View
                style={{
                  paddingLeft: widthScale(12),
                  flexDirection: 'row',
                  gap: widthScale(8),
                }}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/travel.png')}
                />
                <View>
                  <Text style={styles.organizername}>STMS Travel Ventures</Text>
                  <Text style={styles.eventCounts}>12 more events</Text>
                </View>

                <View style={styles.infoBtnContainer}>
                  <LinearGradient
                    colors={['#DB3171', '#FFCC33']}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.gradientBorder}>
                    <TouchableLabel
                      label={'VIEW INFO'}
                      onPress={() => {}}
                      containerStyle={styles.viewallContainer}
                      labelStyle={styles.viewallLabel}
                    />
                  </LinearGradient>
                </View>
              </View>
            </View>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.aboutEventConatiner}>
              <Text style={styles.organizedText}>About event</Text>
              <Text
                style={styles.organizedText}
                numberOfLines={isExpanded ? undefined : MINIMUM_LINES}>
                {description}
              </Text>
              <TouchableOpacity onPress={toggleExpansion}>
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Speakers */}
          {speakers.length > 0 && (
            <View style={styles.speakerContainer}>
              <Text style={styles.speakerText}>Speakers</Text>
              <View style={styles.rowContainer}>
                {speakers.map((speaker, index) => (
                  <View key={index} style={styles.speakerImageContainer}>
                    {/* Display the speaker's profile image */}
                    <Image
                      style={styles.speakerImage}
                      source={{uri: speaker.profile_image}}
                    />
                    {/* Display the speaker's full name */}
                    <Text style={styles.speakerName}>
                      {`${speaker.first_name} ${speaker.last_name}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Event location</Text>
            <View style={styles.locationSubContainer}>
              <Image source={require('../../assets/images/marker-pin.png')} />
              <Text style={styles.addressText}>{location}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.shareImageContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/share-01.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.maps}>
              <MapView
                style={styles.map}
                region={region}
                mapType="standard"
                showsUserLocation={true}
                loadingEnabled={true}>
                <Marker
                  coordinate={{
                    latitude: 24.774265,
                    longitude: 46.738586,
                  }}>
                  <Image
                    source={require('../../assets/images/Subtract.png')}
                    style={styles.marker}
                    resizeMode="contain"
                  />
                </Marker>
              </MapView>
            </View>
            <Text style={styles.priceLastText}>SR 590 onwards</Text>
            <View style={styles.lastContainer}>
              <View style={styles.gradientTextContainer}>
                <Image
                  source={require('../../assets/images/lightning-02.png')}
                  style={styles.lightningImage}
                  resizeMode="contain"
                />
                <MaskedView
                  maskElement={<Text style={styles.text}>Filling fast</Text>}>
                  <LinearGradient
                    colors={['#FF91BB', '#9977F2']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    <Text style={[styles.text, {opacity: 0}]}>
                      Filling fast
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </View>
              <View>
                <GradientButton
                  containerStyle={styles.bookBtnContainer}
                  onPress={() => {}}
                  title={
                    eventDetail?.qrcode?.length > 0
                      ? 'ALREADY BOOKED '
                      : 'BOOK TICKETS'
                  }
                  colors={['#DB3171', '#FFCC33']}
                  start={{x: 0.9, y: 0}}
                  end={{x: 0.1, y: 1}}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default EventDetails;
