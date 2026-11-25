import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Flame } from 'lucide-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import XpRing from '../../components/gamification/XpRing';
import { markGamificationSummarySeenAPI } from '../../redux/callapis/CommonService';
import { sampleGamificationSummary } from './sampleSummary';

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

const formatMultiplier = (value) => Number(value || 1).toFixed(2).replace(/\.00$/, '');

const PROGRESS_AXES = [
  {
    key: 'knowledge',
    label: 'Knowledge',
    color: '#FFC94B',
    aliases: ['knowledge', 'ilm', 'quran', 'hadith', 'tafsir', 'fiqh', 'arabic', 'class', 'course'],
  },
  {
    key: 'tazkiyyah',
    label: 'Tazkiyyah',
    color: '#4B2A8C',
    aliases: ['tazkiyyah', 'spiritual', 'worship', 'dhikr', 'retreat', 'purification'],
  },
  {
    key: 'charity',
    label: 'Charity',
    color: '#E6288E',
    aliases: ['charity', 'ummah', 'community', 'volunteer', 'fundraising', 'service'],
  },
  {
    key: 'fitness',
    label: 'Fitness',
    color: '#2ECC71',
    aliases: ['fitness', 'health', 'sport', 'sports', 'wellbeing', 'wellness'],
  },
];

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampPercent = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

const calculateProgressPercent = (totalXp, currentLevelFloorXp, nextLevelXp, fallback = 0) => {
  const floor = numberValue(currentLevelFloorXp, 0);
  const next = numberValue(nextLevelXp, 100);
  const total = numberValue(totalXp, 0);

  if (next <= floor) {
    return numberValue(fallback, 100);
  }

  return Math.max(0, Math.min(100, ((total - floor) / (next - floor)) * 100));
};

