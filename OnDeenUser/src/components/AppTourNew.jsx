import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, Dimensions } from 'react-native';
import { Modal } from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Easing } from 'react-native-reanimated';
import { fontFamilies } from '../../assets/fonts/fonts';
import Close from '../../src/assets/svg/close.svg';
import useTopInset from '../utils/useTopInset';

const AppTourNew = ({ onClose, highlightColor = 'white', modalBgColor = 'rgba(0,0,0,0.7)' }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insetTop = useTopInset();
  const { width, height } = Dimensions.get('window');

  // Calculate responsive positions based on screen dimensions
  const steps = [
    {
      id: 1,
      title: 'Location',
      description: 'Search At Any Location To Find The Events, Courses And Tours.',
      position: {
        highlight: { 
          top: insetTop + 12, 
          left: width * 0.07,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          top: height * 0.2,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
    {
      id: 2,
      title: 'Access Your Wishlist',
      description: `Find Courses, Events, And Tours You've Wishlisted.`,
      position: {
        highlight: { 
          top: insetTop + 12, 
          right: width * 0.03,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          top: height * 0.2,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
    {
      id: 3,
      title: 'Home',
      description: 'Explore Latest Events, Courses And Tours On The Home Screen.',
      position: {
        highlight: { 
          bottom: height * 0.03, 
          left: width * 0.06,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          bottom: height * 0.15,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
    {
      id: 4,
      title: 'Calendar',
      description: 'Easily Track All Your Booked Events By Date.',
      position: {
        highlight: { 
           bottom: height * 0.03, 
          left: width * 0.32,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          bottom: height * 0.15,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
    {
      id: 5,
      title: 'Bookings',
      description: 'View All Your Upcoming And Completed Bookings.',
      position: {
        highlight: { 
         bottom: height * 0.03, 
          left: width * 0.57,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          bottom: height * 0.15,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
    {
      id: 6,
      title: 'Profile',
      description: 'View Your Profile Here.',
      position: {
        highlight: { 
          bottom: height * 0.03, 
          right: width * 0.06,
          width: width * 0.12,
          height: width * 0.12
        },
        tooltip: { 
          bottom: height * 0.15,
          left: width * 0.1,
          width: width * 0.8
        },
      },
    },
  ];

  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenAppTour');
        if (!seen) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking app tour status:', error);
      } finally {
        setIsReady(true);
      }
    };

    checkTourStatus();
  }, []);

  const fade = (toValue, cb) => {
    Animated.timing(fadeAnim, {
      toValue,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(cb);
  };

  const completeTour = async () => {
    try {
      await AsyncStorage.setItem('hasSeenAppTour', 'true');
      setIsVisible(false);
      onClose?.();
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const changeStep = (next) => {
    const newIndex = stepIndex + next;
    if (newIndex >= 0 && newIndex < steps.length) {
      fade(0, () => {
        setStepIndex(newIndex);
        fade(1);
      });
    }
  };

  if (!isReady || !isVisible || !steps.length) {
    return null;
  }

  const currentStep = steps[stepIndex] || {};
  const { title = '', description = '', position = {} } = currentStep;

  const buildDynamicStyle = (pos) => {
    if (!pos) return {};
    
    const result = { position: 'absolute' };
    if (pos.top !== undefined) result.top = pos.top;
    if (pos.left !== undefined) result.left = pos.left;
    if (pos.right !== undefined) result.right = pos.right;
    if (pos.bottom !== undefined) result.bottom = pos.bottom;
    if (pos.width !== undefined) result.width = pos.width;
    if (pos.height !== undefined) result.height = pos.height;
    return result;
  };

  const highlightStyle = {
    ...buildDynamicStyle(position.highlight),
    borderRadius: 100,
    borderWidth: 3,
    borderColor: highlightColor,
  };

  const tooltipStyle = {
    ...buildDynamicStyle(position.tooltip),
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    opacity: fadeAnim,
  };

  return (
    <Modal statusBarTranslucent visible transparent animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: modalBgColor }}>
        {/* Highlight */}
        {position.highlight && <View style={highlightStyle} pointerEvents="none" />}

        {/* Tooltip */}
        <Animated.View style={tooltipStyle}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{
              fontSize: 12,
              fontFamily: fontFamilies.SFProRoundedBlackRegular,
              color: '#8D8D8D',
            }}>{`${stepIndex + 1} / ${steps.length}`}</Text>

            <Pressable
              accessibilityLabel="Close app tour"
              accessibilityRole="button"
              onPress={completeTour}>
              <Close width={20} height={20} />
            </Pressable>
          </View>

          {/* Content */}
          <Text style={{
            fontSize: 16,
            fontFamily: fontFamilies.SFProRoundedBlackMedium,
            marginTop: 5,
            color: '#000',
          }}>{title}</Text>

          <Text style={{
            fontSize: 14,
            color: '#8D8D8D',
            marginTop: 5,
            fontFamily: fontFamilies.SFProRoundedBlackRegular,
          }}>{description}</Text>

          {/* Navigation Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
            {stepIndex > 0 && (
              <Pressable
                onPress={() => changeStep(-1)}
                style={{
                  paddingVertical: 8,
                  backgroundColor: 'white',
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: '#DB3171',
                  width: 74,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: '#DB3171',
                  fontFamily: fontFamilies.SFProRoundedBlackMedium,
                }}>Back</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => (stepIndex === steps.length - 1 ? completeTour() : changeStep(1))}
              style={{
                paddingVertical: 8,
                backgroundColor: '#DB3171',
                borderRadius: 30,
                width: 74,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: stepIndex > 0 ? 0 : 'auto',
              }}
            >
              <Text style={{
                fontSize: 12,
                color: '#FFF',
                fontFamily: fontFamilies.SFProRoundedBlackMedium,
              }}>{stepIndex === steps.length - 1 ? 'Done' : 'Next'}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

export default AppTourNew;
