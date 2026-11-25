import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import CustomMapView from './CustomeMapView';

const AboutBioValidationSchema = Yup.object({
    location: Yup.string().required('Location is required'),
});

const CustomeLocation = ({ setValues, value }) => {
    const insets = useSafeAreaInsets();
    const [Location, setLocation] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const bottomPadding = insets.bottom + heightScale(16);

    const formik = useFormik({
        initialValues: {
            location: Location?.location || '',
        },
        validationSchema: AboutBioValidationSchema,
        onSubmit: (values) => {
            const newLocation = { ...values };
            setLocation(prevLocation => [...prevLocation, newLocation]);
            setValues('Location', [...Location, newLocation]);
            formik.resetForm();
            setModalVisible(false);
        },
    });

    const openModal = () => {
        setModalVisible(true);
        formik.resetForm();
    };

    return (
        <View>
            <Text style={styles.title}>{'Search Location'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={formik.values['location']}
                    onChangeText={formik.handleChange('location')}
                    onBlur={formik.handleBlur('location')}
                    placeholder={'Location'}
                    placeholderTextColor={'#969696'}
                    editable={false}
                />
                {formik.touched?.['location'] && formik.errors?.['location'] && (
                    <Text style={styles.errorMessage}>{formik.errors['location']}</Text>
                )}
            </TouchableOpacity>

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
                <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
                    <Text style={styles.label}>Confirm Location</Text>
                    <CustomMapView />
                    <GradientButton
                        onPress={formik.handleSubmit}
                        title={"Confirm Location"}
                        containerStyle={styles.customButtonContainer}
                        textStyle={styles.customButtonText}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        marginBottom: heightScale(8),
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        fontSize: fontScale(16),
        paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(24),
        paddingRight: widthScale(50),
    },
    errorMessage: {
        color: 'red',
        marginTop: heightScale(4),
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: widthScale(20),
        maxHeight: heightScale(500),
    },
    label: {
        fontSize: fontScale(18),
        fontWeight: '500',
        marginBottom: heightScale(12),
    },
    customButtonContainer: {
        marginTop: 20,
        width: '100%',
        marginBottom: heightScale(32),
    },
    customButtonText: {
        fontSize: 16,
        color: '#fff',
    },
});

export default CustomeLocation;
