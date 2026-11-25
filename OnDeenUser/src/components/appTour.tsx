import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Animated, Dimensions, Pressable} from 'react-native';
import {Modal} from 'react-native-ui-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fontScale, heightScale, widthScale} from '../helpers/scale';
import {Easing} from 'react-native-reanimated';
import {fontFamilies} from '../../assets/fonts/fonts';
import Close from '../../src/assets/svg/close.svg';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Step {
  id: number;
  title: string;
  description: string;
  position: {top: number; left: number};
}

interface AppTourProps {
  steps: Step[];
  onClose: () => void;
  highlightColor?: string;
  modalBgColor?: string;
  textColor?: string;
}

const AppTour: React.FC<AppTourProps> = ({
  steps,
  onClose,
  highlightColor = 'white',
  modalBgColor = 'rgba(0,0,0,0.7)',
  textColor = '#000',
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      const hasSeenTour = await AsyncStorage.getItem('hasSeenAppTour');
      if (!hasSeenTour) {
        setIsVisible(true);
      }
    };
    checkFirstTimeUser();
  }, []);

  const completeTour = async () => {
    await AsyncStorage.setItem('hasSeenAppTour', 'true');
    setIsVisible(false);
    onClose();
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setStepIndex(stepIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      });
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setStepIndex(stepIndex - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  if (!isVisible) return null;

  const {title, description, position} = steps[stepIndex];

  // Check if the tooltip is near the bottom of the screen
  const isBottomTooltip = position.top > SCREEN_HEIGHT / 2;

  // Check if it's for "Location", "Home", "Calendar", or "Bookings"
  const isSpecialStep = ['Home', 'Calendar', 'Bookings'].includes(title);
  const highlightSize = isSpecialStep ? widthScale(64) : widthScale(40);

  // Adjust for "Location" step for a larger highlight
  const isLocationStep = title.toLowerCase() === 'location';
  const adjustedHighlightSize = isLocationStep
    ? highlightSize * 2
    : highlightSize;

  // Adjust the position of the highlight for bottom tab steps
  const adjustedPosition = isSpecialStep
    ? {top: position.top + heightScale(40), left: position.left - 5}
    : {top: position.top, left: position.left};
  const marginTopAdjustment = isLocationStep ? heightScale(40) : 0;

  return (
    <Modal statusBarTranslucent visible animationType="fade" transparent>
      <View style={{flex: 1, backgroundColor: modalBgColor}}>
        {/* Highlighted Element */}
        <View
          style={{
            position: 'absolute',
            left: !isSpecialStep
              ? adjustedPosition.left - 5
              : adjustedPosition.left - 26,
            width: adjustedHighlightSize,
            height: adjustedHighlightSize,
            borderRadius: adjustedHighlightSize / 2,
            borderWidth: widthScale(3),
            borderColor: highlightColor,
            marginTop:
              adjustedPosition.top - (isSpecialStep ? widthScale(-100) : 20),
            backgroundColor: 'transparent',
          }}
          pointerEvents="none"
        />

        {/* Tooltip Modal */}
        <Animated.View
          style={{
            position: 'absolute',
            left: widthScale(54),
            width: widthScale(300),
            backgroundColor: '#FFFFFF',
            padding: widthScale(15),
            borderRadius: widthScale(16),
            opacity: fadeAnim,
            top: isBottomTooltip
              ? position.top - heightScale(90) + marginTopAdjustment
              : position.top + heightScale(120) + marginTopAdjustment,
          }}>
          {/* Tooltip content */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: fontScale(12),
                fontFamily: fontFamilies.SFProRoundedBlackRegular,
                color: '#8D8D8D',
                lineHeight: 16,
              }}>{`${stepIndex + 1} / ${steps.length}`}</Text>

            <Pressable onPress={completeTour}>
              <Close width={widthScale(20)} height={widthScale(20)} />
            </Pressable>
          </View>

          <Text
            style={{
              fontSize: fontScale(16),
              fontFamily: fontFamilies.SFProRoundedBlackMedium,
              marginTop: heightScale(5),
              color: '#000000',
              lineHeight: 20,
            }}>
            {title}
          </Text>
          <Text
            style={{
              fontSize: fontScale(14),
              color: '#8D8D8D',
              marginTop: heightScale(5),
              fontFamily: fontFamilies.SFProRoundedBlackRegular,
              lineHeight: 16,
            }}>
            {description}
          </Text>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: heightScale(15),
            }}>
            {stepIndex > 0 && (
              <Pressable
                style={{
                  paddingVertical: heightScale(8),
                  paddingHorizontal: widthScale(6),
                  backgroundColor: 'white',
                  borderRadius: widthScale(30),
                  borderWidth: 1,
                  borderColor: '#DB3171',
                  height: heightScale(30),
                  width: widthScale(74),
                  alignItems: 'center',
                }}
                onPress={prevStep}>
                <Text
                  style={{
                    fontSize: fontScale(12),
                    lineHeight: 14,
                    color: '#DB3171',
                    fontFamily: fontFamilies.SFProRoundedBlackMedium,
                  }}>
                  Back
                </Text>
              </Pressable>
            )}

            <Pressable
              style={{
                paddingVertical: heightScale(8),
                paddingHorizontal: widthScale(6),
                backgroundColor: '#DB3171',
                borderRadius: widthScale(30),
                height: heightScale(30),
                width: widthScale(74),
                alignItems: 'center',
              }}
              onPress={nextStep}>
              <Text
                style={{
                  fontSize: fontScale(12),
                  lineHeight: 14,
                  fontFamily: fontFamilies.SFProRoundedBlackMedium,
                  color: '#FFFFFF',
                }}>
                {stepIndex === steps.length - 1 ? 'Done' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AppTour;
