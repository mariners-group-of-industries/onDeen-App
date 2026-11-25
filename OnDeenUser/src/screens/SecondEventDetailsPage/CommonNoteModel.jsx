import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import CustomModal from '../../components/customModal';
import { widthScale } from '../../helpers/scale';
import styles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome'; // Assuming you're using FontAwesome for the back icon
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommonNoteModel({
  isNewNoteModalVisible,
  closeModal,
  selectedNote,
  newNoteTitle,
  setNewNoteTitle,
  newNoteContent,
  setNewNoteContent,
  handleSaveNewNote,
}) {
  const insets = useSafeAreaInsets();

  return (
    <CustomModal
      onClose={closeModal}
      containerStyle={[
        styles.modalContainer,
        { marginTop: insets.top + 325 },
      ]}
      modalStyle={{ backgroundColor: 'transparent' }}
      closeOnBackdropPress={true}
      isVisible={isNewNoteModalVisible}
      headerComponent={
        <View style={styles.modalHeaderContainer}>
          <Pressable
            onPress={closeModal}
            style={styles.modalHeaderSubContainer}>
            <Icon name={'chevron-left'} size={14} color="#000000" />
            <Text style={styles.backLabel}>Discard</Text>
          </Pressable>
          <Pressable onPress={handleSaveNewNote}>
            <Text style={styles.doneLabel}>Save note</Text>
          </Pressable>
        </View>
      }>
      <Text style={styles.selectedHeading}>{selectedNote?.title}</Text>

      <View style={{ paddingHorizontal: widthScale(24) }}>
        <TextInput
          placeholder="Title / heading"
          value={newNoteTitle}
          onChangeText={setNewNoteTitle}
          style={styles.inputTextsTitle}
          placeholderTextColor={'#B5B5B5'}
        />
        <TextInput
          placeholder="Paragraph"
          value={newNoteContent}
          onChangeText={setNewNoteContent}
          multiline
          style={styles.inputTexts}
          placeholderTextColor={'#B5B5B5'}
        />
      </View>
    </CustomModal>
  );
}

