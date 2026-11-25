import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Platform,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from '../../components/toastMessage';
import styles from './styles';
import { heightScale } from '../../helpers/scale';
import TouchableLabel from '../../components/customLabels';
import GradientButton from '../../components/gradientButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentBg from '../../../src/assets/svg/PaymentBg.svg';
import { useStatusBar } from '../../components/statusbar';
import ShowTicketModel from './ShowTicketModel';
import { eventbyIdAPI } from '../../redux/callapis/CommonService';
import AddToCalendar from '../SecondEventDetailsPage/AddtoCalender';

const PaymentConfirmationScreen = ({ route }) => {
  const { data } = route?.params || {};
  const initialEventDetail = route?.params?.eventDetail || null;
  const isGuestBooking = Boolean(data?.guest_booking);
  const navigation = useNavigation();
  const [toastMessage, setToastMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventDetail, setEventDetail] = useState(initialEventDetail || []);
  const [isLoading, setIsLoading] = useState(!initialEventDetail); // Add loading state
  const calendarRef = useRef();

  const hitapitogetdatafilter = async () => {
    try {
      setIsLoading(true); // Start loading
      const res = await eventbyIdAPI(data?.event_id, data?.participants?.[0]?.participant_id);
      setEventDetail(res?.response || []);
    } catch (error) {
      setToastMessage('Failed to load ticket details');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    // Guest bookings already carry the public event payload. Re-fetching the
    // protected participant detail endpoint here has no authenticated user
    // session and leaves the confirmation screen without calendar metadata.
    // Keep the original fetch for signed-in bookings, but use the payload
    // supplied by the guest flow directly.
    if (initialEventDetail || isGuestBooking) {
      setIsLoading(false);
      return;
    }
    if (data?.event_id) {
      hitapitogetdatafilter();
    }
  }, [data?.event_id, data?.participants, initialEventDetail, isGuestBooking]);

  useStatusBar({ backgroundColor: '#FFE493', barStyle: 'dark-content' });

  const goHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainNavigator',
          params: { screen: 'Home' },
        },
      ],
    });
  }, [navigation]);
  
  useEffect(() => {
    const handleBackPress = () => {
      goHome();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      backHandler.remove();
    };
  }, [goHome]);

  useFocusEffect(
    useCallback(() => {
      setIsModalVisible(false);
    }, [])
  );

  const openModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const openCalendar = () => {
    calendarRef.current?.openModel();
  };

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={[styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: heightScale(150) }}>
          <LinearGradient
            colors={['#FFE493', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <PaymentBg style={{ marginTop: 20 }} />
          </LinearGradient>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: heightScale(58),
            }}>
            <Text style={styles.greetings}>Congratulations</Text>
            <Text style={styles.greetingsMessage}>
              YOUR TICKET IS {'\n'} BOOKED
            </Text>
          </View>
          
          {/* Conditional rendering based on loading state */}
          {isLoading ? <></> : (
            <View style={styles.buttonsContainer}>
              <View style={styles.buttonsSubContainer}>
                <View>
                  <LinearGradient
                    colors={['#DB3171', '#FFCC33']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientBorder}>
                    <TouchableLabel
                      label={'ADD TO CALENDAR'}
                      onPress={openCalendar}
                      containerStyle={styles.viewallContainer}
                      labelStyle={styles.viewallLabel}
                    />
                  </LinearGradient>
                </View>
                <View style={styles.primaryActionsRow}>
                  <GradientButton
                    containerStyle={styles.bookBtnContainer}
                    onPress={openModal}
                    title={'VIEW E-TICKET'}
                    colors={['#DB3171', '#FFCC33']}
                    start={{ x: 0.9, y: 0 }}
                    end={{ x: 0.1, y: 1 }}
                    textStyle={[styles.viewallLabel, { color: '#FFFFFF' }]}
                  />
                  <GradientButton
                    containerStyle={styles.homeBtnContainer}
                    onPress={goHome}
                    title={'HOME'}
                    colors={['#FFCC33', '#DB3171']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    textStyle={[styles.viewallLabel, { color: '#FFFFFF' }]}
                  />
                </View>
              </View>
            </View>
          )}

          <ShowTicketModel
            isVisible={isModalVisible}
            onClose={() => { setIsModalVisible(false) }}
            ticketData={data}
            eventDetail={eventDetail}
          />
          <AddToCalendar eventDetail={eventDetail} ref={calendarRef} />
        </View>
        <Toast message={toastMessage} />
      </ScrollView>
    </ContainerComponent>
  );
};



export default PaymentConfirmationScreen;
