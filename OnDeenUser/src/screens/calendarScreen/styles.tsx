import {Dimensions, StyleSheet} from 'react-native';
import {widthScale, heightScale, fontScale} from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FD',
  },
  gradient: {
    borderRadius: widthScale(8),
    marginVertical: heightScale(10),
    padding: heightScale(15),
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: widthScale(24),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(4),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    backgroundColor: '#F9F6FD',
  },
  eventTitle: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#000000',
  },
  eventDescription: {
    fontSize: fontScale(12),
    color: '#000000',
    fontWeight: '400',
  },
  eventDateHeader: {
    fontSize: fontScale(22),
    fontWeight: '700',
    color: '#000',
    paddingVertical: heightScale(10),
    textAlign: 'center',
  },
  noEventsText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.11,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
    marginRight: 18,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold,
    right: widthScale(56),
  },
  timelineContainer: {
    paddingLeft: widthScale(19),
    paddingRight: widthScale(24),
    flexDirection: 'row',
    gap: 15,
  },
  timeLabels: {
    color: '#000000',
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6FD'
  },
});

export default styles;
