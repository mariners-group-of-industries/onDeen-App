import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  InteractionManager,
} from 'react-native';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import SearchBar from '../../components/SearchInput';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import CustomHeader from '../../components/CustomHeader';
import { fontScale, requestLocationPermission } from '../../helpers/scale';
import { fetchSearchResults } from '../../redux/slices/searchSlice';
import { fontFamilies } from '../../assets/fonts/fonts';
import Polygon from '../../../src/assets/svg/Polygon.svg';
import Arrows from '../../../src/assets/svg/arrows.svg';
import Loader from '../../components/loader';
import NoData from '../../components/NoData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilterModal from '../../modals/FilterModal';
import SortFilterModal from '../../modals/SortFilter';
import { clearLastAttemptedEventId } from '../../redux/slices/loginSlice';
import StatusBarManager from '../../components/statusbarManager';
import { useStatusBar } from '../../components/statusbar';
import { callHomepageCategory, callhomeoage, filterAllHomePageEvents, getFilterListOptions, publicHomepageCategory, publicHomepageData } from '../../redux/callapis/CommonService';
import AppTourNew from '../../components/AppTourNew';
import RenderListItem from './RenderListItem';
import CatgeorylistItem from './CatgeorylistItem';
import { useFilter } from '../../context/FilterContext';
import { getsortlabels } from '../../components/common';
import { ScrollView } from 'react-native';
import {
  buildHomeEventFilter,
  buildHomepageFeedFilter,
  extractEventList,
  extractNotificationCount,
  normalizeCategories,
  shouldUseHomepageFeed,
} from './homeData';
import GamificationGate from '../../components/gamification/GamificationGate';
import { GOOGLE_MAP_KEY } from '../../helpers/Constant';

const IOS_SIMULATOR_LOCATION = {
  latitude: 51.5074,
  longitude: -0.1278,
  address: 'London',
};

const HOME_EVENTS_CACHE_KEY = 'ondeen_home_events_v1';
const HOME_CATEGORIES_CACHE_KEY = 'ondeen_home_categories_v1';

const readCachedArray = async (key) => {
  try {
    const cachedValue = await AsyncStorage.getItem(key);
    const parsedValue = cachedValue ? JSON.parse(cachedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (_error) {
    return [];
  }
};

const cacheArray = async (key, value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return;
  }

  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    // Caching is best-effort; live data remains the source of truth.
  }
};

