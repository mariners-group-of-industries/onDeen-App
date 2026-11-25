import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchIcon from '../../../src/assets/svg/search.svg';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { participantListEventID } from '../../redux/callapis/CommonService';
import ImageWithFallback from '../../components/ImageWithFallback';
import { fontFamilies } from '../../assets/fonts/fonts';

const ParticipantItem = React.memo(({ user }) => (
  <View style={{ backgroundColor: '#FFF' }}>
    <View
      accessible
      accessibilityLabel={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()}
      style={styles.container}
    >
      <View style={styles.userInfoContainer}>
        <View style={{ marginRight: 16 }}>
          <ImageWithFallback
            imageurl={user?.profile_image}
            style={styles.statusIcon}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameAndNumber}>
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </View>
));

export default function AllParticipantLists({ route }) {
  const { event_id } = route.params;
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [participantlist, setParticipantlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const ContainerComponent = SafeAreaView;

  const fetchParticipantList = useCallback(async () => {
    setRefreshing(true);
    const data = { event_id: event_id };
    try {
      const res = await participantListEventID(data);
      setParticipantlist(res?.response || []);
      setFilteredList(res?.response || []);
    } catch (err) {
      setParticipantlist([]);
      setFilteredList([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [event_id]);

  useEffect(() => {
    if (event_id) {
      setLoading(true);
      fetchParticipantList();
    }
  }, [event_id, fetchParticipantList]);

  useEffect(() => {
    if (searchText.trim() == '') {
      setFilteredList(participantlist);
    } else {
      const filtered = participantlist.filter((user) => {
        const fullName = `${user?.first_name} ${user?.last_name}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase());
      });
      setFilteredList(filtered);
    }
  }, [searchText, participantlist]);

  return (
    <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
      <LatestHeader
        statusBarColor="#FFF"
        title={'Participants'}
        onLeftPress={() => navigation.goBack()}
        leftIconName="chevron-left"
      />
      {loading ? <Loader />
        :
        <>
          <View
            style={{
              flex: 1,
              backgroundColor: '#FFF',
              paddingHorizontal: 36,
            }}
          >
            <View
              style={[
                styles.searchInput,
                isFocused && { borderColor: '#FFE0EC' },
              ]}
            >
              <SearchIcon width={widthScale(16)} height={heightScale(16)} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchField}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>

            <FlatList
              data={filteredList}
              renderItem={({ item }) => (
                <ParticipantItem user={item} />
              )}
              keyExtractor={(item) => item.participant_id?.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchParticipantList}
                  colors={['#FFE0EC']}
                  tintColor="#FFE0EC"
                />
              }
            />
          </View>
        </>
      }
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E8E6EA',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: widthScale(48),
    height: widthScale(48),
    borderRadius: 24,
    backgroundColor: '#ddd',
  },
  textContainer: {
    flex: 1,
  },
  nameAndNumber: {
    flexDirection: 'column',
  },
  name: {
    fontSize: fontScale(14),
    color: '#1A1A1A',
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  noDataText: {
    fontSize: fontScale(16),
    color: '#999',
  },
  searchInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchField: {
    color: '#161616',
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 14,
    height: 40,
    marginLeft: 8,
    paddingVertical: 0,
  },
});
