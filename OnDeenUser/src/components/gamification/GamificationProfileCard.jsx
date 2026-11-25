import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Award, Flame, GraduationCap, Hourglass } from 'lucide-react-native';
import { fontFamilies } from '../../../assets/fonts/fonts';
import XpRing from './XpRing';

const StatPill = ({ icon: Icon, label, value, tint = '#4B2A8C' }) => (
  <View style={styles.statPill}>
    <Icon size={18} color={tint} strokeWidth={2.2} />
    <View style={styles.statTextWrap}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const GamificationProfileCard = ({ gamification }) => {
  const hasStarted = gamification?.has_started;
  const levelLabel = gamification?.level_label || 'No tier yet';
  const tierArabic = gamification?.tier_arabic || '';
  const xpToNext = Number(gamification?.xp_to_next_level || 0);
  const classesToNext = Number(gamification?.classes_to_next_level || 0);
  const streak = Number(gamification?.current_streak || 0);
  const multiplier = Number(gamification?.streak_multiplier || 1).toFixed(2).replace(/\.00$/, '');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.sectionLabel}>YOUR JOURNEY</Text>
          <View style={styles.tierRow}>
            <Text style={styles.tierName}>{levelLabel}</Text>
            {tierArabic ? <Text style={styles.tierArabic}>{tierArabic}</Text> : null}
          </View>
          <Text style={styles.bodyText}>
            {hasStarted
              ? `${xpToNext.toLocaleString()} XP to the next level`
              : 'Attend your first session to become a Seeker.'}
          </Text>
        </View>
        <XpRing
          totalXp={gamification?.total_xp || 0}
          currentLevelFloorXp={gamification?.current_level_floor_xp || 0}
          nextLevelXp={gamification?.next_level_xp || 100}
          progressPercent={gamification?.progress_percent || 0}
          size={112}
          strokeWidth={9}
          showRatio={false}
        />
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={['#FFC94B', '#FF7A4A', '#E8418F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${Math.max(4, Math.min(100, gamification?.progress_percent || 0))}%` }]}
        />
      </View>

      <View style={styles.nextRow}>
        <Text style={styles.nextText}>
          {hasStarted
            ? `${classesToNext || 1} more sessions to ${gamification?.is_max_level ? 'stay at Pathfinder 10' : 'level up'}`
            : 'First check-in unlocks XP, level and streak.'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatPill icon={Flame} label="Streak" value={`${streak} in a row`} tint="#FF7A4A" />
        <StatPill icon={Award} label="Multiplier" value={`${multiplier}x`} />
        <StatPill icon={GraduationCap} label="Sessions" value={gamification?.total_sessions || 0} />
        <StatPill icon={Hourglass} label="Hours" value={gamification?.lifetime_hours || 0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -18,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
  sectionLabel: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 16,
  },
  tierRow: {
    marginTop: 8,
  },
  tierName: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 23,
    lineHeight: 29,
  },
  tierArabic: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  bodyText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  progressTrack: {
    backgroundColor: '#EFEBF5',
    borderRadius: 999,
    height: 9,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  nextRow: {
    marginTop: 10,
  },
  nextText: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: '#F5F3F9',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '48%',
  },
  statTextWrap: {
    flex: 1,
  },
  statValue: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 14,
    lineHeight: 18,
  },
  statLabel: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 11,
    lineHeight: 15,
  },
});

export default GamificationProfileCard;
