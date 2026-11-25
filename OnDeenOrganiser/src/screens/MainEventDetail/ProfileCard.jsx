import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import Modal from 'react-native-modal';
import { getparticipantattendancelistbyidAPI } from '../../redux/slices/getparticipantattendancelistidSlice';
import { useDispatch, useSelector } from 'react-redux';
import Journeylevel from '../../assets/svg/journeylevel.svg';
import LinearGradient from 'react-native-linear-gradient';
import TouchableLabel from '../../components/customLabels';
import { useNavigation } from '@react-navigation/native';
import Attendance from './Attendance';
import { fontFamilies } from '../../assets/themes/fonts';
import { apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export default function ProfileCard({ modalVisible, setModalVisible, selectid, selectuser, eventId, checkInEnabled = true }) {
  const [refreshing, setRefreshing] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const dispatch = useDispatch();

  const getparticiandatafetchData = () => {
    setRefreshing(true);
    dispatch(getparticipantattendancelistbyidAPI(selectid)).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (selectid) {
      getparticiandatafetchData();
      setModalVisible(true);
    }
  }, [selectid]);

  const { getparticipantattendancelist } = useSelector((state) => state.getparticipantattendancelist);
  const token = useSelector((state) => state.token.token?.access_token);
  const bearerToken = useSelector((state) => state.user.loginToken);

  const markAttendance = async () => {
    if (!eventId || !selectid || markingAttendance) {
      return;
    }
    try {
      setMarkingAttendance(true);
      const response = await apiRequest({
        url: '/organizer_app/event/manual_attendance',
        method: 'POST',
        data: { event_id: eventId, participant_id: selectid },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
        showResponce('Attendance marked successfully.', 1);
        getparticiandatafetchData();
      } else {
        showResponce(response?.response?.message || 'Unable to mark attendance.', 3);
      }
    } catch (_) {
      showResponce('Unable to mark attendance.', 3);
    } finally {
      setMarkingAttendance(false);
    }
  };

  ;

  const navigation = useNavigation();

  const movetoEventDetails = () => {
    // navigation.navigate('Participants', { id: selectid });
    navigation.goBack();
  };

  ;


  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.inputContainer}>
      </TouchableOpacity>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
        <View style={styles.modalContent}>
          <View >
            <View style={styles.profileInfo}>
              <Image
                source={{ uri: selectuser?.profile_image ? selectuser?.profile_image : 'https://i.imgur.com/5N2T101.jpg', }}
                style={styles.profileImage}
              />
              <Text style={styles.name}>{selectuser?.first_name} {selectuser?.last_name}</Text>
              <Text style={styles.contact}>{selectuser?.country_code} {selectuser?.mobile_number} </Text>
              {/* <Text style={styles.email}>{selectuser?.organizer_name} </Text> */}
              {/* <TouchableOpacity style={styles.newJoinerButton}>
                <Text style={styles.buttonText}>New Joiner</Text>
              </TouchableOpacity> */}
            </View>
            <View style={styles?.border}></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{}}>
                <Text style={styles.contact}>Journey Level</Text>
                <View style={[styles.journeyLevel, { flexDirection: 'row' }]}>
                  <Journeylevel width={48} height={48} />
                  <Text style={[styles.attendlabel, { paddingLeft: 10 }]}>Advanced</Text>
                </View>
              </View>
              {/* <View style={styles.infoBtnContainer}>
                <LinearGradient
                  colors={['#DB3171', '#FFCC33']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gradientBorder}>
                  <TouchableLabel
                    label={'ASSIGN BUDDY'}
                    onPress={() => { movetoEventDetails() }}
                    containerStyle={styles.viewallContainer}
                    labelStyle={styles.viewallLabel}
                  />
                </LinearGradient>
              </View> */}
            </View>
            <View style={styles?.border}></View>
            <View style={styles.attendance}>
              <Text style={styles.attendlabel}>Attendance</Text>
              <Attendance data={getparticipantattendancelist} />
              {checkInEnabled ? (
                <TouchableOpacity
                  accessibilityLabel="Mark attendee present"
                  accessibilityRole="button"
                  onPress={markAttendance}
                  disabled={markingAttendance}
                  style={[styles.manualAttendanceButton, markingAttendance && styles.manualAttendanceButtonDisabled]}
                >
                  {markingAttendance ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.manualAttendanceButtonText}>Mark present</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View
                  accessible
                  accessibilityLabel="Check-in is disabled. Attendance, XP, streak and Radar will not be recorded."
                  style={styles.checkInDisabledCard}
                >
                  <Text style={styles.checkInDisabledTitle}>Check-in is disabled</Text>
                  <Text style={styles.checkInDisabledText}>
                    Attendance, XP, streak and Radar will not be recorded.
                  </Text>
                </View>
              )}
            </View>
          </View>

        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: heightScale(2),
    marginBottom: heightScale(12),
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(14),
    color: '#161616',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    paddingVertical: heightScale(16),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(24),
    paddingRight: widthScale(50),
    color: '#161616',
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: widthScale(20),
    maxHeight: heightScale(700),
  },
  iconContainer: {
    position: 'absolute',
    right: widthScale(15),
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#E9E2F2',
  },
  name: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#000',
    fontSize: fontScale(18),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  contact: {
    fontSize: 14,
    color: '#000',
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  email: {
    fontSize: 14,
    color: '#000',
  },
  newJoinerButton: {
    backgroundColor: '#DCFFC6',
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#4D8D26'

  },
  journeyLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 20,
  },
  levelIcon: {
    marginRight: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    paddingBottom: 10
  },
  attendlabel: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  assignBuddyButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  attendance: {
    marginTop: 10,
  },
  manualAttendanceButton: {
    alignItems: 'center',
    backgroundColor: '#3E146F',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  manualAttendanceButtonDisabled: {
    opacity: 0.65,
  },
  manualAttendanceButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: fontScale(14),
  },
  checkInDisabledCard: {
    backgroundColor: '#F3F0F7',
    borderColor: '#DDD4E8',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkInDisabledTitle: {
    color: '#3E146F',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: fontScale(14),
  },
  checkInDisabledText: {
    color: '#5F5866',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(12),
    lineHeight: 18,
    marginTop: 4,
  },

  checkboxes: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  viewallLabel: {
    fontSize: fontScale(10),
    color: '#000000',
    fontWeight: '700',
  },
  viewallContainer: {
    height: heightScale(30),
    // width: widthScale(91),
    borderRadius: widthScale(90),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FDFBFF',
  },
  gradientBorder: {
    borderRadius: widthScale(90),
    padding: widthScale(1.3),
  },
  infoBtnContainer: {
    paddingLeft: widthScale(55),
    bottom: heightScale(12),
  },
  border: { width: '100%', backgroundColor: '#E4E4E4', height: 1, marginVertical: 10 }
});
