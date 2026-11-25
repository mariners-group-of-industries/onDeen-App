import React, { useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CalendarScreen from '../screens/calendarScreen/AllCalender';
import MainHomeScreen from '../screens/MainHomeScreen/MainHomeScreen';
import ProfileScreen from '../screens/profileScreen';
import ScanQrCode from '../screens/scanScreen/ScanQrCode';
import walletScreen from '../screens/walletScreen/walletScreen';
import BookingIcon from '../assets/svg/bottom/scan.svg';
import CalendarIcon from '../assets/svg/bottom/calendar.svg';
import Home from '../assets/svg/bottom/home.svg';
import SettingsIcon from '../assets/svg/bottom/settings.svg';
import WalletIcon from '../assets/svg/bottom/wallet.svg';
import { fontFamilies } from '../assets/themes/fonts';
import { fontScale, heightScale } from '../helpers/scale';

const Tab = createBottomTabNavigator();
const TAB_BAR_BASE_HEIGHT = Platform.OS === 'android' ? heightScale(62) : heightScale(68);
const TAB_BAR_MIN_BOTTOM_PADDING = Platform.OS === 'android' ? heightScale(8) : heightScale(10);

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING);
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + tabBarBottomPadding;

  const hiddenScreens = useMemo(
    () => [
      'EventDetails',
      'CourseDetails',
      'MainEventDetail',
      'Participants',
      'CreateEvent',
      'AddLocation',
      'ScanQrCode',
      'Drafts',
    ],
    [],
  );

  const getTabBarVisibility = useCallback(
    route => {
      const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
      return hiddenScreens.includes(routeName)
        ? { display: 'none' }
        : { display: 'flex' };
    },
    [hiddenScreens],
  );

  const renderTabIcon = useCallback(({ route, color }) => {
    switch (route.name) {
      case 'Events':
        return <Home width={24} height={24} color={color} />;
      case 'Calendar':
        return <CalendarIcon width={24} height={24} color={color} />;
      case 'Wallet':
        return <WalletIcon width={24} height={24} color={color} />;
      case 'Settings':
        return <SettingsIcon width={24} height={24} color={color} />;
      default:
        return null;
    }
  }, []);

  const renderTabButton = useCallback(
    ({ route, navigation, props }) => {
      if (route.name === 'scanScreen') {
        return (
          <Pressable
            {...props}
            onPress={() => navigation.navigate('ScanQrCode')}
            style={[props.style, styles.scanButton]}>
            <BookingIcon width={56} height={56} />
          </Pressable>
        );
      }

      return <Pressable {...props} />;
    },
    [],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color }) => renderTabIcon({ route, color }),
        tabBarActiveTintColor: '#DF416B',
        tabBarInactiveTintColor: '#69627B',
        tabBarStyle: [
          styles.tabBarStyle,
          {
            height: tabBarHeight,
            paddingBottom: tabBarBottomPadding,
            paddingTop: heightScale(8),
          },
          getTabBarVisibility(route),
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabel: route.name === 'scanScreen' ? () => null : undefined,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarButton: props => renderTabButton({ route, navigation, props }),
      })}>
      <Tab.Screen name="Events" component={MainHomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="scanScreen" component={ScanQrCode} options={{ headerShown: false }} />
      <Tab.Screen name="Wallet" component={walletScreen} options={{ headerShown: false, title: 'Wallet' }} />
      <Tab.Screen name="Settings" component={ProfileScreen} options={{ headerShown: false, title: 'Settings' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: '#F9F6FD',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarItem: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: fontScale(10),
    lineHeight: 12,
    marginTop: heightScale(2),
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -heightScale(14),
  },
});

export default MainNavigator;
