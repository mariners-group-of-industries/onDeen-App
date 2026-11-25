import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import Loader from '../../components/loader';
import LatestHeader from '../../components/LatestHeader';
import Toast from '../../components/toastMessage';
import NotificationItem from './NotificationItem';
import GuestModal from '../../modals/guestModal';
import NoData from '../../components/NoData';

import { markNotificationAsSeen } from '../../redux/slices/notificationSlice';
import { deleteNotificationCall } from '../../redux/slices/deleteNotification';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import { clearLastEventId } from '../../helpers/storage';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import { fontFamilies } from '../../assets/fonts/fonts';
import { getNotificationsAPI } from '../../redux/callapis/CommonService';
import { BASE_URL } from '../../helpers/Constant';

const extractNotifications = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const response = payload?.response;
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return null;
};

const fetchNotificationsDirectly = async ({ authToken, bearerToken }) => {
  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${backendUrl}/customer_app/users/get_notifications`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'auth-token': authToken } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
  });
  return response.json();
};

export default function Notification() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const bearerToken = useSelector((state) => (
    state.user?.loginToken ||
    state.user?.user?.access_token ||
    state.verifyOtp?.verifyOtp_access_token ||
    state.registerUser?.access_token
  ));
  const authToken = useSelector((state) => state.token?.token?.access_token);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isModalVisible, setModalVisible] = useState(false);
  const [listKey, setListKey] = useState(0);

  const { deleteMessage } = useSelector((state) => state.deleteNotification);
  const showToast = useToastForPopup();
  const canFetchNotifications = Boolean(bearerToken);

  useStatusBar({ backgroundColor: '#FDFBFF', barStyle: 'dark-content' });

  useEffect(() => {
    if (isSkippedLogin && !bearerToken) {
      setModalVisible(true);
    }
  }, [bearerToken, isSkippedLogin]);

  const handleConfirmLogout = async () => {
    setModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const fetchData = useCallback(async () => {
    if (!canFetchNotifications) {
      setLocalNotifications([]);
      setRefreshing(false);
      return;
    }

    try {
      setRefreshing(true);
      const resultAction = await getNotificationsAPI();
      let notifications = extractNotifications(resultAction);

      if (!notifications && bearerToken) {
        try {
          const directResult = await fetchNotificationsDirectly({ authToken, bearerToken });
          notifications = extractNotifications(directResult);
        } catch (error) {
          notifications = null;
        }
      }

      if (notifications) {
        setLocalNotifications(notifications);
      } else if (resultAction?.response === 'Unauthorized access') {
        setLocalNotifications([]);
      } else {
        setLocalNotifications([]);
        showToast(resultAction?.response?.message || resultAction?.message || 'Unable to load notifications');
      }
    } catch (error) {
      showToast('Something went wrong, please try again');
    } finally {
      setRefreshing(false);
    }
  }, [authToken, bearerToken, canFetchNotifications, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to reset list and fetch latest data
  const resetAndFetchData = useCallback(async () => {
    setListKey(prevKey => prevKey + 1); // Force list re-render
    await fetchData(); // Fetch latest data
  }, [fetchData]);

  const handleDelete = useCallback(async (id) => {
    if (!canFetchNotifications) {
      setModalVisible(true);
      return;
    }

    try {
      const data = id == 'all' ? { "delete_all": 1 } : { id: id };
      await dispatch(deleteNotificationCall({ data }));
      showToast(deleteMessage);
      // Reset and fetch latest data after delete
      await resetAndFetchData();
    } catch (error) {
      showToast('Delete operation failed');
    }
  }, [canFetchNotifications, dispatch, deleteMessage, resetAndFetchData, showToast]);

  const handleFilterChange = useCallback(async (filter) => {
    setSelectedFilter(filter);
    // Reset and fetch latest data when filter changes
    await resetAndFetchData();
  }, [resetAndFetchData]);

  const handleMarkAllAsSeen = useCallback(async () => {
    if (!canFetchNotifications) {
      setModalVisible(true);
      return;
    }

    try {
      await dispatch(markNotificationAsSeen(""));
      showToast('All notifications marked as seen');
      // Reset and fetch latest data after marking all as seen
      await resetAndFetchData();
    } catch (error) {
      showToast('Failed to mark all as seen');
    }
  }, [canFetchNotifications, dispatch, resetAndFetchData, showToast]);

  const filteredNotifications = useMemo(() => {
    return selectedFilter == 'unread'
      ? Array.isArray(localNotifications) && localNotifications.filter(n => n?.seen === 0)
      : localNotifications;
  }, [localNotifications, selectedFilter]);

  const handleNotificationPress = useCallback(async (item) => {
    if (!canFetchNotifications) {
      setModalVisible(true);
      return;
    }

    try {
      await dispatch(markNotificationAsSeen(item?.id == -1 ? "" : item?.id));
      // Refresh data to get updated seen status
      await resetAndFetchData();
    } catch (error) {
      showToast('Failed to mark as seen');
    }
  }, [canFetchNotifications, dispatch, resetAndFetchData, showToast]);

  const renderItem = useCallback(({ item }) => (
    <NotificationItem
      key={item?.id}
      user={item}
      onPress={handleNotificationPress}
      onDelete={() => handleDelete(item?.id)}
      onLinkError={showToast}
      authToken={authToken}
      bearerToken={bearerToken}
    />
  ), [authToken, bearerToken, handleNotificationPress, handleDelete, showToast]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[{ flex: 1, backgroundColor: '#FDFBFF' }]}>
      <LatestHeader
        statusBarColor="#FDFBFF"
        title="Notifications"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />

      {refreshing ? (
        <Loader
          isLoading={true}
          containerStyle={{ backgroundColor: '#FDFBFF' }}
          animationSource={require('../../assets/loader.json')}
        />
      ) : (
        <>
          <View style={styles.contentContainer}>
            <ScrollView
              horizontal
              bounces={false}
              style={styles.toolbarScroller}
              contentContainerStyle={styles.toolbar}
              showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedFilter === 'all' }}
                  style={[
                    styles.filterButton,
                    styles.allButton,
                    selectedFilter === 'all' && styles.selectedButton,
                  ]}
                  onPress={() => handleFilterChange('all')}>
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === 'all' && styles.selectedText,
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedFilter === 'unread' }}
                  style={[
                    styles.filterButton,
                    styles.unreadButton,
                    selectedFilter === 'unread' && styles.selectedButton,
                  ]}
                  onPress={() => handleFilterChange('unread')}>
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === 'unread' && styles.selectedText,
                  ]}>
                    Unread
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.actionButton, styles.deleteAllButton]}
                  onPress={() => handleDelete('all')}>
                  <Text style={styles.actionButtonText}>
                    Delete All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.actionButton, styles.markAllButton]}
                  onPress={handleMarkAllAsSeen}>
                  <Text style={styles.actionButtonText}>
                    Mark all as seen
                  </Text>
                </TouchableOpacity>
            </ScrollView>

            {(filteredNotifications?.length == 0 || !filteredNotifications) ? (
              <View style={styles.noDataContainer}>
                <NoData
                  heading={'No Notification Found'}
                  onPress={resetAndFetchData}
                  buttonTitle={'Refresh'}
                />
              </View>
            ) : (
              <View style={styles.listContainer}>
                <FlatList
                  key={listKey}
                  data={filteredNotifications}
                  renderItem={renderItem}
                  keyExtractor={item => item.id?.toString()}
                  refreshing={refreshing}
                  onRefresh={resetAndFetchData}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            <GuestModal
              isVisible={isModalVisible}
              title="Confirm Login"
              message="You are currently using the app in guest mode. To access all features, please log in."
              onCancel={handleCancel}
              onConfirm={handleConfirmLogout}
            />
          </View>
        </>
      )}
      <Toast message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    // backgroundColor: 'red',
    // paddingHorizontal: 24,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 36,
    paddingBottom: 24,
    paddingTop: 18,
  },
  toolbarScroller: {
    flexGrow: 0,
    flexShrink: 0,
    height: 72,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: '#FDFBFF',
    borderColor: '#000000',
    borderRadius: 32,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  allButton: { width: 74 },
  unreadButton: { width: 74 },
  filterButtonText: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#DB3171',
  },
  selectedButton: {
    backgroundColor: '#DB3171',
    borderColor: '#DB3171',
  },
  selectedText: {
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 32,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  deleteAllButton: { width: 82 },
  markAllButton: { width: 126 },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#fff',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 36,
  },
});
