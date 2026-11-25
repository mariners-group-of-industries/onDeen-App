import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import styles from './styles';
import AboutBio from './AboutBio';
import BasicDetails from './BasicDetails';
import AdditionalInfo from './AdditionalInfo';
import { useDispatch, useSelector } from 'react-redux';
import { categoryListing } from '../../redux/slices/categorySlice';
import { schooltypeListing } from '../../redux/slices/schooltypeSlice';
import { sectlistListing } from '../../redux/slices/sectlistSlice';
import { registerquestionListing } from '../../redux/slices/registerquestionSlice';
import { subcategoryListing } from '../../redux/slices/subcategorySlice';
import { useNavigation } from '@react-navigation/native';
import { getProfileDetails } from '../../redux/slices/getprofileSlice';
import { BASE_URL } from '../../helpers/Constant';

const isLocalBackend = BASE_URL.includes('127.0.0.1') || BASE_URL.includes('localhost');
const localDefaultProfileImage = 'https://ondeen.app/assets/images/logo.svg';
const localDefaultAddress = 'Local Test Address, Paris';
const localDefaultOrganizerCategories = [
  {
    category_id: 1,
    category_name: 'Community Services',
    organizer_subcategories: [
      {
        subcategory_id: 1,
        subcategory_name: 'General Support',
        value: 1,
        label: 'General Support',
      },
    ],
  },
];

