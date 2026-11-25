import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  BackHandler,
  Dimensions,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshControl, TouchableOpacity } from 'react-native-gesture-handler';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import {
  setLastAttemptedEventId,
} from '../../redux/slices/loginSlice';
import Loader from '../../components/loader';
import { eventbyIdAPI, publicEventbyIdAPI } from '../../redux/callapis/CommonService';
import { BASE_URL } from '../../helpers/Constant';
import AboutOrganisedby from '../SecondEventDetailsPage/AboutOrganisedby';
import TitlewithPriceContainer from '../SecondEventDetailsPage/TitlewithPriceContainer';
import DateTimeContainer from '../SecondEventDetailsPage/DateTimeContainer';
import ClassContainer from '../SecondEventDetailsPage/ClassContainer';
import OccusrtextContainer from '../SecondEventDetailsPage/OccusrtextContainer';
import JourneyLevelContainer from '../SecondEventDetailsPage/JourneyLevelContainer';
import EventLabelContainer from '../SecondEventDetailsPage/EventLabelContainer';
import LocationContainer from './LocationContainer';
import SpeakerContainer from './SpeakerContainer';
import RulesContainer from './RulesContainer';
import CourseContainer from './CourseContainer';
import ItinerariesContainer from './ItinerariesContainer';
import FacilitiesContainer from './FacilitiesContainer';
import OverviewContainer from './OverviewContainer';
import { getEventPrice } from './getpricevalue';
import FirstCarousel from './FirstCarousel';

const pickEventDetail = (payload) => {
  if (!payload) {
    return null;
  }
  if (payload?.id) {
    return payload;
  }
  if (payload?.event_id) {
    return { ...payload, id: payload.event_id };
  }
  if (payload?.response?.id) {
    return payload.response;
  }
  if (payload?.response?.event?.id) {
    return payload.response.event;
  }
  if (payload?.event?.id) {
    return payload.event;
  }
  if (Array.isArray(payload?.response?.events)) {
    return payload.response.events.find((event) => event?.id) || null;
  }
  return null;
};

