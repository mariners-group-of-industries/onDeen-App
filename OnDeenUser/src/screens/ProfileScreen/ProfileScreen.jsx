import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Platform,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTimeZone } from 'react-native-localize';
import Svg, {
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Polygon,
  Stop,
} from 'react-native-svg';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Flame,
  Info,
  Moon,
  Radar,
  Scale,
  Settings,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import GuestModal from '../../modals/guestModal';
import Loader from '../../components/loader';
import {
  getPendingGamificationSummaryAPI,
  getSelfProfileAPI,
  getUserProfileAPI,
} from '../../redux/callapis/CommonService';
import { clearLastEventId } from '../../helpers/storage';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import { useStatusBar } from '../../components/statusbar';
import { fontFamilies } from '../../assets/fonts/fonts';
import { BASE_URL } from '../../helpers/Constant';

const COLORS = {
  bgApp: '#F5F3F9',
  surface: '#FEF7FF',
  card: '#FFFFFF',
  primary: '#340B75',
  rank: '#4B2A8C',
  muted: '#7A7A7A',
  text: '#1A1A1A',
  xpTrack: '#EFEBF5',
  pink: '#E6288E',
  gold: '#FFC94B',
  orange: '#FF7A4A',
  green: '#2ECC71',
  radarQuiet: '#8A8A8A',
  radarBuilding: '#D08A00',
  radarStrong: '#2E9B58',
};

const RADAR_AXES = [
  { label: 'Knowledge', color: COLORS.gold },
  { label: 'Fitness', color: COLORS.green },
  { label: 'Community', color: COLORS.pink },
  { label: 'Tazkiyyah', color: COLORS.rank },
];

const CERTIFICATES = [
  { title: 'Tafsīr', icon: BookOpen, bg: '#FFFAF0', border: '#FFF0D0', tint: COLORS.gold },
  { title: 'Fiqh', icon: Scale, bg: '#F0EDF8', border: '#E0DBF0', tint: COLORS.rank },
  { title: 'Ramadan', icon: Moon, bg: '#FFF0F5', border: '#FFE0EB', tint: COLORS.pink },
];

const extractProfilePayload = (payload) => {
  const response = payload?.response || payload?.data || payload?.profile;

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return null;
  }

  if (response.profile && typeof response.profile === 'object') {
    return {
      ...response.profile,
      ...(response.gamification && !response.profile.gamification
        ? { gamification: response.gamification }
        : {}),
      ...(response.award_level && !response.profile.award_level
        ? { award_level: response.award_level }
        : {}),
    };
  }

  return response;
};

const fetchSelfProfileDirectly = async ({ authToken, bearerToken }) => {
  if (!bearerToken) {
    return null;
  }

  const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${backendUrl}/customer_app/users/get_profile`, {
    headers: {
      'Content-Type': 'application/json',
      Timezone: getTimeZone(),
      ...(authToken ? { 'auth-token': authToken } : {}),
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return extractProfilePayload(await response.json());
};

const LEVEL_HADITHS = [
  {
    text: 'Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him.',
    source: 'Jami` at-Tirmidhi 2646',
  },
  {
    text: 'The best among you are those who learn the Qur\'an and teach it.',
    source: 'Sahih al-Bukhari 5027',
  },
  {
    text: 'None of you truly believes until he loves for his brother what he loves for himself.',
    source: 'Al-Bukhari and Muslim',
  },
  {
    text: 'A strong believer is better and more beloved to Allah than a weak believer, and there is good in both.',
    source: 'Sahih Muslim 2664',
  },
  {
    text: 'Charity does not decrease wealth, and no one humbles himself for Allah except that Allah raises him.',
    source: 'Sahih Muslim 2588',
  },
  {
    text: 'The reward of deeds depends upon the intentions, and every person will get what they intended.',
    source: 'Sahih al-Bukhari 1',
  },
  {
    text: 'Allah is Beautiful and He loves beauty.',
    source: 'Sahih Muslim 91a',
  },
  {
    text: 'The most beloved deed to Allah is the most regular and constant, even if it is little.',
    source: 'Sahih al-Bukhari 6464',
  },
  {
    text: 'The Compassionate One has mercy on those who are merciful. Show mercy to those on the earth.',
    source: 'Sunan Abi Dawud 4941',
  },
  {
    text: 'Allah does not look at your faces and your wealth, but He looks to your hearts and your deeds.',
    source: 'Sahih Muslim 2564c',
  },
];

