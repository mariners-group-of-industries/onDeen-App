import React, { useEffect, useState } from 'react';
import { CalendarList } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import moment from 'moment';
import { fontFamilies } from '../../assets/fonts/fonts';
import { colors } from '../../components/datetimeformate';
import { useDispatch } from 'react-redux';
import Loader from '../../components/loader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEventsForDate } from './filtercalenderDate';
import { getFilteredCalendarEvents } from './calendarEventUtils';
import { callAPiforAllCalender } from '../../redux/callapis/CommonService';
import { formatTimeOnly } from '../../timezone/maintimezone';

const MonthsCalender = ({
  filteredData = [],
  setData,
  selectdate,
  setSelectdate,
  onVisibleMonthChange,
}) => {
  const [monthdata, setMonthdata] = useState({});
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (selectdate && onVisibleMonthChange) {
      onVisibleMonthChange(new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(selectdate)));
    }
  }, [onVisibleMonthChange, selectdate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = {
        status: 1,
        page: 1,
        per_page: 30,
        start_date: selectdate || '',
        end_date: selectdate || '',
      };

      try {
        const res = await callAPiforAllCalender({data});
        const responseEvents = res?.response ?? [];
        const filteredEvents = getFilteredCalendarEvents(responseEvents, selectdate);
        setMonthdata(filteredEvents);
        setTimeout(() => setLoading(false), 200);
      } catch (err) {

        setLoading(false);
      }
    };

    fetchData();
  }, [selectdate]);


  const handleDayPress = day => {
    const selectedDate = day.dateString;
    const selectedMonth = new Date(selectedDate).getMonth();
    const selectedYear = new Date(selectedDate).getFullYear();

    const eventData = filteredData?.find(event => {
      const eventStartDate = event.start_date.split('T')[0];
      const eventEndDate = event.end_date.split('T')[0];
      return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
    });

    if (eventData) {
      setData({
        ...eventData,
        date: selectedDate,
        month: selectedMonth + 1,
        year: selectedYear,
      });
      movetoMainEventDetails(eventData);
    }
  };

  const movetoMainEventDetails = (eventData) => {
    navigation.navigate('BookingDetails', { id: eventData?.id, participant_id: eventData?.participant_id, });
  }

  const renderEventItem = ({ item, index }) => {
    const formattedTime = formatTimeOnly(
      item?.start_time,
      item?.time_zone,
      'time-only'
    )

    return (
      <View>
        <View
          style={{
            height: 18,
            top: 26,
            left: 12,
            width: 3,
            backgroundColor: colors[index % colors.length],
            borderRadius: 1.5,
          }}
        />
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => {
            if (
              item.start_date &&
              !isNaN(Date.parse(item.start_date)) &&
              item.end_date &&
              !isNaN(Date.parse(item.end_date))
            ) {
              movetoMainEventDetails(item);
            } else {
              Alert.alert('Error', 'This event has invalid date information.');
            }
          }}>
          <Text style={styles.eventTitle}>
            {item.title && item.title.length > 26
              ? `${item.title.substring(0, 26)}...`
              : item.title || 'Untitled Event'}
          </Text>
          <Text style={styles.eventDescription}>{formattedTime}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDayComponentForCalendar = ({ date, state }) => {
    const eventsForCurrentDate = getEventsForDate(filteredData, date?.dateString);

    const todayDate = selectdate;
    const isToday = date.dateString == todayDate;

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Get only the YYYY-MM-DD part
    const dateString = date?.dateString;

    return (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: currentDateString == dateString ? 1 : 0,
          borderColor: '#DB3171',
          borderRadius: 20,
          backgroundColor: isToday ? '#DB3171' : 'transparent',
        }}
        onPress={() => setSelectdate(date?.dateString)}>
        <Text
          style={{
            color: isToday
              ? 'white'
              : state == 'disabled'
                ? '#d9e1e8'
                : '#000000', // White text for today
            fontSize: 16,
            lineHeight: 28,
            fontFamily: fontFamilies.SFProRoundedBlackMedium,
            paddingTop: Platform.OS == 'android' ? 12 : 22
          }}>
          {date.day}
        </Text>
        {eventsForCurrentDate?.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Platform.OS == 'android' ? -5 : 5,
            }}>
            {eventsForCurrentDate.slice(0, 1).map((event, index) => (
              <View
                key={event.id}
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: colors[index % colors.length],
                  borderRadius: 8,
                  marginRight: 2,
                  marginBottom: 12,
                }}
              />
            ))}

          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = date => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{`${monthName} ${year}`}</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { marginBottom: insets.bottom + 90 }]}>
          <CalendarList
            theme={{
              backgroundColor: '#F9F6FD',
              calendarBackground: '#F9F6FD',
            }}
            markingType={'period'}
            pastScrollRange={0}
            futureScrollRange={0}
            scrollEnabled={false}
            showScrollIndicator={false}
            current={selectdate}
            onDayPress={handleDayPress}
            firstDay={0}
            hideArrows={true}
            style={{
              backgroundColor: '#F9F6FD',
            }}
            dayComponent={renderDayComponentForCalendar}
            renderHeader={renderHeader}
          />
          {loading ? (
            <Loader containerStyle={{
              backgroundColor: '#F9F6FD',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }} />
          ) : (
            <View style={{ backgroundColor: '#fff' }}>
              <FlatList
                data={monthdata}
                keyExtractor={item => item?.id?.toString()}
                renderItem={renderEventItem}
                ListHeaderComponent={
                  <Text style={styles.currentDateText}>{selectdate
                    ? moment(selectdate).format('dddd, D MMMM YYYY')
                    : ''}</Text>
                }
                ListEmptyComponent={
                  <Text style={styles.noEventsText}>No events for the day</Text>
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default MonthsCalender;
