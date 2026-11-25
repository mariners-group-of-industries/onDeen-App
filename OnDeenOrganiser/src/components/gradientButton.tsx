import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {fontScale, heightScale, widthScale} from '../helpers/scale';
import {fontFamilies} from '../assets/themes/fonts';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  gradientstyles: StyleProp<TextStyle>;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  containerStyle,
  textStyle,
  colors = ['#F4F4F4', '#FFCC33', '#DB3171', '#422199'],
  start = {x: 0.0, y: 0.0},
  end = {x: 1.0, y: 1.0},
  gradientstyles,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.buttonContainer, containerStyle]}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.gradient, gradientstyles]}>
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    borderRadius: widthScale(28),
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: widthScale(24),
    paddingVertical: heightScale(16),
    borderRadius: widthScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '500',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default GradientButton;
