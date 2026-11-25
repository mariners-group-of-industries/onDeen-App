import { Dimensions, StyleSheet } from 'react-native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom:20
  },
  subContainer: {
    paddingHorizontal: widthScale(21),
    paddingTop: 8,
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.24,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
    marginRight: 18,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16,
    right: widthScale(56),
  },
  dateLabel: {
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#0E0D0E',
    paddingLeft: 21,
    marginTop: 12,
  },
  notesContainer: {
    backgroundColor: '#FFEFBD',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },

  notesHeading: {
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16,
    color: '#000000',
  },
  notesTime: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 16,
    color: '#545454',
  },
  notesContent: {
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 16,
    color: '#3A3A3A',
  },
  modalContainer: {
    backgroundColor: '#FDFBFF',
    // flex: 1,
    marginHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 0,
    width: '100%',
    height: Dimensions.get('window').height * 0.9,
    paddingTop: heightScale(34),
  },
  backLabel: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
  },
  doneLabel: {
    color: '#DB3171',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  selectedHeading: {
    fontSize: fontScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    paddingHorizontal: widthScale(24),
    paddingTop: 14, // Add vertical padding
    paddingBottom: 14, 
    lineHeight: fontScale(24), // Same or slightly more than fontSize
    textAlignVertical: 'top', // Especially for Android
    marginBottom:0,
    paddingVertical:0,
  },
  inputTexts: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    paddingHorizontal: widthScale(24),
    paddingTop: 14, // Add vertical padding
    paddingBottom: 14, // Add vertical padding
    lineHeight: fontScale(24), // Same or slightly more than fontSize
    textAlignVertical: 'top', // Especially for Android
  },
  modalHeaderSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: widthScale(24),
    paddingLeft: widthScale(20),
    width: '100%'
  },
  deleteModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  deleteMessage: {
    fontSize: 18,
    color: '#131313',
    paddingHorizontal: 20,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: widthScale(50),
    borderRadius: 24,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: heightScale(12),
    paddingHorizontal: widthScale(24),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#000',
    fontSize: heightScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  deleteButton: {
    backgroundColor: '#e74c3c', // Red for delete action
    paddingVertical: heightScale(12),
    paddingHorizontal: widthScale(34),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: heightScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modalContent: {
    backgroundColor: '#FDFBFF',
    padding: widthScale(20),
    borderRadius: widthScale(12),
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  createNoteText: {
    color: '#131313',
    fontSize: 16,
    fontFamily: fontFamilies.allroundgothicSemiBold,
    lineHeight: 16,
  },
  createNoteButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  inputTextsTitle: {
    fontSize: fontScale(28),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    lineHeight: 24,
    color: '#B5B5B5',
    // bottom: 8,
    // right: 4,
  },
  sectionHeaderContainer: {
    // backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
  },
  sectionHeaderText: {
    fontSize: fontScale(12),
    color: '#0E0D0E',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 16,
  },
});

export default styles;
