import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles';
import SlotCard from '../../components/SlotCard';
import moment from 'moment';

export default function SelectDateSLOTContainer({
    dateArray,
    eventDetail,
    handleDateSelect,
    setSelectedSlot,
    slotData,
    selectedSlot,
    selectedDate
}) {
    const renderDateItem = ({ item }) => {
        const dateObj = new Date(item.date);
        const day = dateObj.getDate();
        const weekday = dateObj.toLocaleString('en-us', { weekday: 'short' });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.dateItem,
                    {
                        backgroundColor: item?.status == 2 ? '#EFEAF3' : '#EFEAF3',
                        opacity: item?.status == 2 ? 0.5 : 1,
                    },
                    selectedDate == item.id && styles.selectedDateItem,
                ]}
                disabled={item?.status == 2}
                onPress={() => handleDateSelect(item.id)}
            >
                <Text style={[styles.dateText, selectedDate == item.id && { color: '#FFFFFF' }]}>
                    {day}
                </Text>
                <Text style={[styles.dayText, selectedDate == item.id && { color: '#FFFFFF' }]}>
                    {weekday}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View>
            {dateArray?.length > 0 && [3, 4, 9]?.includes(eventDetail?.category_id) && (
                <View style={[styles.dateContainer, { marginTop: 18 }]}>
                    <View>
                        <Text style={[styles.selectTicket, { paddingVertical: 8 }]}>
                            SELECT A DATE
                        </Text>
                        <FlatList
                            data={dateArray.filter(item =>
                                item.status && moment(item.date).isSameOrAfter(moment(), 'day')
                            )}
                            horizontal
                            keyExtractor={item => item.id}
                            renderItem={renderDateItem}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                </View>
            )}

            {dateArray?.length > 0 && slotData?.length > 0 && (
                <View
                    style={{
                        marginHorizontal: 24,
                        borderBottomWidth: 1,
                        borderBottomColor: '#C2C2C2',
                        paddingBottom: 24,
                    }}>
                    <Text
                        style={[
                            styles.selectTicket,
                            { paddingVertical: 8, marginTop: 12 },
                        ]}>
                        CHOOSE A SLOT
                    </Text>
                    <FlatList
                        data={slotData}
                        keyExtractor={item => item?.id?.toString()}
                        numColumns={3}
                        renderItem={({ item }) => (
                            <SlotCard
                                item={item}
                                time_zone={item?.time_zone}
                                time={item?.start_time}
                                seatsLeft={item?.available - item?.booked}
                                isSelected={selectedSlot == item?.id}
                                onPress={() => setSelectedSlot(item?.id)}
                            />
                        )}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    )
}