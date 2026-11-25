import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BuddyHome from '../screens/buddy/BuddyHome';
import BuddyTask from '../screens/buddy/BuddyTask';
import ScanQrCode from '../screens/scanScreen/ScanQrCode';

const Stack = createNativeStackNavigator();

const BuddyNavigator = () => (
  <Stack.Navigator initialRouteName="BuddyHome">
    <Stack.Screen name="BuddyHome" component={BuddyHome} options={{headerShown: false}} />
    <Stack.Screen name="BuddyTask" component={BuddyTask} options={{headerShown: false}} />
    <Stack.Screen name="BuddyScanner" component={ScanQrCode} options={{headerShown: false}} />
  </Stack.Navigator>
);

export default BuddyNavigator;
