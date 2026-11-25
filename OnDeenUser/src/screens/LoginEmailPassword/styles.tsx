import { Dimensions, StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    color: '#000000',
    right: 62,
    fontSize: 16,
  },
  imageBackground: {
    width: '100%',
    height: 160,
  },
  logoContainer: {
    alignItems: 'center',
  },
  socialButtonContainer: {
    marginTop: 16,
  },
  socialButtonContainerFb: {
    marginTop: 8,
  },
  socialButtonContainerApple: {
    marginTop: 8,
  },

  socialButtonText: {
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16,
    fontSize: 12,
    color: '#161616'
  },
  inputContainer: {
    paddingHorizontal: 24,
  },
  textWrapper: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#DB3171',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    textAlign: 'right',
    marginHorizontal: 24,
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 42,
  },
  separatorLine: {
    width: Dimensions.get('window').width * 0.39,
    backgroundColor: '#989898',
    height: 1,
  },
  separatorText: {
    fontSize: 14,
    color: '#989898',
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: 6,
  },
  loginText: {
    fontSize: 28,
    alignItems: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#191719',
  },
  greetingText: {
    fontSize: 16,
    alignItems: 'center',
    fontWeight: '400',
    color: '#676767',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  socialbuttonMainContainer: {
    marginHorizontal: 24,
    marginBottom: 30,
  },
  formikContainer: {
    marginTop: 32,
  },
  customButtonContainer: {
    height: 56,
    marginTop: 24,
    paddingHorizontal: 24,
  },
  customButtonText: {
    fontSize: 16,
    lineHeight: 18,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  returnOptionsButton: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
    paddingVertical: 10,
  },
  returnOptionsText: {
    color: '#DB3171',
    fontSize: 13,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default styles;