const formatJoinedMonth = (dateString) => {
  if (!dateString || dateString === '0000-00-00 00:00:00') {
    return 'Mar 2025';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Mar 2025';
  }

  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getInitials = (firstName, lastName) => {
  const first = `${firstName || 'Aisha'}`.trim().charAt(0);
  const last = `${lastName || 'B'}`.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
};

const numberOrFallback = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampScore = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

const deriveNextLevelLabel = (gamification) => {
  if (gamification?.is_max_level) {
    return gamification?.level_label || 'Max level';
  }

  const tierName = gamification?.tier_name;
  const tierSublevel = Number(gamification?.tier_sublevel);
  if (tierName && Number.isFinite(tierSublevel) && tierSublevel > 0) {
    return `${tierName} ${tierSublevel + 1}`;
  }

  const level = Number(gamification?.level);
  if (Number.isFinite(level)) {
    return `Level ${level + 1}`;
  }

  return 'Level 1';
};

const getRankHadith = (gamification) => {
  const level = numberOrFallback(gamification?.tier_sublevel || gamification?.level, 1);
  const index = Math.max(0, (level - 1) % LEVEL_HADITHS.length);
  return LEVEL_HADITHS[index];
};

const getRankLevelBody = (gamification) => {
  const tierName = gamification?.tier_name || 'Seeker';
  const tierMeaning = gamification?.tier_meaning || 'one who keeps showing up for knowledge and worship';
  const levelLabel = gamification?.level_label || `${tierName} 1`;
  const nextLevel = deriveNextLevelLabel(gamification);

  return `${levelLabel} means you are ${tierMeaning.toLowerCase()}. Keep attending balanced OnDeen activities to build XP, strengthen your streak, and move toward ${nextLevel}.`;
};

const normalizeRadarAxes = (gamification) => {
  const source =
    gamification?.radar ||
    gamification?.radar_axes ||
    gamification?.axis_scores ||
    gamification?.axes;

  if (Array.isArray(source) && source.length > 0) {
    return source.slice(0, 4).map((axis, index) => {
      const value = clampScore(axis.value ?? axis.score ?? axis.percent);
      const state = axis.state || (value <= 25 ? 'quiet' : value <= 60 ? 'building' : 'strong');
      return {
        label: axis.label || axis.title || RADAR_AXES[index]?.label || `Axis ${index + 1}`,
        value,
        hours: Math.max(0, Number(axis.hours ?? axis.verified_hours ?? 0)),
        targetHours: Math.max(0, Number(axis.target_hours ?? axis.targetHours ?? 0)),
        state,
        recentSessions: Array.isArray(axis.recent_sessions) ? axis.recent_sessions : [],
        color: axis.color || RADAR_AXES[index]?.color || COLORS.rank,
        statusColor: state === 'strong'
          ? COLORS.radarStrong
          : state === 'building'
            ? COLORS.radarBuilding
            : COLORS.radarQuiet,
      };
    });
  }

  return RADAR_AXES.map((axis, index) => ({
    ...axis,
    value: 0,
    hours: 0,
    targetHours: index === 0 ? 8 : 4,
    state: 'quiet',
    recentSessions: [],
    statusColor: COLORS.radarQuiet,
  }));
};

const radarPolygonPoints = (axes) => {
  const values = [0, 0, 0, 0].map((_, index) => clampScore(axes[index]?.value));
  const topY = 100 - (values[0] * 80) / 100;
  const rightX = 100 + (values[1] * 80) / 100;
  const bottomY = 100 + (values[2] * 80) / 100;
  const leftX = 100 - (values[3] * 80) / 100;
  return `100,${topY} ${rightX},100 100,${bottomY} ${leftX},100`;
};

const normalizeSummaryActivity = (summary) => {
  const hasSummaryShape = Boolean(
    summary?.event &&
    typeof summary.event === 'object' &&
    summary?.xp &&
    typeof summary.xp === 'object',
  );
  if (!summary?.id || !hasSummaryShape) {
    return null;
  }

  return {
    id: `summary-${summary.id}`,
    title: summary?.event?.title || 'OnDeen activity',
    xp: Number(summary?.xp?.earned || summary?.xp?.total_xp || summary?.xp?.total || 0),
  };
};

const normalizeRecentActivityItem = (item, index) => {
  const summaryActivity = normalizeSummaryActivity(item);
  if (summaryActivity) {
    return summaryActivity;
  }

  return {
    id: item?.id || `${item?.event_id || 'activity'}-${index}`,
    title: item?.title || item?.event_title || item?.event?.title || 'OnDeen activity',
    xp: Number(
      item?.xp ||
      item?.total_xp ||
      item?.earned ||
      item?.xp_earned ||
      item?.xp?.earned ||
      0,
    ),
  };
};

const normalizeRecentActivity = (gamification, pendingSummary) => {
  const source =
    gamification?.recent_activity ||
    gamification?.recent_activities ||
    gamification?.recent_xp ||
    gamification?.xp_logs ||
    gamification?.recent;

  const activities = [];
  if (Array.isArray(source)) {
    activities.push(...source.map(normalizeRecentActivityItem));
  } else if (source && typeof source === 'object') {
    activities.push(normalizeRecentActivityItem(source, 0));
  }

  const summaryActivity = normalizeSummaryActivity(pendingSummary);
  if (summaryActivity && !activities.some((activity) => activity.id === summaryActivity.id)) {
    activities.unshift(summaryActivity);
  }

  if (activities.length === 0 && gamification?.has_started && Number(gamification?.total_xp) > 0) {
    activities.push({
      id: 'total-xp',
      title: 'OnDeen activity',
      xp: Number(gamification.total_xp),
    });
  }

  return activities
    .filter((activity) => activity.title && Number.isFinite(activity.xp) && activity.xp > 0)
    .slice(0, 3);
};

const TopAppBar = ({ onBack, onNotifications, onSettings, publicProfile = false, topInset = 0 }) => (
  <View style={[styles.topBar, { paddingTop: topInset, height: 64 + topInset }]}>
    {publicProfile ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={10}
        onPress={onBack}
        style={styles.headerIconButton}
      >
        <ChevronLeft size={27} color={COLORS.text} strokeWidth={2.4} />
      </Pressable>
    ) : (
      <View style={styles.headerIconButton} />
    )}
    <Text style={styles.headerTitle}>{publicProfile ? 'Participant profile' : 'Profile'}</Text>
    {publicProfile ? (
      <View style={styles.headerIconButton} />
    ) : (
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={10}
          onPress={onNotifications}
        >
          <Bell size={23} color={COLORS.muted} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
          onPress={onSettings}
        >
          <Settings size={23} color={COLORS.muted} strokeWidth={2.2} />
        </Pressable>
      </View>
    )}
  </View>
);

