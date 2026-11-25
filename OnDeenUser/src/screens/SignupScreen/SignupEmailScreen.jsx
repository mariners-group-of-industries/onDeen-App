import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard, ScrollView, StatusBar, Platform, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles';
import SocialButton from '../../components/socialButton';
import Toast from '../../components/toastMessage';
import Loader from '../../components/loader';
import { fontFamilies } from '../../assets/fonts/fonts';
import { useToastForPopup } from '../../context/ToastContext';
import EmailForm from './EmailForm';
import { handleAppleLogin } from './checkAppleLogin';

const SignupEmailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSelector((state) => state.verifyOtp);

  const showToast = useToastForPopup();

  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  if (status === 'loading') {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => setIsLoading(false)}>
        <View style={loaderStyles.modalBackground}>
          <View style={loaderStyles.activityIndicatorWrapper}>
            <ActivityIndicator
              animating={isLoading}
              size="large"
              color="#fff"
            />
            <Text style={loaderStyles.loadingText}>Sending OTP...</Text>
          </View>
        </View>
      </Modal>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <TouchableWithoutFeedback accessible={false} onPress={handlePressOutside}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <Toast message={toastMessage} />
            <Image
              source={require('../../assets/images/splash_bg.png')}
              style={[styles.backgroundImage, styles.emailBackgroundImage]}
              resizeMode="cover"
            />

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={[styles.emailBackButton, { top: insets.top + 12 }]}>
              <Icon name="chevron-left" size={28} color="#17101F" />
              <Text style={styles.emailBackText}>Login with email</Text>
            </TouchableOpacity>

            <View style={[styles.textContainer, styles.emailTextContainer]}>
              <Text style={styles.greetingText}>Hello, Welcome to Ondeen</Text>
              <Text style={styles.loginText}>Login to your account</Text>
            </View>
            <EmailForm />

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialbuttonMainContainer}>
              <SocialButton
                onPress={() => navigation.navigate('Signup')}
                title="Continue with Mobile"
                iconName={'phone'}
                iconSize={22}
                containerStyle={styles.socialButtonContainer}
                textStyle={styles.socialButtonLabel}
              />
              {Platform.OS === 'ios' ? (
                <SocialButton
                  onPress={() => handleAppleLogin({ dispatch, navigation, showToast })}
                  title="Continue with Apple"
                  iconName={'apple'}
                  iconSize={22}
                  containerStyle={styles.socialButtonContainerApple}
                  textStyle={styles.socialButtonLabel}
                />
              ) : null}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.navigate('Login')}
                style={styles.passwordLoginLink}>
                <Text style={styles.passwordLoginText}>Sign in with email and password</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </TouchableWithoutFeedback>
    </>
  );
};

const loaderStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    padding: 50,
    borderRadius: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default SignupEmailScreen;
