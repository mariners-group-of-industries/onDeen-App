import { Dimensions, StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  subContainer: {
    paddingHorizontal: 21,
    paddingTop: 8,
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.11,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
    marginRight: 18,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    right: 56,
  },
  headingLabel: {
    color: '#0E0D0E',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: fontFamilies.allroundgothicSemiBold,
  },
  bookingLabel: {
    color: '#0E0D0E',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  bookingTitle: {
    color: '#17101F',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  dateSubContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  carouselDate: {
    fontSize: 12,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  eventNameContainer: {
    flexDirection: 'row',
    left: 50
  },
  eventName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#161616',
  },
  dotLeft: {
    height: 12,
    width: 12,
    backgroundColor: '#F9F6FD',
    borderRadius: 18,
    top: 14,
    left: 7,
    zIndex: 1,
  },
  dotRight: {
    height: 12,
    width: 12,
    backgroundColor: '#F9F6FD',
    borderRadius: 18,
    top: 14,
    right: 8,
    zIndex: 1,
  },
  priceContainer: {
    backgroundColor: '#F9E5AA',
    borderRadius: 4,
  },
  priceContainerFree: {
    backgroundColor: '#C8F9AA',
    borderRadius: 4,
  },
  priceLabel: {
    borderWidth: 1,
    borderColor: '#494844',
    borderRadius: 4,
    borderStyle: 'dashed',
    textAlign: 'center'
  },
  paymentTitle: {
    color: '#0E0D0E',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketsContainer: {
    marginTop: 27,
    marginHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C2C2C2',
    paddingBottom: 24,
  },
  dateContainer: {
    marginTop: 27,
    marginHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectTicket: {
    fontSize: 12,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 16,
    color: '#0E0D0E',
  },
  ticketLabel: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    // lineHeight: 22,
    color: '#000000',
  },
  counterButton: {
    minWidth: 110,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAF3',
    paddingHorizontal: 8,
    marginTop: -20,
  },
  counterButtonAdd: {
    minWidth: 110,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#422199',
    padding: 8,
    // paddingVertical: 8,
    // paddingHorizontal: 12,
    marginTop: -20,
  },
  ticketCount: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#17101F',
    bottom: 2,
    lineHeight: 18
  },
  dateSlotContainer: {},
  dateItem: {
    // paddingVertical: 12,
    // paddingHorizontal: 16,
    // borderRadius: 8,
    // borderWidth: 1,
    // borderColor: "#ccc",
    // marginRight: 10,
    // alignItems: "center",
    // height:54,
    // width:54,
    borderRadius: 8,
    padding: 20,
    paddingVertical: 10,
    backgroundColor: '#EFEAF3',
    marginRight: 8,
    alignItems: 'center'
  },
  selectedDateItem: {
    backgroundColor: '#422199',
  },
  disabledDateItem: {
    backgroundColor: '#E0E0E0', // Greyed-out background for disabled items
  },
  disabledText: {
    color: '#A0A0A0', // Light grey text for disabled items
  },
  dayText: {
    fontSize: 10,
    color: '#06332C',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#06332C',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 20,
    textAlign: 'center'
  },
  paymentMethodMainContainer: {
    marginTop: 27,
    paddingLeft: 24,
    paddingRight: 20,
  },
  paymentMethodContainer: {
    backgroundColor: '#F9F6FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D5D5D5',
  },
  paymentHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor:'green'

  },
  paymentMethodTitle: {
    fontSize: 18,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 20,
    color: '#161616',
    paddingHorizontal: 36
  },
  paymentIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DB3171',
    // marginBottom: 12,
    justifyContent: 'space-around',
    backgroundColor:'red'
  },
  cardLogo: {
    width: 35,
    height: 21,
    // marginRight: 12,
    resizeMode: 'contain',
    alignSelf:'flex-start',
    backgroundColor:'yellow'
  },
  cardDetails: {
    flex: 1,
  },
  cardInfo: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 12,
    color: '#000',
  },
  addCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  addCardText: {
    fontSize: 16,
    color: '#DB3171',
    fontWeight: '500',
  },
  selectedMethod: {
    backgroundColor: '#f0f8ff', // Light blue background to show selection
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  radioButtonContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },

  priceLastText: {
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#545454',
  },
  priceText: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#000000',
  },
  fewSeatsLabel: { backgroundColor: '#DB31711A', borderRadius: 8 },
  lightningImage: {
    height: 12,
    width: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  gradientTextContainer: {
    margin: 16
  },
  gradient: {
    flex: 1,
  },

  errorText: {
    color: 'red',
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6FD',
  },
  multiTicketHeading: {
    fontFamily: fontFamilies.allroundgothicSemiBold,
    fontSize: 16,
    lineHeight: 16,
    color: '#0E0D0E',
  },
  multiTicketContainer: {
    paddingHorizontal: 24,
    marginTop: 22,
    gap: 8,
  },
  multiTicketItemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FEFDFF',
    justifyContent: 'space-between',
    // alignItems:'center',
    borderRadius: 16,
    // height: 110,
    marginTop: 12,
  },
  multiTicketItemHeading: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    // lineHeight: 18,
  },
  multiTicketDescription: {
    color: '#545454',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    // paddingTop: 4
  },
  multiTicketPrice: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 18,
    // lineHeight: 21,
    color: '#17101F',
    marginTop: -10,
  },
  multiTicketCounter: {
    backgroundColor: '#FEFDFF',
    borderRadius: 8,
    padding: 8,
    gap: 16,
    borderWidth: 1,
    borderColor: '#422199',
    flexDirection: 'row',
    height: 36,
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottombook: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8, // for Android
    zIndex: 1000,
  },
  lastContainer: {
    // backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderTopLeftRadius: 0, // Optional: to visually remove radius if needed
    borderTopRightRadius: 0, // Optional

  },
  bookBtnContainer: {
    borderRadius: 90,
    minHeight: 52,
    marginVertical: 0,
    marginHorizontal: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  gradientButtonContainer: {
    paddingHorizontal: 20,
  },
  gradientText: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 17,
    color: '#FFFFFF',
  },
});

export default styles;
