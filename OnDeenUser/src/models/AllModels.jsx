import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

export default function AllModels() {
  const [visible, setVisible] = useState(null);

  const toggleModal = (type) => {
    setVisible(visible === type ? null : type);
  };

  return (
    <View style={styles.container}>
      {/* Buttons */}
      {['center', 'left', 'right', 'top', 'bottom', 'full'].map((type) => (
        <Button key={type} title={`Show ${type} modal`} onPress={() => toggleModal(type)} />
      ))}

      {/* 1. Center Modal */}
      <Modal isVisible={visible === 'center'} onBackdropPress={() => toggleModal('center')}>
        <View style={styles.modalCenter}>
          <Text>Center Modal</Text>
        </View>
      </Modal>

      {/* 2. Left Slide Modal */}
      <Modal
        isVisible={visible === 'left'}
        onBackdropPress={() => toggleModal('left')}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        style={styles.leftModal}
      >
        <View style={styles.modalSide}>
          <Text>Left Modal</Text>
        </View>
      </Modal>

      {/* 3. Right Slide Modal */}
      <Modal
        isVisible={visible == 'right'}
        onBackdropPress={() => toggleModal('right')}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={styles.rightModal}
      >
        <View style={styles.modalSide}>
          <Text>Right Modal</Text>
        </View>
      </Modal>

      {/* 4. Top Slide Modal */}
      <Modal
        isVisible={visible === 'top'}
        onBackdropPress={() => toggleModal('top')}
        animationIn="slideInDown"
        animationOut="slideOutUp"
        style={styles.topModal}
      >
        <View style={styles.modalTopBottom}>
          <Text>Top Modal</Text>
        </View>
      </Modal>

      {/* 5. Bottom Slide Modal */}
      <Modal
        isVisible={visible === 'bottom'}
        onBackdropPress={() => toggleModal('bottom')}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.bottomModal}
      >
        <View style={styles.modalTopBottom}>
          <Text>Bottom Modal</Text>
        </View>
      </Modal>

      {/* 6. Fullscreen Modal */}
      <Modal
        isVisible={visible === 'full'}
        onBackdropPress={() => toggleModal('full')}
        style={styles.fullScreenModal}
      >
        <View style={styles.modalFull}>
          <TouchableOpacity onPress={() => toggleModal('full')}>
            <Text style={{ color: 'white' }}>Close Fullscreen Modal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-around',
  },
  modalCenter: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSide: {
    backgroundColor: 'white',
    height: '100%',
    width: 250,
    justifyContent: 'center',
    padding: 20,
  },
  leftModal: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 0,
  },
  rightModal: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    margin: 0,
  },
  topModal: {
    justifyContent: 'flex-start',
    margin: 0,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalTopBottom: {
    backgroundColor: 'white',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModal: {
    margin: 0,
  },
  modalFull: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
