import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toggleMainContainer: {
    paddingVertical: heightScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  heading: {
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: fontScale(24),
    marginTop: heightScale(18),
    paddingLeft: widthScale(36),
  },
  editProfileContainer: {
    gap: widthScale(12),
    borderBottomWidth: heightScale(1),
    borderBottomColor: '#DFDFDF',
    marginHorizontal: widthScale(36),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightScale(12),
    paddingVertical: heightScale(24),
  },
  editProfileCommonContainer: {
    gap: widthScale(12),
    borderBottomWidth: heightScale(1),
    borderBottomColor: '#DFDFDF',
    marginHorizontal: widthScale(36),
    paddingVertical: heightScale(24),
  },
  editprofileText: {
    color: '#000000',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
  logoImage: {
    marginTop: heightScale(22),
    marginHorizontal: widthScale(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 24,
  },
  modalBodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    paddingHorizontal: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    lineHeight: 16,
  },
  toggleContainer: {
    width: widthScale(45),
    height: heightScale(24),
    borderRadius: widthScale(24),
    backgroundColor: '#D9D3E0',
    padding: widthScale(3),
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#DB3171',
  },
  toggleCircle: {
    width: heightScale(21),
    height: heightScale(21),
    borderRadius: heightScale(18),
    backgroundColor: '#FFF',
    position: 'absolute',
    left: widthScale(2),
  },
  modalTitle: {
    fontSize: fontScale(20),
    lineHeight: 22,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
  },
  circleActive: {
    left: widthScale(20),
  },
  gradientContainer: {
    marginTop: 24,
  },
  applyButton: {
    borderRadius: 90,
    paddingHorizontal: widthScale(24),
    paddingVertical: heightScale(0),
    height: heightScale(52),
    marginBottom: 42,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    bottom: 2,
  },
});

export default styles;
