import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Bell from '../assets/svg/bell.svg';
import Drope from '../assets/svg/drope.svg';
import Settings from '../assets/svg/settings.svg';
import Mainpageheart from '../assets/svg/mainpageheart.svg';
import { Search } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fontFamilies } from '../assets/fonts/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { clearLastEventId } from '../helpers/storage';
import { logout, setIsSkippedLogin, setLoginState } from '../redux/slices/loginSlice';
import GuestModal from '../modals/guestModal';

const DEFAULT_STATUS_BAR_COLOR = '#F9F6FD';

const CustomHeader = ({
  title,
  onclicklocaion,
  statusBarColor = DEFAULT_STATUS_BAR_COLOR,
  titleStyle,
  containerStyle,
  secondRightImageSource,
  notificationCount = 0,
  rightIconName,
  onRightPress,
}) => {
  const navigation = useNavigation(); // Provides access to the navigation object
  const route = useRoute(); // Provides access to the current route
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => { }, [route]);

  const handleCancel = () => {
    setModalVisible(false);
    setPendingAction(null);
  };

  const handleConfirmLogout = async () => {
    setModalVisible(false);
    await clearLastEventId();
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    dispatch(logout());

    if (pendingAction) {
      pendingAction(); // Run stored action
      setPendingAction(null);
    }
  };

  const navigateWithGuestCheck = (callback) => {
    if (isSkippedLogin) {
      setPendingAction(() => callback); // store intended navigation
      setModalVisible(true);
    } else {
      callback();
    }
  };

  const naviagtetowishlist = () => {
    navigateWithGuestCheck(() => navigation.navigate('Wishlist'));
  };

  const naviagtetonotifiction = () => {
    navigateWithGuestCheck(() => navigation.navigate('Notification'));
  };

  const naviagtetosetting = () => {
    navigateWithGuestCheck(() => navigation.navigate('ProfileSettings'));
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: statusBarColor,
          justifyContent: 'space-between',
        },
      ]}>
      <View style={styles.titleContainer}>
        <Pressable onPress={onclicklocaion} style={styles.titleRow}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {secondRightImageSource == 'itsmainhomepage' && (
            <Drope style={styles.dropIcon} />
          )}
        </Pressable>
      </View>

      <View>
        <View>
          {secondRightImageSource == 'settings' ? (
            <Pressable onPress={() => naviagtetosetting()}>
              <Settings />
            </Pressable>
          ) : (
            <></>
          )}
          {secondRightImageSource == 'itsmainhomepage' ? (
            <View style={styles.homeActions}>
              <Pressable
                accessibilityLabel="Wishlist"
                accessibilityRole="button"
                hitSlop={8}
                onPress={naviagtetowishlist}>
                <Mainpageheart />
              </Pressable>

              <Pressable
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                hitSlop={8}
                onPress={naviagtetonotifiction}
                style={styles.notificationButton}>
                <Bell />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount == null
                      ? '0'
                      : notificationCount > 99
                        ? '99+'
                        : notificationCount?.toString()}
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <></>
          )}
          {rightIconName === 'search' ? (
            <Pressable
              accessibilityLabel="Search bookings"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onRightPress}
              style={styles.headerActionButton}>
              <Search color="#111111" size={24} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <GuestModal
        isVisible={modalVisible}
        title="Confirm Login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthScale(20),
    paddingVertical: widthScale(8),
  },
  iconButton: {
    padding: fontScale(10),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#595959',
    lineHeight: 16,
  },
  image: {
    width: widthScale(16),
    height: heightScale(16),
    marginLeft: widthScale(8),
  },
  rightiImage: {
    width: widthScale(24),
    height: heightScale(24),
    marginRight: widthScale(10),
    // left: Dimensions.get('screen').width * 0.51,
  },
  rightIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dropIcon: {
    marginLeft: widthScale(6),
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 16,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: '#fff',
    fontSize: fontScale(10),
    fontWeight: 'bold',
  },
  homeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  notificationButton: {
    position: 'relative',
  },
  headerActionButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});

export default CustomHeader;
