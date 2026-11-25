import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import CustomeInput from '../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import CustomeDate from './CustomeDate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NoData from '../common/NoData';
import { fontFamilies } from '../assets/themes/fonts';

const AboutBioValidationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    day: Yup.string().required('Day is required'),
    start_time: Yup.string().required('Start Time is required'),
    end_time: Yup.string().required('End Time is required'),
});

const CustomeEventTourItineraryAddUpdate = ({ setValues, value }) => {
    const [itinerary, setItinerary] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const formik = useFormik({
        initialValues: {
            day: '',
            title: '',
            ar_title: 'ar_title',
            start_time: '',
            end_time: '',
        },
        validationSchema: AboutBioValidationSchema,
        onSubmit: (values) => {
            if (editingIndex != null) {
                handleEditItinerary(values);
            } else {
                handleAddItinerary(values);
            }
            formik.resetForm();
            setModalVisible(false);
        },
    });

    const handleAddItinerary = (values) => {
        const newItinerary = { ...values };
        setItinerary((prevItinerary) => [...prevItinerary, newItinerary]);
        setValues('itinerary', [...itinerary, newItinerary]);
    };

    const handleEditItinerary = (values) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[editingIndex] = { ...updatedItinerary[editingIndex], ...values };
        setItinerary(updatedItinerary);
        setValues('itinerary', updatedItinerary);
    };

    const handleItineraryClick = (index) => {
        const selectedItinerary = itinerary[index];
        formik.setValues({
            day: selectedItinerary.day.toString(),
            title: selectedItinerary.title,
            ar_title: selectedItinerary.ar_title || 'ar_title',
            start_time: selectedItinerary.start_time,
            end_time: selectedItinerary.end_time,
        });
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleDeleteItinerary = (index) => {
        const updatedItinerary = itinerary.filter((_, i) => i !== index);
        setItinerary(updatedItinerary);
        setValues('itinerary', updatedItinerary);
    };

    return (
        <View>
            <View style={styles.rowContainer}>
                <Text style={styles.headerText}>Event Itinerary</Text>
                <TouchableOpacity onPress={() => { setEditingIndex(null); setModalVisible(true); }}>
                    <Text style={styles.addButtonText}>Add Itinerary</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.curriculumContainer}>
                {itinerary?.length == 0 ? (
                    <NoData title={'No Itinerary added!'} />
                ) : (
                    <ScrollView horizontal>
                        {itinerary.map((item, index) => (
                            <TouchableOpacity key={index} onPress={() => handleItineraryClick(index)}>
                                <View style={styles.itineraryItemContainer}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteItinerary(index)}
                                    >
                                        <Icon name="delete" size={24} color="#E4416D" />
                                    </TouchableOpacity>
                                    <Text style={styles.itineraryName}>{item.title}</Text>
                                    <Text style={styles.itineraryDetail}>Day: {item.day}</Text>
                                    <Text style={styles.itineraryDetail}>Start Time: {item.start_time}</Text>
                                    <Text style={styles.itineraryDetail}>End Time: {item.end_time}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => { setModalVisible(false); formik.resetForm(); }} style={styles.modal}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <Text style={styles.modalHeader}>Add Itinerary</Text>
                        <CustomeInput
                            formik={formik}
                            name="day"
                            label="Day"
                            placeholder="Enter Day"
                            keyboardType="numeric"
                            type="number-pad"
                        />
                        <CustomeInput
                            formik={formik}
                            name="title"
                            label="Title"
                            placeholder="Enter Title"
                        />
                        <View>
                            <Text style={styles.label}>Event Time</Text>
                            <View style={styles.dateTimeContainer}>
                                <CustomeDate
                                    formik={formik}
                                    name="start_time"
                                    placeholder="Start time"
                                    customewidth="50%"
                                    type="time"
                                />
                                <CustomeDate
                                    formik={formik}
                                    name="end_time"
                                    placeholder="End time"
                                    customewidth="50%"
                                    type="time"
                                />
                            </View>
                        </View>
                        <GradientButton
                            onPress={formik.handleSubmit}
                            title={editingIndex != null ? "Update Itinerary" : "Add Itinerary"}
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
        fontSize: fontScale(16),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    addButtonText: {
        color: '#E4416D',
        fontWeight: '500',
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itineraryContainer: {
        marginVertical: 10,
    },
    noItineraryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noItineraryText: {
        fontSize: fontScale(16),
        color: '#888',
        textAlign: 'center',
        marginTop: heightScale(20),
        fontStyle: 'italic',
    },
    itineraryItemContainer: {
        alignItems: 'left',
        marginRight: widthScale(16),
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        width: 180,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        zIndex: 1
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: '700',
    },
    itineraryName: {
        marginTop: 8,
        fontSize: fontScale(14),
        fontWeight: '500',
        color: '#17101F',
    },
    itineraryDetail: {
        marginTop: 4,
        fontSize: fontScale(12),
        color: '#555',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: widthScale(20),
        maxHeight: heightScale(600),
    },
    modalHeader: {
        fontSize: fontScale(16),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    
    label: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: '#161616',
        marginBottom: 8,
    },
    dateTimeContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10,
        gap: 10,
    },
    noCurriculumContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    noCurriculumText: {
        fontSize: 16,
        color: '#999',
    },
    curriculumContainer: {
    },
    customButtonContainer: {
        marginTop: 20,
        width: '100%',
    },
    customButtonText: {
        fontSize: 12,
        color: '#fff',
    },
});

export default CustomeEventTourItineraryAddUpdate;
