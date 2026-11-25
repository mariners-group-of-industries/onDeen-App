import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';

export default function ViewInput({ label, name, value, placeholder, formik, openmodel, onpress = false }) {

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
            <Text style={[styles.title]}>{label}</Text>
            {
                onpress ?
                    <TouchableOpacity onPress={() => { openmodel() }} style={styles.inputContainer}>
                        <Text style={[styles.input, { color: value ? '#000' : '#888'}]}>{value ? value : placeholder}</Text>
                    </TouchableOpacity>
                    :
                    <View style={styles.inputContainer}>
                        <Text style={[styles.input, { color: value ? '#000' : '#888'}]}>{value ? value : placeholder}</Text>
                    </View>
            }

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
        fontSize: fontScale(14),
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
        fontSize: fontScale(12),
        paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(50),
        paddingRight: widthScale(50),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    description: {
        height: 120,
        textAlignVertical: 'top',
    },
    errorMessage: {
        color: 'red',
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
});
