import { View, Text, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import CustomCountryPicker from './CustomCountryPicker';
import CustomeInput from './CustomeInput';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeMobileWithCountryCode({ formik, disabled = true }) {
    const [countryCode, setCountryCode] = useState(formik?.values?.country_code);

    const handleCountrySelect = (country) => {
        const code = `+${country?.country_code}`;
        setCountryCode(code);
        formik.setFieldValue('country_code', code);
        formik.setFieldValue('country', country.name);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{'Contact No.'}</Text>
            <View style={styles.inputContainer}>
                <View style={styles.inputContainer1}>
                    <CustomCountryPicker
                        values={formik?.values}
                        countryCode={countryCode}
                        onSelect={handleCountrySelect}
                        containerStyle={[styles.countryCodeContainer, { paddingVertical: Platform.OS === 'android' ? 14 : 10 }]}
                        textStyle={styles.countryCodeText}
                        disabled={disabled}
                    />
                </View>
                <View style={styles.inputContainer2}>
                    <CustomeInput
                        formik={formik}
                        name={'mobile_number'}
                        placeholder={'Enter Contact No.'}
                        type='phone-pad'
                        style={[styles.input]}
                        disabled={disabled}
                    />
                </View>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: heightScale(2),
        marginBottom: heightScale(0),
    },
    title: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(12),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    inputContainer1: {
        width: '30%',
        marginTop: heightScale(-8),
    },
    inputContainer2: {
        width: '70%',
        marginTop: heightScale(0),
    },
    countryCodeContainer: {
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(28),
        paddingHorizontal: widthScale(16),
        paddingVertical: heightScale(16),
        marginRight: widthScale(8),
        justifyContent: 'center',
    },
    countryCodeText: {
        fontSize: fontScale(16),
        color: '#161616',
    },
    iconContainer: {
        position: 'absolute',
        right: widthScale(10),
        height: '100%',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: fontScale(16),
        // paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(24),
        paddingRight: widthScale(50),
    },
    errorMessage: {
        color: 'red',
        marginTop: heightScale(4),
    },
});
