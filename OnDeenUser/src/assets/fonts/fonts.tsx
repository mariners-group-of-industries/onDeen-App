import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');
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
  allroundgothicLight: 'FONTSPRINGDEMO-AllRoundGothicLigRegular',
  allroundgothicRegular: 'FONTSPRINGDEMO-AllRoundGothicDemiRegular',
  allroundgothicMedium: 'FONTSPRINGDEMO-AllRoundGothicMediumRegular',
  allroundgothicSemiBold: 'FONTSPRINGDEMO-AllRoundGothicMediumRegular',
  allroundgothicBold: 'FONTSPRINGDEMO-AllRoundGothicBoldRegular',

  // All Round Gothic font family variations
  altromagneticThin: 'FONTSPRINGDEMO-AllRoundGothicXLigRegular',
  altromagneticLight: 'FONTSPRINGDEMO-AllRoundGothicLigRegular',
  altromagneticBook: 'FONTSPRINGDEMO-AllRoundGothicBookRegular',
  altromagneticRegular: 'FONTSPRINGDEMO-AllRoundGothicDemiRegular',
  altromagneticMedium: 'FONTSPRINGDEMO-AllRoundGothicMediumRegular',
  altromagneticSemiBold: 'FONTSPRINGDEMO-AllRoundGothicSemiRegular',
  altromagneticBold: 'FONTSPRINGDEMO-AllRoundGothicBoldRegular',
  altromagneticBlack: 'FONTSPRINGDEMO-AllRoundGothicThickRegular',
  altromagneticTest: 'FONTSPRINGDEMO-AllRoundGothicTextRegular',
  // SF Pro Rounded Black font family variations
  SFProRoundedBlackLight: 'SFProRounded-Light',
  SFProRoundedBlackRegular: 'SFProRounded-Regular',
  SFProRoundedBlackMedium: 'SFProRounded-Medium',
  SFProRoundedBlackSemiBold: 'SFProRounded-Semibold',
  SFProRoundedBlackBold: 'SFProRounded-Bold',
};
