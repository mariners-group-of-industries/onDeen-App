import {StyleSheet, Dimensions, PixelRatio} from 'react-native';
import {fontFamilies, fontSizes} from '../../assets/themes/fonts';

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
  titleStyle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  containerStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: normalize(12),
  },
  scrollViewContent: {
    // padding: normalize(16),
  },
  searchBarContainer: {
    marginTop: normalize(14),
    marginHorizontal: normalize(24),
  },
  searchBar: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(0),
  },
  searchInput: {
    fontSize: normalize(12),
    color: '#969696',
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
  },
  exploreText: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: '#191719',
    marginTop: normalize(41),
    textAlign: 'center',
  },
  topeventsContainer: {
    // borderRadius: normalize(32),
    // backgroundColor: '#F3F0F7',
    // marginTop: normalize(24),
  },
  upcomingContainer: {
    marginTop: normalize(38),
  },
  upcomingText: {
    fontSize: normalize(16),
    textAlign: 'center',
    fontWeight: '400',
    color: '#767676',
  },
  topeventsText: {
    fontSize: normalize(24),
    fontWeight: '600',
    textAlign: 'center',
    color: '#191719',
  },
  carouselItem: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(24),
    backgroundColor: '#2A2236',
  },
  carouselSecondaryItem: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: normalize(298),
  },
  carouselSecondaryImage: {
    width: '100%',
    height: normalize(170),
    borderRadius: normalize(24),
    overflow: 'hidden',
    // borderWidth: 2,
    // borderColor: 'red',
  },
  imageBorderRadius: {
    borderRadius: normalize(24),
  },
  carouselGradient: {
    padding: normalize(10),
    width: SCREEN_WIDTH * 0.91,
  },
  carouselSecondaryGradient: {
    // padding: normalize(10),
    // backgroundColor: '#EAEAEA',
    // borderRadius: normalize(20),
    // marginHorizontal: normalize(3),
    // bottom: normalize(3),
    // position: 'absolute',
  },
  carouselTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#17101F',
  },
  carouselDate: {
    fontSize: normalize(12),
    color: '#161616',
    fontWeight: '500',
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
  carouselSecondContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
    marginRight: 0,
    // marginBottom: normalize(35),
  },
  carouselThirdContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
    marginRight: 0,
  },
  carouselFourthContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
    marginRight: 0,
    marginBottom: normalize(35),
  },
  carouselSecondaryConatiner: {
    flex: 1,
    marginTop: normalize(42),
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 24,
    // marginBottom: normalize(14),
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
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: normalize(16),
    marginVertical: normalize(8),
  },
  textContainer: {
    // flex: 1,
    // width: normalize(173),
  },
  arrowContainer: {
    left: SCREEN_WIDTH * 0.24,
  },
  arrowImage: {
    width: normalize(35),
    height: normalize(35),
    resizeMode: 'contain',
  },
  customLable: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: '#17101F',
    bottom: normalize(1),
  },
  customLabelContainer: {
    height: normalize(20),
    borderRadius: normalize(4),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(12),
    backgroundColor: '#FFF7E1',
    marginTop: normalize(4),
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: normalize(4),
    alignItems: 'center',
  },
  dateIconSecondContainer: {
    flexDirection: 'row',
    gap: normalize(4),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customLableCarousel: {
    color: '#F2F2F2',
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
    left: normalize(16),
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
    fontWeight: '400',
  },
  touchableLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: normalize(4),
    marginTop: normalize(16),
    marginLeft: normalize(22),
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: normalize(16),
    paddingRight: normalize(8),
  },
  viewallLabel: {
    fontSize: normalize(10),
    color: '#000000',
    fontWeight: '700',
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
    fontSize: fontSizes.size24,
    fontWeight: '600',
    color: '#0E0D0E',
    // fontFamily: fontFamilies.allroundgothicSemiBold,
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
  },
  premiumImageContainer: {marginTop: normalize(28), marginLeft: normalize(34)},
  introText: {
    fontSize: normalize(16),
    color: '#FFCC33',
    fontWeight: '400',
  },
  subscribeText: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: '#F8F1FE',
  },
  txtbtnConatiner: {
    paddingRight: normalize(23),
    paddingBottom: normalize(28),
    paddingTop: normalize(34),
    paddingLeft: normalize(20),
  },
  priceBtn: {
    marginTop: normalize(8),
    height: normalize(40),
    // width: normalize(95),
    borderRadius: normalize(90),
    alignItems: 'center',
    justifyContent: 'center',
    right: normalize(45),
  },
  priceText: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exploreInterestContainer: {
    marginTop: normalize(43),
  },
  interestText: {
    color: '#767676',
    fontSize: normalize(16),
    textAlign: 'center',
    fontWeight: '400',
  },
  topicText: {
    color: '#191719',
    fontSize: normalize(24),
    textAlign: 'center',
    fontWeight: '600',
  },
  interestLabelContainer: {
    marginTop: normalize(17),
    gap: normalize(10),
    // flexDirection: 'row',
    marginBottom: normalize(35),
  },
  interestLabel: {
    backgroundColor: '#F9F6FD',
    borderRadius: normalize(90),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    borderWidth: normalize(1),
    borderColor: '#C4C4C4',
  },
  interestLabelText: {
    color: '#DB3171',
    fontSize: normalize(10),
    fontWeight: '600',
    textAlign: 'center',
  },
  interesetFirstRow: {
    flexDirection: 'row',
    paddingHorizontal: normalize(62),
    gap: normalize(10),
  },
  interesetSecondRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  interesetThirdRow: {
    flexDirection: 'row',
    gap: normalize(10),
    paddingHorizontal: normalize(48),
  },
  interesetFourthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nearbyText: {
    marginTop: normalize(20),
    fontWeight: '600',
    fontSize: normalize(20),
    color: '#0E0D0E',
    marginLeft: normalize(23),
  },
});

export default styles;
