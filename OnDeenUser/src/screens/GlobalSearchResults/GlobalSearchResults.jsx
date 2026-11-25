import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  Pressable,
} from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styles from '../BottomHomePage/styles';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import Trending from '../../../src/assets/svg/trending.svg';
import Laptop from '../../../src/assets/svg/laptop.svg';
import MarkerLocation from '../../../src/assets/svg/marker.svg';
import WishlistButton from '../../components/WishlistButton';
import Loader from '../../components/loader';
import NoData from '../../components/NoData';
import ImageWithFallback from '../../components/ImageWithFallback';

import { callFilterAPIForList } from '../../redux/slices/mainpageSlice';
import LatestHeader from '../../components/LatestHeader';
import { GOOGLE_MAP_KEY } from '../../helpers/Constant';

const GlobalSearchResults = ({ route }) => {
  const { latitude, longitude, address, keyword } = route.params || {};


  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(address || 'Fetching Location');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const data = {
    keyword: keyword,
  };
  const GOOGLE_API_KEY = GOOGLE_MAP_KEY;

  const mainpagelist = useSelector(
    (state) => state.mainpagelist?.filterApplyData?.events,
  );
  const { filterStatus, error } = useSelector(
    (state) => state.mainpagelist,
  );

  const coordinates = useRef({
    latitude: latitude || null,
    longitude: longitude || null,
    address: address || null,
  });

  useEffect(() => {
    if (!latitude || !longitude) {
      fetchLocation();
    }
  }, [latitude, longitude]);

  const fetchLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          const lat = Number(latitude);
          const lng = Number(longitude);

          if (isNaN(lat) || isNaN(lng)) {
            Alert.alert('Error', 'Invalid coordinates received.');
            return;
          }

          coordinates.current = { latitude: lat, longitude: lng };

          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
            );

            if (response?.data?.status !== 'OK') {
              console.error(
                'Error with Geocoding API:',
                response?.data?.error_message,
              );
              return;
            }

            const addressComponents =
              response.data?.results[0]?.address_components;
            const city = addressComponents?.find((component) =>
              component.types.includes('locality'),
            )?.long_name;

            if (city) {
              setLocation(city);
            } else {

              setLocation('Location Not Fetched');
            }
          } catch (apiError) {

            setLocation('API Error');
          }
        },
        error => {

          Alert.alert('Error', 'Unable to fetch location. ' + error.message);
          setLocation('Location Error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (err) {

      Alert.alert('Error', 'Something went wrong: ' + err.message);
    }
  };

  const requestLocationPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      }

      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        const requestResult = await request(permission);

        if (requestResult === RESULTS.GRANTED) {
          return true;
        } else {

          return false;
        }
      }


      return false;
    } catch (err) {

      return false;
    }
  };

  const formatDate = (item) => {
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    const startTime = new Date(`1970-01-01T${item.start_time}`);

    if (item.category_id === 2) {
      // Course: Aug 24, 10:00 AM
      return `${startDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      })}, ${startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    } else if (item.category_id === 3 || item.category_id === 1) {
      // Tour/Event: Sep 30 - Aug 7
      return `${startDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      })} - ${endDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      })}`;
    }
    return '';
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('CourseDetails', {
          // categoryId: item.id,
          eventId: item?.id,
        });
      }}
      style={styles.activeBookingContainer}>
      <View style={styles.bokkingItemsContainer}>
        <Image
          progressiveRenderingEnabled={true}
          source={{ uri: item?.primary_image }}
          style={styles.itemImage}
        />
        <View style={styles.activeBookingSubContainer}>
          <View>

            <View style={styles.dateIconContainer}>
              {/* <CalendarIcon /> */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: widthScale(8),
                }}>
                <View
                  style={{
                    height: heightScale(22),
                    width: widthScale(22),
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FFE0EB',
                  }}>
                  <ImageWithFallback
                    imageurl={item?.category_image}
                    style={[
                      styles.image,
                      { width: widthScale(18), height: heightScale(18) },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.eventDate,
                    {
                      fontFamily: fontFamilies.SFProRoundedBlackMedium,
                      color: '#606060',
                    },
                  ]}>
                  {item?.category_title}
                </Text>
                <Text
                  style={[
                    styles.eventDate,
                    {
                      color: '#606060',
                    },
                  ]}>
                  {formatDate(item)}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  navigation.navigate('BookingDetails', {
                    bookingId: item?.id,
                    participant_id: item?.participant_id,
                  });
                }}
                style={styles.carouselItemContainer}
              >
                <WishlistButton item={item} type="homepage" />
              </Pressable>
            </View>
            <Text style={styles.carouselItemTitle}>
              {item?.title && item?.title?.length > 32
                ? `${item?.title?.substring(0, 32)}...`
                : item?.title || 'Untitled Event'}
              {/* {item.title} */}
            </Text>
            {item?.organization_name && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontSize: fontScale(12),
                    color: '#606060',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                    paddingRight: 90,
                    lineHeight: 18
                  }}>
                  {item?.organization_name}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {item?.price_type === 1 || item?.ticket_price && (
              <Text
                style={{
                  fontSize: fontScale(12),
                  color: '#606060',
                  lineHeight: 14,
                  fontFamily: fontFamilies.SFProRoundedBlackRegular,
                }}>
                Starts From:
              </Text>
            )}
            <Text
              style={{
                fontSize: fontScale(12),
                color: item?.price_type === 1 ? '#161616' : '#28B446',
                // lineHeight: 16,
                fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
              }}>
              {item?.ticket_price !== null && item?.ticket_price !== undefined
                ? `£ ${new Intl.NumberFormat('en-GB').format(
                  Number(item?.ticket_price),
                )}`
                : item?.price_type === 1
                  ? `£ ${new Intl.NumberFormat('en-GB').format(
                    Number(item?.price),
                  )}`
                  : 'FREE'}
            </Text>
          </View>
          <View>
            {/* Location Display */}
            {Number(item?.location_type) === 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'flex-end',
                  bottom: 16,
                }}>
                <Laptop />
                <Text
                  style={{
                    fontSize: fontScale(12),
                    color: '#45C624',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                  }}>
                  Online
                </Text>
              </View>
            ) : Number(item?.location_type) === 2 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'flex-end',
                  bottom: 16,
                }}>
                <Laptop />
                <Text
                  style={{
                    fontSize: fontScale(12),
                    color: '#422199',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                  }}>
                  Hybrid
                </Text>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    justifyContent: 'flex-end',
                    bottom: 16,
                  }}>
                  <MarkerLocation />
                  <Text
                    style={{
                      fontSize: fontScale(12),
                      color: '#606060',
                      lineHeight: 14,
                      fontFamily: fontFamilies.SFProRoundedBlackRegular,
                    }}>
                    {item?.distance} mi
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );


  const hitapitogetdatafilter = useCallback(async () => {
    setIsLoading(true);
    await dispatch(callFilterAPIForList(data));
    setIsLoading(false);
  }, [dispatch]);


  useEffect(() => {
    hitapitogetdatafilter();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, []),
  );

  if (filterStatus === 'failed') {
    return (
      <View style={styles.centered}>
        <NoData
          heading={'Try Again After Sometime'}
          title={error}
          buttonTitle={'Home'}
          onPress={hitapitogetdatafilter}
        />
      </View>
    );
  }
  const ContainerComponent = SafeAreaView;


  return (
    <ContainerComponent style={[styles.container]}>
      <LatestHeader
        title={'Searched Result'}
        titleStyle={{
          color: '#131313',
          fontSize: fontScale(14),
          fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
        }}
        containerStyle={{
          justifyContent: 'flex-start',
          // bottom: 20,
        }}
        statusBarColor="#F9F6FD"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingBottom: insets.bottom },
        ]}>
        <View>

          {/* <SearchBar
            // placeholder={t('HomeScreen.SerachBatText')}
            placeholder={`Find things to do in ${location}`}
            results={searchResults}
            onResultSelect={handleResultSelect}
            resultStyle={styles.searchResult}
            containerStyle={styles.searchBar}
            inputStyle={styles.searchInput}
            // listStyle={styles.searchList}
            onFilterPress={() => {
              setModalVisible(true);
            }}
            hellonavigate={true}
          /> */}
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 14,
              alignItems: 'center',
              justifyContent: 'center',

              paddingVertical: heightScale(12),
            }}>
            <Text style={styles.exploreText}>
              Searched Results For {keyword}
            </Text>
            <Trending height={24} width={24} />
          </View>
          {isLoading ? (
            <Loader
              isLoading={true}
              containerStyle={{ backgroundColor: '#F9F6FD', flex: 1 }}
              animationSource={require('../../assets/loader.json')}
            />
          ) : Array.isArray(mainpagelist) && mainpagelist?.length > 0 ? (
            <FlatList
              data={mainpagelist}
              renderItem={renderBookingItem}
              keyExtractor={item => item.id?.toString()}
              style={{
                paddingBottom: heightScale(30),
              }}
            />
          ) : (
            <NoData
              heading={'NO DATA FOUND'}
              onPress={hitapitogetdatafilter}
              buttonTitle={'Home'}
            />
          )}
        </View>
      </ScrollView>
    </ContainerComponent>
  );
};

export default GlobalSearchResults;
