import {Dimensions, PixelRatio, Platform} from 'react-native';
import Toast from 'react-native-toast-message';
import {handleRefreshToken} from '../redux/auth';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const guidelineBaseWidth = 410;
const guidelineBaseHeight = 812;

// Function to scale based on width
export const widthScale = (size: number) => {
  const newSize = (SCREEN_WIDTH / guidelineBaseWidth) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Function to scale based on height (useful for vertical scaling)
export const heightScale = (size: number) => {
  const newSize = (SCREEN_HEIGHT / guidelineBaseHeight) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// For scaling fonts consistently
export const fontScale = (size: number, factor = 0.5) => {
  const newSize = size + (widthScale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const showToast = (text: string, p0: any) => {
  Toast.show({
    text1: text,
    type: 'success',
    visibilityTime: 2500,
    autoHide: true,
    position: 'bottom',
    bottomOffset: Platform.OS === 'ios' ? 24 : 0,
  });
};
