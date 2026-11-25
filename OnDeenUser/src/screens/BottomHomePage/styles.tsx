import { StyleSheet, Dimensions, PixelRatio, ViewStyle, Platform } from 'react-native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  scrollViewContent: {
    // padding: 16,
  },
  searchBarContainer: {
    marginHorizontal: 15,
    marginTop: 8,
    paddingBottom: 8,
  },
  map: {
    width: SCREEN_WIDTH,
    height: screenHeight * 0.8,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 20,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    paddingVertical: 0,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0F7',

  },
  searchInputContainer: {
    height: 52,
    paddingHorizontal: 24,
  },
  searchInput: {
    fontSize: 13,
    color: '#131313',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    paddingVertical: 0,
    height: 52,
    // paddingRight:120,
  },
  searchResult: {
    fontSize: 16,
    color: '#131313',
  },
  searchList: {
    marginTop: 8,
    maxHeight: 200,
  },
  content: {
    // flex: 1,
    // marginTop: 12
  },
  exploreText: {
    fontSize: 18,
    color: '#191719',
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackBold
  },
  historyTitle: {
    fontSize: 14,
    color: '#0E0D0E',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    paddingLeft: 24
  },
  popularTextSearch: {
    fontSize: 18,
    color: '#0E0D0E',
    fontFamily: fontFamilies.allroundgothicRegular,
    lineHeight: 31,
  },
  topeventsContainer: {
    borderRadius: 32,
    backgroundColor: '#F3F0F7',
    marginTop: 24,
  },
  upcomingContainer: {
    // marginTop: 38,
  },
  maskedView: {
    width: '100%',
    height: 60, // Adjust height as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskText: {
    fontSize: 30,
    fontWeight: 'bold',
    // color: 'transparent', // Make the text transparent
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  upcomingText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    color: '#767676',
  },
  topeventsText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#191719',
  },
  carouselItem: {
    // flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselSecondaryItem: {
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    left: 24,
  },
  carouselImage: {
    width: '100%',
    height: 298,
  },
  carouselSecondaryImage: {
    width: '100%',
    height: 298,
  },
  carouselGradient: {
    padding: 10,
  },
  carouselSecondaryGradient: {
    padding: 12,
    backgroundColor: '#EAEAEA',
    borderRadius: 20,
    marginHorizontal: 3,
    bottom: 3,
    position: 'absolute',
  },
  carouselTitle: {
    fontSize: 18,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 22
  },
  carouselDate: {
    fontSize: 14,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 18
  },
  eventDate: {
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#666166',
    flexShrink: 1,
  },
  eventCategory: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#666166',
  },
  carouselDateLast: {
    fontSize: 12,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16
  },
  carouselPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    color: '#FF6347',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  carouselSecondaryConatiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 42,
  },
  carouselHeading: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#191719',
  },
  carouselsubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  textContainer: {
    // flex: 1,
    width: 173,
  },
  arrowContainer: {
    // left: SCREEN_WIDTH * 0.16,
    // left: SCREEN_WIDTH * 0.16,
  },
  arrowImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  customLable: {
    fontSize: 10,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    bottom: 3,
  },
  customLabelContainer: {
    height: 24,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7E1',
    marginTop: 4,
    alignItems: 'center'
  },
  customLabelContainerFree: {
    height: 24,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#C8F9AA',
    marginTop: 4,
    alignItems: 'center'
  },
  dateIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  customLableCarousel: {
    color: '#F2F2F2',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  customLableCarouselTags: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: 12,
  },
  customLableSecondaryCarousel: {
    color: '#17101F',
    fontWeight: '700',
    fontSize: 10,
    bottom: 2,
  },
  customLableCarouselContainer: {
    backgroundColor: '#00000066',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 8
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#C8F9AA',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    height: 20,
    width: 48,
  },
  heartIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    bottom: 6,
    right: 8,
    // flexDirection:'row',
    backgroundColor: '#00000066',


  },
  heartIconSecondary: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    bottom: 6,
    backgroundColor: '#00000066',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
    gap: 4,
  },
  pagination: {
    paddingVertical: 0,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#969696',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#969696',
  },
  indexText: {
    // marginLeft: 10,
    fontSize: 10,
    color: '#EEE9F4',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  touchableLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
    flexWrap: 'wrap'
    // marginLeft: 22,
    // justifyContent:'space-between'
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingLeft: 14,
    paddingRight: 6,
  },
  viewallLabel: {
    fontSize: 10,
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackBold
  },
  viewallContainer: {
    height: 40,
    width: 97,
    borderRadius: 90,
    paddingVertical: 4,
    paddingRight: 12,
    paddingLeft: 16,
    backgroundColor: '#F3F0F7',
  },
  gradientBorder: {
    borderRadius: 90,
    padding: 1.3,
  },
  popularText: {
    fontSize: 24,
    color: '#0E0D0E',
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 26
  },
  popularContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.82,
    marginBottom: 16,
  },
  premiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: 32,
    marginHorizontal: 5,
    paddingBottom: 10
  },
  premiumImageContainer: { marginTop: 28, marginLeft: 34 },
  introText: {
    fontSize: 16,
    color: '#FFCC33',
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  subscribeText: {
    fontSize: 20,
    color: '#F8F1FE',
    fontFamily: fontFamilies.allroundgothicSemiBold
  },
  txtbtnConatiner: {
    paddingRight: 23,
    paddingBottom: 28,
    paddingTop: 34,
    paddingLeft: 20,
  },
  priceBtn: {
    marginTop: 12,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    // right: 45,
    // height:40,
    width: 105
  },
  priceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    // lineHeight:12
  },
  exploreInterestContainer: {
    marginTop: 43,
    marginHorizontal: 23,
    paddingBottom: 8
  },
  interestText: {
    color: '#767676',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  topicText: {
    color: '#191719',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: fontFamilies.allroundgothicSemiBold
  },
  interestLabelContainer: {
    marginBottom: 35,
    marginTop: 17,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  interestLabel: {
    alignSelf: 'center',
    backgroundColor: '#F9F6FD',
    borderRadius: 90,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    paddingHorizontal: 16,
    height: 30
  },
  interestLabelText: {
    color: '#161616',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold

  },
  interesetFirstRow: {
    // flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillingFastContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  newEventContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  unisexContainer: {
    backgroundColor: '#FFF2F7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  paidEventContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  customLableCarousel2: {
    color: '#000000',
    fontWeight: '400',
    fontSize: 12,
  },
  customLableNewEvents: {
    color: '#F9F6FD',
    fontWeight: '400',
    fontSize: 12,
  },
  imageTouchableContainer: {
    height: 28,
    width: 28,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFE0EB',
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    left: 19,
    // bottom: 2,
    zIndex: 1,
  },
  eventImage: { width: 18, height: 18 },
  // resultItem: {
  //   padding: 16,
  //   borderBottomColor: '#eee',
  //   borderBottomWidth: 1,
  // },
  // resultText: {
  //   fontSize: 16,
  // },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
  noResults: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    // justifyContent:'space-between',
    gap: 8,
    // paddingHorizontal:24,
    marginHorizontal: 24,
    // marginVertical:2,
    borderRadius: 30,
    backgroundColor: '#F9F6FD',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4'
  },
  resultImageContainer: {
    height: 32,
    width: 32,
    borderRadius: 90,
    backgroundColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginVertical: 2,
  },
  resultImage: {
    width: 16,
    height: 16,
    color: '#DB3171'
  },
  resultText: {
    fontSize: 12,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 118,
    width: 110,
    borderRadius: 28,
    gap: 5,
    backgroundColor: 'white',
  },
  gradientBorderAll: {
    padding: 1.5,
    borderRadius: 28,
    marginHorizontal: 12,
    marginVertical: 12,
  },
  image: {
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#161616',
  },
  filterContainer: {
    flexDirection: 'row',
    height: 55,
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  activeBookingContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
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
    borderBottomWidth: 1,
    borderBlockColor: '#E4E3E8',
    paddingBottom: 16,
  },
  itemImage: {
    height: 95,
    width: 95,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 0.4,
    borderColor: '#ddd'
  },
  activeBookingSubContainer: {
    flex: 1,
    paddingHorizontal: 10,
    minWidth: 0,
  },
  carouselItemContainer: {
    // marginHorizontal: SCREEN_WIDTH * 0.56,
    // backgroundColor:'red',
    // justifyContent:'flex-end',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'column',
    // bottom:78
  },
  carouselItemTitle: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#161616',
    paddingRight: 12,
    lineHeight: 20,
  },
  eventMetaRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  listHeartContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notFoundText: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    paddingRight: 25,
    alignSelf: 'center'
  },

});

export default styles;
