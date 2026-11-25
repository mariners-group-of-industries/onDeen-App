import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Pressable,
  BackHandler,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fontScale, heightScale } from '../../helpers/scale';
import styles from './styles';
import { fontFamilies } from '../../../assets/fonts/fonts';
import { requestBuddyCall } from '../../redux/slices/requestBuddySlice';
import AnimatedSwipe from '../../components/AnimatedSwipe';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestionAnswersByEventId } from '../../redux/slices/questionAnswerSlice';
import { createNote, fetchNotes } from '../../redux/slices/notesSlice';
import LatestHeader from '../../components/LatestHeader';
import { resetApiStatus } from '../../redux/slices/checkInSlice';
import { cancelBooking } from '../../redux/slices/cancelBookingSlice';
import useTopInset from '../../utils/useTopInset';
import { useDropdown } from '../../context/DropdownContext';
import QAComponents from '../../components/QAComponents';
import { debugCompleteBookingAPI, eventbyIdAPI, publicEventbyIdAPI } from '../../redux/callapis/CommonService';
import { BASE_URL } from '../../helpers/Constant';
import Loader from '../../components/loader';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import ShowTicketModel from '../PaymentConfirmation/ShowTicketModel';
import AboutOrganisedby from './AboutOrganisedby';
import ClassContainer from './ClassContainer';
import OccusrtextContainer from './OccusrtextContainer';
import DateTimeContainer from './DateTimeContainer';
import TitlewithPriceContainer from './TitlewithPriceContainer';
import JourneyLevelContainer from './JourneyLevelContainer';
import EventLabelContainer from './EventLabelContainer';
import ConformCompleteParticipantLabel from './ConformCompleteParticipantLabel';
import EventTabs from './EventTabs';
import MyNotesContainer from './MyNotesContainer';
import StudyMaterialContainer from './StudyMaterialContainer';
import LocationContainer from '../FirstEventDetailsPage/LocationContainer';
import SpeakerContainer from '../FirstEventDetailsPage/SpeakerContainer';
import CourseContainer from '../FirstEventDetailsPage/CourseContainer';
import ItinerariesContainer from '../FirstEventDetailsPage/ItinerariesContainer';
import RulesContainer from '../FirstEventDetailsPage/RulesContainer';
import FacilitiesContainer from '../FirstEventDetailsPage/FacilitiesContainer';
import OverviewContainer from '../FirstEventDetailsPage/OverviewContainer';
import CommonNotesModel from './CommonNotesModel';
import ViewTicketRequestBuddy from './ViewTicketRequestBuddy';
import SecondCarousel from './SecondCarousel';
import AddtoCalender from './AddtoCalender';
import ConfirmationModal from '../../components/ConfirmationModal';

const pickEventDetail = (payload) => {
  if (!payload) {
    return null;
  }
  if (payload?.id) {
    return payload;
  }
  if (payload?.event_id) {
    return { ...payload, id: payload.event_id };
  }
  if (payload?.response?.id) {
    return payload.response;
  }
  if (payload?.response?.event?.id) {
    return payload.response.event;
  }
  if (payload?.event?.id) {
    return payload.event;
  }
  if (Array.isArray(payload?.response?.events)) {
    return payload.response.events.find((event) => event?.id) || null;
  }
  return null;
};

const mergeEventDetails = (...details) => {
  const [routeDetail, publicDetail, responseDetail] = details;
  const validDetails = details.filter(Boolean);
  const merged = {};
  const arrayKeys = [
    'tags',
    'facilities',
    'images',
    'speakers',
    'curriculum',
    'itineraries',
    'documents',
  ];
  const participantSourceOrder = [
    responseDetail,
    routeDetail,
    publicDetail,
    ...validDetails,
  ].filter(Boolean);
  const participants = participantSourceOrder.find((detail) => Array.isArray(detail?.participants) && detail.participants.length > 0)
    || participantSourceOrder.find((detail) => Array.isArray(detail?.event_participants) && detail.event_participants.length > 0);

  validDetails.forEach((detail) => {
    Object.entries(detail).forEach(([key, value]) => {
      if (arrayKeys.includes(key) || key === 'participants' || key === 'event_participants') {
        return;
      }
      if (value === undefined || value === null || value === '') {
        return;
      }
      merged[key] = value;
    });
  });

  arrayKeys.forEach((key) => {
    const source = [...validDetails]
      .reverse()
      .find((detail) => Array.isArray(detail?.[key]) && detail[key].length > 0)
      || [...validDetails].reverse().find((detail) => Array.isArray(detail?.[key]));
    if (source) {
      merged[key] = source[key];
    }
  });

  if (participants?.participants) {
    merged.participants = participants.participants;
  } else if (participants?.event_participants) {
    merged.participants = participants.event_participants;
  }

  return ensureBookingParticipants(merged);
};

