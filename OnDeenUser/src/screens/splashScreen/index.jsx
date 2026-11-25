import React, { useEffect } from 'react';
import { View, StatusBar, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setIsSkippedLogin } from '../../redux/slices/loginSlice';
import { generateToken } from '../../redux/slices/initialTokenSlice';
import styles from './styles';
import Logo from '../../../src/assets/svg/logo.svg';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.token);
  const tokenStatus = useSelector((state) => state.token.status);
  const error = useSelector((state) => state.token.error);
  const isSkippedLoginAllow = useSelector(
    (state) => state.user.isSkippedLoginAllow,
  );
  useEffect(() => {
    dispatch(generateToken());
  }, [dispatch]);

  useEffect(() => {
    if (tokenStatus === 'succeeded') {
      if (isSkippedLoginAllow) {
        dispatch(setIsSkippedLogin(true));
      }
    } else if (tokenStatus === 'failed') {

    }
  }, [tokenStatus, token, error, isSkippedLoginAllow, dispatch]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/splashBg.png')}
          style={styles.backgroundImage}
          resizeMode="cover">
        <View style={styles.centeredContainer}>
          <Logo width={207} height={162} />
        </View>
        </ImageBackground>
      </View>
    </>
  );
};

export default SplashScreen;
