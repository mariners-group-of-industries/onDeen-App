import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from './styles';
import Plus from '../../../src/assets/svg/plusBlue.svg';
import Minus from '../../../src/assets/svg/minusBlue.svg';

export default function AddYourTicketsContainer({ eventDetail, multiTicketCount, handleMultiDecrease, handleMultiIncrease }) {
    const priceType = eventDetail?.price_type;
    return (
        <View>
            {eventDetail?.tickets?.length > 0 && (
                <View style={styles.multiTicketContainer}>
                    <Text style={styles.multiTicketHeading}>Add your tickets</Text>
                    {eventDetail?.tickets?.map((ticket, index) => {
                        const quantity = multiTicketCount[ticket?.id] ?? 0;
                        const totalPrice = (
                            ticket?.price * (quantity > 0 ? quantity : 1)
                        ).toFixed(2);
                        const soldOut = ticket?.available - ticket?.booked;

                        return (
                            <View
                                key={ticket?.id || index}
                                style={styles.multiTicketItemContainer}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.multiTicketItemHeading}>
                                        {ticket?.title}
                                    </Text>
                                    <Text style={styles.multiTicketDescription}>
                                        Select quantity
                                    </Text>
                                </View>
                                {!quantity ? (
                                    soldOut == 0 ? (
                                        <View style={{ width: 90, alignSelf: 'flex-end' }}>
                                            <View
                                                style={[
                                                    styles.counterButtonAdd,
                                                    {
                                                        backgroundColor: '#FF4D4D',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    },
                                                ]}>
                                                <Text style={[styles.ticketCount, { color: '#fff' }]}>
                                                    Sold Out
                                                </Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{ width: 90, alignSelf: 'flex-end' }}>
                                            <TouchableOpacity
                                                accessibilityRole="button"
                                                accessibilityLabel={`Add ${ticket?.title || 'ticket'}`}
                                                style={styles.counterButtonAdd}
                                                activeOpacity={0.8}
                                                onPress={() => handleMultiIncrease(ticket?.id, soldOut)}>
                                                <Text style={[styles.ticketCount, { color: '#F9F6FD' }]}>Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                ) : (
                                    <View style={{ flexDirection: 'column', alignSelf: 'flex-end' }}>
                                        <View style={styles.counterButton}>
                                            <TouchableOpacity
                                                accessibilityRole="button"
                                                accessibilityLabel={`Decrease ${ticket?.title || 'ticket'} quantity`}
                                                activeOpacity={0.8}
                                                onPress={() => handleMultiDecrease(ticket?.id)}>
                                                <Minus />
                                            </TouchableOpacity>
                                            <Text
                                                accessibilityLabel={`${ticket?.title || 'Ticket'} quantity ${quantity}`}
                                                style={[styles.ticketCount, { color: '#422199' }]}
                                            >
                                                {quantity}
                                            </Text>
                                            <TouchableOpacity
                                                accessibilityRole="button"
                                                accessibilityLabel={`Increase ${ticket?.title || 'ticket'} quantity`}
                                                activeOpacity={0.8}
                                                onPress={() => handleMultiIncrease(ticket?.id, soldOut)}>
                                                <Plus />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                <Text style={styles.multiTicketPrice}>
                                    {priceType == 0
                                        ? 'Free'
                                        : `£ ${new Intl.NumberFormat('en-GB').format(ticket?.price)}`}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

        </View>
    )
}
