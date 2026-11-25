import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  disabled?: any;
  gradientStyle?:StyleProp<ViewStyle>;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  containerStyle,
  textStyle,
  colors = ['#F4F4F4', '#FFCC33', '#DB3171', '#422199'],
  start = {x: 0.0, y: 0.0},
  end = {x: 1.0, y: 1.0},
  disabled,
  gradientStyle
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttonContainer, containerStyle]}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.gradient,gradientStyle]}>
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </Pressable>
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
    borderRadius: widthScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
});

export default GradientButton;
