import {StyleSheet} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
    paddingHorizontal: widthScale(32),
  },
  profilePicContainer: {
    marginTop: heightScale(27),
    gap: 4,
  },
  profileText: {
    fontSize: fontScale(12),
    color: '#191719',
    fontWeight: '500',
  },
  profileImageContainer: {
    height: heightScale(80),
    width: widthScale(80),
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E1E1',
  },
  profileImage: {
    resizeMode: 'contain',
    height: heightScale(80),
    width: widthScale(80),
    borderRadius: 58,
  },
  inputContainer: {
    gap: 4,
    borderRadius: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingHorizontal: widthScale(24),
    color: '#131313',
    height: heightScale(48),
    marginTop: 8,
  },
  countryCodeContainer: {
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(28),
    paddingHorizontal: widthScale(16),
    height: heightScale(52),
    marginRight: widthScale(4),
    top: heightScale(20),
  },
  countryCodeText: {
    fontSize: fontScale(16),
    color: '#161616',
  },
  buttonText: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: fontScale(16),
    color: '#333',
    marginBottom: heightScale(8),
  },
  dropdownButton: {
    height: heightScale(48),
    justifyContent: 'space-between',
    paddingHorizontal: widthScale(18),
    backgroundColor: '#F3F0F7',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: fontScale(16),
    color: '#191719',
    left: 10,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
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
});
export default styles;
