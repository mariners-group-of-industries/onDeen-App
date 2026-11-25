import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  BackHandler,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styles from './styles';
import { fontScale } from '../../helpers/scale';
import LatestHeader from '../../components/LatestHeader';
import { useDispatch, useSelector } from 'react-redux';
import { listRequestBuddy } from '../../redux/slices/listRequestBuddy';
import SessionDetailsModal from '../../modals/sessionModal';
import NoData from '../../components/NoData';
import CommonSearchInput from '../../components/CommonSearchInput';
import OneToOneSessionList from './OneToOneSessionList';

const OneToOneSession = ({ route }) => {
  const { isSessionRequested, speakerId } = route.params || {};

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, status, error } = useSelector(
    (state) => state.listRequestBuddy,
  );
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const openModal = session => {
    setSelectedSession(session);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    fetchSessions()
  };

  const fetchSessions = useCallback(() => {
    dispatch(listRequestBuddy());
  }, [dispatch]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSessions();
    // Simulate network request completion
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [fetchSessions]);

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  // Explicit lifecycle status wins over date; legacy past sessions remain completed.
  const allSessions = data?.response || [];
  const completedSessions = allSessions.filter(session => (
    session?.status == 6 ||
    session?.status == 2 ||
    session?.status == 4 ||
    session?.date < today
  ));
  const upcomingSessions = allSessions.filter(session => (
    ![2, 4, 6].includes(Number(session?.status)) && session?.date >= today
  ));

  // Filter sessions based on search query
  const filterSessions = (sessions, query) => {
    if (!query) {
      return sessions;
    }

    return sessions.filter(session => {
      const speakerName = `${session.speaker_first_name || ''} ${session.speaker_last_name || ''}`.toLowerCase();
      const eventTitle = session.event_title?.toLowerCase() || '';
      const organization = session.organization_name?.toLowerCase() || '';
      const userComment = session.user_comment?.toLowerCase() || '';

      return (
        speakerName.includes(query.toLowerCase()) ||
        eventTitle.includes(query.toLowerCase()) ||
        organization.includes(query.toLowerCase()) ||
        userComment.includes(query.toLowerCase())
      );
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );

  const filteredUpcomingSessions = filterSessions(upcomingSessions, searchQuery);
  const filteredCompletedSessions = filterSessions(completedSessions, searchQuery);

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={[styles.container]}>
      <LatestHeader
        statusBarColor="#fff"
        secondRightImageSource={'2'}
        containerStyle={{
          justifyContent: 'space-between',
        }}
        leftIconName="chevron-left"
        onLeftPress={() => {
          if (isSessionRequested) {
            navigation.navigate('SpeakerScreen', { speakerId: speakerId });
          } else {
            navigation.goBack();
          }
        }}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        title={'One-to-One Session'}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['pink', 'pink']} // Android
            tintColor="pink" // iOS
          />
        }
      >
        {(upcomingSessions.length > 0 || completedSessions.length > 0) && (
          <View style={styles.searchBarContainer}>
            <CommonSearchInput
              placeholder="Search"
              value={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          {!data?.response || data?.response.length == 0 ? (
            <View style={styles.centered}>
              <NoData
                title={'Try Again After Sometime'}
                heading={'YOU DONT HAVE ANY SESSIONS YET'}
                onPress={() => {
                  navigation.goBack();
                }}
                buttonTitle={'Explore Events'}
              />
            </View>
          ) : (
            <>
              {filteredUpcomingSessions.length > 0 && (
                <View style={{ marginTop: 24, paddingHorizontal: 24 }}>
                  <Text style={styles.upcomingTitle}>Upcoming Session</Text>
                  <OneToOneSessionList
                    sessions={filteredUpcomingSessions}
                    onSessionPress={openModal}
                    type='upcoming'
                  />
                </View>
              )}

              {filteredCompletedSessions.length > 0 && (
                <View style={{ marginTop: 24, paddingHorizontal: 24 }}>
                  <Text style={styles.upcomingTitle}>Completed Sessions</Text>
                  <OneToOneSessionList
                    sessions={filteredCompletedSessions}
                    onSessionPress={openModal}
                    type='completed'
                  />
                </View>
              )}

              {filteredUpcomingSessions.length == 0 &&
                filteredCompletedSessions.length == 0 &&
                (upcomingSessions.length > 0 || completedSessions.length > 0) && (
                  <View style={styles.centered}>
                    <Text style={styles.noResultsText}>No results found</Text>
                  </View>
                )}
            </>
          )}
        </View>
      </ScrollView>

      <SessionDetailsModal
        visible={isModalVisible}
        session={selectedSession}
        onClose={closeModal}
      />
    </ContainerComponent>
  );
};

export default OneToOneSession;
