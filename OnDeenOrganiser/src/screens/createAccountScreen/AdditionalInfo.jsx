import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import GradientButton from '../../components/gradientButton';
import RatioInput from '../../components/ratioInput';
import { fontScale, heightScale } from '../../helpers/scale';
import CustomeInput from '../../components/CustomeInput';
import { fontColor, fontFamilies } from '../../assets/themes/fonts';
import { useDispatch } from 'react-redux';
import { createAccount, updateAccount } from '../../redux/slices/createAccountSlice';
import { useNavigation } from '@react-navigation/native';
import { setLoginToken } from '../../redux/slices/loginSlice';

const validate = (values, questions) => {
  const errors = {};
  questions.forEach((question) => {
    if (values[`selectedValue_${question.id}`] == '1' && !values[`answer_${question.id}`]?.trim()) {
      errors[`answer_${question.id}`] = 'This field is required';
    }
  });
  return errors;
};

const AdditionalInfo = ({ account, registerquestion, address, latitude, longitude, update }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation();

  const questions = Array.isArray(registerquestion) && registerquestion || []
  const initialAdditionalValues = questions.reduce((acc, question) => {
    acc[`selectedValue_${question.id}`] = 1;
    acc[`answer_${question.id}`] = '';
    return acc;
  }, {});

  const formik = useFormik({
    initialValues: initialAdditionalValues,
    enableReinitialize: true,
    validate: (values) => validate(values, questions),
    onSubmit: (values) => {
      const answers = questions.map((question) => ({
        question_id: question.id,
        option_value: values[`selectedValue_${question.id}`] == 1,
        answer: values[`selectedValue_${question.id}`] == 1 ? values[`answer_${question.id}`] : '',
      }));
      registerapi(answers)
    },
  });
  console.log(account?.foundation_date, 'account?.foundation_date');

  const formatDate = (date) => {
    const parts = date.split('-');
    if (parts.length !== 3) {
      throw new Error("Invalid date format");
    }
    const day = parts[0];
    const month = parts[1] - 1;
    const year = parts[2];

    const d = new Date(year, month, day);
    if (isNaN(d)) {
      throw new Error("Invalid date");
    }

    const formattedYear = d.getFullYear();
    const formattedMonth = String(d.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(d.getDate()).padStart(2, '0');
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  };




  const registerapi = async (answers) => {
    const nextLocation = (address || account?.location || '').trim();
    if (!nextLocation) {
      alert('Please add a location before continuing.');
      return;
    }

    const data = {
      ...account,
      additional_information: answers,
      charity_registered: account.charity_registered == 2 ? 0 : 1,
      foundation_date: formatDate(account?.foundation_date),
      location: nextLocation,
      latitude: latitude || account.latitude,
      longitude: longitude || account.longitude,

    };

    try {
      if (update) {
        const resultAction = await dispatch(updateAccount(data));

        if (resultAction?.payload?.status) {
          navigation.goBack()
        } else {
          console.log(JSON.stringify(data), 'PAYLOAD');
        }
      } else {
        const resultAction = await dispatch(createAccount(data));
        if (createAccount.fulfilled.match(resultAction)) {
          const response = resultAction.payload?.response || {};
          if (resultAction.payload.status && Number(response.user_status) === 1 && response.application_status === 'APPROVED') {
            dispatch(
              setLoginToken({
                loginToken: response.access_token,
                isLogin: resultAction?.payload?.status,
                roleType: 3,
              })
            );
          } else if (resultAction.payload.status) {
            navigation.navigate('ApplicationStatus', {
              access_token: response.access_token,
              application_status: response.application_status || 'UNDER_REVIEW',
              review_note: response.review_note,
            });
          } else {
            alert(resultAction.payload.response.message);
          }
        } else {
          ;
        }
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorerrorerror');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          {questions.map((question) => (
            <View key={question.id}>
              <Text style={styles.title}>{question.question}</Text>
              <RatioInput
                selectedValue={formik.values[`selectedValue_${question.id}`]}
                onRadioChange={(value) => formik.setFieldValue(`selectedValue_${question.id}`, value)}
                questionId={question.id}
                labels={{ one: 'Yes', two: 'No' }}
              />
              {formik.values[`selectedValue_${question.id}`] == 1 && (
                <>
                  <CustomeInput
                    formik={formik}
                    name={`answer_${question.id}`}
                    label={''}
                    type="description"
                    heights={heightScale(120)}
                    placeholder={'Enter your answer'}
                  />
                </>
              )}
            </View>
          ))}

          <GradientButton
            onPress={formik.handleSubmit}
            title="Save & Continue"
            containerStyle={styles.customButtonContainer}
            textStyle={styles.customButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formikContainer: {
  },
  questionContainer: {
    marginBottom: 20,
  },
  title: {
    marginTop: heightScale(6),
    marginBottom: heightScale(0),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  radioContainer: {
    marginBottom: 12,
  },
  inputBox: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: fontColor.GRAISHVIOLET,
    padding: 10,
    fontSize: fontScale(12),
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: fontScale(10),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  customButtonContainer: {
    marginTop: 20,
  },
  customButtonText: {
    fontSize: fontScale(14),
  },
});

export default AdditionalInfo;
