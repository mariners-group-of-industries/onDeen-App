import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  Dimensions,
  PixelRatio,
  Image,
  View,
} from 'react-native';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

interface TouchableLabelProps {
  label: string;
  onPress: () => void;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  leftImage?: any;
  rightImage?: any;
  leftImageStyle?: ViewStyle;
  rightImageStyle?: ViewStyle;
  accessibilityLabel?: string;
}

const TouchableLabel: React.FC<TouchableLabelProps> = ({
  label,
  onPress,
  labelStyle,
  containerStyle,
  disabled = false,
  leftImage,
  rightImage,
  leftImageStyle,
  rightImageStyle,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle, disabled && styles.disabled]}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      disabled={disabled}>
      <View style={[styles.content, leftImageStyle]}>
        {leftImage && (
          <Image
            source={leftImage}
            resizeMode="contain"
            style={[styles.image, leftImageStyle]}
          />
        )}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {rightImage && (
          <Image
            source={rightImage}
            resizeMode="contain"
            style={[styles.image, rightImageStyle]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(16),
    paddingVertical: heightScale(10),
    borderRadius: widthScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: fontScale(14),
    color: '#3A3A3A',
    textAlign: 'center',
    fontWeight: '600',
  },
  image: {
    width: widthScale(14),
    height: heightScale(14),
    right: widthScale(3),
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TouchableLabel;
