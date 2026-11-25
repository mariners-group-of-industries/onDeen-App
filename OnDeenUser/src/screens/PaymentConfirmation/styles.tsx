import { StyleSheet } from 'react-native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingRight: widthScale(220),
  },
  greetings: {
    color: '#000000',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.allroundgothicRegular,
    lineHeight: 22
  },
  greetingsMessage: {
    color: '#000000',
    fontSize: fontScale(28),
    fontFamily: fontFamilies.allroundgothicSemiBold,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: heightScale(16),
  },
  buttonsSubContainer: {
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: widthScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewallLabel: {
    fontSize: fontScale(12),
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight: 14
  },
  viewallContainer: {
    height: heightScale(48),
    width: widthScale(230),
    borderRadius: 90,
    paddingVertical: heightScale(4),
    paddingHorizontal: widthScale(24),
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  gradientBorder: {
    borderRadius: widthScale(90),
    width: widthScale(232),
    padding: widthScale(1),
  },
  bookBtnContainer: {
    height: heightScale(48),
    width: widthScale(170),
  },
  homeBtnContainer: {
    height: heightScale(48),
    width: widthScale(130),
  },
  modalHeaderSubContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: widthScale(24),
    paddingLeft: widthScale(20),
  },
  ticketNumberLabel: {
    color: '#161616',
    fontSize: fontScale(12),
    fontWeight: '400',
    textAlign: 'center',
  },
  ticketHeading: {
    color: '#161616',
    fontSize: fontScale(20),
    fontWeight: '500',
    textAlign: 'center',
  },
  eventDateContainer: { justifyContent: 'center', alignItems: 'center' },
  eventDateTime: {
    color: '#161616',
    fontSize: fontScale(12),
    fontWeight: '400',
  },
  tickeTimeLabel: {
    color: '#161616',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  venueLabel: {
    color: '#161616',
    fontWeight: '400',
    fontSize: fontScale(12),
  },
  venueAddressLabel: {
    color: '#161616',
    fontWeight: '400',
    fontSize: fontScale(16),
    textAlign: 'center'
  },
  amountLabel: {
    color: '#000000',
    fontWeight: '500',
    fontSize: fontScale(12),
  },
  subContainer: {
    paddingHorizontal: widthScale(21),
    paddingTop: 8,
  },
  notesContainer: {
    backgroundColor: '#FFEFBD',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },

  notesHeading: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#000000',
  },
  notesTime: {
    fontSize: fontScale(10),
    fontWeight: '400',
    color: '#545454',
  },
  notesContent: {
    fontSize: fontScale(12),
    fontWeight: '400',
    color: '#3A3A3A',
  },
  modalContainer: {
    backgroundColor: '#FDFBFF',
    flex: 1,
    marginHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 0,
    width: '100%',
    paddingTop: heightScale(40),
  },
  dateSubContainer: {
    flexDirection: 'row',
    gap: widthScale(4),
    alignItems: 'center',
  },
  ticketLabel: { fontSize: fontScale(12), fontWeight: '700', color: '#FFFFFF' },
  containerTicket: {
    backgroundColor: 'red',
    // padding: widthScale(16),
    borderRadius: 16,
  },
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEFDFF',
    borderRadius: 16,
    padding: widthScale(20),
    marginBottom: heightScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketInfo: {
    // flex: 1,
  },
  ticketId: {
    fontSize: fontScale(14),
    color: '#333',
    fontWeight: '500',
  },
  ticketTitle: {
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#17101F',
    lineHeight: 15
  },
  ticketType: {
    paddingTop: heightScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#161616',
    fontSize: fontScale(16),
    lineHeight: 18
  },
  ticketAmount: {
    fontSize: fontScale(12),
    color: '#545454',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16
  },
  qrCode: {
    width: widthScale(84),
    height: widthScale(84),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: heightScale(10),
  },
  ticketCount: {
    fontSize: fontScale(14),
    color: '#333',
  },
  viewAll: {
    fontSize: fontScale(14),
    color: '#D23F57',
    fontWeight: 'bold',
  },
});

export default styles;
