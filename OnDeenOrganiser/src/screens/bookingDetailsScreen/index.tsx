import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import TouchableLabel from '../../components/customLabels';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import styles from './styles';
import CustomHeader from '../../components/customHeader';
import {notesData as initialNotesData} from '../../helpers/Constant';
import AnimatedSwipe from '../../components/swipeBar';
import CustomModal from '../../components/customModal';
import {
  fetchBookingList,
  clearBookingListData,
} from '../../redux/slices/bookingLIstSlice';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {fetchEventById} from '../../redux/slices/eventsSlice';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const BookingDetails = ({route}) => {
  const firstCarouselRef = useRef(null);
  const {t} = useTranslation();
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCourseExpanded, setIsCourseExpanded] = useState(false);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notesData, setNotesData] = useState(initialNotesData);
  const [isNotesListVisible, setNotesListVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const {status} = useSelector((state: RootState) => state.eventDetails);

  const {bookingId} = route.params || {};
  const eventsSort1 = useSelector((state: RootState) => state.eventDetails);
  const eventDetail = eventsSort1.eventDetail; // Get event details
  // Define all fields with null checks and default values
  ;

  const title = eventDetail?.title || 'Default Title';

  const arTitle = eventDetail?.ar_title || 'Default Arabic Title';
  const qrcode = eventDetail?.qrcode || 'Default Arabic Title';
  const organizer = eventDetail?.organizer || 'Default Arabic Title';
  const journey_level_id =
    eventDetail?.journey_level_id || 'Default Arabic Title';
  const itineraries = eventDetail?.itineraries || [];
  const arDescription =
    eventDetail?.ar_description || 'Default Arabic description here';

  const cancellationPolicy =
    eventDetail?.cancellation_policy || 'No cancellation policy available';

  const arCancellationPolicy =
    eventDetail?.ar_cancellation_policy ||
    'No Arabic cancellation policy available';

  const rule = eventDetail?.rule || 'No rules defined';

  const arRule = eventDetail?.ar_rule || 'No Arabic rules defined';

  const eligibility = eventDetail?.eligibility || 'No eligibility criteria';

  const arEligibility =
    eventDetail?.ar_eligibility || 'No Arabic eligibility criteria';

  const termsCondition =
    eventDetail?.terms_condition || 'No terms and conditions available';

  const arTermsCondition =
    eventDetail?.ar_terms_condition ||
    'No Arabic terms and conditions available';

  const price = eventDetail?.price || '0.00';

  const priceType = eventDetail?.price_type || 1;

  const endDate = eventDetail?.end_date || 'Date not available';
  const user_id = eventDetail?.user_id || 'Date not available';

  const tags = eventDetail?.tags || [];

  const primaryImage =
    eventDetail?.primary_image || 'https://via.placeholder.com/150';

  const speakers = eventDetail?.speakers || [];

  const facilities = eventDetail?.facilities || [];

  const location = eventDetail?.location || 'Location not specified';
  const latitude = eventDetail?.latitude || 'Location not specified';
  const longitude = eventDetail?.longitude || 'Location not specified';

  const totalClasses = eventDetail?.total_no_class || '0';

  const callPerWeek = eventDetail?.call_per_week || 0;

  const curriculum = eventDetail?.curriculum || [];

  const documents = eventDetail?.documents || [];

  const images = eventDetail?.images || [];
  const description =
    eventDetail?.description?.replace(/<[^>]*>?/gm, '') ||
    'Default description here';
  const fullText = eventDetail?.description || 'Default description here';
  const startDate = eventDetail?.start_date || 'Date not available';
  const {datePart, timePart} =
    startDate !== 'Date not available'
      ? (() => {
          const date = new Date(startDate);
          // Format: dd Month yyyy
          const monthName = date.toLocaleString('en-US', {month: 'short'});
          const datePart = `${String(date.getDate()).padStart(
            2,
            '0',
          )} ${monthName} ${date.getFullYear()}`;
          // Format: Tues, 10:30 am
          const options = {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          };
          const timePart = date
            .toLocaleString('en-US', options)
            .replace(',', '');
          return {datePart, timePart};
        })()
      : {datePart: 'Date not available', timePart: 'Time not available'};
  const inputRef = useRef(null);

  const groupedNotes = useMemo(() => {
    return Object.keys(notesData).map(date => ({
      date,
      data: notesData[date],
    }));
  }, [notesData]);

  const handleNotePress = useCallback(note => {
    setSelectedNote(note);
    setEditedContent(note.content);
    setIsModalVisible(true);
  }, []);

  const [isNewNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const handleCreateNewNote = useCallback(() => {
    setNewNoteModalVisible(true);
  }, []);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchEventById(bookingId));
    }
  }, [dispatch, bookingId]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', {month: 'short'}); // Aug
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Function to format time as "Tues, 10:30 am"
  const formatEndDate = dateString => {
    if (!dateString) return 'Date not available';

    const date = new Date(dateString);
    const options = {weekday: 'short'}; // e.g., Tues
    const timeOptions = {hour: '2-digit', minute: '2-digit', hour12: true}; // e.g., 10:30 am

    const day = date.toLocaleDateString('en-US', options); // "Tues"
    const time = date.toLocaleTimeString('en-US', timeOptions); // "10:30 am"

    return `${day}, ${time}`;
  };
  const formattedStartDate = formatDate(startDate);
  const formattedTime = formatEndDate(eventDetail?.end_date);

  // const formattedTime = formatTime(startDate, endDate);


  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      return result === RESULTS.GRANTED;
    }
    // iOS doesn't require storage permission for RNFS
    return true;
  };

  
  const handleSaveNewNote = useCallback(() => {
    if (newNoteTitle && newNoteContent) {
      const newNote = {
        id: Date.now(),
        title: newNoteTitle,
        content: newNoteContent,
        time: new Date().toLocaleTimeString(),
      };
      navigation.navigate('NotesScreen', {newNote});
      setNewNoteModalVisible(false);
      setNewNoteContent('');
      setNewNoteTitle('');
    }
  }, [newNoteTitle, newNoteContent, navigation]);

  const MINIMUM_LINES = 2;
  const region = {
    latitude: 24.774265,
    longitude: 46.738586,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  // const fullText =
  //   'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in voluptaQuis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea com modo consequat. Duis aute irure dolor in reprehenderit in volupta.';

  const toggleExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleNotesListVisibility = useCallback(() => {
    setNotesListVisible(prevState => !prevState);
  }, []);

  const handleNotesUpdate = (updatedNotes: any) => {
    setNotesData(updatedNotes);
  };

  const closeModal = useCallback(() => {
    setNewNoteModalVisible(false);
  }, []);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const handleRightPress = () => {
    setNotesListVisible(prevState => !prevState);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // navigation.navigate('HomeScreen');
  };


  const downloadContent = async () => {
    try {
      // Define the file path
      const filePath = RNFS.DownloadDirectoryPath + '/Ticket_Info.txt'; // Save the file as .txt or change to other formats like .pdf

      // Content you want to save to the file
      const content = `
        Participant ID: ${bookingId}
        QR Code: ${qrcode}
                User ID: ${user_id}

      `;

      // Save the content to the file
      await RNFS.writeFile(filePath, content, 'utf8');

      // Set toast message for successful download
      const message: any = `Your ticket has been saved at: ${filePath}`;
      setToastMessage(message); // Update toast message state

      // Close the modal after download
      setIsModalVisible(false);
    } catch (error) {
      ;
      setToastMessage('Failed to download content.');
    }
  };


  // const _renderItem1 = ({item}) => (
  //   <View style={styles.carouselItem}>
  //     <ImageBackground source={item.image} style={styles.carouselImage}>
  //       <View style={styles.touchableLabelContainer}></View>
  //       <View style={styles.paginationContainer}>
  //         <View style={styles.paginationSubContainer}>
  //           <Text style={styles.indexText}>{`${activeSlide + 1} / ${
  //             eventDetailData.length
  //           }`}</Text>
  //         </View>
  //         <Pagination
  //           dotsLength={eventDetailData.length}
  //           activeDotIndex={activeSlide}
  //           containerStyle={styles.pagination}
  //           dotStyle={styles.activeDot}
  //           inactiveDotStyle={styles.inactiveDot}
  //           inactiveDotOpacity={0.4}
  //           inactiveDotScale={0.6}
  //           animatedFriction={10}
  //           animatedTension={200}
  //           tappableDots={false}
  //         />
  //       </View>
  //     </ImageBackground>
  //   </View>
  // );
  const carouselData = images.map((image: any) => image?.full_screen_image);
  const category_image = eventDetail?.category_image;
  const category_title = eventDetail?.category_title;
  const _renderItem1 = ({item, index}) => (
    <View style={styles.carouselItem} key={item.id}>
      <ImageBackground
        // source={{uri: item?.primary_image}}
        source={{uri: item}}
        style={styles.carouselImage}
        resizeMode="cover">
        {/* Pagination Section */}
        <View style={styles.paginationContainer}>
          <View style={styles.paginationSubContainer}>
            <Text style={styles.indexText}>
              {activeSlide + 1} / {eventsSort1?.events?.length}
            </Text>
          </View>
          <Pagination
            dotsLength={eventsSort1?.events?.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.pagination}
            dotStyle={styles.activeDot}
            inactiveDotStyle={styles.inactiveDot}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            animatedFriction={10}
            animatedTension={200}
            tappableDots={false}
          />
        </View>
      </ImageBackground>
    </View>
  );

  const handleSwipeComplete = () => {};

  const toggleCourseDetails = useCallback(() => {
    setIsCourseExpanded(prev => !prev);
  }, []);

  const toggleRulesDetails = useCallback(() => {
    setIsRulesExpanded(prev => !prev);
  }, []);

  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity onPress={() => handleNotePress(item)}>
        <View style={styles.subContainer}>
          <View style={styles.notesContainer}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.notesHeading}>{item.title}</Text>
              <Text style={styles.notesTime}>{item.time}</Text>
            </View>
            <View>
              <Text style={styles.notesContent}>{item.content}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleNotePress],
  );

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DB3171" />
      </View>
    );
  }

  if (!eventDetail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No event details available.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom, paddingTop: Math.max(insets.top - heightScale(20), 0)},
      ]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          statusBarColor="#F9F6FD"
          rightImageSource={require('../../assets/images/edit.png')}
          secondRightImageSource={require('../../assets/images/dots-vertical.png')}
          containerStyle={{
            paddingVertical: heightScale(12),
            paddingTop: 26,
          }}
          leftIconName="chevron-left"
          onLeftPress={() => navigation.goBack()}
          rightImageStyle={styles.containerImage}
          secondRightImageStyle={styles.containerImageEdit}
          title={t('BookingDetails.BookingDetailsHeading')}
          titleStyle={styles.headerTitle}
          onRightPress={() => toggleNotesListVisibility()}
        />
        <View style={styles.bookingContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.tabButton,
              activeTab === 'active' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('active')}>
            <Text
              style={
                activeTab === 'active' ? styles.activeText : styles.inactiveText
              }>
              Event details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.tabButton,
              activeTab === 'completed' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('completed')}>
            <Text
              style={
                activeTab === 'completed'
                  ? styles.activeText
                  : styles.inactiveText
              }>
              Event Material
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'active' ? (
          <View style={styles.carouselContainer}>
            <Carousel
              ref={firstCarouselRef}
              // data={eventsSort1?.events}
              data={carouselData}
              renderItem={_renderItem1}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              inactiveSlideScale={0.8}
              inactiveSlideOpacity={0.7}
              pagingEnabled={true}
              pinchGestureEnabled={true}
              onSnapToItem={index => {
                setActiveSlide(index);
              }}
              useScrollView={true}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              removeClippedSubviews={false}
              activeSlideAlignment="center"
              layout="default"
              windowSize={5}
              maxToRenderPerBatch={5}
              swipeThreshold={5}
              enableSnap={true}
              enableMomentum={false}
            />
          </View>
        ) : null}

        {activeTab === 'active' ? (
          <View style={styles.detailsContainer}>
            <TouchableLabel
              label={'Confirmed'}
              onPress={() => {}}
              containerStyle={styles.customLableCarouselSecondaryContainer}
              labelStyle={styles.customLableSecondaryCarousel}
            />

            <TouchableLabel
              labelSecondary={'4th Session'}
              label={'70%'}
              onPress={() => {}}
              containerStyle={styles.customSessionCompleteContainer}
              labelStyle={styles.customLableSecondaryCarousel}
              leftImage={require('../../assets/images/check-circle.png')}
              labelSecondaryStyle={[
                styles.customLableSecondaryCarousel,
                {left: 4},
              ]}
            />
            {/* <View style={{flexDirection: 'row', gap: 4, paddingTop: 12}}>
              <View style={styles.imageTouchableContainer}>
                <Image
                  source={require('../../assets/images/Events.png')}
                  resizeMode="contain"
                  style={styles.eventImage}
                />
              </View>

              {tags?.map(tag => (
                <TouchableLabel
                  key={tag.id}
                  label={tag.title}
                  onPress={() => {}}
                  containerStyle={styles.newEventContainer}
                  labelStyle={styles.customTagsLabel}
                />
              ))}
            </View> */}
            <View style={{flexDirection: 'row', gap: 4,marginTop:8}}>
              <View style={styles.imageTouchableContainer}>
                <Image
                  source={{uri: category_image}}
                  resizeMode="contain"
                  style={styles.eventImage}
                />
              </View>

              <TouchableLabel
                label={category_title}
                onPress={() => {}}
                containerStyle={styles.categoryTitleContainer}
                labelStyle={styles.customLableCarouselTags}
              />

              {tags?.map(tag => (
                <TouchableLabel
                  key={tag.id}
                  label={tag.title}
                  onPress={() => {}}
                  containerStyle={styles.fillingFastContainer}
                  labelStyle={styles.customLableCarousel}
                />
              ))}
            </View>
            <View style={styles.eventNameContainer}>
              <Text style={styles.eventName}>{title}</Text>
            </View>
            <View style={styles.dateContainer}>
              <View style={styles.dateSubContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/calendar.png')}
                />
                <Text style={styles.carouselDate}>{datePart}</Text>
              </View>
              <View style={styles.dateSubContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/clock.png')}
                />
                <Text style={styles.carouselDate}>{timePart}</Text>
              </View>
            </View>
            {!journey_level_id ? (
              <View style={styles.journeyLevelContainer}>
                <Text style={styles.journeyPreferLabel}>
                  Preferred Journey Level
                </Text>
                <View style={styles.advanceImageContainer}>
                  <Image source={require('../../assets/images/advanced.png')} />
                  <Text style={styles.journeyLevelLabel}>Advanced</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.requestViewContainer}>
              <TouchableLabel
                label={'REQUEST BUDDY'}
                onPress={() => {}}
                labelStyle={styles.requestLabel}
                containerStyle={styles.requestBtnContainer}
                leftImage={require('../../assets/images/request.png')}
                leftImageStyle={{height: 24, width: 24}}
              />
              {/* {qrcode?.length > 0 ? ( */}
                <TouchableLabel
                  labelStyle={styles.ticketLabel}
                  containerStyle={styles.ticketBtnContainer}
                  label={'VIEW TICKET'}
                  onPress={openModal}
                  leftImage={require('../../assets/images/ticket.png')}
                  leftImageStyle={{height: 24, width: 24}}
                />
              {/* ) : null} */}
            </View>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.organizeContainer}>
              <Text style={styles.organizedText}>Organized by:</Text>
              <View
                style={{
                  paddingLeft: widthScale(12),
                  flexDirection: 'row',
                  gap: widthScale(8),
                  alignItems: 'center',
                }}>
                {/* Check if organizer exists */}
                {eventDetail?.organizer ? (
                  <>
                    {/* Dynamically load the organizer's logo */}
                    <Image
                      resizeMode="contain"
                      source={{
                        uri:
                          eventDetail?.organizer?.logo ||
                          'https://cdn-icons-png.flaticon.com/128/5075/5075957.png',
                      }}
                      style={{
                        width: widthScale(40),
                        height: widthScale(40),
                        borderRadius: widthScale(20),
                      }}
                    />

                    <View>
                      {/* Display organizer's name */}
                      <Text style={styles.organizername}>
                        {eventDetail?.organizer.name || 'Unknown Organizer'}
                      </Text>

                      {/* Display event count */}
                      <Text style={styles.eventCounts}>
                        {eventDetail?.organizer.event_count > 1
                          ? `${eventDetail?.organizer.event_count} more courses`
                          : `${eventDetail?.organizer.event_count} course available`}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>
                    No organizer details available
                  </Text>
                )}
                <View style={styles.infoBtnContainer}>
                  <LinearGradient
                    colors={['#DB3171', '#FFCC33']}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.gradientBorder}>
                    <TouchableLabel
                      label={'VIEW INFO'}
                      onPress={() => {}}
                      containerStyle={styles.viewallContainer}
                      labelStyle={styles.viewallLabel}
                    />
                  </LinearGradient>
                </View>
              </View>
            </View>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.aboutEventConatiner}>
              <Text style={styles.organizedText}>About event</Text>
              <Text
                style={styles.organizedText}
                numberOfLines={isExpanded ? undefined : MINIMUM_LINES}>
                {description}
              </Text>
              <TouchableOpacity activeOpacity={0.6} onPress={toggleExpansion}>
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {speakers.length > 0 && activeTab === 'active' && (
          // <View style={styles.speakerContainer}>
          //   <Text style={styles.speakerText}>Speakers</Text>
          //   <View style={styles.rowContainer}>
          //     {speakers.map((speaker, index) => (
          //       <View key={index} style={styles.speakerImageContainer}>
          //         <Image
          //           style={styles.speakerImage}
          //           source={{uri: speaker.profile_image}}
          //         />
          //         <Text style={styles.speakerName}>
          //           {`${speaker.first_name} ${speaker.last_name}`}
          //         </Text>
          //       </View>
          //     ))}
          //   </View>
          // </View>
          <View style={styles.speakerContainer}>
            <Text style={styles.speakerText}>Speakers</Text>
            <View style={styles.rowContainer}>
              {speakers?.map((speaker, index) => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => handlePress('SpeakerScreen')}
                  // onPress={() => {
                  //   navigation.navigate('SpeakerScreen');
                  // }}
                  key={index}
                  style={styles.speakerImageContainer}>
                  <Image
                    style={styles.speakerImage}
                    source={
                      speaker?.profile_image
                        ? {uri: speaker?.profile_image}
                        : require('../../assets/images/user1.png')
                    }
                    resizeMode="cover"
                  />
                  <Text style={styles.speakerName}>
                    {speaker?.first_name} {speaker?.last_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'active' && curriculum?.length > 0 && (
          <View style={styles.courseContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={toggleCourseDetails}
              style={styles.courseDropdownContainer}>
              <Text style={styles.breakdownText}>Course Breakdown</Text>
              <Image
                resizeMode="contain"
                source={require('../../assets/images/dropup.png')}
              />
            </TouchableOpacity>
            {isCourseExpanded && (
              <View>
                {curriculum.length > 0 ? (
                  curriculum.map((item, index) => (
                    <View key={item.id}>
                      {/* Course Item */}
                      <View style={styles.courseItems}>
                        <Image
                          resizeMode="contain"
                          source={require('../../assets/images/course.png')}
                        />
                        <Text style={styles.classNumber}>
                          Class {index + 1}
                        </Text>
                      </View>
                      {/* Course Details */}
                      <View style={styles.classDetailTxtContainer}>
                        {/* Rendering the HTML description content as text */}
                        <Text style={styles.classHeading}>
                          {
                            item.description
                              .replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
                              .split('\n')[0]
                          }{' '}
                          {/* Extracting the first line as heading */}
                        </Text>
                        <Text style={styles.classDescription}>
                          {item.description.replace(/(<([^>]+)>)/gi, '')}{' '}
                          {/* Removing HTML tags */}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  // Fallback message when curriculum is empty
                  <Text style={styles.noDataText}>Nothing to show</Text>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'active' && itineraries?.length > 0 && (
          <View style={styles.rulesContainer}>
            {/* Rules and Eligibility Section */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={toggleRulesDetails}
              style={styles.courseDropdownContainer}>
              <Text style={styles.breakdownText}>Itineraries</Text>
              <Image
                resizeMode="contain"
                source={require('../../assets/images/dropup.png')}
              />
            </TouchableOpacity>

            {isRulesExpanded && (
              <View>
                {/* Itineraries Section */}
                <View>
                  <Text style={styles.classNumber}>Itinerary Details</Text>
                  {itineraries.map(item => (
                    <View key={item.id} style={styles.itineraryContainer}>
                      <View style={styles.courseItems}>
                        <Image
                          resizeMode="contain"
                          source={require('../../assets/images/course.png')}
                        />
                        <Text style={styles.classNumber}>Day {item.day}</Text>
                      </View>
                      <View style={styles.itineraryDetailTxtContainer}>
                        {/* Itinerary Title */}
                        <Text style={styles.classHeading}>{item.title}</Text>

                        {/* Itinerary Timing */}
                        <Text style={styles.classDescription}>
                          {`Start Time: ${item.start_time}`}
                        </Text>
                        <Text style={styles.classDescription}>
                          {`End Time: ${item.end_time}`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'active' ? (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Event location</Text>
            <View style={styles.locationSubContainer}>
            <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
              <View>
              <Image source={require('../../assets/images/marker-pin.png')} />

              </View>
              <View style={{paddingRight:52}}>
              <Text style={styles.addressText}>{location}</Text>

              </View>
              </View>
             <View>
             <TouchableOpacity
                activeOpacity={0.7}
                style={styles.shareImageContainer}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/share-01.png')}
                />
              </TouchableOpacity>
             </View>
            </View>
            <View style={styles.maps}>
              <MapView
                style={styles.map}
                region={region}
                mapType="standard"
                showsUserLocation={true}
                loadingEnabled={true}>
                <Marker
                  coordinate={{
                    latitude: 24.774265,
                    longitude: 46.738586,
                  }}>
                  <Image
                    source={require('../../assets/images/Subtract.png')}
                    style={styles.marker}
                    resizeMode="contain"
                  />
                </Marker>
              </MapView>
            </View>
            <View
              style={{
                marginTop: 17,
                paddingBottom: 28,
              }}>
              <AnimatedSwipe
                swipeThreshold={widthScale(300)}
                onSwipeComplete={handleSwipeComplete}
              />
            </View>
          </View>
        ) : null}
        <>
          <CustomModal
            isVisible={isModalVisible}
            onClose={handleModalClose}
            containerStyle={{
              backgroundColor: '#FAF5FF',
              borderTopRightRadius: 28,
              borderTopLeftRadius: 28,
              borderRadius: 0,
              width: '100%',
              marginHorizontal: 0,
              overflow: 'visible',
            }}
            backdropColor="#000000"
            closeOnBackdropPress={true}>
            <View
              style={{
                borderBottomWidth: 2,
                borderStyle: 'dashed',
              }}>
              <View style={{marginTop: 18}}>
                <Text style={styles.ticketNumberLabel}>Ticket No. 89289</Text>
                <Text style={styles.ticketHeading}>{title}</Text>
              </View>
              <View
                style={{
                  marginTop: 19,
                  padding: 12,
                  flexDirection: 'row',
                  gap: 24,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: 34,
                }}>
                <View style={styles.eventDateContainer}>
                  <Text style={styles.eventDateTime}>Event Start Date</Text>
                  <View style={styles.dateSubContainer}>
                    <Image
                      resizeMode="contain"
                      source={require('../../assets/images/calendar.png')}
                    />
                    <Text style={styles.tickeTimeLabel}>
                      {formattedStartDate}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 32,
                    width: 1,
                    backgroundColor: '#000000',
                  }}
                />

                <View style={styles.eventDateContainer}>
                  <Text style={styles.eventDateTime}>Event End Time</Text>
                  <View style={styles.dateSubContainer}>
                    <Image
                      resizeMode="contain"
                      source={require('../../assets/images/clock.png')}
                    />
                    <Text style={styles.tickeTimeLabel}>{formattedTime}</Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  height: 35,
                  width: 35,
                  top: 52,
                  right: 18,
                  backgroundColor: '#333233',
                  borderRadius: 34,
                  zIndex: 11,
                }}></View>
              <View
                style={{
                  height: 35,
                  width: 35,
                  top: 18,
                  left: Dimensions.get('screen').width * 0.958,
                  backgroundColor: '#333233',
                  borderRadius: 34,
                  zIndex: 11,
                }}></View>
            </View>
            <View style={{backgroundColor: '#FFE289', paddingBottom: 20}}>
              <View
                style={{
                  marginTop: heightScale(18),
                  paddingLeft: widthScale(71),
                  paddingRight: widthScale(60),
                  alignItems: 'center',
                }}>
                <Text style={styles.venueLabel}>Venue Details</Text>
                <View style={{alignItems: 'center', paddingTop: 14}}>
                  {/* <Text style={styles.venueAddressLabel}>
                  Behind Venkateshwara Theatre 2
                </Text> */}
                  <Text style={styles.venueAddressLabel}>{location} </Text>
                </View>
                <View
                  style={{
                    marginTop: heightScale(20),
                    alignItems: 'center',
                    gap: 6,
                  }}>
                  <QRCode
                    value={qrcode}
                    size={210}
                    backgroundColor="white"
                    color="black"
                  />
                  <Text style={styles.amountLabel}>
                    Amount : £{price} (Paid))
                  </Text>
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 8,
                      marginTop: heightScale(43),
                    }}>
                    <TouchableLabel
                      label={'DOWNLOAD'}
                      onPress={()=>{
                        downloadContent()
                      }}
                      containerStyle={{
                        backgroundColor: '#FFF9E9',
                        paddingHorizontal: widthScale(24),
                        gap: 8,
                        height: heightScale(44),
                        borderRadius: 90,
                      }}
                      leftImage={require('../../assets/images/download-ticket.png')}
                      leftImageStyle={{height: 24, width: 24}}
                    />
                    <TouchableLabel
                      labelStyle={styles.ticketLabel}
                      containerStyle={{
                        backgroundColor: '#1E1E1F',
                        paddingHorizontal: widthScale(24),
                        gap: 8,
                        height: heightScale(44),
                        borderRadius: 90,
                      }}
                      label={'BACK'}
                      onPress={handleModalClose}
                      // onPress={() => {}}
                      leftImage={require('../../assets/images/wallet.png')}
                      leftImageStyle={{height: 24, width: 24}}
                    />
                  </View>
                </View>
              </View>
            </View>
          </CustomModal>
        </>
        {activeTab !== 'active' ? (
          <View
            style={{
              marginTop: heightScale(16),
              paddingHorizontal: widthScale(24),
            }}>
            <View>
              <Text
                style={{
                  fontSize: fontScale(12),
                  fontWeight: '600',
                  color: '#0E0D0E',
                }}>
                My Notes
              </Text>
              <View
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#E2E2E2',
                  gap: 8,
                  padding: 16,
                  borderRadius: 20,
                }}>
                <View>
                  <View style={{flexDirection: 'row', gap: 8}}>
                    <TouchableLabel
                      onPress={handleCreateNewNote}
                      containerStyle={{
                        backgroundColor: '#FFE8F1',
                        borderRadius: 32,
                        padding: 4,
                        height: 32,
                        width: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      labelStyle={{}}
                      leftImage={require('../../assets/images/edit.png')}
                      leftImageStyle={{
                        right: 0,
                      }}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: fontScale(12),
                          fontWeight: '500',
                          color: '#000000',
                        }}>
                        You have 3 notes
                      </Text>
                      <Text
                        style={{
                          fontSize: fontScale(12),
                          fontWeight: '400',
                          color: '#3A3A3A',
                        }}>
                        Open to view and edit notes
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('NotesScreen');
                      }}
                      activeOpacity={0.7}>
                      <Image
                        source={require('../../assets/images/rightArrow.png')}
                        style={styles.arrowImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={{marginTop: 24}}>
              <Text
                style={{
                  fontSize: fontScale(12),
                  fontWeight: '600',
                  color: '#0E0D0E',
                }}>
                Study material
              </Text>
              <Text
                style={{
                  fontSize: fontScale(12),
                  fontWeight: '400',
                  color: '#545454',
                }}>
                material provided by the organizer
              </Text>
              <View
                style={{
                  marginTop: 12,
                  padding: 16,
                  gap: 8,
                  borderWidth: 1,
                  borderColor: '#E2E2E2',
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    fontSize: fontScale(12),
                    fontWeight: '500',
                    color: '#545454',
                  }}>
                  Info
                </Text>
                <Text
                  numberOfLines={3}
                  style={{
                    fontSize: fontScale(12),
                    fontWeight: '400',
                    color: '#545454',
                  }}>
                  Quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                  ea com modo consequat. Duis aute irure dolor in reprehenderit
                  in volupta Quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea com modo consequat. Duis aute irure dolor in
                  reprehenderit in volupta
                </Text>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E2',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    gap: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View>
                    <Text
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontSize: fontScale(12),
                      }}>
                      Event Brochure.pdf
                    </Text>
                    <Text
                      style={{
                        color: '#3A3A3A',
                        fontSize: fontScale(12),
                        fontWeight: '400',
                      }}>
                      2.5mb
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Image
                      source={require('../../assets/images/download.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E2',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    gap: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View>
                    <Text
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontSize: fontScale(12),
                      }}>
                      Event Brochure.pdf
                    </Text>
                    <Text
                      style={{
                        color: '#3A3A3A',
                        fontSize: fontScale(12),
                        fontWeight: '400',
                      }}>
                      2.5mb
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Image
                      source={require('../../assets/images/download.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E2E2E2',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    gap: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View>
                    <Text
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontSize: fontScale(12),
                      }}>
                      Event Brochure.pdf
                    </Text>
                    <Text
                      style={{
                        color: '#3A3A3A',
                        fontSize: fontScale(12),
                        fontWeight: '400',
                      }}>
                      2.5mb
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                    <Image
                      source={require('../../assets/images/download.png')}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{marginTop: 24, paddingBottom: 46}}>
              <Text
                style={{
                  fontSize: fontScale(12),
                  fontWeight: '600',
                  color: '#0E0D0E',
                }}>
                Asked Questions
              </Text>
              <Text
                style={{
                  fontSize: fontScale(12),
                  fontWeight: '400',
                  color: '#545454',
                }}>
                Questions asked by you
              </Text>
              <View
                style={{
                  marginTop: 12,
                  padding: 16,
                  gap: 8,
                  borderWidth: 1,
                  borderColor: '#E2E2E2',
                  borderRadius: 20,
                }}>
                <View
                  style={{
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: '#DFD7C0',
                    paddingVertical: 4,
                    // paddingHorizontal: 12,
                    flexDirection: 'row',
                    // justifyContent: 'space-between',
                    alignItems: 'center',
                    height: heightScale(50),
                    paddingRight: 40,
                    paddingLeft: 20,
                  }}>
                  <View>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontSize: fontScale(12),
                        marginRight: 18,
                      }}>
                      Quis nostrud exercitation ullamco labor Quis nostrud
                      exercitation ullamco labor Quis nostrud exercitation
                      ullamco labor Quis nostrud exercitation ullamco labor
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('FaqScreen');
                    }}
                    activeOpacity={0.7}>
                    <Image
                      source={require('../../assets/images/rightArrow.png')}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: '#DFD7C0',
                    paddingVertical: 4,
                    paddingRight: 40,
                    paddingLeft: 20,
                    flexDirection: 'row',
                    // justifyContent: 'space-between',
                    alignItems: 'center',
                    height: heightScale(50),
                  }}>
                  <View>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontSize: fontScale(12),
                        marginRight: 18,
                      }}>
                      Quis nostrud exercitation ullamco labor Quis nostrud
                      exercitation ullamco labor Quis nostrud exercitation
                      ullamco labor Quis nostrud exercitation ullamco labor
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('FaqScreen');
                    }}
                    activeOpacity={0.7}>
                    <Image
                      source={require('../../assets/images/rightArrow.png')}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <CustomModal
          onClose={closeModal}
          containerStyle={[
            styles.modalContainer,
            {marginTop: insets.top + 325},
          ]}
          modalStyle={{backgroundColor: 'transparent'}}
          isVisible={isNewNoteModalVisible}>
          <View style={styles.modalHeaderContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={closeModal}
              style={styles.modalHeaderSubContainer}>
              <Icon name={'chevron-left'} size={24} color="#000000" />
              <Text style={styles.backLabel}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveNewNote}>
              <Text style={styles.doneLabel}>Save note</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedHeading}>{selectedNote?.title}</Text>
          <View style={{paddingHorizontal: widthScale(24)}}>
            <TextInput
              placeholder="Title / heading"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              style={styles.inputTextsTitle}
            />
            <TextInput
              placeholder="Paragraph"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              style={styles.inputTexts}
            />
          </View>
        </CustomModal>
      </ScrollView>
    </View>
  );
};

export default BookingDetails;
