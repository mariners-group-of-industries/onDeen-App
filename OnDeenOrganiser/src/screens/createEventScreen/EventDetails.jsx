import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GradientButton from '../../components/gradientButton';
import CustomeInput from '../../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import CustomeSelectMultipleFile from '../../components/CustomeSelectMultipleFile';
import RatioInput from '../../components/ratioInput';
import CustomeSelect from '../../components/CustomeSelect';
import CustomeDate from '../../components/CustomeDate';
import CustomeEventTag from '../../components/CustomeEventTag';
import Facilities from '../../components/Facilities';
import { fontFamilies } from '../../assets/themes/fonts';
import ScheduleSelector from '../../components/ScheduleSelector';

const EventDetails = ({ apitags, account, setAccount, setActivetab, category, subcategory, setCategoryId, journeylevel, languages, facilities, address, movetolocationpage }) => {

  const validationSchema = Yup.object({
    title: Yup.string().required('This is required'),
    images: Yup.array().notRequired(),
    category_id: Yup.string().required('This is required'),
    sub_category_id: Yup.string().required('This is required'),
    description: Yup.string().required('This is required'),
    location_type: Yup.string().required('This is required'),
    location: Yup.string().test('location-required', 'This is required', function (value) {
      return ![1, 3, '1', '3'].includes(this.parent.location_type) || address || (value && value.trim() != '');
    }),
    meet_link: Yup.string().test('meeting-link-required', 'This is required', function (value) {
      return ![2, 3, '2', '3'].includes(this.parent.location_type) || (value && value.trim() != '');
    }),
    language_id: Yup.string().required('This is required'),
    gender: Yup.string().required('This is required'),
    start_date: Yup.string().required('This is required'),
    end_date: Yup.string()
      .required('End date is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'End date must be in the format DD-MM-YYYY')
      .test(
        'end-date-after-start-date',
        'End date must be greater than or equal to start date',
        function (value) {
          const { start_date } = this.parent;

          if (value && start_date) {
            const startDate = new Date(start_date.split('-').reverse().join('-'));
            const endDate = new Date(value.split('-').reverse().join('-'));

            return endDate >= startDate;
          }
          return true;
        }
      )
      .test('one-off-same-day', 'A one-off listing must use the same start and end date', function (value) {
        return Number(this.parent.occusr_type || 1) !== 1 || !value || !this.parent.start_date || value === this.parent.start_date;
      }),
    start_time: Yup.string().required('This is required'),
    end_time: Yup.string().required('This is required'),
    price_type: Yup.string().required('This is required'),
    price: Yup.string().test('location-required', 'This is required', function (value) {
      return this.parent.price_type != '1' || (value && value.trim() != '');
    }),
    journey_level_id: Yup.string().required('This is required'),
    occusr_type: Yup.string().required('This is required'),
    occusr_weekday: Yup.string().test('weekly-days-required', 'Select at least one day', function (value) {
      return Number(this.parent.occusr_type || 1) !== 3 || Boolean(String(value || '').trim());
    }),
    tags: Yup.array().notRequired(),

  });



  const [showError, setShowError] = useState(false);


  const formik = useFormik({
    initialValues: account,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setAccount(values);
      setActivetab(2);
    },
  });

  useEffect(() => {
    if (formik.touched?.['tags'] && formik.errors?.['tags']) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched, 'location']);
  useEffect(() => {
    if (formik.touched?.['location'] && formik.errors?.['location']) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched, 'location']);

  useEffect(() => {
    if (formik.isSubmitting && formik.errors?.['tags']) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);

  useEffect(() => {
    if (address) {
      formik.setFieldValue('location', address);
    }
  }, [address]);

  useEffect(() => {
    if (Number(formik.values.occusr_type || 1) === 1 && formik.values.start_date && formik.values.end_date !== formik.values.start_date) {
      formik.setFieldValue('end_date', formik.values.start_date, false);
    }
  }, [formik.values.start_date, formik.values.occusr_type]);

  const tagsoptions = Array.isArray(apitags) && apitags.map(item => ({ label: item.title, value: Number(item.id) }));
  const categoryoptions = Array.isArray(category) && category.map(item => ({ label: item.title, value: Number(item.id) }));
  const subcategoryoptions = Array.isArray(subcategory) && subcategory.map(item => ({
    label: item.title,
    value: Number(item.id),
    topicId: item.topic_id,
    radarArea: item.radar_area,
    radarDescription: item.radar_description,
  }));
  const journeyleveloptions = Array.isArray(journeylevel) && journeylevel.map(item => ({ label: item.title, value: Number(item.id) }));
  const languageoptions = Array.isArray(languages) && languages.map(item => ({ label: item.title, value: Number(item.id) }));
  const facilitiesoptions = Array.isArray(facilities) && facilities.map(item => ({ label: item.title, value: Number(item.id) }));
  const selectedClassification = Array.isArray(subcategoryoptions)
    ? subcategoryoptions.find(item => item.value == formik.values.sub_category_id)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Event Details</Text>
            <CustomeInput
              formik={formik}
              name={'title'}
              label={'Event Title'}
              placeholder={'Enter Event Title'}
            />
            <CustomeSelectMultipleFile
              formik={formik}
              name={'images'}
              label={'Event Photos'}
              placeholder={'Enter Event Photos'}
            />

            <CustomeInput
              formik={formik}
              name={'description'}
              label={'Event Description'}
              placeholder={'Enter Event Description'}
              type={'description'}
              heights={120}
            />
          </View>
          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Listing classification</Text>
            <CustomeSelect
              formik={formik}
              name={'category_id'}
              label={'Listing type'}
              placeholder={'Select listing type'}
              options={categoryoptions}
              setCategoryId={setCategoryId}
              setAccount={setAccount}
              account={account}
            />
            {
              setCategoryId &&
              <CustomeSelect
                formik={formik}
                name={'sub_category_id'}
                label={'Topic or activity'}
                placeholder={'Select topic or activity'}
                options={subcategoryoptions}
              />
            }
            {selectedClassification?.radarArea ? (
              <View
                accessibilityLabel={`Derived Radar area ${selectedClassification.radarArea}`}
                style={styles.radarClassification}
              >
                <Text style={styles.radarClassificationLabel}>Radar contribution</Text>
                <Text style={styles.radarClassificationValue}>
                  {selectedClassification.radarArea} · derived automatically from this topic
                </Text>
                {selectedClassification.radarDescription ? (
                  <Text style={styles.radarClassificationDescription}>
                    {selectedClassification.radarDescription}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
          <View style={styles.cardbox}>
            <View>
              <Text style={[styles.label, { fontSize: 16 }]}>Delivery</Text>
              <View>
                <RatioInput
                  selectedValue={formik.values[`location_type`]}
                  onRadioChange={(value) => formik.setFieldValue(`location_type`, value)}
                  questionId={'1'}
                  labels={{ one: 'In person', two: 'Online', three: 'Hybrid' }}
                />
              </View>
              {[1, 3, '1', '3'].includes(formik.values[`location_type`]) && (
                <>
                  <View onPress={() => movetolocationpage()}>
                    <TouchableOpacity onPress={() => movetolocationpage()} style={styles.input}>
                      <Text style={{ color: address || formik.values.location ? '#000' : '#888', fontSize: 12 }}>
                        {address || formik.values.location || 'Enter Location'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {(formik.touched?.['location'] && showError && formik.errors?.['location']) && (
                    <Text style={[styles.errorMessage]}>
                      {formik.errors?.['location']}
                    </Text>
                  )}
                </>
              )}
              {[2, 3, '2', '3'].includes(formik.values[`location_type`]) && (
                <CustomeInput
                  formik={formik}
                  name={'meet_link'}
                  label={'Meeting link'}
                  placeholder={'Enter online meeting link'}
                />
              )}
            </View>
          </View>

          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Audience & language</Text>
            <Text style={styles.label}>Audience</Text>
            <RatioInput
              selectedValue={formik.values[`gender`]}
              onRadioChange={(value) => formik.setFieldValue(`gender`, value)}
              questionId={'audience'}
              labels={{ one: 'Brothers', two: 'Sisters', three: 'All' }}
            />
            <CustomeSelect
              formik={formik}
              name={'language_id'}
              label={'Language'}
              placeholder={'Select language'}
              options={languageoptions}
            />
          </View>

          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Event Date & time</Text>
            <ScheduleSelector formik={formik} />
            <Text style={styles.label}>Event Date</Text>
            <View style={styles.rowContainer}>
              <CustomeDate
                formik={formik}
                name={'start_date'}
                placeholder={'Start date'}
                customewidth={'50%'}
              />
              <CustomeDate
                formik={formik}
                name={'end_date'}
                placeholder={'End date'}
                customewidth={'50%'}
              />
            </View>
            <View>
              <Text style={styles.label}>Event Time</Text>
              <View style={styles.rowContainer}>
                <CustomeDate
                  formik={formik}
                  name={'start_time'}
                  placeholder={'Start time'}
                  customewidth={'50%'}
                  type={'time'}
                />
                <CustomeDate
                  formik={formik}
                  name={'end_time'}
                  placeholder={'End time'}
                  customewidth={'50%'}
                  type={'time'}
                />
              </View>
            </View>
          </View>
          <View style={styles.cardbox}>
            <View>
              <Text style={[styles.label, { fontSize: 16 }]}>Price</Text>
              <View>
                <RatioInput
                  selectedValue={formik.values[`price_type`]}
                  onRadioChange={(value) => formik.setFieldValue(`price_type`, value)}
                  questionId={'1'}
                  labels={{ one: 'Paid', two: 'Free' }}
                />
              </View>
              {formik.values[`price_type`] == '1' && (
                <>
                  <CustomeInput
                    formik={formik}
                    name={'price'}
                    label={''}
                    placeholder={'Enter Price'}
                    type={'number-pad'}
                  />
                </>
              )}
            </View>
          </View>

          {
            formik.values[`event_type`] == 3 && (
              <View style={styles.cardbox}>
                <View>
                  <Text style={[styles.label, { fontSize: 16 }]}>Facilities</Text>
                  <Facilities
                    selectedValue={formik.values[`facilities`]}
                    onRadioChange={(value) => formik.setFieldValue(`facilities`, value)}
                    questionId={'1'}
                    labels={{ one: 'Event', two: 'Course', three: 'Tour' }}
                    options={facilitiesoptions}
                  />
                </View>
              </View>
            )}

          <View style={styles.cardbox}>
            <Text style={[styles.label, { fontSize: 16 }]}>Journey level</Text>
            <CustomeSelect
              formik={formik}
              name={'journey_level_id'}
              label={'Select Journey level'}
              placeholder={'Select an option'}
              options={journeyleveloptions}
            />
          </View>
          {Number(formik.values?.event_type) === 2 && (
            <View style={styles.cardbox}>
              <Text style={[styles.label, { fontSize: 16 }]}>Course options</Text>
              <Text style={styles.optionLabel}>Course Breakdown</Text>
              <RatioInput
                selectedValue={formik.values.course_breakdown}
                onRadioChange={value => formik.setFieldValue('course_breakdown', value)}
                questionId="course_breakdown"
                labels={{ one: 'Enabled', two: 'Disabled' }}
              />
              <Text style={styles.optionHint}>
                Add identifiable classes so each session keeps its own schedule and attendance.
              </Text>
              <Text style={styles.optionLabel}>Swipe to Check-in</Text>
              <RatioInput
                selectedValue={formik.values.swipe_checkin}
                onRadioChange={value => formik.setFieldValue('swipe_checkin', value)}
                questionId="swipe_checkin"
                labels={{ one: 'Enabled', two: 'Disabled' }}
              />
              <Text style={styles.optionHint}>
                When enabled, booked users can check in to each eligible course session.
              </Text>
            </View>
          )}
          <View style={styles.cardbox}>
            {
              tagsoptions &&
              <>
                <Text style={[styles.label, { fontSize: 16 }]}>Event tags</Text>
                <CustomeEventTag
                  tagsoptions={tagsoptions}
                  selectedtagsoptions={formik.values[`tags`]}
                  onTagsChange={(tags) => formik.setFieldValue('tags', tags)}
                  formik={formik}
                  name={'tags'}
                  label={'Event tags'}
                  placeholder={'Custom tags'}
                />
                {(formik.touched?.['tags'] && showError && formik.errors?.['tags']) && (
                  <Text style={[styles.errorMessage]}>
                    {formik.errors?.['tags']}
                  </Text>
                )}
              </>
            }
          </View>
          <GradientButton
            onPress={formik.handleSubmit}
            title="Next"
            containerStyle={styles.customButtonContainer}
            textStyle={styles.customButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// StyleSheet
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
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  optionLabel: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(14),
    marginBottom: heightScale(4),
    marginTop: heightScale(8),
  },
  optionHint: {
    color: '#67616F',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(11),
    lineHeight: heightScale(16),
    marginBottom: heightScale(4),
  },
  radarClassification: {
    backgroundColor: '#F4EFFB',
    borderColor: '#DDD0F1',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  radarClassificationLabel: {
    color: '#4B2A8C',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: fontScale(12),
  },
  radarClassificationValue: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(13),
    marginTop: 4,
  },
  radarClassificationDescription: {
    color: '#66616B',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(11),
    lineHeight: 16,
    marginTop: 4,
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
    fontSize: 12,
    color: '#fff',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
    gap: 10,
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },

  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(24),
    backgroundColor: '#F3F0F7',
    borderRadius: widthScale(50),
    paddingRight: widthScale(50),
  },
  description: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
  title: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(14),
    color: '#161616',
  },
  cardbox: {
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    borderWidth:0.2,
    borderColor:'gray'
  },



});

export default EventDetails;
