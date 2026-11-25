import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';
import GradientButton from '../components/gradientButton';
import TouchableLabel from '../components/customLabels';
import { useSelector } from 'react-redux';
import Loader from '../components/loader';
import { addRatingAPI } from '../redux/callapis/CommonService';
import { useToastForPopup } from '../context/ToastContext';

const RatingModal = ({
  isVisible,
  onClose,
  eventId,
}) => {
  const [review, setReview] = useState('');
  const [title, setTitle] = useState('');
  const [ratingValue, setRatingValue] = useState(2);
  const showToast = useToastForPopup();

  const { addReviewStatus } = useSelector(
    state => state.ratingSlice,
  );

  const handleSubmit = async () => {
    if (!review.trim() && !title.trim()) {
      showToast('Please enter a review.');
      return;
    }

    const payload = {
      event_id: eventId,
      rating_value: ratingValue,
      review: review,
      title: title
    }
    const resultAction = await addRatingAPI(payload);
    if (resultAction?.status) {
      showToast(resultAction?.response?.message || 'Added Successfully');
      setReview('');
      setTitle('');
      onClose();
    } else {
      showToast(resultAction?.response?.message || 'Failed');
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setReview('');
      setTitle('');
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.65}
      avoidKeyboard={true}
      statusBarTranslucent
      style={{ margin: 0, justifyContent: 'flex-end' }}>
      <KeyboardAvoidingView
        behavior={'padding'}
        style={styles.avoidingView}
        keyboardVerticalOffset={Platform.OS == 'ios' ? 30 : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.reviewHeading}>Leave a review</Text>

          <Text style={styles.organizerHeading}>Review Title</Text>

          <TextInput
            style={styles.titleInput}
            placeholder="What's most important to know"
            placeholderTextColor="#969696"
            multiline
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.organizerHeading}>Write a Review</Text>

          <TextInput
            style={styles.input}
            placeholder="Write you comment here"
            placeholderTextColor="#969696"
            multiline
            value={review}
            onChangeText={setReview}
          />

          <View style={styles.buttonContainer}>
            <TouchableLabel
              containerStyle={styles.cancelButton}
              label="CANCEL"
              onPress={onClose}
              labelStyle={styles.cancelButtonText}
            />
            <View>
              <GradientButton
                containerStyle={styles.applyButton}
                onPress={handleSubmit}
                title={addReviewStatus == 'loading' ? '' : 'SUBMIT'}
                textStyle={styles.applyButtonText}
                colors={['#DB3171', '#FFCC33']}
                start={{ x: 0.9, y: 0 }}
                end={{ x: 0.1, y: 1 }}>
                {addReviewStatus == 'loading' && (
                  <Loader
                    isLoading={true}
                    containerStyle={{ backgroundColor: '#FDFBFF' }}
                    animationSource={require('../assets/loader.json')}
                  />
                )}
              </GradientButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingBottom: 12,
    marginLeft: 12,
  },
  cancelButton: {
    borderRadius: 90,
    paddingRight: 12,
    paddingLeft: 16,
    paddingVertical: 0,
    height: 49,
    width: 148,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FEFDFF',
  },
  cancelButtonText: {
    color: '#222222',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  applyButton: {
    borderRadius: 90,
    paddingRight: 12,
    paddingLeft: 16,
    paddingVertical: 0,
    height: 49,
    width: 182,
    marginBottom: 42,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  input: {
    height: 150,
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    padding: 10,
    fontSize: 14,
    color: '#161616',
    marginHorizontal: 24,
    padding: 20,
    textAlignVertical: 'top', // 👈 This makes text start from top
  },

  titleInput: {
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    fontSize: 14,
    color: '#161616',
    marginHorizontal: 24,
    padding: 20,
    paddingVertical: 10,
  },
  organizerHeading: {
    fontSize: 12,
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingTop: 14,
    paddingLeft: 24,
  },
  reviewHeading: {
    fontSize: 24,
    textAlign: 'center',
    color: '#131313',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingTop: 32,
  },
  avoidingView: {
    backgroundColor: '#FDFBFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 14,
  },
  scrollContent: {
    // flexGrow: 1,
    // justifyContent: 'flex-start',
  },
});

export default RatingModal;
