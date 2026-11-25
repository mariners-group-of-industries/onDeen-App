import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LatestHeader from '../../components/LatestHeader';
import styles from './styles';
import { fetchSpeakerSlots } from '../../redux/slices/speakerSlots';
import SlotCard from '../../components/SlotCard';
import GradientButton from '../../components/gradientButton';
import { requestSessionCall } from '../../redux/slices/requestSessionSlice';
import Loader from '../../components/loader';
import { updateSessionCall } from '../../redux/slices/updateSessionRequest';
import { useToastForPopup } from '../../context/ToastContext';
import {buildSessionDateOptions} from './sessionDateOptions';

const RequestSessions = ({ route }) => {
  const { speakerId, eventId, isRequestSession, sessionId } = route.params || {};
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const speakerSlots = useSelector(
    (state) => state.speakerSlots.data,
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateArray, setDateArray] = useState([]);
  const [morningSlots, setMorningSlots] = useState([]);
  const [eveningSlots, setEveningSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDateArray(buildSessionDateOptions());
  }, []);


  const showToast = useToastForPopup();


  const handleDateSelect = (selectedId) => {
    if (selectedDate !== selectedId) {
      setSelectedDate(selectedId);
      setSelectedSlot(null);
      setSelectedTime(null);
      dispatch(fetchSpeakerSlots({ speakerId, date: selectedId }));
    }
  };

  useEffect(() => {
    if (selectedDate && speakerSlots?.response?.times) {
      const slots = speakerSlots?.response?.times;
      const morning = slots?.filter(
        slot => parseInt(slot?.start_time?.split(':')[0], 10) < 18,
      );
      const evening = slots.filter(
        slot => parseInt(slot?.start_time?.split(':')[0], 10) >= 18,
      );
      setMorningSlots(morning);
      setEveningSlots(evening);
    } else {
      setMorningSlots([]);
      setEveningSlots([]);
    }
  }, [selectedDate, speakerSlots]);

  const renderDateItem = useMemo(
    () =>
      ({ item }) =>
      (
        <TouchableOpacity
          activeOpacity={item?.status == 1 ? 0.8 : 1}
          accessibilityRole="button"
          accessibilityLabel={`Session date ${item.date}`}
          accessibilityState={{
            disabled: item?.status != 1,
            selected: selectedDate == item?.id,
          }}
          style={[
            styles.dateItem,
            selectedDate == item?.id && styles.selectedDateItem,
          ]}
          onPress={() => item?.status == 1 && handleDateSelect(item?.id)}>
          <Text
            style={[
              styles.dateText,
              selectedDate == item?.id && { color: '#FFFFFF' },
            ]}>
            {item?.day}
          </Text>
          <Text
            style={[
              styles.dayText,
              selectedDate == item?.id && { color: '#FFFFFF' },
            ]}>
            {item?.weekday}
          </Text>
        </TouchableOpacity>
      ),
    [selectedDate],
  );

  const handleRequestSession = async () => {

    // ✅ Validation before proceeding
    if (!selectedDate) {
      showToast('Please select a date.');
      return;
    }

    if (!selectedSlot) {
      showToast('Please select a time slot.');
      return;
    }

    try {
      setIsLoading(true); // Show loader

      // Prepare request data
      const requestData = {
        eventId,
        type: 2,
        speakerId,
        date: selectedDate,
        time: selectedTime,
        userComment: commentInput,
      };


      // Dispatch API call and wait for response
      const response = await dispatch(requestSessionCall(requestData)).unwrap();

      if (response) {
        showToast(response.message || 'Session request sent and pending approval.');

        // Wait for 2 seconds while showing loader
        await new Promise(resolve => setTimeout(resolve, 1500));
        // navigation.navigate('OneToOneSession', {
        //   isSessionRequested: true,
        //   speakerId: speakerId,
        // });
        navigation.goBack();
      }
    } catch (error) {
      showToast(typeof error === 'string' ? error : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false); // Hide loader
    }
  };


  const handleUpdateSession = async () => {

    if (!isRequestSession) return; // Only proceed if session request exists

    // ✅ Validation before proceeding
    if (!selectedDate) {
      showToast('Please select a date.');
      return;
    }

    if (!selectedSlot) {
      showToast('Please select a time slot.');
      return;
    }

    try {
      setIsLoading(true); // Show loader

      // Prepare update session request data
      const updateData = {
        id: sessionId, // Ensure you have this ID stored after requesting a session
        date: selectedDate,
        time: selectedTime,
        userComment: commentInput,
      };


      // Dispatch API call and wait for response
      const response = await dispatch(updateSessionCall(updateData)).unwrap();

      if (response) {
        showToast(response.message || 'Session request updated.');

        // Wait for 2 seconds while showing loader
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigation.navigate('SpeakerScreen', { speakerId: speakerId });
      }
    } catch (error) {
      showToast(typeof error === 'string' ? error : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={[styles.container]}>
      <LatestHeader
        statusBarColor="#FDFBFF"
        title="Request Session"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{ color: '#000000', fontSize: 16 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <Text style={styles.selectTicket}>Select a date</Text>
        <View style={styles.dateContainer}>
          <FlatList
            data={dateArray}
            horizontal
            initialNumToRender={14}
            keyExtractor={item => item.id}
            renderItem={renderDateItem}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {(morningSlots?.length > 0 || eveningSlots?.length > 0) && (
          <Text style={styles.slotHeading}>Select time slot</Text>
        )}
        {morningSlots?.length > 0 && (
          <>
            <View style={styles.slotSection}>
              <Text style={styles.slotHeader}>Morning Slots</Text>
              <FlatList
                data={morningSlots}
                keyExtractor={item => item.id?.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <SlotCard
                    item={item}
                    date={selectedDate}
                    accessibilityLabel={`Session slot ${item?.start_time}`}
                    time_zone={speakerSlots?.response?.time_zone}
                    time={item?.start_time}
                    isSelected={selectedSlot == item?.id}
                    onPress={() => {
                      setSelectedSlot(item?.id);
                      setSelectedTime(item?.start_time)
                    }}
                    selectedColor="#9977F2"
                  />
                )}
              />
            </View>
          </>
        )}

        {/* Evening Slots */}
        {eveningSlots?.length > 0 && (
          <View style={styles.slotSection}>
            <Text style={styles.slotHeader}>Evening Slots</Text>
            <FlatList
              data={eveningSlots}
              keyExtractor={item => item?.id?.toString()}
              numColumns={3}
              renderItem={({ item }) => (
                <SlotCard
                  item={item}
                  date={selectedDate}
                  accessibilityLabel={`Session slot ${item?.start_time}`}
                  time={item?.start_time}
                  isSelected={selectedSlot == item?.id}
                  time_zone={speakerSlots?.response?.time_zone}
                  onPress={() => {
                    setSelectedSlot(item?.id);
                    setSelectedTime(item?.start_time)
                  }}
                  selectedColor="#9977F2"
                />
              )}
            />
          </View>
        )}

        {(!morningSlots?.length && !eveningSlots?.length) && (
          <View style={styles.noSlotContainer}>
            <Text style={styles.noSlotText}>No slots available</Text>
          </View>
        )}


        <View style={styles.slotSection}>
          <Text style={[styles.selectTicket, { paddingLeft: 0 }]}>
            Your Comment
          </Text>
          {/* <View style={styles.commentContainer}> */}
          <TextInput
            accessibilityLabel="Session request comment"
            placeholder="Write something for the speaker"
            placeholderTextColor="#969696"
            style={[styles?.commentContainer, {
              fontSize: 16,
              // fontFamily: fontFamilies.SFProRoundedBlackMedium,
              color: '#131313',
              minHeight: 100, // Adjust height as needed
              textAlignVertical: 'top', // Needed for Android
              padding: 10,
              backgroundColor: '#F3F0F7',
              borderRadius: 8,
            },]}
            multiline={true}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
            value={commentInput}
            onChangeText={text => setCommentInput(text)}
          />

          {/* </View> */}
        </View>
      </ScrollView>
      <View style={{
        bottom: 10, position: 'absolute',
        alignItems: 'center',
        alignSelf: 'center'
      }}>
        <GradientButton
          containerStyle={styles.applyButton}
          onPress={
            isRequestSession ? handleUpdateSession : handleRequestSession
          }
          title={'Send request'}
          textStyle={styles.applyButtonText}
          colors={['#DB3171', '#FFCC33']}
          start={{ x: 0.9, y: 0 }}
          end={{ x: 0.1, y: 1 }}
        />
      </View>
    </ContainerComponent>
  );
};

export default RequestSessions;
