import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types as documentTypes } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch } from 'react-redux';
import { imageuploadAPI } from '../redux/slices/imageuploadSlice';
import { fontFamilies } from '../assets/themes/fonts';
import { apiRequest } from '../services/api';

export default function CustomeSelectFile({ formik, name, label, allowDocuments = false }) {
    const [showError, setShowError] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const dispatch = useDispatch();
    const maxMaterialBytes = 10 * 1024 * 1024;

    useEffect(() => {
        if (formik.touched?.[name] && formik.errors?.[name]) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [formik.errors, formik.touched, name]);

    useEffect(() => {
        if (formik.isSubmitting && formik.errors?.[name]) {
            setShowError(true);
        }
    }, [formik.isSubmitting, formik.errors, name]);

    const uploadDocumentAndGetURL = async file => {
        const sourceUri = file?.fileCopyUri || file?.uri;
        if (!sourceUri) {
            setUploadError('Unable to read the selected file.');
            return null;
        }
        const reportedSize = Number(file?.size || 0);
        if (reportedSize > maxMaterialBytes) {
            setUploadError('Event materials must be 10 MB or smaller.');
            return null;
        }
        try {
            const base64 = await RNFS.readFile(sourceUri.replace('file://', ''), 'base64');
            const decodedSize = Math.floor((base64.length * 3) / 4);
            if (decodedSize > maxMaterialBytes) {
                setUploadError('Event materials must be 10 MB or smaller.');
                return null;
            }
            const result = await apiRequest({
                url: '/upload_file',
                method: 'POST',
                data: {
                    data: base64,
                    filename: file?.name || 'event-material',
                    content_type: file?.type || 'application/octet-stream',
                    module: 'event_material',
                },
                authToken: (formik?.values && formik?.values?.authToken) || '',
                contentType: 'application/json',
            });
            const fileUrl = result?.file_url || result?.response?.file_url || null;
            if (!fileUrl) {
                setUploadError(
                    result?.response?.message || result?.message || 'Unable to upload this file.',
                );
                return null;
            }
            setUploadError('');
            return fileUrl;
        } catch (error) {
            setUploadError('Unable to upload this file. Please try again.');
            return null;
        }
    };

    const pickDocument = async () => {
        try {
            setUploadError('');
            const file = await DocumentPicker.pickSingle({
                type: [documentTypes.allFiles],
                copyTo: 'cachesDirectory',
            });
            const fileUrl = await uploadDocumentAndGetURL(file);
            if (fileUrl) {
                formik.setFieldValue(name, fileUrl);
            }
        } catch (error) {
            if (!DocumentPicker.isCancel(error)) {
                setUploadError('Unable to select this file. Please try again.');
            }
        }
    };

    // Pick an image file for profile/speaker artwork, or a generic event material.
    const pickFile = async () => {
        if (allowDocuments) {
            await pickDocument();
            return;
        }
        const options = {
            mediaType: 'photo',
            includeBase64: true,
        };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {

            } else if (response.error || response.errorCode) {
                ;
            } else if (response.assets?.[0]?.base64) {
                uploadImageAndGetURL(response);
            }
        });
    };

    const uploadImageAndGetURL = (imageData) => {
        const { base64 } = imageData.assets[0]; // Adjusted to access the image data correctly

        const dataToSend = {
            file: base64,
            module: "organizer_profile_pic",
        };

        dispatch(imageuploadAPI(dataToSend))
            .then((res) => {
                const imageUrl = res?.payload?.response?.url;

                if (res?.payload?.status && imageUrl) {
                    formik.setFieldValue(name, res?.payload?.response?.url);
                }
            })
            .catch((err) => {
                ;
            });
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.title}>{label}</Text>}
            <View style={styles.fileButtonContainer}>
                {formik.values[name] ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={allowDocuments ? 'Attached event material' : 'Selected image'}
                        onPress={pickFile}
                    >
                        {allowDocuments ? (
                            <View style={styles.selectedDocument}>
                                <Icon name="file-text" size={32} color="#DB3171" />
                                <Text style={styles.selectedDocumentText}>Attached</Text>
                            </View>
                        ) : (
                            <Image
                                source={{ uri: formik.values[name] }}
                                style={styles.selectedImage}
                                resizeMode="cover"
                            />
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={allowDocuments ? 'Upload event material' : 'Upload image'}
                        onPress={pickFile}
                        style={styles.fileButton}
                    >
                        <Text style={styles.fileButtonText}>
                            <Icon name={allowDocuments ? 'file-plus' : 'camera'} size={32} color="#fff" />
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {(uploadError || (formik.touched?.[name] && showError && formik.errors?.[name])) && (
                <Text style={styles.errorMessage}>
                    {uploadError || formik.errors[name]}
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
    fileButton: {
        paddingVertical: heightScale(14),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#E1E1E1',
        width: widthScale(100),
        height: widthScale(100),
        borderRadius: widthScale(50),
        borderColor: '#E1E1E1',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    fileButtonText: {
        fontSize: fontScale(16),
        color: '#161616',
    },
    selectedImage: {
        paddingVertical: heightScale(14),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#E1E1E1',
        width: widthScale(100),
        height: widthScale(100),
        borderRadius: widthScale(50),
        borderColor: '#E1E1E1',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    selectedDocument: {
        alignItems: 'center',
        backgroundColor: '#F3F0F7',
        borderColor: '#E1D6ED',
        borderRadius: widthScale(16),
        borderWidth: 2,
        height: widthScale(100),
        justifyContent: 'center',
        width: widthScale(100),
    },
    selectedDocumentText: {
        color: '#DB3171',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(11),
        marginTop: heightScale(4),
    },
    errorMessage: {
        color: 'red',
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },

});
