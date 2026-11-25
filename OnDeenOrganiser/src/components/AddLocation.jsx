import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomMapView from './CustomeMapView';
import GradientButton from './gradientButton';
import { heightScale } from '../helpers/scale';
const AddLocation = ({ formik }) => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);
  const bottomPadding = insets.bottom + heightScale(16);

  return (
    <View style={[styles.container]}>
      <Text style={styles.title}>Add Location</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.input}>
        <Text style={[styles.placeholder, { color: formik?.values?.location ? 'black' : '' }]}>{formik?.values?.location || 'Enter Location'}</Text>
      </TouchableOpacity>

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
        <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <CustomMapView formik={formik} />
            {formik?.values?.location && (
              <GradientButton
                onPress={() => setModalVisible(false)}
                title="Save Location"
                containerStyle={styles.buttonContainer}
                textStyle={styles.buttonText}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    height: '95%',
  },
  input: {
    fontSize: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#F3F0F7',
    borderRadius: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#969696',
  },
  title: {
    fontWeight: '500',
    fontSize: 14,
    color: '#161616',
    paddingVertical: 8,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    marginBottom: 32,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  container: {
    marginTop: heightScale(-6),
    marginBottom: heightScale(10),
  },
});

export default AddLocation;
