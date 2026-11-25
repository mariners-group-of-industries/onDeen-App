import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { ArrowLeft, Bell, Lock, Settings, Star, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import { skipSessionFeedbackAPI, submitSessionFeedbackAPI } from '../../redux/callapis/CommonService';
import { useToastForPopup } from '../../context/ToastContext';
import { sampleGamificationSummary } from '../GamificationSummary/sampleSummary';

const MAX_NOTE_LENGTH = 500;
const GREAT_POINTS = [
  'Speaker clarity',
  'Knowledge shared',
  'Hospitality',
  'Brotherhood',
  'Well organised',
  'Venue',
  'Punctuality',
  'Learnt a lot',
];

const RatingStars = ({ value, onChange, title }) => (
  <View style={styles.starRow}>
    {Array.from({ length: 5 }, (_, index) => {
      const rating = index + 1;
      const selected = rating <= value;
      return (
        <Pressable
          accessibilityLabel={`${title}: ${rating} stars`}
          accessibilityRole="button"
          key={rating}
          onPress={() => onChange(rating)}
          hitSlop={10}
          style={styles.starButton}
        >
          <Star
            size={40}
            color={selected ? '#FFC94B' : '#CBC3D3'}
            fill={selected ? '#FFC94B' : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
      );
    })}
  </View>
);

const RatingCard = ({ title, value, onChange }) => (
  <View style={styles.ratingCard}>
    <Text style={styles.ratingTitle}>{title}</Text>
    <RatingStars title={title} value={value} onChange={onChange} />
  </View>
);

const Chip = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    style={[styles.chip, selected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

const RecommendationButton = ({ selected, icon: Icon, label, onPress }) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    hitSlop={10}
    style={[styles.recommendButton, selected && styles.recommendButtonSelected]}
  >
    <Icon
      size={18}
      color={selected ? '#4B2A8C' : '#7A7583'}
      fill={selected ? '#4B2A8C' : 'transparent'}
      strokeWidth={2.2}
    />
    <Text style={[styles.recommendText, selected && styles.recommendTextSelected]}>{label}</Text>
  </Pressable>
);

const SessionFeedback = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const showToast = useToastForPopup();
  const summary = route?.params?.summary || sampleGamificationSummary;
  const previewOnly = Boolean(route?.params?.previewOnly);
  const [engagementRating, setEngagementRating] = useState(previewOnly ? 4 : 0);
  const [deliveryRating, setDeliveryRating] = useState(previewOnly ? 4 : 0);
  const [selectedHighlights, setSelectedHighlights] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const eventTitle = useMemo(
    () => summary?.event?.title || 'Completed session',
    [summary],
  );

  const canSubmit = previewOnly
    ? true
    : engagementRating > 0 && deliveryRating > 0;

  const finish = () => {
    if (previewOnly && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (Platform.OS === 'ios' && summary?.id) {
      navigation.navigate('MainNavigator', {
        screen: 'Profile',
        params: {
          screen: 'ProfileScreen',
          params: { refreshProfileAt: Date.now() },
        },
      });
      return;
    }

    navigation.navigate('MainNavigator');
  };

  const openNotifications = () => {
    navigation.navigate('Notification');
  };

  const openSettings = () => {
    navigation.navigate('ProfileSettings');
  };

  const notify = (message) => {
    if (showToast) {
      showToast(message);
    }
  };

  const toggleHighlight = (label) => {
    setSelectedHighlights((current) => (
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    ));
  };

  const handleSubmit = async () => {
    if (!previewOnly) {
      if (!engagementRating || !deliveryRating) {
        notify('Please rate both questions.');
        return;
      }

      if (!summary?.id) {
        notify('Session summary not found.');
        return;
      }
    }

    if (previewOnly) {
      notify('Preview feedback submitted.');
      finish();
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitSessionFeedbackAPI({
        summary_id: summary.id,
        engagement_rating: engagementRating,
        delivery_rating: deliveryRating,
        recommendation,
        great_points: selectedHighlights,
        suggestion,
      });

      if (response?.status) {
        notify(response?.response?.message || 'Feedback recorded.');
        finish();
      } else {
        notify(response?.response?.message || response?.message || 'Unable to submit feedback.');
      }
    } catch (error) {
      notify('Unable to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (previewOnly) {
      finish();
      return;
    }

    if (!summary?.id) {
      finish();
      return;
    }

    try {
      setSubmitting(true);
      await skipSessionFeedbackAPI({ summary_id: summary.id });
      finish();
    } catch (error) {
      notify('Unable to skip feedback.');
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
          <Pressable style={styles.headerIcon} onPress={finish} hitSlop={12}>
            <ArrowLeft size={27} color="#340B75" strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.headerTitle}>Session Complete</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIcon} onPress={openNotifications} hitSlop={12}>
              <Bell size={22} color="#7A7583" strokeWidth={2.1} />
            </Pressable>
            <Pressable style={styles.headerIcon} onPress={openSettings} hitSlop={12}>
              <Settings size={22} color="#7A7583" strokeWidth={2.1} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.anonymousWrap}>
            <View style={styles.anonymousPill}>
              <Lock size={14} color="#4B2A8C" strokeWidth={2.4} />
              <Text style={styles.anonymousText}>Anonymous</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>How was the session?</Text>
            <Text style={styles.subtitle} numberOfLines={2}>{eventTitle}</Text>
          </View>

          <View style={styles.ratingStack}>
            <RatingCard
              title="The session was engaging"
              value={engagementRating}
              onChange={setEngagementRating}
            />
            <RatingCard
              title="The delivery of the topic was good"
              value={deliveryRating}
              onChange={setDeliveryRating}
            />
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>What was great? · Optional</Text>
            <View style={styles.chipWrap}>
              {GREAT_POINTS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  selected={selectedHighlights.includes(label)}
                  onPress={() => toggleHighlight(label)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Would you recommend it?</Text>
            <View style={styles.recommendGrid}>
              <RecommendationButton
                selected={recommendation === true}
                icon={ThumbsUp}
                label="Yes, recommend"
                onPress={() => setRecommendation(true)}
              />
              <RecommendationButton
                selected={recommendation === false}
                icon={ThumbsDown}
                label="Not really"
                onPress={() => setRecommendation(false)}
              />
            </View>
          </View>

          <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>Add a note · Optional</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={suggestion}
                onChangeText={(text) => setSuggestion(text.slice(0, MAX_NOTE_LENGTH))}
                placeholder="What made it special? Your words help others."
                placeholderTextColor="#7A7583"
                multiline
                maxLength={MAX_NOTE_LENGTH}
                style={styles.input}
                textAlignVertical="top"
              />
              <Text style={styles.publicNote}>Reviews are public and show your first name</Text>
              <Text style={styles.counter}>{suggestion.length}/{MAX_NOTE_LENGTH}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable onPress={handleSubmit} disabled={submitting || !canSubmit} style={styles.footerButton}>
            <LinearGradient
              colors={['#FFC94B', '#FF7A4A', '#E8418F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, (submitting || !canSubmit) && styles.disabledButton]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit Feedback</Text>
              )}
            </LinearGradient>
          </Pressable>
          <Pressable onPress={handleSkip} disabled={submitting} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <Text style={styles.footerNote}>Reviews are public and show your first name</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F3F9',
  },
  keyboard: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F5F3F9',
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
    width: 96,
  },
  headerTitle: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 22,
    lineHeight: 28,
    left: 0,
    position: 'absolute',
    textAlign: 'center',
    right: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: 24,
    maxWidth: 430,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  anonymousWrap: {
    alignItems: 'center',
  },
  anonymousPill: {
    alignItems: 'center',
    backgroundColor: '#F0EDF8',
    borderColor: '#4B2A8C',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  anonymousText: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 5,
  },
  title: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  ratingStack: {
    gap: 12,
  },
  ratingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#120A1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  ratingTitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionLabel: {
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DBF0',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: '#F0EDF8',
    borderColor: '#4B2A8C',
  },
  chipText: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  chipTextSelected: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
  },
  recommendGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DBF0',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
  },
  recommendButtonSelected: {
    backgroundColor: '#F0EDF8',
    borderColor: '#4B2A8C',
  },
  recommendText: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  recommendTextSelected: {
    color: '#4B2A8C',
  },
  noteBlock: {
    gap: 8,
  },
  noteLabel: {
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0DBF0',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 160,
    position: 'relative',
  },
  input: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
    minHeight: 110,
    paddingBottom: 42,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  publicNote: {
    bottom: 11,
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    left: 16,
    position: 'absolute',
    right: 64,
  },
  counter: {
    bottom: 11,
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    position: 'absolute',
    right: 16,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#F5F3F9',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerButton: {
    width: '100%',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 15,
  },
  skipText: {
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
  },
  footerNote: {
    color: '#7A7583',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default SessionFeedback;
