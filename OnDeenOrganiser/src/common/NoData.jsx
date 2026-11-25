import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { fontFamilies } from '../assets/themes/fonts';

export default function NoData({ title = 'No Data Found' }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 14,
        color: '#999',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },

});
