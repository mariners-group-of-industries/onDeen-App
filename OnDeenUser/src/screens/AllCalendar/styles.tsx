
import { Dimensions, StyleSheet } from 'react-native';
import { widthScale, heightScale, fontScale } from '../../helpers/scale';
import { fontFamilies } from '../../../assets/fonts/fonts';
const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  gradient: {
    borderRadius: widthScale(8),
    marginVertical: heightScale(10),
    padding: heightScale(15),
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: widthScale(24),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    backgroundColor: '#F9F6FD',
  },
  eventTitle: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#000000',
  },
  eventDescription: {
    fontSize: fontScale(12),
    color: '#000000',
    fontWeight: '400',
  },
  eventDateHeader: {
    fontSize: fontScale(22),
    fontWeight: '700',
    color: '#000',
    paddingVertical: heightScale(10),
    textAlign: 'center',
  },
  noEventsText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentDateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 10,
    color: '#000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.19,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
    marginRight: 18,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontWeight: '500',
    right: widthScale(56),
  },
  timelineContainer: {
    paddingLeft: widthScale(19),
    paddingRight: widthScale(24),
    flexDirection: 'row',
    gap: 15,
  },
  timeLabels: {
    color: '#000000',
    fontSize: fontScale(14),
    fontWeight: '500',
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
  modalContainer: {
    backgroundColor: '#FDFBFF',
    padding: widthScale(20),
    borderRadius: widthScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    color: '#DB3171',
    marginBottom: heightScale(10),
  },
  modalMessage: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    textAlign: 'center',
    marginBottom: heightScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: heightScale(10),
    backgroundColor: '#FFFFFF',
    borderRadius: widthScale(28),
    alignItems: 'center',
    marginRight: widthScale(10),
    borderWidth: 1,
    borderColor: '#422199'
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#DB3171',
  },
  okButton: {
    flex: 1,
    paddingVertical: heightScale(10),
    backgroundColor: '#DB3171',
    borderRadius: widthScale(28),
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#fff',
  },
});

export default styles;
