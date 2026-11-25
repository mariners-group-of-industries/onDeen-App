import {StyleSheet, Dimensions} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EDE9F1',
  },
  headerLabel:{
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    lineHeight: 24,
    color: '#B4A8BF',
    textAlign: 'center',
  },
  ticketTitle: {
    fontSize: fontScale(12),
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    color:'#17101F',
    lineHeight:15    
  },
  ticketIndex: {
    fontSize: fontScale(12),
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
    color:'#B8ADC4',
    lineHeight:15    
  },
  ticketType:{
    paddingTop:heightScale(12),
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
    color:'#161616',
    fontSize:fontScale(16),
    lineHeight:18
  },
  ticketAmount: {
    fontSize: fontScale(12),
    color: '#545454',
    fontFamily:fontFamilies.SFProRoundedBlackRegular,
    lineHeight:16
  },
});

export default styles;
