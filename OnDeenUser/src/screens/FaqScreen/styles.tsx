import { Dimensions, StyleSheet } from 'react-native';
import { fontScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    marginTop: Dimensions.get('window').height * 0.16
  },
  containerImageEdit: {
    height: 24,
    width: 24,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    right: widthScale(60),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  messageContainer: {
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
    paddingVertical: 24,
    paddingTop: 12,
    paddingHorizontal: widthScale(24),
    flexDirection: 'row',
    gap: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  userName: {
    marginRight: 4,
    color: '#000000',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16

  },
  timestamp: {
    color: '#545454',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16,
  },
  messageText: {
    color: '#3A3A3A',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 18
  },
  replyMessageText: {
    color: 'rgba(58,58,58,1)',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  image: {
    width: 28,
    height: 28,
    borderRadius: 90,
    borderWidth: 0.4,
    borderColor: '#ddd'
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    paddingRight: widthScale(50),
  },
  noquestionanswer: {
    textAlign: 'center', color: '#666',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  }
});
export default styles;
