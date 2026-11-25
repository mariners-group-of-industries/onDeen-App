import { View, Text } from 'react-native'
import React from 'react'
import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import TouchableLabel from '../../components/customLabels';
import styles from './styles';
import Payment from '../../../src/assets/svg/payment.svg';
import PriceDisplay from '../../components/PriceDisplay';
import { getEventPrice } from '../FirstEventDetailsPage/getpricevalue';

export default function BookingforContainer({ eventDetail }) {

    const formatDate = dateString => {
        if (!dateString || dateString == '0000-00-00 00:00:00') return 'Date TBA';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date TBA';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const startDate = formatDate(eventDetail?.start_date);
    const finalDisplayPrice = getEventPrice(eventDetail);

    return (
        <View>
            <View style={{
                marginTop: 27,
                paddingHorizontal: 24,
                gap: 8,
            }}>
                <Text style={styles.bookingLabel}>Booking for</Text>
                <View style={{
                    gap: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#C2C2C2',
                    width: '100%',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        width: '60%',
                        alignItems: 'center',
                        paddingBottom: 10,
                        alignItems: 'flex-start'
                    }}>
                        <Payment />
                        <View style={{ paddingLeft: 10, alignItems: 'flex-start', paddingTop: 5 }}>
                            <Text style={styles.bookingTitle}>{eventDetail?.title}</Text>
                            <View style={styles.dateSubContainer}>
                                <CalendarIcon />
                                <Text style={styles.carouselDate}>{startDate}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', width: '40%', justifyContent: 'flex-end' }}>
                        <PriceDisplay price={finalDisplayPrice} />
                    </View>
                </View>
            </View>
        </View>
    )
}