import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import styles from './styles';
import BuddyIcon from '../../../src/assets/svg/buddy.svg';
import TicketIcon from '../../../src/assets/svg/ticket.svg';
import TouchableLabel from '../../components/customLabels';
import RequestBuddyConfirmation from './RequestBuddyConfirmation';

export default function ViewTicketRequestBuddy({
  handleRequestBuddy,
  openModal,
  eventDetail,
}) {
  // key trick: use eventDetail?.request_buddy directly in state
  const [isDisabled, setIsDisabled] = useState(eventDetail?.request_buddy === 1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // every time eventDetail changes, update isDisabled
  useEffect(() => {
    setIsDisabled(eventDetail?.request_buddy === 1);
  }, [eventDetail]);

  const totalTickets = eventDetail?.participants?.reduce((sum, participant) => {
    const quantity = Number(
      participant?.quantity
      ?? participant?.ticket_quantity
      ?? participant?.total_quantity
      ?? 0
    );
    return sum + (Number.isFinite(quantity) ? quantity : 0);
  }, 0) || 0;

  const eventlabel1 = `You have ${totalTickets} ticket${totalTickets > 1 ? 's' : ''}\nVIEW TICKET${totalTickets > 1 ? 'S' : ''}`;
  const eventlabel2 = `EVENT LINK`;

  const handleBuddyPress = () => {
    if (!isDisabled) {
      setIsModalVisible(true);
    }
  };

  return (
    <View>
      <View style={styles.requestViewContainer}>
        <TouchableLabel
          label={isDisabled ? 'REQUESTED' : 'REQUEST BUDDY'}
          onPress={handleBuddyPress}
          labelStyle={styles.requestLabel}
          containerStyle={styles.requestBtnContainer}
          leftImage={<BuddyIcon />}
          leftImageStyle={{ height: 24, width: 24, right: 8 }}
        />

        <TouchableLabel
          labelStyle={styles.ticketLabel}
          containerStyle={styles.ticketBtnContainer}
          label={Number(eventDetail?.location_type) === 0 ? eventlabel2 : eventlabel1}
          onPress={openModal}
          leftImage={<TicketIcon />}
          leftImageStyle={{ height: 24, width: 24, right: 8 }}
        />
      </View>

      <RequestBuddyConfirmation
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        onRequest={handleRequestBuddy}
      />
    </View>
  );
}
