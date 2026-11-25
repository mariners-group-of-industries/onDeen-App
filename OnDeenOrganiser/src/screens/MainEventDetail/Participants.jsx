import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, Modal } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomHeader from "../../components/customHeader";
import { fontScale, heightScale, widthScale } from "../../helpers/scale";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { participantbyidAPI } from "../../redux/slices/participantidSlice";
import ProfileCard from "./ProfileCard";
import Journeylevel from '../../assets/svg/journeylevel.svg';
import { fontFamilies } from "../../assets/themes/fonts";

const calculatePercentage = (total, count) => {
  if (total === 0) return 0;
  return (count / total) * 100;
};

const percentage = calculatePercentage(200, 40);

const ParticipantItem = ({ user, setselectid, setSelectuser, setModalVisible }) => (
  <View style={{ backgroundColor: '#ffff' }}>
    <TouchableOpacity
      onPress={() => {
        setselectid(user?.participant_id);
        setSelectuser(user);
        setModalVisible(true);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open ${user?.first_name || ''} ${user?.last_name || ''} participant profile`}
      style={styles.container}
    >
      <View style={[styles.userInfoContainer]}>
        <View style={{ marginRight: 16 }}>
          <Image
            style={styles.statusIcon}
            source={
              user?.profile_image
                ? { uri: user?.profile_image }
                : 'https://i.imgur.com/5N2T101.jpg'
            }
          />
          <View style={{ alignSelf: 'flex-end', marginTop: -18, marginRight: 3 }}>
            <Journeylevel width={12} height={12} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.nameAndNumber}>
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.phone}>
              {user?.country_code} {user?.mobile_number}
            </Text>
            <Text
              accessibilityLabel={user?.new_user ? 'New attendee' : 'Returning attendee'}
              style={[styles.attendeeType, user?.new_user ? styles.newAttendee : styles.returningAttendee]}
            >
              {user?.new_user ? 'New attendee' : 'Returning attendee'}
            </Text>
          </View>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  width: `${calculatePercentage(
                    user?.no_of_days_count,
                    user?.attendance_count
                  )}%`,
                },
              ]}
            />
          </View>
          <Text
            accessibilityLabel={`${user?.attendance_count || 0} of ${user?.no_of_days_count || 0} completed sessions, ${Math.round(user?.attendance_percentage || 0)} percent attendance`}
            style={styles.progressText}
          >
            {user?.attendance_count || 0} of {user?.no_of_days_count || 0} completed · {Math.round(user?.attendance_percentage || 0)}%
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        {user?.status && (
          <View style={styles.statusTag}>
            <Text style={styles.statusText}>{user?.status}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            setselectid(user?.participant_id);
            setSelectuser(user);
            setModalVisible(true); // Open the modal here too
          }}
        >
          <Icon name={'chevron-right'} size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </View>
);

export default function Participants({ route }) {
  const navigation = useNavigation();
  const { id, checkInEnabled = true } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectid, setselectid] = useState(0);
  const [selectuser, setSelectuser] = useState(0);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const dispatch = useDispatch();

  const { participantlist } = useSelector((state) => state.participantlist);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    setRefreshing(true);
    dispatch(participantbyidAPI(id)).finally(() => setRefreshing(false));
  };

  return (
    <>
      <CustomHeader
        title="Participants"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      <View style={{ flex: 1, backgroundColor: '#ffff', paddingHorizontal: 24 }}>


        {participantlist?.length == 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No participants available</Text>
          </View>
        ) : (
          <FlatList
            data={participantlist || []}
            renderItem={({ item }) => (
              <ParticipantItem
                setSelectuser={setSelectuser}
                setselectid={setselectid}
                user={item}
                setModalVisible={setModalVisible} // Pass setModalVisible here
              />
            )}
            keyExtractor={(item) => item.participant_id.toString()}
            refreshing={refreshing}
            onRefresh={fetchData}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Show ProfileCard Modal when selectid is not 0 */}
        {selectid !== 0 && (
          <ProfileCard
            selectuser={selectuser}
            modalVisible={modalVisible} // Ensure the modal state is passed
            setModalVisible={setModalVisible}
            selectid={selectid}
            eventId={id}
            checkInEnabled={checkInEnabled}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%',
    paddingVertical: 10,
    // paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(233,226,242,1)",
    backgroundColor: '#ffff',
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: '70%',
  },
  profileImage: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  textContainer: {
    flexDirection: "column",
    marginRight: 16,
  },
  nameAndNumber: {
    flexDirection: "column",
  },
  name: {
    color: "#000",
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  phone: {
    color: "#000",
    fontWeight: "400",
    lineHeight: 18,
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  attendeeType: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(9),
    marginTop: 4,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newAttendee: {
    backgroundColor: '#FFF1CF',
    color: '#8A5B00',
  },
  returningAttendee: {
    backgroundColor: '#EAF5E5',
    color: '#3F7426',
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#E9E2F2',
    margin: 5
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: 'flex-end'
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(69,198,36,1)",
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  statusText: {
    color: "rgba(77,141,38,1)",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  },
  // Modal styles
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: widthScale(20),
    maxHeight: heightScale(400),
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
  },
  barContainer: {
    height: 4,
    width: 120,
    backgroundColor: '#E9E2F2',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#4D8D26',
    borderRadius: 10,
  },
  progressText: {
    color: '#5F5868',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(10),
    lineHeight: 14,
  },
  // No Data styles
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: fontScale(16),
    color: '#888',
    fontWeight: 'bold',
  },
});
