import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  RefreshControl,
} from 'react-native';
import { fontScale, heightScale } from '../../helpers/scale';
import CustomHeader from '../../components/customHeader';
import styles from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Facesmile from '../../assets/svg/facesmile.svg';
import Send from '../../assets/svg/send.svg';
import { eventquestionListing, updateAnswers } from '../../redux/slices/eventquestionSlice';
import { useDispatch, useSelector } from 'react-redux';
import NotFound from '../../common/NotFound';
import { formatDatewithtime } from '../../common/datetimeformate';

const FaqScreen = ({ route }) => {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [questionid, setQuestionid] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      setKeyboardHeight(event?.endCoordinates?.height || 0);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const hitapitogetdatafilter = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(eventquestionListing(id));
    setRefreshing(false);
  }, [dispatch, id]);

  useEffect(() => {
    if (questionid === 0) {
      hitapitogetdatafilter();
    }
  }, [hitapitogetdatafilter, questionid]);

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, [hitapitogetdatafilter])
  );

  const { eventquestion } = useSelector(state => state.eventquestion);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const mappedMessages =
      (Array.isArray(eventquestion) &&
        eventquestion.map(item => ({
          userName: item.is_anonymous
            ? 'Anonymous'
            : `${item.user_first_name || ''} ${item.user_last_name || ''}`.trim(),
          updated_on: item?.updated_on,
          created_on: item?.created_on,
          userImage: item.is_anonymous || !item.user_profile_image
            ? null
            : { uri: item.user_profile_image },
          messageText: item.question,
          isOrganizer: true,
          reply: item.answer,
          ownerImage: item.organizer_profile_image
            ? { uri: item.organizer_profile_image }
            : null,
          id: item.id,
          organizerName: `${item.organizer_first_name} ${item.organizer_last_name}`,
          eventName: item.event_name,
          isAnonymous: !!item.is_anonymous,
        }))) ||
      [];
    setMessages(mappedMessages);
  }, [eventquestion]);

  const handleSendMessage = () => {
    updateanswersforapianswer();
  };

  const updateanswersforapianswer = async () => {
    const answer = inputMessage.trim();
    if (!answer || isSubmitting) {
      return;
    }
    const data = {
      'id': questionid,
      'answer': answer,
      'event_id': id,
    };
    setIsSubmitting(true);
    try {
      await dispatch(updateAnswers(data)).unwrap();
      await hitapitogetdatafilter();
      setQuestionid(0);
      setInputMessage('');
    } catch (_error) {
      // Keep the reply open so the organiser can retry without retyping it.
    } finally {
      setIsSubmitting(false);
    }
  };

  const Message = ({
    userName,
    updated_on,
    created_on,
    messageText,
    isOrganizer = true,
    userImage,
    ownerImage,
    reply,
    id,
    organizerName,
    eventName,
    isAnonymous,
  }) => (
    <View style={styles.messageContainer}>
      <View>
        {isAnonymous ? (
          <View accessibilityLabel="Anonymous user" style={styles.anonymousAvatar}>
            <Text style={styles.anonymousAvatarText}>?</Text>
          </View>
        ) : (
          userImage && <Image style={styles.image} source={userImage} />
        )}
      </View>
      <View style={{ paddingRight: 30 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.timestamp}>{formatDatewithtime(created_on)}</Text>
        </View>
        {!!eventName && <Text style={styles.eventName}>{eventName}</Text>}
        <Text style={styles.messageText}>{messageText}</Text>
        <TouchableOpacity
          accessibilityLabel={`Reply to question ${id}`}
          accessibilityRole="button"
          style={[{ width: 80 }]}
          onPress={() => setQuestionid(id)}>
          <Text style={[styles.messageText, { color: '#DF416B', fontSize: 12 }]}>{id === questionid ? 'Replying...' : 'Reply'}</Text>
        </TouchableOpacity>
        {reply?.length > 1 && (
          <View style={[styles.messageContainer2]}>
            <View>
              {ownerImage && <Image style={styles.image} source={ownerImage} />}
            </View>
            <View style={{ paddingRight: 30 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.userName}>{organizerName}</Text>
                <Text style={styles.timestamp}>{formatDatewithtime(updated_on)}</Text>
              </View>
              <Text style={styles.messageText}>{reply}</Text>
            </View>
          </View>)}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom, paddingTop: insets.top }]}
      behavior={Platform.OS === 'android' ? 'height' : undefined}>
      <CustomHeader
        statusBarColor="#FFFF"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        secondRightImageStyle={styles.containerImageEdit}
        title="Asked Questions"
        titleStyle={{ color: '#000000', fontSize: fontScale(16) }}
        showforeventDetails={true}
        secondRightImageSource={'2'}
        profiledots={true}
        containerStyle={{
          paddingVertical: heightScale(5),
          justifyContent: 'space-between',
        }}
        onClickAskedQuestion={() => { }}
        editEvent={() => { }}
        cencelEvent={() => { }}
        endEvent={() => { }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: heightScale(100) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={hitapitogetdatafilter} />
        }>
        {messages.length === 0 ? (
          <View  >
            <NotFound title={'No Question Answered Yet'} />
            <Text style={{ fontSize: fontScale(16), textAlign: 'center' }}>

            </Text>
          </View>
        ) : (
          messages.map((msg, index) => <Message key={index} {...msg} />)
        )}
      </ScrollView>

      {questionid !== 0 && (
        <View
          style={{
            borderWidth: 1,
            height: 52,
            borderRadius: 28,
            marginBottom: Platform.OS === 'ios' && keyboardHeight > 0
              ? keyboardHeight
              : 15,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 20,
            borderColor: '#DDDDDD',
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}>
          <Facesmile />
          <TextInput
            accessibilityLabel="Answer text"
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a message..."
            style={{
              flex: 1,
              marginLeft: 10,
              color: '#000',
            }}
            placeholderTextColor={'#969696'}
            multiline
          />
          <TouchableOpacity
            accessibilityLabel="Send answer"
            accessibilityRole="button"
            disabled={isSubmitting || !inputMessage.trim()}
            onPress={handleSendMessage}>
            <Send />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default FaqScreen;
