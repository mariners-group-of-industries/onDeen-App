import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, KeyRound, RefreshCw, TicketCheck } from 'lucide-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import { imcfetchBookingList, onlineCheckInAPI } from '../../redux/callapis/CommonService';
import { useToastForPopup } from '../../context/ToastContext';

const normalizeBookings = (response) => (Array.isArray(response?.response) ? response.response : []);
const CHECK_IN_CODE_ACCESSORY_ID = 'online-check-in-code-accessory';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const OnlineCheckInCode = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const showToast = useToastForPopup();
  const debugAllowFuture = Boolean(route?.params?.debugAllowFuture);
  const routeTicketId = route?.params?.ticket_id || route?.params?.participant_id;
  const routeEventId = route?.params?.event_id;
  const routeEventTitle = route?.params?.eventTitle;
  const [code, setCode] = useState(debugAllowFuture ? '123456' : '');
  const [booking, setBooking] = useState(
    routeTicketId
      ? {
        participant_id: routeTicketId,
        id: routeEventId,
        title: routeEventTitle || 'Selected online session',
      }
      : null,
  );
  const [loadingBooking, setLoadingBooking] = useState(!routeTicketId);
  const [submitting, setSubmitting] = useState(false);
  const [inlineMessage, setInlineMessage] = useState('');

  const headerCopy = debugAllowFuture
    ? 'Uses the seeded test code and allows the next booked online event, even if it is in the future.'
    : 'Enter the code shared by the organiser during the online session.';

  const selectedDate = useMemo(() => formatDate(booking?.start_date || booking?.ticket_date), [booking]);

  const notify = (message) => {
    if (showToast) {
      showToast(message);
    }
  };

  const fetchFirstOnlineBooking = async () => {
    try {
      setLoadingBooking(true);
      const [upcomingRes, activeRes] = await Promise.all([
        imcfetchBookingList({ data: { type: 1 } }),
        imcfetchBookingList({ data: { type: 2 } }),
      ]);
      const allBookings = [
        ...normalizeBookings(upcomingRes),
        ...normalizeBookings(activeRes),
      ];
      const onlineBooking = allBookings.find((item) => [0, 2].includes(Number(item?.location_type)));
      setBooking(onlineBooking || null);
    } catch (error) {
      notify('Unable to load online bookings.');
      setBooking(null);
    } finally {
      setLoadingBooking(false);
    }
  };

  useEffect(() => {
    if (!routeTicketId) {
      fetchFirstOnlineBooking();
    }
  }, [routeTicketId]);

  const handleSubmit = async () => {
    const cleanedCode = code.trim().replace(/\s+/g, '');
    if (!booking?.participant_id) {
      setInlineMessage('No booked online session found.');
      return;
    }
    if (!cleanedCode) {
      setInlineMessage('Enter the online check-in code.');
      return;
    }
    if (cleanedCode.length !== 6) {
      setInlineMessage('Enter the complete 6-digit code.');
      return;
    }

    try {
      setSubmitting(true);
      setInlineMessage('');
      const response = await onlineCheckInAPI({
        ticket_id: booking.participant_id,
        event_id: booking.id,
        code: cleanedCode,
        debug_allow_future: debugAllowFuture,
      });

      if (response?.status) {
        const summary = response?.response?.gamification_summary;
        notify(response?.response?.message || 'Online check-in complete.');
        if (summary) {
          navigation.navigate('GamificationSummary', { summary });
        } else {
          navigation.goBack();
        }
      } else {
        setInlineMessage(response?.response?.message || response?.message || 'Unable to check in.');
      }
    } catch (error) {
      setInlineMessage('Unable to check in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={12}>
            <ArrowLeft size={27} color="#340B75" strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.headerTitle}>Online check-in</Text>
          <Pressable style={styles.headerIcon} onPress={fetchFirstOnlineBooking} hitSlop={12}>
            <RefreshCw size={22} color="#340B75" strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <KeyRound size={32} color="#4B2A8C" strokeWidth={2.4} />
            </View>
            <Text style={styles.heroTitle}>Enter session code</Text>
            <Text style={styles.heroCopy}>{headerCopy}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TicketCheck size={22} color="#DB3171" strokeWidth={2.4} />
              <Text style={styles.cardTitle}>Booked session</Text>
            </View>

            {loadingBooking ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#4B2A8C" />
                <Text style={styles.loadingText}>Finding your online booking...</Text>
              </View>
            ) : booking ? (
              <>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {booking.title || 'Online session'}
                </Text>
                {selectedDate ? <Text style={styles.eventMeta}>{selectedDate}</Text> : null}
              </>
            ) : (
              <Text style={styles.emptyText}>No booked online session is ready for check-in.</Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Check-in code</Text>
            <TextInput
              value={code}
              onChangeText={(value) => {
                setCode(value.replace(/[^0-9]/g, '').slice(0, 6));
                if (inlineMessage) setInlineMessage('');
              }}
              placeholder="123456"
              placeholderTextColor="#A9A2B4"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              inputAccessoryViewID={Platform.OS === 'ios' ? CHECK_IN_CODE_ACCESSORY_ID : undefined}
              selectionColor="#4B2A8C"
              style={[styles.input, styles.codeInput]}
            />
            {inlineMessage ? <Text style={styles.inlineMessage}>{inlineMessage}</Text> : null}
          </View>
        </ScrollView>

        {Platform.OS === 'ios' ? (
          <InputAccessoryView nativeID={CHECK_IN_CODE_ACCESSORY_ID}>
            <View style={styles.keyboardAccessory}>
              <Pressable
                accessibilityLabel="Done entering check-in code"
                accessibilityRole="button"
                hitSlop={10}
                onPress={Keyboard.dismiss}
                style={styles.keyboardDoneButton}
              >
                <Text style={styles.keyboardDoneText}>Done</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        ) : null}

        <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || loadingBooking || !booking}
            style={styles.footerButton}
          >
            <LinearGradient
              colors={['#FFC94B', '#FF7A4A', '#E8418F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, (submitting || loadingBooking || !booking) && styles.disabledButton]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Check in</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#F5F3F9',
    flex: 1,
  },
  keyboard: {
    flex: 1,
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
    gap: 18,
    padding: 20,
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E0E9',
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#F0EDF8',
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  heroTitle: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 27,
    lineHeight: 33,
  },
  heroCopy: {
    color: '#6F6878',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E0E9',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 14,
  },
  eventTitle: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  eventMeta: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    marginTop: 6,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: '#6F6878',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
  },
  emptyText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  inputBlock: {
    gap: 10,
  },
  inputLabel: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8D0E3',
    borderRadius: 18,
    borderWidth: 1,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 28,
    letterSpacing: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#F5F3F9',
    borderTopColor: '#E7E0E9',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  footerButton: {
    borderRadius: 28,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 28,
    height: 58,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  submitText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 17,
  },
  codeInput: {
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 28,
    letterSpacing: 8,
    lineHeight: 34,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  inlineMessage: {
    color: '#9C332A',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  keyboardAccessory: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E7E0E9',
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  keyboardDoneButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  keyboardDoneText: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 17,
  },
});

export default OnlineCheckInCode;
