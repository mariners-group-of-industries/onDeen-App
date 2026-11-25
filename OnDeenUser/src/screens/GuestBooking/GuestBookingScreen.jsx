import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Info, Mail, Phone, ShieldCheck, Ticket, UserRound } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import Toast from '../../components/toastMessage';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import { guestBookingAPI, PaymentStatusUpdate, publicEventbyIdAPI } from '../../redux/callapis/CommonService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITS_LIVE } from '../../helpers/Constant';

const PENDING_GUEST_PAYMENT_KEY = 'ondeen.pendingGuestPaymentOrder';
const guestPaymentAttemptKey = () => `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const sampleEvent = {
  id: 1,
  title: 'Seed: Friday Community Iftar',
  category_id: 1,
  event_type: 1,
  occusr_type: 1,
  total_no_class: 1,
  price_type: 0,
  price: 0,
  start_date: '2026-05-30',
  start_time: '18:00:00',
  location: 'London Islamic Centre',
  images: [{ full_screen_image: require('../../assets/images/eventDetails.png') }],
};

const getEventImageSource = eventDetail => {
  const image = eventDetail?.images?.[0]?.full_screen_image || eventDetail?.image;
  if (!image) {
    return require('../../assets/images/eventDetails.png');
  }
  return typeof image === 'number' ? image : { uri: image };
};

const isGuestBlockedForEvent = eventDetail => {
  if (!eventDetail?.id) {
    return false;
  }

  return (
    Number(eventDetail?.category_id || 0) === 2 ||
    Number(eventDetail?.event_type || 0) === 2 ||
    Number(eventDetail?.total_no_class || 0) > 1 ||
    Number(eventDetail?.occusr_type || 0) !== 1
  );
};

const formatDate = value => {
  if (!value) {
    return 'Date to be confirmed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = eventDetail => {
  if (Number(eventDetail?.price_type || 0) === 0) {
    return 'Free';
  }
  const price = Number(eventDetail?.price || 0);
  return price > 0 ? `£ ${price.toFixed(2)}` : 'Paid';
};

const GuestBookingScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const routeEvent = route?.params?.eventDetail || route?.params?.event || null;
  const previewOnly = Boolean(route?.params?.previewOnly);
  const eventId = route?.params?.eventId || routeEvent?.id;
  const [eventDetail, setEventDetail] = useState(routeEvent || (previewOnly ? sampleEvent : null));
  const [loading, setLoading] = useState(!routeEvent && !previewOnly && Boolean(eventId));
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const submitLockRef = useRef(false);
  const idempotencyKeyRef = useRef(guestPaymentAttemptKey());
  const [form, setForm] = useState({
    first_name: previewOnly ? 'Guest' : '',
    last_name: previewOnly ? 'Tester' : '',
    email_id: previewOnly ? 'guest@gmail.com' : '',
    country_code: '+44',
    mobile_number: previewOnly ? '677889900' : '',
  });

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      if (!eventId || routeEvent || previewOnly) {
        return;
      }

      try {
        setLoading(true);
        const res = await publicEventbyIdAPI(eventId);
        if (mounted) {
          setEventDetail(res?.response?.id ? res.response : null);
        }
      } catch (error) {
        if (mounted) {
          setEventDetail(null);
          setToastMessage('Unable to load this event');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [eventId, previewOnly, routeEvent]);

  useEffect(() => {
    let mounted = true;
    const recoverGuestPayment = async () => {
      try {
        const raw = await AsyncStorage.getItem(PENDING_GUEST_PAYMENT_KEY);
        const pending = raw ? JSON.parse(raw) : null;
        if (!pending?.orderKey || String(pending.eventId) !== String(eventId)) {
          return;
        }
        const response = await PaymentStatusUpdate({
          payment_order_key: pending.orderKey,
          recovery_token: pending.recoveryToken,
        });
        const result = response?.response || response;
        if (mounted && result?.confirmed) {
          await AsyncStorage.removeItem(PENDING_GUEST_PAYMENT_KEY);
          navigation.navigate('PaymentConfirmationScreen', {
            data: result?.booking || result,
            eventDetail,
          });
        } else if (result?.status === 'payment_failed') {
          await AsyncStorage.removeItem(PENDING_GUEST_PAYMENT_KEY);
          idempotencyKeyRef.current = guestPaymentAttemptKey();
        }
      } catch (_error) {
        // Recovery remains available on the next visit.
      }
    };
    if (eventId) {
      recoverGuestPayment();
    }
    return () => { mounted = false; };
  }, [eventDetail, eventId, navigation]);

  const blockedReason = useMemo(() => {
    if (isGuestBlockedForEvent(eventDetail)) {
      return 'Guest booking is available for one-off events only. Please sign in for courses.';
    }
    return '';
  }, [eventDetail]);

  const paidNotice = Number(eventDetail?.price_type || 0) === 1
    ? 'Paid guest tickets continue to secure checkout before confirmation.'
    : '';

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const signInInstead = () => {
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    dispatch(logout());
  };

  const processGuestPayment = async bookingData => {
    const paymentOrderKey = bookingData?.payment_order_key;

    if (!bookingData?.client_secret || !paymentOrderKey || !bookingData?.recovery_token) {
      setToastMessage('Missing payment credentials');
      return null;
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: bookingData.client_secret,
      merchantDisplayName: 'OnDeen',
      applePay: Platform.OS === 'ios' ? { merchantCountryCode: 'GB' } : undefined,
      // Guests can pay with Google Pay too; the sheet hides it on unsupported devices.
      googlePay:
        Platform.OS === 'android'
          ? { merchantCountryCode: 'GB', currencyCode: 'GBP', testEnv: !ITS_LIVE }
          : undefined,
      returnURL: 'ondeen://stripe-redirect',
    });

    if (initError) {
      setToastMessage(initError.message || 'Failed to initialize payment');
      return null;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      const error = presentError;
      setToastMessage(error?.message || 'Payment failed');
      return null;
    }

    // Confirm server-side so the native client never decides payment status.
    const response = await PaymentStatusUpdate({
      payment_order_key: paymentOrderKey,
      recovery_token: bookingData.recovery_token,
    });
    const result = response?.response || response;
    if (result?.confirmed) {
      await AsyncStorage.removeItem(PENDING_GUEST_PAYMENT_KEY);
      return result;
    }
    setToastMessage('Payment is still being confirmed. Please try again in a moment.');
    return null;
  };

  const submitGuestBooking = async () => {
    if (submitting || submitLockRef.current) {
      return;
    }

    if (!eventDetail?.id) {
      setToastMessage('Event unavailable');
      return;
    }

    if (isGuestBlockedForEvent(eventDetail)) {
      setToastMessage('Guest booking is available for one-off events only');
      return;
    }

    if (!form.first_name.trim() || !form.email_id.trim() || !form.mobile_number.trim()) {
      setToastMessage('Name, email and mobile are required');
      return;
    }

    submitLockRef.current = true;
    if (previewOnly) {
      setSuccess({
        title: 'Guest ticket ready',
        subtitle: 'Preview ticket created with local test data.',
      });
      submitLockRef.current = false;
      return;
    }

    try {
      setSubmitting(true);
      const selectedTicket = eventDetail?.tickets?.find(ticket => (
        Number(ticket?.status ?? 1) === 1
        && Number(ticket?.available || 0) - Number(ticket?.booked || 0) > 0
      ));
      if (Number(eventDetail?.ticket_type || 0) === 1 && !selectedTicket) {
        setToastMessage('No guest tickets are currently available');
        return;
      }
      const res = await guestBookingAPI({
        event_id: eventDetail.id,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email_id: form.email_id.trim(),
        country_code: form.country_code.trim() || '+44',
        mobile_number: form.mobile_number.trim(),
        quantity: 1,
        ...(selectedTicket ? { tickets: [{ id: selectedTicket.id, quantity: 1 }] } : {}),
        idempotency_key: idempotencyKeyRef.current,
      });

      if (!res?.status) {
        setToastMessage(res?.response?.message || 'Guest booking failed');
        return;
      }

      const bookingData = res.response;
      let confirmationData = bookingData;
      if (bookingData?.client_secret) {
        await AsyncStorage.setItem(PENDING_GUEST_PAYMENT_KEY, JSON.stringify({
          orderKey: bookingData.payment_order_key,
          recoveryToken: bookingData.recovery_token,
          eventId: eventDetail.id,
        }));
        confirmationData = await processGuestPayment(bookingData);
        if (!confirmationData) {
          return;
        }
        idempotencyKeyRef.current = guestPaymentAttemptKey();
      }

      navigation.navigate('PaymentConfirmationScreen', {
        data: confirmationData?.booking || confirmationData,
        // Guest sessions have no bearer token. Carry the public event payload
        // so confirmation can render the calendar and venue without trying to
        // call the authenticated participant endpoint.
        eventDetail,
      });
    } catch (error) {
      setToastMessage(error?.message || 'Guest booking failed');
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#4B2A8C" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={12}>
            <ArrowLeft size={27} color="#340B75" strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.headerTitle}>Guest booking</Text>
          <View style={styles.headerIcon} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Image source={getEventImageSource(eventDetail)} style={styles.heroImage} />
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>Fast ticket</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>{eventDetail?.title || 'Event unavailable'}</Text>
              <Text style={styles.heroMeta}>{formatDate(eventDetail?.start_date)} · {formatPrice(eventDetail)}</Text>
            </View>
          </View>

          <View style={styles.notice}>
            <Info size={19} color="#4B2A8C" />
            <Text style={styles.noticeText}>
              Book fast as a guest - no account needed. You will not earn XP or track progress until you create an account.
            </Text>
          </View>

          {blockedReason ? (
            <View style={styles.blockedBox}>
              <ShieldCheck size={22} color="#DB3171" />
              <Text style={styles.blockedText}>{blockedReason}</Text>
            </View>
          ) : null}

          {paidNotice ? (
            <View style={styles.paymentNotice}>
              <Ticket size={21} color="#4B2A8C" />
              <Text style={styles.paymentNoticeText}>{paidNotice}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Your details</Text>
            <InputRow
              accessibilityLabel="Guest first name"
              icon={<UserRound size={21} color="#4B2A8C" />}
              placeholder="First name"
              value={form.first_name}
              onChangeText={value => updateField('first_name', value)}
            />
            <InputRow
              accessibilityLabel="Guest last name"
              icon={<UserRound size={21} color="#4B2A8C" />}
              placeholder="Last name"
              value={form.last_name}
              onChangeText={value => updateField('last_name', value)}
            />
            <InputRow
              accessibilityLabel="Guest email address"
              icon={<Mail size={21} color="#4B2A8C" />}
              placeholder="Email address"
              value={form.email_id}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={value => updateField('email_id', value)}
            />
            <View style={styles.phoneRow}>
              <View style={styles.countryInput}>
                <Phone size={19} color="#4B2A8C" />
                <TextInput
                  accessibilityLabel="Guest country code"
                  value={form.country_code}
                  onChangeText={value => updateField('country_code', value)}
                  style={styles.countryTextInput}
                  placeholder="+44"
                  placeholderTextColor="#9B93A6"
                  keyboardType="phone-pad"
                />
              </View>
              <TextInput
                accessibilityLabel="Guest mobile number"
                value={form.mobile_number}
                onChangeText={value => updateField('mobile_number', value)}
                style={styles.mobileInput}
                placeholder="Mobile number"
                placeholderTextColor="#9B93A6"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {success ? (
            <View style={styles.successBox}>
              <Ticket size={22} color="#4B2A8C" />
              <View style={styles.successCopy}>
                <Text style={styles.successTitle}>{success.title}</Text>
                <Text style={styles.successText}>{success.subtitle}</Text>
              </View>
            </View>
          ) : null}

          <Pressable style={styles.signInButton} onPress={signInInstead}>
            <Text style={styles.signInText}>Sign in or create an account instead</Text>
          </Pressable>
        </ScrollView>

      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable
          accessible
          accessibilityLabel="CONTINUE AS GUEST"
          accessibilityRole="button"
          disabled={submitting || isGuestBlockedForEvent(eventDetail)}
          onPress={submitGuestBooking}
          style={styles.primaryButton}>
          <LinearGradient
            pointerEvents="none"
            colors={submitting || isGuestBlockedForEvent(eventDetail) ? ['#D9D4E2', '#D9D4E2'] : ['#DB3171', '#FFCC33']}
            start={{ x: 0.9, y: 0 }}
            end={{ x: 0.1, y: 1 }}
            style={styles.primaryButtonGradient}>
            <Text pointerEvents="none" style={styles.primaryButtonText}>{submitting ? 'PLEASE WAIT' : 'CONTINUE AS GUEST'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <Toast message={toastMessage} />
    </SafeAreaView>
  );
};

const InputRow = ({ icon, ...props }) => (
  <View style={styles.inputRow}>
    {icon}
    <TextInput
      {...props}
      style={styles.textInput}
      placeholderTextColor="#9B93A6"
    />
  </View>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    backgroundColor: '#F7F4FA',
    flex: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerIcon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 22,
  },
  content: {
    gap: 16,
    padding: 20,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E9DFEE',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  heroImage: {
    backgroundColor: '#EFEAF4',
    borderRadius: 17,
    height: 104,
    width: 96,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 7,
  },
  kicker: {
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 13,
  },
  heroTitle: {
    color: '#19111F',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 22,
    lineHeight: 27,
  },
  heroMeta: {
    color: '#6F6578',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E4',
    borderColor: '#F6E3A5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  noticeText: {
    color: '#4E4559',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  blockedBox: {
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderColor: '#F5C7D6',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  blockedText: {
    color: '#873050',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  paymentNotice: {
    alignItems: 'center',
    backgroundColor: '#F1ECFA',
    borderColor: '#DDD1EF',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  paymentNoticeText: {
    color: '#4B2A8C',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E9DFEE',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#19111F',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 20,
    marginBottom: 4,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: '#F7F4FA',
    borderColor: '#E5DCEB',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  textInput: {
    color: '#1D1624',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    minHeight: 52,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryInput: {
    alignItems: 'center',
    backgroundColor: '#F7F4FA',
    borderColor: '#E5DCEB',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 58,
    paddingHorizontal: 12,
    width: 114,
  },
  countryTextInput: {
    color: '#1D1624',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    minHeight: 52,
  },
  mobileInput: {
    backgroundColor: '#F7F4FA',
    borderColor: '#E5DCEB',
    borderRadius: 16,
    borderWidth: 1,
    color: '#1D1624',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#EEF9F1',
    borderColor: '#BCE7C5',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  successCopy: {
    flex: 1,
    gap: 3,
  },
  successTitle: {
    color: '#173D25',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 15,
  },
  successText: {
    color: '#4B5F51',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  signInText: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 15,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEE7F2',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    alignItems: 'center',
    borderRadius: 30,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 16,
  },
});

export default GuestBookingScreen;