const BottomHomePage = ({ route }) => {
  const { latitude, longitude, address } = route.params || {};
  const { filter1, setFilter1, hithomepageapi, setHithomepageapi, resetFilter } = useFilter();

  const data = {
    category_id: [],
    price_type: [],
    start_date: null,
    end_date: null,
    location: [],
    journey_level_id: [],
    organizer_id: [],
    gender_id: [],
    speakers: [],
    sort_Filter: [],
    latitude: '',
    longitude: '',
  };
  const navigation = useNavigation();
  const [location, setLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locallocation, setLocallocation] = useState("");
  const [locallongitude, setLocallongitude] = useState("");
  const [locallatitude, setLocallatitude] = useState("");
  const [showTour, setShowTour] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = React.useState(1);
  const [selectedFilters, setSelectedFilters] = useState(data);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const eventFetchSequence = useRef(0);
  const dispatch = useDispatch();
  useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });
  const lastEventId = useSelector(state => state.user.lastAttemptedEventId);
  const isLogin = useSelector(state => state.user.isLogin);

  useEffect(() => {
    if (isLogin && lastEventId && !hasRedirected) {
      setHasRedirected(true);
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('CourseDetails', {
          eventId: lastEventId,
          fromLoginRedirect: true,
        });
        dispatch(clearLastAttemptedEventId());
      });
    }
  }, [isLogin, lastEventId, hasRedirected]);

  const prevHitHomepageApi = useRef(hithomepageapi);

  useEffect(() => {
    if (prevHitHomepageApi.current != hithomepageapi && filter1) {
      setLoading(true)
      fetchEventList();
    }
    prevHitHomepageApi.current = hithomepageapi;
  }, [hithomepageapi, filter1]);


  useFocusEffect(
    useCallback(() => {
      fetchEventList();
    }, [location])
  );

  const GOOGLE_API_KEY = GOOGLE_MAP_KEY;

  const coordinates = useRef({
    latitude: latitude || null,
    longitude: longitude || null,
    address: address || null,
  });

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSortApply = (sort) => {
    setSortModalVisible(false);
  };

  useEffect(() => {
    if (address) {
      setLocation(`${address}`);
    }
  }, [address]);

  const handleApplyFilters = (filters) => {
    setSelectedFilters(filters);
    setModalVisible(false);
  };

  const resetAllFilters = () => {
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
      latitude: '',
      longitude: '',
    });
  };

  useEffect(() => {
    const checkAppTour = async () => {
      const appTourShown = await AsyncStorage.getItem('app_tour_shown');
      const firstLogin = await AsyncStorage.getItem('first_time_login');

      if (!appTourShown || firstLogin === 'true') {
        setShowTour(true);
        await AsyncStorage.setItem('app_tour_shown', 'true');
        await AsyncStorage.setItem('first_time_login', 'false');
      }
    };

    checkAppTour();
  }, []);

  function useDebounce(value, delay) {
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

  const handleResultSelect = (item) => {
    // Navigate or perform other actions
  };

  const searchResults = useSelector(state => state?.searchSlice.searchResults);

  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim() !== '') {
      dispatch(fetchSearchResults(debouncedQuery));
    }
  }, [debouncedQuery, dispatch]);

  const fetchLocation = async () => {
    try {
      setIsFetchingLocation(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsFetchingLocation(false);
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude, accuracy } = position.coords;
          const lat = Number(latitude);
          const lng = Number(longitude);

          if (accuracy > 1000) {
            Alert.alert(
              'Low Accuracy Location',
              'Your location may not be precise. Consider enabling precise location in device settings.'
            );
          }

          if (isNaN(lat) || isNaN(lng)) {
            Alert.alert('Error', 'Invalid coordinates received.');
            setIsFetchingLocation(false);
            setLocation('');
            return;
          }

          coordinates.current = { latitude: lat, longitude: lng };
          setLocallatitude(lat)
          setLocallongitude(lng)


          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
            );

            if (response.data.status !== 'OK') {
              console.error(
                'Error with Geocoding API:',
                response.data.error_message,
              );
              return;
            }

            const addressComponents = response.data?.results[0]?.address_components;
            const city = addressComponents?.find((component) =>
              component.types.includes('locality'),
            )?.long_name;

            if (city) {
              setLocation(city);
              setFilter1('latitude', lat)
              setFilter1('longitude', lng)
              setFilter1('location', city)
              setLocallocation(city)
              // setHithomepageapi(hithomepageapi + 1);

            } else {

              setLocation('');
            }
          } catch (apiError) {

            setLocation('');
          } finally {
            setIsFetchingLocation(false);
          }
        },
        error => {

          Alert.alert('Error', 'Unable to fetch location. ' + error.message);
          setLocation('');
          setIsFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (err) {

      Alert.alert('Error', 'Something went wrong: ' + err.message);
      setLocation('');
      setIsFetchingLocation(false);
    }
    finally {
      setFilter1('latitude', locallatitude)
      setFilter1('longitude', locallongitude)
      setFilter1('location', locallocation)
      // setHithomepageapi(hithomepageapi + 1);
      fetchEventList('location');

    }
  };

  useEffect(() => {
    if (latitude || longitude || address || locallatitude || locallongitude || locallocation) {
      setFilter1('latitude', latitude || locallatitude)
      setFilter1('longitude', longitude || locallongitude)
      setFilter1('address', address || locallocation)
    }
  }, [latitude, longitude, address, locallatitude, locallongitude, locallocation])


  useEffect(() => {
    fetchcatgegory()
  }, [])

  const [eventlist, setEventlist] = useState([])
  const [notificationcount, setNotificationcount] = useState([])
  const [catgeorylist, setCatgeorylist] = useState([])
  const visibleCategories = useMemo(() => {
    if (Array.isArray(catgeorylist) && catgeorylist.length > 0) {
      return catgeorylist;
    }

    const categoryMap = new Map();
    (Array.isArray(eventlist) ? eventlist : []).forEach((event) => {
      const id = event?.category_id;
      if (!id || categoryMap.has(id)) {
        return;
      }
      categoryMap.set(id, {
        id,
        title: event?.category_title || 'Event',
        image: event?.category_image || event?.primary_image,
      });
    });
    return Array.from(categoryMap.values());
  }, [catgeorylist, eventlist]);

  const fetchcatgegory = async () => {
    const filterCategories = () => getFilterListOptions({ data: { status: 1 } });
    const requests = isLogin
      ? [filterCategories, callHomepageCategory, callhomeoage, publicHomepageCategory, publicHomepageData]
      : [filterCategories, publicHomepageCategory, publicHomepageData, callHomepageCategory, callhomeoage];
    let categories = [];

    for (const request of requests) {
      let response;
      try {
        response = await request();
        categories = normalizeCategories(response);
      } catch (_error) {
        categories = [];
      }

      if (!response) {
        break;
      }

      if (categories.length > 0) {
        break;
      }
    }

    if (categories.length > 0) {
      setCatgeorylist(categories);
      cacheArray(HOME_CATEGORIES_CACHE_KEY, categories);
      return;
    }

    const cachedCategories = await readCachedArray(HOME_CATEGORIES_CACHE_KEY);
    if (cachedCategories.length > 0) {
      setCatgeorylist(cachedCategories);
    }
  };

  const fetchEventList = async (type = '') => {
    const requestSequence = ++eventFetchSequence.current;
    if (type === 'location' || type === 'global') {
      setLoading(true)
    }
    try {
      const requestFilter = type === 'global'
        ? {}
        : buildHomeEventFilter(filter1, {
          isIOS: Platform.OS === 'ios',
        });
      const useHomepageFeed = shouldUseHomepageFeed(requestFilter);
      let primaryResponse;
      let events = [];

      if (useHomepageFeed) {
        primaryResponse = await filterAllHomePageEvents(buildHomepageFeedFilter());
        events = extractEventList(primaryResponse);

        if (events.length === 0) {
          const homepageRequests = isLogin
            ? [callhomeoage, publicHomepageData]
            : [publicHomepageData, callhomeoage];

          for (const request of homepageRequests) {
            try {
              primaryResponse = await request();
              events = extractEventList(primaryResponse);
            } catch (_error) {
              primaryResponse = null;
              events = [];
            }

            if (events.length > 0) {
              break;
            }
          }
        }
      } else {
        primaryResponse = await filterAllHomePageEvents(requestFilter);
        events = extractEventList(primaryResponse);
      }

      if (requestSequence !== eventFetchSequence.current) {
        return;
      }

      setNotificationcount(extractNotificationCount(primaryResponse));

      if (events.length > 0) {
        setEventlist(events);
        cacheArray(HOME_EVENTS_CACHE_KEY, events);
      } else if (useHomepageFeed) {
        setEventlist(await readCachedArray(HOME_EVENTS_CACHE_KEY));
      } else {
        setEventlist([]);
      }
    } catch (err) {
      console.error("Error fetching event list:", err);
      if (requestSequence === eventFetchSequence.current) {
        const cachedEvents = await readCachedArray(HOME_EVENTS_CACHE_KEY);
        setEventlist(cachedEvents);
      }
    } finally {
      if (requestSequence === eventFetchSequence.current) {
        setLoading(false)
      }
    }
  };



  const handleEventClicks = (item) => {
    setSelectedCategoryId(item.id);
    setSelectedFilters((prevState) => {
      const updatedFilters = {
        ...prevState,
        categories: [item?.id],
      };
      return updatedFilters;
    });
  };

  const handleAllEventClick = () => {
    setSelectedCategoryId(null);
    setSelectedFilters((prevState) => {
      const updatedFilters = {
        ...prevState,
        categories: [],
      };
      return updatedFilters;
    });
  };



  useEffect(() => {
    if (latitude || longitude) {
      return;
    }

    if (Platform.OS !== 'ios') {
      fetchLocation();
      return;
    }

    let mounted = true;
    DeviceInfo.isEmulator().then((isEmulator) => {
      if (!mounted) {
        return;
      }

      if (isEmulator) {
        coordinates.current = IOS_SIMULATOR_LOCATION;
        setLocallatitude(IOS_SIMULATOR_LOCATION.latitude);
        setLocallongitude(IOS_SIMULATOR_LOCATION.longitude);
        setLocallocation(IOS_SIMULATOR_LOCATION.address);
        setLocation(IOS_SIMULATOR_LOCATION.address);
        setFilter1('latitude', IOS_SIMULATOR_LOCATION.latitude);
        setFilter1('longitude', IOS_SIMULATOR_LOCATION.longitude);
        setFilter1('address', IOS_SIMULATOR_LOCATION.address);
        return;
      }

      fetchLocation();
    });

    return () => {
      mounted = false;
    };
  }, [latitude, longitude]);


  const hitapitogetdatafilter = async () => {
    resetFilter();
    await Promise.all([
      fetchEventList('global'),
      fetchcatgegory(),
    ]);
  };

  const onclicklocaion = async () => {
    // const { latitude, longitude } = coordinates.current;
    navigation.navigate('UpdateLocation', {
      latitude: latitude || locallatitude,
      longitude: longitude || locallongitude,
      address: address || locallocation,
    });
  };

  const ignoredKeys = ['latitude', 'longitude', 'category_id', 'categories'];
  const isFilterApplied11 = Object.keys(selectedFilters).some(key => {
    if (ignoredKeys.includes(key)) return false;

    const selectedValue = selectedFilters[key];
    const originalValue = data[key];

    if (Array.isArray(selectedValue)) {
      return (
        selectedValue.length !=
        (Array.isArray(originalValue) ? originalValue.length : 0)
      );
    }
    return selectedValue != originalValue;
  });

  const ContainerComponent = SafeAreaView;
  const topheight = Platform.OS === 'ios' ? 0 : 14;

  return (
    <ContainerComponent style={[styles.container, { paddingTop: topheight }]}>
      <GamificationGate />
      {showTour && (
        <AppTourNew onClose={() => setShowTour(false)} />
      )}
      <StatusBarManager backgroundColor="#F9F6FD" barStyle="dark-content" />
      <View style={styles.searchBarContainer}>
        <CustomHeader
          title={
            isFetchingLocation
              ? 'Fetching Location...'
              : address || locallocation
                ? `${address || locallocation}`
                : 'Select Location'
          }
          titleStyle={{
            color: '#595959',
            fontSize: fontScale(14),
            fontFamily: fontFamilies.SFProRoundedBlackMedium,
            paddingLeft: 0
          }}
          containerStyle={{
            justifyContent: 'space-between',
            height: 24,
            marginBottom: 25,
            paddingHorizontal: 0,
            paddingVertical: 0,
          }}
          onclicklocaion={onclicklocaion}
          imageSource={'drope'}
          rightImageSource={'bell'}
          secondRightImageSource={'itsmainhomepage'}
          notificationCount={notificationcount}
        />
        <SearchBar
          placeholder={`Discover events & experiences`}
          results={searchResults}
          onResultSelect={handleResultSelect}
          resultStyle={styles.searchResult}
          containerStyle={styles.searchBar}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          onFilterPress={() => {
            setModalVisible(true);
          }}
          hellonavigate={true}
          autoFocusInitially={true}
        />
      </View>
      <ScrollView>
        <View style={styles.content}>
          {visibleCategories && (
            <>
              <CatgeorylistItem
                catgeorylist={visibleCategories}
                selectedCategoryId={selectedCategoryId}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                onAllCategoryPress={handleAllEventClick}
                onCategoryPress={handleEventClicks}
              />
            </>
          )}
        </View>
        <View style={styles.filterContainer}>
          <Text style={styles.popularTextSearch}>
            {/* HAPPENING AROUND YOU */}
            {getsortlabels(filter1?.sort_Filter[0])}
          </Text>
          <TouchableLabel
            containerStyle={styles.interestLabel}
            labelStyle={styles.interestLabelText}
            label={'Sort By'}
            onPress={() => setSortModalVisible(true)}
            leftImage={<Arrows />}
            rightImage={<Polygon />}
            leftImageStyle={{ marginRight: 4 }}
            rightImageStyle={{ marginLeft: 4 }}
          />
          <FilterModal
            isVisible={isModalVisible}
            onClose={closeModal}
            onApply={handleApplyFilters}
            onClearFilters={resetAllFilters}
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
        <View style={{ paddingLeft: 24 }}>
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
        </View>
        <View style={{ flex: 1 }}>
          {loading ? (
            <Loader
              isLoading={true}
              containerStyle={{
                backgroundColor: '#F9F6FD',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              animationSource={require('../../assets/loader.json')}
            />
          ) : Array.isArray(eventlist) && eventlist?.length > 0 ? (
            <>
              <RenderListItem eventlist={eventlist} navigation={navigation} />
            </>
          ) : (
            <NoData
              heading={'NO EVENTS FOUND'}
              onPress={hitapitogetdatafilter}
              buttonTitle={'Refresh'}
            />
          )}
        </View>
      </ScrollView>
    </ContainerComponent>
  );
};

export default BottomHomePage;
