import { View, Text, TextInput, Button, Switch, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import React, { useState } from 'react';
import FilterOption from './FilterOption'; // Assuming FilterOption is in the same folder

export default function ListFilter({ setDisplayFilter, filter1, setFilter1 }) {
  

  const [currentSelectType, setCurrentSelectType] = useState('');

  const handleChange = (key, value) => {
    setFilter1({ ...filter1, [key]: value });
  };

  const category = [
    { value: 1, label: 'Normal Event' },
    { value: 2, label: 'Course Event' },
    { value: 3, label: 'Tour Event' },
  ];

  const speaker = [
    { value: 1, label: 'Ramesh' },
    { value: 2, label: 'Suresh' },
    { value: 3, label: 'Unias' },
    { value: 4, label: 'Rahul' },
    { value: 5, label: 'Shree' },
    { value: 6, label: 'Razza' },
  ];

  const organizer = [
    { value: 1, label: 'Org Ramesh' },
    { value: 2, label: 'Org Suresh' },
    { value: 3, label: 'Org Unias' },
    { value: 4, label: 'Org Rahul' },
    { value: 5, label: 'Org Shree' },
    { value: 6, label: 'Org Razza' },
  ];

  const statustype = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
  ];

  const pricetape = [
    { value: 1, label: 'Free' },
    { value: 2, label: 'Paid' },
  ];

  const handleSelect = (type, selectedOption) => {
    setFilter1({ ...filter1, [type]: selectedOption.value });
    setDisplayFilter(false);
  };
  

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterOption
          options={
            currentSelectType === 'category_id' ? category :
              currentSelectType === 'speaker_id' ? speaker :
                currentSelectType === 'organizer_id' ? organizer :
                  currentSelectType === 'statustype_id' ? statustype :
                    pricetape
          }
          onSelect={(selectedOption) => handleSelect(currentSelectType, selectedOption)}
          setDisplayFilter={setDisplayFilter}
          showsearch={true}
          filter1={filter1}
          setFilter1={setFilter1}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20, // Optional: rounded corners for the top
    borderTopRightRadius: 20, // Optional: rounded corners for the top
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  dropdown: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
