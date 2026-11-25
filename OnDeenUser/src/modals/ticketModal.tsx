import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import {heightScale, widthScale} from '../helpers/scale';
import QRCode from 'react-native-qrcode-svg';

const {width: screenWidth} = Dimensions.get('window');

interface TicketModalProps {
  isModalVisible: boolean;
  toggleModal: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isModalVisible,
  toggleModal,
}) => {
  return (
    <Modal
      isVisible={isModalVisible}
      onBackdropPress={toggleModal}
      style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Your Ticket</Text>
        <View style={styles.qrCodeContainer}>
          <QRCode value="https://example.com" size={widthScale(180)} />
        </View>
        <View style={styles.ticketInfoContainer}>
          <Text style={styles.ticketInfo}>Coupon Code: ABCD1234</Text>
          <Text style={styles.ticketInfo}>Ticket Type: VIP</Text>
        </View>
        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    width: screenWidth * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: widthScale(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: heightScale(20),
    fontWeight: 'bold',
    marginBottom: heightScale(15),
  },
  qrCodeContainer: {
    marginBottom: heightScale(20),
  },
  ticketInfoContainer: {
    marginBottom: heightScale(20),
  },
  ticketInfo: {
    fontSize: heightScale(16),
    color: '#333',
    textAlign: 'center',
    marginVertical: heightScale(5),
  },
  closeButton: {
    paddingVertical: heightScale(10),
    paddingHorizontal: widthScale(40),
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: heightScale(16),
    color: '#000',
  },
});

export default TicketModal;
