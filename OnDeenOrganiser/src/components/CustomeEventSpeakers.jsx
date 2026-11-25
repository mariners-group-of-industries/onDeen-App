import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import CustomeInput from '../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import CustomeSelectFile from './CustomeSelectFile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutBioValidationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    image: Yup.string().required('Image URL is required'),
});

const CustomeEventSpeakers = ({ setValues, value }) => {
    const [speakers, setSpeakers] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const formik = useFormik({
        initialValues: {
            first_name: speakers[editingIndex]?.first_name || '',
            last_name: speakers[editingIndex]?.last_name || '',
            image: speakers[editingIndex]?.image || speakers[editingIndex]?.profile_image || '',
        },
        validationSchema: AboutBioValidationSchema,
        onSubmit: (values) => {
            if (editingIndex != null) {
                handleEditSpeaker(values);
            } else {
                handleAddSpeaker(values);
            }
            formik.resetForm();
            setModalVisible(false);
        },
    });

    const handleAddSpeaker = (values) => {
        const newSpeaker = { ...values };
        setSpeakers(prevSpeakers => [...prevSpeakers, newSpeaker]);
        setValues('speakers', [...speakers, newSpeaker]);
    };

    const handleEditSpeaker = (values) => {
        const updatedSpeakers = [...speakers];
        updatedSpeakers[editingIndex] = { ...updatedSpeakers[editingIndex], ...values };
        setSpeakers(updatedSpeakers);
        setValues('speakers', updatedSpeakers);
    };

    const handleSpeakerClick = (index) => {
        const speaker = speakers[index];
        formik.setValues({
            first_name: speaker.first_name,
            last_name: speaker.last_name,
            image: speaker.image || speaker.profile_image,
        });
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleDeleteSpeaker = (index) => {
        const updatedSpeakers = speakers.filter((_, i) => i !== index);
        setSpeakers(updatedSpeakers);
        setValues('speakers', updatedSpeakers);
    };

    return (
        <View>
            <View style={styles.rowContainer}>
                <Text style={styles.headerText}>Event Speakers</Text>
                <TouchableOpacity onPress={() => { setEditingIndex(null); setModalVisible(true); }}>
                    <Text style={styles.addButtonText}>Add Speaker</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.speakerContainer}>
                <ScrollView horizontal>
                    {speakers.length === 0 ? (
                        <View style={styles.noSpeakersContainer}>
                            <Text style={styles.noSpeakersText}>No speakers added. Add a speaker!</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal>
                            {speakers.map((speaker, index) => (
                                <TouchableOpacity key={index} onPress={() => handleSpeakerClick(index)}>
                                    <View style={styles.speakerImageContainer}>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteSpeaker(index)}
                                        >
                                            <Icon name="delete" size={24} color="#E4416D" />
                                        </TouchableOpacity>
                                        <Image
                                            style={styles.speakerImage}
                                            source={{ uri: speaker?.image || speaker?.profile_image }}
                                        />
                                        <Text style={styles.speakerName}>
                                            {speaker.first_name} {speaker.last_name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </ScrollView>
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => { setModalVisible(false); formik.resetForm(); }} style={styles.modal}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <Text style={styles.modalHeader}>Add/Edit Speaker</Text>
                        <CustomeInput
                            formik={formik}
                            name={'first_name'}
                            label={'First Name'}
                            placeholder={'Enter First Name'}
                        />
                        <CustomeInput
                            formik={formik}
                            name={'last_name'}
                            label={'Last Name'}
                            placeholder={'Enter Last Name'}
                        />
                        <CustomeSelectFile
                            formik={formik}
                            name={'image'}
                            label={'Upload Image'}
                            placeholder={'Upload Image'}
                        />
                        <GradientButton
                            onPress={formik.handleSubmit}
                            title={editingIndex != null ? "Update Speaker" : "Add Speaker"}
                            containerStyle={styles.customButtonContainer}
                            textStyle={styles.customButtonText}
                        />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerText: {
        fontSize: fontScale(18),
        fontWeight: '600',
        color: '#161616',
    },
    addButtonText: {
        color: '#E4416D',
        fontWeight: '500',
        fontSize: fontScale(12),
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    speakerContainer: {
        marginVertical: 10,
    },
    noSpeakersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noSpeakersText: {
        fontSize: fontScale(16),
        color: '#888',
        textAlign: 'center',
        marginTop: heightScale(20),
        fontStyle: 'italic',
    },
    speakerImageContainer: {
        alignItems: 'center',
        marginRight: widthScale(16),
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        zIndex:1
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    speakerImage: {
        width: widthScale(60),
        height: widthScale(60),
        borderRadius: 50,
    },
    speakerName: {
        marginTop: 8,
        fontSize: fontScale(14),
        fontWeight: '500',
        color: '#17101F',
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
    modalHeader: {
        fontSize: fontScale(18),
        fontWeight: '600',
        color: '#161616',
        marginBottom: 16,
    },
    scrollViewContent: {
        flexGrow: 1,
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

export default CustomeEventSpeakers;
