import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Dotsvertical from '../assets/svg/dots-vertical.svg';
import Mail from '../assets/svg/mail.svg';
import { fontFamilies } from '../assets/themes/fonts';

const DEFAULT_STATUS_BAR_COLOR = '#fdfdff';

const CustomHeader = ({
  title,
  leftIconName,
  imageSource,
  onLeftPress,
  onRightPress,
  statusBarColor = DEFAULT_STATUS_BAR_COLOR,
  titleStyle,
  leftIconStyle,
  rightIconStyle,
  containerStyle,
  imageStyle,
  rightImageStyle,
  secondRightImageStyle,
  rightImageSource,
  secondRightImageSource,
  rightIconName,
  translucent = false,
  onClickAskedQuestion,
  onClickDotsvertical,
  onEditPress,
  onRemovePress,
  onCompletePress,
  editEvent,
  cencelEvent,
  endEvent,
  showforeventDetails,
  profiledots,
  eventsdots
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleEditPress = () => {
    setIsDropdownVisible(false);
    editEvent()
  };

  const handleRemovePress = () => {
    setIsDropdownVisible(false);
    cencelEvent()
  };

  const handleCompletePress = () => {
    setIsDropdownVisible(false);
    endEvent()
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent={translucent}
        backgroundColor={statusBarColor}
      />
      <View style={[styles.container, containerStyle, { backgroundColor: statusBarColor }]}>
        {leftIconName && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onLeftPress}
            style={[styles.iconButton, leftIconStyle]}>
            <Icon name={leftIconName} size={24} color="#000" />
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          </TouchableOpacity>
        )}
        {rightIconName && (
          <TouchableOpacity onPress={onRightPress} style={[styles.iconButton, rightIconStyle]}>
            <Icon name={rightIconName} size={24} color="#000" />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {/* <Text style={[styles.title, titleStyle]}>{title}</Text> */}
        </View>
        <View style={styles.rightIconContainer} activeOpacity={0.6}>
        </View>
        {
          showforeventDetails &&
          <>
            <View style={styles.rightIconContainer} activeOpacity={0.6}>
              {rightImageSource && (
                <TouchableOpacity
                  accessibilityLabel="Asked questions"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={onClickAskedQuestion}>
                  <Mail />
                </TouchableOpacity>
              )}
              {secondRightImageSource && (
                <TouchableOpacity
                  accessibilityLabel="More actions"
                  accessibilityRole="button"
                  activeOpacity={0.6}
                  onPress={toggleDropdown}>
                  <Dotsvertical />
                </TouchableOpacity>
              )}
            </View>
          </>}
      </View >
      {
        showforeventDetails &&
        <>
          {isDropdownVisible && (
            <View style={styles.dropdownContainer}>
              {
                profiledots ?
                  <>
                    <TouchableOpacity onPress={handleEditPress} style={styles.dropdownButton}>
                      <Text style={styles.dropdownText}>Edit profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRemovePress} style={styles.dropdownButton}>
                      <Text style={styles.dropdownText}>Delete account</Text>
                    </TouchableOpacity>
                  </>
                  : eventsdots ?
                    <>
                      <TouchableOpacity onPress={handleEditPress} style={styles.dropdownButton}>
                        <Text style={styles.dropdownText}>Edit Event</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleRemovePress} style={styles.dropdownButton}>
                        <Text style={styles.dropdownText}>Cancel Event</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCompletePress} style={styles.dropdownButton}>
                        <Text style={styles.dropdownText}>End Event</Text>
                      </TouchableOpacity>
                    </>
                    :
                    <>
                      <TouchableOpacity onPress={handleCompletePress} style={styles.dropdownButton}>
                        <Text style={styles.dropdownText}>End Event</Text>
                      </TouchableOpacity>
                    </>
              }
            </View>
          )}
        </>
      }


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
    fontSize: fontScale(18),
    fontWeight: '600',
    fontFamily:fontFamilies.SFProRoundedBlackMedium
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
    padding: 10

  },
  dropdownText: {
    fontWeight: '500',
    color: '#333',
    fontSize: fontScale(12),
    fontWeight: '600',
    fontFamily:fontFamilies.SFProRoundedBlackMedium
  },
});

export default CustomHeader;
