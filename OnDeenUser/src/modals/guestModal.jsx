import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import { fontScale, widthScale, heightScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

const GuestModal = ({
  isVisible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = 'Not now',
  confirmText = 'Continue',
}) => {
  const displayTitle = title === 'Confirm Login' ? 'Continue to login' : title;

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={280}
      animationOutTiming={220}
      backdropOpacity={0.55}
      useNativeDriver
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
      statusBarTranslucent
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{displayTitle}</Text>
        <Text style={styles.modalMessage}>{message}</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </Pressable>

          <Pressable style={styles.okButton} onPress={onConfirm}>
            <Text style={styles.okButtonText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: widthScale(24),
    paddingBottom: heightScale(34),
    paddingTop: heightScale(34),
    borderTopLeftRadius: widthScale(24),
    borderTopRightRadius: widthScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: fontScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    color: '#DB3171',
    marginBottom: heightScale(12),
  },
  modalMessage: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#161616',
    textAlign: 'center',
    lineHeight: fontScale(20),
    marginBottom: heightScale(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '82%',
  },
  cancelButton: {
    flex: 1,
    minHeight: heightScale(50),
    backgroundColor: '#FFFFFF',
    borderRadius: widthScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: widthScale(10),
    borderWidth: 1,
    borderColor: '#422199',
  },
  cancelButtonText: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#DB3171',
  },
  okButton: {
    flex: 1,
    minHeight: heightScale(50),
    backgroundColor: '#DB3171',
    borderRadius: widthScale(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#fff',
  },
});

export default GuestModal;
