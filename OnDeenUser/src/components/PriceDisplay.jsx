import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontFamilies } from '../assets/fonts/fonts';

export default function TicketPrice({ price = 'FREE' }) {
    const displayPrice = typeof price === 'string' && price.toLowerCase() === 'free'
        ? 'FREE'
        : price;
    const isFree = displayPrice === 'FREE';

    return (
        <View style={styles.ticketContainer}>
            <View style={[styles.ticketBody, { backgroundColor: isFree ? '#C8F9AA' : '#F9DE9C' }]}>
                <View style={styles.ticketInner}>
                    <Text style={styles.priceText} numberOfLines={1}>{displayPrice}</Text>
                </View>
            </View>
            <View style={styles.circleLeft} />
            <View style={styles.circleRight} />
        </View>
    );
}

const styles = StyleSheet.create({
    ticketContainer: {
        position: 'relative',
        alignSelf: 'center',
        height: 32,
    },
    ticketBody: {
        backgroundColor: '#F9DE9C',
        paddingVertical: 4,
        paddingHorizontal: 8,
        height: '100%', // Take full height of container
    },
    ticketInner: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#000',
        paddingHorizontal: 8,
        borderRadius: 5,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center', // Center text horizontally
    },
    priceText: {
        fontSize: 16,
        fontFamily: fontFamilies.SFProRoundedBlackBold,
        color: '#000',
        textAlignVertical: 'center', // Better vertical alignment
    },
    circleLeft: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 100,
        backgroundColor: '#fff',
        left: -3,
        top: '50%',
        marginTop: -6,
    },
    circleRight: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 100,
        backgroundColor: '#fff',
        right: -3,
        top: '50%',
        marginTop: -6,
    },
});
