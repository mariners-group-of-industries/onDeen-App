import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { resetApiStatus } from '../../redux/slices/bookingSlice';
import { useStripe, usePlatformPay, PlatformPayButton, PlatformPay } from '@stripe/stripe-react-native';
import styles from './styles';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import GradientButton from '../../components/gradientButton';
import Toast from '../../components/toastMessage';
import Plus from '../../../src/assets/svg/plusBlue.svg';
import Minus from '../../../src/assets/svg/minusBlue.svg';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import SlotCard from '../../components/SlotCard';
import { eventBookingAPI, eventbyIdAPI, PaymentStatusUpdate, publicEventbyIdAPI } from '../../redux/callapis/CommonService';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import BookingforContainer from './BookingforContainer';
import AddYourTicketsContainer from './AddYourTicketsContainer';
import SelectTicketsContainer from './SelectTicketsContainer';
import SelectDateSLOTContainer from './SelectDateSLOTContainer';
import PaymentMethodContainer from './PaymentMethodContainer';
import { BASE_URL, ITS_LIVE } from '../../helpers/Constant';
import { ticketSelectionDecision } from '../../helpers/ticketSelection';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_PAYMENT_KEY = 'ondeen.pendingPaymentOrder';
const paymentAttemptKey = () => `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
  return null;
};

const hasFullDetailContent = (detail) => Boolean(
  detail?.description ||
  detail?.eligibility ||
  detail?.rule ||
  detail?.cancellation_policy ||
  detail?.terms_condition ||
  (Array.isArray(detail?.facilities) && detail.facilities.length > 0) ||
  (Array.isArray(detail?.tickets) && detail.tickets.length > 0) ||
  (Array.isArray(detail?.dates) && detail.dates.length > 0)
);

const mergeEventDetails = (...details) => {
  const validDetails = details.filter(Boolean);
  const merged = {};
  const arrayKeys = ['tags', 'facilities', 'images', 'speakers', 'curriculum', 'itineraries', 'documents', 'participants', 'tickets', 'dates'];

  validDetails.forEach((detail) => {
    Object.entries(detail).forEach(([key, value]) => {
      if (arrayKeys.includes(key) || value === undefined || value === null || value === '') {
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

  return merged;
};

const fetchPublicDetailDirectly = async (eventId) => {
  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${backendUrl}/customer_app/event/event_id?id=${encodeURIComponent(eventId)}`);
  const payload = await response.json();
  return pickEventDetail(payload);
};

const PaymentScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card1');
  const [isFetching, setIsFetching] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [multiTicketCount, setMultiTicketCount] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotData, setSlotData] = useState([]);
  const routeEvent = route?.params?.eventDetail || route?.params?.event || null;
  const [eventDetail, setEventDetail] = useState(pickEventDetail(routeEvent));
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingdetails, setBookingdetails] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [googlePaySupported, setGooglePaySupported] = useState(false);
  const [applePaySupported, setApplePaySupported] = useState(false);
  const idempotencyKeyRef = useRef(paymentAttemptKey());

  useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });

  const { eventId: routeEventId, id: routeId, event_id: routeEventSnakeId } = route?.params || {};
  const eventId = routeEventId || routeEventSnakeId || routeId || routeEvent?.id || routeEvent?.event_id;

  const price = eventDetail?.price || "";
  const priceType = eventDetail?.price_type || "";
  const dateArray = eventDetail?.dates || [];
  const showToast = useToastForPopup();

  useEffect(() => {
    checkPlatformPaySupport();
  }, []);

  const checkPlatformPaySupport = async () => {
    try {
      if (Platform.OS === 'android') {
        const isSupported = await isPlatformPaySupported({
          googlePay: { testEnv: true } // Set to false for production
        });
        setGooglePaySupported(isSupported);
      } else if (Platform.OS === 'ios') {
        setApplePaySupported(await isPlatformPaySupported());
      }
    } catch (_error) {
      setGooglePaySupported(false);
      setApplePaySupported(false);
    }
  };

  const fetchEventData = async () => {
    try {
      setRefreshing(true);
      setLoadFailed(false);

      let responseDetail = null;
      let publicDetail = null;

      try {
        responseDetail = pickEventDetail(await eventbyIdAPI(eventId));
      } catch (error) {
        responseDetail = null;
      }

      try {
        publicDetail = pickEventDetail(await publicEventbyIdAPI(eventId));
      } catch (error) {
        publicDetail = null;
      }

      if (!hasFullDetailContent(publicDetail)) {
        try {
          publicDetail = await fetchPublicDetailDirectly(eventId);
        } catch (error) {
          publicDetail = publicDetail || null;
        }
      }

      const fetchedEvent = publicDetail || responseDetail || pickEventDetail(routeEvent);
      if (!fetchedEvent?.id) {
        setLoadFailed(true);
        return;
      }

      const mergedEvent = mergeEventDetails(routeEvent, publicDetail, responseDetail);
      setEventDetail(mergedEvent);

      const fetchedDates = mergedEvent?.dates || fetchedEvent?.dates || [];
      if (fetchedDates?.length > 0 && !selectedDate) {
        const firstAvailableDate = fetchedDates.find(date => date.status == 1);
        if (firstAvailableDate) {
          setSelectedDate(firstAvailableDate.id);
        }
      }
    } catch (error) {
      showToast('Failed to load event details');
      setLoadFailed(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  useEffect(() => {
    let mounted = true;
    const recoverPayment = async () => {
      try {
        const raw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
        const pending = raw ? JSON.parse(raw) : null;
        if (!pending?.orderKey || String(pending.eventId) !== String(eventId)) {
          return;
        }
        const response = await PaymentStatusUpdate({ payment_order_key: pending.orderKey });
        const result = response?.response || response;
        if (mounted && result?.confirmed) {
          await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
          navigation.navigate('PaymentConfirmationScreen', { data: result?.booking || result });
        } else if (result?.status === 'payment_failed') {
          await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
          idempotencyKeyRef.current = paymentAttemptKey();
        }
      } catch (_error) {
        // Recovery is best-effort; the normal checkout remains available.
      }
    };
    recoverPayment();
    return () => { mounted = false; };
  }, [eventId, navigation]);

  useEffect(() => {
    const ticketsArray = eventDetail?.tickets || [];
    const availableTickets = Math.max((eventDetail?.available ?? 0) - (eventDetail?.booked ?? 0), 0);

    if (eventDetail?.id && ticketsArray.length === 0 && availableTickets > 0 && ticketCount === 0) {
      setTicketCount(1);
      setShowCounter(true);
    }
  }, [eventDetail?.id, eventDetail?.tickets, eventDetail?.available, eventDetail?.booked, ticketCount]);

  useEffect(() => {
    if (selectedDate) {
      const selectedDateData = dateArray.find((date) => date?.id === selectedDate);
      setSlotData(selectedDateData ? selectedDateData?.times : []);
      setSelectedSlot(null);
    }
  }, [selectedDate, dateArray]);

  const handleDateSelect = (id) => {
    setSelectedDate(id);
  };

  const handleIncrease = () => {
    const totalAvailableTickets = eventDetail?.available - eventDetail?.booked;
    const maxPerUser = eventDetail?.quantity_per_user;
    const decision = ticketSelectionDecision({
      currentQuantity: ticketCount,
      totalSelected: ticketCount,
      quantityPerUser: maxPerUser,
      remaining: totalAvailableTickets,
    });

    if (decision.allowed) {
      setTicketCount(prev => prev + 1);
    } else {
      showToast(decision.message);
    }
  };

  const handleDecrease = () => {
    setTicketCount(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleMultiIncrease = (ticketId, available) => {
    setMultiTicketCount(prev => {
      const currentCount = prev[ticketId] || 0;
      const totalSelected = Object.values(prev).reduce(
        (total, quantity) => total + Number(quantity || 0),
        0,
      );
      const decision = ticketSelectionDecision({
        currentQuantity: currentCount,
        totalSelected,
        quantityPerUser: eventDetail?.quantity_per_user,
        remaining: available,
      });
      if (!decision.allowed) {
        showToast(decision.message);
        return prev;
      }
      return {
        ...prev,
        [ticketId]: currentCount + 1,
      };
    });
  };

  const handleMultiDecrease = (ticketId) => {
    setMultiTicketCount(prev => ({
      ...prev,
      [ticketId]: Math.max((prev[ticketId] || 0) - 1, 0),
    }));
  };

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };

  const confirmOrderWithServer = async paymentOrderKey => {
    const response = await PaymentStatusUpdate({ payment_order_key: paymentOrderKey });
    const result = response?.response || response;
    if (!result?.confirmed) {
      showToast('Payment is still being confirmed. Please try again in a moment.');
      return null;
    }
    await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
    return result;
  };

  const processGooglePayPayment = async (clientSecret, paymentOrderKey) => {
    try {
      const { error, paymentIntent } = await confirmPlatformPayPayment(
        clientSecret,
        {
          googlePay: {
            testEnv: !ITS_LIVE, // Set to false for production
            merchantName: 'OnDeen',
            merchantCountryCode: 'GB',
            currencyCode: 'GBP',
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full,
              isPhoneNumberRequired: false,
              isRequired: false,
            },
          },
        }
      );

      if (error) {
        showToast(`Payment failed: ${error.message}`);
        dispatch(resetApiStatus());
        return null;
      } else {
        const paymentStatus = paymentIntent?.status?.toLowerCase();
        if (paymentStatus === 'succeeded' || paymentStatus === 'success') {
          return confirmOrderWithServer(paymentOrderKey);
        } else {
          showToast(`Payment failed (${paymentIntent?.status}). Please complete the payment to confirm your order.`);
          return null;
        }
      }
    } catch (error) {
      showToast('Something went wrong with Google Pay');
      return null;
    }
  };

  const processCardPayment = async (clientSecret, paymentOrderKey) => {
    try {
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'OnDeen',
        returnURL: 'ondeen://stripe-redirect',
      });

      if (initError) {
        showToast('Failed to initialize payment');
        return null;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        const error = presentError;
        showToast(`Payment failed: ${error.message}`);
        dispatch(resetApiStatus());
        return null;
      }

      // The backend is the source of truth for the PaymentIntent status.
      // Avoid a second client-side retrieve that can fail with a stale or
      // mismatched publishable key after the sheet has already completed.
      return confirmOrderWithServer(paymentOrderKey);
    } catch (error) {
      showToast('Payment processing failed');
      return null;
    }
  };

  const calculatePayableAmount = () => {
    if (eventDetail?.tickets?.length > 0) {
      return eventDetail.tickets.reduce((total, ticket) => {
        const quantity = Number(multiTicketCount[ticket?.id] || 0);
        return total + (Number(ticket?.price || 0) * quantity);
      }, 0);
    }

    return Number(eventDetail?.price || 0) * Number(ticketCount || 0);
  };

  const processApplePayPayment = async (clientSecret, paymentOrderKey) => {
    try {
      const amount = calculatePayableAmount();
      const { error, paymentIntent } = await confirmPlatformPayPayment(
        clientSecret,
        {
          applePay: {
            merchantCountryCode: 'GB',
            currencyCode: 'GBP',
            cartItems: [{
              label: eventDetail?.title || 'OnDeen booking',
              amount: amount.toFixed(2),
              paymentType: PlatformPay.PaymentType.Immediate,
            }],
          },
        },
      );

      if (error) {
        showToast(`Payment failed: ${error.message}`);
        dispatch(resetApiStatus());
        return null;
      }

      const paymentStatus = String(paymentIntent?.status || '').toLowerCase();
      if (paymentStatus === 'succeeded' || paymentStatus === 'success') {
        return confirmOrderWithServer(paymentOrderKey);
      }

      showToast(`Payment failed (${paymentIntent?.status || 'unknown status'}).`);
      return null;
    } catch (error) {
      showToast(error?.message || 'Something went wrong with Apple Pay');
      return null;
    }
  };

  const handleBooking = async () => {
    if (isFetching) {
      showToast('Please wait...');
      return;
    }

    if (ticketCount < 0) {
      showToast('Minimum one ticket is required');
      return;
    }

    if (dateArray?.length > 0 && !selectedSlot && [3, 4, 9]?.includes(eventDetail?.category_id)) {
      showToast('Please select a time slot');
      return;
    }

    const tickets = Object.entries(multiTicketCount)
      .filter(([_, quantity]) => quantity > 0)
      .map(([id, quantity]) => ({ id: Number(id), quantity }));

    const totalQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, ticketCount);

    if (totalQuantity < 1) {
      showToast('Please select at least one ticket');
      return;
    }

    setIsFetching(true);
    setIsProcessingPayment(true);

    try {
      const payload = {
        event_id: eventId,
        idempotency_key: idempotencyKeyRef.current,
        ...(dateArray?.length > 0 && { date_time_id: selectedSlot }),
        ...(tickets.length > 0 ? { tickets } : { quantity: ticketCount }),
      };

      const res = await eventBookingAPI(payload);

      if (res?.status) {
        const reponsedata = res?.response || {};
        setBookingdetails(res?.response);

        if (eventDetail?.price_type == 0) {
          setIsProcessingPayment(false);
          navigation.navigate('PaymentConfirmationScreen', { data: reponsedata });
          return;
        }

        if (reponsedata?.confirmed) {
          await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
          idempotencyKeyRef.current = paymentAttemptKey();
          navigation.navigate('PaymentConfirmationScreen', {
            data: reponsedata?.booking || reponsedata,
          });
          return;
        }

        if (!reponsedata?.client_secret) {
          showToast('Missing payment credentials');
          return;
        }

        const paymentOrderKey = reponsedata.payment_order_key;
        if (!paymentOrderKey) {
          showToast('Missing payment order reference');
          return;
        }
        await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({
          orderKey: paymentOrderKey,
          eventId,
        }));
        let confirmedOrder = null;

        if (selectedMethod === 'applepay' && applePaySupported) {
          confirmedOrder = await processApplePayPayment(reponsedata.client_secret, paymentOrderKey);
        } else if (selectedMethod === 'gpay' && googlePaySupported) {
          confirmedOrder = await processGooglePayPayment(reponsedata.client_secret, paymentOrderKey);
        } else {
          confirmedOrder = await processCardPayment(reponsedata.client_secret, paymentOrderKey);
        }

        if (confirmedOrder) {
          idempotencyKeyRef.current = paymentAttemptKey();
          navigation.navigate('PaymentConfirmationScreen', { data: confirmedOrder?.booking || confirmedOrder });
        }
      } else {
        showToast(res?.response?.message || 'Booking failed');
      }
    } catch (error) {
      showToast(error.message || 'Booking failed');
    } finally {
      setIsFetching(false);
      setIsProcessingPayment(false);
    }
  };

  if (!eventDetail && !loadFailed) {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  if (!eventDetail && loadFailed) {
    return (
      <SafeAreaView style={{ backgroundColor: '#F9F6FD', flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: '#161616', fontSize: fontScale(18), textAlign: 'center' }}>
          Event could not be loaded.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ alignSelf: 'center', marginTop: 18, paddingHorizontal: 24, paddingVertical: 12 }}
        >
          <Text style={{ color: '#422199', fontSize: fontScale(16) }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ backgroundColor: '#F9F6FD', flex: 1 }}>
      <Modal
        transparent={true}
        animationType="fade"
        visible={isProcessingPayment}
        onRequestClose={() => { }}
        statusBarTranslucent
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ marginTop: 15, fontSize: 16, color: '#fff' }}>
              Processing your request...
            </Text>
          </View>
        </View>
      </Modal>

      <LatestHeader
        statusBarColor="#F9F6FD"
        title="Make Payment"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />

      <ScrollView
        style={{ backgroundColor: '#F9F6FD' }}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={{ paddingHorizontal: widthScale(24), paddingTop: 21 }}>
            <Text style={styles.headingLabel}>
              PLEASE COMPLETE YOUR PURCHASE
            </Text>
          </View>
          <BookingforContainer eventDetail={eventDetail} />
          <SelectTicketsContainer
            eventDetail={eventDetail}
            setTicketCount={setTicketCount}
            setShowCounter={setShowCounter}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            showCounter={showCounter}
            ticketCount={ticketCount}
          />
          <SelectDateSLOTContainer
            eventDetail={eventDetail}
            dateArray={dateArray}
            handleDateSelect={handleDateSelect}
            setSelectedSlot={setSelectedSlot}
            slotData={slotData}
            selectedSlot={selectedSlot}
            selectedDate={selectedDate}
          />

          <AddYourTicketsContainer eventDetail={eventDetail}
            handleMultiIncrease={handleMultiIncrease}
            handleMultiDecrease={handleMultiDecrease}
            multiTicketCount={multiTicketCount}
          />

          <PaymentMethodContainer
            eventDetail={eventDetail}
            handleSelect={handleSelect}
            selectedMethod={selectedMethod}
            googlePaySupported={googlePaySupported}
            applePaySupported={applePaySupported}
          />

          <View style={{ flex: 1, }}>
            <View style={styles.lastContainer}>
              <View style={styles.gradientTextContainer}>
                {eventDetail?.price_type == 0 ? <></> : (
                  <>
                    <Text style={styles.priceLastText}>You Pay</Text>
                    <Text style={styles.priceText}>
                      {eventDetail?.tickets?.length > 0
                        ? (() => {
                          let totalPrice = 0;
                          eventDetail?.tickets?.forEach(ticket => {
                            const quantity = multiTicketCount[ticket?.id] || 0;
                            totalPrice += ticket?.price * quantity;
                          });

                          return totalPrice > 0 ? (
                            <Text style={styles.priceText}>
                              £ {new Intl.NumberFormat('en-GB').format(totalPrice)} Only
                            </Text>
                          ) : (
                            <Text style={styles.priceText}>Select tickets</Text>
                          );
                        })()
                        : isNaN(price)
                          ? 'Invalid Price'
                          : `£ ${new Intl.NumberFormat('en-GB').format(
                            eventDetail?.price * ticketCount,
                          )} Only`}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
        <Toast message={toastMessage} />
      </ScrollView>
      <View style={[styles.bottombook, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.lastContainer]}>
          {selectedMethod === 'applepay' && applePaySupported && eventDetail?.price_type != 0 ? (
            <PlatformPayButton
              appearance={PlatformPay.ButtonStyle.Black}
              disabled={isFetching || isProcessingPayment}
              onPress={handleBooking}
              style={styles.bookBtnContainer}
              type={PlatformPay.ButtonType.Book}
            />
          ) : (
            <GradientButton
              containerStyle={[styles.bookBtnContainer, {}]}
              onPress={handleBooking}
              title={eventDetail?.price_type == 0 ? 'BOOK NOW' : 'BOOK TICKETS'}
              colors={['#DB3171', '#FFCC33']}
              start={{ x: 0.9, y: 0 }}
              end={{ x: 0.1, y: 1 }}
              textStyle={[styles.gradientText, { paddingHorizontal: 10 }]}
            />
          )}
        </View>
      </View>
    </ContainerComponent>
  );
};

export default PaymentScreen;
