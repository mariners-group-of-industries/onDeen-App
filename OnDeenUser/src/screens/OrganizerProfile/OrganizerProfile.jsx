import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  Dimensions,
  ImageBackground,
  RefreshControl,
  Pressable,
  BackHandler,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel from 'react-native-snap-carousel';
import TouchableLabel from '../../components/customLabels';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  fontScale,
  getColorByIndex,
  heightScale,
} from '../../helpers/scale';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrganizerById,
} from '../../redux/slices/eventsSlice';
import WishlistButton from '../../components/WishlistButton';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import RenderHtmlCustome from '../../components/htmlComponent';
import RatingModal from '../../modals/ratingModal';
import { fetchReviewsByEventId } from '../../redux/slices/ratingSlice';
import { fontFamilies } from '../../assets/fonts/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import GuestModal from '../../modals/guestModal';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import { clearLastEventId } from '../../helpers/storage';
import { SvgUri } from 'react-native-svg';
import ImageWithFallback from '../../components/ImageWithFallback';
import SpeakerEventList from '../SpeakerProfile/SpeakerEventList';
import { IS_IT_NEED_NOW } from '../../helpers/Constant';

const OrganizerProfile = ({ route }) => {
  const { id, user_id, eventId } = route.params || {};
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const fourthCarouselRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const reviews = useSelector((state) => state.ratingSlice.reviews);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isSkippedLogin = useSelector(
    (state) => state.user.isSkippedLogin,
  );
  const openRatingModal = (eventId) => {
    setSelectedEventId(eventId);
    setModalVisible(true);
  };

  const openContactLink = url => {
    Linking.openURL(url).catch(() => {});
  };

  const handleConfirmLogout = async () => {
    setIsModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const organizerDetail = useSelector(
    (state) => state.eventDetails.organizerDetail,
  );
  const contactEmail = organizerDetail?.email_id?.trim();
  const contactPhone = [
    organizerDetail?.country_code?.trim(),
    organizerDetail?.mobile_number?.trim(),
  ].filter(Boolean).join(' ');
  const organiserThemes = organizerDetail?.about_us
    ?.split('·')
    .map(item => item.trim())
    .filter(Boolean) || [];

  const fetchorganizerdata = useCallback(() => {
    setLoading(true);
    dispatch(fetchOrganizerById(id || user_id)).finally(() =>
      setLoading(false),
    );
  }, [dispatch]);

  const fetchRating = useCallback(async () => {
    if (user_id) {
      await dispatch(fetchReviewsByEventId(user_id));
    }
  }, [dispatch, user_id]);

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    await fetchorganizerdata();
    await fetchRating();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );

  if (isLoading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#fff' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }
  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={[styles.container]}>
      <LatestHeader
        statusBarColor="#fff"
        title="Organiser's Profile"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }>
        <GuestModal
          isVisible={isModalVisible}
          title="Confirm Login"
          message="You are currently using the app in guest mode. To access all features, please log in."
          onCancel={handleCancel}
          onConfirm={handleConfirmLogout}
        />
        {/* {profile pic section} */}
        <View style={styles.profilePicContainer}>
          <ImageWithFallback imageurl={organizerDetail?.profile_image} style={styles.profileImage} />
          <Text style={styles.speakerName}>
            {organizerDetail?.organization_name}
          </Text>
        </View>
        {(contactEmail || contactPhone || organizerDetail?.location) && (
          <View style={styles.contactSection}>
            <Text style={styles.aboutTitle}>Contact</Text>
            <View style={styles.contactCard}>
              {contactEmail && (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Email organiser ${contactEmail}`}
                  onPress={() => openContactLink(`mailto:${contactEmail}`)}
                  style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Icon name="email-outline" size={20} color="#422199" />
                  </View>
                  <View style={styles.contactCopy}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{contactEmail}</Text>
                  </View>
                </Pressable>
              )}
              {contactEmail && contactPhone ? <View style={styles.contactDivider} /> : null}
              {contactPhone && (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Call organiser ${contactPhone}`}
                  onPress={() => openContactLink(`tel:${contactPhone.replace(/\s/g, '')}`)}
                  style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Icon name="phone-outline" size={20} color="#422199" />
                  </View>
                  <View style={styles.contactCopy}>
                    <Text style={styles.contactLabel}>Mobile</Text>
                    <Text style={styles.contactValue}>{contactPhone}</Text>
                  </View>
                </Pressable>
              )}
              {(contactEmail || contactPhone) && organizerDetail?.location ? (
                <View style={styles.contactDivider} />
              ) : null}
              {organizerDetail?.location && (
                <View
                  accessible
                  accessibilityLabel={`Organiser address ${organizerDetail.location}`}
                  style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <Icon name="map-marker-outline" size={20} color="#422199" />
                  </View>
                  <View style={styles.contactCopy}>
                    <Text style={styles.contactLabel}>Location</Text>
                    <Text style={styles.contactValue}>{organizerDetail.location}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        <View style={{ marginTop: 24, paddingHorizontal: 22 }}>
          <Text style={styles.aboutTitle}>
            About the Organiser
          </Text>
          <View style={styles.aboutEventConatiner}>
            <RenderHtmlCustome text={organizerDetail?.about_us} />
          </View>
          {organiserThemes.length > 1 && (
            <View style={styles.themeRow}>
              {organiserThemes.map(theme => (
                <View key={theme} style={styles.themeChip}>
                  <Text style={styles.themeChipText}>{theme}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {organizerDetail?.event_list?.events?.length > 0 && (
          <>
            <Text style={styles.nearbyText}>All Active Events</Text>
            <SpeakerEventList
              events={organizerDetail?.event_list?.events}
              navigation={navigation}
              type="organiser"
              organizerId={id || user_id}
            />
          </>
        )}
        {
          IS_IT_NEED_NOW &&
          <>
            <Text style={styles.reviewsLabel}>Reviews</Text>

            <View style={styles.ratingContainer}>
              <View>
                <Text style={styles.organizationName}>
                  {organizerDetail?.organization_name}
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
                    label={'RATE ORGANISER'}
                    onPress={() => {
                      if (isSkippedLogin) {
                        setIsModalVisible(true);
                      } else {
                        openRatingModal(eventId);
                      }
                    }}
                    containerStyle={styles.viewallContainer}
                    labelStyle={styles.viewallLabel}
                  />
                </LinearGradient>
                {selectedEventId != null && (
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
      </ScrollView>
    </ContainerComponent>
  );
};

export default OrganizerProfile;
