import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Lottie from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const Loader = ({
  isLoading = true,
  containerStyle = {},
  animationStyle = {},
  animationSource = require('../assets/loader.json'),
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <View style={[styles.loaderContainer, containerStyle]}>
      <Lottie
        source={animationSource}
        autoPlay
        loop
        style={[styles.animation, animationStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: width * 0.35,
    height: height * 0.35,
  },
});

export default Loader;
