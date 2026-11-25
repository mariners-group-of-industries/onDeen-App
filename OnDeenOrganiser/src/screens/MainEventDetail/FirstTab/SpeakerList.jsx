import React from 'react';
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { fontScale, heightScale, widthScale } from '../../../helpers/scale';
import { fontFamilies } from '../../../assets/themes/fonts';

const SpeakerList = ({ eventbyid }) => {
  const speakers = Array.isArray(eventbyid?.speakers) ? eventbyid.speakers : [];

  return (
    <View style={[styles.container]}>
      {/* ScrollView takes full height */}
      <ScrollView contentContainerStyle={styles.speakerContainer}>
        <Text style={styles.speakerText}>Event Speakers</Text>
        <View style={styles.rowContainer}>
          {
            Array.isArray(speakers) && speakers?.map((item, index) => (
              <View style={styles.speakerImageContainer} key={index}>
                <Image
                  style={styles.speakerImage}
                  source={{ uri: item?.profile_image }}
                />
                <Text style={styles.speakerName}>
                  {item?.first_name} {item?.last_name}
                </Text>
              </View>
            ))
          }
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -8
  },
  speakerContainer: {
    backgroundColor: '#FFFBF1',
    borderRadius: widthScale(32),
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    gap: widthScale(12),
    elevation: 1,
    flexGrow: 1,
  },
  speakerText: {
    color: '#17101F',
    fontSize: heightScale(14),
    fontWeight: '500',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  speakerImage: {
    height: 42,
    width: 42,
    borderRadius: widthScale(90),
    borderWidth: heightScale(1),
    borderColor: '#F9F6FD',
  },
  speakerImageContainer: {
    borderRadius: widthScale(50),
    padding: 4,
    borderColor: '#DFD7D0',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthScale(12),
    minWidth: widthScale(170),
  },
  speakerName: {
    color: '#17101F',
    paddingRight: 14,
    fontWeight: '500',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  rowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: widthScale(6),
  },
});

export default SpeakerList;
