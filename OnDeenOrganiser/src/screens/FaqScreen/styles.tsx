import {StyleSheet} from 'react-native';
import {fontScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/themes/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF',
    width: '100%',
  },
  containerImageEdit: {
    height: 24,
    width: 24,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontWeight: '500',
    right: widthScale(60),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
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
  messageContainer2: {
    paddingTop: 12,
    paddingRight: 12,
    flexDirection: 'row',
    marginRight: 24,
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
    fontWeight: '500',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  timestamp: {
    color: 'rgba(84,84,84,1)',
    fontWeight: '400',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  messageText: {
    color: 'rgba(58,58,58,1)',
    fontWeight: '400',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  replyMessageText: {
    color: 'rgba(58,58,58,1)',
    fontSize: 14,
    fontWeight: '400',
  },
  image: {
    width: 28,
    height: 28,
    borderRadius: 30,
  },
  anonymousAvatar: {
    alignItems: 'center',
    backgroundColor: '#FCE7ED',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  anonymousAvatarText: {
    color: '#DF416B',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(14),
  },
  eventName: {
    color: '#6C6280',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(11),
    marginBottom: 3,
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    paddingRight: widthScale(50),
  },
});
export default styles;
