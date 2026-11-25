import {Dimensions, StyleSheet} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies, fontSizes} from '../../assets/fonts/fonts';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  carouselSecondaryItem: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: heightScale(298),
  },
  carouselSecondaryImage: {
    width: '100%',
    height: heightScale(170),
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageBorderRadius: {
    borderRadius: 24,
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: heightScale(16),
    paddingRight: widthScale(8),
  },
  heartIconSecondary: {
    width: widthScale(36),
    height: heightScale(36),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    bottom: heightScale(6),
    backgroundColor: '#00000066',
  },
  carouselsubSecondaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: heightScale(8),
  },
  carouselTitle: {
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#17101F',
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  carouselDate: {
    fontSize: fontScale(12),
    color: '#161616',
    fontWeight: '500',
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
    fontSize: fontScale(10),
    bottom: heightScale(2),
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#C8F9AA',
    borderRadius: 4,
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
    height: heightScale(20),
    left: 10,
  },
  containerImageEdit: {
    height: heightScale(24),
    width: widthScale(24),
    left:96
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(24),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight:28
  },
  headerLeftContainer: {
    // paddingLeft: 10, // Adds space from the left edge
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightContainer: {
    // paddingRight: 10, // Adds space from the right edge
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyText: {
    marginTop: heightScale(20),
    fontWeight: '600',
    fontSize: fontScale(20),
    color: '#0E0D0E',
    marginLeft: widthScale(23),
  },
  profilePicContainer: {
    paddingTop: heightScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE187',
    paddingBottom: heightScale(38),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileImage: {
    height: 82,
    width: 82,
    borderRadius: 1000,
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(12),
    resizeMode: 'cover',
  },
  speakerName: {
    fontSize: fontScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#000000',
  },
  noDataText: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#000000',
  },
  addressContainer: {flexDirection: 'row', alignItems: 'center', gap: 4},
  speakerTitle: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#8D5664',
    lineHeight: 14,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: heightScale(32),
  },
  levelSubContainer: {
    backgroundColor: '#EBE2FF',
    borderRadius: 16,
    gap: heightScale(20),
    padding: 16,
    width: widthScale(120),
  },
  journeyLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  journeyLevelHeading: {
    color: '#3E146F',
    fontFamily: fontFamilies.SFProRoundedBlackLight,
    lineHeight: 14,
    fontSize: fontScale(12),
  },
  journeyLevelLabel: {
    color: '#3E146F',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  badgesContainer: {
    marginTop: heightScale(32),
    paddingLeft: widthScale(24),
  },
  badgeAwardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: widthScale(24),
  },
  badgeEventsHeading: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    color: '#0E0D0E',
    lineHeight: 18,
  },
  allLabel: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#DB3171',
    lineHeight: 18,
  },
  awardItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#FCE5FF',
    borderRadius: 16,
    width: widthScale(92),
  },
  awardImage: {
    width: widthScale(36),
    height: heightScale(36),
    resizeMode: 'contain',
  },
  textContainer: {
    flexDirection: 'column',
  },
  awardName: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#3E146F',
  },
  awardArchived: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#3E146F',
  },
  awardsListContainer: {
    gap: 8,
    marginTop: heightScale(12),
    paddingRight: 12,
  },
  progressBar: {
    height: 4,
    width: 54,
    borderRadius: 20,
    backgroundColor: '#F8D7FD',
    borderWidth:0,
  },
  reviewsLabel: {
    paddingTop: heightScale(24),
    fontSize: fontScale(14),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    color: '#0E0D0E',
    paddingLeft: widthScale(21),
  },
  ratingContainer: {
    marginTop: heightScale(12),
    marginHorizontal: widthScale(21),
    paddingVertical: heightScale(12),
    backgroundColor: '#F7EEFF',
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  organizationName: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#17101F',
    lineHeight: 20,
  },
  viewallLabel: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 15,
  },
  viewallContainer: {
    minWidth: widthScale(93),
    maxHeight: heightScale(30),
    paddingHorizontal: widthScale(16),
    paddingVertical: heightScale(8),
    backgroundColor: '#F7EEFF',
  },

  gradientBorder: {
    borderRadius: widthScale(90),
    padding: widthScale(1.3),
    // flex: 1,
  },
  reviewsContainer: {
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(21),
    flexDirection: 'row',
    gap: widthScale(12),
    marginTop:heightScale(12)
  },
  separatorLine: {
    width: Dimensions.get('window').width * 0.89,
    backgroundColor: '#E6E6E6',
    height: heightScale(1),
    justifyContent: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingHeading: {
    color: '#17101F',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight:16
  },
  ratingLabel: {
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 22,
    color: '#000000',
  },
  ratingPerson: {
    color: '#17101F',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight:16
  },
  ratingContent: {
    color: '#3A3A3A',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight:16,
    paddingRight: 80,
  },
  initialLabel: {
    color: '#000000',
    fontSize: fontScale(20),
    fontFamily:fontFamilies.allroundgothicSemiBold,
    lineHeight:22
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
  logoutButton: {
    backgroundColor: '#FF416C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal Container Styles
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    width: widthScale(360),
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingBottom: 20,
    // paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
    fontFamily:fontFamilies.allroundgothicSemiBold,
    lineHeight:24
  },
  modalBodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    paddingHorizontal: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily:fontFamilies.SFProRoundedBlackRegular
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
    fontFamily:fontFamilies.SFProRoundedBlackMedium,
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
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
  },
});

export default styles;
