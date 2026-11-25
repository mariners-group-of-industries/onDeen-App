import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch } from 'react-redux';
import { uploadImage } from '../redux/slices/imageUploadSlice';
import Modal from 'react-native-modal';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/Feather';
import { fontFamilies } from '../assets/fonts/fonts';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export default function CustomeSelectFile({ formik, name, label }) {
  const [showError, setShowError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  
      const result = await request(permission);
      if (result !== RESULTS.GRANTED) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (formik.touched?.[name] && formik.errors?.[name]) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 300000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched, name]);

  useEffect(() => {
    if (formik.isSubmitting && formik.errors?.[name]) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors, name]);

  const handleImageSelection = () => {
    setModalVisible(true);
  };

  // const takePhotoFromCamera = () => {
  //   console.log('image camera started >>>');

  //   ImagePicker.openCamera({
  //     width: 300,
  //     height: 300,
  //     cropping: true,
  //     compressImageQuality: 0.7,
  //     includeBase64: true,
  //     cropperCircleOverlay: true,
  //   })
  //     .then(async image => {
  //       console.log('image camera >>>',image);
        
  //       await handleImageUpload(image);
  //     })
  //     .catch((error) => {console.log('error in camera >>>',error);
  //     });
  //   setModalVisible(false);
  // };


  const takePhotoFromCamera = async () => {
  
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return; // Stop execution if permission is denied
  
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality: 0.7,
        includeBase64: true,
        cropperCircleOverlay: true,
        // avoidEmptySpaceAroundImage:true,
        showCropFrame:false,
      });
  
  
      setModalVisible(false); // Close modal after processing image
  
      await handleImageUpload(image);
    } catch (error) {

      setModalVisible(false); // Ensure modal closes even if an error occurs
    }
  };

  
  
  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
      includeBase64: true,
      cropperCircleOverlay: true,
    })
      .then(async image => {
        
        await handleImageUpload(image);
      })
      .catch(() => {});
    setModalVisible(false);
  };

  const handleImageUpload = async (image) => {
    const imageFile = {
      file: image?.data,
      module: 'profile',
    };
    try {
      const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();
      formik.setFieldValue(name, uploadResult);
    } catch (error) {

    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.title}>{label}</Text>}
      <View>
        {formik.values[name] ? (
          <TouchableOpacity  onPress={handleImageSelection}>
            <Image
              source={{ uri: formik.values[name] }}
              style={styles.selectedImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleImageSelection} style={styles.fileButton}>
            <Icon name='camera' size={32} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {(formik.touched?.[name] && showError && formik.errors?.[name]) && (
        <Text style={styles.errorMessage}>{formik.errors[name]}</Text>
      )}

<Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} backdropOpacity={0.5} animationIn="slideInUp" animationOut="slideOutDown">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select an Option</Text>
          <TouchableOpacity style={styles.optionButton} onPress={takePhotoFromCamera}>
            <Icon name="camera" size={24} color="#131313" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={choosePhotoFromLibrary}>
            <Icon name="image" size={24} color="#131313" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  fileButton: {
    width: widthScale(100),
    height: widthScale(100),
    backgroundColor: '#E1E1E1',
    borderRadius: widthScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImage: {
    width: widthScale(100),
    height: widthScale(100),
    borderRadius: widthScale(50),
    borderColor: '#E1E1E1',
    borderWidth: 2,
  },
  errorMessage: {
    color: 'red',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },

  modalContent: {
    backgroundColor: '#F9F6FD',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontScale(16),
    marginBottom: 15,
    fontFamily:fontFamilies.allroundgothicSemiBold,
    lineHeight:18
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E1E1',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 24,
    marginBottom: 10,
  },
  optionText: {
    color: '#131313',
    fontSize: fontScale(14),
    marginLeft: 10,
    fontFamily:fontFamilies.SFProRoundedBlackSemiBold

  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#3498db',
    fontSize: fontScale(14),
    fontFamily:fontFamilies.allroundgothicSemiBold
  },
});