import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SectionList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import styles from './styles';
import { fontScale, widthScale } from '../../helpers/scale';
import { createNote, deleteNote, fetchNotes } from '../../redux/slices/notesSlice';
import { useDispatch, useSelector } from 'react-redux';
import Toast from '../../components/toastMessage';
import { RefreshControl } from 'react-native-gesture-handler';
import LatestHeader from '../../components/LatestHeader';
import CustomModalNote from '../../components/customModalNote';
import GuestModal from '../../modals/guestModal';
import { addEventNotes, getEventNoteslist } from '../../redux/callapis/CommonService';
import { useToastForPopup } from '../../context/ToastContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatTimeOnly } from '../../timezone/maintimezone';
import CommonNotesModel from '../SecondEventDetailsPage/CommonNotesModel';
import { ChevronLeft } from 'lucide-react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

const NotesScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { id } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showToast = useToastForPopup();
  const [noteslist, setNoteslist] = useState([]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    note: Yup.string().required('Note is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      note: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {

    },
  });
  const saveNotes = async (values) => {
    console.log(values, 'valuesvaluesvaluesvalues');

    try {
      const data = {
        event_id: id,
        note: values.note.trim(),
        title: values.title.trim(),
      };

      if (selectedNote?.id) {
        data.id = selectedNote?.id;
      }

      const resultAction = await addEventNotes({ data });
      if (resultAction?.status) {
        showToast(resultAction?.message || 'Added Successfully');
        fetchNotesData();
        setSelectedNote(null);
        setModalVisible(false)
      } else {
        showToast(resultAction?.message || 'Failed');
      }
    } catch (err) {
      console.log(err, 'err');
      showToast(typeof err === 'string' ? err : 'Unexpected error');
    }
  }


  const groupedNotes = Array.isArray(noteslist) && noteslist?.reduce((acc, note) => {
    const date = moment(note.created_on).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(note);
    return acc;
  }, {});

  const sections = Object.keys(groupedNotes).map(date => ({
    date: moment(date).format('DD MMM YYYY'),
    data: groupedNotes[date],
  }));

  useEffect(() => {
    if (id) {
      fetchNotesData()
    }
  }, [id]);


  const fetchNotesData = async () => {
    setRefreshing(true);
    const data = { event_id: id };
    try {
      const res = await getEventNoteslist({ data });
      setNoteslist(res?.response || []);
      console.log(res, 'res');

    } catch (err) {

      setNoteslist([]);
      setLoading(false);
    }
    finally {
      setRefreshing(false);

    }
  };




  const handleCreateNote = () => {
    formik.resetForm();
    setSelectedNote(null);
    setModalVisible(true);
  };

  const handleNotePress = (note) => {
    setSelectedNote(note);
    formik.setFieldValue('title', note.title);
    formik.setFieldValue('note', note.notes);
    setModalVisible(true);
  };

  const handleNoteLongPress = useCallback(note => {
    setSelectedNote(note);
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteNote = useCallback(async () => {
    if (!selectedNote) return;
    try {
      await dispatch(deleteNote(selectedNote.id)).unwrap();
      showToast('Note deleted successfully!');
      setDeleteModalVisible(false);
      fetchNotesData();
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Failed to delete the note.');
    }
  }, [dispatch, selectedNote]);

  const formatTime = (createdOn) => moment(createdOn).format('hh:mm A');

  useFocusEffect(
    useCallback(() => {
      fetchNotesData();
      return () => { };
    }, [])
  );

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
      <LatestHeader
        statusBarColor="#fff"
        title="My Notes"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        rightImageSource={'3'}
        onClickAskedQuestion={handleCreateNote}
        showforeventDetails={true}
      />
      <ScrollView
        style={{ backgroundColor: '#fff' }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotesData} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <SectionList
            sections={sections}
            keyExtractor={item => item.id?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                accessibilityLabel={`Edit note ${item.title || 'Title'}`}
                accessibilityRole="button"
                onLongPress={() => handleNoteLongPress(item)}
                onPress={() => handleNotePress(item)}>
                <View style={styles.subContainer}>
                  <View style={styles.notesContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.notesHeading}>{item.title || 'Title'}</Text>
                      <Text style={styles.notesTime}>
                        {formatTimeOnly(item?.created_on, item?.time_zone, 'time-only')}
                      </Text>
                    </View>
                    <Text style={styles.notesContent}> {item.notes}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { date } }) => (
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderText}>{date}</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{ color: '#666', fontSize: 14, fontFamily: fontFamilies.SFProRoundedBlackMedium, }}>No Notes available</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />

        </View>
        <CommonNotesModel
          isModalVisible={isModalVisible}
          setIsModalVisible={setModalVisible}
          saveNotes={saveNotes}
          notesvalues={formik.values}
        />

        {isDeleteModalVisible && (
          <GuestModal
            isVisible={isDeleteModalVisible}
            title="Confirm Delete"
            message="Are you sure you want to delete this note?"
            onCancel={() => setDeleteModalVisible(false)}
            onConfirm={handleDeleteNote}
          />
        )}

        <Toast message={null} />
      </ScrollView>
    </ContainerComponent>
  );
};

export default NotesScreen;
