import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Close from '../../src/assets/svg/close.svg';
import { useDispatch } from 'react-redux';
import { fontFamilies } from '../../assets/fonts/fonts';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from '../components/gradientButton';
import TouchableLabel from '../components/customLabels';
import { clearFilterApplyData, fetchFilterList } from '../redux/slices/filterEventSlice';
import { getFilterListOptions } from '../redux/callapis/CommonService';
import DateModel from './DateModel/DateModel';
import TicketTypeButton from './TicketTypeButton';
import JourneyLevelButton from './JourneyLevelButton';
import FilterCheckboxOptions from './FilterCheckboxOptions';
import { useFilter } from '../context/FilterContext';
import FilterCheckboxOptions2 from './FilterCheckboxOptions2';
import LocationTypeButton from './LocationTypeButton';

const FilterModal = ({ isVisible, onClose, onApply, categoryId, setSelectedFilters }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [optionslist, setOptionslist] = useState([]);
  const { filter1, setFilter1, hithomepageapi, setHithomepageapi, resetFilter } = useFilter();
  const modalTopPadding = Math.max(insets.top + 16, 40);
  const modalBottomPadding = insets.bottom + heightScale(12);
  const footerReserve = modalBottomPadding + heightScale(88);

  useEffect(() => {
    if (isVisible) dispatch(fetchFilterList({ type: categoryId }));
  }, [isVisible, dispatch]);

  useEffect(() => {
    fetchOptions();
  }, [filter1?.category_id]);

  const fetchOptions = async () => {
    try {
      const res = await getFilterListOptions({ data: { type: filter1?.category_id[0] || "" } });
      setOptionslist(res?.response || []);
    } catch {
      setOptionslist([]);
    }
  };

  const handleClearFilters = () => {
    resetFilter()
  };

  const handleApplyFilters = () => {
    setHithomepageapi(hithomepageapi + 1)
    onClose()
  };

  const options = {
    organizers: (optionslist?.organizers || []).map(i => ({ label: i?.organization_name, value: i?.id })),
    speakers: (optionslist?.speakers || []).map(i => ({ label: `${i?.first_name} ${i?.last_name}`, value: i?.id })),
    category: (optionslist?.category?.categories || []).map(i => ({ label: i?.title, value: i?.id })),
    gender: (optionslist?.gender || []).map(i => ({ label: i?.title, value: i?.id })),
    journey: (optionslist?.journey_level || []).map(i => ({ label: i?.title, value: i?.id }))
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard
      propagateSwipe
      style={styles.fullScreenModal}
      statusBarTranslucent>
      <View style={[styles.container, { paddingTop: modalTopPadding }]}>
        <View style={styles.headerRow}>
          <Text style={styles.modalTitle}>Filters</Text>
          <Pressable
            accessibilityLabel="Close filters"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}>
            <Close height={24} width={24} />
          </Pressable>
        </View>
        <ScrollView
          style={[styles.scrollView, { marginBottom: footerReserve }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: heightScale(180) },
          ]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          <DateModel />
          <TicketTypeButton toggleSelectionTemp={v => setFilter1('price_type', v)} selectedValue={filter1?.price_type} />
          <JourneyLevelButton options={options.journey} toggleSelectionTemp={v => setFilter1('journey_level_id', v)} selectedValue={filter1?.journey_level_id} />
          <Text style={styles.fieldLabel}>Category</Text>
          <FilterCheckboxOptions title={'Category'} selectedValue={filter1?.category_id}
            onRadioChange={v => {
              console.log(v, 'vvvvvvvvv');
              // Take only the last selected value to mimic radio button
              const singleValue = Array.isArray(v) ? v[v.length - 1] : v;
              setFilter1('category_id', [singleValue]); // keep it as array for component
            }}
            options={options.category} checkbox={true} />
          {/* <Text style={styles.fieldLabel}>Speakers</Text> */}
          {options?.speakers && options?.speakers?.length > 0 &&
            <FilterCheckboxOptions2 title={'Speakers'} selectedValue={filter1?.speaker_id} onRadioChange={v => setFilter1('speaker_id', v)} options={options.speakers} checkbox={true} />}
          {/* <Text style={styles.fieldLabel}>Organisers</Text> */}
          {options?.organizers && options?.organizers?.length > 0 &&
            <FilterCheckboxOptions2 title={'Organisers'} selectedValue={filter1?.organizer_id} onRadioChange={v => setFilter1('organizer_id', v)} options={options.organizers} checkbox={true} />}
          <Text style={styles.fieldLabel}>Gender</Text>
          <FilterCheckboxOptions title={'Gender'} selectedValue={filter1?.gender_id} onRadioChange={v => setFilter1('gender_id', v)} options={options.gender} checkbox={true} />
          <LocationTypeButton toggleSelectionTemp={v => setFilter1('location', v)} selectedValue={filter1?.location} />
        </ScrollView>
        <View style={[styles.buttonContainer, { paddingBottom: modalBottomPadding }]}>
          <TouchableLabel containerStyle={styles.cancelButton} label="CLEAR ALL" onPress={handleClearFilters} labelStyle={styles.cancelButtonText} />
          <GradientButton containerStyle={styles.applyButton} onPress={handleApplyFilters} title={'APPLY FILTERS'} textStyle={styles.applyButtonText} colors={['#DB3171', '#FFCC33']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModal: { margin: 0 },
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  modalTitle: { fontSize: 20, lineHeight: 24, fontFamily: fontFamilies.SFProRoundedBlackMedium, color: '#161616' },
  scrollView: { flex: 1 },
  scrollContent: { backgroundColor: '#FFF', flexGrow: 1, paddingHorizontal: 20 },
  fieldLabel: { fontSize: 20, lineHeight: 24, color: '#000', fontFamily: fontFamilies.SFProRoundedBlackMedium, paddingTop: 14, paddingBottom: 4 },
  buttonContainer: { backgroundColor: '#FFFFFF', bottom: 0, flexDirection: 'row', gap: 8, left: 20, paddingTop: 12, position: 'absolute', right: 20 },
  cancelButton: { borderRadius: 90, height: 56, justifyContent: 'center', flex: 1, borderWidth: 1, borderColor: '#161616', backgroundColor: '#FEFDFF' },
  cancelButtonText: { color: '#222222', fontSize: fontScale(12), fontFamily: fontFamilies.SFProRoundedBlackBold },
  applyButton: { borderRadius: 90, height: 56, justifyContent: 'center', flex: 1 },
  applyButtonText: { color: '#FFFFFF', fontSize: fontScale(14), fontFamily: fontFamilies.SFProRoundedBlackBold, lineHeight: 16 },
});

export default FilterModal;
