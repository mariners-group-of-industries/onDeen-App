import React, { useEffect, useState } from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchBookingList } from '../../redux/slices/bookingLIstSlice';
import YearCalender from './YearCalender';
import MonthsCalender from './MonthsCalender';
import { fontScale } from '../../helpers/scale';
import {
  logout,
  setIsSkippedLogin,
  setLoginState,
} from '../../redux/slices/loginSlice';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import GuestModal from '../../modals/guestModal';
import { clearLastEventId } from '../../helpers/storage';
import { useStatusBar } from '../../components/statusbar';
import { callAPiforAllCalender } from '../../redux/callapis/CommonService';

const AllCalender = () => {
  useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);
  const [screenLoaded, setScreenLoaded] = useState(false);
  const [selectdate, setSelectdate] = useState(null);
  const formatMonthYear = (value) => new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(value);
  const [visibleMonth, setVisibleMonth] = useState(formatMonthYear(new Date()));

  const dispatch = useDispatch();

  const currentDate = new Date();
  const startDate = currentDate.toISOString().split('T')[0];
  const endDate = new Date(
    currentDate.setFullYear(currentDate.getFullYear() + 1),
  )
    .toISOString()
    .split('T')[0];

  const [filter, setFilter] = useState({
    start_date: startDate,
    end_date: endDate,
    status: 1
  });

  const [loading, setLoading] = useState(true);

  const isSkippedLogin = useSelector(state => state.user.isSkippedLogin);

  useEffect(() => {
    if (isSkippedLogin) {
      setModalVisible(true);
    }
  }, [isSkippedLogin, loading]);

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

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchBookingList(filter));
  };

  useEffect(() => {
    if (tab == 0) {
      setLoading(true);
      dispatch(fetchBookingList({ filter }));
      setLoading(false);
    }
  }, [dispatch, filter, tab]);


  const [bookingList, setBookingData] = useState([])

  useFocusEffect(
    React.useCallback(() => {
      fetchCalendarList()
      return () => {
        setScreenLoaded(false); 
      };
    }, [filter, dispatch])
  );

  const fetchCalendarList = async () => {
    setLoading(true)
    try {
      const res = await callAPiforAllCalender({ data: filter });
      setBookingData(res?.response || []);
    } catch (err) {

      setBookingData([]);
    }
    finally {
      setLoading(false)
    }
  };

  const filteredData =
    Array.isArray(bookingList) &&
    bookingList.map(event => ({
      end_date: event.end_date,
      id: event.id,
      participant_id: event.participant_id,
      start_date: event.start_date,
      start_time: event.start_time,
      title: event.title,
      time_zone: event.time_zone,
      occusr_type: event.occusr_type,
      occusr_month: event.occusr_month,
      occusr_weekday: event.occusr_weekday,
    }));

  if (loading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{
          backgroundColor: '#F9F6FD',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        animationSource={require('../../../src/assets/loader.json')}
      />
    );
  }

  const ContainerComponent = SafeAreaView;
  return (
    <ContainerComponent style={{ flex: 1 }}>
      <LatestHeader
        statusBarColor="#F9F6FD"
        title={visibleMonth}
        leftIconName="chevron-left"
        onLeftPress={() => (tab == 0 ? navigation.goBack() : setTab(0))}
        rightIconName="magnify"
        onRightPress={() => {
          if (tab == 0) {
            setSelectdate(new Date().toISOString().split('T')[0]);
            setTab(1);
          } else {
            setTab(0);
          }
        }}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      {/* <AddToCalendar bookingList={bookingList} /> */}
      <GuestModal
        isVisible={isModalVisible}
        title="Confirm Login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />
      <View
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: '#F9F6FD',
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {tab == 0 && (
          <YearCalender
            filteredData={filteredData}
            tab={tab}
            setTab={setTab}
            data={data}
            setData={setData}
            setSelectdate={setSelectdate}
            selectdate={selectdate}
            onVisibleMonthChange={setVisibleMonth}
          />
        )}
        {tab == 1 && (
          <MonthsCalender
            filteredData={filteredData}
            tab={tab}
            setTab={setTab}
            data={data}
            setData={setData}
            setSelectdate={setSelectdate}
            selectdate={selectdate}
            onVisibleMonthChange={setVisibleMonth}
          />
        )}
      </View>
    </ContainerComponent>
  );
};

export default AllCalender;
