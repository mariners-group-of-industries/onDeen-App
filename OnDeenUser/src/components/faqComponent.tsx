import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SmileIcon from '../../src/assets/svg/smile.svg';
import SendIcon from '../../src/assets/svg/send.svg';
import Loader from '../components/loader';
import { RootState } from '../redux/store';
import {
  addQuestion,
  fetchQuestionAnswersByEventId,
} from '../redux/slices/questionAnswerSlice';
import styles from '../screens/FaqScreen/styles';
import LatestHeader from './LatestHeader';
import { fontScale, heightScale } from '../helpers/scale';
import Toast from './toastMessage';
import { useToastForPopup } from '../context/ToastContext';

const FaqComponent = ({ event_id }: { event_id: any }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { questionsAnswers, status, error } = useSelector(
    (state: RootState) => state.questionAnswerSlice
  );

  const [inputMessage, setInputMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (event_id) {
      dispatch(fetchQuestionAnswersByEventId(event_id));
    }
  }, [dispatch, event_id, isAdding]);

  const handleAddQuestion = async () => {
    if (!inputMessage.trim()) return;

    setIsAdding(true);
    try {
      const result = await dispatch(
        addQuestion({ eventId: event_id, question: inputMessage.trim() })
      ).unwrap();

      if (result.status) {
        setInputMessage('');
        dispatch(fetchQuestionAnswersByEventId(event_id));
      } else {
        setInputMessage('');
        showToast(result.message);
      }
    } catch (err) {
      showToast(err.message);
      setInputMessage('');
    } finally {
      setIsAdding(false);
    }
  };

  const showToast = useToastForPopup();


  const Message = ({
    userName,
    created_on,
    messageText,
    isOrganizer = false,
    imageUri,
    userImage,
    reply,
    organizerName,
    updated_on,
    isAnswerEmpty,
  }) => (
    <View style={styles.messageContainer}>
      <View>{userImage ? <Image style={styles.image} source={userImage} /> : null}</View>
      <View style={{ paddingRight: 30 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.userName}> You </Text>
          <Text style={styles.timestamp}>{created_on}</Text>
        </View>
        <Text style={styles.messageText}>{messageText}</Text>
        {isOrganizer && !isAnswerEmpty && (
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 14, paddingRight: 64 }}>
            <View>
              {imageUri && <Image style={styles.image} source={{ uri: imageUri }} />}
            </View>
            <View>
              <View style={styles.headerContainer}>
                <Text style={styles.userName}>{organizerName}</Text>
                <Text style={styles.timestamp}>{updated_on}</Text>
              </View>
              <View>{reply && <Text style={styles.replyMessageText}>{reply}</Text>}</View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[localStyles.container, { paddingBottom: insets.bottom }]}>
      <LatestHeader
        statusBarColor="#FDFBFF"
        titleStyle={{ color: '#000000', fontSize: fontScale(16) }}
        containerStyle={{
          paddingVertical: heightScale(10),
          paddingHorizontal: heightScale(5),
        }}
      />

      <View style={localStyles.contentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
        >
          <ScrollView
            style={localStyles.scrollView}
            contentContainerStyle={localStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {status === 'loading' && (
              <Loader
                isLoading={true}
                containerStyle={{ backgroundColor: '#FDFBFF' }}
                animationSource={require('../../src/assets/loader.json')}
              />
            )}
            {status === 'failed' && (
              <Text style={{ textAlign: 'center', color: 'red', marginTop: 20 }}>
                {error || 'Something went wrong!'}
              </Text>
            )}
            {status === 'succeeded' &&
              questionsAnswers
                .slice()
                .sort((a, b) => new Date(a.created_on) - new Date(b.created_on))
                .map((msg, index) => {
                  const isOrganizer = !!msg.organizer_id;
                  const userName = `${msg.user_first_name} ${msg.user_last_name}`;
                  const organizerName = `${msg.organizer_first_name} ${msg.organizer_last_name}`;
                  const userImage = { uri: msg.user_profile_image };
                  const created_on = moment(msg?.created_on).format('DD MMM YYYY, h:mm A');
                  const updated_on = moment(msg?.updated_on).format('DD MMM YYYY, h:mm A');
                  const answer = msg.answer;
                  const isAnswerEmpty = !answer || answer.trim() === '';
                  const question = msg.question;

                  return (
                    <Message
                      key={index}
                      userName={userName}
                      created_on={created_on}
                      messageText={question}
                      isOrganizer={isOrganizer}
                      imageUri={msg?.organizer_profile_image}
                      userImage={userImage}
                      reply={answer}
                      organizerName={organizerName}
                      updated_on={updated_on}
                      isAnswerEmpty={isAnswerEmpty}
                    />
                  );
                })}
            <Toast message={toastMessage} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Input Bar */}
        <View style={[localStyles.inputContainer, { marginBottom: insets.bottom > 0 ? 0 : 16 }]}>
          <SmileIcon />
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a question..."
            style={localStyles.input}
            placeholderTextColor={'#969696'}
            multiline
          />
          <TouchableOpacity onPress={handleAddQuestion} disabled={isAdding}>
            <SendIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 80, // Extra space to ensure content isn't hidden behind input
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingHorizontal: 20,
    backgroundColor: '#FDFBFF',
    marginHorizontal: 24,
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: '#131313',
    maxHeight: 120,
  },
});

export default FaqComponent;