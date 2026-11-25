import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, KeyRound, MessageSquare, Trophy } from 'lucide-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import { sampleGamificationSummary } from '../GamificationSummary/sampleSummary';
import { debugCompleteBookingAPI } from '../../redux/callapis/CommonService';
import { useToastForPopup } from '../../context/ToastContext';

const PreviewRow = ({ icon, title, subtitle, onPress, disabled, loading }) => (
  <Pressable style={[styles.row, disabled && styles.disabledRow]} onPress={onPress} disabled={disabled}>
    <View style={styles.iconWrap}>{icon}</View>
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    {loading ? <ActivityIndicator color="#4B2A8C" /> : null}
  </Pressable>
);

const P0DebugScreens = ({ navigation }) => {
  const [markingComplete, setMarkingComplete] = React.useState(false);
  const showToast = useToastForPopup();

  const notify = (message) => {
    if (showToast) {
      showToast(message);
    }
  };

  const openSummary = () => {
    navigation.navigate('GamificationSummary', {
      summary: sampleGamificationSummary,
      previewOnly: true,
    });
  };

  const openFeedback = () => {
    navigation.navigate('SessionFeedback', {
      summary: sampleGamificationSummary,
      previewOnly: true,
    });
  };

  const markBookedSessionComplete = async () => {
    try {
      setMarkingComplete(true);
      const response = await debugCompleteBookingAPI({});
      if (response?.status) {
        const summary = response?.response?.gamification_summary;
        notify(response?.response?.message || 'Booked session marked complete.');
        if (summary) {
          navigation.navigate('GamificationSummary', { summary });
        }
      } else {
        notify(response?.response?.message || response?.message || 'No booked session could be completed.');
      }
    } catch (error) {
      notify('Unable to mark booked session complete.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const openOnlineCheckIn = () => {
    navigation.navigate('OnlineCheckInCode', { debugAllowFuture: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={12}>
          <ArrowLeft size={27} color="#340B75" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.headerTitle}>Debug stuff</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Testing screens</Text>
        <Text style={styles.body}>
          Open any in-progress screen with local test data.
        </Text>

        <PreviewRow
          icon={<Trophy size={24} color="#4B2A8C" />}
          title="Session complete"
          subtitle="XP, level, tier and streak summary"
          onPress={openSummary}
        />
        <PreviewRow
          icon={<MessageSquare size={24} color="#4B2A8C" />}
          title="Session feedback"
          subtitle="Anonymous two-question feedback form"
          onPress={openFeedback}
        />
        <PreviewRow
          icon={<CheckCircle2 size={24} color="#4B2A8C" />}
          title="Mark booked session complete"
          subtitle="Completes your next booked session and opens XP, then feedback"
          onPress={markBookedSessionComplete}
          disabled={markingComplete}
          loading={markingComplete}
        />
        <PreviewRow
          icon={<KeyRound size={24} color="#4B2A8C" />}
          title="Online check-in code"
          subtitle="Test A4 with your next booked online event and code 123456"
          onPress={openOnlineCheckIn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#F5F3F9',
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
    gap: 14,
    padding: 20,
  },
  heading: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 24,
  },
  body: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E0E9',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  disabledRow: {
    opacity: 0.55,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#F0EDF8',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 16,
  },
  rowSubtitle: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default P0DebugScreens;
