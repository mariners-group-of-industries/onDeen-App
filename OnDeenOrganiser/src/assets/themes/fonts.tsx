import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: screenHeight} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
export const fontSizes = {
  size10: normalize(10),
  size12: normalize(12),
  size14: normalize(14),
  size16: normalize(16),
  size18: normalize(18),
  size20: normalize(20),
  size22: normalize(22),
  size24: normalize(24),
  size26: normalize(26),
  size28: normalize(28),
  size30: normalize(30),
  size32: normalize(32),
  size34: normalize(34),
  size36: normalize(36),
};

export const fontFamilies = {
  // All Round Gothic font family variations
  allroundgothicLight: 'Fontspring-DEMO-allroundgothic-lig', // Light weight
  allroundgothicRegular: 'Fontspring-DEMO-allroundgothic-text', // Regular weight (400)
  allroundgothicMedium: 'Fontspring-DEMO-allroundgothic-lig', // Medium weight (500)
  allroundgothicSemiBold: 'Fontspring-DEMO-allroundgothic-semioblique', // SemiBold weight (600)
  allroundgothicBold: 'Fontspring-DEMO-allroundgothic-bold', // Bold weight (700)

  // SF Pro Rounded Black font family variations
  SFProRoundedBlackLight: 'SF-Pro-Rounded-Light', // Light weight
  SFProRoundedBlackRegular: 'SF-Pro-Rounded-Regular', // Regular weight (400)
  SFProRoundedBlackMedium: 'SF-Pro-Rounded-Medium', // Medium weight (500)
  SFProRoundedBlackSemiBold: 'SF-Pro-Rounded-Semibold', // SemiBold weight (600)
  SFProRoundedBlackBold: 'SF-Pro-Rounded-Bold', // Bold weight (700)
};

export const fontColor = {
  WHITE: '#FFFFFF',
  GRAISHVIOLET: '#F3F0F7',
  CHINESEBLACK: '#161616',
  CERISERED: '#DB3171',
};
