import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';
import Apple from '../assets/svg/apple.svg';
import Google from '../assets/svg/google.svg';
import Mail from '../assets/svg/mail.svg';
import Phone from '../assets/svg/phone.svg';

interface SocialButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  title: string;
  iconName?: string | ImageSourcePropType; // Icon name or source
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const iconComponents: { [key: string]: React.FC<any> } = {
  apple: Apple,
  google: Google,
  email: Mail,
phone:Phone
};

const SocialButton: React.FC<SocialButtonProps> = ({
  onPress,
  title,
  iconName,
  containerStyle,
  textStyle,
  iconStyle,
  iconSize = 24,
  disabled = false,
  accessibilityLabel,
}) => {
  // Determine the correct icon component to render
  const IconComponent = iconComponents[iconName as string] || Image;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={disabled ? undefined : onPress}
      style={[styles.buttonContainer, containerStyle, disabled && styles.disabledButton]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
    >
      <View style={styles.buttonContent}>
        <IconComponent
          source={IconComponent === Image ? iconName : undefined}
          style={[styles.icon, iconStyle, { width: iconSize, height: iconSize }]}
          resizeMode={IconComponent === Image ? 'contain' : undefined}
        />
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: widthScale(28),
    backgroundColor: '#fff',
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E3E3E5',
    borderWidth: 1,
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: widthScale(10),
  },
  buttonText: {
    color: '#161616',
    fontSize: fontScale(14),
    fontWeight: '500',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#A9A9A9',
  },
});

export default React.memo(SocialButton);