import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import ImageWithFallback from '../../components/ImageWithFallback';
import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import RightArrow from '../../../src/assets/svg/rightArrow.svg';
import ParticipantImages from '../../components/participants';
import ShowStatusComponent from './ShowStatusComponent';

export default function HorizontalCarousel({ displayedBookings, activeTab }) {
  const navigation = useNavigation();
  const openBookingDetails = (item) => {
    navigation.navigate('BookingDetails', {
      id: item?.event_id || item?.event?.id || item?.id,
      eventId: item?.event_id || item?.event?.id || item?.id,
      participant_id: item?.participant_id || item?.ticket_id,
      booking: item,
    });
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openBookingDetails(item)}
      style={[styles.activeBookingContainer, {}]}
    >
      <View style={[styles.bokkingItemsContainer,
        // { borderWidth: 0.2, borderColor: '#ddd', backgroundColor:'red' }
      ]}>
        <View style={{ width: '20%' }}>
          <ImageWithFallback
            imageurl={item.primary_image}
            style={styles.itemImage}
          />
        </View>
        <View style={{ width: '65%', paddingLeft: 30 }}>
          <View style={[styles.dateIconContainer]}>
            <CalendarIcon color={'#000'} width={11} height={11} />
            <Text style={styles.carouselDate}>
              {new Date(item.start_date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Text style={[styles.carouselItemTitle]}>
            {item?.title && item?.title?.length > 40
              ? `${item?.title?.substring(0, 40)}...`
              : item?.title || 'Untitled Event'}
          </Text>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', width: '100%',
            alignItems: 'center',
          }}>
            {activeTab !== 'completed' ? (
              <ShowStatusComponent item={item} activeTab={activeTab} />
            ) : <View />}
            {/* <View style={{ width: '50%' }}>
              {item?.status == 1 ? (
                <Text style={[styles.carouselLabel]}>
                  {activeTab == 'active' ? "Confirmed" : "Completed"}
                </Text>
              ) : (item?.status == 2 || item?.status == 4) ? (
                <Text style={[styles.carouselLabel]}>
                  Cancelled
                </Text>
              ) : (
                <Text style={[styles.carouselLabel]}>
                  Confirmed
                </Text>
              )}
            </View> */}
            <View style={{ width: activeTab === 'completed' ? 'auto' : '50%' }}>
              <View style={{ flexDirection: 'row', marginLeft: -5 }}>
                {activeTab !== 'completed' ? (
                  <Text style={styles.statusText}>{item.tags}</Text>
                ) : null}
                <ParticipantImages
                  item={{
                    participant_images: item?.participant_images,
                    total_participants_count: item?.total_participants_count,
                  }}
                  containerStyle={{}}
                  imageWrapperStyle={{
                    height: 22,
                    width: 22,
                    borderRadius: 22,
                    borderColor: '#E1E1E1',
                    borderWidth: 2,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F3F3',
                  }}
                  moreWrapperStyle={{
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 0,
                    height: 22,
                    width: 22,
                    borderRadius: 22,
                  }}
                  moreTextStyle={{
                    textAlign: 'center',
                    fontSize: 12,
                    bottom: 1,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={{ width: '15%' }}>

          <TouchableOpacity
            onPress={() => openBookingDetails(item)}
            style={styles.carouselItemContainer}
            activeOpacity={0.7}>
            <RightArrow />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View>
      <FlatList
        data={displayedBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item, index) => index?.toString()}
        style={{
          paddingBottom: 90,
        }}
      />
    </View>
  )
}
