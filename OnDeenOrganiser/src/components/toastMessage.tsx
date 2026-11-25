import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Animated, View, Platform } from 'react-native';
import { fontScale } from '../helpers/scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [opacity] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (message) {
      setToastVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timeoutId = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 3000);

      return () => clearTimeout(timeoutId);
    } else {
      setToastVisible(false);
    }
  }, [message]);

  return (
    <>
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity, top: Platform.OS === 'ios' ? insets.top : 0 }]}>
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    backgroundColor: '#F3F0F7',
    padding: 10,
    borderRadius: 24,
    zIndex: 99,
    alignItems: 'center',
  },
  toastText: {
    color: '#131313',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: fontScale(14),
  },
});

export default Toast;