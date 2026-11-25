import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomHeader from '../components/customHeader';
import BookingScreen from '../screens/bookingScreen';
import CalendarScreen from '../screens/calendarScreen/Index';
import ProfileScreen from '../screens/profileScreen';
import EventsScreen from '../screens/eventsScreen';
import {useNavigation} from '@react-navigation/native';
import {fontScale} from '../helpers/scale';
import EventDetails from '../screens/eventDetailsScreen';
import CourseDetails from '../screens/courseDetailsScreen';
import BookingDetails from '../screens/bookingDetailsScreen';
import CreateEvent from '../screens/createEventScreen/CreateEvent';
import MainEventDetail from '../screens/MainEventDetail/MainEventDetail';
import Participants from '../screens/MainEventDetail/Participants';
import MainHomeScreen from '../screens/MainHomeScreen/MainHomeScreen';
import AddlocationforEvent from '../components/AddlocationforEvent';
import PreviewEvent from '../screens/createEventScreen/PreviewEvent';

const HomeStack = createNativeStackNavigator();

const HomeNavigator: React.FC = () => {
  const navigation = useNavigation();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={MainHomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Events"
        component={EventsScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="EventDetails"
        component={EventDetails}
        options={({navigation}) => ({
          header: () => (
            <CustomHeader
              title="Create"
              leftIconName="chevron-left"
              onLeftPress={() => navigation.goBack()}
              titleStyle={{
                color: '#000000',
                
                fontSize: fontScale(16),
              }}
            />
          ),
        })}
      />
      <HomeStack.Screen
        name="MainEventDetail"
        component={MainEventDetail}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Participants"
        component={Participants}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="CourseDetails"
        component={CourseDetails}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Booking"
        component={BookingScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          header: () => (
            <CustomHeader
              title="Calendar"
              onLeftPress={() => navigation.goBack()}
            />
          ),
        }}
      />
      <HomeStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="PreviewEvent"
        component={PreviewEvent}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="AddLocation"
        component={AddlocationforEvent}
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
