import { StyleSheet } from 'react-native';
import { heightScale, fontScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  upcomingTitle: {
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 16,
    lineHeight: 16,
    color: '#161616'
  },
  sessionItem: {
    marginVertical: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E2F2',
  },

  rowContainer: {
    flexDirection: 'row',
  },

  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 5
  },

  sessionName: {
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 20,

  },

  sessionDate: {
    fontSize: 12,
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    marginTop: -5
  },

  meetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 10
  },

  meetLabel: {
    fontSize: 12,
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    // paddingTop:10
  },
  nomeetLabel: {
    fontSize: 10,
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },

  searchBarContainer: {
    marginTop: 14,
    marginHorizontal: 24,
  },
  searchBar: {
    paddingVertical: 0,
    height: 42,  // Add height explicitly
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0F7',
  },
  searchInput: {
    fontSize: 12,
    color: '#969696',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    paddingVertical: 8,
    height: 42,
  },
  searchResult: {
    fontSize: 16,
    color: '#969696',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120
  },
});

export default styles;
