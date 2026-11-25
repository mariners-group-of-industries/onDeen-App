import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  TimelineEventProps,
  CalendarProvider,
  Calendar,
  CalendarList,
  TimelineList,
} from 'react-native-calendars';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import CustomHeader from '../../components/customHeader';
import {heightScale} from '../../helpers/scale';
import {RootState} from '../../redux/store';
import {
  clearBookingListData,
  fetchBookingList,
} from '../../redux/slices/bookingLIstSlice';
import { logout, setLoginState } from '../../redux/slices/loginSlice';
import { fontFamilies } from '../../assets/fonts/fonts';

interface CalendarItem {
  id: string;
  title: string;
  type: string;
  time: string;
  day: string;
}

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [selectMonth, setSelectmonth] = useState('');
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventProps | null>(
    null,
  );
  const [eventsByDate, setEventsByDate] = useState<
    Record<string, TimelineEventProps[]>
  >({});
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [fromDateNew, setFromDateNew] = useState('');
  const [toDateNew, setToDateNew] = useState('');
  const [calendarEvents, setCalendarEvents] = useState('');

  const filterEventsByMonth = (selectedMonth) => {
    const filtered = bookings.filter(event => {
      const eventDate = new Date(event.date);
      const eventMonth = eventDate.getMonth() + 1; // Month is zero-based, so we add 1
      const eventYear = eventDate.getFullYear();
  
      const [selectedYear, selectedMonthNum] = selectedMonth.split("-");
      return eventYear === parseInt(selectedYear) && eventMonth === parseInt(selectedMonthNum);
    });
  
    setFilteredEvents(filtered);
  };
  
  const bookings = useSelector(
    (state: RootState) => state.bookingList.bookingListData || [],
  );
  const isLoading = useSelector(
    (state: RootState) => state.bookingList.status,
  );
  const startDates = bookings?.map((booking) => {
    const date = new Date(booking?.start_date);
    const monthName = date.toLocaleString('default', { month: 'long' });
    return monthName;
  });
  
  const uniqueMonths = [...new Set(startDates)];
  console.log('uniqueMonths >>>', uniqueMonths);
  const displayMonth = !showCalendar ? uniqueMonths[0] : '2024';

  const [loading, setLoading] = useState(true);

  // Define the date range for the API request
  let fromDate = new Date(2024, 12, 1).toISOString().split('T')[0]; // "2024-11-01"
  let toDate = new Date(2025, 11, 31).toISOString().split('T')[0]; // "2024-11-30"
  const currentDateBooking = new Date();
  const upcomingBookings = bookings.filter(
    item => new Date(item.start_date) > currentDateBooking,
  );
  const activeBookings = bookings.filter(
    item =>
      new Date(item.start_date) <= currentDateBooking &&
      new Date(item.end_date) >= currentDateBooking,
  );
  const completedBookings = bookings.filter(
    item => new Date(item.end_date) < currentDateBooking,
  );

  // const loginToken = useSelector((state: any) => state.user.loginToken);
  // const accessTokenNewRegister = useSelector(( state:RootState)=> state.registerUser.access_token);
  // const accessTokenVerifyOtp = useSelector(( state:RootState)=> state.verifyOtp.verifyOtp_access_token);

  const isSkippedLogin = useSelector((state: RootState) => state.user.isSkippedLogin);

  const handleDateClick = async (selectedDate) => {
    console.log('selectedDateselectedDateselectedDate>>>>',selectedDate);
    
    const selectedMonth = new Date(selectedDate).getMonth() + 1; // Extract month
    const selectedYear = new Date(selectedDate).getFullYear();  // Extract year
  console.log('selectedMonthselectedMonthselectedMonth>>>',selectedMonth);
  console.log('selectedYear selectedYear selectedYear >>>',selectedYear);
  
    // Calculate the start and end dates for the month
    const fromDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const toDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]; // Last day of the month
  
    const payload = {from_date: fromDate, to_date: toDate };

  
    console.log('Fetching events for:', payload);
  
    try {
      const response = await dispatch(fetchBookingList(payload)).unwrap();
      console.log('Fetched events for the selected month:', response);
      // Handle the fetched data (e.g., set state to display in FlatList)
      setCalendarEvents(response);
    } catch (error) {
      console.error('Error fetching events for the selected month:', error);
    }
  };

  
  useEffect(() => {
    if (isSkippedLogin) {
      dispatch(setLoginState(false));
      dispatch(logout());
    }
  }, [isSkippedLogin, navigation]);

  console.log(selectMonth, 'selectMonthselectMonthselectMonthselectMonthselectMonthselectMonthselectMonthselectMonthselectMonth');
  

  useEffect(() => {
    console.log('outside if');
    if (fromDate && toDate && showCalendar) {
      console.log('inside if');
      
      const fetchData = async () => {
        const payload = {from_date: fromDate, to_date: toDate };
        console.log('Fetching payload >>>', payload);
        try {
          await dispatch(fetchBookingList(payload)).unwrap();
        } catch (error) {
          console.error('Error fetching booking list:', error);
        } finally {
        }
      };
    
      fetchData();
    }
  }, [dispatch, fromDate, toDate, showCalendar]

);
  

  useEffect(() => {
    if (
      upcomingBookings.length ||
      activeBookings.length ||
      completedBookings.length
    ) {
      setLoading(false);
    }
  }, [upcomingBookings, activeBookings, completedBookings]);

  useEffect(() => {
    const loadEventsForDate = (date: string) => {
      const events = bookings[date] || [];
      return events.map((event: any) => {
        const [hours, minutes] = event.time.split(/[: ]/);
        const period =
          event.time.includes('PM') && hours !== '12'
            ? parseInt(hours, 10) + 12
            : hours;
        const [year, month, day] = date.split('-');
        const startTime = new Date(
          +year,
          +month - 1,
          +day,
          +period,
          +minutes,
        ).toISOString();
        const endTime = new Date(
          +year,
          +month - 1,
          +day,
          +period + 1,
          +minutes,
        ).toISOString();

        return {
          id: event.id,
          start: startTime,
          end: endTime,
          title: event.title,
          description: `${
            event.type.charAt(0).toUpperCase() + event.type.slice(1)
          } at ${event.time}`,
          color: 'lightgreen',
        };
      });
    };

    const loadedEvents = loadEventsForDate(currentDate);
    setEventsByDate(prev => ({
      ...prev,
      [currentDate]: loadedEvents,
    }));
    setMarkedDates(getMarkedDates(bookings));
    setLoading(false); 
  }, [currentDate]);

  const getMarkedDates = (events: Record<string, CalendarItem[]>) => {
    const marked: any = {};
    for (const date in events) {
      marked[date] = { dots: [{ key: 'event', color: 'blue', selectedDotColor: 'red' }] };
    }
    return marked;
  };


  const eventsForCurrentDate = eventsByDate[currentDate] || [];

  
  const renderEventItem = ({item}) => {
    const eventDate = item?.start_date && !isNaN(Date.parse(item.start_date)) ? new Date(item.start_date) : null;
    const eventEndDate = item?.end_date && !isNaN(Date.parse(item.end_date)) ? new Date(item.end_date) : null;
    if (!eventDate) return null;
  
    const timeString = eventDate.toISOString().split('T')[1].substring(0, 5);
    const formattedDate = `${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
    const formattedEndDate = eventEndDate ? `${eventEndDate.toLocaleString('default', { month: 'long' })} ${eventEndDate.getDate()}, ${eventEndDate.getFullYear()}` : '';
    return (
      <View style={{
        // marginBottom:28
      }}>
        <View
          style={{
            height: 18,
            top: 26,
            left: 12,
            width: 3,
            backgroundColor: '#DB3171',
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
              setSelectedEvent(item);
              setShowTimeline(true);
            } else {
              Alert.alert('Error', 'This event has invalid date information.');
            }
          }}
        >
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription}>
            {formattedDate} 
            {/* - {formattedEndDate} */}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };


//   const renderEventItem = ({ item }) => {
//   const eventDate = item?.start_date && !isNaN(Date.parse(item.start_date)) ? new Date(item.start_date) : null;
//   const eventEndDate = item?.end_date && !isNaN(Date.parse(item.end_date)) ? new Date(item.end_date) : null;
//   if (!eventDate) return null;

//   const timeString = eventDate.toISOString().split('T')[1].substring(0, 5);
//   const formattedDate = `${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
//   const formattedEndDate = eventEndDate ? `${eventEndDate.toLocaleString('default', { month: 'long' })} ${eventEndDate.getDate()}, ${eventEndDate.getFullYear()}` : '';

//   return (
//     <TouchableOpacity
//       style={styles.eventItem}
//       onPress={() => {
//         if (item.start_date && !isNaN(Date.parse(item.start_date)) && item.end_date && !isNaN(Date.parse(item.end_date))) {
//           setSelectedEvent(item);
//           setShowTimeline(true);
//         } else {
//           Alert.alert('Error', 'This event has invalid date information.');
//         }
//       }}
//     >
//       <Text style={styles.eventTitle}>{item.title}</Text>
//       <Text style={styles.eventDescription}>{formattedDate}</Text>
//     </TouchableOpacity>
//   );
// };
  
const handleCloseTimeline = () => {
    setShowTimeline(false);
    setSelectedEvent(null);
  };

  const formatDateWithDay = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString(undefined, options);
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
    const weekDays = Object.keys(weekdayAbbreviations);
    console.log('monthName >>>>>',monthName);
    
    return (
      <View>
        <View style={{flexDirection: 'row'}}>
          <Text
            style={{
              fontSize: 16,
              fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
              color: '#070707',
              textAlign: 'left',
            }}>
            {monthName}
          </Text>
        </View>

        {/* weekdays start letter showing */}
        {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
          }}>
          {weekDays.map(day => (
            <Text key={day} style={{width: 30, textAlign: 'center'}}>
              {weekdayAbbreviations[day]}
            </Text>
          ))}
        </View> */}
      </View>
    );
  };

  const renderDayComponent = ({date, state}) => {
    const isMarked = markedDates[date.dateString]?.dots?.length > 0;
    return (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
        }}
        onPress={() => {
          setCurrentDate(date.dateString);
          if (eventsForCurrentDate.length > 0) {
            setShowTimeline(true);
          }
        }}>
        <Text
          style={{
            color: state === 'disabled' ? '#d9e1e8' : '#000000',
            fontSize: 16,
            fontWeight: '500',
          }}>
          {date.day}
        </Text>
        {/* Optionally, show custom dots/markers */}
        {isMarked && (
          <View style={{flexDirection: 'row', marginTop: 2}}>
            {markedDates[date.dateString].dots.map((dot, index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: '#DB3171',
                  borderRadius: 3,
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayComponentForCalendar = ({date, state}) => {
    const isMarked = markedDates[date.dateString]?.dots?.length > 0;
    const todayDate = new Date().toISOString().split('T')[0];
    const isToday = date.dateString === todayDate;
  console.log('todayDate wwfwfwfwf todayDate',date);
  console.log('calendarEventscalendarEvents >>>>',calendarEvents);
  
    return (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
          backgroundColor: isToday ? '#DB3171' : 'transparent',
        }}
        onPress={() => {
          // setCurrentDate(date.dateString);
          // handleDateClick(date.dateString);
          // if (eventsForCurrentDate.length > 0) {
          //   setShowTimeline(true);
          // }
          console.log(`Calendar onDayPress: ${date.dateString}`);
          setCurrentDate(date.dateString);
           handleDateClick(date.dateString);
          if (eventsForCurrentDate.length > 0) {
            setShowTimeline(true);
          }
        }}
        
      >
        <Text
          style={{
            color: isToday
              ? '#ffffff'
              : state === 'disabled'
              ? '#d9e1e8'
              : '#000000',
            fontSize: 16,
            fontFamily:fontFamilies.SFProRoundedBlackMedium,
          }}
        >
          {date.day}
        </Text>
        {isMarked && (
          <View style={{flexDirection: 'row', marginTop: 2}}>
            {markedDates[date.dateString].dots.map((dot, index) => (
              <View
                key={index}
                style={{
                  width: 62,
                  height: 26,
                  backgroundColor: '#DB3171',
                  borderRadius: 3,
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayComponentForCalendarList = ({ date, state }) => {
    console.log('date >>>',date);

    const todayDate = new Date().toISOString().split('T')[0];
    const isToday = date.dateString === todayDate;
  
    const eventsForCurrentDate = bookings.filter((event) => {
      const eventStartDate = event.start_date.split('T')[0];
      const eventEndDate = event.end_date.split('T')[0];
  
      return (
        new Date(eventStartDate) <= new Date(date.dateString) &&
        new Date(eventEndDate) >= new Date(date.dateString)
      );
    });
  
    const handleDayPress = () => {
      const newSelectedMonth:any = new Date(date.dateString).getMonth() + 1; // Extract month

      handleDateClick(date.dateString);
      setSelectmonth(newSelectedMonth)
      setCurrentDate(date.dateString);
      setShowCalendar(false);  
      if (eventsForCurrentDate?.length > 0) {
        setShowTimeline(true);
      } else {
        setShowTimeline(false);
        Alert.alert("No events for this day.");
      }
    };
  
    return (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
          backgroundColor: isToday ? '#DB3171' : 'transparent',
        }}
        onPress={handleDayPress}
      >
        <Text
          style={{
            color: isToday
              ? '#ffffff'
              : state === 'disabled'
              ? '#d9e1e8'
              : '#000000',
            fontSize: 16,
            fontFamily:fontFamilies.SFProRoundedBlackMedium,

          }}
        >
          {date.day}
        </Text>
        {eventsForCurrentDate?.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: '#DB3171',
                borderRadius: 8,
                marginHorizontal: 1,
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  

  const weekdayAbbreviations = {
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'T',
    Friday: 'F',
    Saturday: 'S',
    Sunday: 'S',
  };

  let formattedSelectedEvent;

  if (selectedEvent) {
    const startDate = new Date(selectedEvent?.start_date); // Use start_date
    const endDate = new Date(selectedEvent?.end_date);     // Use end_date
  
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      formattedSelectedEvent = {
        ...selectedEvent,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };
    } else {
      console.log('Invalid date format for selectedEvent start or end:', selectedEvent);
    }
  } else {
    console.log('selectedEvent is null');
  }

  if (isLoading==='loading') {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#DB3171" />
      </View>
    );
  }

  console.log('selectedEvent >>>>>',selectedEvent);
  console.log('selectedEvent >>>>>',selectedEvent);
  
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + heightScale(40),
            paddingTop: insets.top,
          },
        ]}>
        <CustomHeader
          statusBarColor="#F9F6FD"
          rightImageSource={require('../../assets/images/calendarMenu.png')}
          secondRightImageSource={require('../../assets/images/searchBlack.png')}
          containerStyle={{
            paddingVertical: heightScale(12),
            paddingTop: heightScale(28),  
          }}
          leftIconName="chevron-left"
          onLeftPress={() => setShowCalendar(true)}
          rightImageStyle={styles.containerImage}
          secondRightImageStyle={styles.containerImageEdit}
          title={!showCalendar ? displayMonth:'2024'}
          titleStyle={styles.headerTitle}
          onRightPress={() => setShowTimeline(true)}
        />

        <CalendarProvider
          date={currentDate}
          style={{backgroundColor: '#F9F6FD'}}
          onDateChanged={date => {
            setCurrentDate(date);
            setShowTimeline(false);
          }}>
          {/* CalendarList for month view */}
          {showCalendar ? (
            <CalendarList
              theme={{
                backgroundColor: '#F9F6FD',
                calendarBackground: '#F9F6FD',
              }}
              firstDay={1}
              //   displayLoadingIndicator={true}
              staticHeader={true}
              pastScrollRange={0}
              futureScrollRange={12}
              scrollEnabled={true}
              showScrollIndicator={false}
              style={{
                height: '20%',
                width: '100%',
                backgroundColor: '#F9F6FD',
              }}
              horizontal={false}
              pagingEnabled={false}
              // dayComponent={renderDayComponent}
              dayComponent={renderDayComponentForCalendarList}
              renderHeader={renderHeader}
              markedDates={markedDates}
              // markingType={'multi-dot'}
              // onVisibleMonthsChange={months => {
              //   const firstMonth = months[0];
              //   const date = new Date(firstMonth.year, firstMonth.month - 1);
              //   setCurrentDate(date.toISOString().split('T')[0]);
              // }}
              // onDayPress={({dateString}) => {
              //   setCurrentDate(dateString);
              //   setShowCalendarList(false);
              // }}
              // onDayPress={({dateString}) => {
              //   console.log(`CalendarList onDayPress: ${dateString}`);
              //   setCurrentDate(dateString);
              //   setShowCalendar(false);
              //   if (eventsForCurrentDate.length > 0) {
              //     setShowTimeline(true);
              //   }
              // }}
              onVisibleMonthsChange={months => {
                const firstMonth = months[0];
                console.log(months?.dateString, '123456788765432123789876543234567876543456789');
                console.log(firstMonth?.dateString, '56787654676545675656564556565656');
                // setSelectmonth(firstMonth?.dateString)
                const date = new Date(firstMonth.year, firstMonth.month - 1);
                setCurrentDate(date.toISOString().split('T')[0]);
                const selectedMonth = `${firstMonth.year}-${String(firstMonth.month).padStart(2, '0')}`;
                setSelectedMonth(selectedMonth); // Set the selected month
                filterEventsByMonth(selectedMonth); // Filter events for the selected month
              }}
              onDayPress={({dateString}) => {
                console.log(`CalendarList onDayPress: ${dateString}`);
                setCurrentDate(dateString);
                setShowCalendar(false);
                const selectedMonth = dateString.substring(0, 7); // Extract the month (YYYY-MM)
                setSelectedMonth(selectedMonth);
                filterEventsByMonth(selectedMonth); // Filter events for the clicked month
                if (filteredEvents.length > 0) {
                  setShowTimeline(true);
                }
              }}

            />
          ) : (
            <Calendar
              firstDay={1}
              // style={{backgroundColor: '#F9F6FD'}}
              theme={{
                calendarBackground: '#F9F6FD',
              }}
              markedDates={markedDates}
              markingType={'multi-dot'}
              current={currentDate}
              hideArrows={true}
              dayComponent={renderDayComponentForCalendar}
              // onDayPress={({dateString}) => {
              //   console.log(`Calendar onDayPress: ${dateString}`);
              //   setCurrentDate(dateString);
              //    handleDateClick(dateString);
              //   if (eventsForCurrentDate.length > 0) {
              //     setShowTimeline(true);
              //   }
              // }}
              renderHeader={renderHeader}
            />
          )}
          <View>
            <Text></Text>
          </View>
          {showTimeline && selectedEvent ? (
            // <LinearGradient
            //   colors={['#FFEAA9', '#BDA4FF']}
            //   style={styles.timelineContainer} // Custom styles for the timeline container
            // >

            <View style={styles.timelineContainer}>
              <View
                style={{
                  gap: 75,
                  alignItems: 'center',
                }}>
                <Text style={styles.timeLabels}>12:00 </Text>
                <Text style={styles.timeLabels}>1:00 </Text>
                <Text style={styles.timeLabels}>2:00 </Text>
                <Text style={styles.timeLabels}>3:00 </Text>
                <Text style={styles.timeLabels}>4:00 </Text>
                <Text style={styles.timeLabels}>5:00 </Text>
                <Text style={styles.timeLabels}>6:00 </Text>
                <Text style={styles.timeLabels}>7:00 </Text>
                <Text style={styles.timeLabels}>8:00 </Text>
                <Text style={styles.timeLabels}>9:00 </Text>
                <Text style={styles.timeLabels}></Text>
              </View>
              <TimelineList
                events={[formattedSelectedEvent]}
                timelineProps={{
                  format24h: true,
                }}
                showNowIndicator={true}
              />
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={item => item?.id?.toString()}
              renderItem={renderEventItem}
              ListHeaderComponent={
                <Text style={styles.currentDateText}>
                  {/* Display current date or header here */}
                </Text>
              }
              ListEmptyComponent={
                <Text style={styles.noEventsText}>No events for the day</Text>
              }
            />
          )}
        </CalendarProvider>
      </View>
    </ScrollView>
  );
};

export default CalendarScreen;