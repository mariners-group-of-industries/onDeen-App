import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ProfileSettings from '../screens/ProfileSetting/ProfileSetting';
import EditProfile from '../screens/EditProfile/EditProfile';
import BadgesScreen from '../screens/badgesScreen';
import PrivacySetting from '../screens/PrivacySetting/PrivacySetting';
import ChangePassword from '../screens/ChangePassword/ChangePassword';

const ProfileStack = createNativeStackNavigator();

const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{headerShown: false}}>

      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
      />
      <ProfileStack.Screen
        name="ProfileSettings"
        component={ProfileSettings}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfile}
      />
      <ProfileStack.Screen
        name="BadgesScreen"
        component={BadgesScreen}
      />
      <ProfileStack.Screen
        name="PrivacySetting"
        component={PrivacySetting}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePassword}
      />


    </ProfileStack.Navigator>
  );
};

export default ProfileNavigator;