const CreateAccount = ({ route }) => {
  const {
    mobile_number,
    country_code,
    cca2,
    latitude,
    longitude,
    address,
    update,
    email_id,
    userData,
    IsGoogleLogin,
    social_id,
    social_access_token,
    provider,
  } = route.params || {};

  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [categoryId, setCategoryId] = useState(1);
  const [activetab, setActivetab] = useState(1);
  const { profiledatails } = useSelector((state) => state.profiledatails);

  const googleManagerName = [
    userData?.givenName || userData?.given_name,
    userData?.familyName || userData?.family_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const buildInitialAccount = () => ({
    profile_image: profiledatails?.profile_image || userData?.photo || userData?.profile_image || (isLocalBackend ? localDefaultProfileImage : ''), // Fallback to empty string if not available
    organization_name: profiledatails?.organization_name || (isLocalBackend ? 'OnDeen Test Org' : ''), // Fallback to empty string if not available
    manager_name: profiledatails?.manager_name || userData?.name || googleManagerName || (isLocalBackend ? 'Othmane Tester' : ''), // Fallback to empty string if not available
    cca2: profiledatails?.cca2 || cca2 || '', // Use route params if available, else fallback to empty string
    country_code: profiledatails?.country_code || country_code || (email_id || userData?.email ? '+44' : ''), // Same as above
    mobile_number: profiledatails?.mobile_number || mobile_number || '', // Use route params or fallback
    email_id: profiledatails?.email_id || email_id || userData?.email || (isLocalBackend ? `local${mobile_number || Date.now()}@ondeen.com` : ''), // Fallback to empty string if not available
    password: isLocalBackend && !update ? 'Password123' : '', // Password should be handled separately for security
    post_code: profiledatails?.post_code || (isLocalBackend ? '75001' : ''), // Fallback to empty string
    location: profiledatails?.location || address || (isLocalBackend ? localDefaultAddress : ''), // Use route params or fallback to profiledatails
    foundation_date: profiledatails?.foundation_date || (isLocalBackend ? '01-01-2024' : ''), // Fallback to empty string
    sect_rep: profiledatails?.sect_rep || (isLocalBackend ? 1 : ''), // Fallback to empty string
    school_thought: profiledatails?.school_thought || (isLocalBackend ? 1 : ''), // Fallback to empty string
    school_thought_id: profiledatails?.school_thought_id || '', // Fallback to empty string
    sect_representation_id: profiledatails?.sect_representation_id || '', // Fallback to empty string
    charity_registered: profiledatails?.charity_registered ?? (isLocalBackend ? 2 : 1), // Fallback to 1 if not available
    charity_no: profiledatails?.charity_no || '', // Fallback to empty string
    category_title: profiledatails?.category_title || (isLocalBackend ? 'Community Services' : ''), // Fallback to empty string
    sub_category_title: profiledatails?.sub_category_title || (isLocalBackend ? 'General Support' : ''), // Fallback to empty string
    category_id: profiledatails?.category_id || (isLocalBackend ? 1 : ''), // Fallback to empty string
    sub_category_id: profiledatails?.sub_category_id || (isLocalBackend ? 1 : ''), // Fallback to empty string
    latitude: profiledatails?.latitude || latitude || (isLocalBackend ? 48.8566 : 40.7128), // Fallback to a default latitude
    longitude: profiledatails?.longitude || longitude || (isLocalBackend ? 2.3522 : -74.0060), // Fallback to a default longitude
    organizer_categories: profiledatails?.organizer_categories || (isLocalBackend ? localDefaultOrganizerCategories : []), // Fallback to empty array
    additional_information: profiledatails?.additional_information || [], // Fallback to empty array
    social_id: social_id || userData?.id || userData?.sub || '',
    social_access_token: social_access_token || userData?.access_token || '',
    provider: provider || (IsGoogleLogin ? 'google' : ''),
  });

  const [account, setAccount] = useState(buildInitialAccount());

  useEffect(() => {
    if (route.params) {
      setAccount((prevAccount) => ({
        ...prevAccount,
        cca2: cca2 || prevAccount.cca2,
        country_code: country_code || prevAccount.country_code,
        mobile_number: mobile_number || prevAccount.mobile_number,
        email_id: email_id || userData?.email || prevAccount.email_id,
        manager_name: userData?.name || googleManagerName || prevAccount.manager_name,
        profile_image: userData?.photo || userData?.profile_image || prevAccount.profile_image,
        social_id: social_id || userData?.id || userData?.sub || prevAccount.social_id,
        social_access_token: social_access_token || userData?.access_token || prevAccount.social_access_token,
        provider: provider || (IsGoogleLogin ? 'google' : prevAccount.provider),
        location: profiledatails?.location || address || prevAccount.location,
        latitude: latitude || prevAccount.latitude,
        longitude: longitude || prevAccount.longitude,
      }));
    }
  }, [route.params, cca2, country_code, mobile_number, email_id, userData, googleManagerName, social_id, social_access_token, provider, IsGoogleLogin, profiledatails?.location, address, latitude, longitude]);


  useEffect(() => {
    if (update) {
      dispatch(getProfileDetails());
    }
  }, [dispatch, update]);

  const { category } = useSelector((state) => state.category);
  const { subcategory } = useSelector((state) => state.subcategory);
  const { schooltype } = useSelector((state) => state.schooltype);
  const { sectlist } = useSelector((state) => state.sectlist);
  const { registerquestion } = useSelector((state) => state.registerquestion);

  useEffect(() => {
    dispatch(categoryListing());
    dispatch(schooltypeListing());
    dispatch(sectlistListing());
    dispatch(registerquestionListing());
    dispatch(subcategoryListing({ 'category_id': 1 }));

  }, [dispatch]);

  useEffect(() => {
    if (categoryId) {
      dispatch(subcategoryListing({ 'category_id': categoryId }));
    }
  }, [categoryId, dispatch]);

  const movetolocationpage = (values = account) => {
    const nextAccount = {
      ...account,
      ...values,
      location: address || values.location || account.location,
      latitude: latitude || values.latitude || account.latitude,
      longitude: longitude || values.longitude || account.longitude,
    };

    setAccount(nextAccount);
    navigation.navigate('CustomeMapView', {
      mobile_number: nextAccount.mobile_number,
      country_code: nextAccount.country_code,
      cca2: nextAccount.cca2,
      latitude: nextAccount.latitude,
      longitude: nextAccount.longitude,
      address: nextAccount.location,
      update,
    });
  };


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#FFFF'}/>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <View style={styles.tabcontainer}>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(1)}>
              <View style={[styles.line, activetab == 1 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 1 && styles.activetablabel]}>
                01. Basic Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(2)}>
              <View style={[styles.line, activetab == 2 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 2 && styles.activetablabel]}>
                02. About & Bio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(3)}>
              <View style={[styles.line, activetab == 3 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 3 && styles.activetablabel]}>
                03. Additional
              </Text>
            </TouchableOpacity>
          </View>

          {activetab == 1 && (
            <BasicDetails
              account={account}
              setAccount={setAccount}
              setActivetab={setActivetab}
              movetolocationpage={movetolocationpage}
              address={account?.location}
              latitude={account?.latitude}
              longitude={account?.longitude}
              update={update}
            />
          )}
          {activetab == 2 && (
            <AboutBio
              setCategoryId={setCategoryId}
              category={category}
              schooltype={schooltype}
              sectlist={sectlist}
              subcategory={subcategory}
              account={account} setAccount={setAccount} setActivetab={setActivetab}
              update={update}
            />
          )}
          {activetab == 3 && (
            <AdditionalInfo registerquestion={registerquestion}
              account={account} setAccount={setAccount} setActivetab={setActivetab}
              address={account?.location} latitude={account?.latitude} longitude={account?.longitude}
              update={update}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateAccount;
