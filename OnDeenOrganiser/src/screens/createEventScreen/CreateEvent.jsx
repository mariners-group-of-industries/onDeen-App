import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from './styles';
import Information from './Information';
import EventDetails from './EventDetails';
import Confirm from './Confirm';
import { useDispatch, useSelector } from 'react-redux';
import { getallmastereventListing } from '../../redux/slices/getallmastereventListing';
import { formatDate, formatTime } from '../../common/datetimeformate';
import CustomHeader from '../../components/customHeader';
import { fontScale, widthScale } from '../../helpers/scale';
import { useNavigation } from '@react-navigation/native';
import { apiRequest } from '../../services/api';

const CreateEvent = ({ route }) => {
  const navigation = useNavigation()
  const { id, draftId, latitude, longitude, address } = route?.params || {};
  const dispatch = useDispatch()
  const [categoryId, setCategoryId] = useState(null);
  const [subcategory, setSubcategory] = useState([]);
  const [activetab, setActivetab] = useState(1);
  const { eventbyid } = useSelector((state) => state.eventbyid);
  const token = useSelector(state => state.token.token?.access_token);
  const bearerToken = useSelector(state => state.user.loginToken);

  const [account, setAccount] = useState({
    "title": id ? eventbyid?.title : '',
    "images": id ? eventbyid?.images : [],
    "category_id": id ? eventbyid?.category_id : '',
    "sub_category_id": id ? eventbyid?.sub_category_id : '',
    "event_type": id ? eventbyid?.event_type : 2,
    "location_type": id ? eventbyid?.location_type == 0 ? 2 : eventbyid?.location_type == 2 ? 3 : 1 : 1,
    "meet_link": id ? eventbyid?.meet_link || '' : '',
    "location": id ? eventbyid?.location : '',
    "description": id ? eventbyid?.description : '',
    "start_date": id ? formatDate(eventbyid?.start_date) : '',
    "end_date": id ? formatDate(eventbyid?.end_date) : '',
    "start_time": id ? formatTime(eventbyid?.start_time) : '',
    "end_time": id ? formatTime(eventbyid?.end_time) : '',
    "price_type": id ? eventbyid?.price_type : 1,
    "price": id ? eventbyid?.price : '',
    "tags": id ? eventbyid?.tags : [],
    "latitude": id ? eventbyid?.latitude : latitude || 40.7128,
    "longitude": id ? eventbyid?.longitude : longitude || -74.0060,
    "journey_level_id": id ? eventbyid?.journey_level_id : '',
    "language_id": id ? eventbyid?.language_id : '',
    "total_no_class": id ? eventbyid?.total_no_class : '',
    "call_per_week": id ? eventbyid?.call_per_week : '',
    "course_breakdown": id ? eventbyid?.course_breakdown : 2,
    "swipe_checkin": id ? eventbyid?.swipe_checkin : 2,
    "curriculum": id ? eventbyid?.curriculum : [],
    "status": id ? eventbyid?.status : '',
    "speakers": id ? eventbyid?.speakers : [],
    "facilities": id ? eventbyid?.facilities : [],
    "itinerary": id ? eventbyid?.itineraries : [],
    "rule": id ? eventbyid?.rule : '',
    "eligibility": id ? eventbyid?.eligibility : '',
    "cancellation_policy": id ? eventbyid?.cancellation_policy : '',
    "terms_condition": id ? eventbyid?.terms_condition : '',
    "documents": id ? eventbyid?.documents : [],
    "available": id ? eventbyid?.available : 100,
    "quantity_per_user": id ? eventbyid?.quantity_per_user : 5,
    "ticket_type": id ? eventbyid?.ticket_type : 0,
    "tickets": id ? eventbyid?.tickets || [] : [],
    "qrcode_type": id ? eventbyid?.qrcode_type : 0,
    "gender": id ? eventbyid?.gender || 3 : 3,
    "occusr_type": id ? eventbyid?.occusr_type : 1,
    "occusr_weekday": id ? eventbyid?.occusr_weekday || '' : '',
    "occusr_month": id ? eventbyid?.occusr_month || 1 : 1,
    "ar_title": id ? eventbyid?.ar_title : 'ar_title',
    "ar_description": id ? eventbyid?.ar_description : 'ar_description',
    "ar_rule": id ? eventbyid?.ar_rule : 'ar_rule',
    "ar_eligibility": id ? eventbyid?.ar_eligibility : 'ar_eligibility',
    "ar_cancellation_policy": id ? eventbyid?.ar_cancellation_policy : 'ar_cancellation_policy',
    "ar_terms_condition": id ? eventbyid?.ar_terms_condition : 'ar_terms_condition',
    'status': 1
  });

  useEffect(() => {
    setActivetab(activetab);
  }, [activetab]);

  useEffect(() => {
    setActivetab(1);
  }, [route?.params])

  useEffect(() => {
    if (address) {
      setAccount(prevAccount => ({
        ...prevAccount,
        location: address,
        latitude: latitude || prevAccount.latitude,
        longitude: longitude || prevAccount.longitude,
      }));
    }
  }, [address, latitude, longitude]);

  useEffect(() => {
    if (!draftId) {
      return;
    }
    let cancelled = false;
    const loadDraft = async () => {
      const result = await apiRequest({
        url: '/organizer_app/drafts/get_by_id',
        method: 'POST',
        data: { id: draftId },
        authToken: token,
        bearerToken,
      });
      if (cancelled || !result?.status) {
        return;
      }
      try {
        const draftData = JSON.parse(result?.response?.json_data || '{}');
        if (draftData && typeof draftData === 'object') {
          setAccount(previous => ({ ...previous, ...draftData }));
        }
      } catch (_) {
        // Keep the empty form if a legacy draft contains invalid JSON.
      }
    };
    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [bearerToken, draftId, token]);

  const { getmasterdata } = useSelector((state) => state.getmasterdata);
  const { category } = useSelector((state) => state.category);
  const { schooltype } = useSelector((state) => state.schooltype);
  const { sectlist } = useSelector((state) => state.sectlist);
  const { registerquestion } = useSelector((state) => state.registerquestion);

  useEffect(() => {
    dispatch(getallmastereventListing());
  }, [dispatch]);

  const categories = Array.isArray(getmasterdata?.categories) && getmasterdata?.categories.map(category => {
    return {
      title: category.title,
      id: category.id,
      subcategories: category.subcategories.map((sub) => sub)
    };
  }) || [];

  const apitags = Array.isArray(getmasterdata?.tags) && getmasterdata?.tags.map((tag) => tag) || [];
  const journeylevel = Array.isArray(getmasterdata?.journey_level) && getmasterdata?.journey_level.map((item) => item) || [];
  const facilities = Array.isArray(getmasterdata?.facilities) && getmasterdata?.facilities.map((item) => item) || [];
  const speakers = Array.isArray(getmasterdata?.speakers) && getmasterdata?.speakers.map((item) => item) || [];
  const languages = Array.isArray(getmasterdata?.languages) && getmasterdata?.languages.map((item) => item) || [];

  useEffect(() => {
    const selectedCategoryId = account.category_id || categoryId;
    if (selectedCategoryId) {
      const selectedCategory = categories.find(item => item?.id == selectedCategoryId);
      if (selectedCategory) {
        setSubcategory(selectedCategory?.subcategories);
      }
    }
  }, [account.category_id, categoryId, getmasterdata]);


  const movetolocationpage = () => {
    navigation.navigate('AddLocation', { latitude, longitude, address, id: id })
  }
  ;
  

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Create an event"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <View style={styles.tabcontainer}>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(1)}>
              <View style={[styles.line, activetab == 1 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 1 && styles.activetablabel]}>
                01. Event Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(2)}>
              <View style={[styles.line, activetab == 2 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 2 && styles.activetablabel]}>
                02. Information
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabview]}
              onPress={() => setActivetab(3)}>
              <View style={[styles.line, activetab == 3 && styles.activeline]} />
              <Text style={[styles.tablabel, activetab == 3 && styles.activetablabel]}>
                03. Confirm
              </Text>
            </TouchableOpacity>
          </View>

          {activetab == 1 && (
            <EventDetails
              account={account}
              setAccount={setAccount}
              setActivetab={setActivetab}
              setCategoryId={setCategoryId}
              category={categories}
              subcategory={subcategory}
              apitags={apitags}
              journeylevel={journeylevel}
              languages={languages}
              facilities={facilities}
              address={address}
              movetolocationpage={movetolocationpage}
            />
          )}
          {activetab == 2 && (
            <Information
              eventtype={account?.event_type}
              setCategoryId={setCategoryId}
              category={category}
              schooltype={schooltype}
              sectlist={sectlist}
              subcategory={subcategory}
              speakers={speakers}
              account={account}
               setAccount={setAccount} setActivetab={setActivetab}
            />
          )}
          {activetab == 3 && (
            <Confirm id={id} draftId={draftId} registerquestion={registerquestion} account={account}
              setAccount={setAccount} setActivetab={setActivetab}
              latitude={latitude} longitude={longitude} address={address}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateEvent;
