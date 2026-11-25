import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Dotsvertical from '../assets/svg/dots-vertical.svg';
import Editnotes from '../assets/svg/editnotes.svg';
import Skip from '../assets/svg/Skip.svg';
import { fontFamilies } from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';
import { useDropdown } from '../context/DropdownContext';
import { CalendarPlus, ChevronLeft } from 'lucide-react-native';

const DEFAULT_STATUS_BAR_COLOR = '#F9F6FD';
const LatestHeader = ({
  title,
  leftIconName,
  onLeftPress,
  onRightPress,
  statusBarColor = DEFAULT_STATUS_BAR_COLOR,
  titleStyle,
  containerStyle,
  leftIconStyle,
  rightIconStyle,
  rightImageSource,
  secondRightImageSource,
  rightIconName,
  onClickAskedQuestion,
  showforeventDetails,
  skipimage,
  isDownloadAll,
  onDownloadAllPress,
  isDownloadStyle,
  upgradeMembership = false,
  showIcon = true,
  isTextClickable = true,
  eventStatus = true,
  add_calender = false,
  handleAddToCalendar,
  signup = false,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigation = useNavigation();
  const toggleDropdown1 = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };
  const onpressleftarraow = () => {
    navigation.navigate('MainNavigator');
  };
  const upgradeMembershipmove = () => {
    navigation.navigate('Membership', { lastscreen: 'MyMembership' });
  };

  const { dropdownState, toggleDropdown } = useDropdown();
  const isVisible = dropdownState?.isVisible;

  useEffect(() => {
    setIsDropdownVisible(isVisible)
  }, [isVisible])

  const toggleDropdownAction = () => {
    setIsDropdownVisible(!isDropdownVisible);
    toggleDropdown()
  };
  return (
    <>

      <View
        style={[
          styles.container,
          { backgroundColor: statusBarColor || '#fff' },
          containerStyle,
        ]}>
        {leftIconName && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Back${title ? `, ${title}` : ''}`}
            onPress={showIcon && typeof onLeftPress === 'function' ? onLeftPress : undefined}
            style={[styles.iconButton, leftIconStyle]}>
            {showIcon && <ChevronLeft size={22} color="#000" />}
            <Text onPress={isTextClickable && typeof onLeftPress === 'function' ? onLeftPress : undefined} style={[styles.title, titleStyle]}>{title}</Text>
          </Pressable>
        )}
        {isDownloadAll && (
          <Text
            style={[styles.title1, isDownloadStyle]}
            onPress={onDownloadAllPress}>
            Download All
          </Text>
        )}
        {rightIconName && (
          <Pressable
            onPress={onRightPress}
            style={[styles.iconButton, rightIconStyle]}>
            <Icon name={rightIconName} size={24} color="#000" />
          </Pressable>
        )}
        {skipimage && (
          <View style={styles.rightIconContainer} activeOpacity={0.6}>
            <Pressable
              onPress={onpressleftarraow}
              style={[styles.iconButton, rightIconStyle]}>
              <Skip />
            </Pressable>
          </View>
        )}
        {showforeventDetails && (
          <>
            <View style={styles.rightIconContainer} activeOpacity={0.6}>
              {add_calender &&
                <Pressable
                  accessibilityLabel="Add to calendar"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={handleAddToCalendar}>
                  <CalendarPlus color="#333" size={24} strokeWidth={1.5} />
                </Pressable>
              }
              {rightImageSource == 2 && (
                <Pressable
                  accessibilityLabel="Create note"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={onClickAskedQuestion}>
                  <Editnotes />
                </Pressable>
              )}
              {rightImageSource == 3 && (
                <Pressable
                  accessibilityLabel="Create note"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={onClickAskedQuestion} style={{paddingRight:12}}>
                  <Editnotes />
                </Pressable>
              )}

              {secondRightImageSource && (
                <Pressable
                  accessibilityLabel="More actions"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={() => { toggleDropdownAction(); toggleDropdown1() }}
                >
                  {eventStatus == false ? <></> : <><Dotsvertical /></>}
                </Pressable>
              )}
            </View>
          </>
        )}
        {upgradeMembership && (
          <>
            <View style={styles.rightIconContainer} activeOpacity={0.6}>
              <Pressable
                activeOpacity={0.6}
                onPress={upgradeMembershipmove}>
                <Text>Upgrade Membership</Text>
              </Pressable>
            </View>
          </>
        )}
        {
          signup &&
          <>
            <View style={styles.rightIconContainer} activeOpacity={0.6}>
              <Pressable
                activeOpacity={0.6}
                onPress={onLeftPress}>
                <Text style={[styles.title, titleStyle, { paddingRight: 10 }]}>Sign-Up</Text>
              </Pressable>
            </View>
          </>
        }
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FFF',
    // paddingTop: 24
  },
  iconButton: {
    padding: fontScale(8),
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#000000',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  title1: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingRight: 12
  },
  image: {
    width: widthScale(16),
    height: heightScale(16),
    marginRight: widthScale(8),
  },
  rightIconContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  dropdownContainer: {
    position: 'absolute',
    top: heightScale(50),
    right: widthScale(16),
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    width: widthScale(130),
    paddingVertical: heightScale(10),
    paddingHorizontal: widthScale(10),
    zIndex: 999,
  },
  dropdownButton: {
    paddingVertical: heightScale(5),
    borderRadius: 12,
    backgroundColor: '#FDFBFF',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#000000',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default LatestHeader;
