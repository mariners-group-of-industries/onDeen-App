import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GradientButton from '../../components/gradientButton';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import RatioInput from '../../components/ratioInput';
import { getallmastereventListing } from '../../redux/slices/getallmastereventListing';
import { useDispatch, useSelector } from 'react-redux';
import SpeakerCheckbox from '../../components/SpeakerCheckbox';
import LinearGradient from 'react-native-linear-gradient';
import TouchableLabel from '../../components/customLabels';
import { fontFamilies } from '../../assets/themes/fonts';

const BasicDetails = ({ setDisplayFilter, filter1, setFilter1 }) => {

  const validationSchema = Yup.object({
    // category_id: Yup.string().required('Category is required'),
    // price_type: Yup.string().required('Price type is required'),
    // speaker_id: Yup.string().required('Speaker is required'),
    // location_type: Yup.string().required('Location type is required'),
  });

  const formik = useFormik({
    initialValues: filter1,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setFilter1(values);
      setDisplayFilter(false)
    },
  });

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

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getallmastereventListing());
  }, [dispatch]);

  const { getmasterdata } = useSelector((state) => state.getmasterdata);

  const speaker = Array.isArray(getmasterdata?.speakers) && getmasterdata?.speakers.map(item => ({ label: `${item.first_name} ${item.last_name}`, value: Number(item.id), image: item.profile_image }));
  const category = Array.isArray(getmasterdata?.categories) && getmasterdata?.categories.map(category => {
    return {
      label: category.title,
      value: category.id,
    };
  }) || [];

  const Cancel = () => {
    setDisplayFilter(false);
  };

  const clearbutton = () => {
    setFilter1({
      ...filter1,
      category_id: "",
      price_type: "",
      speaker_id: "",
      location_type: "",
    });
    setDisplayFilter(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formikContainer}>
        <View style={styles.header}>
          <Text style={styles.filterLabel}>Filter</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearbutton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Category Field */}
        <View>
          <Text style={styles.fieldLabel}>Category</Text>
          <SpeakerCheckbox
            selectedValue={formik.values.category_id}
            onRadioChange={(value) => formik.setFieldValue('category_id', value)}
            options={category}
            checkbox={true}
          />
          {formik.touched.category_id && formik.errors.category_id && (
            <Text style={styles.errorMessage}>{formik.errors.category_id}</Text>
          )}
        </View>

        {/* Price Type Field */}
        <View>
          <Text style={styles.fieldLabel}>Price type</Text>
          <RatioInput
            selectedValue={formik.values.price_type}
            onRadioChange={(value) => formik.setFieldValue('price_type', value)}
            questionId={'1'}
            labels={{ one: 'Free', two: 'Paid' }}
            checkbox={true}
          />
          {formik.touched.price_type && formik.errors.price_type && (
            <Text style={styles.errorMessage}>{formik.errors.price_type}</Text>
          )}
        </View>

        {/* Location Type Field */}
        <View>
          <Text style={styles.fieldLabel}>Location type</Text>
          <RatioInput
            selectedValue={formik.values.location_type}
            onRadioChange={(value) => formik.setFieldValue('location_type', value)}
            labels={{ one: 'In-Person', two: 'Online' }}
            checkbox={true}
          />
          {formik.touched.location_type && formik.errors.location_type && (
            <Text style={styles.errorMessage}>{formik.errors.location_type}</Text>
          )}
        </View>

        {/* Speaker Field */}
        <View>
          <Text style={styles.fieldLabel}>Speaker type</Text>
          <SpeakerCheckbox
            selectedValue={formik.values.speaker_id}
            onRadioChange={(value) => formik.setFieldValue('speaker_id', value)}
            options={speaker}
            image={true}
            checkbox={true}
          />
          {formik.touched.speaker_id && formik.errors.speaker_id && (
            <Text style={styles.errorMessage}>{formik.errors.speaker_id}</Text>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.infoBtnContainer}>
            <TouchableLabel
              label={'CANCEL'}
              onPress={Cancel}
              containerStyle={styles.viewallContainer}
              labelStyle={styles.viewallLabel}
            />
          </View>
          <GradientButton
            onPress={formik.handleSubmit}
            title="APPLY"
            containerStyle={styles.customButtonContainer}
            textStyle={styles.customButtonText}
            colors={['#DB3171', '#FFCC33']}
            end={{ x: 0.5, y: 1 }}
            start={{ x: 1, y: 0.1 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  formikContainer: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  clearButton: {
    backgroundColor: '#000',
    padding: 2,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 5,
    paddingTop: 22
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
    width: '100%',
    borderRadius: widthScale(90),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FDFBFF',
    borderWidth: 1,
    borderColor: "#D0D0D0"
  },
  viewallLabel: {
    color: '#000000',
    fontSize: 14,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  customButtonContainer: {
    width: '50%',
    marginBottom: heightScale(10),
    backgroundColor: '#fff',

  },
  customButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
});

export default BasicDetails;
