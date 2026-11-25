import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import InfoIcon from '../../src/assets/svg/info-circle.svg';
import CloseIcon from '../../src/assets/svg/close.svg';
import Modal from 'react-native-modal';
import { fontFamilies } from '../../assets/fonts/fonts';
import { checkInforEvent } from '../redux/callapis/CommonService';
import { useToastForPopup } from '../context/ToastContext';
import SwipeButton from './SwipeButton';
import SwiperIcon from '../../src/assets/svg/swiper.svg';
import { useNavigation } from '@react-navigation/native';

// Import Geolocation properly
import Geolocation from '@react-native-community/geolocation';

const { height } = Dimensions.get('window');

const AnimatedSwipe = ({
  eventDetail,
  hitapitogetdatafilter
}) => {
  const navigation = useNavigation();
  const [isSwiped, setIsSwiped] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const timerRef = useRef(null);
  const [canSwipe, setCanSwipe] = useState(false);
  const [locationRetryCount, setLocationRetryCount] = useState(0);

  const showToast = useToastForPopup();

  useEffect(() => {
    if (!eventDetail) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsSwiped(false);

    if (eventDetail.swipe_flag === 1) {
      setCanSwipe(true);
      setDisplayText('');
      return;
    }

    if (eventDetail.swipe_timer > 0) {
      setCanSwipe(false);
      let remainingSeconds = eventDetail.swipe_timer;

      const updateTimer = () => {
        if (remainingSeconds >= 3600) {
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;
          setDisplayText(`Swipe in ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          setDisplayText(`Swipe in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }

        if (remainingSeconds <= 0) {
          clearInterval(timerRef.current);
          setCanSwipe(true);
          setDisplayText(eventDetail.swipe_text || '');
        } else {
          remainingSeconds--;
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return;
    }

    setCanSwipe(false);
    setDisplayText(eventDetail.swipe_text || '');

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [eventDetail]);

  // Debug location services
  const debugLocationServices = async () => {
    console.log('=== LOCATION DEBUG INFO ===');
    console.log('Platform:', Platform.OS);
    console.log('Location retry count:', locationRetryCount);

    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log('Location permission granted:', hasPermission);
      } catch (error) {
        console.log('Permission check error:', error);
      }
    }

    console.log('Geolocation available:', typeof Geolocation.getCurrentPosition === 'function');
  };

  // Enhanced location permission function
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check if we already have permission
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) {
          console.log('Location permission already granted');
          return true;
        }

        // Request permission with improved messaging
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs to access your location to check-in for the event. Please allow location permission from app setting and enable location services to continue.',            // buttonNeutral: 'Ask Me Later',
            // buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        console.log('Location permission result:', granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          // Show additional guidance if permission was denied
          if (granted === PermissionsAndroid.RESULTS.DENIED) {
            Alert.alert(
              'Location Permission Required',
              'To check-in for this event, you need to enable location permissions. Please go to App Settings → Permissions → Location and allow location access.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings()
                }
              ]
            );
          }
          return false;
        }
      } else {
        // For iOS, permissions are handled differently
        return true;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  // Improved location fetching
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      console.log('Starting location fetch...');

      // Set a timeout for the entire location process
      const overallTimeout = setTimeout(() => {
        reject(new Error('Location request timed out. Please try again.'));
      }, 35000);

      Geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(overallTimeout);
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Location fetched successfully:', {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });

          // Check if coordinates are valid (not 0,0)
          if (latitude === 0 && longitude === 0) {
            reject(new Error('Invalid location received (0,0)'));
            return;
          }

          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          clearTimeout(overallTimeout);
          console.log('Location error code:', error.code, 'Message:', error.message);

          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Location permission denied. Please enable location permissions in app settings.';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Location information unavailable. Please check your location services and try again.';
              break;
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out. Please ensure location is enabled and try again.';
              break;
            default:
              errorMessage = `Location error: ${error.message}`;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000
        }
      );
    });
  };

  // Get last known location as fallback
  const getLastKnownLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getLastKnownPosition(
        (position) => {
          if (position && position.coords) {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('Last known location found:', { latitude, longitude, accuracy });

            // Validate coordinates
            if (latitude === 0 && longitude === 0) {
              reject(new Error('Invalid last known location (0,0)'));
              return;
            }

            resolve({ latitude, longitude, accuracy });
          } else {
            reject(new Error('No valid last known position'));
          }
        },
        (error) => {
          console.log('No last known location:', error);
          reject(new Error('No last known location available'));
        },
        {
          maximumAge: 300000, // 5 minutes
          timeout: 10000
        }
      );
    });
  };

  // Check if location services are enabled
  const checkLocationServices = async () => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 }
      );
    });
  };

  const handleSwipeSuccess = () => {
    setIsSwiped(true);
    handleSwipeComplete();
  };

  const handleSwipeComplete = async () => {
    try {
      console.log('=== STARTING LOCATION PROCESS ===');

      // Run debug info
      await debugLocationServices();

      // Check and request location permission
      const hasPermission = await requestLocationPermission();
      console.log('Final permission status:', hasPermission);

      if (!hasPermission) {
        showToast('Location permission is required for check-in');
        setIsSwiped(false);
        return;
      }

      // Check if location services are enabled
      const locationEnabled = await checkLocationServices();
      console.log('Location services enabled:', locationEnabled);

      if (!locationEnabled) {
        showToast('Please enable location services and try again');
        setIsSwiped(false);
        return;
      }

      // Get current location with fallbacks
      let currentLatitude, currentLongitude;
      let locationSource = 'current';

      try {
        // Try to get precise location first
        console.log('Attempting to get precise location...');
        const location = await getCurrentLocation();
        currentLatitude = location.latitude;
        currentLongitude = location.longitude;
        locationSource = 'current';
        console.log('Using precise location:', { currentLatitude, currentLongitude });
      } catch (locationError) {
        console.log('Precise location failed, trying last known location:', locationError);

        try {
          // Try last known location as fallback
          console.log('Attempting to get last known location...');
          const lastLocation = await getLastKnownLocation();
          currentLatitude = lastLocation.latitude;
          currentLongitude = lastLocation.longitude;
          locationSource = 'last_known';
          console.log('Using last known location:', { currentLatitude, currentLongitude });
          showToast('Using last known location for check-in');
        } catch (lastLocationError) {
          console.log('Last known location also failed:', lastLocationError);

          // Final fallback - use device location or show manual option
          if (eventDetail?.latitude && eventDetail?.longitude) {
            // Use event location as last resort
            currentLatitude = eventDetail.latitude;
            currentLongitude = eventDetail.longitude;
            locationSource = 'event';
            console.log('Using event location as fallback:', { currentLatitude, currentLongitude });
            showToast('Using event location for check-in. Please ensure you are at the venue.');
          } else {
            showToast('Unable to get your location. Please ensure location services are enabled and try again.');
            setIsSwiped(false);
            return;
          }
        }
      }

      // Validate final coordinates
      if (!currentLatitude || !currentLongitude || (currentLatitude === 0 && currentLongitude === 0)) {
        showToast('Invalid location received. Please try again.');
        setIsSwiped(false);
        return;
      }

      const participantId = eventDetail?.participants?.[0]?.participant_id;

      const data = {
        event_id: eventDetail?.id,
        ticket_id: participantId,
        latitude: currentLatitude,
        longitude: currentLongitude,
        location_source: locationSource
      };

      console.log('Sending check-in data:', data);
      const resultAction = await checkInforEvent({ data });
      hitapitogetdatafilter();

      if (resultAction?.status) {
        showToast(resultAction?.response?.message || 'Check-in successful');
        setLocationRetryCount(0); // Reset retry count on success
        if (resultAction?.response?.gamification_summary) {
          navigation.navigate('GamificationSummary', {
            summary: resultAction.response.gamification_summary,
          });
        }
      } else {
        showToast(resultAction?.response?.message || resultAction?.message || 'Check-in failed');
        setIsSwiped(false);
        setLocationRetryCount(prev => prev + 1);
      }
    } catch (err) {
      console.log('Check-in error:', err);
      showToast(err.message || 'An error occurred during check-in');
      setIsSwiped(false);
      setLocationRetryCount(prev => prev + 1);
    }
  };

  // Add manual retry function
  const retryLocation = () => {
    setLocationRetryCount(prev => prev + 1);
    handleSwipeComplete();
  };

  return (
    <>
      <View style={[styles.container, (!canSwipe || isSwiped) && styles.disabledContainer]}>
        {canSwipe ? (
          <SwipeButton
            onSwipeSuccess={handleSwipeSuccess}
            disabled={isSwiped}
          />
        ) : (
          <>
            <View style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginRight: widthScale(10), width: '15%' }}>
                <SwiperIcon />
              </View>
              <View style={[styles.textContainer, { flex: 1, alignItems: 'center' }]}>
                <Text style={styles.timerText}>{displayText}</Text>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.infoIconWrapper}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <InfoIcon height={22} width={22} />
        </TouchableOpacity>
      </View>

      {/* Add retry button for debugging */}
      {__DEV__ && locationRetryCount > 0 && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryLocation}
        >
          <Text style={styles.retryText}>Retry Location ({locationRetryCount})</Text>
        </TouchableOpacity>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Check-in Rules</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <CloseIcon stroke="#131313" height={24} width={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              {eventDetail?.swipe_text_info}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setIsModalVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: widthScale(10),
    backgroundColor: '#E8E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 90,
    paddingVertical: heightScale(4),
    borderColor: '#D8D0E3',
    overflow: 'hidden',
    paddingHorizontal: 4,
    marginHorizontal: 24,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  textContainer: {
    flex: 1,
  },
  timerText: {
    color: '#131313',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    textAlign: 'left',
  },
  infoIconWrapper: {
    marginLeft: 'auto',
    marginRight: widthScale(8),
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#131313',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: fontScale(14),
    lineHeight: 20,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#131313',
  },
  dismissButton: {
    backgroundColor: '#DB3171',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  dismissButtonText: {
    color: 'white',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: fontScale(12),
  },
});

export default AnimatedSwipe;
