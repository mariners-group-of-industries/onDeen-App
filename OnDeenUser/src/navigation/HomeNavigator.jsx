import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/BottomHomePage/BottomHomePage';
import BookingScreen from '../screens/BookingListPage/BookingListPage';
import CalendarScreen from '../screens/calendarScreen';
import EventsScreen from '../screens/eventsScreen';
import EventDetails from '../screens/eventDetailsScreen';
import CourseDetails from '../screens/FirstEventDetailsPage/FirstEventDetailsPage';
import BookingDetails from '../screens/SecondEventDetailsPage/SecondEventDetailsPage';
import SpeakerScreen from '../screens/SpeakerProfile/SpeakerProfile';
import OrganizerProfile from '../screens/OrganizerProfile/OrganizerProfile';
import ProfileSettings from '../screens/ProfileSetting/ProfileSetting';
import NotesScreen from '../screens/NotesScreen/NotesScreen';
import FaqScreen from '../screens/FaqScreen';
import PaymentScreen from '../screens/PaymentsScreen/PaymentsScreen';
import PaymentConfirmationScreen from '../screens/PaymentConfirmation/PaymentConfirmation';
import SessionScreen from '../screens/RequestSessions/RequestSessions';
import OneToOneSession from '../screens/OneToOne/OneToOneSession';
import AllqrCode from '../screens/allQrCodeScreen/AllQRCodeDownload';
import AllParticipants from '../screens/AllParticipantLists/AllParticipantLists';
import ChangePassword from '../screens/ChangePassword/ChangePassword';
import GuestBookingScreen from '../screens/GuestBooking/GuestBookingScreen';

const HomeStack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <HomeStack.Screen
        name="Events"
        component={EventsScreen}
      />
      <HomeStack.Screen
        name="EventDetails"
        component={EventDetails}
      />
      <HomeStack.Screen
        name="CourseDetails"
        component={CourseDetails}
      />
      <HomeStack.Screen
        name="Booking"
        component={BookingScreen}
      />
      <HomeStack.Screen
        name="BookingDetails"
        component={BookingDetails}
      />
      <HomeStack.Screen
        name="Calendar"
        component={CalendarScreen}
      />
      {/* <HomeStack.Screen
        name="ProfileSettings"
        component={ProfileSettings}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{headerShown: false}}
      /> */}
      <HomeStack.Screen
        name="SpeakerScreen"
        component={SpeakerScreen}
      />
      <HomeStack.Screen
        name="organizerProfile"
        component={OrganizerProfile}
      />
      <HomeStack.Screen
        name="NotesScreen"
        component={NotesScreen}
      />
      <HomeStack.Screen
        name="FaqScreen"
        component={FaqScreen}
      />
      <HomeStack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
      />
      <HomeStack.Screen
        name="PaymentConfirmationScreen"
        component={PaymentConfirmationScreen}
      />
      <HomeStack.Screen
        name="Session"
        component={SessionScreen}
      />
      <HomeStack.Screen
        name="OneToOneSession"
        component={OneToOneSession}
      />
      <HomeStack.Screen
        name="AllqrCode"
        component={AllqrCode}
      />
      <HomeStack.Screen
        name="AllParticipants"
        component={AllParticipants}
      />
      <HomeStack.Screen
        name="ChangePassword"
        component={ChangePassword}
      />
      <HomeStack.Screen
        name="GuestBooking"
        component={GuestBookingScreen}
      />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
