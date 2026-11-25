import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import styles from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import { logout, setIsSkippedLogin, setLoginState, } from '../../redux/slices/loginSlice';
import NoData from '../../components/NoData';
import GuestModal from '../../modals/guestModal';
import { clearLastEventId } from '../../helpers/storage';
import { useStatusBar } from '../../components/statusbar';
import {
  fetchOneToOneSessionsAPI,
  imcfetchBookingList,
} from '../../redux/callapis/CommonService';
import Loader from '../../components/loader';
import HorizontalCarousel from './HorizontalCarousel';
import VerticalCarousel from './VerticalCarousel';
import { fontColor } from '../../../assets/fonts/fonts';
import OneToOneSessionList from '../OneToOne/OneToOneSessionList';
import SessionDetailsModal from '../../modals/sessionModal';

const BookingListPage = () => {
  useStatusBar({ backgroundColor: fontColor.LITETHEME, barStyle: 'dark-content' });
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState({
    upcoming: [],
    active: [],
    completed: []
  });
  const [oneToOneSessions, setOneToOneSessions] = useState([]);
  const [selectedOneToOne, setSelectedOneToOne] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      return () => {
        setLoading(true);
      };
    }, [])
  );

  const isSkippedLogin = useSelector(state => state.user.isSkippedLogin);

  // Modal handlers
  const handleConfirmLogout = async () => {
    setModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  const handleCancel = () => setModalVisible(false);

  // Data fetching
  const fetchBookingLists = useCallback(async () => {
    try {
      setRefreshing(true);

      const [upcomingRes, activeRes, completedRes, oneToOneRes] = await Promise.all([
        imcfetchBookingList({ data: { type: 1 } }),
        imcfetchBookingList({ data: { type: 2 } }),
        imcfetchBookingList({ data: { type: 3 } }),
        fetchOneToOneSessionsAPI(),
      ]);

      setBookings({
        upcoming: upcomingRes?.response || [],
        active: activeRes?.response || [],
        completed: completedRes?.response || []
      });
      setOneToOneSessions(oneToOneRes?.response || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings({
        upcoming: [],
        active: [],
        completed: []
      });
      setOneToOneSessions([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    setLoading(true);
    if (isSkippedLogin) {
      setModalVisible(true);
    }
  }, [isSkippedLogin]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBookingLists();
    }, [fetchBookingLists])
  );

  // Derived values
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (booking) => {
    if (!normalizedQuery) {
      return true;
    }
    return [booking?.title, booking?.organization_name, booking?.event?.title]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  };
  const displayedBookings = (activeTab == 'active' ? bookings.active : bookings.completed)
    .filter(matchesSearch);
  const upcomingBookings = bookings.upcoming.filter(matchesSearch);
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const matchesOneToOneSearch = session => {
    if (!normalizedQuery) {
      return true;
    }
    return [
      session?.speaker_first_name,
      session?.speaker_last_name,
      session?.event_title,
      session?.organization_name,
      session?.user_comment,
    ].filter(Boolean).some(value => String(value).toLowerCase().includes(normalizedQuery));
  };
  const activeOneToOne = oneToOneSessions.filter(session => (
    [1, 3, 5].includes(Number(session?.status)) &&
    session?.date >= today &&
    matchesOneToOneSearch(session)
  ));
  const completedOneToOne = oneToOneSessions.filter(session => (
    (Number(session?.status) == 6 || session?.date < today) &&
    matchesOneToOneSearch(session)
  ));
  const displayedOneToOne = activeTab == 'active' ? activeOneToOne : completedOneToOne;
  const hasUpcomingBookings = upcomingBookings.length > 0;
  const hasDisplayedBookings = displayedBookings.length > 0;
  const showEmptyState =
    (activeTab == 'active' && !hasDisplayedBookings && !hasUpcomingBookings && !displayedOneToOne.length) ||
    (activeTab == 'completed' && !hasDisplayedBookings && !displayedOneToOne.length);

  if (loading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: fontColor.LITETHEME }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  return (
    <View style={[
      styles.container,
      { paddingBottom: insets.bottom, paddingTop: insets.top },
    ]}>
      <CustomHeader
        statusBarColor={fontColor.LITETHEME}
        containerStyle={{ paddingHorizontal: 24, paddingTop: 4 }}
        title="My Bookings"
        titleStyle={styles.headerTitle}
        rightIconName="search"
        onRightPress={() => {
          setSearchVisible((current) => !current);
          if (searchVisible) {
            setSearchQuery('');
          }
        }}
      />

      {searchVisible ? (
        <View style={styles.searchContainer}>
          <Search color="#69627B" size={20} strokeWidth={2} />
          <TextInput
            autoFocus
            onChangeText={setSearchQuery}
            placeholder="Search your bookings"
            placeholderTextColor="#8B8592"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#69627B" size={20} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <GuestModal
        isVisible={isModalVisible}
        title="Confirm Login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />

      <SessionDetailsModal
        visible={Boolean(selectedOneToOne)}
        session={selectedOneToOne}
        onClose={() => {
          setSelectedOneToOne(null);
          fetchBookingLists();
        }}
      />

      {/* Tab Navigation */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.tabButton, activeTab == 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={activeTab == 'active' ? styles.activeText : styles.inactiveText}>
            Upcoming Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.tabButton, activeTab == 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={activeTab == 'completed' ? styles.activeText : styles.inactiveText}>
            Completed Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchBookingLists} />}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming Bookings (only shown in active tab) */}
        {activeTab == 'active' && hasUpcomingBookings && (
          <View style={styles.carouselContainer}>
            <Text style={styles.carouselHeading}>UPCOMING BOOKINGS</Text>
            <VerticalCarousel upcomingBookings={upcomingBookings} />
          </View>
        )}

        {/* Main Bookings List */}
        {hasDisplayedBookings && (
          <View>
            <Text style={[styles.bookingHeading, { paddingTop: 0 }]}>
              {activeTab == 'active' ? 'ON GOING BOOKINGS' : 'COMPLETED BOOKINGS'}
            </Text>
            <HorizontalCarousel activeTab={activeTab} displayedBookings={displayedBookings} />
          </View>
        )}

        {displayedOneToOne.length > 0 && (
          <View style={styles.carouselContainer}>
            <Text style={styles.carouselHeading}>ONE-TO-ONE SESSIONS</Text>
            <OneToOneSessionList
              sessions={displayedOneToOne}
              onSessionPress={setSelectedOneToOne}
              type={activeTab == 'completed' ? 'completed' : 'upcoming'}
            />
          </View>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <View style={styles.carouselContainer}>
            <NoData
              title={'Book events happening near you'}
              heading={'NO EVENTS FOUND'}
              onPress={() => navigation.navigate('Homewithroute')}
              buttonTitle={'Explore Events'}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BookingListPage;
