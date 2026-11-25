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
import {fontScale, heightScale, widthScale} from '../helpers/scale';

interface TouchableLabelProps {
  label?: string;
  labelSecondary?: string;
  onPress: () => void;
  labelStyle?: TextStyle;
  labelSecondaryStyle?: TextStyle;
  containerStyle?: any;
  imageContainerStyle?: ViewStyle;
  disabled?: boolean;
  leftImage?: any;
  rightImage?: any;
  leftImageStyle?: ImageStyle;
  rightImageStyle?: ImageStyle;
}

const PriceLabels: React.FC<TouchableLabelProps> = ({
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
}) => {
  const renderImage = (image: any, style: ImageStyle | undefined) => {
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
      onPress={onPress}
      style={[styles.container, containerStyle, disabled && styles.disabled]}
      disabled={disabled}>
     <View style={[styles.content, imageContainerStyle]}>
        {leftImage && renderImage(leftImage, leftImageStyle)}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
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
    maxHeight:50
  },
  label: {
    fontSize: fontScale(14),
    color: '#3A3A3A',
    textAlign: 'center',
    fontWeight: '600',
    maxHeight:50
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

export default PriceLabels;
