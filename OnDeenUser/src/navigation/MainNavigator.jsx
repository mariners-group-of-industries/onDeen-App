import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import BookingScreen from '../screens/BookingListPage/BookingListPage';
import ProfileNavigator from './ProfileNavigator';
import HomeScreen from '../screens/BottomHomePage/BottomHomePage';
import AllCalendar from '../screens/AllCalendar/AllCalendar';
import HomeInactive from '../assets/svg/home.svg';
import HomeActive from '../assets/svg/HomeActive.svg';
import CalendarActive from '../assets/svg/calendarActive.svg';
import CalendarInactive from '../assets/svg/calendarTab.svg';
import BookingActive from '../assets/svg/bookingActive.svg';
import BookingInactive from '../assets/svg/booking.svg';
import ProfileActive from '../assets/svg/ProfileActive.svg';
import ProfileInactive from '../assets/svg/profile.svg';
import { fontFamilies } from '../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setIsSkippedLogin, setLoginState } from '../redux/slices/loginSlice';
import { clearLastEventId } from '../helpers/storage';
import GuestModal from '../modals/guestModal';
import SendFCMToken from '../screens/BottomHomePage/SendFCMToken';
import CheckVersionUpdate from '../screens/BottomHomePage/CheckVersionUpdate';
import CheckVersion from '../screens/BottomHomePage/CheckVersion';
import { getSelfProfileAPI, migrateGuestBookingsAPI } from '../redux/callapis/CommonService';
import { useToastForPopup } from '../context/ToastContext';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const isLogin = useSelector((state) => state.user.isLogin);
  const loginToken = useSelector((state) => state.user.loginToken);
  const guestImportAttemptedRef = useRef('');
  const showToast = useToastForPopup();

  useEffect(() => {
    if (!isLogin || isSkippedLogin || !loginToken || guestImportAttemptedRef.current === loginToken) {
      return undefined;
    }

    guestImportAttemptedRef.current = loginToken;
    let mounted = true;

    const importMatchingGuestBookings = async () => {
      try {
        const profileResult = await getSelfProfileAPI();
        const profile = profileResult?.response;
        if (!profile?.email_id || !profile?.mobile_number) {
          return;
        }

        const result = await migrateGuestBookingsAPI({
          email_id: profile.email_id,
          country_code: profile.country_code || '+44',
          mobile_number: profile.mobile_number,
        });
        const count = Number(result?.response?.migrated_count || 0);
        if (mounted && count > 0) {
          showToast(`${count} guest booking${count === 1 ? '' : 's'} imported. Past attendance does not grant XP.`);
        }
      } catch {
        // Guest import is best-effort and must never block authenticated navigation.
      }
    };

    importMatchingGuestBookings();
    return () => {
      mounted = false;
    };
  }, [isLogin, isSkippedLogin, loginToken, showToast]);

  const hiddenScreens = useMemo(
    () => [
      'Homewithroute',
      'EventDetails',
      'CourseDetails',
      'organizerProfile',
      'SpeakerScreen',
      'FaqScreen',
      'NotesScreen',
      'BookingDetails',
      'PaymentScreen',
      'PaymentConfirmationScreen',
      'EditProfile',
      'ProfileSettings',
    ],
    [],
  );

  const getTabBarVisibility = useCallback(
    (route) => {
      const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';
      return hiddenScreens.includes(routeName)
        ? { display: 'none' }
        : { display: 'flex' };
    },
    [hiddenScreens],
  );

  const handleCancel = () => setModalVisible(false);
  const handleConfirmLogout = async () => {
    setModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  const renderTabBarButton = (props, targetTabName, requiresLogin = true) => (
    <Pressable
      {...props}
      style={(state) => [
        typeof props.style === 'function' ? props.style(state) : props.style,
        styles.tabBarButton,
        (props['aria-selected'] || props.accessibilityState?.selected) && styles.tabBarButtonActive,
        state.pressed && styles.tabBarButtonPressed,
      ]}
      onPress={() => {
        if (requiresLogin && isSkippedLogin) {
          setModalVisible(true);
          setPendingTab(targetTabName);
        } else {
          props.onPress?.();
        }
      }}
    />
  );

  return (
    <View style={styles.container}>
      <CheckVersion/>
      <SendFCMToken  send={true}/>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let Icon;
            switch (route.name) {
              case 'Home':
                Icon = focused ? HomeActive : HomeInactive;
                break;
              case 'Calendar':
                Icon = focused ? CalendarActive : CalendarInactive;
                break;
              case 'Booking':
                Icon = focused ? BookingActive : BookingInactive;
                break;
              case 'Profile':
                Icon = focused ? ProfileActive : ProfileInactive;
                break;
              default:
                Icon = focused ? HomeActive : HomeInactive;
                break;
            }
            return <Icon />;
          },
          tabBarActiveTintColor: '#DB3171',
          tabBarInactiveTintColor: '#231F25',
          tabBarStyle: [
            styles.tabBarStyle,
            {
              bottom: Platform.OS === 'ios' ? 12 : Math.max(10, insets.bottom),
            },
            getTabBarVisibility(route),
          ],
          tabBarItemStyle: {
            borderRadius: 34,
            height: 58,
            marginHorizontal: 3,
            marginVertical: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fontFamilies.SFProRoundedBlackMedium,
            lineHeight: 12,
            marginBottom: 7,
          },
          tabBarIconStyle: styles.tabBarIcon,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarButton: (props) => renderTabBarButton(props, 'Home', false),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={AllCalendar}
          options={{
            headerShown: false,
            tabBarButton: (props) => renderTabBarButton(props, 'Calendar'),
          }}
        />
        <Tab.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Bookings',
            tabBarButton: (props) => renderTabBarButton(props, 'Booking'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{
            headerShown: false,
            tabBarButton: (props) => renderTabBarButton(props, 'Profile'),
          }}
        />
      </Tab.Navigator>
      <GuestModal
        isVisible={modalVisible}
        title="Continue to login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 36,
    borderTopWidth: 0,
    overflow: 'visible',
    paddingHorizontal: 5,
    elevation: 12,
    shadowColor: '#4A3C58',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    zIndex: 1000,
  },
  tabBarButton: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabBarButtonActive: {
    backgroundColor: '#EFEEF1',
  },
  tabBarButtonPressed: {
    opacity: 0.82,
  },
  tabBarIcon: {
    marginTop: 7,
  },
});

export default MainNavigator;
