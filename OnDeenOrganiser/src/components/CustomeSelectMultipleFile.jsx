import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { imageuploadAPI } from '../redux/slices/imageuploadSlice';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeSelectMultipleFile({ formik, name, label }) {
    const [showError, setShowError] = useState(false);
    const dispatch = useDispatch();

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

    const pickFiles = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            selectionLimit: 3, // Limit the number of selections
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {

            } else if (response.error) {
                ;
            } else if (response.assets) {
                const uploadedImages = [];
                for (const image of response.assets) {
                    const uploadedImage = await uploadImageAndGetURL(image);
                    if (uploadedImage) {
                        uploadedImages.push(uploadedImage);
                    }
                }
                formik.setFieldValue(name, [...formik.values[name], ...uploadedImages]);
            }
        });
    };

    const uploadImageAndGetURL = async (imageData) => {
        const { base64 } = imageData;

        const dataToSend = {
            file: base64,
            module: "organizer_profile_pic",
        };

        try {
            const res = await dispatch(imageuploadAPI(dataToSend));
            if (res?.payload?.status) {
                const fullScreenImageUrl = res?.payload?.response?.url;

                return { full_screen_image: fullScreenImageUrl, cropped_image: fullScreenImageUrl };
            }
        } catch (err) {
            ;
        }
        return null;
    };

    const removeImage = (index) => {
        const updatedImages = formik.values[name].filter((_, i) => i !== index);
        formik.setFieldValue(name, updatedImages);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.title}>{label}</Text>}

            <View style={styles.imageRowContainer}>
                {formik.values[name]?.map((item, index) => (
                    <View key={index} style={styles.fileButton}>
                        <Image
                            source={{ uri: item?.full_screen_image }}
                            style={styles.selectedImage}
                            resizeMode="cover"
                        />
                        <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeButton}>
                            <Icon name="close-circle" size={18} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity onPress={pickFiles} style={styles.fileButton}>
                    <View style={styles.fileButtonText}>
                        <Icon style={{ color: 'gray' }} name={'add-sharp'} size={30} />
                        <Text style={styles?.label}>Add Photo</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {(formik.touched?.[name] && showError && formik.errors?.[name]) && (
                <Text style={styles.errorMessage}>{formik.errors?.[name]}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    title: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    label: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(12),
        color: '#969696',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    imageRowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    fileButton: {
        width: '30%',
        height: widthScale(100),
        marginBottom: heightScale(10),
        marginRight: widthScale(10),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(25),
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileButtonText: {
        fontSize: fontScale(16),
        color: '#161616',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#F3F0F7'
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: widthScale(15),
        borderColor: '#E0E0E0',
    },
    removeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 50,
    },
    errorMessage: {
        color: 'red',
        marginTop: heightScale(4),
    },
});
