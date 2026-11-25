import {StyleSheet, Dimensions, PixelRatio, ViewStyle, Platform} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const {width: SCREEN_WIDTH, height: screenHeight} = Dimensions.get('window');
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
    // padding: normalize(16),
  },
  searchBarContainer: {
    marginTop: screenHeight * 0.02,
    marginHorizontal: normalize(24),
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
    paddingVertical: normalize(0),
    height: normalize(42),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0F7',
    
  },
  searchInput: {
    fontSize: normalize(12),
    color: '#969696',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    paddingVertical: normalize(0),
    height: normalize(42),
    paddingRight:120,
  },
  searchResult: {
    fontSize: normalize(16),
    color: '#969696',
  },
  searchList: {
    marginTop: normalize(8),
    maxHeight: normalize(200),
  },
  content: {
    flex: 1,
    marginTop:12
  },
  exploreText: {
    fontSize: normalize(18),
    // fontWeight: '700',
    color: '#191719',
    marginTop: normalize(20),
    textAlign: 'center',
    fontFamily:fontFamilies.SFProRoundedBlackBold
  },
  historyTitle: {
    fontSize: normalize(14),
    color: '#0E0D0E',
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
    paddingLeft:24
  },
  popularTextSearch: {
    fontSize: normalize(18),
    color: '#0E0D0E',
    // textAlign: 'center',
    fontFamily:fontFamilies.allroundgothicSemiBold,
    lineHeight:20
  },
  topeventsContainer: {
    borderRadius: normalize(32),
    backgroundColor: '#F3F0F7',
    marginTop: normalize(24),
  },
  upcomingContainer: {
    // marginTop: normalize(38),
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

  
  eventDate: {
    fontSize: normalize(12),
    color: '#161616',
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    lineHeight:14
  },
  carouselDateLast: {
    fontSize: normalize(12),
    color: '#17101F',
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
    lineHeight:16
  },
  carouselPrice: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginTop: normalize(8),
    color: '#FF6347',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(22),
  },
  carouselSecondaryConatiner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(42),
  },
  carouselHeading: {
    fontSize: normalize(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: normalize(12),
    color: '#191719',
  },
  carouselsubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(16),
  },
  textContainer: {
    // flex: 1,
    width: normalize(173),
  },
  arrowContainer: {
    // left: SCREEN_WIDTH * 0.16,
    // left: SCREEN_WIDTH * 0.16,
  },
  arrowImage: {
    width: normalize(35),
    height: normalize(35),
    resizeMode: 'contain',
  },
  customLable: {
    fontSize: normalize(10),
    color: '#17101F',
    fontFamily:fontFamilies.SFProRoundedBlackBold,
    bottom: normalize(3),
  },
  customLabelContainer: {
    height: normalize(24),
    borderRadius: normalize(4),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(12),
    backgroundColor: '#FFF7E1',
    marginTop: normalize(4),
    alignItems:'center'
  },
  customLabelContainerFree: {
    height: normalize(24),
    borderRadius: normalize(4),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(12),
    backgroundColor: '#C8F9AA',
    marginTop: normalize(4),
    alignItems:'center'
  },
  dateIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between'
  },
  customLableCarousel: {
    color: '#F2F2F2',
    fontSize: normalize(12),
    fontFamily:fontFamilies.SFProRoundedBlackMedium
  },
  customLableCarouselTags: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: normalize(12),
  },
  customLableSecondaryCarousel: {
    color: '#17101F',
    fontWeight: '700',
    fontSize: normalize(10),
    bottom: normalize(2),
  },
  customLableCarouselContainer: {
    backgroundColor: '#00000066',
    borderRadius: normalize(8),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(12),
    marginLeft:widthScale(8)
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#C8F9AA',
    borderRadius: normalize(4),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(12),
    height: normalize(20),
    width: normalize(48),
  },
  heartIcon: {
    width: normalize(36),
    height: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(32),
    bottom: normalize(6),
    right: normalize(8),
    // flexDirection:'row',
    backgroundColor: '#00000066',
    
    
  },
  heartIconSecondary: {
    width: normalize(36),
    height: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(32),
    bottom: normalize(6),
    backgroundColor: '#00000066',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(17),
    gap: normalize(4),
  },
  pagination: {
    paddingVertical: normalize(0),
  },
  activeDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(5),
    backgroundColor: '#969696',
  },
  inactiveDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#969696',
  },
  indexText: {
    // marginLeft: 10,
    fontSize: normalize(10),
    color: '#EEE9F4',
    fontFamily:fontFamilies.SFProRoundedBlackBold,
  },
  touchableLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: normalize(4),
    marginTop: normalize(16),
    flexWrap:'wrap'
    // marginLeft: normalize(22),
    // justifyContent:'space-between'
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(16),
    paddingLeft: normalize(14),
    paddingRight: normalize(6),
  },
  viewallLabel: {
    fontSize: normalize(10),
    color: '#000000',
    fontFamily:fontFamilies.SFProRoundedBlackBold
  },
  viewallContainer: {
    height: normalize(40),
    width: normalize(97),
    borderRadius: normalize(90),
    paddingVertical: normalize(4),
    paddingRight: normalize(12),
    paddingLeft: normalize(16),
    backgroundColor: '#F3F0F7',
  },
  gradientBorder: {
    borderRadius: 90,
    padding: normalize(1.3),
  },
  popularText: {
    fontSize: normalize(24),
    color: '#0E0D0E',
    fontFamily:fontFamilies.allroundgothicSemiBold,
    lineHeight:26
  },
  popularContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.82,
    marginBottom: normalize(16),
  },
  premiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: normalize(32),
    marginHorizontal: normalize(5),
    paddingBottom:10
  },
  premiumImageContainer: {marginTop: normalize(28), marginLeft: normalize(34)},
  introText: {
    fontSize: normalize(16),
    color: '#FFCC33',
    fontFamily:fontFamilies.SFProRoundedBlackMedium
  },
  subscribeText: {
    fontSize: normalize(20),
    color: '#F8F1FE',
    fontFamily:fontFamilies.allroundgothicSemiBold
  },
  txtbtnConatiner: {
    paddingRight: normalize(23),
    paddingBottom: normalize(28),
    paddingTop: normalize(34),
    paddingLeft: normalize(20),
  },
  priceBtn: {
    marginTop: normalize(12),
    borderRadius: normalize(90),
    alignItems: 'center',
    justifyContent: 'center',
    // right: normalize(45),
    // height:heightScale(40),
    width:widthScale(105)
  },
  priceText: {
    fontSize: fontScale(10),
    color: '#FFFFFF',
    fontFamily:fontFamilies.SFProRoundedBlackBold,
    // lineHeight:12
  },
  exploreInterestContainer: {
    marginTop: normalize(43),
    marginHorizontal:23,
    paddingBottom:8
  },
  interestText: {
    color: '#767676',
    fontSize: normalize(16),
    textAlign: 'center',
    fontFamily:fontFamilies.SFProRoundedBlackMedium
  },
  topicText: {
    color: '#191719',
    fontSize: normalize(24),
    textAlign: 'center',
    fontFamily:fontFamilies.allroundgothicSemiBold
  },
  interestLabelContainer: {
    marginBottom: normalize(35),
    marginTop: normalize(17),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: normalize(10),
  },
  interestLabel: {
    backgroundColor: '#F9F6FD',
    borderRadius: normalize(90),
    paddingVertical: normalize(0),
    borderWidth:1,
    borderColor:'#C4C4C4',
    paddingHorizontal:widthScale(16),
    height:heightScale(30)
  },
  interestLabelText: {
    color: '#161616',
    fontSize: normalize(11),
    textAlign: 'center',
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold

  },
  interesetFirstRow: {
    // flexDirection: 'row',
    gap: normalize(10),
    justifyContent:'center',
    alignItems:'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillingFastContainer: {
    backgroundColor: '#000000',
    borderRadius: widthScale(8),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
  },
  newEventContainer: {
    backgroundColor: '#000000',
    borderRadius: widthScale(8),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(6),
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  unisexContainer: {
    backgroundColor: '#FFF2F7',
    borderRadius: widthScale(8),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
  },
  paidEventContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: widthScale(8),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
  },
  customLableCarousel2: {
    color: '#000000',
    fontWeight: '400',
    fontSize: fontScale(12),
  },
  customLableNewEvents: {
    color: '#F9F6FD',
    fontWeight: '400',
    fontSize: fontScale(12),
  },
  imageTouchableContainer: {
    height: heightScale(28),
    width: widthScale(28),
    borderRadius: widthScale(20),
    borderWidth: 1,
    backgroundColor: '#FFE0EB',
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    left: widthScale(19),
    // bottom: heightScale(2),
    zIndex: 1,
  },
  eventImage: {width: widthScale(18), height: heightScale(18)},

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
    paddingVertical: heightScale(6),
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    // justifyContent:'space-between',
    gap:8,
    // paddingHorizontal:widthScale(24),
    marginHorizontal:widthScale(24),
    // marginVertical:widthScale(2),
    borderRadius:widthScale(30),
    backgroundColor:'#F9F6FD',
    borderBottomWidth:1,
    borderBottomColor:'#E4E4E4'
  },
  resultImageContainer: {
    height: heightScale(32),
    width: widthScale(32),
    borderRadius: widthScale(90),
    backgroundColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: widthScale(10),
    marginVertical:widthScale(2),
  },
  resultImage: {
    width: widthScale(16),
    height: heightScale(16),
    color:'#DB3171'
  },
  resultText: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily:fontFamilies.SFProRoundedBlackMedium
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
