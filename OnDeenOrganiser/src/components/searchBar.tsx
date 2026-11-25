import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  Dimensions,
  PixelRatio,
  Image,
} from 'react-native';
import {fontScale, heightScale, widthScale} from '../helpers/scale';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results: string[];
  resultStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  listStyle?: ViewStyle;
  icon?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  results,
  resultStyle,
  containerStyle,
  inputStyle,
  listStyle,
  icon = require('../assets/images/search-small.png'),
}) => {
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<string[]>([]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = results.filter(item =>
        item.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [query, results]);

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const renderItem = ({item}: {item: string}) => (
    <View style={styles.resultItem}>
      <View style={styles.resultImageContainer}>
        <Image
          resizeMode="contain"
          source={require('../assets/images/Union.png')}
          style={styles.resultImage}
        />
      </View>
      <Text style={[styles.resultText, resultStyle]}>{item}</Text>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Image source={icon} style={styles.icon} />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={query}
          onChangeText={handleSearch}
          placeholderTextColor="#969696"
        />
      </View>
      {query.length > 0 && (
        <FlatList
          data={filteredResults}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={[styles.list, listStyle]}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: widthScale(50),
    backgroundColor: '#F9F6FD',
    borderWidth: 1,
    borderColor: '#DBD4E3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthScale(14),
    backgroundColor: '#F9F6FD',
  },
  icon: {
    width: widthScale(16),
    height: heightScale(16),
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    color: '#969696',
  },
  list: {
    marginTop: heightScale(8),
    maxHeight: heightScale(250),
  },
  listContent: {
    paddingHorizontal: widthScale(10),
    paddingVertical: heightScale(10),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultImageContainer: {
    height: heightScale(32),
    width: widthScale(32),
    borderRadius: widthScale(16),
    backgroundColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: widthScale(10),
  },
  resultImage: {
    width: widthScale(24),
    height: heightScale(24),
  },
  resultText: {
    fontSize: fontScale(14),
    color: '#333',
  },
});

export default SearchBar;
