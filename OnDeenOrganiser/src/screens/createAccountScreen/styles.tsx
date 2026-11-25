import {Dimensions, StyleSheet} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import {fontColor, fontFamilies} from '../../assets/themes/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  formikContainer: {
    marginBottom: 10,
    marginHorizontal: 32,
    paddingTop:20,
  },
  tabcontainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom:20,
  },
  tabview: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '31%',
  },
  tablabel: {
    color: '#BBB6C8',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
  activetablabel: {
    color: 'rgba(219,49,113,1)',
    fontSize: 12,
    fontWeight: '600',
  },
  line: {
    width: '100%',
    height: 4,
    backgroundColor: fontColor.GRAISHVIOLET,
    marginBottom: 5,
    borderRadius: 50,
  },
  activeline: {
    backgroundColor: 'rgba(219,49,113,1)',
  },
  title: {
    fontWeight: '500',
    fontSize: fontScale(14),
    color: '#161616',
    marginHorizontal: 20,
  },
});

export default styles;