const mergeEventDetails = (...details) => {
  const validDetails = details.filter(Boolean);
  const merged = {};
  const arrayKeys = [
    'tags',
    'facilities',
    'images',
    'speakers',
    'curriculum',
    'itineraries',
    'documents',
    'participants',
  ];

  validDetails.forEach((detail) => {
    Object.entries(detail).forEach(([key, value]) => {
      if (arrayKeys.includes(key)) {
        return;
      }
      if (value === undefined || value === null || value === '') {
        return;
      }
      merged[key] = value;
    });
  });

  arrayKeys.forEach((key) => {
    const source = [...validDetails]
      .reverse()
      .find((detail) => Array.isArray(detail?.[key]) && detail[key].length > 0)
      || [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
    if (source) {
      merged[key] = source[key];
    }
  });

  return merged;
};

const hasFullDetailContent = (detail) => Boolean(
  detail?.description ||
  detail?.eligibility ||
  detail?.rule ||
  detail?.cancellation_policy ||
  detail?.terms_condition ||
  (Array.isArray(detail?.facilities) && detail.facilities.length > 0)
);

const fetchPublicDetailDirectly = async (eventId) => {
  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${backendUrl}/customer_app/event/event_id?id=${encodeURIComponent(eventId)}`);
  const payload = await response.json();
  return pickEventDetail(payload);
};

const FirstEventDetailsPage = ({ route }) => {
  const routeEvent = route.params?.event || route.params?.eventDetail || null;
  const eventId = route.params?.eventId || route.params?.id || route.params?.event_id || routeEvent?.id || routeEvent?.event_id;
  const openGuestBooking = route.params?.guest === '1' || route.params?.guest === 1 || route.params?.guest === true;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const handledGuestLink = useRef(false);
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin,);
  const isLogin = useSelector((state) => state.user.isLogin);
  const [eventDetail, setEventDetail] = useState(pickEventDetail(routeEvent));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hitapitogetdatafilter = useCallback(async () => {
    if (!eventId) {
      setEventDetail(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fallbackDetail = pickEventDetail(routeEvent);
      let responseDetail = null;
      let publicDetail = null;

      if (!isSkippedLogin) {
        try {
          const authRes = await eventbyIdAPI(eventId);
          responseDetail = pickEventDetail(authRes);
        } catch (error) {
          responseDetail = null;
        }
      }

      try {
        const publicRes = await publicEventbyIdAPI(eventId);
        publicDetail = pickEventDetail(publicRes);
      } catch (error) {
        publicDetail = null;
      }

      if (!hasFullDetailContent(publicDetail)) {
        try {
          publicDetail = await fetchPublicDetailDirectly(eventId);
        } catch (error) {
          publicDetail = publicDetail || null;
        }
      }

      const completeDetail = publicDetail || responseDetail;
      setEventDetail(completeDetail
        ? mergeEventDetails(fallbackDetail, publicDetail, responseDetail)
        : fallbackDetail);
    } catch (error) {
      setEventDetail(pickEventDetail(routeEvent));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, isSkippedLogin, routeEvent]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );


  useFocusEffect(
    useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, [hitapitogetdatafilter]),
  );

  useEffect(() => {
    hitapitogetdatafilter();
  }, [hitapitogetdatafilter]);

  useEffect(() => {
    if (!openGuestBooking || !eventDetail?.id || handledGuestLink.current) {
      return;
    }

    handledGuestLink.current = true;
    navigation.navigate('GuestBooking', { eventId: eventDetail.id, eventDetail });
  }, [eventDetail, navigation, openGuestBooking]);

  const handlePress = (screen, params) => {
    if (isSkippedLogin || !isLogin) {
      dispatch(setLastAttemptedEventId(eventDetail?.id));
      navigation.navigate('GuestBooking', { eventId: eventDetail?.id, eventDetail });
    } else {
      navigation.navigate(screen, { eventDetail, ...params });
    }
  };

  const handleBookTicketPress = () => {
    handlePress('PaymentScreen', { eventId: eventDetail?.id });
  };

  const carouselData = Array.isArray(eventDetail?.images) && eventDetail.images.length > 0
    ? eventDetail.images.map((image) => image?.full_screen_image).filter(Boolean)
    : eventDetail?.primary_image
      ? [eventDetail.primary_image]
      : []

  if (loading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  if (!eventDetail?.id) {
    return (
      <View style={[styles.emptyStateContainer, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.emptyStateTitle}>Event unavailable</Text>
        <Text style={styles.emptyStateText}>This event could not be loaded. Please go back and open it again.</Text>
        <Pressable style={styles.emptyStateButton} onPress={() => navigation.goBack()}>
          <Text style={styles.emptyStateButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const finalDisplayPrice = getEventPrice(eventDetail);
  const footerActivationTop = Dimensions.get('window').height - (64 + Math.max(insets.bottom, 12));

  return (
    <View
      onTouchEndCapture={(event) => {
        if (event.nativeEvent.pageY >= footerActivationTop) {
          handleBookTicketPress();
        }
      }}
      style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
        animated={true}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 116 + insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                hitapitogetdatafilter();
              }}
            />
          }>
          <FirstCarousel carouselData={carouselData} eventDetail={eventDetail} />
          <View style={[styles.detailsContainer, { backgroundColor: '#fff' }]}>
            <View style={{ marginHorizontal: 0, marginTop: -15 }}>
              <EventLabelContainer eventDetail={eventDetail} />
            </View>
            <TitlewithPriceContainer eventDetail={eventDetail} />
            <DateTimeContainer eventDetail={eventDetail} />
            <ClassContainer eventDetail={eventDetail} />
            <OccusrtextContainer eventDetail={eventDetail} />
            <JourneyLevelContainer eventDetail={eventDetail} />
            <AboutOrganisedby eventDetail={eventDetail} />
            <OverviewContainer eventDetail={eventDetail} />
          </View>
          <LocationContainer eventDetail={eventDetail} />
          <SpeakerContainer eventDetail={eventDetail} />
          <CourseContainer eventDetail={eventDetail} />
          <ItinerariesContainer eventDetail={eventDetail} />
          <RulesContainer eventDetail={eventDetail} />
          <FacilitiesContainer eventDetail={eventDetail} />
        </ScrollView>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        accessibilityLabel="BOOK TICKET"
        accessibilityRole="button"
        onPress={handleBookTicketPress}
        style={[styles.bottombook, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.lastContainer}>
          <View style={styles.gradientTextContainer}>
            <Text style={[styles.priceLastText,]}>
              {finalDisplayPrice}
            </Text>
          </View>

          <View>
            <View style={styles.gradientButtonContainer} pointerEvents="none">
              <LinearGradient
                colors={['#DB3171', '#FFCC33']}
                start={{ x: 0.9, y: 0 }}
                end={{ x: 0.1, y: 1 }}
                pointerEvents="none"
                style={styles.bookBtnContainer}>
                <Text style={styles.gradientText}>BOOK TICKET</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FirstEventDetailsPage;
