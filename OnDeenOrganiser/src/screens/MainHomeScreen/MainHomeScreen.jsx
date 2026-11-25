import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, RefreshControl, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, heightScale, widthScale } from "../../helpers/scale";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Bell from '../../assets/svg/bell.svg';
import Plus from '../../assets/svg/mainplus.svg';
import Trenddown from '../../assets/svg/trenddown.svg';
import Calendarheart from '../../assets/svg/calendarheart.svg';
import EventListing from "./EventListing";
import { getProfileDetails } from "../../redux/slices/getprofileSlice";
import { getdashboardDetails } from "../../redux/slices/getdashboardSlice";
import { nocommavalue } from "../../common/datetimeformate";
import { fontFamilies } from "../../assets/themes/fonts";

export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(1);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    hitapitogetdatafilter();
  }, []);

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(getProfileDetails());
    dispatch(getdashboardDetails());
    setRefreshing(false);
  };

  const { profiledatails } = useSelector((state) => state.profiledatails);
  const { getdashboard } = useSelector((state) => state.getdashboard);
  const profileImageSource = profiledatails?.profile_image
    ? { uri: profiledatails.profile_image }
    : require('../../assets/images/profile.png');
  const contentTopPadding = Math.max(insets.top + heightScale(12), heightScale(24));
  const contentBottomPadding = Math.max(insets.bottom + heightScale(86), heightScale(96));

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      setTab(1)
      return () => { };
    }, [])
  );

  return (
    <LinearGradient
      colors={['#FFD861', '#FFAECC', '#422199']}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      locations={[0, 0.21, 0.42]}
      style={styles.safeAreaView}
    >
      <ScrollView refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={hitapitogetdatafilter}
        />
      }
      style={[styles.scrollView, { paddingTop: contentTopPadding }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image
            source={profileImageSource}
            style={{ width: 28, height: 28, borderRadius: 25 }}
          />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.imageContainer}>
              <Text style={styles.universityText}>{profiledatails?.organization_name}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row' }}>
              <TouchableOpacity
                accessibilityLabel="Open notifications"
                accessibilityRole="button"
                onPress={() => navigation.navigate('NotificationScreen')}>
                <Bell width={24} height={24} style={styles.topicon} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Create an event"
                accessibilityRole="button"
                onPress={() => navigation.navigate('CreateEvent', { id: '', latitude: '', longitude: '', address: '' })}
              >
                <Plus width={24} height={24} style={styles.topicon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setTab(1)}
            style={[styles.tabItem, tab === 1 && styles.activeTab]}>
            <Text style={[styles.tabText, tab === 1 && styles.activeTabText]}>{"Overview"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab(2)}
            style={[styles.tabItem, tab === 2 && styles.activeTab]}>
            <Text style={[styles.tabText, tab === 2 && styles.activeTabText]}>{"All Events"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open drafts"
            onPress={() => navigation.navigate('Drafts')}
            style={styles.draftsButton}>
            <Text style={styles.draftsButtonText}>Drafts</Text>
          </TouchableOpacity>
        </View>

        {tab === 1 &&
          <View style={styles.infoContainer}>
            <View style={styles.weeklyEventsContainer}>
              <View style={styles.weeklyEventsBox}>
                <Text style={[styles.weeklyEventsText]}>{"Total Revenue"}</Text>
                <Trenddown width={24} height={24} style={styles.tabsecondicon || 0} />
              </View>
              <Text style={styles.weeklyEventsCount1}>£ <Text style={styles.weeklyEventsCount}>{nocommavalue(getdashboard?.revenue)}</Text></Text>
            </View>
            <View style={styles.weeklyEventsContainer}>
              <View style={styles.weeklyEventsBox}>
                <Text style={[styles.weeklyEventsText, { color: "#7235B8" }]}>{"Events this week"}</Text>
                <Calendarheart width={24} height={24} style={styles.tabsecondicon} />
              </View>
              <Text style={styles.weeklyEventsCount}>{getdashboard?.event_count_this_week || 0}</Text>
            </View>
          </View>
        }

        <View style={[styles.upcomingEventsContainer, { paddingBottom: contentBottomPadding }]}>
          {
            tab == 1 &&
            <>
              <EventListing title={'Upcoming Events'} tab={tab} refreshing={refreshing} setRefreshing={setRefreshing}/>
              <EventListing title={'Ongoing Events'} tab={tab} refreshing={refreshing} setRefreshing={setRefreshing}/>
              <EventListing title={'Completed Events'} tab={tab} refreshing={refreshing} setRefreshing={setRefreshing}/>
            </>
          }
          {
            tab == 2 &&
            <>
              <EventListing title={'All Events'} tab={tab} refreshing={refreshing} setRefreshing={setRefreshing}/>
            </>
          }
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    borderRadius: 32,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
  },
  topicon: {
    marginTop: 4,
    marginLeft: 15
  },
  imageContainer: {
    position: "relative",
  },
  universityText: {
    color: "#000000",
    fontSize: fontScale(14),
    fontWeight: '500',
    paddingLeft: 6,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF4F",
    borderRadius: 48,
    padding: widthScale(4),
    marginVertical: widthScale(18),
    marginHorizontal: 23,
  },
  tabItem: {
    width: '42%',
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 12,
  },
  draftsButton: {
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: widthScale(8),
    paddingVertical: 12,
    width: '16%',
  },
  draftsButtonText: {
    color: "#3E146F",
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(11),
  },
  tabText: {
    color: "#3E146F",
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    marginHorizontal: 24,
    gap: 4
  },
  weeklyEventsContainer: {
    width: '50%',
    height: '100%',
    backgroundColor: "#F9F6FD",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  weeklyEventsBox: {
    flexDirection: "row",
    marginBottom: 44,
  },
  weeklyEventsText: {
    color: "#DB3171",
    fontSize: fontScale(12),
    flex: 1,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  weeklyEventsCount1: {
    color: "#3E146F",
    fontSize: fontScale(14),
  },
  weeklyEventsCount: {
    color: "#3E146F",
    fontSize: fontScale(20),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  upcomingEventsContainer: {
    backgroundColor: "#F9F6FD",
    borderRadius: 32,
    paddingTop: 27,
    paddingHorizontal: 24,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    flex: 1,
  },
  activeTab: {
    backgroundColor: "#F9F6FDCC",
  },
  activeTabText: {
    color: "#3E146F",
  },
});
