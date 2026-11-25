import {Dimensions, StyleSheet} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
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
    paddingTop: 10,
  },
  textContainer: {
    marginTop: height * 0.16,
    alignItems: 'center',
    paddingHorizontal: widthScale(24),
  },
  imageBackground: {
    width: '100%',
    height: heightScale(160),
  },
  logoContainer: {
    alignItems: 'center',
  },
  customButtonContainer: {
    height: heightScale(56),
    marginBottom: heightScale(16),
    marginTop: heightScale(26),
    paddingHorizontal: widthScale(24),
  },
  customButtonText: {
    fontSize: fontScale(16),
  },
  socialButtonContainer: {
    marginTop: heightScale(16),
  },
  socialButtonContainerFb: {
    marginTop: heightScale(8),
  },
  socialButtonContainerApple: {
    marginTop: heightScale(8),
  },
  socialButtonText: {},
  inputContainer: {
    paddingHorizontal: widthScale(24),
    marginBottom: heightScale(12),
  },
  inputTitle: {
    marginBottom: heightScale(10),
  },
  textWrapper: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#DB3171',
    fontSize: fontScale(12),
    fontWeight: '400',
    textAlign: 'right',
    marginHorizontal: widthScale(24),
  },
  returnOptionsButton: {
    alignItems: 'center',
    marginTop: heightScale(12),
    marginBottom: heightScale(28),
    paddingVertical: heightScale(10),
  },
  returnOptionsText: {
    color: '#DB3171',
    fontSize: fontScale(13),
    fontWeight: '500',
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
    marginHorizontal: 6,
  },
  loginText: {
    fontSize: fontScale(28),
    alignItems: 'center',
    fontWeight: '500',
    color: '#191719',
    textAlign: 'center',
  },
  greetingText: {
    fontSize: fontScale(16),
    alignItems: 'center',
    fontWeight: '400',
    color: '#676767',
  },
  socialbuttonMainContainer: {
    marginHorizontal: widthScale(24),
    marginBottom: heightScale(30),
  },
  formikContainer: {
    marginTop: heightScale(32),
  },
  otpLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: heightScale(2),
  },
  otpLinkText: {
    color: '#676767',
    fontSize: fontScale(13),
  },
  otpLinkAction: {
    color: '#DB3171',
    fontSize: fontScale(13),
    fontWeight: '500',
    marginLeft: widthScale(6),
  },
});

export default styles;
