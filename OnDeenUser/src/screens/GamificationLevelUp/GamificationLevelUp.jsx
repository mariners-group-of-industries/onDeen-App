import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilies } from '../../../assets/fonts/fonts';
import { sampleGamificationSummary } from '../GamificationSummary/sampleSummary';

const PARTICLES = Array.from({ length: 40 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 40;
  const distance = 52 + ((index * 17) % 145);
  return {
    color: ['#4B2A8C', '#D2BCFF', '#DB1C86'][index % 3],
    size: 4 + (index % 5),
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
  };
});

const GamificationLevelUp = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const summary = route?.params?.summary || sampleGamificationSummary;
  const previewOnly = Boolean(route?.params?.previewOnly);
  const levelLabel = summary?.progression?.level_label || 'Seeker 1';
  const tierName = summary?.progression?.tier_name || 'Seeker';
  const tierArabic = summary?.progression?.tier_arabic || 'طالب';
  const earnedXp = Number(summary?.xp?.milestone || summary?.xp?.earned || 250).toLocaleString();
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.95)).current;
  const modalTranslateY = useRef(new Animated.Value(10)).current;
  const particles = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  const particleViews = useMemo(
    () =>
      PARTICLES.map((particle, index) => {
        const progress = particles[index];
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 1],
          outputRange: [0, 1, 0],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.12, 1],
          outputRange: [0.2, 1, 0],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.tx],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.ty],
        });

        return (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                backgroundColor: particle.color,
                height: particle.size,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
                width: particle.size,
              },
            ]}
          />
        );
      }),
    [particles],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        bounciness: 9,
        speed: 14,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.stagger(
        8,
        particles.map((particle, index) =>
          Animated.timing(particle, {
            delay: index < 20 ? 0 : 100,
            duration: 1000 + ((index * 37) % 600),
            easing: Easing.out(Easing.cubic),
            toValue: 1,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, [modalOpacity, modalScale, modalTranslateY, particles]);

  const continueToFeedback = () => {
    const params = { summary, previewOnly };
    if (navigation.replace) {
      navigation.replace('SessionFeedback', params);
      return;
    }
    navigation.navigate('SessionFeedback', params);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.overlay, { paddingBottom: insets.bottom + 20, paddingTop: insets.top + 20 }]}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }, { translateY: modalTranslateY }],
            },
          ]}
        >
          <View pointerEvents="none" style={styles.particles}>
            {particleViews}
          </View>

          <Text style={styles.eyebrow}>WELCOME · {levelLabel.toUpperCase()}</Text>

          <View style={styles.badge}>
            <View style={styles.badgeInner}>
              <Text style={styles.badgeLetter}>S</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.arabic}>{tierArabic}</Text>
            <Text style={styles.title}>You're a {tierName}.</Text>
            <Text style={styles.subtitle}>The journey begins.</Text>
            <Text style={styles.bodyText}>
              Every event you attend earns XP - classes, retreats, charity drives, talks. Streaks unlock bonuses.
              Finish a course or retreat for a milestone jump.
            </Text>

            <View style={styles.xpCard}>
              <Text style={styles.xpLabel}>YOUR LEVEL UP</Text>
              <Text style={styles.xpValue}>+{earnedXp} XP</Text>
              <Text style={styles.xpMeta}>{levelLabel} unlocked</Text>
            </View>

            <Pressable onPress={continueToFeedback} style={styles.buttonPressable}>
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
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#F5F3F9',
    flex: 1,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(50, 47, 54, 0.60)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxWidth: 384,
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    width: '100%',
    elevation: 6,
  },
  particles: {
    bottom: 0,
    left: 0,
    overflow: 'visible',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  particle: {
    borderRadius: 999,
    left: '50%',
    position: 'absolute',
    top: 88,
  },
  eyebrow: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 11,
    letterSpacing: 1.65,
    lineHeight: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#FEFDFC',
    borderColor: '#4B2A8C',
    borderRadius: 999,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 100,
    justifyContent: 'center',
    marginBottom: 24,
    width: 100,
    zIndex: 2,
  },
  badgeInner: {
    alignItems: 'center',
    borderColor: '#4B2A8C',
    borderRadius: 999,
    borderWidth: 2,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  badgeLetter: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 48,
    fontStyle: 'italic',
    lineHeight: 54,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  arabic: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
    opacity: 0.8,
  },
  title: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 28,
    fontStyle: 'italic',
    lineHeight: 34,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 20,
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  bodyText: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 280,
    textAlign: 'center',
  },
  xpCard: {
    alignItems: 'center',
    backgroundColor: '#FDFAF5',
    borderColor: '#1A1A1A',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 32,
    padding: 16,
    width: '100%',
  },
  xpLabel: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 10,
    letterSpacing: 1,
    lineHeight: 14,
    marginBottom: 4,
  },
  xpValue: {
    color: '#340B75',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 24,
    fontStyle: 'italic',
    lineHeight: 31,
    marginBottom: 4,
  },
  xpMeta: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonPressable: {
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 52,
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
    fontSize: 22,
    lineHeight: 28,
  },
});

export default GamificationLevelUp;
