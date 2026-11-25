import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import SwiperIcon from '../../src/assets/svg/swiper.svg';

const SwipeButton = ({ onSwipeSuccess, disabled }) => {
  const SWIPE_THRESHOLD = 250;
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gesture) => 
        !disabled && Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        if (!disabled && gesture.dx >= 0) {
          translateX.setValue(Math.min(gesture.dx, SWIPE_THRESHOLD));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (!disabled) {
          if (gesture.dx > SWIPE_THRESHOLD * 0.6) {
            Animated.timing(translateX, {
              toValue: SWIPE_THRESHOLD,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              if (onSwipeSuccess) onSwipeSuccess();
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <SwiperIcon />
        </Animated.View>
        <Text style={styles.label}>Swipe to Confirm</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  track: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E5EC',
    justifyContent: 'center',
    paddingLeft: 5,
    position: 'relative',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  label: {
    color: '#131313',
    fontSize: 14,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
});

export default SwipeButton;