import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import GradientButton from '../../components/gradientButton';
import * as Yup from 'yup';
import RatioInput from '../../components/ratioInput';
import CustomeInput from '../../components/CustomeInput';
import { fontScale, heightScale } from '../../helpers/scale';
import CustomeSelect from '../../components/CustomeSelect';
import CustomeDate from '../../components/CustomeDate';
import CustomeSelectCategorySubcategory from '../../components/CustomeSelectCategorySubcategory';
import { fontFamilies } from '../../assets/themes/fonts';

const AboutBioValidationSchema = Yup.object({
  foundation_date: Yup.string().required('Foundation date is required'),
  sect_rep: Yup.string().required('Sect representation is required'),
  school_thought: Yup.string().required('School thought is required'),
  charity_registered: Yup.string().required('School thought is required'),
  charity_no: Yup.string().test('charity-no-required', 'Charity number is required when registered as a charity', function (value) {
    const { charity_registered } = this.parent;
    return charity_registered != '1' || (value && value.trim() != '');
  }).matches(/^[A-Za-z0-9-]*$/, 'Charity number should only contain letters, numbers, and dashes'), // Allow empty when not required
  organizer_categories: Yup.array()
    .of(
      Yup.object().shape({
        category_id: Yup.number().required('Category ID is required'),
      })
    )
    .required('At least one organizer category is required')
    .min(1, 'At least one organizer category is required'),
});

const AboutBio = ({ account, setAccount, setActivetab, category, schooltype, sectlist, subcategory, setCategoryId }) => {

  const formik = useFormik({
    initialValues: account,
    validationSchema: AboutBioValidationSchema,
    onSubmit: (values) => {
      registerapi(values)
    },
  });

  const registerapi = (values) => {
    const data = {
      ...values,
      ...account,
      "sect_rep": Number(values.sect_rep),
      "sect_rep_name": values.sect_rep_name,
      "school_thought": Number(values.school_thought),
      "school_thought_name": values.school_thought_name,
      'category_id': values.category_id,
      'category_name': values.category_name,
      'sub_category_id': values.sub_category_id,
      'sub_category_name': values.sub_category_name,
      'charity_registered': values.charity_registered,
      'charity_no': values.charity_no,
      'foundation_date': values.foundation_date,
      organizer_categories: formik.values.organizer_categories
    }
    setAccount(data);
    setActivetab(3);
  }

  const sectlistoption = Array.isArray(sectlist) && sectlist.map(item => ({ label: item.title, value: Number(item.id) }));
  const schooltypeoptions = Array.isArray(schooltype) && schooltype.map(item => ({ label: item.title, value: Number(item.id) }));
  const categoryoptions = Array.isArray(category) && category.map(item => ({ label: item.title, value: Number(item.id) }));

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (formik.touched || formik.errors) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched]);

  useEffect(() => {
    if (formik.isSubmitting) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <CustomeDate
            formik={formik}
            name={'foundation_date'}
            label={'Organization Foundation Date'}
            placeholder={'Select date'}
          />
          <CustomeSelect
            formik={formik}
            name={'sect_rep'}
            label={'Which sect best represents your organization?'}
            placeholder={'Select an option'}
            options={sectlistoption}
            showsearch={false}
          />
          <CustomeSelect
            formik={formik}
            name={'school_thought'}
            label={'Which of the following best represents your organization?'}
            placeholder={'Select an option'}
            options={schooltypeoptions}
          />
          <View>
            <Text style={styles.label}>Is your organization a registered charity?</Text>
            <View style={styles.radioContainer}>
              <RatioInput
                selectedValue={formik.values[`charity_registered`]}
                onRadioChange={(value) => formik.setFieldValue(`charity_registered`, value)}
                questionId={'1'}
                labels={{ one: 'Yes', two: 'No' }}
              />
            </View>
            {formik.values[`charity_registered`] == '1' && (
              <>
                <CustomeInput
                  formik={formik}
                  name={'charity_no'}
                  label={''}
                  placeholder={'Enter charity number'}
                />
              </>
            )}
          </View>
          <CustomeSelectCategorySubcategory
            formik={formik}
            name={'category_id'}
            label={'Offering Category'}
            placeholder={'Select an option'}
            options={categoryoptions}
            setCategoryId={setCategoryId}
          />
          {(formik.touched?.['organizer_categories'] && showError && formik.errors?.['organizer_categories']) && (
            <Text style={[styles.errorMessage]}>
              {formik.errors?.['organizer_categories']}
            </Text>
          )}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: heightScale(4),
    fontWeight: '500',
    fontSize: fontScale(14),
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
    fontSize: 12,
    color: '#fff',
  },
  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  },
  
});

export default AboutBio;
