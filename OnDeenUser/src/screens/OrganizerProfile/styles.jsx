import { Dimensions, StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselSecondaryItem: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    left: 24,
  },
  carouselImage: {
    width: '100%',
    height: 298,
  },
  carouselSecondaryImage: {
    width: '100%',
    height: 170,
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageBorderRadius: {
    borderRadius: 24,
  },
  touchableLabelSecondaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingRight: 8,
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
    alignItems: 'center',
    marginVertical: 8,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#17101F',
  },
  dateIconContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  carouselDate: {
    fontSize: 12,
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
    fontSize: 10,
    // bottom: 2,
  },
  customLableCarouselSecondaryContainer: {
    backgroundColor: '#F9E5AA',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    // height: 20,
    left: 10,
  },
  priceContainerFree: {
    backgroundColor: '#C8F9AA',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    height: 20,
    left: 10,
  },
  carouselFourthContainer: {
    marginTop: 16,
    // paddingHorizontal: 24,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    right: 52,
  },
  nearbyText: {
    marginTop: 18,
    fontSize: 16,
    color: '#0E0D0E',
    marginLeft: 23,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 20,
  },
  profilePicContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: Dimensions.get('window').width * 0.28,
    width: Dimensions.get('window').width * 0.28,
    borderRadius: 90,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  speakerName: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 20,
    marginTop: 12,
  },
  contactSection: {
    marginTop: 24,
    paddingHorizontal: 22,
  },
  contactCard: {
    backgroundColor: '#F9F6FD',
    borderColor: '#E7DFEE',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 66,
    paddingVertical: 10,
  },
  contactIcon: {
    alignItems: 'center',
    backgroundColor: '#EFE7F8',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  contactCopy: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    color: '#6A6272',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  contactValue: {
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 2,
  },
  contactDivider: {
    backgroundColor: '#E2DAE9',
    height: 1,
    marginLeft: 48,
  },
  speakerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3A3A3A',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  paidEventContainer: {
    backgroundColor: '#F6EDFF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  customLableCarousel: {
    color: '#000000',
    fontWeight: '400',
    fontSize: 12,
  },
  requestContainer: {
    backgroundColor: '#3E146F',
    height: 48,
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 90,
    width: Dimensions.get('window').width * 0.78,
  },
  requestLabel: {
    color: '#FDFBFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aboutEventConatiner: {
    // marginTop: 16,
    // paddingHorizontal: 21,
  },
  aboutTitle: {
    color: '#0E0D0E',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 16,
    lineHeight: 20,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  themeChip: {
    backgroundColor: '#F0E6F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  themeChipText: {
    color: '#422199',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
  },
  readMoreText: {
    color: '#DF416B',
    fontSize: 12,
    fontWeight: '400',
    paddingTop: 4,
  },
  organizedText: {
    fontSize: 12,
    color: '#545454',
    fontWeight: '500',
    lineHeight: 16,
  },
  reviewsLabel: {
    paddingTop: 24,
    fontSize: 14,
    color: '#0E0D0E',
    paddingLeft: 21,
    fontFamily: fontFamilies.allroundgothicSemiBold
  },
  ratingContainer: {
    marginTop: 12,
    marginHorizontal: 21,
    paddingVertical: 12,
    backgroundColor: '#F7EEFF',
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24
  },
  organizationName: {
    fontSize: 14,
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold

  },
  reviewLabel: {
    fontSize: 12,
    color: '#3A3A3A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular

  },
  viewallLabel: {
    fontSize: 10,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold

  },
  viewallContainer: {
    width: 120,
    paddingVertical: 8,
    backgroundColor: '#F7EEFF',
  },

  gradientBorder: {
    borderRadius: 90,
    padding: 1.3,
    // flex: 1,
  },
  reviewsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 21,
    flexDirection: 'row',
    gap: 12,
  },
  separatorLine: {
    width: Dimensions.get('window').width * 0.89,
    backgroundColor: '#E6E6E6',
    height: 1,
    justifyContent: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingHeading: {
    color: '#17101F',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16
  },
  ratingPerson: {
    color: '#17101F',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16

  },
  ratingContent: {
    color: '#3A3A3A',
    fontSize: 12,
    paddingRight: 80,
  },
  initialLabel: {
    color: '#000000',
    fontSize: 20,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 22
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6FD'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
