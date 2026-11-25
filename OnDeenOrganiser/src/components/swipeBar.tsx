import React, {useRef} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Image,
  Text,
  View,
  Easing,
} from 'react-native';
import {heightScale, widthScale} from '../helpers/scale';

interface AnimatedSwipeProps {
  swipeThreshold?: number;
  onSwipeComplete?: () => void;
}

const AnimatedSwipe: React.FC<AnimatedSwipeProps> = ({
  swipeThreshold = widthScale(300),
  onSwipeComplete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const animationEnded = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (!animationEnded.current && gestureState.dx >= 0) {
          translateX.setValue(gestureState.dx); // Prevent negative movement
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > swipeThreshold) {
          Animated.timing(translateX, {
            toValue: swipeThreshold,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            animationEnded.current = true;
            onSwipeComplete?.();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
          }).start(() => {
            animationEnded.current = false;
          });
        }
      },
    }),
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.animatedView, {transform: [{translateX}]}]}>
        <Image
          source={require('../assets/images/animation.png')}
          style={styles.switchButtonImage}
        />
      </Animated.View>
      <Text style={styles.swipeText}>Swipe to check-in</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    padding: widthScale(10),
    backgroundColor: '#E8E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 90,
    paddingVertical: heightScale(4),
    borderColor: '#D8D0E3',
    marginHorizontal: widthScale(24),
  },
  animatedView: {
    zIndex: 1,
  },
  switchButtonImage: {
    resizeMode: 'contain',
  },
  swipeText: {
    left: widthScale(86),
    color: '#948D9A',
    fontSize: 12,
  },
});

export default AnimatedSwipe;
