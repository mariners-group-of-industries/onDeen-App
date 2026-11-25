import {StyleSheet, Dimensions} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  greetingText: {
    fontSize: 28,
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
    color: '#191719',
    marginTop: 18,
    lineHeight:32
  },
  instructionsText: {
    fontSize: 16,
    color: '#676767',
    textAlign: 'center',
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    lineHeight:20
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 36,
  },
  otpBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
  },
  otpInput: {
    fontSize: 20,
    textAlign: 'center',
    width: '100%',
    color: '#161616',
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
  },
  customButtonContainer: {
    marginVertical: 24,
  },
  customButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily:fontFamilies.SFProRoundedBlackMedium

  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  otpText: {
    textAlign: 'left',
    color: '#161616',
    fontSize: 12,
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
    top: 20,
    lineHeight:16
  },
  didnotText: {
    color: '#A1A1A1',
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight:16
  },
  resendText: {
    color: '#DB3171',
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight:16
  },
  verifyingText: {
    color: '#DB3171',
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
    fontSize: 18,
  },
  otptextContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  containerOtp: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  // otpBox: {
  //   borderWidth: 1,
  //   borderRadius: 8,
  //   borderColor: '#ccc',
  //   width: 50,
  //   height: 50,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginHorizontal: 5,
  // },
});

export default styles;
