import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';
const {width: SCREEN_WIDTH, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  box: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 90,
  },
  headerTitle: {
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#000000',
    right: widthScale(62),
    fontSize: fontScale(16),
  },
  bookingContainer: {
    backgroundColor: '#E4DEF1',
    padding: 4,
    borderRadius: widthScale(48),
    gap: widthScale(4),
    marginLeft: widthScale(24),
    marginRight: widthScale(32),
    marginTop: heightScale(7),
    height: heightScale(42),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#F9F6FD',
  },
  activeText: {
    color: '#17101F',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16,
  },
  inactiveText: {
    color: '#545454',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16,
  },
  carouselContainer: {
    marginTop: heightScale(24),
    paddingHorizontal: widthScale(24),
  },
  carouselHeading: {
    color: '#0E0D0E',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 26,
  },
  activeBookingContainer: {
    paddingHorizontal: widthScale(24),
    paddingVertical: widthScale(10),
  },
  bookingHeading: {
    fontSize: fontScale(16),
    paddingTop: heightScale(21),
    paddingBottom: heightScale(12),
    color: '#0E0D0E',
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 26,
    paddingLeft: widthScale(24),
  },
  bokkingItemsContainer: {
    flexDirection: 'row',
  },
  itemImage: {
    height: heightScale(82),
    width: widthScale(82),
    borderRadius: widthScale(24),
    resizeMode: 'cover',
  },
  carouselSecondaryItem: {
    borderRadius: widthScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    marginTop: heightScale(7),
  },
  carouselSecondaryImage: {
    width: '100%',
    height: heightScale(193),
    borderRadius: 24,
    overflow: 'hidden',
    resizeMode: 'contain',
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: widthScale(4),
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 16,
    color: '#161616',
  },
  statusText: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#3A3A3A',
    lineHeight: 12,
  },
  carouselItemTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 18,
    color: '#17101F',
    paddingRight: widthScale(65),
  },
  carouselDate: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  arrowImage: {
    width: widthScale(28),
    height: heightScale(28),
    resizeMode: 'contain',
  },
  nodataText: {
    textAlign: 'center',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#131313',
    paddingTop: heightScale(24),
  },
  loader: {
    flex: 1,
    width: '100%',
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
   exploreText: {
      fontSize: fontScale(24),
      color: '#191719',
      textAlign: 'center',
      fontFamily:fontFamilies.allroundgothicSemiBold
    },
    chousemembership: {
      fontSize: fontScale(14),
      color: '#191719',
      marginTop: heightScale(20),
      marginLeft: heightScale(15),
      textAlign: 'left',
      fontFamily:fontFamilies.SFProRoundedBlackBold
    },
});

export default styles;
