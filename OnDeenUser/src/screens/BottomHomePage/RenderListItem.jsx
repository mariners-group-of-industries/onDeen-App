import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { heightScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import ImageWithFallback from '../../components/ImageWithFallback';
import WishlistButton from '../../components/WishlistButton';
import styles from './styles';
import { formatTimeOnly } from '../../timezone/maintimezone';

const RenderListItem = ({ eventlist, navigation }) => {
  const formatDate = (item) => {
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    const hasStartDate = !isNaN(startDate.getTime());
    const hasEndDate = !isNaN(endDate.getTime());
    const startTime = item?.start_time
      ? formatTimeOnly(item?.start_time, item?.time_zone, 'time-only')
      : '';

    if (!hasStartDate) {
      return 'Date TBC';
    }

    const compactTime = startTime
      .replace(/^0/, '')
      .replace(':00', '')
      .replace(' AM', ' am')
      .replace(' PM', ' pm');

    if (item.category_id == 2) {
      return `${startDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })}${compactTime ? ` · ${compactTime}` : ''}`;
    } else if ((item.category_id == 3 || item.category_id == 4 || item.category_id == 9) && hasEndDate) {
      return `${startDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      })} - ${endDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      })}`;
    }
    return `${startDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })}${compactTime ? ` · ${compactTime}` : ''}`;
  };

  const formatPrice = (item) => {
    if (item?.price_type != 1) {
      return 'FREE';
    }

    const numericPrice = Number(item?.ticket_price ?? item?.price);
    return Number.isFinite(numericPrice) && numericPrice > 0
      ? `£ ${new Intl.NumberFormat('en-GB').format(numericPrice)}`
      : 'FREE';
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item?.title || 'event'}`}
      onPress={() => {
        const eventId = item?.id || item?.event_id || item?.event?.id;
        navigation.navigate('CourseDetails', {
          eventId,
          id: eventId,
          event_id: eventId,
          event: item,
        });
      }}
      style={styles.activeBookingContainer}>
      <View style={styles.bokkingItemsContainer}>
        <ImageWithFallback
          imageurl={item?.primary_image}
          style={styles.itemImage}
        />
        <View style={styles.activeBookingSubContainer}>
          <View>
            <View style={styles.dateIconContainer}>
              <View style={styles.eventMetaRow}>
                <View
                  style={{
                    height: 22,
                    width: 22,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FFE0EB',
                  }}>
                  <ImageWithFallback
                    imageurl={item?.category_image}
                    style={[styles.image, { width: 18, height: 18 }]}
                  />
                </View>
                <Text style={styles.eventDate} numberOfLines={1}>
                  <Text style={styles.eventCategory}>{item?.category_title || 'Event'}</Text>
                  {'  '}{formatDate(item)}
                </Text>
              </View>
              <View style={styles.listHeartContainer}>
                <WishlistButton item={item} type="homepage" />
              </View>
            </View>
            <Text style={styles.carouselItemTitle} numberOfLines={1} ellipsizeMode="tail">
              {item?.title || 'Untitled Event'}
            </Text>
            {item?.organization_name && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    color: '#161616',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                    paddingRight: 90,
                    lineHeight: 16
                  }}>
                  {item?.organization_name}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {item?.price_type == 1 && item?.ticket_price != null && (
              <Text
                style={{
                  fontSize: 12,
                  color: '#161616',
                  lineHeight: 14,
                  fontFamily: fontFamilies.SFProRoundedBlackRegular,
                }}>
                Starts From:
              </Text>
            )}

            <Text
              style={{
                fontSize: 12,
                color: item?.price_type == 1 ? '#161616' : '#28B446',
                fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
              }}>
              {formatPrice(item)}
            </Text>
          </View>
          <View>
            {Number(item?.location_type) === 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'flex-end',
                  bottom: 22,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#45C624',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                  }}>
                  Online
                </Text>
              </View>
            ) : Number(item?.location_type) === 2 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  justifyContent: 'flex-end',
                  bottom: 22,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#422199',
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                  }}>
                  Hybrid
                </Text>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    justifyContent: 'flex-end',
                    bottom: 16,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#161616',
                      lineHeight: 14,
                      fontFamily: fontFamilies.SFProRoundedBlackRegular,
                    }}>
                    {Number.isFinite(Number(item?.distance)) ? `${item?.distance} mi` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={eventlist}
      renderItem={renderBookingItem}
      keyExtractor={(item, index) => item?.id?.toString() || index?.toString()}
      style={{
        paddingBottom: heightScale(90),
      }}
      nestedScrollEnabled={true}
    />
  );
};

export default RenderListItem;
