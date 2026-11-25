import { View, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import ComingSoon from '../../assets/json/coming_soon_clear.json';

const { width, height } = Dimensions.get('window');

export default function ComingAnimation() {
    return (
        <View style={styles.container}>
            <LottieView
                source={ComingSoon}
                autoPlay
                loop
                style={styles.animation}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
        marginHorizontal: 22,
        marginLeft: 0,
        height:200,
        marginBottom:-30
    },
    animation: {
        width: width * 1,
        height: height * 0.3,
    },
});