import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import SearchInput from '../../components/SearchInput';
import styles from './styles';
import { fontScale } from '../../helpers/scale';
import { fetchSearchResults } from '../../redux/slices/searchSlice';
import LatestHeader from '../../components/LatestHeader';
import { fetchEventById } from '../../redux/slices/eventsSlice';
import ImageWithFallback from '../../components/ImageWithFallback';

const GlobalSearch = () => {
  const [historytrending, setHistorytrending] = useState([]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        console.log('debounced value set:', value);
        setDebouncedValue(value);
      }, delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    console.log('useEffect triggered with:', debouncedQuery);
    if (debouncedQuery.trim() != '') {
      console.log('Dispatching fetchSearchResults with:', debouncedQuery);
      setIsSearching(true);
      dispatch(fetchSearchResults(debouncedQuery)).then(() => {
        setIsSearching(false);
      });
    } else {
      dispatch(fetchSearchResults('')).then(res => {
        setHistorytrending(res?.payload || []);
      });
    }
  }, [debouncedQuery, dispatch]);

  const { searchResults } = useSelector((state) => state.searchSlice);

  const handleEventPress = item => {
    dispatch(fetchEventById(item?.id, 1));
    navigation.navigate('CourseDetails', {
      eventId: item?.id,
      eventName: item?.title,
      eventData: item,
      search: 1,
    });
  };

  const searchedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleEventPress(item)}>
      <View style={styles.resultImageContainer}>
        <ImageWithFallback
          imageurl={item?.category_image}
          style={{
            width: 16,
            height: 16,
          }}
        />
      </View>
      <Text style={styles.resultText}>{item?.title}</Text>
    </TouchableOpacity>
  );

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={styles.container}>
      <LatestHeader
        statusBarColor="#F9F6FD"
        title="Back"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{ color: '#000000', fontSize: fontScale(16) }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <SearchInput
          placeholder="Search"
          containerStyle={{
            paddingVertical: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F0F7',
            marginHorizontal: 24
          }}
          inputStyle={styles.searchInput}
          showFilter={false}
          autoFocusInitially={true}
          value={query}
          onChangeText={(text) => {
            console.log('SearchInput changed:', text);
            setQuery(text);
          }}
        />

        {query.trim() !== '' ? (
          isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <View style={styles.content}>

              {Array.isArray(searchResults) && searchResults.length > 0 ? (
                <>
                  <Text style={styles.historyTitle}>
                    {t('HomeScreen.HeadingSearch')}
                  </Text>
                  <FlatList
                    data={searchResults}
                    keyExtractor={item => item.id?.toString()}
                    renderItem={searchedItem}
                  />
                </>
              ) : (
                // <Text style={styles.notFoundText}>Not found</Text>
                <></>
              )}
            </View>
          )
        ) : (
          <>
            {Array.isArray(historytrending?.history) && historytrending.history.length > 0 && (
              <View style={styles.content}>
                <Text style={styles.historyTitle}>History</Text>
                <FlatList
                  data={historytrending.history}
                  keyExtractor={item => item.id?.toString()}
                  renderItem={searchedItem}
                />
              </View>
            )}

            {Array.isArray(historytrending?.trending) && historytrending.trending.length > 0 && (
              <View style={styles.content}>
                <Text style={styles.historyTitle}>Trending</Text>
                <FlatList
                  data={historytrending.trending}
                  keyExtractor={item => item.id?.toString()}
                  renderItem={searchedItem}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ContainerComponent>
  );
};

export default GlobalSearch;
