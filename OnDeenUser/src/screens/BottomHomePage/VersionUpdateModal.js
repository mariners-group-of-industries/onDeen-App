import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const VersionUpdateModal = ({ visible, forceUpdate, onUpdate, onLater }) => {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!forceUpdate) onLater?.();
      }}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to continue.
          </Text>

          <View style={styles.buttonRow}>
            {!forceUpdate && (
              <TouchableOpacity style={styles.button} onPress={onLater}>
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onUpdate}
            >
              <Text style={[styles.buttonText, styles.primaryText]}>
                Update
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VersionUpdateModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginLeft: 10,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#333',
    fontSize: 15,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,

  },
  primaryText: {
    color: '#fff',
  },
});
