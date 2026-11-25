import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpeakerHome from '../screens/speaker/SpeakerHome';
import SpeakerEvent from '../screens/speaker/SpeakerEvent';
import SpeakerProfile from '../screens/speaker/SpeakerProfile';
import SpeakerNotifications from '../screens/speaker/SpeakerNotifications';
import SpeakerSessions from '../screens/speaker/SpeakerSessions';

const Stack = createNativeStackNavigator();

const SpeakerNavigator = () => (
  <Stack.Navigator initialRouteName="SpeakerHome">
    <Stack.Screen name="SpeakerHome" component={SpeakerHome} options={{headerShown: false}} />
    <Stack.Screen name="SpeakerEvent" component={SpeakerEvent} options={{headerShown: false}} />
    <Stack.Screen name="SpeakerProfile" component={SpeakerProfile} options={{headerShown: false}} />
    <Stack.Screen name="SpeakerNotifications" component={SpeakerNotifications} options={{headerShown: false}} />
    <Stack.Screen name="SpeakerSessions" component={SpeakerSessions} options={{headerShown: false}} />
  </Stack.Navigator>
);

export default SpeakerNavigator;
