import { View, Text } from 'react-native';
import React from 'react';
import styles from './styles';

export default function YouPayContainer({ eventDetail, price, multiTicketCount, ticketCount }) {
  // Calculate total price based on price type
  const calculateTotalPrice = () => {
    if (eventDetail?.price_type == 0) {
      if (eventDetail?.tickets?.length > 0) {
        let totalPrice = 0;
        eventDetail.tickets.forEach(ticket => {
          const quantity = multiTicketCount[ticket?.id] || 0;
          totalPrice += ticket?.price * quantity;
        });
        return totalPrice;
      }
      return eventDetail?.price * ticketCount;
    }
    return 0;
  };

  const totalPrice = calculateTotalPrice();
  const showPrice = eventDetail?.price_type == 0;

  if (!showPrice) return null;

  return (
    <View style={styles.container}>
      <View style={styles.lastContainer}>
        <View style={styles.gradientTextContainer}>
          <Text style={styles.priceLastText}>You Pay</Text>
          {totalPrice > 0 ? (
            <Text style={styles.priceText}>
              £{new Intl.NumberFormat('en-GB').format(totalPrice)} Only
            </Text>
          ) : (
            <Text style={styles.priceText}>Select tickets</Text>
          )}
        </View>
      </View>
    </View>
  );
}