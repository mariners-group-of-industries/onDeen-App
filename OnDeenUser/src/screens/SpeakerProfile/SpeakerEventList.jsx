import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WishlistButton from '../../components/WishlistButton';
import TouchableLabel from '../../components/customLabels';
import styles from './styles';

const { width: screenWidth } = Dimensions.get('window');

const SpeakerEventList = ({ events, navigation, speakerId, organizerId, type = "" }) => {
  const fourthCarouselRef = React.useRef(null);

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEventPress = (id, title) => {
    navigation.navigate('CourseDetails', {
      eventId: id,
      eventName: title,
    });
  };

  const renderItem = ({ item }) => {
    const imageSource = item?.primary_image
      ? { uri: item.primary_image }
      : require('../../assets/images/dummy1.png');
    const formattedStartDate = item?.start_date
      ? formatDate(item.start_date)
      : null;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title || 'event'} from ${type === 'organiser' ? 'organiser' : 'speaker'} profile`}
        onPress={() => handleEventPress(item.id, item.title)}
        activeOpacity={0.6}
        style={[styles.carouselSecondaryItem, {
          backgroundColor: '#fff', borderRadius: 24,
          paddingBottom: 5,
          borderWidth: 0.4,
          borderColor: '#ddd'
        }]}>
        <ImageBackground
          source={imageSource}
          style={styles.carouselSecondaryImage}
          imageStyle={styles.imageBorderRadius}>
          <View style={styles.touchableLabelSecondaryContainer}>
            <View style={{ backgroundColor: "#00000066", padding: 7, borderRadius: 20 }}>
              <WishlistButton
                item={item}
                type={type === 'organiser' ? 'organizerid' : 'speackerid'}
                organizerid={organizerId}
                speackerid={speakerId}
              />
            </View>
          </View>
        </ImageBackground>
        <View style={{ width: '100%', paddingHorizontal: 15, }}>
          <View style={styles.dateIconContainer}>
            <Text style={[styles.carouselTitle, { paddingTop: 5 }]}>
              {item.title && item.title.length > 35
                ? `${item.title.substring(0, 35)}...`
                : item.title || 'Untitled Event'}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            marginVertical: 8,
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',

          }}>
            <View style={{ width: '60%' }}>
              <View style={[styles.dateIconSecondContainer, {
                flexDirection: 'row',
                justifyContent: 'space-between'
              }]}>
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Icon name={'calendar-blank-outline'} size={16} color="#000000" />
                  <Text style={styles.carouselDate}>{formattedStartDate}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: '40%', justifyContent: 'flex-end', }}>
              <TouchableLabel
                label={(item.price_type == 1 && item.price > 0) ? `£ ${item?.price}` : 'FREE'}
                onPress={() => { }}
                containerStyle={
                  (item.price_type == 1 && item.price > 0)
                    ? styles.customLableCarouselSecondaryContainer
                    : styles.priceContainerFree
                }
                labelStyle={styles.customLableSecondaryCarousel}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!events || events.length == 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text>No events found</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselFourthContainer}>
      <Carousel
        ref={fourthCarouselRef}
        data={events}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.44}
        inactiveSlideScale={0.86}
        inactiveSlideOpacity={0.95}
        pinchGestureEnabled={true}
        useScrollView={true}
        getItemLayout={(data, index) => ({
          length: screenWidth * 0.624,
          offset: screenWidth * 0.624 * index,
          index,
        })}
        removeClippedSubviews={true}
        activeSlideAlignment="start"
        layout="default"
        windowSize={5}
        maxToRenderPerBatch={5}
        swipeThreshold={5}
        enableSnap={true}
        enableMomentum={true}
        keyExtractor={item => item.id?.toString()}
      />
    </View>
  );
};

export default SpeakerEventList;
