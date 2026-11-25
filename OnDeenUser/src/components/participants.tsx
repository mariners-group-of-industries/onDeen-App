import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { widthScale } from '../helpers/scale';
import NoImage from '../assets/svg/NoImage.svg';
import { fontFamilies } from '../assets/fonts/fonts';

interface Props {
  item?: any;
  containerStyle?: StyleProp<ViewStyle>;
  imageWrapperStyle?: StyleProp<ViewStyle>;
  profileImageStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  moreWrapperStyle?: StyleProp<ViewStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
}

export default function ParticipantImages({
  item = {},
  containerStyle,
  imageWrapperStyle,
  profileImageStyle,
  imageStyle,
  moreWrapperStyle,
  moreTextStyle,
}: Props) {
  const images = item?.participant_images || [];

  return (
    Array.isArray(images) &&
    images.length > 0 && (
      <View style={[styles.imagesContainer, containerStyle]}>
        {images.slice(0, 3).map((imageItem, index) => (
          
          <View key={index} style={[styles.profileImageWrapper, imageWrapperStyle]}>
            <View style={[styles.profileImage, profileImageStyle]}>
              {imageItem?.profile_image ? (
                <Image
                  source={{ uri: imageItem?.profile_image ? imageItem?.profile_image :'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'}}
                  style={[styles.image, imageStyle]}
                  resizeMode="cover"
                />
              ) : (
                <Image source={{uri:'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'}} width={widthScale(28)} height={widthScale(28)} />
              )}
            </View>
          </View>
        ))}

        {item?.total_participants_count > 3 && (
          <View style={[styles.moreWrapper, moreWrapperStyle]}>
            <Text style={[styles.moreText, moreTextStyle]}>
              +{item.total_participants_count - 3}
            </Text>
          </View>
        )}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    padding: 4,
  },
  profileImageWrapper: {
    marginRight: -5,
  },
  profileImage: {
    width: widthScale(28),
    height: widthScale(28),
    borderRadius: widthScale(50),
    borderColor: '#E1E1E1',
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moreWrapper: {
    backgroundColor: '#3E146F',
    borderRadius: 90,
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -5,
  },
  moreText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});
