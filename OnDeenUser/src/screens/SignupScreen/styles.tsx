import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    width: width,
    height: height * 0.31,
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: height * 0.31,
    alignItems: 'center',
    width: '92%',
  },
  greetingText: {
    fontSize: fontScale(16),
    color: '#676767',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  loginText: {
    fontSize: fontScale(28),
    color: '#191719',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    width: '100%',
    textAlign: 'center',
    lineHeight:32
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
    width: '85%',
    marginTop: heightScale(28),
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingHorizontal: widthScale(18),
    color: '#131313',
    height: heightScale(54), // <-- match the fixed height
    fontFamily: fontFamilies.SFProRoundedBlackRegular, // ensure font match too
      fontSize: fontScale(14),
  },
  
  secureText: {
    fontSize: fontScale(12),
    // fontWeight: '400',
    color: '#A1A1A1',
    paddingRight: widthScale(62),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    paddingHorizontal:24
  },
  customButtonContainer: {
    height: heightScale(56),
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(24),
  },
  customButtonText: {
    fontSize: fontScale(16),
    lineHeight:18,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(42),
  },
  separatorLine: {
    width: Dimensions.get('window').width * 0.39,
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
    marginBottom: heightScale(40),
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
  socialButtonLabel: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  emailBackgroundImage: {
    height: height * 0.235,
  },
  emailTextContainer: {
    marginTop: height * 0.245,
  },
  emailBackButton: {
    alignItems: 'center',
    flexDirection: 'row',
    left: widthScale(16),
    position: 'absolute',
    zIndex: 2,
  },
  emailBackText: {
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: fontScale(16),
    marginLeft: widthScale(4),
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(13),
    marginRight: widthScale(24),
    marginTop: heightScale(4),
  },
  passwordLoginLink: {
    alignItems: 'center',
    marginTop: heightScale(16),
    paddingVertical: heightScale(8),
  },
  passwordLoginText: {
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(13),
  },
});

export default styles;
