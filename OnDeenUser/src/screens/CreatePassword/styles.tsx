import {StyleSheet, Dimensions} from 'react-native';
import {fontFamilies} from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
  },
  iconButton: {
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  inputContainer: {
    width: '80%',
    marginTop: 26,
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: 28,
    // paddingVertical: 20,
    paddingHorizontal: 18,
    color: '#131313',
    height: 58,
  },

  customButtonContainer: {
    height: 50,
    marginTop: 12,
    paddingHorizontal: 40,
  },
  customButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 18,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    color: '#0E0D0E',
    marginTop: 32,
    lineHeight: 26,
  },
  instructionsText: {
    fontSize: 12,
    color: '#161616',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 14,

  },
  inputLabel: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
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
