import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { RootState } from '../../redux/store';
import { fontScale, heightScale } from '../../helpers/scale';
import {
  fetchQuestionAnswersByEventId,
  addQuestion,
} from '../../redux/slices/questionAnswerSlice';
import { useNavigation } from '@react-navigation/native';
import Toast from '../../components/toastMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import styles from './styles';
import SmileIcon from '../../../src/assets/svg/smile.svg';
import SendIcon from '../../../src/assets/svg/send.svg';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import { useToastForPopup } from '../../context/ToastContext';

const FaqScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux selectors
  const { questionsAnswers, status, error } = useSelector(
    (state: RootState) => state.questionAnswerSlice,
  );

  const { event_id } = route?.params || {};
  // Local state for input message
  const [inputMessage, setInputMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false); // To manage the API call status
  const [addError, setAddError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Fetch questions and answers when the screen loads
    if (event_id) {
      dispatch(fetchQuestionAnswersByEventId(event_id));
    }
  }, [dispatch, event_id, isAdding]);

  // Function to handle adding a new question
  const handleAddQuestion = async () => {
    if (!inputMessage.trim()) return;

    setIsAdding(true);
    setAddError(null);

    try {
      const result = await dispatch(
        addQuestion({ eventId: event_id, question: inputMessage.trim() }),
      ).unwrap();

      if (result.status) {
        setInputMessage('');
        setAddError(null);
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

  // Message component definition
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
      <View>
        {userImage ? <Image style={styles.image} source={userImage} /> : null}
      </View>
      <View style={{ paddingRight: 30 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.userName}> You </Text>
          <Text style={styles.timestamp}>{created_on}</Text>
        </View>
        <Text style={styles.messageText}>{messageText}</Text>
        {isOrganizer && !isAnswerEmpty && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              paddingTop: 14,
              paddingRight: 64,
            }}>
            {/* organizer image */}
            <View>
              {imageUri && (
                <Image style={styles.image} source={{ uri: imageUri }} />
              )}
            </View>
            <View>
              <View style={styles.headerContainer}>
                <Text style={styles.userName}>{organizerName}</Text>
                <Text style={styles.timestamp}>{updated_on}</Text>
              </View>
              <View>
                {/* organizer reply */}
                {reply && <Text style={styles.replyMessageText}>{reply}</Text>}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 20 },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* <CustomHeader
        statusBarColor="#FDFBFF"
        // secondRightImageSource={require('../../assets/images/dots-vertical.png')}
        containerStyle={{
          paddingVertical: heightScale(10),
          paddingHorizontal: heightScale(5),
          paddingTop: 0,
        }}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        // secondRightImageStyle={styles.containerImageEdit}
        title="Asked Questions"
        titleStyle={styles.headerTitle}
      /> */}
      <LatestHeader
        statusBarColor="#FDFBFF"
        title="Asked Questions"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        containerStyle={{
          paddingVertical: heightScale(10),
          paddingHorizontal: heightScale(5),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: heightScale(100) }}>
        {/* Loader and Error Handling */}
        {status === 'loading' && (
          <Loader
            isLoading={true}
            containerStyle={{ backgroundColor: '#FDFBFF' }}
            animationSource={require('../../../src/assets/loader.json')}
          />
        )}
        {status === 'failed' && (
          <Text style={{ textAlign: 'center', color: 'red', marginTop: 20 }}>
            {error || 'Something went wrong!'}
          </Text>
        )}

        {/* Render messages dynamically */}
        {/* Render messages dynamically */}
        {status === 'succeeded' &&
          questionsAnswers
            .slice() // Prevents mutation of Redux state
            .sort((a, b) => new Date(a.created_on) - new Date(b.created_on)) // Sort by created_on ascending
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

      {/* Message input box */}
      <View
        style={{
          borderWidth: 1,
          height: 52,
          borderRadius: 28,
          marginBottom: 15,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          borderColor: '#DDDDDD',
          flexDirection: 'row',
          paddingHorizontal: 20,
        }}>
        {/* Emoji Icon */}
        <SmileIcon />
        {/* Text Input */}
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a question..."
          style={{
            flex: 1,
            marginLeft: 10,
            color: '#131313', // Ensure typed text is visible
          }}
          placeholderTextColor={'#969696'}
          multiline
        />

        {/* Send Button */}
        <TouchableOpacity onPress={handleAddQuestion}>
          <SendIcon />
        </TouchableOpacity>
      </View>

      {/* Error message for adding a question */}
      {/* {addError && (
        console.log('addError >>',addError),
        
        <Text style={{textAlign: 'center', color: 'red', marginBottom: 10}}>
          {addError}
        </Text>
      )} */}
    </KeyboardAvoidingView>
  );
};

export default FaqScreen;
