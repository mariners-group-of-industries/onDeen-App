import React from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import VisaLogo from '../../assets/svg/visa.svg';
import Inputselected from '../../assets/svg/Inputselected.svg';
import Inputok from '../../assets/svg/Inputok.svg';
import { fontFamilies } from '../../assets/fonts/fonts';

export default function PaymentMethodContainer({
    handleSelect,
    eventDetail,
    selectedMethod,
    applePaySupported,
    googlePaySupported,
}) {
    return (
        <View>
            {eventDetail?.price_type == 1 ? (
                <View style={styles.paymentMethodMainContainer}>
                    <Text style={styles.paymentTitle}>Payment method</Text>
                    <View style={[styles.paymentMethodContainer]}>
                       <TouchableOpacity
                                onPress={() => handleSelect('card1')} style={[styles.cardContainer, { borderColor: selectedMethod == 'card1' ? '#DB3171' : '#D5D5D5' }]}>
                            <View style={{ width: '30%' }}>
                                <VisaLogo width={35} height={35} />
                            </View>
                            <View
                                style={styles.paymentHeader}>
                                <Text style={styles.paymentMethodTitle}>
                                    Credit / Debit Card
                                </Text>
                                {selectedMethod == 'card1' ? <Inputselected width={24} height={24} /> : <Inputok width={24} height={24} />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {Platform.OS === 'ios' ? (
                        <View style={[styles.paymentMethodContainer]}>
                            <TouchableOpacity
                                accessibilityHint={applePaySupported ? 'Pay securely with Apple Pay' : 'Apple Pay is unavailable on this device'}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: selectedMethod === 'applepay', disabled: !applePaySupported }}
                                disabled={!applePaySupported}
                                onPress={() => handleSelect('applepay')}
                                style={[
                                    styles.cardContainer,
                                    { borderColor: selectedMethod === 'applepay' ? '#DB3171' : '#D5D5D5' },
                                    !applePaySupported && styles.disabledMethod,
                                ]}>
                                <View style={styles.methodLogo}>
                                    <Icon name="apple" size={32} color="#111111" />
                                </View>
                                <View style={styles.paymentHeader}>
                                    <View style={styles.paymentCopy}>
                                        <Text style={styles.paymentMethodTitle}>Apple Pay</Text>
                                        {!applePaySupported ? (
                                            <Text style={styles.unavailableText}>Available on supported devices</Text>
                                        ) : null}
                                    </View>
                                    {selectedMethod === 'applepay'
                                        ? <Inputselected width={24} height={24} />
                                        : <Inputok width={24} height={24} />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {Platform.OS === 'android' ? (
                        <View style={[styles.paymentMethodContainer]}>
                            <TouchableOpacity
                                accessibilityHint={googlePaySupported ? 'Pay securely with Google Pay' : 'Google Pay is unavailable on this device'}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: selectedMethod === 'gpay', disabled: !googlePaySupported }}
                                disabled={!googlePaySupported}
                                onPress={() => handleSelect('gpay')}
                                style={[
                                    styles.cardContainer,
                                    { borderColor: selectedMethod === 'gpay' ? '#DB3171' : '#D5D5D5' },
                                    !googlePaySupported && styles.disabledMethod,
                                ]}>
                                <View style={styles.methodLogo}>
                                    <Icon name="google" size={30} color="#4285F4" />
                                </View>
                                <View style={styles.paymentHeader}>
                                    <View style={styles.paymentCopy}>
                                        <Text style={styles.paymentMethodTitle}>Google Pay</Text>
                                        {!googlePaySupported ? (
                                            <Text style={styles.unavailableText}>Available on supported devices</Text>
                                        ) : null}
                                    </View>
                                    {selectedMethod === 'gpay'
                                        ? <Inputselected width={24} height={24} />
                                        : <Inputok width={24} height={24} />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    paymentMethodMainContainer: {
        marginTop: 27,
        paddingLeft: 24,
        paddingRight: 20,
    },
    paymentTitle: {
        color: '#000',
        fontSize: 16,
        fontFamily: fontFamilies.allroundgothicRegular,
        paddingBottom: 16
    },
    paymentMethodContainer: {
        backgroundColor: '#F9F6FD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D5D5D5',
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#D5D5D5',
        width: '100%'
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: "space-between",
        width: '70%',
        alignItems: 'center'
    },
    methodLogo: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '30%',
    },
    paymentCopy: {
        flex: 1,
        paddingRight: 8,
    },
    unavailableText: {
        color: '#77717A',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        fontSize: 11,
        marginTop: 2,
    },
    disabledMethod: {
        opacity: 0.5,
    },
    paymentMethodTitle: {
        fontSize: 16,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium
    },
    paymentIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    cardLogo: {
        width: 35,
        height: 21,
        resizeMode: 'contain',
        alignSelf: 'flex-start',
    },
});
