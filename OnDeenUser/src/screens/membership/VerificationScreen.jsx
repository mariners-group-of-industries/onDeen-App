import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GradientButton from '../../components/gradientButton';
import { useNavigation } from '@react-navigation/native';
import { fontFamilies } from '../../assets/fonts/fonts';
import Checkcircle from '../../assets/svg/checkcirclebroken.svg';

const VerificationScreen = ({ setModel, responcedata, responce = "Unknown Message" }) => {
    const navigation = useNavigation();

    const handleScan = () => {
        navigation.navigate('MainNavigator');
    };

    const scanAgain = () => {
        setModel(false);
    };

    const isVerified = responcedata?.status === true;

    return (
        <View style={styles.container}>
            <View style={styles.successContainer}>
                {isVerified && <Checkcircle />}
                <Text style={styles.successText1}>
                    {isVerified ? 'Success' : 'Failed'}
                </Text>
                <Text style={styles.successText}>{responce}</Text>
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
        backgroundColor: '#282c34',
    },
    successContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 35,
        backgroundColor: '#fff',
        borderRadius: 50,
        elevation: 5,
        paddingVertical: 50,
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
        width: 160,
    },
    customButtonText: {
        fontSize: 16,
        color: '#fff',
    },
});

export default VerificationScreen;
