import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientButton from '../../components/gradientButton';
import Checkcircle from '../../assets/svg/checkcircle.svg';
import { useNavigation } from '@react-navigation/native';
import { fontFamilies } from '../../assets/themes/fonts';

const QRVerificationScreen = ({ message, apiresponce, resetScan }) => {
    const navigation = useNavigation();

    const handleScan = () => {
        navigation.goBack();
    };

    const scanAgain = () => {
        resetScan();
    };

    const isVerified = apiresponce?.status === true;

    return (
        <View style={styles.container}>
            <View style={styles.successContainer}>
                {isVerified && <Checkcircle />}

                <Text style={[styles.successText1]}>
                    {isVerified ? 'QR Verified Successfully!' : 'QR Not Verified!!!'}
                </Text>

                <Text style={[styles.successText]}>{message}</Text>

                <GradientButton
                    onPress={isVerified ? handleScan : scanAgain}
                    title={isVerified ? 'Okay' : 'Try Again'}
                    containerStyle={styles.customButtonContainer}
                    textStyle={styles.customButtonText}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#282c34', // Background color
    },
    successContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 35,
        backgroundColor: '#fff',
        borderRadius: 50,
        elevation: 5,
        paddingVertical: 50, // Vertical padding to ensure content spacing
    },
    successText1: {
        fontSize: 20,
        color: '#000',
        textAlign: 'center',
        marginVertical: 5,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,

    },
    successText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 5,
        fontFamily: fontFamilies.SFProRoundedBlackRegular,

    },
    customButtonContainer: {
        marginTop: 10,
        width: 160, // Adjust button size
    },
    customButtonText: {
        fontSize: 16,
        color: '#fff', // Button text color
    },
});

export default QRVerificationScreen;
