import React, {useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import MapView, {Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import {heightScale, widthScale} from '../../helpers/scale';
import {courseDetailData} from '../../helpers/Constant';
import GradientButton from '../../components/gradientButton';
const CourseDetails = () => {
  const firstCarouselRef = useRef(null);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCourseExpanded, setIsCourseExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const MINIMUM_LINES = 2;
  const region = {
    latitude: 24.774265,
    longitude: 46.738586,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const fullText =
    'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta.';

  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleCourseDetails = useCallback(() => {
    setIsCourseExpanded(prev => !prev);
  }, []);

  const toggleRulesDetails = useCallback(() => {
    setIsRulesExpanded(prev => !prev);
  }, []);

  const _renderItem1 = ({item}) => (
    <View style={styles.carouselItem}>
      <ImageBackground source={item.image} style={styles.carouselImage}>
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
            <Text style={styles.eventDetailText}>Course deatils</Text>
          </View>
          <View style={styles.sharelikeContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {}}
              style={[styles.heartIcon]}>
              <Image
                source={require('../../assets/images/heart.png')}
                resizeMode="contain"
                tintColor={'#FFFFFF'}
              />
            </TouchableOpacity>
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
              courseDetailData.length
            }`}</Text>
          </View>
          <Pagination
            dotsLength={courseDetailData.length}
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
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carouselContainer}>
          <Carousel
            ref={firstCarouselRef}
            data={courseDetailData}
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
        <View style={styles.detailsContainer}>
          <View style={{flexDirection: 'row', gap: 4}}>
            <View style={styles.imageTouchableContainer}>
              <Image
                source={require('../../assets/images/Courses.png')}
                resizeMode="contain"
                style={styles.eventImage}
              />
            </View>
            <TouchableLabel
              label={'Top 10 in Courses'}
              onPress={() => {}}
              containerStyle={styles.newEventContainer}
              labelStyle={styles.customLableNewEvents}
            />
            <TouchableLabel
              label={'Few seats left'}
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
            <Text style={styles.eventName}>
              Stress management in Islam{'\n'}and the benefits from this
            </Text>
            <View style={styles.dotLeft} />
            <TouchableLabel
              label={'£ 590'}
              onPress={() => {}}
              labelStyle={styles.priceLabel}
              containerStyle={styles.priceContainer}
            />
            <View style={styles.dotRight} />
          </View>
          <View style={styles.dateContainer}>
            <View style={styles.dateSubContainer}>
              <Image
                resizeMode="contain"
                source={require('../../assets/images/calendar.png')}
              />
              <Text style={styles.carouselDate}>Friday - Every week</Text>
            </View>
            <View style={styles.dateSubContainer}>
              <Image
                resizeMode="contain"
                source={require('../../assets/images/clock.png')}
              />
              <Text style={styles.carouselDate}>Tues, 10:30 am</Text>
            </View>
          </View>
          <View style={styles.classContainer}>
            <Text style={styles.classText}>48 Classes</Text>
            <Text style={styles.classSubText}>1 class per week</Text>
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
                source={require('../../assets/images/alBalagh.png')}
              />
              <View>
                <Text style={styles.organizername}>Al Balāgh university</Text>
                <Text style={styles.eventCounts}>2 more courses</Text>
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
            <Text style={styles.journeyLevelText}>Preferred Journey Level</Text>
            <View style={styles.advanceContainer}>
              <Image
                resizeMode="contain"
                source={require('../../assets/images/advance.png')}
              />
              <Text style={styles.journeyLevelValueText}>Advanced</Text>
            </View>
            <Text style={styles.organizedText}>About course</Text>
            <Text
              style={styles.organizedText}
              numberOfLines={isExpanded ? undefined : MINIMUM_LINES}>
              {fullText}
            </Text>
            <TouchableOpacity onPress={toggleExpansion}>
              <Text style={styles.readMoreText}>
                {isExpanded ? 'Read Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Course location</Text>
          <View style={styles.locationSubContainer}>
            <Image source={require('../../assets/images/marker-pin.png')} />
            <Text style={styles.addressText}>
              Behind Venkateshwara Theatre 2 Post, Konappana
            </Text>
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
          {/* <Text style={styles.priceLastText}>£ 590 onwards</Text>
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
                  <Text style={[styles.text, {opacity: 0}]}>Filling fast</Text>
                </LinearGradient>
              </MaskedView>
            </View>
            <View>
              <GradientButton
                containerStyle={styles.bookBtnContainer}
                onPress={() => {}}
                title={'BOOK TICKETS'}
                colors={['#DB3171', '#FFCC33']}
                start={{x: 0.9, y: 0}}
                end={{x: 0.1, y: 1}}
              />
            </View>
          </View> */}
        </View>
        <View style={styles.speakerContainer}>
          <Text style={styles.speakerText}>Speakers</Text>
          <View style={styles.rowContainer}>
            <View style={styles.speakerImageContainer}>
              <Image
                style={styles.speakerImage}
                source={require('../../assets/images/user1.png')}
              />
              <Text style={styles.speakerName}>John Morph</Text>
            </View>

            <View style={styles.speakerImageContainer}>
              <Image
                style={styles.speakerImage}
                source={require('../../assets/images/user3.png')}
              />
              <Text style={styles.speakerName}>Ahmed Sunai</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.speakerImageContainer}>
              <Image
                style={styles.speakerImage}
                source={require('../../assets/images/user2.png')}
              />
              <Text style={styles.speakerName}>Mohammed Diwan</Text>
            </View>
          </View>
        </View>
        <View style={styles.courseContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={toggleCourseDetails}
            style={styles.courseDropdownContainer}>
            <Text style={styles.breakdownText}>Course Breakdown</Text>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/dropup.png')}
            />
          </TouchableOpacity>
          {isCourseExpanded && (
            <View>
              <View style={styles.courseItems}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/course.png')}
                />
                <Text style={styles.classNumber}>Class 01</Text>
              </View>
              <View style={styles.classDetailTxtContainer}>
                <Text style={styles.classHeading}>Nullam volutpat odio</Text>
                <Text style={styles.classDescription}>
                  Vivamus volutpat vulputate fringilla. Nullam lacinia facilisis
                  mi a convallis.
                </Text>
              </View>

              <View style={styles.courseItems}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/course.png')}
                />
                <Text style={styles.classNumber}>Class 02</Text>
              </View>
              <View style={styles.classDetailTxtContainer}>
                <Text style={styles.classHeading}>Nullam volutpat odio</Text>
                <Text style={styles.classDescription}>
                  Vivamus volutpat vulputate fringilla. Nullam lacinia facilisis
                  mi a convallis.
                </Text>
              </View>

              <View style={styles.courseItems}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/course.png')}
                />
                <Text style={styles.classNumber}>Class 03</Text>
              </View>
              <View style={styles.classDetailTxtContainer}>
                <Text style={styles.classHeading}>Nullam volutpat odio</Text>
                <Text style={styles.classDescription}>
                  Vivamus volutpat vulputate fringilla. Nullam lacinia facilisis
                  mi a convallis.
                </Text>
              </View>
            </View>
          )}
        </View>
        {/* rules section  */}
        <View style={styles.rulesContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={toggleRulesDetails}
            style={styles.courseDropdownContainer}>
            <Text style={styles.breakdownText}>Rules and Eligibility</Text>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/dropup.png')}
            />
          </TouchableOpacity>
          {isRulesExpanded && (
            <View>
              <Text style={styles.classNumber}>Eligibility</Text>
              <View style={styles.rulesDetailTxtContainer}>
                <View style={styles.criteriaContainer}>
                  <Text style={styles.classDescription}>
                    Criteria for enrolling
                  </Text>
                  <Text style={styles.classHeading}>
                    Nullam lacinia facilisis mi a convallis.
                  </Text>
                </View>
                <View>
                  <Text style={styles.classDescription}>
                    Preferred Journey Level
                  </Text>
                  <Text style={styles.classHeading}>Advanced </Text>
                </View>
                <Text style={styles.classDescription}>Total Classes </Text>
                <View style={styles.totalclassContainer}>
                  <Text style={styles.classHeading}>48 classes </Text>
                  <Text style={styles.classHeading}>• 1 class per week </Text>
                </View>
              </View>
              <View style={styles.courseItems}>
                <Text style={styles.classNumber}>Rules & regulations</Text>
              </View>
              <View style={styles.rulesRglTxtContainer}>
                <Text style={styles.classHeading}>Nullam volutpat odio</Text>
                <Text style={[styles.classDescription, {paddingRight: 40}]}>
                  Vivamus volutpat vulputate fringilla. Nullam lacinia facilisis
                  mi a convallis.
                </Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.lastContainer}>
          <View style={styles.gradientTextContainer}>
            <Text style={styles.priceLastText}>£ 10,000 onwards</Text>
            <TouchableLabel
              labelStyle={styles.fewSeatsLabel}
              label={'Few seats left'}
              onPress={() => {}}
              containerStyle={{paddingHorizontal: 8, paddingVertical: 2}}
            />
          </View>
          <View style={{marginTop: 20}}>
            <GradientButton
              containerStyle={styles.bookBtnContainer}
              onPress={() => {}}
              title={'BOOK TICKETS'}
              colors={['#DB3171', '#FFCC33']}
              start={{x: 0.9, y: 0}}
              end={{x: 0.1, y: 1}}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CourseDetails;