const PrivateActivityNotice = () => (
  <View style={styles.privateActivityCard}>
    <Text style={styles.privateActivityTitle}>Activity is private</Text>
    <Text style={styles.privateActivityBody}>
      This member has chosen not to share activity statistics or gamification.
    </Text>
  </View>
);

const UserHeader = ({ profileData }) => {
  const firstName = profileData?.first_name || 'Aisha';
  const lastName = profileData?.last_name || 'B.';
  const displayLastName = lastName ? `${lastName}` : 'B.';
  const name = `${firstName} ${displayLastName}`.trim();
  const joined = formatJoinedMonth(profileData?.created_on);
  const location = profileData?.location || profileData?.city || 'London';

  return (
    <View style={styles.userHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(firstName, displayLastName)}</Text>
      </View>
      <View style={styles.userCopy}>
        <Text style={styles.userName} numberOfLines={1}>{name}</Text>
        <Text style={styles.userMeta} numberOfLines={1}>{location} · joined {joined}</Text>
      </View>
    </View>
  );
};

const CurrentRankCard = ({ gamification, onInfoPress }) => {
  const hasStarted = Boolean(gamification?.has_started);
  const levelLabel = gamification?.level_label || 'No tier yet';
  const tierArabic = gamification?.tier_arabic || '';
  const progressPercent = Math.min(
    100,
    Math.max(hasStarted ? 4 : 0, numberOrFallback(gamification?.progress_percent, 0)),
  );
  const classesToNext = numberOrFallback(gamification?.classes_to_next_level, 0);
  const nextLevel = deriveNextLevelLabel(gamification);
  const nextXp = numberOrFallback(gamification?.next_level_xp, 0).toLocaleString();

  return (
    <View style={styles.rankCard}>
      <Text style={styles.overline}>CURRENT RANK</Text>
      <View style={styles.rankTitleRow}>
        <Text style={styles.rankTitle}>{levelLabel}</Text>
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Rank information"
          onPress={onInfoPress}
        >
          <Info size={18} color={COLORS.muted} strokeWidth={2.2} />
        </Pressable>
      </View>
      {tierArabic ? <Text style={styles.rankArabic}>{tierArabic}</Text> : null}
      <Text style={styles.rankHint}>
        {hasStarted
          ? `${classesToNext} more activities to ${nextLevel}`
          : 'Attend your first activity to unlock XP'}
      </Text>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={['#FFC94B', '#FF7A4A', '#E8418F']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.progressFill, { width: `${progressPercent}%` }]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>{levelLabel}</Text>
        <Text style={styles.progressLabel}>{nextLevel} → {nextXp} XP</Text>
      </View>
    </View>
  );
};

const StatCards = ({ gamification }) => {
  const streak = numberOrFallback(gamification?.current_streak, 0);
  const longestStreak = numberOrFallback(gamification?.longest_streak, 0);
  const lifetimeHours = numberOrFallback(gamification?.lifetime_hours, 0);
  const activityCount = numberOrFallback(gamification?.total_sessions, 0);
  const currentStreak = Array.isArray(gamification?.streaks)
    ? gamification.streaks[0]
    : null;
  const streakState = currentStreak?.state || gamification?.streak_state || 'none';
  const missedCount = numberOrFallback(currentStreak?.missed_count, 0);
  const multiplier = numberOrFallback(gamification?.streak_multiplier, 1)
    .toFixed(2)
    .replace(/\.00$/, '');
  const streakStatus = streakState === 'dimmed'
    ? 'Flame dimmed · 1 booked session missed · streak preserved'
    : streakState === 'ember'
      ? 'Ember state · 2 booked sessions missed · one more resets'
      : streakState === 'none' && missedCount >= 3
        ? 'Streak reset · 3 booked sessions missed'
        : streak > 0
          ? `${Math.max(0, 8 - streak)} to full flame · ${multiplier}× XP`
          : 'Check in to start a streak';
  const flameColor = streakState === 'dimmed'
    ? '#B8AFC5'
    : streakState === 'ember'
      ? '#D08A00'
      : COLORS.orange;

  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statCard, styles.streakCard]}>
        <View style={styles.statTopRow}>
          <Text style={styles.statOverline}>STREAK</Text>
          <Flame size={33} color={flameColor} fill={flameColor} strokeWidth={1.6} />
        </View>
        <View style={styles.statBottom}>
          <Text style={styles.statTitle}>{streak} in a row</Text>
          <Text style={styles.statBody}>{streakStatus}</Text>
          {currentStreak?.event_title ? (
            <Text numberOfLines={1} style={styles.statMeta}>{currentStreak.event_title}</Text>
          ) : null}
          <Text style={styles.statMeta}>Personal best: {longestStreak}</Text>
        </View>
      </View>
      <View style={[styles.statCard, styles.lifetimeCard]}>
        <Text style={styles.statOverline}>LIFETIME</Text>
        <View style={styles.lifetimeCopy}>
          <Text style={styles.lifetimeValue}>
            {lifetimeHours}<Text style={styles.lifetimeUnit}>h</Text>
          </Text>
          <Text style={styles.lifetimeMeta}>across {activityCount} activities</Text>
        </View>
      </View>
    </View>
  );
};

