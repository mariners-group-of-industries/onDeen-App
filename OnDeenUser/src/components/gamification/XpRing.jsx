import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { fontFamilies } from '../../../assets/fonts/fonts';

const XpRing = ({
  totalXp = 0,
  currentLevelFloorXp = 0,
  nextLevelXp = 100,
  progressPercent = 0,
  size = 180,
  strokeWidth = 12,
  showRatio = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, Number(progressPercent) || 0));
  const dashOffset = circumference - (circumference * progress) / 100;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="xpSunsetGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFC94B" />
            <Stop offset="0.5" stopColor="#FF7A4A" />
            <Stop offset="1" stopColor="#E8418F" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#EFEBF5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#xpSunsetGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.xpNumber, size < 140 && styles.smallXpNumber]}>
          {Number(totalXp || 0).toLocaleString()}
        </Text>
        {showRatio ? (
          <Text style={styles.ratio}>
            {Number(totalXp || 0).toLocaleString()} / {Number(nextLevelXp || currentLevelFloorXp || 0).toLocaleString()} XP
          </Text>
        ) : (
          <Text style={styles.ratio}>XP</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  xpNumber: {
    color: '#1A1A1A',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: 34,
    lineHeight: 38,
  },
  smallXpNumber: {
    fontSize: 23,
    lineHeight: 28,
  },
  ratio: {
    color: '#7A7A7A',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default XpRing;
