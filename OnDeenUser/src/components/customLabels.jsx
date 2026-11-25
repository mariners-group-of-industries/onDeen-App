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
  ImageStyle,
  Pressable,
} from 'react-native';
import Svg, { SvgProps } from 'react-native-svg';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';



const TouchableLabel = ({
  label,
  labelSecondary,
  onPress,
  labelStyle,
  labelSecondaryStyle,
  containerStyle,
  disabled = false,
  leftImage,
  rightImage,
  leftImageStyle,
  rightImageStyle,
  imageContainerStyle,
  numberOfLines,
  ellipsizeMode = 'tail',
  accessibilityLabel,
  accessibilityRole = 'button',
}) => {
  const renderImage = (image, style) => {
    if (React.isValidElement(image)) {
      // For SVG components
      return React.cloneElement(image, {
        width: widthScale(14),
        height: heightScale(14),
        ...style,
      });
    } else if (image) {
      // For raster images
      return <Image source={image} resizeMode="contain" style={[styles.image, style]} />;
    }
    return null;
  };

  return (

    <Pressable
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole={accessibilityRole}
      onPress={onPress}
      style={[styles.container, containerStyle, disabled && styles.disabled]}
      disabled={disabled}>
      <View style={[styles.content, imageContainerStyle]}>
        {leftImage && renderImage(leftImage, leftImageStyle)}
        <Text
          ellipsizeMode={ellipsizeMode}
          numberOfLines={numberOfLines}
          style={[styles.label, labelStyle]}>
          {label}
        </Text>
        <Text style={[styles.label, labelSecondaryStyle]}>
          {labelSecondary}
        </Text>
        {rightImage && renderImage(rightImage, rightImageStyle)}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 50
  },
  label: {
    fontSize: fontScale(12),
    color: '#3A3A3A',
    textAlign: 'center',
    maxHeight: 50,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  image: {
    width: widthScale(14),
    height: heightScale(14),
    right: widthScale(3),
  },
  disabled: {
    // opacity: 0.6,
  },
});

export default TouchableLabel;
