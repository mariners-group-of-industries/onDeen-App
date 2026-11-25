import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  heading: {
    color: '#000000',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: fontScale(24),
    // marginTop: heightScale(18),
    paddingLeft: widthScale(24),
  },
  // awardItem: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   padding: 10,
  //   backgroundColor: '#FCE5FF',
  //   borderRadius: 16,
  //   width: widthScale(92),
  // },
  awardImage: {
    width: widthScale(36),
    height: heightScale(36),
    resizeMode: 'contain',
  },
  textContainer: {
    flexDirection: 'column',
  },
  awardName: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#3E146F',
  },
  awardArchived: {
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#3E146F',
  },
  // awardsListContainer: {
  //   gap: 8,
  //   marginTop: heightScale(12),
  //   paddingRight: 12,
  // },
  progressBar: {
    height: 4,
    width: 54,
    borderRadius: 20,
    backgroundColor: '#F8D7FD',
    borderWidth:0,
    borderColor:''
  },
  awardsListContainer: {
    paddingHorizontal: widthScale(20),
    paddingVertical: heightScale(12),
  },
  rowStyle: {
    justifyContent: 'space-between', // Distributes badges evenly
    marginBottom: heightScale(12),   // Space between rows
  },
  awardItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: heightScale(10),
    backgroundColor: '#FCE5FF',
    borderRadius: 16,
    width: widthScale(106),  // Adjusted width to fit 3 per row
    height:heightScale(110),
    gap:8
  },
});

export default styles;
