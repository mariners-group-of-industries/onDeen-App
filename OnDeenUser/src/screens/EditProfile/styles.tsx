import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 24,
    marginTop: 28,
    paddingLeft: 36,
  },
  editProfileContainer: {
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFDFDF',
    marginHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 24,
  },
  editProfileCommonContainer: {
    marginHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    paddingTop: 12,
    paddingVertical: 0,
  },
  editprofileText: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingVertical: 6, // 🛠️ reduce vertical padding
    color: '#454545',
    paddingLeft: 0,
    lineHeight: 20
  },
  profilePicContainer: {
    marginTop: 24,
    gap: 12,
    marginHorizontal: 32,
  },
  profileText: {
    fontSize: 12,
    color: '#191719',
    fontWeight: '500',
  },
  profileImageContainer: {
    height: 78,
    width: 78,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E1E1',
    overflow: 'hidden',
  },
  profileImage: {
    height: 78,
    width: 78,
    borderRadius: 90,
  },
  contentText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 22, // 🛠️ Better line height for visual clarity
  },

  logoImage: {
    marginTop: 22,
    marginHorizontal: 58,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOffset: { width: 0, height: 2 },
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
    lineHeight: 24
  },
  modalBodyText: {
    fontSize: 16,
    color: '#3A3A3A',
    paddingHorizontal: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: fontFamilies.SFProRoundedBlackRegular
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
  inputContainer: {
    width: '85%',
    marginTop: 28,
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: 28,
    paddingHorizontal: 18,
    color: '#131313',
    height: 54, // <-- match the fixed height
    fontFamily: fontFamilies.SFProRoundedBlackRegular, // ensure font match too
  },
});

export default styles;
