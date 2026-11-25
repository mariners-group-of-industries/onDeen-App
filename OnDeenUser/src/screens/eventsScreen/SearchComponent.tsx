// components/SearchComponent.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchResults } from '../../redux/slices/searchSlice';
import { RootState } from '../../redux/store';

interface SearchComponentProps {
  onResultSelect: (item: { id: number; title: string }) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();

  const { searchResults } = useSelector((state: RootState) => state.searchSlice);

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim() !== '') {
        dispatch(fetchSearchResults(query));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, dispatch]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search event, classes, tours, etc."
        value={query}
        onChangeText={setQuery}
      />
      {searchResults?.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => onResultSelect(item)}
            >
              <Text style={styles.resultText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultText: {
    fontSize: 16,
  },
});

export default SearchComponent;
