import {StyleSheet} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    paddingHorizontal: 32,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    right:20
  },
  profilePicContainer: {
    marginTop: 27,
    gap: 4,
  },
  profileText: {
    fontSize: 12,
    color: '#191719',
    fontWeight: '500',
  },
  profileImageContainer: {
    height: 78,
    width: 78,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E1E1',
  },
  profileImage: {
    height: 78,
    width: 78,
    borderRadius: 52,
    // overflow:'hidden'
  },
  inputContainer: {
    gap: 4,
    borderRadius: 24,
  },
  titleStyle: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: 28,
    // paddingHorizontal: 24,
    color: '#131313',
    height: 48,
    marginTop: 32,
    // minWidth:190
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingVertical: 0,
  },
  countryCodeContainer: {
    backgroundColor: '#F3F0F7',
    borderRadius: 28,
    color: '#161616',
    height: 48,
    marginTop: 8,
    // minWidth:140,
    paddingRight: 0,
    // paddingLeft:0,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingVertical: 0,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#161616',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  dropdownButton: {
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: '#F3F0F7',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#191719',
    left: 10,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#F3F0F7',
    borderRadius: 24,
    marginTop: 5,
    backgroundColor: '#F3F0F7',
  },
  dropdown: {
    backgroundColor: '#F3F0F7',
    borderRadius: 24,
    height: 48,
    borderWidth: 0,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  genderOption: {
    paddingVertical: 10,
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});
export default styles;
