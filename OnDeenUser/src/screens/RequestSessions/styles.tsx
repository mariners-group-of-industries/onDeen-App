import {Dimensions, StyleSheet} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  dateContainer: {
    marginHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    paddingBottom: heightScale(16),
  },
  selectTicket: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 20,
    color: '#161616',
    paddingLeft: 24,
    marginTop: heightScale(27),
    paddingBottom: 6,
  },
  dateItem: {
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    backgroundColor: '#EFEAF3',
    marginRight: 8,
    alignItems:'center'
  },
  selectedDateItem: {
    backgroundColor: '#9977F2',
  },
  disabledDateItem: {
    backgroundColor: '#E0E0E0', // Greyed-out background for disabled items
  },
  disabledText: {
    color: '#A0A0A0', // Light grey text for disabled items
  },
  dayText: {
    fontSize: fontScale(10),
    color: '#06332C',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 12,
  },
  dateText: {
    fontSize: fontScale(16),
    color: '#06332C',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 19,
    textAlign:'center'
  },
  slotHeading: {
    fontSize: fontScale(14),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 20,
    paddingLeft: 24,
    marginTop: heightScale(16),
  },
  slotHeader: {
    fontSize: fontScale(10),
    color: '#545454',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 12,
    paddingTop: heightScale(12),
  },
  slotSection: {
    paddingHorizontal: 24,
  },
  commentContainer: {
    paddingHorizontal: widthScale(12),
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    height: heightScale(98),
    paddingVertical: heightScale(12),
  },
  applyButton: {
    borderRadius: 90,
    marginRight: widthScale(24),
    marginLeft: widthScale(24),
    // height: heightScale(52),
    width: widthScale(344),
    paddingVertical: heightScale(3),
    alignSelf:'center'
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    lineHeight:16
  },
  noSlotContainer: {
  alignItems: 'center',
  marginTop: 20,
},
noSlotText: {
  fontSize: fontScale(16),
  color: '#888',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,

},

});

export default styles;
