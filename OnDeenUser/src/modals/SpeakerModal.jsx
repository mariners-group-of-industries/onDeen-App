import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UnCheck from '../../src/assets/svg/unCheck.svg';
import Checked from '../../src/assets/svg/checked.svg';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import TouchableLabel from '../components/customLabels';
import GradientButton from '../components/gradientButton';
import SearchIcon from '../../src/assets/svg/search.svg';

const SpeakersModal = ({
  visible,
  onClose,
  onCloseModal,
  speakersData,
  selectedSpeakers,
  toggleSpeaker,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const bottomPadding = insets.bottom + heightScale(12);

  const filteredSpeakers = speakersData?.filter(speaker =>
    `${speaker?.first_name} ${speaker?.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Modal
        isVisible={visible}
        style={styles.modal}
        statusBarTranslucent
        avoidKeyboard
        onBackdropPress={onCloseModal}
      >
        <KeyboardAvoidingView behavior={'padding'}>
          <View style={styles.modalContent}>
            <Pressable onPress={onCloseModal} style={styles.closeButton}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#000" />
            </Pressable>
            <Text onPress={onCloseModal} style={styles.modalTitle}>Speakers</Text>
            <View style={styles.searchContainer}>
              <SearchIcon
                width={widthScale(16)}
                height={heightScale(16)}
              />
              <TextInput
                placeholder="Search Speakers"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor={'#131313'}
              />
            </View>
            <FlatList
              data={filteredSpeakers}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.id?.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.speakerRow}
                  onPress={() => {
                    toggleSpeaker(item.id);
                  }}
                >
                  <Text style={styles.speakerName}>
                    {item?.first_name} {item?.last_name}
                  </Text>
                  <View style={styles.checkboxContainer}>
                    {selectedSpeakers.includes(item.id) ? (
                      <Checked width={22} height={22} />
                    ) : (
                      <UnCheck width={22} height={22} />
                    )}
                  </View>
                </Pressable>
              )}
            />

            <View style={[styles.buttonContainer, { paddingBottom: bottomPadding }]}>
              <View>
                <TouchableLabel
                  containerStyle={styles.cancelButton}
                  label="RESET"
                  onPress={onClose}
                  labelStyle={styles.cancelButtonText}
                />
              </View>
              <View>
                <GradientButton
                  containerStyle={styles.applyButton}
                  onPress={() => {
                    onApply(selectedSpeakers);
                    onCloseModal();
                  }}
                  title={'APPLY'}
                  textStyle={styles.applyButtonText}
                  colors={['#DB3171', '#FFCC33']}
                  start={{ x: 0.9, y: 0 }}
                  end={{ x: 0.1, y: 1 }}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FDFBFF',
    maxHeight: '100%',
    paddingHorizontal: 34,
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    top: 48,
  },
  modalTitle: {
    fontSize: fontScale(16),
    lineHeight: 18,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    marginBottom: 26,
    color: '#000000',
    paddingTop: 52,
    paddingLeft: 12,
  },
  searchContainer: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#DBD4E3',
    paddingHorizontal: widthScale(24),
    gap: 4,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    fontSize: fontScale(12),
    color: '#000',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    flex: 1,
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  speakerName: {
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#000000',
    lineHeight: 16,
  },
  checkboxContainer: {
    width: 22,
    height: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingBottom: heightScale(12),
  },
  cancelButton: {
    borderRadius: 90,
    paddingHorizontal: 24,
    height: heightScale(52),
    width: widthScale(171),
    borderWidth: 1,
    borderColor: '#161616',
    backgroundColor: '#FEFDFF',
  },
  cancelButtonText: {
    color: '#222222',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  applyButton: {
    borderRadius: 90,
    paddingRight: 12,
    paddingLeft: 16,
    height: heightScale(52),
    width: widthScale(194),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default SpeakersModal;
