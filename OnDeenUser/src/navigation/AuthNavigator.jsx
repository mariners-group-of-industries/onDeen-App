import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginEmailPassword/LoginEmailPassword';
import SignupMobileScreen from '../screens/SignupScreen/SignupMobileScreen';
import VerifyMobileOTP from '../screens/VerifyOTP/VerifyMobileOTP';
import Registration from '../screens/RegisterScreen/Registration';
import Membership from '../screens/membership/Membership';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPassword';
import CreatePasswordScreen from '../screens/CreatePassword/CreatePasswordScreen';
import VerifyEmailOTP from '../screens/VerifyOTP/VerifyEmailOTP';
import SignupEmailScreen from '../screens/SignupScreen/SignupEmailScreen';

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Signup"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registration" component={Registration} />
      <AuthStack.Screen name="Membership" component={Membership} />
      <AuthStack.Screen name="Signup" component={SignupMobileScreen} />
      <AuthStack.Screen
        name="SignupEmailScreen"
        component={SignupEmailScreen}
      />
      <AuthStack.Screen
        name="Otp"
        component={VerifyMobileOTP}
        options={{ animation: 'none' }}
      />
      <AuthStack.Screen
        name="VerifyEmailOTP"
        component={VerifyEmailOTP}
        options={{ animation: 'none' }}
      />
      <AuthStack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen
        name="CreatePasswordScreen"
        component={CreatePasswordScreen}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
