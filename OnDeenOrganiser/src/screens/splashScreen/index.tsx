import React, {useEffect} from 'react';
import {View, Image, ImageBackground, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import styles from './styles';
import {AppDispatch, RootState} from '../../redux/store';
import {generateToken} from '../../redux/slices/initialTokenSlice';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>(); // Strongly typed dispatch
  const token = useSelector((state: RootState) => state.token.token);
  const tokenStatus = useSelector((state: RootState) => state.token.status);
  const error = useSelector((state: RootState) => state.token.error);
  useEffect(() => {
    dispatch(generateToken());
  }, [dispatch]);

  useEffect(() => {
    if (tokenStatus === 'succeeded') {
    } else if (tokenStatus === 'failed') {
      console.error('Error generating token:', error);
    }
  }, [tokenStatus, token, error]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
        start={{x: 0.0, y: 0.0}}
        end={{x: 1.0, y: 1.0}}
        style={[styles.gradient, {height: insets.top - 56}]}
      />
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/splashBg.png')}
          style={styles.backgroundImage}
          resizeMode="cover">
          <View style={styles.centeredContainer}>
            <Image
              source={require('../../assets/images/logoWhite.png')}
              style={styles.centerImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>
    </>
  );
};

export default SplashScreen;