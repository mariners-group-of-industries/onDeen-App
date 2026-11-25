import { StyleSheet, Dimensions } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';
import { fontColor } from '../../../assets/fonts/fonts';
const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fontColor.LITETHEME,
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
    fontSize: 24,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 28,
  },
  bookingContainer: {
    backgroundColor: '#E4DEF1',
    padding: 4,
    borderRadius: 48,
    gap: 4,
    marginLeft: 24,
    marginRight: 24,
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    marginBottom: 10,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4DEF1',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 6,
    marginHorizontal: 24,
    paddingHorizontal: 18,
  },
  searchInput: {
    color: '#17101F',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    height: 48,
    marginLeft: 10,
  },
  tabButton: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: 34,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: '#F9F6FD',
  },
  activeText: {
    color: '#000',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16
  },
  inactiveText: {
    color: '#555',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16
  },
  carouselContainer: {
    marginTop: 22,
    // paddingHorizontal: 24,
  },
  carouselHeading: {
    color: '#0E0D0E',
    fontSize: 16,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 26,
    paddingLeft: 24
  },
  activeBookingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 6
  },
  bookingHeading: {
    fontSize: 16,
    paddingTop: 21,
    paddingBottom: 12,
    color: '#0E0D0E',
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 26,
    paddingLeft: 24,
  },
  bokkingItemsContainer: {
    flexDirection: 'row',
  },
  itemImage: {
    height: 82,
    width: 82,
    borderRadius: 12,
    resizeMode: 'cover',

  },
  carouselSecondaryItem: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    marginTop: 7,
    left: 24,
    marginBottom: 20,
    minHeight: 272,
    borderWidth: 0.4,
    borderColor: '#ddd'
  },
  carouselSecondaryImage: {
    width: '100%',
    height: 193,
    borderRadius: 24,
    overflow: 'hidden',
    resizeMode: 'contain',
    borderWidth: 0.6,
    borderColor: '#ddd'
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingLeft: 14,
    paddingRight: 6,
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#45C624CC',
    borderRadius: 12,
    paddingVertical: 2,
    alignItems: 'center',
  },
  customLableSecondaryCarousel: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 10,
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginTop: -65,
    // paddingBottom:20

  },
  carouselItemContainer: {
    // marginHorizontal: SCREEN_WIDTH * 0.56,
    // bottom: heightScale(66),
    // marginBottom: -50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1
  },
  carouselSecondaryGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    width: SCREEN_WIDTH * 0.9,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  activeBookingSubContainer: {
    // width: SCREEN_WIDTH * 0.65,
    // paddingTop: 14,
    // paddingHorizontal: 9,
  },
  dateIconContainer: {
    alignItems: 'center', flexDirection: 'row', 
    gap:4
  },
  carouselTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 24,
    color: '#161616',
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#3A3A3A',
    lineHeight: 12,
  },
  carouselItemTitle: {
    // paddingTop: 5,
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 20,
    color: '#17101F',
    // paddingRight: widthScale(65),
  },
  carouselDate: {
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000',
  },
  carouselLabel: {
    fontSize: 10,
    color: '#444',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16,
  },
  arrowImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  nodataText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#131313',
    paddingTop: 24,
  },
  loader: {
    flex: 1,
    width: '100%',
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    width: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingBottom: 20,
    // paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // paddingHorizontal:24
  },
  modalHeader: {
    // width: '100%',
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 24
  },
  modalBodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    paddingHorizontal: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: fontFamilies.SFProRoundedBlackRegular
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  modalCancelButton: {
    backgroundColor: '#D3D3D3',
    paddingVertical: 10,
    paddingHorizontal: 45,
    borderRadius: 14,
    // width: '45%',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#3A3A3A',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modalConfirmButton: {
    backgroundColor: '#FF4B2B',
    paddingVertical: 10,
    paddingHorizontal: 45,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
});

export default styles;
