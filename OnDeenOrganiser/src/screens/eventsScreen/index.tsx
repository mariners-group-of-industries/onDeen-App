import React, {useRef, useState} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Image,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import {
  carouselData1,
  carouselData2,
  carouselData3,
  carouselData4,
  searchResults,
} from '../../helpers/Constant';
import SearchBar from '../../components/searchBar';
import {useNavigation} from '@react-navigation/native';

const EventsScreen = () => {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [results, setResults] = useState([]);
  const firstCarouselRef = useRef(null);
  const secondCarouselRef = useRef(null);
  const thirdCarouselRef = useRef(null);
  const fourthCarouselRef = useRef(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleOutsidePress = () => {
    if (isSearchVisible) {
      setSearchVisible(false);
      Keyboard.dismiss();
    }
  };

  const filteredResults = searchResults.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const _renderItem1 = ({item}) => (
    <View style={styles.carouselItem}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('CourseDetails', {eventId: item.id})
        }>
        <ImageBackground source={item.image} style={styles.carouselImage}>
          <View style={styles.touchableLabelContainer}>
            <TouchableLabel
              leftImage={require('../../assets/images/thunder.png')}
              label={'Filling Fast'}
              onPress={() => {}}
              containerStyle={styles.customLableCarouselContainer}
              labelStyle={styles.customLableCarousel}
            />
            <TouchableLabel
              label={'Unisex'}
              onPress={() => {}}
              containerStyle={styles.customLableCarouselContainer}
              labelStyle={styles.customLableCarousel}
            />
            <TouchableLabel
              label={'Paid Event'}
              onPress={() => {}}
              containerStyle={styles.customLableCarouselContainer}
              labelStyle={styles.customLableCarousel}
            />
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
          </View>
          <LinearGradient
            colors={['#FFAECC', '#FFD861']}
            style={styles.carouselGradient}>
            <View style={styles.carouselsubContainer}>
              <View>
                <View style={styles.dateIconContainer}>
                  <Icon
                    name={'calendar-blank-outline'}
                    size={16}
                    color="#000000"
                  />
                  <Text style={styles.carouselDate}>{item.date}</Text>
                </View>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <TouchableLabel
                  label={item.price}
                  onPress={() => {}}
                  labelStyle={styles.customLable}
                  containerStyle={styles.customLabelContainer}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {}}
                style={styles.arrowContainer}>
                <Image
                  source={require('../../assets/images/roundedArrow.png')}
                  resizeMode="contain"
                  style={styles.arrowImage}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );

  const _renderItem2 = ({item}) => (
    <View style={styles.carouselSecondaryItem}>
      <ImageBackground
        source={item.image}
        style={styles.carouselSecondaryImage}
        imageStyle={styles.imageBorderRadius}>
        <View style={styles.touchableLabelSecondaryContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={[styles.heartIconSecondary]}>
            <Image
              source={require('../../assets/images/heart.png')}
              resizeMode="contain"
              tintColor={'#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <View style={styles.carouselSecondaryGradient}>
        <View style={styles.carouselsubSecondaryContainer}>
          <View style={styles.textContainer}>
            <View style={styles.dateIconContainer}>
              <Text style={styles.carouselTitle}>{item.title}</Text>
            </View>
            <View style={styles.dateIconSecondContainer}>
              <Icon name={'calendar-blank-outline'} size={16} color="#000000" />
              <Text style={styles.carouselDate}>{item.date}</Text>
              <View>
                <TouchableLabel
                  label={'Free'}
                  onPress={() => {}}
                  containerStyle={styles.customLableCarouselSecondaryContainer}
                  labelStyle={styles.customLableSecondaryCarousel}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView style={[styles.container, {marginTop: insets.top}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: insets.bottom, paddingTop: insets.top + 28},
          ]}>
          {isSearchVisible && (
            <View style={styles.searchBarContainer}>
              <SearchBar
                placeholder="Search event, classes, Tour & meetups etc."
                onSearch={handleSearch}
                results={filteredResults}
                containerStyle={styles.searchBar}
                inputStyle={styles.searchInput}
                resultStyle={styles.searchResult}
                listStyle={styles.searchList}
              />
            </View>
          )}
          <View style={styles.containerStyle}>
            <View style={{flexDirection: 'row', gap: 12}}>
              <Image source={require('../../assets/images/chevron-left.png')} />
              <Text style={styles.titleStyle}>Events</Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => setSearchVisible(!isSearchVisible)}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/searchBlack.png')}
                  style={{right: 22}}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.popularText}>Popular events</Text>
            <Text style={styles.popularText}>this week</Text>
          </View>
          <View style={styles.topeventsContainer}>
            <View style={styles.carouselContainer}>
              <Carousel
                ref={firstCarouselRef}
                data={carouselData1}
                renderItem={_renderItem1}
                sliderWidth={screenWidth}
                itemWidth={screenWidth * 0.93 - 10}
                inactiveSlideScale={0.8}
                inactiveSlideOpacity={0.7}
                pagingEnabled={true}
                pinchGestureEnabled={true}
                onSnapToItem={index => setActiveSlide(index)}
                useScrollView={true}
                getItemLayout={(data, index) => ({
                  length: screenWidth * 0.93,
                  offset: screenWidth * 0.93 * index,
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
              <View style={styles.paginationContainer}>
                <View
                  style={{
                    borderRadius: 50,
                    padding: 5,
                    backgroundColor: '#161616',
                  }}>
                  <Text style={styles.indexText}>{` ${activeSlide + 1} / ${
                    carouselData1.length
                  }`}</Text>
                </View>
                <Pagination
                  dotsLength={carouselData1.length}
                  activeDotIndex={activeSlide}
                  containerStyle={styles.pagination}
                  dotStyle={styles.activeDot}
                  inactiveDotStyle={styles.inactiveDot}
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                />
              </View>
            </View>
            <View style={styles.carouselSecondaryConatiner}>
              <View style={styles.filterContainer}>
                <TouchableLabel
                  containerStyle={styles.interestLabel}
                  labelStyle={styles.interestLabelText}
                  label={'Filter'}
                  onPress={() => {}}
                />
                <TouchableLabel
                  containerStyle={styles.interestLabel}
                  labelStyle={styles.interestLabelText}
                  label={'Sort By'}
                  onPress={() => {}}
                />
                <TouchableLabel
                  containerStyle={styles.interestLabel}
                  labelStyle={styles.interestLabelText}
                  label={'Recommended'}
                  onPress={() => {}}
                />
              </View>
              <Text style={styles.nearbyText}>Happening nearby you</Text>
              <View style={styles.carouselSecondContainer}>
                <Carousel
                  ref={secondCarouselRef}
                  data={carouselData2}
                  renderItem={_renderItem2}
                  sliderWidth={screenWidth * 1.08}
                  itemWidth={screenWidth * 0.46}
                  inactiveSlideScale={0.93}
                  inactiveSlideOpacity={0.95}
                  pinchGestureEnabled={true}
                  useScrollView={true}
                  getItemLayout={(data, index) => ({
                    length: screenWidth * 0.624,
                    offset: screenWidth * 0.624 * index,
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
              <Text style={styles.nearbyText}>Top rated events</Text>
              <View style={styles.carouselThirdContainer}>
                <Carousel
                  ref={thirdCarouselRef}
                  data={carouselData3}
                  renderItem={_renderItem2}
                  sliderWidth={screenWidth * 1.08}
                  itemWidth={screenWidth * 0.46}
                  inactiveSlideScale={0.93}
                  inactiveSlideOpacity={0.95}
                  pinchGestureEnabled={true}
                  useScrollView={true}
                  getItemLayout={(data, index) => ({
                    length: screenWidth * 0.624,
                    offset: screenWidth * 0.624 * index,
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
              <Text style={styles.nearbyText}>Popular among users</Text>
              <View style={styles.carouselFourthContainer}>
                <Carousel
                  ref={fourthCarouselRef}
                  data={carouselData4}
                  renderItem={_renderItem2}
                  sliderWidth={screenWidth * 1.08}
                  itemWidth={screenWidth * 0.46}
                  inactiveSlideScale={0.86}
                  inactiveSlideOpacity={0.95}
                  pinchGestureEnabled={true}
                  useScrollView={true}
                  getItemLayout={(data, index) => ({
                    length: screenWidth * 0.624,
                    offset: screenWidth * 0.624 * index,
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
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default EventsScreen;
