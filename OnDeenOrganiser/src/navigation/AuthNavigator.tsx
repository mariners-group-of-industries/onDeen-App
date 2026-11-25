import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/loginScreen';
import OTPScreen from '../screens/otpScreen';
import SignupEmailScreen from '../screens/signupEmailScreen';
import VerifyEmailOTP from '../screens/verifyEmailOtpScreen';
import CustomHeader from '../components/customHeader';
import { RootStackParamList } from '../types/navigation';
import { fontScale } from '../helpers/scale';
import CreateAccount from '../screens/createAccountScreen/CreateAccount';
import CreateEvent from '../screens/createEventScreen/CreateEvent';
import signinwithMobile from '../screens/signinwithMobile/signinwithMobile';
import CreatePasswordScreen from '../screens/createPasswordScreen';
import ForgotPasswordScreen from '../screens/forgotPasswordScreen';
import CustomeMapView from '../components/CustomeMapView';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MyStatusBar from '../common/MyStatusBar';
import DraftsScreen from '../screens/draftsScreen/DraftsScreen';
import SignupScreen from '../screens/signupScreen';
import PreviewEvent from '../screens/createEventScreen/PreviewEvent';
import ApplicationStatusScreen from '../screens/applicationStatusScreen';

const AuthStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MyStatusBar backgroundColor="#fff" barStyle="dark-content" />
      <AuthStack.Navigator initialRouteName="Signup">
        <AuthStack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="SignupEmailScreen"
          component={SignupEmailScreen}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="VerifyEmailOTP"
          component={VerifyEmailOTP}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="signinwithMobile"
          component={signinwithMobile}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader
                title="Forgot password"
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
        <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen
          name="ApplicationStatus"
          component={ApplicationStatusScreen}
          options={{headerShown: false}}
        />
        <AuthStack.Screen
          name="Otp"
          component={OTPScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader
                title="Back"
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
        <AuthStack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader
                title="Create an account"
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
        <AuthStack.Screen
          name="CreatePasswordScreen"
          component={CreatePasswordScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader
                title="Forgot password"
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
        <AuthStack.Screen
          name="CreateEvent"
          component={CreateEvent}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader
                title="Create an event"
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
        <AuthStack.Screen
          name="PreviewEvent"
          component={PreviewEvent}
          options={{ headerShown: false }}
        />

        <AuthStack.Screen
          name="CustomeMapView"
          component={CustomeMapView}
          options={{ headerShown: false }}
        />
        <AuthStack.Screen name="Drafts" component={DraftsScreen} options={{ headerShown: false }} />
      </AuthStack.Navigator>
    </GestureHandlerRootView>
  );
};

export default AuthNavigator;
