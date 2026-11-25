import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';

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
  },
  textContainer: {
    marginTop: height * 0.31,
    alignItems: 'center',
  },
  greetingText: {
    fontSize: fontScale(16),
    fontWeight: '400',
    color: '#676767',
  },
  loginText: {
    fontSize: fontScale(28),
    fontWeight: '500',
    color: '#191719',
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
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inputContainer: {
    width: '85%',
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
    fontWeight: '400',
    color: '#A1A1A1',
    paddingRight: widthScale(100),
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
});

export default styles;
