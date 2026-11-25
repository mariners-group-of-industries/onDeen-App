import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import Video from '../../assets/svg/video.svg';
import ImageWithFallback from '../../components/ImageWithFallback';
import { getDateFormate, getOnlyDayName } from '../../components/datetimeformate';
import { formatSessionTime } from '../../timezone/maintimezone';

const OneToOneSessionList = ({ sessions, onSessionPress, type = "upcoming" }) => {
  const renderSessionItem = ({ item }) => {
    const speakerName =
      item?.speaker_first_name && item?.speaker_last_name
        ? `${item.speaker_first_name} ${item.speaker_last_name}`
        : 'Name not available';

    const status = Number(item?.status);
    const disable = type == "completed" || [2, 4, 6].includes(status);
    const sessionStateLabel = status == 0
      ? 'Pending approval'
      : status == 2
        ? 'Cancelled'
        : status == 3
          ? 'Approved — awaiting details'
          : status == 4
            ? 'Declined'
            : status == 5
              ? 'Reschedule requested'
              : status == 6 || type == 'completed'
                ? 'Completed'
                : item?.meet_link
                  ? 'Join Meeting'
                  : item?.location
                    ? item.location
                    : 'Confirmed';
    const displayTime = formatSessionTime(
      item?.date,
      item?.time,
      item?.time_zone,
    );

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open one-to-one session with ${speakerName} on ${item?.date} at ${displayTime}, ${sessionStateLabel}`}
        accessibilityState={{ disabled: disable }}
        disabled={disable} // disables touch
        onPress={() => onSessionPress(item)}
        style={[
          styles.sessionItem,
          { opacity: disable ? 0.9 : 1 } // fade if disabled
        ]}
      >
        <View style={{
          flexDirection: 'row',
          // backgroundColor: 'red',
        }}>
          <View style={{
            // backgroundColor: 'green',
            width: '15%'
          }}>
            <ImageWithFallback
              resizeMode="cover"
              imageurl={item.speaker_image}
              style={styles.profileImage}
            />
          </View>
          <View style={{
            // backgroundColor: 'yellow',
          }}>
            <Text style={styles.sessionName}>{speakerName}</Text>
            <View style={{  }}>
              <Text style={styles.sessionDate}>
                {`${getOnlyDayName(item?.date)} ${getDateFormate(item?.date)}, ${displayTime}`}
              </Text>
            </View>
            <View style={{  }}>
              {item?.meet_link && status == 1 ? (
                <View style={styles.meetingRow}>
                  <Video />
                  <Text style={styles.meetLabel}>Join Meeting </Text>
                </View>
              ) : (
                <View style={[styles.meetingRow]}>
                  <Text style={[styles.meetLabel]}>{sessionStateLabel}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={sessions}
      renderItem={renderSessionItem}
      keyExtractor={item => item.id?.toString()}
    />
  );
};

export default OneToOneSessionList;
