import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import CreateEvent from '../screens/createEventScreen/CreateEvent';
import MainEventDetail from '../screens/MainEventDetail/MainEventDetail';
import Participants from '../screens/MainEventDetail/Participants';
import AddLocationforEvent from '../components/AddlocationforEvent';
import ScanQrCode from '../screens/scanScreen/ScanQrCode';
import FaqScreen from '../screens/FaqScreen/FaqScreen';
import ProfileScreen from '../screens/ProfileDetails/ProfileDetails';
import CreateAccount from '../screens/createAccountScreen/CreateAccount';
import CustomeMapView from '../components/CustomeMapView';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MyStatusBar from '../common/MyStatusBar';
import CustomHeader from '../components/customHeader';
import { fontScale } from '../helpers/scale';
import OneToOneSessions from '../screens/OneToOneSessions/OneToOneSessions';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import DraftsScreen from '../screens/draftsScreen/DraftsScreen';
import NotificationPreferences from '../screens/NotificationPreferences/NotificationPreferences';
import BuddyAssignment from '../screens/BuddyAssignment/BuddyAssignment';
import PreviewEvent from '../screens/createEventScreen/PreviewEvent';
import SpeakerManagementScreen from '../screens/SpeakerManagement/SpeakerManagementScreen';

const Stack = createNativeStackNavigator();

const AllAccessNavigator = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <MyStatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Stack.Navigator initialRouteName="MainNavigator">
                <Stack.Screen name="MainNavigator" component={MainNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="CreateEvent" component={CreateEvent} options={{ headerShown: false }} />
                <Stack.Screen name="PreviewEvent" component={PreviewEvent} options={{ headerShown: false }} />
                <Stack.Screen name="MainEventDetail" component={MainEventDetail} options={{ headerShown: false }} />
                <Stack.Screen name="Participants" component={Participants} options={{ headerShown: false }} />
                <Stack.Screen name="AddLocation" component={AddLocationforEvent} options={{ headerShown: false }} />
                <Stack.Screen name="ScanQrCode" component={ScanQrCode} options={{ headerShown: false }} />
                <Stack.Screen name="AskedQuestion" component={FaqScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OneToOneSessions" component={OneToOneSessions} options={{ headerShown: false }} />
                <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NotificationPreferences" component={NotificationPreferences} options={{ headerShown: false }} />
                <Stack.Screen name="SpeakerManagement" component={SpeakerManagementScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BuddyAssignment" component={BuddyAssignment} options={{ headerShown: false }} />
                <Stack.Screen name="Drafts" component={DraftsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CreateAccount" component={CreateAccount}
                    options={({ navigation }) => ({
                        header: () => (
                            <CustomHeader
                                title="Update account"
                                leftIconName="chevron-left"
                                onLeftPress={() => navigation.goBack()}
                                titleStyle={{
                                    color: '#000000',
                                    fontSize: fontScale(16),
                                }}
                            />
                        ),
                    })} />
                <Stack.Screen name="CustomeMapView" component={CustomeMapView}
                    options={({ navigation }) => ({
                        header: () => (
                            <CustomHeader
                                title="Update Location"
                                leftIconName="chevron-left"
                                onLeftPress={() => navigation.goBack()}
                                titleStyle={{
                                    color: '#000000',
                                    fontSize: fontScale(16),
                                }}
                            />
                        ),
                    })} />
            </Stack.Navigator>
        </GestureHandlerRootView>
    );
};

export default AllAccessNavigator;
