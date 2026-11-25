import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import GradientButton from '../../components/gradientButton';
import * as Yup from 'yup';
import CustomeInput from '../../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import CustomeEventCurriculumAddUpdate from '../../components/CustomeEventCurriculumAddUpdate';
import CustomeEventTourItineraryAddUpdate from '../../components/CustomeEventTourItineraryAddUpdate';
import AddDropdownSpeakers from '../../components/AddDropdownSpeakers';
import { calculateDays } from '../../common/datetimeformate';
import { twentyarray } from '../../common/options';
import PositionDropdown from '../../components/PositionDropdown';
import { fontFamilies } from '../../assets/themes/fonts';
import TouchableLabel from '../../components/customLabels';

const Information = ({ account, setAccount, setActivetab, eventtype, speakers }) => {
  const [totalday, setTotalday] = useState(null);

  const validationSchema = Yup.object({
    rule: Yup.string().notRequired(),
    eligibility: Yup.string().notRequired(),
    cancellation_policy: Yup.string().notRequired(),
    itinerary: Yup.array().notRequired(),
    curriculum: Yup.array().notRequired(),
    total_no_class: Yup.string().notRequired(),
    call_per_week: Yup.string().notRequired(),
    speakers: Yup.array().notRequired(),
    terms_condition: Yup.string().notRequired(),

  });


  const [showError, setShowError] = useState(false);

  const formik = useFormik({
    initialValues: account,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      registerapi(values)
    },
  });

  const registerapi = (values) => {
    const data = {
      ...account,
      ...values,
      speakers: values?.speakers || [],
      itinerary: values?.itinerary,
      curriculum: values?.curriculum,
      rule: values?.rule || 'Please follow the event guidance shared by the organiser.',
      eligibility: values?.eligibility || 'Open to attendees who can participate respectfully.',
      cancellation_policy: values?.cancellation_policy || 'Please contact the organiser if you can no longer attend.',
      terms_condition: values?.terms_condition || 'Attendees should follow organiser instructions and venue rules.',
    }
    setAccount(data);
    setActivetab(3)
  }

  useEffect(() => {
    if (formik.touched || formik.errors) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched, 'documents']);

  useEffect(() => {
    if (formik.isSubmitting) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);

  const speakersoptions = Array.isArray(speakers) && speakers.map(item => ({ first_name: item.first_name, last_name: item.last_name, profile_image: item.profile_image, value: Number(item.id), id: Number(item.id),  user_id: Number(item.id),  image: item.profile_image }));


  useEffect(() => {
    if (account?.start_date && account?.end_date) {
      const days = calculateDays(account?.start_date, account?.end_date);
      setTotalday(days)
    }
  }, [account?.start_date, account?.end_date]);

  ;


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>

          {formik.values[`event_type`] == '2' && (
            <>
              <View style={styles.cardbox}>
                <CustomeEventTourItineraryAddUpdate
                  setValues={formik.setFieldValue}
                  value={formik?.values?.itinerary}
                  account={account}
                  setAccount={setAccount}
                  setActivetab={setActivetab}
                />
                {(formik.touched?.['itinerary'] && showError && formik.errors?.['itinerary']) && (
                  <Text style={[styles.errorMessage]}>
                    {formik.errors?.['itinerary']}
                  </Text>
                )}
              </View>
            </>
          )}
          {formik.values[`event_type`] == '2' && (
            <>
              <View style={styles.cardbox}>
                <Text style={[styles.label, { fontSize: 16 }]}>Event Curriculum</Text>
                <PositionDropdown
                  formik={formik}
                  name={'total_no_class'}
                  label={'Total Number of Classes'}
                  placeholder={'Enter no.'}
                  options={twentyarray}
                />

                <PositionDropdown
                  formik={formik}
                  name={'call_per_week'}
                  label={'Classes per week'}
                  placeholder={'Enter no.'}
                  options={twentyarray}
                />
                <CustomeEventCurriculumAddUpdate
                  setValues={formik.setFieldValue}
                  value={formik?.values?.curriculum}
                  account={account}
                  setAccount={setAccount}
                  setActivetab={setActivetab}
                />
                {(formik.touched?.['curriculum'] && showError && formik.errors?.['curriculum']) && (
                  <Text style={[styles.errorMessage]}>
                    {formik.errors?.['curriculum']}
                  </Text>
                )}
              </View>
            </>)}
          <View style={styles.cardbox}>

            <AddDropdownSpeakers
              setValues={formik.setFieldValue}
              value={formik?.values?.speakers}
              account={account}
              setAccount={setAccount}
              setActivetab={setActivetab}
              speakersoptions={speakersoptions}
            />
            {(formik.touched?.['speakers'] && showError && formik.errors?.['speakers']) && (
              <Text style={[styles.errorMessage]}>
                {formik.errors?.['speakers']}
              </Text>
            )}
          </View>
          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Rules and Eligibility</Text>
            <CustomeInput
              formik={formik}
              name={'eligibility'}
              label={'Eligibility'}
              placeholder={'Write here'}
              type={'description'}
              heights={96}
            />
            <CustomeInput
              formik={formik}
              name={'rule'}
              label={'Rules'}
              placeholder={'Write here'}
              type={'description'}
              heights={96}
            />
            <CustomeInput
              formik={formik}
              name={'cancellation_policy'}
              label={'Cancellation Policy'}
              placeholder={'Write here'}
              type={'description'}
              heights={96}
            />
            <CustomeInput
              formik={formik}
              name={'terms_condition'}
              label={'Terms & Condition'}
              placeholder={'Write here'}
              type={'description'}
              heights={96}
            />
          </View>
          
          <View style={styles.buttonsContainer}>
            <View style={styles.infoBtnContainer}>
              <TouchableLabel
                label={'Back'}
                onPress={()=>{setActivetab(1)}}
                containerStyle={styles.viewallContainer}
                labelStyle={styles.viewallLabel}
              />
            </View>
            <GradientButton
              onPress={formik.handleSubmit}
              title="Next"
              containerStyle={styles.customButtonContainer}
              textStyle={styles.customButtonText}
              gradientstyles={styles?.gradientstyles}
              colors={['#DB3171', '#FFCC33']}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 1, y: 0.1 }}
            />
          </View>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: fontScale(16),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  textInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#161616',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  customButtonContainer: {
    marginTop: 20,
    width: '100%',
    marginBottom: heightScale(32),
  },
  customButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
  cardbox: {
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    borderWidth:0.2,
    borderColor:'gray'
  },

  gradientBorder: {
    borderRadius: widthScale(90),
    padding: widthScale(1.3),
  },
  infoBtnContainer: {
    width: '50%',
  },
  gradientBorder: {
    borderRadius: widthScale(90),
    padding: widthScale(1.3),
  },
  viewallContainer: {
    height: heightScale(55),
    width: '98%',
    borderRadius: widthScale(90),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FDFBFF',
    borderWidth: 1,
    borderColor: "#422199"
  },
  viewallLabel: {
    color: '#161616',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  customButtonContainer: {
    width: '50%',
    marginBottom: heightScale(0),
    backgroundColor: '#fff',

  },
  customButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  gradientstyles: {
    paddingVertical: heightScale(15),
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 26,
  },
});

export default Information;
