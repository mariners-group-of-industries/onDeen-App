import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Modal from 'react-native-modal';
import SelectOption from './SelectOption';
import Down from '../assets/svg/down.svg';
import { fontFamilies } from '../assets/fonts/fonts';
import AppVersion from '../assets/svg/info-circle.svg';

export default function CustomeSelect({
  formik,
  name,
  label,
  placeholder,
  type,
  options = [],
  customewidth = '100%',
  showIcon = false,
}) {
  const [showError, setShowError] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalVisible, setModalVisibleState] = useState(false);
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

  const handleSelect = option => {
    formik.setFieldValue(name, option.value);

    const additionalFields = {
      gender: ['gender', 'gender_name'],
      journey_level_id: ['journey_level_id', 'journey_level_name'],
    };

    if (additionalFields[name]) {
      additionalFields[name].forEach(field =>
        formik.setFieldValue(field, option.value),
      );
    }

    setModalVisible(false);
  };

  const getValues = () => {
    return options.find(item => item.value == formik.values[name])?.label || '';
  };

  return (
    <View style={[styles.container, { width: customewidth }]}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      {label && (
        <Text
          style={[
            styles.title,
          ]}>
          {label}
        </Text>
      )}
      {showIcon && (
        <View style={styles.svgContainer}>
          <TouchableOpacity onPress={() => setModalVisibleState(true)}>
            <AppVersion width={18} height={18} />
          </TouchableOpacity>
        </View>
      )}
      </View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={getValues()}
          placeholder={placeholder}
          placeholderTextColor={'#969696'}
          keyboardType={type || 'default'}
          editable={false}
        />
        <View style={styles.iconContainer}>
          <Down width={20} height={20} fill="#888" />
        </View>
      </TouchableOpacity>

      {formik.touched?.[name] && showError && formik.errors?.[name] && (
        <Text style={styles.errorMessage}>{formik.errors?.[name]}</Text>
      )}

      <Modal
        isVisible={isModalVisible}
        statusBarTranslucent
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <SelectOption
            showsearch={
              !['category_id', 'journey_level_id', 'sect_rep'].includes(name)
            }
            setModalVisible={setModalVisible}
            options={options.length > 0 ? options : dummyOptions}
            onSelect={handleSelect}
            isJourneyicon={name == 'journey_level_id' ? true : false}
          />
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        style={{
          justifyContent: 'flex-end',
          marginBottom: 24,
        }}
        onBackdropPress={() => setModalVisibleState(false)}
        onRequestClose={() => setModalVisibleState(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisibleState(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text
                style={{
                  fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
                  color: '#161616',
                  fontSize: fontScale(18),
                }}>
                Journey Level
              </Text>
              <Text
                style={{
                  fontFamily: fontFamilies.SFProRoundedBlackMedium,
                  color: '#161616',
                  fontSize: fontScale(14),
                }}>
                Select where you are on your journey of learning Islam. This
                helps us recommend events and content that best suit your level
                and goals.
              </Text>
              <TouchableOpacity onPress={() => setModalVisibleState(false)}>
                <Text style={styles.dismiss}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const dummyOptions = [];

const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(2),
    marginBottom: heightScale(4),
  },
  title: {
    marginBottom: heightScale(4),
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: fontScale(14),
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(50),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  errorMessage: {
    fontSize: fontScale(12),
    color: 'red',
    marginTop: heightScale(4),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    // maxHeight: heightScale(400),
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: widthScale(20),
  },
  iconContainer: {
    position: 'absolute',
    right: widthScale(15),
    justifyContent: 'center',
  },
  svgContainer: {
    // position: 'absolute',
    // right: widthScale(5),
    // left: 84,
    justifyContent: 'center',
    paddingLeft:10
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  dismiss: {
    color: '#DB3171',
    marginTop: 15,
    textAlign: 'right',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
});
