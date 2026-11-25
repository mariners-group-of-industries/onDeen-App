import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState} from 'react';
import {fontFamilies} from '../assets/fonts/fonts';
import {fontScale, heightScale, widthScale} from '../helpers/scale';
import TouchableLabel from './customLabels';
import AppVersion from '../assets/svg/info-circle.svg';

const descriptions = {
  'Exploring Islam': 'For those new to learning or reverts.',
  Beginner: 'For those with basic knowledge.',
  Intermediate: 'For those looking to deepen their understanding.',
  Advanced: 'For those with strong knowledge and experience.',
};

export default function SelectOption({
  options,
  onSelect,
  setModalVisible,
  showsearch = true,
  isJourneyicon= false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDescription, setSelectedDescription] = useState(null);

  const filteredOptions = options.filter(
    option =>
      option.label &&
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = option => {
    onSelect(option);
  };

  return (
    <View style={styles.container}>
      {/* FlatList for scrollable options */}
      <FlatList
        data={filteredOptions}
        keyExtractor={item => item.value}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleSelect(item)}>
            <Text style={styles.modalOptionText}>{item.label}</Text>
            {isJourneyicon ?<TouchableOpacity
              onPress={() =>
                setSelectedDescription(descriptions[item.label] || null)
              }>
              <AppVersion height={24} width={24} />
            </TouchableOpacity> : null}
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Info Modal with backdrop press support */}
      <Modal
        visible={!!selectedDescription}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedDescription(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedDescription(null)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContentJourney}>
                {/* <Text style={styles.title}>{selectedDescription}</Text> */}
                <Text style={styles.descriptionText}>
                  {selectedDescription}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDescription(null)}>
                  <Text style={styles.dismiss}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableLabel
        label={'CANCEL'}
        onPress={() => {
          setSearchQuery('');
          setModalVisible(false);
        }}
        containerStyle={styles.viewallContainer}
        labelStyle={styles.viewallLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 600,
    justifyContent: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentJourney: {
    backgroundColor: '#FCFCFF',
    width: '80%',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  dismiss: {
    color: '#C43D5E',
    marginTop: 15,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  viewallContainer: {
    marginTop: 10,
    width: '100%',
    borderRadius: widthScale(90),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  viewallLabel: {
    color: '#000000',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
});
