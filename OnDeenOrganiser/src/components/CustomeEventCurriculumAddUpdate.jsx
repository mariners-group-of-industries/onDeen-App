import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import CustomeInput from '../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import CustomeDate from './CustomeDate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ViewInput from './ViewInput';
import { calculateDays } from '../common/datetimeformate';
import NoData from '../common/NoData';
import { fontFamilies } from '../assets/themes/fonts';

const AboutBioValidationSchema = Yup.object({
    description: Yup.string().required('Description is required'),
    no_of_days: Yup.number().required('Number of days is required').positive('Number of days must be positive').integer('Number of days must be an integer'),
    start_date: Yup.string().required('Start date is required'),
    end_date: Yup.string()
        .required('End date is required')
        .matches(/^\d{2}-\d{2}-\d{4}$/, 'End date must be in the format DD-MM-YYYY')
        .test(
            'end-date-after-start-date',
            'End date must be greater than or equal to start date',
            function (value) {
                const { start_date } = this.parent;

                if (value && start_date) {
                    const startDate = new Date(start_date.split('-').reverse().join('-'));
                    const endDate = new Date(value.split('-').reverse().join('-'));

                    return endDate >= startDate;
                }
                return true;
            }
        ),
    start_time: Yup.string().required('Start time is required'),
    end_time: Yup.string().required('End time is required'),
});

const CustomeEventCurriculumAddUpdate = ({ setValues, value }) => {
    const [curriculum, setCurriculum] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const formik = useFormik({
        initialValues: {
            description: '',
            ar_description: 'ar_description',
            no_of_days: '',
            start_date: '',
            end_date: '',
            start_time: '',
            end_time: '',
        },
        validationSchema: AboutBioValidationSchema,
        onSubmit: (values) => {
            if (editingIndex != null) {
                handleEditCurriculum(values);
            } else {
                handleAddCurriculum(values);
            }
            formik.resetForm();
            setModalVisible(false);
        },
    });


    const handleAddCurriculum = (values) => {
        const newCurriculum = { ...values };
        setCurriculum((prevCurriculum) => [...prevCurriculum, newCurriculum]);
        setValues('curriculum', [...curriculum, newCurriculum]);
    };

    const handleEditCurriculum = (values) => {
        const updatedCurriculum = [...curriculum];
        updatedCurriculum[editingIndex] = { ...updatedCurriculum[editingIndex], ...values };
        setCurriculum(updatedCurriculum);
        setValues('curriculum', updatedCurriculum);
    };

    const handleCurriculumClick = (index) => {
        const selectedCurriculum = curriculum[index];
        formik.setValues({
            description: selectedCurriculum.description,
            ar_description: selectedCurriculum.ar_description || 'ar_description',
            no_of_days: selectedCurriculum.no_of_days.toString(),
            start_date: selectedCurriculum.start_date,
            end_date: selectedCurriculum.end_date,
            start_time: selectedCurriculum.start_time,
            end_time: selectedCurriculum.end_time,
        });
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleDeleteCurriculum = (index) => {
        const updatedCurriculum = curriculum.filter((_, i) => i !== index);
        setCurriculum(updatedCurriculum);
        setValues('curriculum', updatedCurriculum);
    };

    useEffect(() => {
        const { start_date, end_date } = formik.values;
        if (start_date && end_date) {
            const days = calculateDays(start_date, end_date);
            formik.setFieldValue('no_of_days', days);
        }
    }, [formik.values.start_date, formik.values.end_date]);

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Class Info</Text>
                <TouchableOpacity onPress={() => { setEditingIndex(null); setModalVisible(true); }}>
                    <Text style={styles.addButtonText}>Add Class</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.curriculumContainer}>
                {curriculum?.length == 0 ? (
                    <NoData title={'No curriculum added!'} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {curriculum?.map((item, index) => (
                            <TouchableOpacity key={index} onPress={() => handleCurriculumClick(index)}>
                                <View style={styles.curriculumItemContainer}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteCurriculum(index)}
                                    >
                                        <Icon name="delete" size={24} color="#E4416D" />
                                    </TouchableOpacity>
                                    <View style={styles.curriculumDetails}>
                                        <Text style={styles.curriculumName}>{item.description}</Text>
                                        <Text style={styles.curriculumName}>No of days: {item.no_of_days}</Text>
                                        <Text style={styles.curriculumName}>Start Date: {item.start_date}</Text>
                                        <Text style={styles.curriculumName}>End Date: {item.end_date}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => { setModalVisible(false); formik.resetForm(); }} style={styles.modal}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalHeader}>Add Curriculum</Text>
                        <CustomeInput
                            formik={formik}
                            name="description"
                            label="Description"
                            placeholder="Enter Description"
                            type={'description'}
                            heights={120}
                        />

                        <View>
                            <Text style={styles.label}>Event Date & Time</Text>
                            <View style={styles.dateTimeContainer}>
                                <CustomeDate
                                    formik={formik}
                                    name={'start_date'}
                                    placeholder={'Start date'}
                                    customewidth={'50%'}
                                />
                                <CustomeDate
                                    formik={formik}
                                    name={'end_date'}
                                    placeholder={'End date'}
                                    customewidth={'50%'}
                                />
                            </View>
                            <View style={styles.dateTimeContainer}>
                                <CustomeDate
                                    formik={formik}
                                    name={'start_time'}
                                    placeholder={'Start time'}
                                    customewidth={'50%'}
                                    type={'time'}
                                />
                                <CustomeDate
                                    formik={formik}
                                    name={'end_time'}
                                    placeholder={'End time'}
                                    customewidth={'50%'}
                                    type={'time'}
                                />
                            </View>
                        </View>
                        <ViewInput formik={formik} name="no_of_days" label={'Number of Days'} value={formik.values.no_of_days} placeholder={'Enter Number of Days'} />
                        <GradientButton
                            onPress={formik.handleSubmit}
                            title={editingIndex != null ? "Update Curriculum" : "Add Curriculum"}
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
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

    curriculumItemContainer: {
        marginRight: widthScale(16),
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    curriculumDetails: {
        marginLeft: 10,
        flex: 1,
    },
    curriculumName: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: '#17101F',
        marginVertical: 2,
    },
    curriculumContainer: {
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
    dateTimeContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10,
        gap: 10,
    },
    label: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: '#161616',
        marginBottom: 8,
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

export default CustomeEventCurriculumAddUpdate;
