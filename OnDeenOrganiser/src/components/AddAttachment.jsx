import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from 'react-native-modal';
import CustomeInput from '../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import CustomeSelectFile from './CustomeSelectFile';
import Icon from 'react-native-vector-icons/Feather';
import Attachment from '../assets/svg/attachment.svg';
import { fontFamilies } from '../assets/themes/fonts';
import NoData from '../common/NoData';

const AboutBioValidationSchema = Yup.object({
    document_name: Yup.string().required('Document Name is required'),
    file_path: Yup.string().required('Document is required'),
});

const AddAttachment = ({ setValues, value, setActivetab }) => {
    const [documents, setdocuments] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        setdocuments(Array.isArray(value) ? value : []);
        setEditingIndex(null);
    }, [value]);

    const formik = useFormik({
        initialValues: {
            document_name: documents[editingIndex]?.document_name || '',
            ar_document_name: documents[editingIndex]?.ar_document_name || '',
            file_path: documents[editingIndex]?.file_path || '',
        },
        validationSchema: AboutBioValidationSchema,
        onSubmit: (values) => {
            if (editingIndex != null) {
                handleEditdocument(values);
            } else {
                handleAdddocument(values);
            }
            formik.resetForm();
            setModalVisible(false);
        },
    });

    const handleAdddocument = (values) => {
        const newdocument = { ...values };
        setdocuments(prevdocuments => [...prevdocuments, newdocument]);
        setValues('documents', [...documents, newdocument])
    };

    const handleEditdocument = (values) => {
        const updateddocuments = [...documents];
        updateddocuments[editingIndex] = { ...updateddocuments[editingIndex], ...values };
        setdocuments(updateddocuments);
        setValues('documents', updateddocuments)
    };

    const handledocumentClick = (index) => {
        const document = documents[index];
        formik.setValues({
            document_name: document.document_name,
            ar_document_name: document.ar_document_name || 'ar_document_name',
            file_path: document.file_path,
        });
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleDeleteDocument = (index) => {
        const updatedCurriculum = documents.filter((_, i) => i !== index);
        setdocuments(updatedCurriculum);
        setValues('documents', updatedCurriculum)
    };




    return (
        <View >
            <View style={styles.rowContainer}>
                <Text style={styles.headerText}>Attachment</Text>
                <TouchableOpacity
                    onPress={() => { setEditingIndex(null); setModalVisible(true); }}
                    style={styles.buttonContainer}  >
                    <Attachment size={10} />
                    <Text style={styles.buttonText}>Add attachment</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.curriculumContainer}>
                {documents?.length == 0 ? (
                    <NoData title={'No Attachment added!'} />
                ) : (
                    <View style={styles.documentContainer}>
                        <FlatList
                            data={documents}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity style={styles.selectedFileContainer} onPress={() => handledocumentClick(index)}>
                                    <Text style={styles.selectedFileName}>{item.document_name}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteDocument(index)} style={styles.removeButton}>
                                        <Icon name="trash" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )}
                        />
                    </View>)}
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => { setModalVisible(false); formik.resetForm(); }} style={styles.modal}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.label, { fontSize: 16 }]}>Add Document</Text>
                        <CustomeInput
                            value={formik}
                            formik={formik}
                            name={'document_name'}
                            label={'Document Name'}
                            placeholder={'Enter Document Name'}
                        />
                        <CustomeSelectFile
                            formik={formik}
                            name={'file_path'}
                            label={'Upload File'}
                            placeholder={'Upload File'}
                            allowDocuments
                        />
                        <GradientButton
                            onPress={formik.handleSubmit}
                            title={editingIndex != null ? "Save" : "Save"}
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
    container: {
        flex: 1,
        padding: 16,
    },

    label: {
        marginBottom: heightScale(14),
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
    },
    buttonContainer: {
        flexDirection: 'row', gap: 4,
    },
    buttonText: {
        color: '#E4416D',
        fontWeight: '500',
        fontSize: 12,
        alignSelf: 'center',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    documentContainer: {
        marginTop: -10,
    },
    documentfile_pathContainer: {
        alignItems: 'center',
        marginRight: widthScale(16),
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    documentfile_path: {
        width: widthScale(60),
        height: widthScale(60),
        borderRadius: 50,
    },
    documentName: {
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
        maxHeight: heightScale(400),
    },
    customButtonContainer: {
        marginTop: 10,
        width: '100%',
    },
    customButtonText: {
        fontSize: 12,
        color: '#fff',
    },
    fileButton: {
        paddingVertical: heightScale(14),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        width: widthScale(100),
        height: widthScale(100),
        borderRadius: widthScale(50),
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    fileButtonText: {
        fontSize: fontScale(16),
        color: '#161616',
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: heightScale(10),
        padding: widthScale(10),
        backgroundColor: '#F3F0F7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedFileName: {
        flex: 1,
        fontSize: fontScale(12),
        color: '#161616',
    },
    removeButton: {
        padding: widthScale(6),
        backgroundColor: 'red',
        borderRadius: 50,
        marginLeft: widthScale(10),
    },
    rowContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 10,
    },
    itineraryContainer: {
        marginVertical: 10,
    },
    noItineraryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    headerText: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(12),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    addButtonText: {
        color: '#E4416D',
        fontWeight: '500',
        fontSize: fontScale(12),
        alignItems: 'center',
        justifyContent: 'center',
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
        marginVertical: 10,
    },

});

export default AddAttachment;
