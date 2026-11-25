import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  box: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 90,

  },
  carouselContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
    width: '100%',

  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.24,
    
  },
  headerTitle: {
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight:16,
    right:68,
        borderWidth:0.6,
    borderColor:'gray'
  },
 
  carouselHeading: {
    color: '#0E0D0E',
    fontSize: fontScale(20),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight:26
  },
  carouselSecondaryItem: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 170,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselSecondaryImage: {
    width: 170,
    height: 170,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth:1,
    borderColor:'#ddd'
  },
  imageBorderRadius: {
    borderRadius: 24,
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    // paddingRight: widthScale(2),
    // marginHorizontal:8,
    width:'100%'
  },
  imageTouchableContainer: {
    height: 30,
    width: 30,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFE0EB',
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    bottom:4,
  },
  categoryTitleContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft:-12,
  },
  customLableCarouselTags: {
    color: '#ffffff',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 10,
    lineHeight: 12,
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
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    width: 170,
  },
  carouselTitle: {
    fontSize: 14,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight:20
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  carouselDate: {
     fontSize: 12,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  dateIconSecondContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  customLableSecondaryCarousel: {
    color: '#17101F',
    fontWeight: '700',
    fontSize: 10,
     alignItems:'center',
    justifyContent:'center',
    alignSelf:'center',
    textAlign:'center'
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#F9E5AA',
    borderRadius: 4,
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
    // height: heightScale(20),
    left: 10,
    alignItems:'center',
    justifyContent:'center'
  },
  priceContainerFree: {
    backgroundColor: '#C8F9AA',
    borderRadius: widthScale(4),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
    // height: heightScale(20),
    left: 10,
     alignItems:'center',
    justifyContent:'center'
  },  
  carouselFourthContainer: {
    marginTop: heightScale(16),
    marginBottom: heightScale(65),
    paddingHorizontal: widthScale(24),
  },
  containerImageEdit: {
    height: heightScale(24),
    width: widthScale(24),
  },
  nearbyText: {
    marginTop: heightScale(20),
    fontWeight: '600',
    fontSize: fontScale(20),
    color: '#0E0D0E',
    marginLeft: widthScale(23),
  },
  profilePicContainer: {
    marginTop: heightScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: heightScale(82),
    width: widthScale(82),
    borderRadius: 90,
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
    borderWidth: 1,
    borderColor: '#F9F6FD',
  },
  speakerName: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#000000',
  },
  speakerTitle: {
    fontSize: fontScale(14),
    fontWeight: '400',
    color: '#3A3A3A',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: heightScale(12),
  },
  paidEventContainer: {
    backgroundColor: '#F6EDFF',
    borderRadius: widthScale(8),
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
  },
  customLableCarousel: {
    color: '#000000',
    fontWeight: '400',
    fontSize: fontScale(12),
  },
  requestContainer: {
    backgroundColor: '#3E146F',
    height: heightScale(48),
    marginTop: heightScale(20),
    paddingHorizontal: widthScale(16),
    borderRadius: 90,
    width: Dimensions.get('window').width * 0.78,
  },
  requestLabel: {
    color: '#FDFBFF',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
  aboutEventConatiner: {
    marginTop: heightScale(16),
    // paddingHorizontal: widthScale(21),
  },
  readMoreText: {
    color: '#DF416B',
    fontSize: fontScale(12),
    fontWeight: '400',
    paddingTop: heightScale(4),
  },
  organizedText: {
    fontSize: fontScale(12),
    color: '#545454',
    fontWeight: '500',
    lineHeight: heightScale(16),
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  emptyContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#555',
    marginTop: 15,
  },
  listContainer: {
    // width:SCREEN_WIDTH,
    // justifyContent:'center',
    // alignItems:'center'
  },
  columnWrapper: {
    // marginBottom: 15,
    gap:14,
  },
});

export default styles;