const getBookedQuantity = (detail) => {
  const quantity = Number(
    detail?.quantity
    ?? detail?.ticket_quantity
    ?? detail?.total_quantity
    ?? detail?.booking_quantity
    ?? 0
  );

  if (Number.isFinite(quantity) && quantity > 0) {
    return quantity;
  }

  return detail?.participant_id || detail?.ticket_id || detail?.ticket || detail?.qrcode || detail?.qrcode_path ? 1 : 0;
};

const ensureBookingParticipants = (detail) => {
  if (!detail) {
    return null;
  }
  if (Array.isArray(detail.participants) && detail.participants.length > 0) {
    return {
      ...detail,
      participants: detail.participants.map((participant, index) => {
        if (index !== 0) {
          return participant;
        }

        const quantity = getBookedQuantity({
          ...detail,
          ...participant,
        }) || 1;

        return {
          ...participant,
          quantity,
          qrcode: participant?.qrcode || detail?.qrcode,
          qrcode_path: participant?.qrcode_path || detail?.qrcode_path,
          qrcode_count: participant?.qrcode_count || detail?.qrcode_count || quantity,
          ticket: participant?.ticket || detail?.ticket || detail?.event_ticket,
          ticket_no: participant?.ticket_no || detail?.ticket_no || detail?.event_ticket_no || participant?.participant_id || detail?.participant_id,
          ticket_title: participant?.ticket_title || detail?.ticket_title || detail?.ticket_type || 'General Admission',
          paid_amount: participant?.paid_amount ?? detail?.paid_amount ?? (Number(detail?.price_type) === 0 ? '0.00' : detail?.price),
        };
      }),
    };
  }

  const quantity = getBookedQuantity(detail);
  if (quantity <= 0) {
    return detail;
  }

  return {
    ...detail,
    quantity,
    participants: [{
      id: detail?.participant_id || detail?.ticket_id,
      participant_id: detail?.participant_id || detail?.ticket_id,
      ticket_id: detail?.ticket_id || 0,
      quantity,
      qrcode: detail?.qrcode,
      qrcode_path: detail?.qrcode_path,
      qrcode_count: detail?.qrcode_count || quantity,
      ticket: detail?.ticket || detail?.event_ticket,
      ticket_no: detail?.ticket_no || detail?.event_ticket_no || detail?.participant_id,
      ticket_title: detail?.ticket_title || detail?.ticket_type || 'General Admission',
      paid_amount: detail?.paid_amount ?? (Number(detail?.price_type) === 0 ? '0.00' : detail?.price),
    }],
  };
};

const normalizeBookingDetail = (booking) => {
  if (!booking) {
    return null;
  }

  const normalized = { ...booking };
  return ensureBookingParticipants(normalized);
};

const hasFullDetailContent = (detail) => Boolean(
  detail?.description ||
  detail?.eligibility ||
  detail?.rule ||
  detail?.cancellation_policy ||
  detail?.terms_condition ||
  (Array.isArray(detail?.facilities) && detail.facilities.length > 0)
);

const fetchPublicDetailDirectly = async (eventId) => {
  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${backendUrl}/customer_app/event/event_id?id=${encodeURIComponent(eventId)}`);
  const payload = await response.json();
  return pickEventDetail(payload);
};

const fetchBookedDetailDirectly = async ({ eventId, participantId, authToken, bearerToken }) => {
  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const participantQuery = participantId ? `&participant_id=${encodeURIComponent(participantId)}` : '';
  const response = await fetch(`${backendUrl}/customer_app/event/event_id?id=${encodeURIComponent(eventId)}${participantQuery}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'auth-token': authToken } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
  });
  const payload = await response.json();
  return payload?.status === false ? null : pickEventDetail(payload);
};

