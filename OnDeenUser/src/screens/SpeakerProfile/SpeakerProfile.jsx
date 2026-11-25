import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshControl } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import TouchableLabel from '../../components/customLabels';
import { fontScale, getColorByIndex, heightScale } from '../../helpers/scale';
import { fetchSpeakerById } from '../../redux/slices/speakerSlice';
import LatestHeader from '../../components/LatestHeader';
import styles from './styles';
import RenderHtmlCustome from '../../components/htmlComponent';
import { fontFamilies } from '../../assets/fonts/fonts';
import LinearGradient from 'react-native-linear-gradient';
import RatingModal from '../../modals/ratingModal';
import { fetchReviewsByEventId } from '../../redux/slices/ratingSlice';
import GuestModal from '../../modals/guestModal';
import { logout, setIsSkippedLogin, setIsSkippedLoginAllow, setLoginState } from '../../redux/slices/loginSlice';
import ImageWithFallback from '../../components/ImageWithFallback';
import SpeakerEventList from './SpeakerEventList';
import { IS_IT_NEED_NOW } from '../../helpers/Constant';

const SpeakerScreen = ({ route }) => {
  const { speakerId, eventId } = route.params || {};
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const speakerDetail = useSelector((state) => state?.speakerSlice?.speakerDetail,);

  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const eventsSort1 = useSelector((state) => state.eventDetails);
  const eventDetail = eventsSort1.eventDetail;
  const user_id = eventDetail?.user_id;
  const reviews = useSelector((state) => state.ratingSlice.reviews);

  const colors = ['#E6D9B8', '#E6D9B8', '#F2C9D9', '#D1B3FF'];

  const openRatingModal = (eventId) => {
    setSelectedEventId(eventId);
    setModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setIsModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setIsSkippedLoginAllow(true));
    dispatch(setLoginState(false));
    dispatch(logout());
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('MainNavigator', { screen: 'Home' });
  };
  const fetchRating = useCallback(async () => {
    if (user_id) {
      await dispatch(fetchReviewsByEventId(user_id));
    }
  }, [dispatch, user_id]);

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(fetchSpeakerById(speakerId));
    await fetchRating();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, []),
  );

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={[styles.container]}>
      <LatestHeader
        statusBarColor="#F9F6FD"
        title="Speaker profile"
        leftIconName="chevron-left"
        onLeftPress={handleBack}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }>
        <View style={styles.profilePicContainer}>
          <ImageWithFallback imageurl={speakerDetail?.user_profile_image} style={styles.profileImage} />
          <Text style={styles.speakerName}>
            {speakerDetail?.user_first_name} {''}
            {speakerDetail?.user_last_name}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeContainer}
            snapToAlignment="center">
            {speakerDetail?.expertise?.map((item, index) => {
              const badgeColor = colors[index % colors.length];
              return (
                <TouchableLabel
                  key={index}
                  label={item.title}
                  onPress={() => { }}
                  containerStyle={[
                    styles.paidEventContainer,
                    { backgroundColor: badgeColor },
                  ]}
                  labelStyle={styles.customLableCarousel}
                />
              );
            })}
          </ScrollView>
          {speakerDetail?.slot_count > 0 && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableLabel
                containerStyle={styles.requestContainer}
                label={'BOOK A SESSION'}
                labelStyle={styles.requestLabel}
                onPress={() => {
                  if (isSkippedLogin) {
                    setIsModalVisible(true);
                  }
                  else
                    navigation.navigate('Session', {
                      speakerId: speakerId,
                      eventId: eventId,
                    });
                }}
              />
            </View>
          )}
        </View>
        {speakerDetail?.about_us !== null && (
          <View style={{ marginTop: 24, paddingHorizontal: 22 }}>
            <Text
              style={{
                color: '#0E0D0E',
                fontSize: heightScale(14),
                fontFamily: fontFamilies.allroundgothicSemiBold,
              }}>
              About {speakerDetail?.user_first_name}
              {speakerDetail?.user_last_name}
            </Text>
            <View style={styles.aboutEventConatiner}>
              <RenderHtmlCustome text={speakerDetail?.about_us} />
            </View>
          </View>
        )}
        <Text style={styles.nearbyText}>
          Events By {speakerDetail?.user_first_name}
          {speakerDetail?.user_last_name}
        </Text>
        <SpeakerEventList
          events={speakerDetail?.event_list?.events}
          navigation={navigation}
          speakerId={speakerId}
          type="speacker"
        />
        {
          IS_IT_NEED_NOW &&
          <>
            <Text style={styles.reviewsLabel}>Reviews</Text>

            <View style={styles.ratingContainer}>
              <View>
                <Text style={styles.organizationName}>
                  {speakerDetail?.user_first_name} {speakerDetail?.user_last_name}
                </Text>
                <Text style={styles.ratingPerson}>{reviews.length} reviews</Text>
              </View>
              <View>
                <LinearGradient
                  colors={['#DB3171', '#FFCC33']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gradientBorder}>
                  <TouchableLabel
                    label={'RATE SPEAKER'}
                    onPress={() => openRatingModal(eventId)}
                    containerStyle={styles.viewallContainer}
                    labelStyle={styles.viewallLabel}
                  />
                </LinearGradient>
                {selectedEventId !== null && (
                  <RatingModal
                    isVisible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    eventId={selectedEventId}
                    onSubmitSuccess={fetchRating}
                  />
                )}
              </View>
            </View>

            {reviews?.map((item, index) => {
              const initials = `${item.user_first_name?.charAt(0) || ''
                }`.toUpperCase();

              return (
                <React.Fragment key={item.id}>
                  <View style={styles.reviewsContainer}>
                    <View>
                      <TouchableLabel
                        label={initials}
                        onPress={() => { }}
                        containerStyle={{
                          backgroundColor: getColorByIndex(index),
                        }}
                        labelStyle={styles.initialLabel}
                      />
                    </View>
                    <View style={{ gap: 4 }}>
                      <Text style={styles.ratingHeading}>
                        {item?.title}
                      </Text>
                      <Text style={styles.ratingContent}>{item.review}</Text>
                      <Text style={styles.ratingPerson}>
                        {item.user_first_name} {item.user_last_name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.separatorContainer}>
                    <View style={styles.separatorLine} />
                  </View>
                </React.Fragment>
              );
            })}
          </>
        }
        <GuestModal
          isVisible={isModalVisible}
          title="Confirm Login"
          message="You are currently using the app in guest mode. To access all features, please log in."
          onCancel={handleCancel}
          onConfirm={handleConfirmLogout}
        />

      </ScrollView>
    </ContainerComponent>
  );
};

export default SpeakerScreen;
