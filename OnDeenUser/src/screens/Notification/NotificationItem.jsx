import React, { useRef, useMemo } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Bell from '../../../src/assets/svg/bell.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import { extractNotificationLinks, isOnDeenUrl, openNotificationLink } from '../../helpers/notificationLinks';

const MAX_SWIPE = -100;
const DELETE_TRIGGER = -60;

const NotificationItem = React.memo(({
  user,
  onPress,
  onDelete,
  onLinkError,
  authToken,
  bearerToken,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const linkPressInFlight = useRef(false);
  const navigation = useNavigation();
  const messageParts = useMemo(() => {
    const message = String(user?.message || '');
    const linkUrl = String(user?.link_url || '').trim();
    const completeMessage = linkUrl && !message.includes(linkUrl)
      ? `${message}${message ? ' ' : ''}${linkUrl}`
      : message;
    return extractNotificationLinks(completeMessage);
  }, [user?.link_url, user?.message]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 5,
        onPanResponderMove: (_, { dx }) => {
          if (dx < 0) {
            translateX.setValue(Math.max(dx, MAX_SWIPE));
          }
        },
        onPanResponderRelease: (_, { dx, vx }) => {
          if (dx < DELETE_TRIGGER || vx < -0.5) {
            Animated.spring(translateX, {
              toValue: MAX_SWIPE,
              useNativeDriver: true,
              speed: 15,
              bounciness: 10,
            }).start();
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 8,
            }).start();
          }
        },
      }),
    [translateX],
  );

  const handlePress = () => {
    if (linkPressInFlight.current) {
      linkPressInFlight.current = false;
      return;
    }

    onPress(user);
    
    switch (Number(user?.type)) {
      case 4:
        navigation.navigate('OneToOneSession', { data: user });
        break;
      case 2:
        navigation.navigate('CourseDetails', { eventId: user?.event_id });
        break;
      case 7:
        navigation.navigate('BookingDetails', { id: user?.event_id });
        break;
      case 3:
      case 5:
      case 6:
        navigation.navigate('BookingDetails', { id: user?.event_id });
        break;
      case 8:
        navigation.navigate('BookingDetails', {
          id: user?.event_id,
          bookingListType: 'completed',
        });
        break;
      case 9:
        navigation.navigate('BookingDetails', {
          id: user?.event_id,
          initialTab: 'qa',
        });
        break;
      default:
        break;
    }
  };

  const handleLinkPress = async (url) => {
    linkPressInFlight.current = true;
    onPress(user);
    const result = await openNotificationLink(url, navigation, { authToken, bearerToken });
    if (!result.ok) {
      onLinkError?.(result.message);
    }
    setTimeout(() => {
      linkPressInFlight.current = false;
    }, 300);
  };

  const getMessageText = (type, defaultMessage) => {
    switch (Number(type)) {
      case 4:
        return 'Session update!';
      case 2:
        return 'View Event';
      case 3:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return 'View Event';
      default:
        return defaultMessage;
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.deleteButtonWrapper}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.animatedContainer, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          accessible={false}
          activeOpacity={0.9}
          onPress={handlePress}
          style={styles.container}>
          <View style={styles.userInfoContainer}>
            <LinearGradient
              colors={['rgba(255, 174, 204, 0.4)', 'rgba(255, 216, 97, 0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bellContainer}>
              <Bell width={20} height={20} />
            </LinearGradient>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{user?.title}</Text>
              <View accessible={false} style={styles.messageParts}>
                {messageParts.map((part, index) => {
                  if (part.type !== 'link') {
                    return <Text key={`${index}-text`} style={styles.name}>{part.text}</Text>;
                  }
                  return (
                    <Text
                      key={`${index}-link`}
                      onPress={() => handleLinkPress(part.url)}
                      accessibilityRole="link"
                      accessibilityLabel={`Open link ${part.url}`}
                      style={styles.linkText}
                    >
                      {part.text}
                      {!isOnDeenUrl(part.url) ? <Text style={styles.linkIndicator}> [external]</Text> : null}
                    </Text>
                  );
                })}
              </View>
              <Text onPress={handlePress} style={styles.status}>
                {getMessageText(user?.type, user?.message)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 98,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(233,226,242,1)',
    backgroundColor: '#FDFBFF',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  bellContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 17,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#17101F',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  name: {
    color: '#17101F',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    flexShrink: 1,
  },
  messageParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    width: '100%',
  },
  linkText: {
    color: '#3E146F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
    flexShrink: 1,
    textDecorationLine: 'underline',
  },
  linkIndicator: {
    color: '#6F6878',
    fontSize: 11,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    textDecorationLine: 'none',
  },
  status: {
    color: '#DB3171',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingTop: 9,
  },
  deleteButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  wrapper: {
    width: '100%',
    backgroundColor: '#FDFBFF',
    overflow: 'hidden',
  },
  deleteButtonWrapper: {
    backgroundColor: '#FF3B30',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  animatedContainer: {
    backgroundColor: '#FDFBFF',
  },
});

export default NotificationItem;
