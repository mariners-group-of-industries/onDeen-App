import React, {useEffect, useMemo, useRef, useState} from 'react';
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
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {eventSortAPI} from '../../redux/slices/sorteventSlice';
import {RootState} from '../../redux/store';
import {fetchSearchResults} from '../../redux/slices/searchSlice';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import SearchBar from '../../components/SearchInput';
import Loader from '../../components/loader';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import UpArrow from '../../../src/assets/svg/upArrowWhole.svg';
import Filter from '../../../src/assets/svg/filter.svg';
import WishlistButton from '../../components/WishlistButton';
import LatestHeader from '../../components/LatestHeader';
import FilterModal from '../../modals/FilterModal';
import {clearFilterApplyData} from '../../redux/slices/applyFilterSlice';
import SortFilterModal from '../../modals/SortFilter';
import NoData from '../../components/NoData';
import ImageWithFallback from '../../components/ImageWithFallback';

const EventsScreen = ({route}) => {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const firstCarouselRef = useRef(null);
  const secondCarouselRef = useRef(null);
  const thirdCarouselRef = useRef(null);
  const fourthCarouselRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<any>('');

  const handleSortApply = (sort: any) => {
    setSortModalVisible(false);
  };
  const data = {
    category_id: [],
    price_type: [],
    start_date: null,
    end_date: null,
    location: [],
    journey_level_id: [],
    organizer_id: [],
    speakers: [],
    sort_Filter: [],
  };
  const [selectedFilters, setSelectedFilters] = useState<any>(data);

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleApplyFilters = (filters: any) => {
    setModalVisible(false);
  };

  const resetAllFilters = () => {
    dispatch(clearFilterApplyData());
    setSelectedSort(null);
    setSelectedFilters({
      category_id: [],
      price_type: [],
      start_date: null,
      end_date: null,
      location: [],
      journey_level_id: [],
      organizer_id: [],
      speakers: [],
      sort_Filter: [],
    });
  };

  const dispatch = useDispatch();
  const {events, currentPage, pages, total, error, status} = useSelector(
    (state: RootState) => state.eventDetails,
  );
  const {
    categoryId,
    eventName,
    isFromCategory,
    organizerId,
    longitude,
    latitude,
    address,
  } = route.params;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const {
    organizerEvents1,
    organizerEvents2,
    organizerEvents3,
    organizerEvents4,
  } = useSelector((state: RootState) => state.eventDetails);

  const {filterApplyData, filterStatus} = useSelector(
    (state: RootState) => state.applyFilterSlice,
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Simulate a loading time
    return () => clearTimeout(timer);
  }, []);

  function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const handleResultSelect = (item: {id: number; title: string}) => {
    // Navigate or perform other actions
  };

  const {searchResults} = useSelector((state: RootState) => state.searchSlice);

  const [query, setQuery] = useState('');

  // Debounced search query
  const debouncedQuery = useDebounce(query, 500);

  // Trigger API call when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() !== '') {
      dispatch(fetchSearchResults(debouncedQuery));
    }
  }, [debouncedQuery, dispatch]);

  const searchedItem = ({
    item,
  }: {
    item: {id: number; title: string; category_image: string};
  }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleEventPress(item)} // Pass item to the function
    >
      <View style={styles.resultImageContainer}>
        {/* <Image
          resizeMode="contain"
          source={
            item?.category_image
              ? {uri: item?.category_image}
              : require('../../assets/images/Union.png')
          }
          style={styles.resultImage}
        /> */}
        <ImageWithFallback
          imageurl={item?.category_image}
          style={{height: 16, width: 16}}
        />
      </View>
      <Text style={styles.resultText}>{item.title}</Text>
    </TouchableOpacity>
  );
  // In the handleEventPress function, you should accept the item parameter
  const handleEventPress = item => {
    // dispatch(fetchEventById(item?.id));
    navigation.navigate('CourseDetails', {
      eventId: item?.id,
      eventName: item?.title,
      eventData: item,
      categoryId:categoryId
    });
  };

  const handleOutsidePress = () => {
    if (isSearchVisible) {
      setSearchVisible(false);
      Keyboard.dismiss();
    }
  };

  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);

  // Remove refreshing from the dependencies of this effect

  const [isDataFetched, setIsDataFetched] = useState(false);

  const sorteventproperly = async () => {
    if (isDataFetched || refreshing) return;
    try {
      setRefreshing(true);
      const payloads = [1, 2, 3, 4].map(sort => ({
        category_id: categoryId,
        sort,
        longitude,
        latitude,
      }));

      const responses = await Promise.all(
        payloads.map(payload => dispatch(eventSortAPI({data: payload}))),
      );

      setData1(responses[0]?.payload?.response?.events);
      setData2(responses[1]?.payload?.response?.events);
      setData3(responses[2]?.payload?.response?.events);
      setData4(responses[3]?.payload?.response?.events);

      setIsDataFetched(true);
    } catch (error) {

    } finally {
      setRefreshing(false);
    }
  };

  // Remove the unnecessary useEffect with refreshing state

  const isFetched = useRef(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clearFilterApplyData());
      setIsDataFetched(false);
      handleRefresh();
      setSelectedFilters(data);
      setSelectedSort(null);
      return () => {
        dispatch(clearFilterApplyData());
      };
    }, []),
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      dispatch(clearFilterApplyData());
      setIsDataFetched(false);
      await sorteventproperly();
    } catch (error) {

    } finally {
      setRefreshing(false);
    }
  };

  const carousel1Data = isFromCategory ? data1 : organizerEvents1;
  const carousel2Data = isFromCategory ? data2 : organizerEvents2;
  const carousel3Data = isFromCategory ? data3 : organizerEvents3;
  const carousel4Data = isFromCategory ? data4 : organizerEvents4;

  // const filteredResults = searchResults.filter(item =>
  //   item.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  const formatDate = dateString => {
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const _renderItem1 = ({item}) => {
    const imageSource = item?.primary_image
      ? {uri: item.primary_image}
      : require('../../assets/images/dummy1.png');
    const formattedStartDate = item?.start_date
      ? formatDate(item?.start_date)
      : null;
    const formattedEndDate = item?.end_date ? formatDate(item?.end_date) : null;
    const tagsArray = item?.tags
      ? item.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag)
      : [];

    const handleEventPress = () => {
      // dispatch(fetchEventById(item?.id));
      navigation.navigate('CourseDetails', {
        eventId: item?.id,
        eventName: item?.title,
        // eventName: eventName,
      categoryId:categoryId,

      });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleEventPress}
        style={styles.carouselItem}>
        {/* Background Image */}
        <ImageBackground source={imageSource} style={styles.carouselImage}>
          {/* Top Label Container */}
          <View style={styles.touchableLabelContainer}>
            {/* Dynamically Render Tags */}
            {/* {tagsArray.slice(0, 3).map((tag, index) => (
              <TouchableLabel
                key={index}
                label={tag}
                onPress={() => {
                  // navigation.navigate('EventDetails', {
                  //   eventId: item.id,
                  //   eventName: item.title,
                  // });
                }}
                containerStyle={styles.customLableCarouselContainer}
                labelStyle={styles.customLableCarousel}
              />
            ))} */}

            {/* Favorite Icon */}
            <WishlistButton
              item={item}
              heartIconSecondary={styles.heartIcon}
              type="allevents"
              handleRefresh={handleRefresh}
            />
          </View>

          <LinearGradient
            colors={['#FFAECC', '#FFD861']}
            style={styles.carouselGradient}>
            {/* Main Info Container */}
            <View style={styles.carouselsubContainer}>
              <View>
                <View style={styles.dateIconContainer}>
                  <Icon name="calendar-blank-outline" size={16} color="#000" />
                  <Text style={styles.carouselDate}>{formattedStartDate}</Text>
                </View>

                <Text style={styles.carouselTitle}>
                  {item.title && item.title.length > 35
                    ? `${item.title.substring(0, 35)}...`
                    : item.title || 'Untitled Event'}
                </Text>

                <TouchableLabel
                  label={item?.price_type === 1 ? `£${item?.price}` : 'Free'}
                  onPress={() => {}}
                  labelStyle={styles.customLable}
                  containerStyle={
                    item?.price_type === 1
                      ? styles.customLabelContainer
                      : styles.priceContainerFree
                  }
                />
              </View>
              {/* Arrow Navigation */}
              <TouchableOpacity activeOpacity={0.8} onPress={handleEventPress}>
                <UpArrow width={widthScale(35)} height={heightScale(35)} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const handleSnapToItem = (index: number) => {
    setActiveIndex(index);
  };

  const _renderItem2 = useMemo(() => {
    return ({item}) => {
      const imageSource = item?.primary_image
        ? {uri: item.primary_image}
        : require('../../assets/images/dummy1.png');
      const formattedStartDate = item?.start_date
        ? formatDate(item.start_date)
        : null;
      const formattedEndDate = item?.end_date
        ? formatDate(item.end_date)
        : null;
      const tagsArray = item?.tags
        ? item.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
        : [];

      const handleEventPress = () => {
        navigation.navigate('CourseDetails', {
          eventId: item?.id,
          eventName: item?.title,
      categoryId:categoryId,
          // eventName: eventName,
        });
      };

      return (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleEventPress}
          style={styles.carouselSecondaryItem}>
          <ImageBackground
            source={imageSource}
            style={styles.carouselSecondaryImage}
            imageStyle={styles.imageBorderRadius}>
            <View style={styles.touchableLabelSecondaryContainer}>
              <WishlistButton item={item} />
            </View>
          </ImageBackground>
          {/* </ShimmerPlaceholder> */}
          <View style={styles.carouselSecondaryGradient}>
            <View style={styles.carouselsubSecondaryContainer}>
              <View style={styles.textContainer}>
                <View style={styles.dateIconContainer}>
                  <Text style={styles.carouselTitle}>
                    {item.title && item.title.length > 20
                      ? `${item.title.substring(0, 20)}...`
                      : item.title || 'Untitled Event'}
                  </Text>
                  {/* </ShimmerPlaceholder> */}
                </View>
                <View style={styles.dateIconSecondContainer}>
                  <Icon
                    name={'calendar-blank-outline'}
                    size={16}
                    color="#000000"
                  />

                  <Text style={styles.carouselDate}>{formattedStartDate}</Text>

                  <View>
                    {tagsArray?.length > 0 && (
                      <TouchableLabel
                        label={
                          item.price_type === 1 ? `£${item?.price}` : 'Free'
                        }
                        onPress={() => {}}
                        labelStyle={styles.customLable}
                        containerStyle={
                          item?.price_type === 1
                            ? styles.customLabelContainer
                            : styles.priceContainerFree
                        }
                      />
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    };
  }, [carousel2Data]);
  const isFilterApplied = Object.values(selectedFilters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== null,
  );
  const isSortFilterApplied = selectedSort != null ? true : false;

  if (filterStatus === 'loading') {
    return (
      <Loader
        isLoading={true}
        containerStyle={{backgroundColor: '#FDFBFF'}}
        animationSource={require('../../../src/assets/loader.json')}
      />
    );
  }

  const isFilterApplied11 = Object.values(selectedFilters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== null,
  );

  // if (isFilterApplied11) {
  //   return (
  //     <View style={styles.centered}>
  //       <NoData
  //         heading={'Opps No Data Found Please Try Again.'}
  //         title={error}
  //         buttonTitle={'Refresh'}
  //         onPress={handleRefresh}
  //       />
  //     </View>
  //   );
  // }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <>
        <LatestHeader
          statusBarColor="#F9F6FD"
          title={eventName || 'Events'}
          leftIconName="chevron-left"
          onLeftPress={() => navigation.goBack()}
          titleStyle={{
            color: '#000000',
            fontSize: fontScale(16),
          }}
          // containerStyle={{paddingTop: insets.top}}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          nestedScrollEnabled={true}
          bounces={false}
          style={{backgroundColor: '#F9F6FD'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }>
          <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
            
               {/* {isSearchVisible && ( */}
              <View style={[styles.searchBarContainer]}>
                <SearchBar
                  placeholder="Search event, classes, Tour & meetups etc."
                  results={searchResults}
                  onResultSelect={handleResultSelect}
                  resultStyle={styles.searchResult}
                  containerStyle={styles.searchBar}
                  inputStyle={styles.searchInput}
                />
              </View>
             {/* )} */}
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id?.toString()}
              renderItem={searchedItem}
            />
            {carousel1Data?.length > 0 && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <Text style={styles.popularText}>
                  Top {eventName} Happening
                </Text>
                <Text style={styles.popularText}>This Week</Text>
              </View>
            )}
            <View style={styles.topeventsContainer}>
              {isLoading ? (
                <Loader
                  isLoading={true}
                  containerStyle={{backgroundColor: '#F9F6FD'}}
                  animationSource={require('../../../src/assets/loader.json')}
                />
              ) : (
                <>
                  {carousel1Data?.length > 0 && (
                    <View style={styles.carouselContainer}>
                      <Carousel
                        ref={firstCarouselRef}
                        data={isFromCategory ? data1 : organizerEvents1}
                        renderItem={_renderItem1}
                        sliderWidth={screenWidth * 0.915}
                        itemWidth={screenWidth * 0.915}
                        pagingEnabled={true}
                        useScrollView={false}
                        removeClippedSubviews={true}
                        activeSlideAlignment="center"
                        // layout="default"
                        enableSnap={true}
                        decelerationRate="fast"
                        windowSize={5}
                        onSnapToItem={index => setActiveSlide(index)}
                        // invertStickyHeaders={true}
                        // inactiveSlideScale={0.8}
                        inactiveSlideOpacity={0.7}
                        pinchGestureEnabled={true}
                        // useScrollView={true}
                        getItemLayout={(data, index) => ({
                          length: screenWidth * 0.915,
                          offset: screenWidth * 0.915 * index,
                          index,
                        })}
                        layout="default"
                        maxToRenderPerBatch={5}
                        swipeThreshold={5}
                        enableMomentum={true}
                        inactiveSlideScale={0.9}
                      />

                      <View style={styles.paginationContainer}>
                        <View
                          style={{
                            borderRadius: 50,
                            padding: 5,
                            backgroundColor: '#161616',
                          }}>
                          <Text style={styles.indexText}>{` ${
                            activeSlide + 1
                          } / ${
                            // events?.length
                            isFromCategory
                              ? data1?.length
                              : organizerEvents1.length
                          }`}</Text>
                        </View>
                        <Pagination
                          dotsLength={
                            isFromCategory
                              ? data1?.length
                              : organizerEvents1?.length
                          }
                          activeDotIndex={activeSlide}
                          containerStyle={styles.pagination}
                          dotStyle={styles.activeDot}
                          inactiveDotStyle={styles.inactiveDot}
                          inactiveDotOpacity={0.4}
                          inactiveDotScale={0.6}
                        />
                      </View>
                    </View>
                  )}

                  {!isLoading && 
                    !data1?.length &&
                    !data2?.length &&
                    !data3?.length &&
                    !data4?.length && 
                    (
                      <View style={styles.centered}>
                        <NoData
                         heading={'NO EVENTS FOUND'}
                          title={error}
                          buttonTitle={'Back To Category'}
                          onPress={() => {
                            navigation.navigate('Home');
                          }}
                        />
                      </View>
                    )}

                  <View style={styles.carouselSecondaryConatiner}>
                  
                    <View style={styles.filterContainer}>
                      <TouchableLabel
                        containerStyle={styles.interestLabel}
                        labelStyle={styles.interestLabelText}
                        label={'Filters'}
                        onPress={() => setModalVisible(true)}
                        leftImage={<Filter />}
                        leftImageStyle={{marginRight: 8}}
                      />
                      <TouchableLabel
                        containerStyle={styles.interestLabel}
                        labelStyle={styles.interestLabelText}
                        // label={'Sort By'}
                        onPress={() => setSortModalVisible(true)}
                        // leftImage={<Filter />}
                        leftImageStyle={{marginRight: 8}}
                      />

                      {/* <TouchableLabel
                        containerStyle={[
                          styles.interestLabel,
                          {
                            width: widthScale(72),
                          },
                        ]}
                        labelStyle={styles.interestLabelText}
                        label={'Free'}
                        onPress={() => {}}
                      />
                      <TouchableLabel
                        containerStyle={[
                          styles.interestLabel,
                          {
                            width: widthScale(72),
                          },
                        ]}
                        labelStyle={styles.interestLabelText}
                        label={'Paid'}
                        onPress={() => {}}
                      /> */}
                      {isFilterApplied11 ? (
                        <TouchableLabel
                          containerStyle={styles.interestLabel}
                          labelStyle={styles.interestLabelText}
                          label={'Clear All'}
                          onPress={() => {
                            resetAllFilters();
                            closeModal();
                            setSelectedSort(null);
                          }}
                        />
                      ) : null}

                      <FilterModal
                        isVisible={isModalVisible}
                        onClose={closeModal}
                        onApply={handleApplyFilters}
                        // onClearFilters={resetAllFilters} // No more TypeScript error
                        categoryId={categoryId}
                        longitude={longitude}
                        latitude={latitude}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        selectedSort={selectedSort}
                      />
                      <SortFilterModal
                        isVisible={isSortModalVisible}
                        onClose={() => setSortModalVisible(false)}
                        onApply={handleSortApply}
                        selectedSort={selectedSort}
                        setSelectedSort={setSelectedSort}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                      />
                    </View>
                     
                    {/* {selectedFilters?.length>0 &&
                      filterApplyData?.events?.length > 0 && (
                        <View style={styles.centered}>
                          <NoData
                            heading={'Oops! No Data Found. Please Try Again.'}
                            title={error}
                            buttonTitle={'Refresh'}
                            onPress={handleRefresh}
                          />
                        </View>
                      )} */}
                    {filterApplyData?.events?.length > 0 && (
                      <>
                        <Text style={styles.nearbyText}>
                          Based On Your Search
                        </Text>
                        <View style={styles.carouselSecondContainer}>
                          <FlatList
                            data={filterApplyData?.events}
                            renderItem={_renderItem2}
                            keyExtractor={(item, index) => index?.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={5}
                            windowSize={5}
                            getItemLayout={(data, index) => ({
                              length: screenWidth * 0.624,
                              offset: screenWidth * 0.624 * index,
                              index,
                            })}
                          />
                        </View>
                      </>
                    )}

                    {carousel2Data?.length > 0 &&
                      !isFilterApplied &&
                      !isSortFilterApplied && (
                        <>
                          <Text style={styles.nearbyText}>
                            Happening Nearby You
                          </Text>
                          <View style={styles.carouselSecondContainer}>
                            <Carousel
                              ref={secondCarouselRef}
                              data={carousel2Data}
                              renderItem={_renderItem2}
                              itemWidth={screenWidth * 0.46}
                              activeSlideAlignment="start"
                              layout="default"
                              enableSnap={true}
                              decelerationRate="fast"
                              maxToRenderPerBatch={5}
                              onSnapToItem={handleSnapToItem}
                              sliderWidth={screenWidth}
                              inactiveSlideScale={0.9}
                              inactiveSlideOpacity={0.95}
                              pinchGestureEnabled={true}
                              removeClippedSubviews={true}
                              useScrollView={true}
                              getItemLayout={(data, index) => ({
                                length: screenWidth * 0.624,
                                offset: screenWidth * 0.624 * index,
                                index,
                              })}
                              windowSize={5}
                              swipeThreshold={5}
                              enableMomentum={true}
                            />
                          </View>
                        </>
                      )}

                    {data3?.length > 0 &&
                      !isFilterApplied &&
                      !isSortFilterApplied && (
                        <>
                          <Text style={styles.nearbyText}>
                            Popular {eventName}
                          </Text>
                          <View style={styles.carouselThirdContainer}>
                            <Carousel
                              ref={thirdCarouselRef}
                              data={isFromCategory ? data3 : organizerEvents3}
                              renderItem={_renderItem2}
                              // sliderWidth={screenWidth * 1.08}
                              itemWidth={screenWidth * 0.46}
                              removeClippedSubviews={true} // Improved performance by rendering only visible slides
                              activeSlideAlignment="start"
                              layout="default"
                              enableSnap={true}
                              decelerationRate="fast" // Ensure smooth deceleration
                              maxToRenderPerBatch={5} // Increase to preload more items
                              swipeThreshold={5} // Higher threshold for smoother swipe experience
                              sliderWidth={screenWidth}
                              inactiveSlideScale={0.9}
                              inactiveSlideOpacity={0.95}
                              pinchGestureEnabled={true}
                              useScrollView={true}
                              getItemLayout={(data, index) => ({
                                length: screenWidth * 0.46,
                                offset: screenWidth * 0.46 * index,
                                index,
                              })}
                              windowSize={5}
                              enableMomentum={true}
                            />
                          </View>
                        </>
                      )}

                    {data4?.length > 0 &&
                      !isFilterApplied &&
                      !isSortFilterApplied && (
                        <>
                          <Text style={styles.nearbyText}>
                            Upcoming {eventName}
                          </Text>
                          <View style={styles.carouselFourthContainer}>
                            <Carousel
                              ref={fourthCarouselRef}
                              data={isFromCategory ? data4 : organizerEvents4}
                              renderItem={_renderItem2}
                              itemWidth={screenWidth * 0.46}
                              removeClippedSubviews={true} // Helps reduce memory usage
                              activeSlideAlignment="start"
                              layout="default"
                              enableSnap={true} // Ensures snapping to slides
                              decelerationRate="fast" // Ensures smoother deceleration
                              swipeThreshold={5} // Higher threshold for smoother swipe experience
                              maxToRenderPerBatch={5} // Preload a few more items for smoothness
                              sliderWidth={screenWidth}
                              inactiveSlideScale={0.9}
                              inactiveSlideOpacity={0.95}
                              pinchGestureEnabled={true}
                              useScrollView={true}
                              getItemLayout={(data, index) => ({
                                length: screenWidth * 0.46,
                                offset: screenWidth * 0.46 * index,
                                index,
                              })}
                              windowSize={5}
                              enableMomentum={true}
                            />
                          </View>
                        </>
                      )}
                  </View>
                </>
              )}
            </View>
          </SafeAreaView>
        </ScrollView>
      </>
    </TouchableWithoutFeedback>
  );
};

export default EventsScreen;
