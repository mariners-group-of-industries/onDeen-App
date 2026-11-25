import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
} from 'react-native';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { fontFamilies } from '../../assets/fonts/fonts';
import ReactNativeModal from 'react-native-modal';
import { ChevronLeft } from 'lucide-react-native';

const noteSchema = yup.object().shape({
    title: yup.string()
        .required('Title is required')
        .max(50, 'Title must be at most 50 characters'),
    note: yup.string()
        .required('Content is required')
        .max(1000, 'Content must be at most 1000 characters')
});

export default function CommonNotesModel({ isModalVisible, setIsModalVisible, saveNotes, notesvalues = {} }) {
    const [showAllErrors, setShowAllErrors] = useState(false);
    const contentInputRef = useRef(null);

    const formik = useFormik({
        initialValues: { title: '', note: '' },
        validationSchema: noteSchema,
        onSubmit: values => {
            saveNotes(values);
            setShowAllErrors(false);
            setIsModalVisible(false);
            formik.resetForm();
        },
    });

    useEffect(() => {
        if (notesvalues) {
            formik.setValues({
                title: notesvalues.title || '',
                note: notesvalues.note || ''
            });
        }
    }, [notesvalues]);

    const handleSave = () => {
        setShowAllErrors(true);
        formik.handleSubmit();
    };

    const handleDiscardNote = () => {
        formik.resetForm();
        setIsModalVisible(false);
    };

    return (
        <ReactNativeModal
            isVisible={isModalVisible}
            onBackdropPress={handleDiscardNote}
            onSwipeComplete={handleDiscardNote}
            swipeDirection={['down']}
            style={styles.modal}
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            statusBarTranslucent
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        accessibilityLabel="Back"
                        accessibilityRole="button"
                        style={styles.headerButton}
                        onPress={handleDiscardNote}
                    >
                         <ChevronLeft color={'#000'} />
                        <Text style={styles.modalTitle}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityLabel="Save Note"
                        accessibilityRole="button"
                        style={styles.headerButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButton}>Save Note</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            accessibilityLabel="Note title"
                            placeholder="Title"
                            placeholderTextColor="#666"
                            value={formik.values.title}
                            onChangeText={formik.handleChange('title')}
                            onBlur={formik.handleBlur('title')}
                            style={[styles.titleInput]}
                            returnKeyType="next"
                            onSubmitEditing={() => contentInputRef.current?.focus()}
                        />
                        {(showAllErrors || formik.touched.title) && formik.errors.title && (
                            <Text style={styles.errorText}>{formik.errors.title}</Text>
                        )}
                    </View>

                    <View style={[styles.inputContainer,{marginTop:-10}]}>
                        <TextInput
                            accessibilityLabel="Note content"
                            ref={contentInputRef}
                            style={styles.contentInput}
                            value={formik.values.note}
                            onChangeText={formik.handleChange('note')}
                            onBlur={formik.handleBlur('note')}
                            multiline={true}
                            placeholder="Write your note here..."
                            placeholderTextColor="#666"
                            scrollEnabled={true}
                        />
                        {(showAllErrors || formik.touched.note) && formik.errors.note && (
                            <Text style={styles.errorText}>{formik.errors.note}</Text>
                        )}
                    </View>
                </View>
            </View>
        </ReactNativeModal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
        flex:1
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerButton: {
        padding: 8,
        minWidth: 50,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        gap:10
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#000000',
    },
    saveButton: {
        fontSize: 16,
        color: '#DB3171',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    modalBody: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        // marginBottom: 20,
    },
    titleInput: {
        fontSize: 24,
        paddingVertical: 8,
        color: '#161616',
    },
    contentInput: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
        minHeight: 100,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});
