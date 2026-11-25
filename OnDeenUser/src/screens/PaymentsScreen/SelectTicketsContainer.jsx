import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import styles from './styles';
import { useToastForPopup } from '../../context/ToastContext';
import Plus from '../../../src/assets/svg/plusBlue.svg';
import Minus from '../../../src/assets/svg/minusBlue.svg';
import { ticketSelectionHint } from '../../helpers/ticketSelection';

export default function SelectTicketsContainer({
    eventDetail,
    setTicketCount,
    setShowCounter,
    handleDecrease,
    handleIncrease,
    showCounter,
    ticketCount
}) {
    const showToast = useToastForPopup();
    const ticketsArray = eventDetail?.tickets || [];
    const hasTickets = ticketsArray.length > 0;

    const renderTicketCounter = () => {
        const availableTickets = Math.max((eventDetail?.available ?? 0) - (eventDetail?.booked ?? 0), 0);

        if (!showCounter) {
            if (availableTickets == 0) {
                return (
                    <View style={[styles.counterButtonAdd, { backgroundColor: 'red' }]}>
                        <Text style={[styles.ticketCount, { color: '#fff' }]}>Sold Out</Text>
                    </View>
                );
            }
            return (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Add ticket"
                    style={styles.counterButtonAdd}
                    onPress={() => {
                        if (availableTickets <= 0) {
                            showToast('You cannot book this event because tickets are not available');
                            return;
                        }
                        setTicketCount(1);
                        setShowCounter(true);
                    }}
                >
                    <Text style={[styles.ticketCount, { color: '#F9F6FD' }]}>Add</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.counterButton}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease ticket quantity"
                    style={{
                        height: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4,
                    }}
                    onPress={handleDecrease}
                >
                    <Minus />
                </Pressable>
                <Text accessibilityLabel={`Ticket quantity ${ticketCount}`} style={styles.ticketCount}>{ticketCount}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase ticket quantity"
                    style={{
                        height: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 6,
                    }}
                    onPress={handleIncrease}
                >
                    <Plus />
                </Pressable>
            </View>
        );
    };

    if (hasTickets) {
        return null; // Or render multi-ticket UI if needed
    }

    return (
        <View style={[styles.ticketsContainer]}>
            <View>
                <Text style={styles.selectTicket}>SELECT TICKETS</Text>
                <Text style={styles.ticketLabel}>
                    {ticketSelectionHint(eventDetail?.quantity_per_user)}
                </Text>
                {[3, 4, 9].includes(eventDetail?.category_id) && (
                    <Text style={styles.ticketLabel}>Duration {eventDetail?.duration || 1} Hour</Text>
                )}
            </View>
            {renderTicketCounter()}
        </View>
    );
}
