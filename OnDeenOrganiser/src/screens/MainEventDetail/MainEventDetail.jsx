import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import FirstTab from './FirstTab';
import SecondTab from './SecondTab';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { eventbyidAPI } from '../../redux/slices/eventbyidSlice';
import CustomHeader from '../../components/customHeader';
import { getEventTitle } from '../../common/options';
import { fontFamilies } from '../../assets/themes/fonts';
import { apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export default function MainEventDetail({ route }) {
  const { id, sessionDate } = route.params;
  const [tab, setTab] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { eventbyid } = useSelector((state) => state.eventbyid);
  const token = useSelector((state) => state.token.token?.access_token);
  const bearerToken = useSelector((state) => state.user.loginToken);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    setRefreshing(true);
    dispatch(eventbyidAPI(id)).finally(() => setRefreshing(false));
  };
  const movetoAskedQuestion = () => {
    navigation.navigate('AskedQuestion', { id: eventbyid?.id });
  };
  const movetoUpdateEvent = () => {
    navigation.navigate('CreateEvent', { id: eventbyid?.id, latitude: eventbyid?.latitude, longitude: eventbyid?.longitude, address: eventbyid?.location });
  }

  const cancelEvent = () => {
    if (!eventbyid?.id) {
      return;
    }

    Alert.alert(
      'Cancel event?',
      'This will stop sales, cancel all active bookings and notify affected attendees.',
      [
        { text: 'Keep event', style: 'cancel' },
        {
          text: 'Cancel event',
          style: 'destructive',
          onPress: async () => {
            const response = await apiRequest({
              url: '/organizer_app/event/delete',
              method: 'DELETE',
              data: { id: eventbyid.id, type: 11 },
              authToken: token,
              bearerToken,
              contentType: 'application/json',
            });
            if (response?.status) {
              showResponce('Event cancelled successfully.', 1);
              navigation.goBack();
            } else {
              showResponce(response?.response?.message || 'Unable to cancel event.', 3);
            }
          },
        },
      ],
    );
  };

  console.log(eventbyid, 'eventbyideventbyideventbyideventbyideventbyideventbyideventbyideventbyideventbyid');

  return (
    <View style={styles.safeAreaView}>
      <CustomHeader
        statusBarColor="#ffff"
        rightImageSource={'2'}
        secondRightImageSource={'2'}
        containerStyle={{
          paddingVertical: heightScale(5),
          justifyContent: 'space-between',
        }}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        onClickAskedQuestion={() => movetoAskedQuestion()}
        editEvent={() => movetoUpdateEvent()}
        cencelEvent={cancelEvent}
        endEvent={() => movetoUpdateEvent()}
        title={`${getEventTitle(eventbyid?.event_type)} details`}
        eventsdots={true}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        showforeventDetails={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setTab(1)}
            style={[styles.tabItem, tab === 1 && styles.activeTab]}
          >
            <Text style={[styles.tabText, tab === 1 && styles.activeTabText]}>
              {"Event details"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab(2)}
            style={[styles.tabItem, tab === 2 && styles.activeTab]}
          >
            <Text style={[styles.tabText, tab === 2 && styles.activeTabText]}>
              {"Event Material"}
            </Text>
          </TouchableOpacity>
        </View>
        {tab === 1 ? (
          <FirstTab eventbyid={eventbyid} onRefreshEvent={fetchData} sessionDate={sessionDate} />
        ) : (
          <SecondTab eventbyid={eventbyid} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E4DEF1",
    borderRadius: 48,
    padding: widthScale(4),
    marginVertical: widthScale(16),
    marginHorizontal: 21,
  },
  tabItem: {
    width: '50%',
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 10,
  },
  tabText: {
    color: "#3E146F",
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  activeTabText: {
    color: "#3E146F",
  },
});
