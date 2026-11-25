import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import styles from './styles';
import { fontScale, heightScale } from '../../helpers/scale';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Bg from '../../assets/svg/Layer_1.svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LatestHeader from '../../components/LatestHeader';
import GradientButton from '../../components/gradientButton';
import { updatePrivacySettings } from '../../redux/slices/updatePrivacySlice';
import Toast from '../../components/toastMessage';
import { fetchProfileData } from '../../redux/slices/profileSlice';
import Loader from '../../components/loader';
import { useToastForPopup } from '../../context/ToastContext';

const PrivacySetting = () => {
  const { data, status: profileStatus } = useSelector((state) => state.profileSlice);
  const { status, message } = useSelector(
    (state) => state.updatePrivacySlice,
  );
  const dispatch = useDispatch();

  const [isCourseShow, setIsCourseShow] = useState(false);
  const [isEventsShow, setIsEventsShow] = useState(false);
  const [isReviewShow, setIsReviewShow] = useState(false);
  const [isJourneyShow, setIsJourneyShow] = useState(false);
  const [isMobileShow, setIsMobileShow] = useState(false);
  const [isAwardShow, setIsAwardShow] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigation = useNavigation();

  const showToast = useToastForPopup();

  useEffect(() => {
    dispatch(fetchProfileData());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setIsCourseShow(data?.show_course === 1);
      setIsEventsShow(data?.show_events === 1);
      setIsReviewShow(data?.show_reviews === 1);
      setIsJourneyShow(data?.show_journeylevel === 1);
      setIsAwardShow(data?.show_awards === 1);
      setIsMobileShow(data?.show_mobile_number === 1);
    }
  }, [data]);

  useEffect(() => {
    if (status === 'succeeded') {
      dispatch(fetchProfileData());
      showToast(message || 'Privacy settings updated successfully');
    }

    if (status === 'failed') {
      showToast('Something went wrong while saving your settings.');
    }
  }, [status]);

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ flex: 1, backgroundColor:'#fff' }}>
      {status === 'loading' || profileStatus === 'loading' || (profileStatus === 'idle' && !data) ? (
        <Loader
          isLoading={true}
          containerStyle={{ backgroundColor: '#fff' }}
          animationSource={require('../../assets/loader.json')}
        />
      ) : (
        <View style={styles.container}>
          <LatestHeader
            statusBarColor="#fff"
            secondRightImageSource={'2'}
            containerStyle={{
              paddingVertical: heightScale(5),
              justifyContent: 'space-between',
            }}
            leftIconName="chevron-left"
            onLeftPress={() => navigation.goBack()}
            titleStyle={{
              color: '#000000',
              fontSize: fontScale(16),
            }}
            title={'Privacy Setting'}
          />

          <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Course</Text>
              <Pressable
                accessibilityLabel="Show Course"
                accessibilityRole="switch"
                accessibilityState={{ checked: isCourseShow }}
                style={[
                  styles.toggleContainer,
                  isCourseShow && styles.toggleActive,
                ]}
                onPress={() => setIsCourseShow(prev => !prev)}>
                <View
                  style={[styles.toggleCircle, isCourseShow && styles.circleActive]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Event</Text>
              <Pressable
                accessibilityLabel="Show Event"
                accessibilityRole="switch"
                accessibilityState={{ checked: isEventsShow }}
                style={[
                  styles.toggleContainer,
                  isEventsShow && styles.toggleActive,
                ]}
                onPress={() => setIsEventsShow(prev => !prev)}>
                <View
                  style={[styles.toggleCircle, isEventsShow && styles.circleActive]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Review</Text>
              <Pressable
                accessibilityLabel="Show Review"
                accessibilityRole="switch"
                accessibilityState={{ checked: isReviewShow }}
                style={[
                  styles.toggleContainer,
                  isReviewShow && styles.toggleActive,
                ]}
                onPress={() => setIsReviewShow(prev => !prev)}>
                <View
                  style={[styles.toggleCircle, isReviewShow && styles.circleActive]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Journey Level</Text>
              <Pressable
                accessibilityLabel="Show Journey Level"
                accessibilityRole="switch"
                accessibilityState={{ checked: isJourneyShow }}
                style={[
                  styles.toggleContainer,
                  isJourneyShow && styles.toggleActive,
                ]}
                onPress={() => setIsJourneyShow(prev => !prev)}>
                <View
                  style={[
                    styles.toggleCircle,
                    isJourneyShow && styles.circleActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Mobile Number</Text>
              <Pressable
                accessibilityLabel="Show Mobile Number"
                accessibilityRole="switch"
                accessibilityState={{ checked: isMobileShow }}
                style={[
                  styles.toggleContainer,
                  isMobileShow && styles.toggleActive,
                ]}
                onPress={() => setIsMobileShow(prev => !prev)}>
                <View
                  style={[
                    styles.toggleCircle,
                    isMobileShow && styles.circleActive,
                  ]}
                />
              </Pressable>
            </View>
          </View>

          {/* <View style={styles.editProfileCommonContainer}>
            <View style={styles.row}>
              <Text style={styles.subtitle}>Show Award</Text>
              <Pressable
                style={[styles.toggleContainer, isAwardShow && styles.toggleActive]}
                onPress={() => setIsAwardShow(prev => !prev)}>
                <View
                  style={[styles.toggleCircle, isAwardShow && styles.circleActive]}
                />
              </Pressable>
            </View>
          </View> */}

          <View style={styles.gradientContainer}>
            <GradientButton
              containerStyle={styles.applyButton}
              onPress={() => {
                const payload = {
                  show_course: isCourseShow ? 1 : 0,
                  show_events: isEventsShow ? 1 : 0,
                  show_reviews: isReviewShow ? 1 : 0,
                  show_journeylevel: isJourneyShow ? 1 : 0,
                  show_awards: isAwardShow ? 1 : 0,
                  show_mobile_number: isMobileShow ? 1 : 0,
                };

                dispatch(updatePrivacySettings(payload));
              }}
              title={status === 'loading' ? 'Saving...' : 'Save & Continue'}
              textStyle={styles.applyButtonText}
              colors={['#DB3171', '#FFCC33']}
              end={{ x: 0.78, y: 0 }}
              start={{ x: 0.1, y: 1 }}
              disabled={status === 'loading'}
            />
          </View>

          <Bg style={styles.logoImage} />
          <Toast message={toastMessage} />

        </View>
      )}
    </ContainerComponent>
  );
}
export default PrivacySetting;
