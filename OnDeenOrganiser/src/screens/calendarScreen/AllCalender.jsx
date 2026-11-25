import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookingList } from '../../redux/slices/bookingLIstSlice';
import { RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import YearCalender from './YearCalender';
import MonthsCalender from './MonthsCalender';
import CustomHeader from '../../components/customHeader';
import { fontScale, heightScale } from '../../helpers/scale';
import styles from './styles';
import { currentYear } from '../../common/datetimeformate';

const AllCalender = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(0);

  const dispatch = useDispatch();

  const currentDate = new Date();
  const startDate = currentDate.toISOString().split('T')[0];
  const endDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const [filter, setFilter] = useState({
    status: 1,
    page: 1,
    per_page: 10,
    recently_added_days: 1,
    start_date: startDate,
    end_date: endDate,
  });

  const { bookingList } = useSelector((state) => state.bookingList);

  const [loading, setLoading] = useState(true);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchBookingList(filter));
  };

  useEffect(() => {
    setLoading(true);
    const payload = {};
    dispatch(fetchBookingList(filter));
    setLoading(false);
  }, [dispatch, filter]);

  const filteredData = Array.isArray(bookingList?.events) ? bookingList.events.map(event => ({
    end_date: event.end_date,
    id: event.id,
    start_date: event.start_date,
    title: event.title,
    occusr_type: event.occusr_type,
    occusr_weekday: event.occusr_weekday,
    occusr_month: event.occusr_month,
    status: event.status,
  })) : [];

  // Keep the selected date as the durable source of truth for the calendar
  // view. A Redux refresh can rerender this screen immediately after a day
  // press; rendering the month from the selected payload prevents that
  // refresh from dropping the organiser back into the year view.
  const hasSelectedDate = Boolean(data && typeof data === 'object' && data.date);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchBookingList(filter));
      return () => {
      };
    }, [dispatch, filter])
  );

  return (
    <>
      <CustomHeader
        statusBarColor="#FFF"
        leftIconName="chevron-left"
        rightImageStyle={styles.containerImage}
        onLeftPress={() => navigation.goBack()}

        secondRightImageStyle={styles.containerImageEdit}
        title={currentYear}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      <View
        style={{
          flex: 1,
          // marginTop: 10,
          height: '100%',
          backgroundColor:"#FFF"
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >

        {/* {renderTabSwitcher()} */}

        {tab == 0 && !hasSelectedDate && <YearCalender filteredData={filteredData} tab={tab} setTab={setTab} data={data} setData={setData} />}
        {(tab == 1 || hasSelectedDate) && <MonthsCalender filteredData={filteredData} tab={tab} setTab={setTab} data={data} setData={setData} />}
      </View>
    </>

  );
};

export default AllCalender;
