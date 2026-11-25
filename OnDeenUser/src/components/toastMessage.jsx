import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { fontScale } from '../helpers/scale';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const Toast = ({ message }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios' ? 0 :  10;

  useEffect(() => {
    if (message) {
      setToastVisible(true);

      const timeoutId = setTimeout(() => {
        setToastVisible(false);
      }, 3000); 

      return () => clearTimeout(timeoutId);
    } else {
      setToastVisible(false);
    }
  }, [message]);

  if (!toastVisible) return null;

  return (
    <View style={[styles.container, { top: topInset }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10000,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
  },
  toastContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingVertical: 15,
    borderRadius: 24,
    marginHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    // Add maxWidth if needed
    width: '85%',
  },
  toastText: {
    color: '#131313',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: fontScale(14),
    flexShrink: 1, // Allows text to shrink if needed
  },
});

export default Toast;