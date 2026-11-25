import {Dimensions, PixelRatio, Platform,Alert} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import moment from 'moment';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const guidelineBaseWidth = 410;
const guidelineBaseHeight = 812;

// Function to scale based on width
export const widthScale = (size: number) => {
  const newSize = (SCREEN_WIDTH / guidelineBaseWidth) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Function to scale based on height (useful for vertical scaling)
export const heightScale = (size: number) => {
  const newSize = (SCREEN_HEIGHT / guidelineBaseHeight) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// For scaling fonts consistently
export const fontScale = (size: number, factor = 0.5) => {
  const newSize = size + (widthScale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const showToast = (text: string) => {
  Toast.show({
    text1: text,
    type: 'success',
    visibilityTime: 3000,
    autoHide: true,
    position: 'top',
    topOffset: Platform.OS === 'ios' ? 24 : 8,
  });
};

export const getTitleFromReview = (review: string) => {
  const firstSentence = review.split('. ')[0];
  return firstSentence.length > 40
    ? firstSentence.substring(0, 40) + '...'
    : firstSentence;
};

export const getColorByIndex = (index: number) => {
  const colors = ['#FFF1C8', '#F0F0F0', '#E9E1FF', '#D2F4EA'];
  return colors[index % colors.length];
};

               export   const formatTime = (utcTimeString: string): string => {
  if (!utcTimeString) return '';

  // Assuming the `utcTimeString` is like '01:00' or '13:30'
  const utcDateTime = moment.utc(utcTimeString, 'HH:mm'); // Treat it as UTC

  // Convert to local time
  const localTime = utcDateTime.local();

  // Format to 12-hour format with AM/PM
  return localTime.format('h:mm A');
};


export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result === RESULTS.GRANTED) return true;

      const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return requestResult === RESULTS.GRANTED;
    }

    // Android
    const fineResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    const coarseResult = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);

    if (fineResult === RESULTS.GRANTED) {
      return true;
    }

    if (coarseResult === RESULTS.GRANTED) {
      Alert.alert(
        'Approximate Location Enabled',
        'Only approximate location is allowed. For better accuracy, please enable precise location in settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => openSettings(),
          },
        ],
      );
      return true; // Let it continue with approximate location if acceptable
    }

    const fineRequest = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (fineRequest === RESULTS.GRANTED) return true;

    const coarseRequest = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
    if (coarseRequest === RESULTS.GRANTED) {
      Alert.alert(
        'Approximate Location Enabled',
        'Only approximate location is allowed. For better accuracy, please enable precise location in settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => openSettings(),
          },
        ],
      );
      return true;
    }


    return false;
  } catch (err) {

    return false;
  }
};
