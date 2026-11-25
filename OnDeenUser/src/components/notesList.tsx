// components/NotesList.tsx
import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import CustomModal from './customModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {fontScale, widthScale} from '../helpers/scale';

const NotesList = ({notesData, onNotesUpdate}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  // Ref for the TextInput to manage focus
  const inputRef = useRef(null);

  // Group notes by date and memoize it to optimize performance
  const groupedNotes = useMemo(() => {
    return Object.keys(notesData).map(date => ({
      date,
      data: notesData[date],
    }));
  }, [notesData]);

  // Handle note press (open modal)
  const handleNotePress = useCallback(note => {
    setSelectedNote(note);
    setEditedContent(note.content); // Set the content to be edited
    setModalVisible(true); // Show modal
  }, []);

  // Handle saving the edited note
  const handleSave = useCallback(() => {
    if (selectedNote) {
      const updatedNotesData = {...notesData};
      const noteDate = Object.keys(updatedNotesData).find(date =>
        updatedNotesData[date].find(item => item.id === selectedNote.id),
      );
      updatedNotesData[noteDate] = updatedNotesData[noteDate].map(item =>
        item.id === selectedNote.id ? {...item, content: editedContent} : item,
      );
      onNotesUpdate(updatedNotesData); // Pass updated notes back to parent
      setModalVisible(false); // Close modal
    }
  }, [selectedNote, editedContent, notesData, onNotesUpdate]);

  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity onPress={() => handleNotePress(item)}>
        <View style={styles.subContainer}>
          <View style={styles.notesContainer}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.notesHeading}>{item.title}</Text>
              <Text style={styles.notesTime}>{item.time}</Text>
            </View>
            <Text style={styles.notesContent}>{item.content}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleNotePress],
  );

  const renderSectionHeader = useCallback(
    ({section: {date}}) => <Text style={styles.dateLabel}>{date}</Text>,
    [],
  );

  return (
    <View>
      <FlatList
        data={groupedNotes}
        renderItem={({item: section}) => (
          <>
            {renderSectionHeader({section})}
            {section.data.map(item => renderItem({item}))}
          </>
        )}
        keyExtractor={item => item.id?.toString()}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal for editing the note */}
      {selectedNote && (
        <CustomModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={selectedNote.title}
          closeButtonText="Save"
          closeOnBackdropPress={true}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline={true}
            placeholder="Edit your note"
          />
          <TouchableOpacity onPress={handleSave}>
            <Text>Save</Text>
          </TouchableOpacity>
        </CustomModal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  subContainer: {
    paddingHorizontal: widthScale(21),
    paddingTop: 8,
  },
  containerImage: {
    height: 24,
    width: 24,
    left: Dimensions.get('screen').width * 0.11,
  },
  containerImageEdit: {
    height: 24,
    width: 24,
    marginRight: 18,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    fontWeight: '500',
    right: widthScale(56),
  },
  dateLabel: {
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#0E0D0E',
    paddingLeft: 21,
    marginTop: 12,
  },
  notesContainer: {
    backgroundColor: '#FFEFBD',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },

  notesHeading: {
    fontSize: fontScale(12),
    fontWeight: '500',
    color: '#000000',
  },
  notesTime: {
    fontSize: fontScale(10),
    fontWeight: '400',
    color: '#545454',
  },
  notesContent: {
    fontSize: fontScale(12),
    fontWeight: '400',
    color: '#3A3A3A',
  },
  modalContainer: {
    backgroundColor: '#FDFBFF',
    flex: 1,
    marginHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 0,
    width: '100%',
  },
  backLabel: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#000000',
  },
  doneLabel: {
    color: '#DB3171',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
  selectedHeading: {
    fontSize: fontScale(20),
    fontWeight: '500',
    color: '#161616',
    paddingTop: 24,
  },
  inputTexts: {
    fontSize: fontScale(12),
    fontWeight: '400',
    color: '#161616',
    bottom: 8,
    right: 4,
  },
  modalHeaderSubContainer: {flexDirection: 'row', alignItems: 'center', gap: 4},
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: widthScale(52),
  },
});
export default NotesList;
