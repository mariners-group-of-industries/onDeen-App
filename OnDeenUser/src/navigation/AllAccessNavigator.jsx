import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import BottomHomePage from '../screens/BottomHomePage/BottomHomePage.jsx';
import BookingScreen from '../screens/BookingListPage/BookingListPage.jsx';
import EventsScreen from '../screens/eventsScreen';
import EventDetails from '../screens/eventDetailsScreen';
import FirstEventDetailsPage from '../screens/FirstEventDetailsPage/FirstEventDetailsPage.jsx';
import BookingDetails from '../screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx';
import SpeakerScreen from '../screens/SpeakerProfile/SpeakerProfile.jsx';
import OrganizerProfile from '../screens/OrganizerProfile/OrganizerProfile.jsx';
import NotesScreen from '../screens/NotesScreen/NotesScreen.jsx';
import FaqScreen from '../screens/FaqScreen';
import PaymentScreen from '../screens/PaymentsScreen/PaymentsScreen.jsx';
import PaymentConfirmationScreen from '../screens/PaymentConfirmation/PaymentConfirmation.jsx';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen.jsx';
import ProfileSettings from '../screens/ProfileSetting/ProfileSetting.jsx';
import UpdateLocation from '../screens/BottomHomePage/UpdateLocation.jsx';
import Membership from '../screens/membership/Membership';
import Wishlist from '../screens/Wishlist/Wishlist.jsx';
import Notification from '../screens/Notification/Notification.jsx';
import MyMembership from '../screens/mymembershipScreen/MyMembership';
import EditProfile from '../screens/EditProfile/EditProfile.jsx';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPassword.jsx';
import CreatePasswordScreen from '../screens/CreatePassword/CreatePasswordScreen.jsx';
import BadgesScreen from '../screens/badgesScreen';
import SessionScreen from '../screens/RequestSessions/RequestSessions.jsx';
import OneToOneSession from '../screens/OneToOne/OneToOneSession.jsx';
import AllqrCode from '../screens/allQrCodeScreen/AllQRCodeDownload.jsx';
import GlobalSearch from '../screens/BottomHomePage/GlobalSearch.jsx';
import GlobalSearchResults from '../screens/GlobalSearchResults/GlobalSearchResults.jsx';
import ImageViewerScreen from '../screens/imageViewScreen/ImageView.jsx';
import ChangePassword from '../screens/ChangePassword/ChangePassword.jsx';
import ActiveMembership from '../screens/ActiveMembership.tsx';
import AllParticipantLists from '../screens/AllParticipantLists/AllParticipantLists.jsx';
import ReportBug from '../screens/ProfileScreen/ReportBug.jsx';
import HelpSupportPage from '../screens/ProfileScreen/HelpSupportPage.jsx';
import GamificationSummary from '../screens/GamificationSummary/GamificationSummary.jsx';
import GamificationLevelUp from '../screens/GamificationLevelUp/GamificationLevelUp.jsx';
import SessionFeedback from '../screens/SessionFeedback/SessionFeedback.jsx';
import GuestBookingScreen from '../screens/GuestBooking/GuestBookingScreen.jsx';
import OnlineCheckInCode from '../screens/OnlineCheckInCode/OnlineCheckInCode.jsx';

const Stack = createNativeStackNavigator();

const AllAccessNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="MainNavigator"
            screenOptions={{ headerShown: false }}
        >
                <Stack.Screen name="MainNavigator" component={MainNavigator} />
                <Stack.Screen name="Homewithroute" component={BottomHomePage} />
                <Stack.Screen name="UpdateLocation" component={UpdateLocation} />
                <Stack.Screen name="Events" component={EventsScreen} />
                <Stack.Screen name="EventDetails" component={EventDetails} />
                <Stack.Screen name="CourseDetails" component={FirstEventDetailsPage} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen name="BookingDetails" component={BookingDetails} />
                <Stack.Screen name="SpeakerScreen" component={SpeakerScreen} />
                <Stack.Screen name="organizerProfile" component={OrganizerProfile} />
                <Stack.Screen name="NotesScreen" component={NotesScreen} />
                <Stack.Screen name="FaqScreen" component={FaqScreen} />
                <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
                <Stack.Screen name="PaymentConfirmationScreen" component={PaymentConfirmationScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
                <Stack.Screen name="EditProfile" component={EditProfile} />
                <Stack.Screen name="Membership" component={Membership} />
                <Stack.Screen name="Wishlist" component={Wishlist} />
                <Stack.Screen name="Notification" component={Notification} />
                <Stack.Screen name="MyMembership" component={MyMembership} />
                <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                <Stack.Screen name="CreatePasswordScreen" component={CreatePasswordScreen} />
                <Stack.Screen name="BadgesScreen" component={BadgesScreen} />
                <Stack.Screen name="Session" component={SessionScreen} />
                <Stack.Screen name="OneToOneSession" component={OneToOneSession} />
                <Stack.Screen name="AllqrCode" component={AllqrCode} />
                <Stack.Screen name="GlobalSearch" component={GlobalSearch} />
                <Stack.Screen name="GlobalSearchResults" component={GlobalSearchResults} />
                <Stack.Screen name="ImageViewerScreen" component={ImageViewerScreen} />
                <Stack.Screen name="AllParticipants" component={AllParticipantLists} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
                <Stack.Screen name="ActiveMembership" component={ActiveMembership} />
                <Stack.Screen name="HelpSupportPage" component={HelpSupportPage} />
                <Stack.Screen name="ReportBug" component={ReportBug} />
                <Stack.Screen name="GamificationSummary" component={GamificationSummary} />
                <Stack.Screen name="GamificationLevelUp" component={GamificationLevelUp} />
                <Stack.Screen name="SessionFeedback" component={SessionFeedback} />
                <Stack.Screen name="GuestBooking" component={GuestBookingScreen} />
            <Stack.Screen name="OnlineCheckInCode" component={OnlineCheckInCode} />
        </Stack.Navigator>
    );
};

export default AllAccessNavigator;
