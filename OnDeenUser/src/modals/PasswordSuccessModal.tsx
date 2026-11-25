import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {fontScale, heightScale, widthScale} from '../helpers/scale';
import {fontFamilies} from '../assets/fonts/fonts';

interface PasswordSuccessModalProps {
  isVisible: boolean;
  message?: any;
  onConfirm: () => void;
}

const PasswordSuccessModal: React.FC<PasswordSuccessModalProps> = ({
  isVisible,
  message,
  onConfirm,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      useNativeDriver
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Password Changed</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Okay</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    padding: widthScale(20),
    borderRadius: widthScale(14),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    color: '#000',
    marginBottom: heightScale(10),
  },
  modalMessage: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    color: '#333',
    textAlign: 'center',
    marginBottom: heightScale(20),
  },
  confirmButton: {
    backgroundColor: '#DB3171',
    paddingVertical: heightScale(12),
    paddingHorizontal: widthScale(30),
    borderRadius: widthScale(30),
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
});

export default PasswordSuccessModal;
