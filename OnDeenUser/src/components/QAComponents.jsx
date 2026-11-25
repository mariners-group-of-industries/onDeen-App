import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
  Switch
} from 'react-native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SendIcon from '../../src/assets/svg/send.svg';
import { fetchQuestionAnswersByEventId } from '../redux/slices/questionAnswerSlice';
import styles from '../screens/FaqScreen/styles';
import LatestHeader from './LatestHeader';
import { fontScale, heightScale } from '../helpers/scale';
import Toast from './toastMessage';
import { useToastForPopup } from '../context/ToastContext';
import { addEventQuestion, questionAnswersAPI } from '../redux/callapis/CommonService';
import ImageWithFallback from './ImageWithFallback';
import { formatDateMonthYear, formatTimeOnly } from '../timezone/maintimezone';
import { fontFamilies } from '../assets/fonts/fonts';

const QAComponents = ({ event_id }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [qalist, setQAlist] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(event?.endCoordinates?.height || 0);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const showToast = useToastForPopup();

  useEffect(() => {
    if (event_id) {
      fetchQAData();
    }
  }, [event_id, isAdding]);

  const fetchQAData = async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      const res = await questionAnswersAPI(event_id);
      setQAlist(res?.response || []);
    } catch (err) {
      setQAlist([]);
      showToast('Failed to load questions');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (event_id) {
      dispatch(fetchQuestionAnswersByEventId(event_id));
    }
  }, [dispatch, event_id, isAdding]);

  const closedKeyboardBottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? heightScale(34) : heightScale(8)
  );
  const inputBottomPadding = isKeyboardVisible
    ? heightScale(16)
    : closedKeyboardBottomInset + heightScale(12);
  const listBottomPadding = inputBottomPadding + heightScale(92);

  const handleAddQuestion = async () => {
    if (!inputMessage.trim()) return;

    setIsAdding(true);
    try {
      const data = {
        data: {
          event_id: event_id,
          question: inputMessage.trim(),
          is_anonymous: isAnonymous,
        },
      };
      const resultAction = await addEventQuestion(data);
      if (resultAction?.status) {
        showToast(resultAction?.message || resultAction?.response?.message || 'Added Successfully');
        setInputMessage('');
        setIsAnonymous(false);
        Keyboard.dismiss();
      } else {
        showToast(resultAction?.message || resultAction?.response?.message || 'Failed');
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const Message = ({ items }) => (
    <View style={styles.messageContainer}>
      {items.isAnonymous ? (
        <View accessibilityLabel="Anonymous user" style={localStyles.anonymousAvatar}>
          <Text style={localStyles.anonymousAvatarText}>?</Text>
        </View>
      ) : (
        <ImageWithFallback
          style={styles.image}
          imageurl={items?.user_profile_image}
        />
      )}
      <View style={{ paddingRight: 30 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.userName}>{items.userName}</Text>
          <Text style={styles.timestamp}>{items.created_on}</Text>
        </View>
        <Text style={styles.messageText}>{items.messageText}</Text>
        {items?.isOrganizer && !items?.isAnswerEmpty && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              paddingTop: 14,
              paddingRight: 64,
            }}
          >
            <View>
              <ImageWithFallback
                style={styles.image}
                imageurl={items?.organizer_profile_image}
              />
            </View>
            <View>
              <View style={styles.headerContainer}>
                <Text style={styles.userName}>{items.organizerName}</Text>
                <Text style={styles.timestamp}>{items.updated_on}</Text>
              </View>
              <View>
                {items.reply && (
                  <Text style={styles.replyMessageText}>{items.reply}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const items = {
      userName: item.is_anonymous
        ? 'Anonymous'
        : `${item.user_first_name || ''} ${item.user_last_name || ''}`.trim(),
      created_on: `${formatDateMonthYear(item?.created_on)} ${formatTimeOnly(item?.created_on, item?.time_zone, 'time-only')}`,
      messageText: item.question,
      isOrganizer: !!item.organizer_id,
      imageUri: item?.organizer_profile_image,
      user_profile_image: item.user_profile_image,
      reply: item.answer,
      organizerName: `${item.organizer_first_name} ${item.organizer_last_name}`,
      updated_on: `${formatDateMonthYear(item?.updated_on)} ${formatTimeOnly(item?.updated_on, item?.time_zone, 'time-only')}`,
      isAnswerEmpty: !item.answer || item.answer.trim() === '',
      isAnonymous: !!item.is_anonymous,
    };
    return <Message items={items} />;
  };

  if (isLoading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#422199" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={localStyles.container}
      keyboardVerticalOffset={Platform.select({ android: 25 })}
    >
      <LatestHeader
        statusBarColor="#FDFBFF"
        titleStyle={{ color: '#000000', fontSize: fontScale(16) }}
        containerStyle={{
          paddingVertical: heightScale(10),
          paddingHorizontal: heightScale(5),
        }}
      />

      <View style={localStyles.contentWrapper}>
        <FlatList
          data={qalist}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={[
            localStyles.scrollContent,
            { paddingBottom: listBottomPadding },
            qalist.length === 0 && localStyles.emptyScrollContent
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !isLoading && (
              <View style={localStyles.emptyContainer}>
                <Text style={localStyles.emptyMessage}>No questions yet</Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchQAData}
            />
          }
        />
        <View style={[
          localStyles.inputSection,
          {
            bottom: Platform.OS === 'ios' && isKeyboardVisible ? keyboardHeight : 0,
            paddingBottom: inputBottomPadding,
          }
        ]}>
          <View style={localStyles.anonymousRow}>
            <Text style={localStyles.anonymousLabel}>Hide my name</Text>
            <Switch
              accessibilityLabel="Hide my name"
              accessibilityRole="switch"
              accessibilityState={{ checked: isAnonymous }}
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: '#D9D3E3', true: '#B9A5E8' }}
              thumbColor={isAnonymous ? '#422199' : '#FFFFFF'}
            />
          </View>
          <View style={localStyles.inputContainer}>
            <TextInput
              accessibilityLabel="Question text"
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a question..."
              style={localStyles.input}
              placeholderTextColor={'#969696'}
              multiline
            />
            <TouchableOpacity
              accessibilityLabel="Send question"
              accessibilityRole="button"
              onPress={handleAddQuestion}
              disabled={isAdding || !inputMessage.trim()}
              style={localStyles.sendButton}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#422199" />
              ) : (
                <SendIcon />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyScrollContent: {
    justifyContent: 'flex-start',
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    marginTop: 46,
    minHeight: 122,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#17101F',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 14,
  },
  emptySubtitle: {
    color: '#545454',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyRow: {
    alignItems: 'center',
    borderColor: '#E2E2E2',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  emptyMessage: {
    color: '#545454',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyArrow: {
    alignItems: 'center',
    borderColor: '#17101F',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: '#FDFBFF',
    // borderTopWidth: 1,
    // borderColor: '#DDDDDD',
  },
  anonymousRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 4,
  },
  anonymousLabel: {
    color: '#3A3A3A',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(13),
  },
  anonymousAvatar: {
    alignItems: 'center',
    backgroundColor: '#E9E2F7',
    borderColor: '#D5C8EE',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  anonymousAvatarText: {
    color: '#422199',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingHorizontal: 20,
    backgroundColor: '#FDFBFF',
    minHeight: 46,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: '#131313',
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    padding: 8,
  },
});

export default QAComponents;