const detectAxisIndex = (summary) => {
  const haystack = [
    summary?.event?.category_title,
    summary?.event?.title,
    summary?.event?.journey_level,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return PROGRESS_AXES.findIndex((axis) =>
    axis.aliases.some((alias) => haystack.includes(alias)),
  );
};

const normalizeProgressAxes = (summary) => {
  const source =
    summary?.progress?.axes ||
    summary?.progress_axes ||
    summary?.axis_progress ||
    summary?.radar_progress ||
    summary?.radar?.axes;

  if (Array.isArray(source) && source.length > 0) {
    return PROGRESS_AXES.map((axis, index) => {
      const item = source.find((candidate) => {
        const candidateKey = `${candidate?.key || candidate?.axis || candidate?.label || candidate?.title || ''}`.toLowerCase();
        return candidateKey === axis.key || candidateKey === axis.label.toLowerCase();
      }) || source[index] || {};
      const delta = numberValue(item.delta ?? item.change ?? item.gained ?? item.xp_delta ?? item.xp, 0);
      const value = clampPercent(item.value ?? item.score ?? item.percent ?? item.current ?? (delta > 0 ? delta * 2 : 0));

      return {
        key: axis.key,
        label: item.label || item.title || axis.label,
        color: item.color || axis.color,
        delta,
        value,
      };
    });
  }

  const changedIndex = detectAxisIndex(summary);
  if (changedIndex < 0) {
    return [];
  }

  const earnedXp = numberValue(summary?.xp?.earned, 0);
  const sessionHours = numberValue(summary?.event?.session_hours, 1);
  const delta = Math.max(5, Math.min(35, Math.round(Math.max(earnedXp / 10, sessionHours * 10))));

  return PROGRESS_AXES.map((axis, index) => ({
    key: axis.key,
    label: axis.label,
    color: axis.color,
    delta: index === changedIndex ? delta : 0,
    value: index === changedIndex ? Math.min(100, Math.max(18, delta * 2)) : 0,
  }));
};

const BreakdownRow = ({ label, value, highlighted }) => (
  <View style={[styles.breakdownRow, highlighted && styles.breakdownHighlight]}>
    <Text style={[styles.breakdownLabel, highlighted && styles.breakdownHighlightText]}>{label}</Text>
    <Text style={[styles.breakdownValue, highlighted && styles.breakdownHighlightText]}>{value}</Text>
  </View>
);

const StreakCard = ({ streak }) => {
  const count = Math.max(0, Math.min(8, Number(streak?.count || 0)));
  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <Text style={styles.streakTitle}>Streak · {count} in a row</Text>
        <Text style={styles.streakMeta}>{Math.max(0, 8 - count)} -> Full Flame 2x</Text>
      </View>
      <View style={styles.flameRow}>
        {Array.from({ length: 8 }, (_, index) => {
          const number = index + 1;
          const active = number <= count;
          const current = number === count && count > 0;
          return (
            <View key={number} style={[styles.flameItem, current && styles.currentFlameItem]}>
              <Flame
                size={current ? 32 : 23}
                color={active ? '#FF7A4A' : '#D8D2DD'}
                fill={active ? '#FFC94B' : 'transparent'}
                strokeWidth={2.2}
              />
              <Text style={[styles.flameNumber, current && styles.currentFlameNumber]}>{number}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const ProgressBreakdownCard = ({ axes }) => (
  <View>
    <Text style={styles.progressCardTitle}>YOUR PROGRESS</Text>
    <View style={styles.progressAxisList}>
      {axes.map((axis) => {
        const changed = Number(axis.delta || 0) > 0;
        return (
          <View key={axis.key || axis.label} style={styles.progressAxisBlock}>
            <View style={styles.progressAxisHeader}>
              <Text style={[styles.progressAxisLabel, !changed && styles.progressAxisMuted]}>
                {axis.label}
              </Text>
              <Text style={[styles.progressAxisDelta, !changed && styles.progressAxisDash]}>
                {changed ? `+${axis.delta}` : '–'}
              </Text>
            </View>
            <View style={styles.progressAxisTrack}>
              <View
                style={[
                  styles.progressAxisFill,
                  {
                    backgroundColor: axis.color,
                    width: `${Math.max(changed ? 8 : 0, Math.min(100, axis.value || 0))}%`,
                  },
                  !changed && styles.progressAxisFillMuted,
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  </View>
);

const GamificationSummary = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const summary = route?.params?.summary || sampleGamificationSummary;
  const previewOnly = Boolean(route?.params?.previewOnly);
  const levelUpOccurred = Boolean(summary?.progression?.level_up_occurred);
  const sessionDate = formatDate(summary?.event?.session_date);
  const currentLevelFloorXp = numberValue(summary?.progression?.current_level_floor_xp, 0);
  const nextLevelXp = numberValue(summary?.progression?.next_level_xp, 100);
  const finalTotalXp = numberValue(summary?.xp?.total, 0);
  const earnedXp = numberValue(summary?.xp?.earned, 0);
  const baseXp = numberValue(summary?.xp?.base, 0);
  const difficultyBonusXp = numberValue(summary?.xp?.difficulty_bonus, 0);
  const streakBonusXp = numberValue(summary?.xp?.streak_bonus, 0);
  const milestoneXp = numberValue(summary?.xp?.milestone, 0);
  const previousTotalXp = Number.isFinite(Number(summary?.xp?.previous_total))
    ? Number(summary?.xp?.previous_total)
    : Math.max(0, finalTotalXp - earnedXp);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const flipInFlightRef = useRef(false);
  const [animatedXp, setAnimatedXp] = useState(previousTotalXp);
  const [animatedProgressPercent, setAnimatedProgressPercent] = useState(() =>
    calculateProgressPercent(
      previousTotalXp,
      currentLevelFloorXp,
      nextLevelXp,
      summary?.progression?.progress_percent || 0,
    ),
  );
  const [activeBreakdownRow, setActiveBreakdownRow] = useState(null);
  const [showProgressCard, setShowProgressCard] = useState(false);
  const [flipInteractReady, setFlipInteractReady] = useState(false);
  const progressAxes = useMemo(() => normalizeProgressAxes(summary), [summary]);
  const hasProgressChanges = progressAxes.some((axis) => Number(axis.delta || 0) > 0);
  const flipFrontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const flipBackRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });
  const flipScale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.025, 1],
  });
  const flipTranslateY = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -8, 0],
  });

  const difficultyPercent = useMemo(
    () => Math.round(((summary?.xp?.difficulty_multiplier || 1) - 1) * 100),
    [summary],
  );

  useEffect(() => {
    let cancelled = false;
    const intervals = [];
    const timeouts = [];

    const setAnimatedFrame = (value) => {
      const rounded = Math.round(value);
      setAnimatedXp(rounded);
      setAnimatedProgressPercent(
        calculateProgressPercent(
          rounded,
          currentLevelFloorXp,
          nextLevelXp,
          summary?.progression?.progress_percent || 0,
        ),
      );
    };

    const wait = (duration) =>
      new Promise((resolve) => {
        const timeout = setTimeout(resolve, duration);
        timeouts.push(timeout);
      });

    const animateStep = (from, to, rowKey) =>
      new Promise((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }

        setActiveBreakdownRow(rowKey);

        if (from === to) {
          setAnimatedFrame(to);
          resolve();
          return;
        }

        const duration = 800;
        const startedAt = Date.now();
        const interval = setInterval(() => {
          if (cancelled) {
            clearInterval(interval);
            resolve();
            return;
          }

          const progress = Math.min((Date.now() - startedAt) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setAnimatedFrame(from + (to - from) * easedProgress);

          if (progress >= 1) {
            clearInterval(interval);
            resolve();
          }
        }, 16);
        intervals.push(interval);
      });

    const knownSteps = [
      { key: 'base', amount: baseXp },
      { key: 'difficulty', amount: difficultyBonusXp },
      { key: 'streak', amount: streakBonusXp },
      { key: 'milestone', amount: milestoneXp },
    ].filter((step) => step.amount > 0);
    const steps = knownSteps.length > 0
      ? knownSteps
      : [{ key: null, amount: Math.max(0, finalTotalXp - previousTotalXp) }];

    setAnimatedFrame(previousTotalXp);
    setActiveBreakdownRow(null);
    setShowProgressCard(false);
    setFlipInteractReady(false);
    flipInFlightRef.current = false;
    flipAnimation.setValue(0);

    const runAnimation = async () => {
      await wait(350);
      let cursor = previousTotalXp;

      for (const step of steps) {
        if (cancelled) {
          return;
        }

        setActiveBreakdownRow(step.key);
        await wait(220);

        const next = cursor + step.amount;
        await animateStep(cursor, next, step.key);
        cursor = next;
        await wait(420);
      }

      if (!cancelled) {
        setAnimatedFrame(finalTotalXp);
        setActiveBreakdownRow(null);
      }

      if (hasProgressChanges && !cancelled) {
        await wait(520);
        if (cancelled) {
          return;
        }

        flipInFlightRef.current = true;
        Animated.timing(flipAnimation, {
          duration: 1150,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          toValue: 1,
          useNativeDriver: true,
        }).start(({ finished }) => {
          flipInFlightRef.current = false;
          if (finished && !cancelled) {
            setShowProgressCard(true);
            setFlipInteractReady(true);
          }
        });
      }
    };

    runAnimation();

    return () => {
      cancelled = true;
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      flipAnimation.stopAnimation();
    };
  }, [
    baseXp,
    currentLevelFloorXp,
    difficultyBonusXp,
    finalTotalXp,
    flipAnimation,
    hasProgressChanges,
    milestoneXp,
    nextLevelXp,
    previousTotalXp,
    streakBonusXp,
    summary?.progression?.progress_percent,
  ]);

  const handleCardFlipPress = () => {
    if (!hasProgressChanges || !flipInteractReady || flipInFlightRef.current) {
      return;
    }

    const nextFaceIsProgress = !showProgressCard;
    flipInFlightRef.current = true;
    setFlipInteractReady(false);

    Animated.timing(flipAnimation, {
      duration: 1050,
      easing: Easing.bezier(0.2, 0.85, 0.18, 1),
      toValue: nextFaceIsProgress ? 1 : 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      flipInFlightRef.current = false;
      if (finished) {
        setShowProgressCard(nextFaceIsProgress);
      }
      setFlipInteractReady(true);
    });
  };

  const closeSummary = async () => {
    if (summary?.id) {
      await markGamificationSummarySeenAPI({ summary_id: summary.id });
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainNavigator');
    }
  };

  const continueToFeedback = () => {
    if (levelUpOccurred) {
      navigation.navigate('GamificationLevelUp', {
        summary,
        previewOnly,
      });
      return;
    }

    navigation.navigate('SessionFeedback', {
      summary,
      previewOnly,
    });
  };

  const renderBreakdownContent = () => (
    <>
      <Text style={styles.sectionLabel}>THIS SESSION</Text>
      <BreakdownRow highlighted={activeBreakdownRow === 'base'} label="Base XP" value={baseXp} />
      <BreakdownRow
        highlighted={activeBreakdownRow === 'difficulty'}
        label={difficultyPercent > 0 ? `${summary?.event?.journey_level || 'Difficulty'} bonus (+${difficultyPercent}%)` : 'Difficulty bonus'}
        value={`+${difficultyBonusXp}`}
      />
      <BreakdownRow
        highlighted={activeBreakdownRow === 'streak'}
        label={`Streak bonus (${formatMultiplier(summary?.xp?.streak_multiplier)}x)`}
        value={`+${streakBonusXp}`}
      />
      {milestoneXp ? (
        <BreakdownRow
          highlighted={activeBreakdownRow === 'milestone'}
          label={String(summary?.xp?.type || '').startsWith('course_completion')
            ? 'Course completion bonus & milestone'
            : 'First class milestone'}
          value={`+${milestoneXp}`}
        />
      ) : null}
      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total earned</Text>
        <Text style={styles.totalValue}>+{Number(summary?.xp?.earned || 0).toLocaleString()} XP</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={closeSummary} hitSlop={12}>
          <ArrowLeft size={27} color="#340B75" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.headerTitle}>Session Complete</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 116 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.contextText}>{summary?.event?.title || 'Completed session'}</Text>

        <View style={styles.ringWrap}>
          <XpRing
            totalXp={animatedXp}
            currentLevelFloorXp={currentLevelFloorXp}
            nextLevelXp={nextLevelXp}
            progressPercent={animatedProgressPercent}
            size={180}
            strokeWidth={12}
          />
          <Text style={styles.earnedText}>+{Number(summary?.xp?.earned || 0).toLocaleString()} XP earned</Text>
          <Text style={styles.levelText}>
            <Text style={styles.levelTextStrong}>{summary?.progression?.level_label || 'Seeker 1'}</Text>
            {summary?.progression?.classes_to_next_level
              ? ` · ${summary.progression.classes_to_next_level} sessions to level up`
              : ' · Almost level 2'}
          </Text>
        </View>

        <StreakCard streak={summary?.streak} />

        {hasProgressChanges ? (
          <Pressable
            accessibilityLabel={showProgressCard ? 'Show session XP breakdown' : 'Show progress changes'}
            accessibilityRole="button"
            disabled={!flipInteractReady}
            onPress={handleCardFlipPress}
            style={[styles.flipPressable, milestoneXp ? styles.flipPressableTall : null]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.breakdownCard,
                styles.flipFace,
                {
                  transform: [
                    { perspective: 1400 },
                    { translateY: flipTranslateY },
                    { scale: flipScale },
                    { rotateY: flipFrontRotateY },
                  ],
                },
              ]}
            >
              {renderBreakdownContent()}
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.breakdownCard,
                styles.flipFace,
                {
                  transform: [
                    { perspective: 1400 },
                    { translateY: flipTranslateY },
                    { scale: flipScale },
                    { rotateY: flipBackRotateY },
                  ],
                },
              ]}
            >
              <ProgressBreakdownCard axes={progressAxes} />
            </Animated.View>
          </Pressable>
        ) : (
          <View style={[styles.breakdownCard, styles.breakdownCardSpacing]}>
            {renderBreakdownContent()}
          </View>
        )}

        {sessionDate ? <Text style={styles.dateText}>{sessionDate}</Text> : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 18 }]}>
        <Pressable onPress={continueToFeedback}>
          <LinearGradient
            colors={['#FFC94B', '#FF7A4A', '#E8418F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </LinearGradient>
        </Pressable>
      </View>
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
    backgroundColor: '#FEF7FF',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTitle: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 25,
    lineHeight: 31,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  contextText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  ringWrap: {
    alignItems: 'center',
    marginTop: 26,
  },
  earnedText: {
    color: '#2ECC71',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 22,
  },
  levelText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  levelTextStrong: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  streakCard: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFD8A8',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 34,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  streakHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakTitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  streakMeta: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  flameRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingHorizontal: 4,
  },
  flameItem: {
    alignItems: 'center',
    gap: 5,
    minHeight: 48,
    minWidth: 30,
  },
  currentFlameItem: {
    transform: [{ translateY: -4 }],
  },
  flameNumber: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 11,
    lineHeight: 15,
  },
  currentFlameNumber: {
    color: '#1A1A1A',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minHeight: 268,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  breakdownCardSpacing: {
    marginTop: 26,
  },
  flipPressable: {
    marginTop: 26,
    minHeight: 268,
  },
  flipPressableTall: {
    minHeight: 314,
  },
  flipFace: {
    backfaceVisibility: 'hidden',
    bottom: 0,
    elevation: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    top: 0,
  },
  sectionLabel: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressCardTitle: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 12,
    letterSpacing: 2.4,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressAxisList: {
    gap: 13,
  },
  progressAxisBlock: {
    gap: 7,
  },
  progressAxisHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressAxisLabel: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 16,
    lineHeight: 22,
  },
  progressAxisMuted: {
    color: '#9A9AA1',
  },
  progressAxisDelta: {
    color: '#58C979',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 16,
    lineHeight: 22,
  },
  progressAxisDash: {
    color: '#A9A69F',
  },
  progressAxisTrack: {
    backgroundColor: '#F0ECF4',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressAxisFill: {
    borderRadius: 999,
    height: 8,
  },
  progressAxisFillMuted: {
    opacity: 0.35,
  },
  breakdownRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: 8,
  },
  breakdownHighlight: {
    backgroundColor: '#F2ECF5',
  },
  breakdownLabel: {
    color: '#1A1A1A',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    lineHeight: 22,
    paddingRight: 12,
  },
  breakdownValue: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    lineHeight: 22,
  },
  breakdownHighlightText: {
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  divider: {
    backgroundColor: '#DED8E1',
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  totalLabel: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 17,
    lineHeight: 24,
  },
  totalValue: {
    color: '#2ECC71',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 17,
    lineHeight: 24,
  },
  dateText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#F5F3F9',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 21,
    lineHeight: 27,
  },
});

export default GamificationSummary;
