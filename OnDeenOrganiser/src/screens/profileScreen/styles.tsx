import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/themes/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFF',
  },
  heading: {
    color: '#000000',
    fontWeight: '600',
    fontSize: fontScale(24),
    marginTop: heightScale(28),
    paddingLeft: widthScale(36),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
  editProfileContainer: {
    gap: widthScale(12),
    borderBottomWidth: heightScale(1),
    borderBottomColor: '#DFDFDF',
    marginHorizontal: widthScale(36),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightScale(32),
    paddingVertical: heightScale(24),
  },
  editProfileCommonContainer: {
    gap: widthScale(12),
    borderBottomWidth: heightScale(1),
    borderBottomColor: '#DFDFDF',
    marginHorizontal: widthScale(36),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightScale(24),
  },
  editprofileText: {
    color: '#000000',
    fontSize: fontScale(16),
    fontWeight: '500',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  logoImage: {
    marginTop: heightScale(22),
    marginHorizontal: widthScale(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
