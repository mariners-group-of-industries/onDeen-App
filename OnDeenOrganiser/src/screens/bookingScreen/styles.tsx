import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
const {width: SCREEN_WIDTH, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  box: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 90,
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.24,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(24),
    fontWeight: '600',
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  activeTab: {
    backgroundColor: '#F9F6FD',
  },
  activeText: {
    color: '#17101F',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  inactiveText: {
    color: '#545454',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  carouselContainer: {
    marginTop: heightScale(21),
    paddingHorizontal: widthScale(24),
  },
  carouselHeading: {
    color: '#0E0D0E',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  activeBookingContainer: {
    paddingHorizontal: widthScale(24),
  },
  bookingHeading: {
    fontSize: fontScale(16),
    paddingTop: heightScale(21),
    paddingBottom: heightScale(12),
    color: '#0E0D0E',
    fontWeight: '600',
    paddingLeft: widthScale(24),
  },
  bokkingItemsContainer: {
    flexDirection: 'row',
  },
  itemImage: {
    height: heightScale(82),
    width: widthScale(82),
    resizeMode: 'contain',
    color: '#2A2236',
    borderRadius: widthScale(24),
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
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: heightScale(16),
    paddingLeft: heightScale(14),
    paddingRight: widthScale(6),
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#45C624CC',
    borderRadius: widthScale(12),
    paddingVertical: heightScale(2),
    alignItems: 'center',
  },
  customLableSecondaryCarousel: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: fontScale(10),
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    bottom: heightScale(34),
  },
  carouselItemContainer: {
    marginHorizontal: SCREEN_WIDTH * 0.56,
    bottom: heightScale(60),
  },
  carouselSecondaryGradient: {
    borderBottomLeftRadius: widthScale(24),
    borderBottomRightRadius: widthScale(24),
    width: SCREEN_WIDTH * 0.78,
    paddingHorizontal: widthScale(24),
    paddingTop: heightScale(12),
  },
  activeBookingSubContainer: {
    width: SCREEN_WIDTH * 0.68,
    paddingTop: heightScale(6),
    paddingHorizontal: widthScale(9),
    // backgroundColor: 'red',
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: widthScale(4),
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#161616',
  },
  statusText: {
    fontSize: fontScale(10),
    fontWeight: '500',
    color: '#3A3A3A',
  },
  carouselItemTitle: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#17101F',
    paddingRight: widthScale(65),
  },
  carouselDate: {
    fontSize: fontScale(12),
    color: '#161616',
    fontWeight: '500',
  },
  arrowImage: {
    width: widthScale(35),
    height: heightScale(35),
    resizeMode: 'contain',
  },
});

export default styles;
