import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { widthScale } from './scale';
import { fontFamilies } from '../assets/fonts/fonts';
import All from '../../src/assets/svg/all.svg';
import EventsIcon from '../../src/assets/images/Events.svg';
import CoursesIcon from '../../src/assets/images/Courses.svg';
import ToursIcon from '../../src/assets/images/Tours.svg';
import SeminarsIcon from '../../src/assets/images/Seminars.svg';

const getCategoryIcon = (name = '') => {
  const value = `${name}`.toLowerCase();

  if (value.includes('course') || value.includes('class') || value.includes('quran')) {
    return CoursesIcon;
  }

  if (value.includes('tour') || value.includes('mosque')) {
    return ToursIcon;
  }

  if (value.includes('seminar') || value.includes('workshop')) {
    return SeminarsIcon;
  }

  if (
    value.includes('event') ||
    value.includes('community') ||
    value.includes('charity') ||
    value.includes('service')
  ) {
    return EventsIcon;
  }

  return EventsIcon;
};

const ListItem = ({
  name,
  onPress,
  selected = false,
  gradientColors = ['rgba(255, 174, 204, 0.6)', 'rgba(255, 216, 97, 0.4)'],
  isAllItem = false,
}) => {
  const selectedBorderGradient = selected
    ? ['rgba(255, 174, 204, 0.4)', 'rgba(255, 216, 97, 0.3)']
    : gradientColors;
  const CategoryIcon = isAllItem ? All : getCategoryIcon(name);

  return (
    <LinearGradient
      colors={selectedBorderGradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradientBorder}>
      <LinearGradient
        colors={selected ? selectedBorderGradient : ['#FFFFFF', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.itemContainer}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.touchable}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${name}`}
          accessibilityState={{ selected }}>
          <CategoryIcon width={58} height={58} style={styles.image} />
          <Text style={styles.name}>{name}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 2,
    borderRadius: widthScale(28),
    marginHorizontal: 4,
    marginVertical: 12,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 114,
    width: 84,
    borderRadius: widthScale(28),
    gap: 4,
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    borderRadius: widthScale(28),
  },
  image: {
    alignItems: 'center',
    width: 58,
    height: 58,
  },
  name: {
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#161616',
    textAlign: 'center'
  },
});

export default ListItem;
