import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/themes/fonts';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    width: width,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 90,
  },
  textContainer: {
    marginTop: height * 0.29,
    alignItems: 'center',
    paddingHorizontal: widthScale(24),
  },
  greetingText: {
    fontSize: fontScale(16),
    color: '#676767',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  loginText: {
    fontSize: fontScale(28),
    // fontWeight: '500',
    color: '#191719',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    textAlign: 'center',
    lineHeight: heightScale(34),
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
    color: 'black',
  },
  inputContainer: {
    width: '90%',
    marginTop: heightScale(28),
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(24),
    color: '#131313',
  },
  secureText: {
    fontSize: fontScale(12),
    color: '#A1A1A1',
    paddingRight: widthScale(100),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  customButtonContainer: {
    height: heightScale(56),
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(24),
  },
  customButtonText: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(42),
  },
  separatorLine: {
    width: '50%',
    backgroundColor: '#989898',
    height: 1,
  },
  separatorText: {
    fontSize: fontScale(14),
    color: '#989898',
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: widthScale(6),
  },
  socialbuttonMainContainer: {
    width: '100%',
    marginBottom: heightScale(32),
  },
  socialButtonContainer: {
    marginTop: heightScale(16),
    marginHorizontal: widthScale(24),
  },
  socialButtonContainerFb: {
    marginTop: heightScale(8),
    marginHorizontal: widthScale(24),
  },
  socialButtonContainerApple: {
    marginTop: heightScale(8),
    marginHorizontal: widthScale(24),
  },
  otpLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(12),
  },
  otpLinkText: {
    color: '#676767',
    fontSize: fontScale(13),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  otpLinkAction: {
    color: '#DB3171',
    fontSize: fontScale(13),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    marginLeft: widthScale(6),
  },
});

export default styles;
