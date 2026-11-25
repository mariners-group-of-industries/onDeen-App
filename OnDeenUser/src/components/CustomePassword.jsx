import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fontFamilies } from '../assets/fonts/fonts';

export default function CustomePassword({ formik, name, label, placeholder, type, iconName, disableAutoCapitalize = false }) {
    const [showError, setShowError] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (formik.touched?.[name] && formik.errors?.[name]) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 300000);
            return () => clearTimeout(timer);
        }
    }, [formik.errors, formik.touched, name]);

    useEffect(() => {
        if (formik.isSubmitting && formik.errors?.[name]) {
            setShowError(true);
        }
    }, [formik.isSubmitting, formik.errors, name]);

    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible(prev => !prev);
    }, []);

    return (
        <View style={[styles.container]}>
            {label && <Text style={[styles.title]}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input]}
                    value={formik.values[name] || ''}
                    onChangeText={formik.handleChange(name)}
                    onBlur={formik.handleBlur(name)}
                    placeholder={placeholder}
                    placeholderTextColor={'#969696'}
                    keyboardType={type ? type : 'default'}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize={disableAutoCapitalize ? 'none' : 'sentences'}
                />
                {iconName && (
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={togglePasswordVisibility}>
                        <Icon
                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                            size={24}
                            color="#888"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(formik.touched?.[name] && showError && formik.errors?.[name]) && (
                <Text style={[styles.errorMessage]}>
                    {formik.errors?.[name]}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: heightScale(2),
        marginBottom: heightScale(10),
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
    input: {
        flex: 1,
        fontSize: fontScale(14),
        paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(50),
        paddingRight: widthScale(50),
        color: '#161616',
    },
   errorMessage: {
        fontSize: fontScale(12),
        color: 'red',
        marginTop: heightScale(4),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    iconContainer: {
        position: 'absolute',
        right: widthScale(20),
        height: '100%',
        justifyContent: 'center',
    },
});
