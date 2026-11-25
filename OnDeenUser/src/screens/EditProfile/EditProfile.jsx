import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './styles';
import { fontScale, heightScale } from '../../helpers/scale';
import LatestHeader from '../../components/LatestHeader';
import { fetchProfileData } from '../../redux/slices/profileSlice';
import { RefreshControl, TextInput } from 'react-native-gesture-handler';
import { editProfileAPI } from '../../redux/slices/editProfileSlice';
import GradientButton from '../../components/gradientButton';
import { uploadImage } from '../../redux/slices/imageUploadSlice';
import Toast from '../../components/toastMessage';
import Loader from '../../components/loader';
import CustomeSelect from '../../components/CustomeSelect';
import { journeylevelslistAPI } from '../../redux/slices/journeylevelsSlice';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import CustomDatePicker from '../RegisterScreen/CustomDatePicker';

// Validation schema
const EditProfileSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email_id: Yup.string().email('Invalid email').required('Email is required'),
  journey_level_id: Yup.number().nullable(),
  gender: Yup.number().nullable(),
  age: Yup.number().min(1, 'Age must be positive').nullable(),
  dob: Yup.date().nullable(),
  password: Yup.string(),
  profile_image: Yup.string().nullable(),
});

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    email_id: '',
    mobile_number: '',
    journey_level_id: null,
    gender: null,
    age: null,
    dob: '',
    password: '',
    profile_image: null,
  });

  useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });
  const { data } = useSelector((state) => state.profileSlice);
  const status = useSelector((state) => state.editProfileSlice.status);
  const journeylevels = useSelector(state => state.journeylevels?.journeylevels);

  const genderoptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
  ];

  useEffect(() => {
    dispatch(journeylevelslistAPI());
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchProfileData());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  useEffect(() => {
    if (data) {
      const calculatedAge = data?.dob ? calculateAge(new Date(data.dob)) : data?.age;

      const newInitialValues = {
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        email_id: data?.email_id || '',
        mobile_number: data?.mobile_number || '',
        journey_level_id: data?.journey_level_id || null,
        gender: data?.gender ?? null,
        age: calculatedAge || null,
        dob: data?.dob || '',
        password: '',
        profile_image: data?.profile_image || null,
      };

      setInitialValues(newInitialValues);
      setProfileImage(data?.profile_image || null);
    }
  }, [data]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(fetchProfileData());
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, []),
  );

  const showToast = useToastForPopup();

  const choosePhotoFromLibrary = async () => {
    ImagePicker.openPicker({
      width: 80,
      height: 80,
      cropping: false,
      compressImageQuality: 0.7,
      includeBase64: true,
      avoidEmptySpaceAroundImage: true,
    })
      .then(async image => {
        const imageFile = {
          file: image?.data,
          module: 'profile',
        };
        try {
          const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();
          setProfileImage(uploadResult);
          formik.setFieldValue('profile_image', uploadResult);
        } catch (error) {
          showToast(error?.message);
        }
      })
      .catch(error => {
        if (error.message !== 'User cancelled image selection') {
          showToast('Failed to select an image');
        }
      });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dobString = selectedDate.toISOString().split('T')[0];
      const calculatedAge = calculateAge(new Date(selectedDate));

      formik.setFieldValue('dob', dobString);
      formik.setFieldValue('age', calculatedAge);
    }
  };

  const handleSave = async (values) => {
    const profileData = {
      ...values,
      age: Number(values.age),
      gender: values.gender ? Number(values.gender) : null,
      profile_image: values.profile_image || data?.profile_image,
    };

    try {
      const response = await dispatch(editProfileAPI(profileData)).unwrap();

      if (response?.status) {
        await dispatch(fetchProfileData()).unwrap();
        showToast('Profile updated successfully');
      } else {
        showToast('Failed to update profile');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to update profile');
    }
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: EditProfileSchema,
    enableReinitialize: true,
    onSubmit: handleSave,
  });

  if (status === 'loading') {
    return (
      <Loader
        isLoading={true}
        containerStyle={{ backgroundColor: '#FDFBFF' }}
        animationSource={require('../../assets/loader.json')}
      />
    );
  }

  const journenyleveloption = Array.isArray(journeylevels) &&
    journeylevels.map(item => ({
      label: item.title,
      value: Number(item.id),
    })) || [];

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ flex: 1, backgroundColor: '#fff' }}>
      <LatestHeader
        statusBarColor="#fff"
        title="Edit Profile"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }>

        <View style={styles.profilePicContainer}>
          <Pressable
            onPress={choosePhotoFromLibrary}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <View style={styles.profileImageContainer}>
              {(formik.values.profile_image || profileImage) ? (
                <Image source={{ uri: (profileImage || formik.values.profile_image) }} style={styles.profileImage} />
              ) : (
                <Image source={require('../../assets/images/camera-01.png')} />
              )}
            </View>
            <Text style={styles.profileText}> Edit Profile pic</Text>
          </Pressable>
        </View>

        <View style={[styles.editProfileCommonContainer, { marginTop: 12 }]}>
          <Text style={styles.contentText}>First Name</Text>
          <TextInput
            style={styles.editprofileText}
            value={formik.values.first_name}
            onChangeText={formik.handleChange('first_name')}
            onBlur={formik.handleBlur('first_name')}
          />
          {formik.touched.first_name && formik.errors.first_name && (
            <Text style={styles.errorText}>{formik.errors.first_name}</Text>
          )}
        </View>

        <View style={styles.editProfileCommonContainer}>
          <Text style={styles.contentText}>Last Name</Text>
          <TextInput
            style={styles.editprofileText}
            value={formik.values.last_name}
            onChangeText={formik.handleChange('last_name')}
            onBlur={formik.handleBlur('last_name')}
          />
          {formik.touched.last_name && formik.errors.last_name && (
            <Text style={styles.errorText}>{formik.errors.last_name}</Text>
          )}
        </View>

        <Pressable style={styles.editProfileCommonContainer}>
          <Text style={styles.contentText}>Mobile No.</Text>
          <Text style={styles.editprofileText}>{data?.country_code} {data?.mobile_number}</Text>
        </Pressable>

        <Pressable style={styles.editProfileCommonContainer}>
          <Text style={styles.contentText}>Email</Text>
          <Text style={styles.editprofileText}>{data?.email_id}</Text>
        </Pressable>

        <View style={[styles.editProfileCommonContainer, { paddingBottom: 6 }]}>
          <CustomeSelect
            formik={{
              values: { journey_level_id: formik.values.journey_level_id },
              setFieldValue: (field, value) => {
                if (field === 'journey_level_id') {
                  formik.setFieldValue('journey_level_id', value);
                }
              },
              errors: { journey_level_id: formik.touched.journey_level_id && formik.errors.journey_level_id },
              touched: { journey_level_id: formik.touched.journey_level_id },
              isSubmitting: formik.isSubmitting,
            }}
            name="journey_level_id"
            label="Learning preference"
            placeholder="Select learning preference"
            options={journenyleveloption}
          />
        </View>

        <View style={[styles.editProfileCommonContainer, { paddingBottom: 6 }]}>
          <CustomeSelect
            formik={{
              values: { gender: formik.values.gender },
              setFieldValue: (field, value) => {
                if (field === 'gender') {
                  formik.setFieldValue('gender', value);
                }
              },
              errors: { gender: formik.touched.gender && formik.errors.gender },
              touched: { gender: formik.touched.gender },
              isSubmitting: formik.isSubmitting,
            }}
            name="gender"
            label="Gender"
            placeholder="Select Gender"
            options={genderoptions}
          />
        </View>
        <View style={[styles.editProfileCommonContainer]}>
          <CustomDatePicker
            formik={formik}
            fieldName="dob"
            label="Age"
          />
        </View>
        <View style={[styles.editProfileCommonContainer, { paddingBottom: 6 }]}>
          <Text style={styles.editprofileText}>Password</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.contentText}>*************</Text>
            <Text
              onPress={() => navigation.navigate('ChangePassword')}
              style={[styles.editprofileText, { color: '#DB3171' }]}>
              Change Password
            </Text>
          </View>
        </View>

        <GradientButton
          containerStyle={{
            paddingHorizontal: 32,
            marginVertical: 24,
          }}
          onPress={formik.handleSubmit}
          title={'Save'}
        />

        <Toast message={formik.status} />
      </ScrollView>
    </ContainerComponent>
  );
};

export default EditProfile;
