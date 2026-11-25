import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    // fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  inputContainer: {
    width: '84%',
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
    // height: 48,
    marginTop: 12,
    paddingHorizontal: 36,
  },
  customButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 18
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    color: '#0E0D0E',
    marginTop: 18,
    paddingBottom: 10
  },
  instructionsText: {
    fontSize: 12,
    color: '#161616',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 14,
  },
});

export default styles;