const Certificates = ({ awards = [], onSeeAll }) => {
  const visibleAwards = Array.isArray(awards) ? awards.slice(0, 3) : [];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Certificates</Text>
        {visibleAwards.length > 0 ? (
          <Pressable hitSlop={10} onPress={onSeeAll}>
            <Text style={styles.seeAll}>See all ›</Text>
          </Pressable>
        ) : null}
      </View>
      {visibleAwards.length > 0 ? (
        <View style={styles.certificateGrid}>
          {visibleAwards.map((award, index) => {
            const palette = CERTIFICATES[index % CERTIFICATES.length];
            const Icon = palette.icon;
            return (
              <View
                key={award?.id || award?.title || `award-${index}`}
                style={[
                  styles.certificateCard,
                  { backgroundColor: palette.bg, borderColor: palette.border },
                ]}
              >
                <View style={styles.certificateIconWrap}>
                  <Icon size={21} color={palette.tint} strokeWidth={2.2} />
                </View>
                <Text style={styles.certificateTitle} numberOfLines={1}>
                  {award?.title || 'Award'}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No certificates earned yet</Text>
        </View>
      )}
    </View>
  );
};

const RadarChart = ({ axes }) => (
  <View style={styles.radarWrap}>
    <View style={styles.radarCanvas}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <Defs>
          <SvgLinearGradient id="sunsetGradProfile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFC94B" />
            <Stop offset="0.55" stopColor="#FF7A4A" />
            <Stop offset="1" stopColor="#E8418F" />
          </SvgLinearGradient>
        </Defs>
        <Polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
        <Polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
        <Polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
        <Polygon points="100,80 120,100 100,120 80,100" fill="none" stroke="#EFEBF5" strokeWidth="1" />
        <Line x1="100" y1="20" x2="100" y2="180" stroke="#EFEBF5" strokeWidth="1" />
        <Line x1="20" y1="100" x2="180" y2="100" stroke="#EFEBF5" strokeWidth="1" />
        <Polygon
          points={radarPolygonPoints(axes)}
          fill="url(#sunsetGradProfile)"
          fillOpacity="0.25"
          stroke="#FF7A4A"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </Svg>
      <Text style={[styles.radarLabel, styles.radarTop, { color: axes[0]?.color || COLORS.gold }]}>
        {axes[0]?.label || 'Knowledge'}
      </Text>
      <Text style={[styles.radarLabel, styles.radarRight, { color: axes[1]?.color || COLORS.green }]}>
        {axes[1]?.label || 'Fitness'}
      </Text>
      <Text style={[styles.radarLabel, styles.radarBottom, { color: axes[2]?.color || COLORS.pink }]}>
        {axes[2]?.label || 'Community'}
      </Text>
      <Text style={[styles.radarLabel, styles.radarLeft, { color: axes[3]?.color || COLORS.rank }]}>
        {axes[3]?.label || 'Tazkiyyah'}
      </Text>
    </View>
  </View>
);

const RadarRows = ({ axes, onAxisPress }) => (
  <View style={styles.radarRows}>
    {axes.map((axis) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${axis.label} Radar detail ${axis.value} out of 100`}
        key={axis.label}
        onPress={() => onAxisPress?.(axis)}
        style={({ pressed }) => [styles.axisRow, pressed && styles.axisRowPressed]}
      >
        <View style={styles.axisNameWrap}>
          <View style={[styles.axisDot, { backgroundColor: axis.statusColor }]} />
          <Text style={styles.axisName}>{axis.label}</Text>
        </View>
        <View style={styles.axisTrack}>
          <View style={[styles.axisFill, { backgroundColor: axis.statusColor, width: `${axis.value}%` }]} />
        </View>
        <View style={styles.axisValueWrap}>
          <Text style={styles.axisValue}>{axis.value}/100</Text>
          <Text style={styles.axisHours}>
            {Number(axis.hours || 0).toFixed(Number(axis.hours || 0) % 1 === 0 ? 0 : 1)}h/{axis.targetHours || 0}h
          </Text>
          <Text style={[styles.axisState, { color: axis.statusColor }]}>
            {axis.state === 'strong' ? 'Strong' : axis.state === 'building' ? 'Building' : 'Quiet'}
          </Text>
        </View>
      </Pressable>
    ))}
  </View>
);

const OnDeenRadarSection = ({ gamification, onInfoPress, onAxisPress }) => {
  const axes = normalizeRadarAxes(gamification);
  const lowAxes = axes
    .filter((axis) => axis.value > 0 && axis.value < 45)
    .map((axis) => axis.label);

  return (
    <View style={styles.section}>
      <View style={styles.radarHeading}>
        <View style={styles.radarTitleRow}>
          <Text style={styles.sectionTitle}>OnDeen Radar</Text>
          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="OnDeen Radar information"
            onPress={onInfoPress}
          >
            <Info size={18} color={COLORS.muted} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>Your balance across your gamification activity</Text>
      </View>
      <View style={styles.radarCard}>
        <RadarChart axes={axes} />
        <RadarRows axes={axes} onAxisPress={onAxisPress} />
        <View style={styles.radarNote}>
          <View style={styles.radarNoteIcon}>
          <Scale size={16} color={COLORS.gold} strokeWidth={2.2} />
          </View>
          <Text style={styles.radarNoteText}>
            {lowAxes.length > 0
              ? `Your ${lowAxes.join(' and ')} could use some attention this month`
              : 'Keep checking in to build a balanced OnDeen profile'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const RecentActivity = ({ gamification, pendingSummary }) => {
  const activities = normalizeRecentActivity(gamification, pendingSummary);

  return (
    <View style={[styles.section, styles.recentSection]}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.length > 0 ? (
        <View style={styles.activityCard}>
          {activities.map((activity, index) => (
            <View
              key={activity.id}
              style={[
                styles.activityRow,
                index < activities.length - 1 && styles.activityDivider,
              ]}
            >
              <View style={styles.activityLeft}>
                <View style={styles.activityIconWrap}>
                  <CheckCircle2 size={17} color={COLORS.green} fill={COLORS.green} stroke="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text style={styles.activityTitle}>{activity.title}</Text>
              </View>
              <Text style={styles.activityXp}>+{activity.xp} XP</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent XP activity yet</Text>
        </View>
      )}
    </View>
  );
};

const RankInfoModal = ({ gamification, visible, onClose }) => {
  const levelLabel = gamification?.level_label || 'Seeker 1';
  const tierArabic = gamification?.tier_arabic;
  const tierTransliteration = gamification?.tier_transliteration;
  const hadith = getRankHadith(gamification);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.rankModalOverlay} onPress={onClose}>
        <Pressable style={styles.rankInfoCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalAccent} />
          <View style={styles.modalHeaderRow}>
            <View style={styles.rankModalIcon}>
              <BookOpen size={28} color={COLORS.gold} strokeWidth={2.2} />
            </View>
            <View style={styles.modalTitleCopy}>
              <Text style={styles.modalOverline}>RANK DETAIL</Text>
              <Text style={styles.modalTitle}>
                {levelLabel}
                {tierTransliteration ? <Text style={styles.modalTitleMuted}> - {tierTransliteration}</Text> : null}
                {tierArabic ? <Text style={styles.modalArabic}> ({tierArabic})</Text> : null}
              </Text>
            </View>
          </View>

          <Text style={styles.modalBody}>{getRankLevelBody(gamification)}</Text>

          <View style={styles.hadithBox}>
            <Text style={styles.quoteMark}>”</Text>
            <Text style={styles.hadithText}>“{hadith.text}”</Text>
            <Text style={styles.hadithSource}>- {hadith.source}</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalPrimaryButton}>
            <Text style={styles.modalPrimaryText}>Got it</Text>
            <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const RadarInfoModal = ({ visible, onClose }) => (
  <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <Pressable style={styles.radarModalOverlay} onPress={onClose}>
      <Pressable style={styles.radarInfoCard} onPress={(event) => event.stopPropagation()}>
        <View style={styles.radarModalIcon}>
          <Radar size={32} color={COLORS.rank} strokeWidth={2.2} />
        </View>
        <View style={styles.radarModalCopy}>
          <Text style={styles.radarModalTitle}>About OnDeen Radar</Text>
          <Text style={styles.radarModalBody}>
            Your Radar shows how you've been spending your time across four dimensions of Islamic life over the last 30 days.
            The ideal state is a balanced diamond - all four areas in the green zone. It rises when you attend events in that
            category and eases back when you don't. Think of it as your personal mizan - your balance.
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalPrimaryButton}>
          <Text style={styles.modalPrimaryText}>Got it</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

const RadarDetailModal = ({ axis, onClose }) => {
  if (!axis) {
    return null;
  }

  const hours = Number(axis.hours || 0).toFixed(Number(axis.hours || 0) % 1 === 0 ? 0 : 1);
  const stateLabel = axis.state === 'strong' ? 'Strong' : axis.state === 'building' ? 'Building' : 'Quiet';
  const recommendation = axis.value >= 61
    ? `Keep attending verified ${axis.label.toLowerCase()} sessions to maintain this balance.`
    : `Attend a verified ${axis.label.toLowerCase()} session to move this axis toward the green zone.`;

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <Pressable style={styles.radarModalOverlay} onPress={onClose}>
        <Pressable style={styles.radarDetailCard} onPress={(event) => event.stopPropagation()}>
          <View style={[styles.radarDetailStatus, { backgroundColor: axis.statusColor }]} />
          <Text style={styles.radarModalTitle}>{axis.label} Radar</Text>
          <Text style={[styles.radarDetailScore, { color: axis.statusColor }]}>
            {axis.value}/100 · {stateLabel}
          </Text>
          <Text style={styles.radarModalBody}>
            {hours} verified hours in the last 30 days · target {axis.targetHours || 0}h.
          </Text>
          <Text style={styles.radarDetailExplanation}>
            Radar counts actual scheduled time once. Difficulty, streaks and milestones can change XP, but never multiply Radar hours.
          </Text>

          <Text style={styles.radarDetailHeading}>Recent verified sessions</Text>
          {axis.recentSessions.length > 0 ? axis.recentSessions.slice(0, 4).map((session, index) => (
            <View key={session.activity_id || `${session.event_id}-${index}`} style={styles.radarSessionRow}>
              <Text numberOfLines={1} style={styles.radarSessionTitle}>{session.title || 'OnDeen activity'}</Text>
              <Text style={styles.radarSessionHours}>+{Number(session.hours || 0).toFixed(1)}h</Text>
            </View>
          )) : (
            <Text style={styles.radarEmptySessions}>No verified session in this area yet.</Text>
          )}

          <Text style={styles.radarRecommendation}>{recommendation}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalPrimaryButton}>
            <Text style={styles.modalPrimaryText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const ProfileScreen = ({ route }) => {
  useStatusBar({ backgroundColor: COLORS.surface, barStyle: 'dark-content' });

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);
  const bearerToken = useSelector((state) => (
    state.user?.loginToken ||
    state.user?.user?.access_token ||
    state.verifyOtp?.verifyOtp_access_token ||
    state.registerUser?.access_token
  ));
  const authToken = useSelector((state) => state.token?.token?.access_token);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [rankInfoVisible, setRankInfoVisible] = useState(false);
  const [radarInfoVisible, setRadarInfoVisible] = useState(false);
  const [selectedRadarAxis, setSelectedRadarAxis] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [pendingSummary, setPendingSummary] = useState(null);
  const { user_id } = route?.params || {};
  const isPublicProfile = Boolean(user_id);
  const refreshProfileAt = route?.params?.refreshProfileAt;

  const fetchProfile = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = user_id
        ? await getUserProfileAPI({ data: { user_id } })
        : await getSelfProfileAPI();
      let profilePayload = extractProfilePayload(response);
      if (!profilePayload && !user_id && Platform.OS === 'ios') {
        profilePayload = await fetchSelfProfileDirectly({ authToken, bearerToken });
      }
      setProfileData(profilePayload);
      if (!user_id) {
        try {
          const summaryResponse = await getPendingGamificationSummaryAPI();
          setPendingSummary(summaryResponse?.response?.summary || null);
        } catch (summaryError) {
          setPendingSummary(null);
        }
      } else {
        setPendingSummary(null);
      }
    } catch (error) {
      setProfileData(null);
      setPendingSummary(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authToken, bearerToken, user_id]);

  useEffect(() => {
    if (refreshProfileAt) {
      fetchProfile();
    }
  }, [fetchProfile, refreshProfileAt]);

  useEffect(() => {
    const handleBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (isSkippedLogin) {
      setModalVisible(true);
    }
  }, [isSkippedLogin]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor(COLORS.surface);
      fetchProfile();
      return () => {
        StatusBar.setBackgroundColor('#FFFFFF');
      };
    }, [fetchProfile]),
  );

  const gamification = useMemo(() => profileData?.gamification || {}, [profileData]);
  const awards = useMemo(() => profileData?.award_level || [], [profileData]);

  const handleConfirmLogout = async () => {
    setModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const onSettings = () => {
    navigation.navigate('ProfileSettings');
  };

  const onNotifications = () => {
    navigation.navigate('Notification');
  };

  const onPublicProfileBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    // A profile can also be opened from a cold deep link. In that case there
    // is no stack entry to pop, so restore its source when available and use
    // Home as the safe deterministic fallback (instead of the current Profile
    // tab, which makes the back action appear to do nothing).
    if (isPublicProfile && route?.params?.eventId) {
      navigation.navigate('AllParticipants', { event_id: route.params.eventId });
      return;
    }
    navigation.navigate('MainNavigator', { screen: 'Home' });
  };

  const ContainerComponent = SafeAreaView;

  if (loading && !profileData) {
    return <Loader />;
  }

  return (
    <ContainerComponent style={styles.root}>
      <GuestModal
        isVisible={isModalVisible}
        title="Confirm Login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />
      <RankInfoModal
        gamification={gamification}
        visible={rankInfoVisible}
        onClose={() => setRankInfoVisible(false)}
      />
      <RadarInfoModal
        visible={radarInfoVisible}
        onClose={() => setRadarInfoVisible(false)}
      />
      <RadarDetailModal
        axis={selectedRadarAxis}
        onClose={() => setSelectedRadarAxis(null)}
      />
      <TopAppBar
        onBack={onPublicProfileBack}
        onNotifications={onNotifications}
        onSettings={onSettings}
        publicProfile={isPublicProfile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProfile} tintColor={COLORS.primary} />
        }
      >
        <UserHeader profileData={profileData} />
        {!isPublicProfile || profileData?.show_journeylevel ? (
          <>
            <CurrentRankCard gamification={gamification} onInfoPress={() => setRankInfoVisible(true)} />
            <StatCards gamification={gamification} />
          </>
        ) : (
          <PrivateActivityNotice />
        )}
        {(!isPublicProfile || profileData?.show_awards) ? (
          <Certificates awards={awards} onSeeAll={() => navigation.navigate('BadgesScreen')} />
        ) : null}
        {!isPublicProfile || profileData?.show_journeylevel ? (
          <>
            <OnDeenRadarSection
              gamification={gamification}
              onAxisPress={setSelectedRadarAxis}
              onInfoPress={() => setRadarInfoVisible(true)}
            />
            <RecentActivity gamification={gamification} pendingSummary={pendingSummary} />
          </>
        ) : null}
      </ScrollView>
    </ContainerComponent>
  );
};

const baseFont = fontFamilies.SFProRoundedBlackRegular;
const mediumFont = fontFamilies.SFProRoundedBlackMedium;
const semiFont = fontFamilies.SFProRoundedBlackSemiBold;
const boldFont = fontFamilies.SFProRoundedBlackBold;

const shadowCard = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
    zIndex: 4,
  },
  headerIconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: COLORS.primary,
    fontFamily: boldFont,
    fontSize: 22,
    lineHeight: 28,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  privateActivityCard: {
    ...shadowCard,
    backgroundColor: COLORS.card,
    borderColor: '#E8E2F1',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 24,
    padding: 22,
  },
  privateActivityTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 18,
    lineHeight: 23,
    marginBottom: 6,
  },
  privateActivityBody: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 14,
    lineHeight: 20,
  },
  rankModalOverlay: {
    backgroundColor: 'rgba(50, 47, 54, 0.72)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  rankInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    gap: 24,
    overflow: 'hidden',
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 26,
    ...shadowCard,
  },
  modalAccent: {
    backgroundColor: COLORS.gold,
    height: 1,
    left: 72,
    opacity: 0.45,
    position: 'absolute',
    right: 72,
    top: 0,
  },
  modalHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  rankModalIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 201, 75, 0.15)',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  modalTitleCopy: {
    flex: 1,
  },
  modalOverline: {
    color: COLORS.gold,
    fontFamily: boldFont,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
    marginBottom: 4,
  },
  modalTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 22,
    lineHeight: 28,
  },
  modalTitleMuted: {
    color: '#494551',
    fontFamily: baseFont,
  },
  modalArabic: {
    color: '#494551',
    fontFamily: baseFont,
    fontSize: 16,
    lineHeight: 24,
  },
  modalBody: {
    color: '#494551',
    fontFamily: baseFont,
    fontSize: 15,
    lineHeight: 22,
  },
  hadithBox: {
    backgroundColor: '#F8F1FB',
    borderLeftColor: 'rgba(255, 201, 75, 0.65)',
    borderLeftWidth: 3,
    borderRadius: 20,
    padding: 20,
  },
  quoteMark: {
    color: 'rgba(255, 201, 75, 0.25)',
    fontFamily: boldFont,
    fontSize: 40,
    lineHeight: 42,
    position: 'absolute',
    right: 16,
    top: 4,
  },
  hadithText: {
    color: '#1D1A21',
    fontFamily: baseFont,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 23,
    paddingRight: 20,
  },
  hadithSource: {
    color: COLORS.muted,
    fontFamily: boldFont,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
    marginTop: 12,
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#4B2A8C',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontFamily: boldFont,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  radarModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(50, 47, 54, 0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  radarInfoCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    gap: 16,
    maxWidth: 400,
    padding: 20,
    width: '100%',
    ...shadowCard,
  },
  radarModalIcon: {
    alignItems: 'center',
    backgroundColor: '#F8F1FB',
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  radarModalCopy: {
    gap: 8,
  },
  radarModalTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  radarModalBody: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  scroll: {
    backgroundColor: COLORS.bgApp,
  },
  scrollContent: {
    alignSelf: 'center',
    gap: 24,
    maxWidth: 430,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  userHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F0EDF8',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: COLORS.rank,
    fontFamily: boldFont,
    fontSize: 18,
    lineHeight: 22,
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 17,
    lineHeight: 22,
  },
  userMeta: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  rankCard: {
    ...shadowCard,
    backgroundColor: '#F0EDF8',
    borderColor: '#DDD6F3',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  overline: {
    color: COLORS.muted,
    fontFamily: boldFont,
    fontSize: 11,
    letterSpacing: 0.9,
    lineHeight: 16,
  },
  rankTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rankTitle: {
    color: COLORS.rank,
    fontFamily: boldFont,
    fontSize: 28,
    lineHeight: 34,
  },
  rankArabic: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 15,
    lineHeight: 22,
  },
  rankHint: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: COLORS.xpTrack,
    borderRadius: 999,
    height: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    color: COLORS.muted,
    fontFamily: mediumFont,
    fontSize: 11,
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 140,
    padding: 20,
  },
  streakCard: {
    backgroundColor: '#FFF6E8',
    borderColor: '#FFE0A0',
    borderWidth: 1,
  },
  lifetimeCard: {
    ...shadowCard,
    backgroundColor: COLORS.card,
  },
  statTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statOverline: {
    color: COLORS.muted,
    fontFamily: boldFont,
    fontSize: 11,
    letterSpacing: 0.7,
    lineHeight: 16,
  },
  statBottom: {
    marginTop: 8,
  },
  statTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 17,
    lineHeight: 22,
  },
  statBody: {
    color: COLORS.text,
    fontFamily: baseFont,
    fontSize: 12,
    lineHeight: 15,
    marginTop: 2,
    opacity: 0.82,
  },
  statMeta: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  lifetimeCopy: {
    marginTop: 8,
  },
  lifetimeValue: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 28,
    lineHeight: 36,
  },
  lifetimeUnit: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 16,
  },
  lifetimeMeta: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 18,
    lineHeight: 24,
  },
  seeAll: {
    color: '#4B2A8C',
    fontFamily: boldFont,
    fontSize: 12,
    lineHeight: 16,
  },
  certificateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  certificateCard: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 12,
  },
  certificateIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  certificateTitle: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 12,
    lineHeight: 16,
  },
  radarHeading: {
    gap: 4,
  },
  radarTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 13,
    lineHeight: 18,
  },
  radarCard: {
    ...shadowCard,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  radarWrap: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  radarCanvas: {
    height: 200,
    width: 200,
  },
  radarLabel: {
    fontFamily: boldFont,
    fontSize: 11,
    letterSpacing: 0.4,
    lineHeight: 14,
    position: 'absolute',
    textTransform: 'uppercase',
  },
  radarTop: {
    color: COLORS.gold,
    left: 62,
    top: -16,
  },
  radarRight: {
    color: COLORS.green,
    right: -54,
    top: 92,
  },
  radarBottom: {
    bottom: -18,
    color: COLORS.pink,
    left: 78,
  },
  radarLeft: {
    color: COLORS.rank,
    left: -58,
    top: 92,
  },
  radarRows: {
    gap: 12,
  },
  axisRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 4,
  },
  axisRowPressed: {
    backgroundColor: '#F7F4FA',
  },
  axisNameWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    width: 98,
  },
  axisDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  axisName: {
    color: COLORS.text,
    fontFamily: semiFont,
    fontSize: 13,
    lineHeight: 18,
  },
  axisTrack: {
    backgroundColor: COLORS.xpTrack,
    borderRadius: 999,
    flex: 1,
    height: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  axisFill: {
    borderRadius: 999,
    height: '100%',
  },
  axisValue: {
    color: COLORS.muted,
    fontFamily: boldFont,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  axisValueWrap: {
    alignItems: 'flex-end',
    width: 62,
  },
  axisHours: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 10,
    lineHeight: 13,
  },
  axisState: {
    fontFamily: semiFont,
    fontSize: 9,
    lineHeight: 12,
  },
  radarDetailCard: {
    ...shadowCard,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginHorizontal: 24,
    maxHeight: '82%',
    overflow: 'hidden',
    padding: 24,
    width: '88%',
  },
  radarDetailStatus: {
    borderRadius: 999,
    height: 6,
    marginBottom: 18,
    width: 56,
  },
  radarDetailScore: {
    fontFamily: boldFont,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  radarDetailExplanation: {
    backgroundColor: '#F7F4FA',
    borderRadius: 12,
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 14,
    padding: 12,
  },
  radarDetailHeading: {
    color: COLORS.text,
    fontFamily: boldFont,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 18,
  },
  radarSessionRow: {
    alignItems: 'center',
    borderBottomColor: '#EFEBF5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  radarSessionTitle: {
    color: COLORS.text,
    flex: 1,
    fontFamily: mediumFont,
    fontSize: 12,
    marginRight: 12,
  },
  radarSessionHours: {
    color: COLORS.radarStrong,
    fontFamily: boldFont,
    fontSize: 12,
  },
  radarEmptySessions: {
    color: COLORS.muted,
    fontFamily: baseFont,
    fontSize: 12,
    paddingVertical: 8,
  },
  radarRecommendation: {
    color: COLORS.primary,
    fontFamily: mediumFont,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
    marginTop: 16,
  },
  radarNote: {
    alignItems: 'center',
    borderTopColor: '#F0EDF8',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
  },
  radarNoteIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF6E8',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  radarNoteText: {
    color: COLORS.muted,
    flex: 1,
    fontFamily: baseFont,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  recentSection: {
    marginBottom: 8,
  },
  activityCard: {
    ...shadowCard,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  activityDivider: {
    borderBottomColor: '#ECE6EF',
    borderBottomWidth: 1,
  },
  activityLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  activityIconWrap: {
    alignItems: 'center',
    backgroundColor: '#EAFAF1',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  activityTitle: {
    color: COLORS.text,
    flex: 1,
    fontFamily: semiFont,
    fontSize: 15,
    lineHeight: 20,
  },
  activityXp: {
    color: COLORS.orange,
    fontFamily: boldFont,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ProfileScreen;
