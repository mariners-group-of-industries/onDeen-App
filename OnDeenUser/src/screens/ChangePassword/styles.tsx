import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: widthScale(16),
  },
  iconButton: {
    marginLeft: widthScale(8),
  },
  title: {
    fontSize: fontScale(16),
    // fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  inputContainer: {
    width: '80%',
    marginTop: heightScale(26),
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    // paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(18),
    color: '#131313',
    height: 58,
  },

  customButtonContainer: {
    height: heightScale(48),
    marginTop: heightScale(12),
    paddingHorizontal: widthScale(40),
  },
  customButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 15,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: heightScale(60),
  },
  greetingText: {
    fontSize: fontScale(24),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    color: '#0E0D0E',
    marginTop: heightScale(32),
    lineHeight: 26,
  },
  instructionsText: {
    fontSize: fontScale(12),
    color: '#161616',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 14,

  },
  inputLabel: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(12),
    lineHeight: 16,
    color: '#161616',
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 2,
    fontFamily: fontFamilies.allroundgothicSemiBold,
  },
});

export default styles;
