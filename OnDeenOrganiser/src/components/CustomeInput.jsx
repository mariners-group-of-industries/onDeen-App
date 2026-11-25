import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeInput({ formik, name, label, placeholder, type = '', disabled = false, heights = '' }) {
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (formik.touched?.[name] && formik.errors?.[name]) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [formik.errors, formik.touched, name]);

    useEffect(() => {
        if (formik.isSubmitting && formik.errors?.[name]) {
            setShowError(true);
        }
    }, [formik.isSubmitting, formik.errors, name]);

    return (
        <View style={[styles.container]}>
            {label && <Text style={[styles.title]}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, type == 'description' ? styles.description : '', { height: heights ? heights : '' }]}
                    value={formik.values[name] || ''}
                    onChangeText={formik.handleChange(name)}
                    onBlur={formik.handleBlur(name)}
                    placeholder={placeholder}
                    placeholderTextColor={'#969696'} 
                    keyboardType={type ? type : 'default'}
                    multiline={type == 'description' ? true : false}
                    editable={!disabled}
                    textAlignVertical={type == 'description' ? 'top' : 'center'}
                />
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
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    description: {
        height: 120,
        textAlignVertical: 'top',
        borderRadius: widthScale(24),
    },
    errorMessage: {
        fontSize: fontScale(12),
        color: 'red',
        marginTop: heightScale(4),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
});
