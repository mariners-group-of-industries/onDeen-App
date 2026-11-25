import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/themes/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    padding: widthScale(20),
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: heightScale(30),
  },
  greetingText: {
    fontSize: fontScale(24),
    fontWeight: '500',
    color: '#161616',
    marginTop: heightScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  instructionsText: {
    fontSize: fontScale(16),
    color: '#676767',
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: heightScale(12),
    marginTop: heightScale(24),
  },
  otpBox: {
    width: widthScale(52),
    height: heightScale(52),
    borderRadius: widthScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
  },
  otpInput: {
    fontSize: fontScale(16),
    textAlign: 'center',
    width: '100%',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#161616',
  },
  customButtonContainer: {
    marginVertical: heightScale(24),
  },
  customButtonText: {
    fontSize: fontScale(16),
    color: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: heightScale(20),
  },
  otpText: {
    textAlign: 'left',
    color: '#161616',
    fontSize: fontScale(12),
    top: heightScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  didnotText: {
    color: '#191719',
    fontWeight: '400',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  resendText: {
    color: '#DB3171',
    fontWeight: '400',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  otptextContainer: {
    flexDirection: 'row',
    gap: widthScale(5),
    justifyContent: 'center',
  },
  errorMessage: {
    color: 'red',
    fontWeight: '400',
    fontSize: fontScale(12),
  },
  changetext: {
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '400',
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
});

export default styles;
