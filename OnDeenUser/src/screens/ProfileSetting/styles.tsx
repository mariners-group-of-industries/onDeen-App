import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  editProfileContainer: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFDFDF',
    marginHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    height: 72,
  },
  editProfileCommonContainer: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFDFDF',
    marginHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
  },
  editprofileText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  deleteAccountContainer: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    marginHorizontal: 36,
  },
  deleteAccountText: {
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 16,
  },
  logoImage: {
    bottom: 0,
    left: 58,
    position: 'absolute',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    width: 360,
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