const SecondEventDetailsPage = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'details');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotesListVisible, setNotesListVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    id: routeId,
    eventId: routeEventId,
    event_id: routeEventSnakeId,
    participant_id,
    booking: routeBookingParam,
  } = route.params || {};
  const id = routeEventId || routeEventSnakeId || routeId;
  const routeBooking = normalizeBookingDetail(routeBookingParam);
  const notes = useSelector((state) => state.notesSlice.notes);
  const authToken = useSelector((state) => state.token?.token?.access_token);
  const bearerToken = useSelector((state) => (
    state.user?.loginToken ||
    state.user?.user?.access_token ||
    state.verifyOtp?.verifyOtp_access_token ||
    state.registerUser?.access_token
  ));
  const [eventDetail, setEventDetail] = useState(routeBooking || {});
  const [ticketModalDetail, setTicketModalDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false); // State for modal visibility
  const [showCancelConfromModal, setshowCancelConfromModal] = useState(false); // State for modal visibility
  const [showCancelConfromData, setshowCancelConfromData] = useState(false); // State for modal visibility

  const { message, error, apiStatus } = useSelector(
    (state) => state.checkInSlice,
  );

  const calendarRef = useRef();

  const handleAddToCalendar = () => {
    calendarRef.current?.openModel();
  };


  useEffect(() => {
    if (apiStatus != null) {
      showToast(message);
      dispatch(resetApiStatus());
    }
  }, [apiStatus]);

  const handleRequestBuddy = async () => {
    const type = 1;
    const result = await dispatch(requestBuddyCall({ eventId: id, type }));
    if (requestBuddyCall.fulfilled.match(result)) {
      showToast(result.payload.message);
      await hitapitogetdatafilter();
      return true;
    }

    showToast(result.payload || 'Failed to request buddy.');
    return false;
  };

  const showToast = useToastForPopup();

  const hitapitogetdatafilter = async () => {
    if (!id) {
      setEventDetail(routeBooking || {});
      setLoading(false);
      return;
    }

    try {
      let responseDetail = null;
      let publicDetail = null;

      if (bearerToken) {
        try {
          responseDetail = await fetchBookedDetailDirectly({
            eventId: id,
            participantId: participant_id,
            authToken,
            bearerToken,
          });
        } catch (error) {
          responseDetail = null;
        }
      }

      if (!responseDetail?.id) {
        try {
          const res = await eventbyIdAPI(id, participant_id);
          responseDetail = res?.status === false ? null : pickEventDetail(res);
        } catch (error) {
          responseDetail = null;
        }
      }

      if (!hasFullDetailContent(responseDetail)) {
        try {
          const fallbackRes = await publicEventbyIdAPI(id);
          publicDetail = fallbackRes?.status === false ? null : pickEventDetail(fallbackRes);
        } catch (error) {
          publicDetail = null;
        }
      }

      if (!hasFullDetailContent(responseDetail) && !hasFullDetailContent(publicDetail)) {
        try {
          publicDetail = await fetchPublicDetailDirectly(id);
        } catch (error) {
          publicDetail = publicDetail || null;
        }
      }

      const completeDetail = responseDetail || publicDetail;
      setEventDetail(completeDetail?.id
        ? mergeEventDetails(routeBooking, publicDetail, responseDetail)
        : (routeBooking || {}));
      dispatch(fetchNotes(id));

    } catch (error) {
      setEventDetail(routeBooking || {});
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      hitapitogetdatafilter();
      return () => { };
    }, [id, authToken, bearerToken]),
  );

  useEffect(() => {
    if (id && bearerToken) {
      dispatch(fetchNotes(id));
    }
  }, [dispatch, id, bearerToken]);

  const [isNewNoteModalVisible, setNewNoteModalVisible] = useState(false);

  const handleCreateNewNote = useCallback(() => {
    setNewNoteModalVisible(true);
  }, []);

  const showNotification = async (title, body, filePath) => {
    await notifee.requestPermission();

    await notifee.displayNotification({
      title: `<b>${title}</b>`,
      body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'open_file',
        },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: body,
        },
      },
      data: filePath ? { filePath } : {},
    });
  };

  const downloadFile = async (filePath) => {
    if (!filePath) {
      await showNotification('Download Failed', 'No file available for download.');
      return;
    }

    try {
      const encodedUrl = encodeURI(filePath);
      const fileName = filePath.split('/').pop();
      const destinationPath =
        Platform.OS == 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: encodedUrl,
        toFile: destinationPath,
      }).promise;

      if (downloadResult.statusCode == 200) {
        await showNotification('Download Complete', `Saved to: ${destinationPath}`);
      } else {
        await showNotification(
          'Download Failed',
          `Status code: ${downloadResult.statusCode}`,
        );
      }
    } catch (error) {
      await showNotification(
        'Download Error',
        'An error occurred. Please check the file URL or your network.',
      );
    }
  };

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

  useEffect(() => {
    if (id) {
      dispatch(fetchQuestionAnswersByEventId(id));
    }
  }, [dispatch, id]);

  const saveNote = async (values) => {
    try {
      const data = {
        eventId: id,
        note: values?.note,
        title: values?.title,
      }
      await dispatch(createNote(data)).unwrap();

      dispatch(fetchNotes(id));
      setNewNoteModalVisible(false);
      showToast("Added Successfully");
      await hitapitogetdatafilter();
    } catch (err) {
      const errorMessage =
        typeof err == 'string'
          ? err
          : 'An unexpected error occurred. Please try again.';
      showToast(errorMessage);
    }
  };

  const toggleNotesListVisibility = useCallback(() => {
    setNotesListVisible(prevState => !prevState);
  }, []);

  const openModal = async () => {
    let modalDetail = ensureBookingParticipants(eventDetail) || {};
    const modalParticipants = Array.isArray(modalDetail?.participants) ? modalDetail.participants : [];
    const firstParticipant = modalParticipants[0];
    const ticketId = modalDetail?.participant_id || firstParticipant?.participant_id || participant_id || firstParticipant?.id;
    const hasQrPayload = Boolean(modalDetail?.qrcode || modalParticipants.some((participant) => participant?.qrcode || participant?.qr_code));
    const hasQrAsset = Boolean(modalDetail?.qrcode_path || modalParticipants.some((participant) => participant?.qrcode_path || participant?.qr_code_path));

    if (id && ticketId && (!hasQrPayload || !hasQrAsset)) {
      try {
        let responseDetail = null;

        if (Platform.OS === 'ios') {
          responseDetail = await fetchBookedDetailDirectly({
            eventId: id,
            participantId: ticketId,
            authToken,
            bearerToken,
          });
        }

        if (!responseDetail?.id) {
          const res = await eventbyIdAPI(id, ticketId);
          responseDetail = res?.status === false ? null : pickEventDetail(res);
        }

        if (responseDetail?.id) {
          modalDetail = mergeEventDetails(routeBooking, null, responseDetail);
          setEventDetail(modalDetail);
        }
      } catch (error) {
        // Keep opening the modal with the booking row we already have.
      }
    }

    setTicketModalDetail(modalDetail);
    setIsModalVisible(true);
  };

  const carouselData = Array.isArray(eventDetail?.images)
    ? eventDetail.images.map((image) => image?.full_screen_image).filter(Boolean)
    : eventDetail?.primary_image
      ? [eventDetail.primary_image]
      : [];
  const modalEventDetail = ticketModalDetail || eventDetail;
  const { closeDropdown, dropdownState } = useDropdown();

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleMarkComplete = async () => {
    const ticketId = eventDetail?.participant_id || participant_id;
    if (!ticketId) {
      showToast('Booked ticket not found.');
      closeDropdown();
      return;
    }

    try {
      setIsCompleting(true);
      closeDropdown();
      const response = await debugCompleteBookingAPI({
        event_id: eventDetail?.id || id,
        ticket_id: ticketId,
      });

      if (response?.status) {
        const summary = response?.response?.gamification_summary;
        showToast(response?.response?.message || 'Session marked complete.');
        if (summary) {
          navigation.navigate('GamificationSummary', { summary });
        }
        hitapitogetdatafilter();
      } else {
        showToast(response?.response?.message || response?.message || 'Unable to mark session complete.');
      }
    } catch (error) {
      showToast('Unable to mark session complete.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleConfromCancel = () => {
    setshowCancelConfromModal(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setIsCancelling(true);
    try {
      const data = { event_id: id, ticket_id: participant_id, }
      const res = await dispatch(cancelBooking({ data }));
      if (res?.payload?.confirm == 1) {
        setshowCancelConfromData(res?.payload)
        handleConfromCancel()
      }
      showToast(res?.payload?.message || `Failed to Cancel Booking`);
      closeDropdown();
      hitapitogetdatafilter();
    } catch (error) {
      showToast("An error occurred while canceling the booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmConformCancel = async () => {
    setShowCancelModal(false);
    setIsCancelling(true);
    try {
      const data = {
        event_id: id, ticket_id: participant_id, "confirm": 1
      }
      const res = await dispatch(cancelBooking({ data }));
      showToast(res?.payload?.message || `Failed to Cancel Booking`);
      handleCancelConfromModal();

      hitapitogetdatafilter();

    } catch (error) {
      showToast("An error occurred while canceling the booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelModal = () => {
    setShowCancelModal(false);
    closeDropdown();
  };

  const handleCancelConfromModal = () => {
    setShowCancelModal(false);
    setshowCancelConfromModal(false);
    closeDropdown();
  };

  const isVisible = dropdownState?.isVisible;
  useStatusBar({ backgroundColor: '#FFF', barStyle: 'dark-content' });

  if (loading) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#fff' }}>
      {isVisible && eventDetail?.status == 1 && (
        <Pressable
          accessible={false}
          style={{ flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 1 }}
          onPress={closeDropdown}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.dropdownContainer, { marginTop: useTopInset() + 5 }]}>
            {/* Debug-only shortcut: forces attendance without a real check-in.
                Hidden in release bundles; the backend also refuses it unless
                ONDEEN_ENABLE_DEBUG_ATTENDANCE (or ONDEEN_LOCAL=1) is set. */}
            {__DEV__ && (
              <>
                <TouchableOpacity
                  accessibilityLabel="Mark as Completed"
                  accessibilityRole="button"
                  onPress={handleMarkComplete}
                  style={styles.dropdownButton}
                  disabled={isCompleting || isCancelling}>
                  <Text style={styles.dropdownText}>
                    {isCompleting ? 'Completing...' : 'Mark as Completed'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
              </>
            )}
            <TouchableOpacity
              accessibilityLabel="Cancel Booking"
              accessibilityRole="button"
              onPress={handleCancel}
              style={styles.dropdownButton}
              disabled={isCancelling}>
              <Text style={styles.dropdownText}>
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      <View style={[styles.container]}>
        <LatestHeader
          statusBarColor="#fff"
          rightImageSource={'2'}
          secondRightImageSource={'2'}
          add_calender={true}
          handleAddToCalendar={handleAddToCalendar}
          containerStyle={{
            paddingVertical: heightScale(5),
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          }}
          leftIconName="chevron-left"
          onLeftPress={() => navigation.goBack()}
          onClickAskedQuestion={() => handleCreateNewNote()}
          editEvent={() => handleCreateNewNote()}
          cencelEvent={() => handleCreateNewNote()}
          endEvent={() => toggleNotesListVisibility()}
          title="Event Details"
          eventsdots={true}
          titleStyle={{
            color: '#000000',
            fontSize: fontScale(16),
          }}
          showforeventDetails={true}
          handleCancelBooking={handleCancel}
          eventStatus={eventDetail?.status == 1}
        />

        <AddtoCalender eventDetail={eventDetail} ref={calendarRef} />
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab == 'details' &&
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ flex: 1, backgroundColor: '#F9F6FD' }}
            contentContainerStyle={{ backgroundColor: '#F9F6FD', flexGrow: 1, paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={hitapitogetdatafilter}
              />
            }>
            <>
              <View style={{
                paddingVertical: 8,
                paddingBottom: 18,
                backgroundColor: '#FFF',
                elevation: 1,
                borderBottomRightRadius: 32,
                borderBottomLeftRadius: 32,
              }}>
                <SecondCarousel carouselData={carouselData} />
                <ConformCompleteParticipantLabel eventDetail={eventDetail} />
                <EventLabelContainer eventDetail={eventDetail} />
                <TitlewithPriceContainer eventDetail={eventDetail} />
                <DateTimeContainer eventDetail={eventDetail} />
                <ClassContainer eventDetail={eventDetail} />
                <OccusrtextContainer eventDetail={eventDetail} />
                <JourneyLevelContainer eventDetail={eventDetail} />
                <ViewTicketRequestBuddy handleRequestBuddy={handleRequestBuddy} openModal={openModal} eventDetail={eventDetail} />
                <AboutOrganisedby eventDetail={eventDetail} />
                <OverviewContainer eventDetail={eventDetail} />
              </View>

              <View style={{ backgroundColor: '#F9F6FD' }}>
                {eventDetail?.location_type != 0 && (
                  <LocationContainer eventDetail={eventDetail} />
                )}
                <SpeakerContainer eventDetail={eventDetail} />
                <CourseContainer eventDetail={eventDetail} />
                <ItinerariesContainer eventDetail={eventDetail} />
                <RulesContainer eventDetail={eventDetail} />
                <FacilitiesContainer eventDetail={eventDetail} />
                {eventDetail?.location_type == 0 && (
                  <LocationContainer eventDetail={eventDetail} />
                )}
                {([0, 2].includes(Number(eventDetail?.location_type)) && eventDetail?.status == 1) && (
                  <View style={{ marginTop: 17, marginBottom: 18, paddingHorizontal: 24 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('OnlineCheckInCode', {
                        event_id: eventDetail?.id,
                        ticket_id: eventDetail?.participant_id || participant_id,
                        eventTitle: eventDetail?.title,
                      })}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#3E146F',
                        borderRadius: 28,
                        minHeight: 56,
                        justifyContent: 'center',
                        paddingHorizontal: 18,
                      }}
                    >
                      <Text style={{
                        color: '#FFFFFF',
                        fontFamily: fontFamilies.SFProRoundedBlackBold,
                        fontSize: fontScale(16),
                      }}>
                        Enter online check-in code
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <>
                  {([1, 2].includes(Number(eventDetail?.location_type)) && eventDetail?.category_id == 2 && eventDetail?.swipe_checkin == 1 && eventDetail?.status == 1) && (
                    <View style={{ marginTop: 17, marginBottom: 18 }}>
                      <AnimatedSwipe
                        eventDetail={eventDetail}
                        hitapitogetdatafilter={hitapitogetdatafilter}
                      />
                    </View>
                  )}
                </>
              </View>
            </>
          </ScrollView>
        }

        {activeTab == 'material' &&
          <View style={{ flex: 1 }}>
            <MyNotesContainer eventDetail={eventDetail} notes={notes} handleCreateNewNote={handleCreateNewNote} />
            <StudyMaterialContainer eventDetail={eventDetail} downloadFile={downloadFile} />
          </View>
        }

        {activeTab == 'qa' && (
          <QAComponents event_id={id} />
        )}
        <ShowTicketModel
          isVisible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setTicketModalDetail(null);
          }}
          ticketData={modalEventDetail}
          eventDetail={modalEventDetail}
        />
        <CommonNotesModel
          isModalVisible={isNewNoteModalVisible}
          setIsModalVisible={setNewNoteModalVisible}
          saveNotes={saveNote}
          notesvalues={{}}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={showCancelModal}
          title="Confirm Cancellation"
          description="Are you sure you want to cancel this booking? This action cannot be undone."
          cancelText="BACK"
          confirmText="YES"
          onCancel={handleCancelModal}
          onConfirm={handleConfirmCancel}
        />

        <ConfirmationModal
          visible={showCancelConfromModal}
          title="Confirm Cancellation"
          description={showCancelConfromData?.message || "Are you sure you want to cancel this booking? This action cannot be undone."}
          cancelText="BACK"
          confirmText="YES"
          onCancel={handleCancelConfromModal}
          onConfirm={handleConfirmConformCancel}
        />
      </View>
    </SafeAreaView>
  );
};

export default SecondEventDetailsPage;
