const fs = require('fs');
const path = require('path');

const read = relativePath =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('guest booking confirmation handoff', () => {
  it('carries the public event payload into the confirmation screen', () => {
    const source = read('src/screens/GuestBooking/GuestBookingScreen.jsx');

    expect(source).toContain("navigation.navigate('PaymentConfirmationScreen', {");
    expect(source).toContain('data: confirmationData?.booking || confirmationData');
    expect(source).toContain('eventDetail,');
    expect(source).toContain('Guest sessions have no bearer token');
    expect(source).toContain('payment_order_key: paymentOrderKey');
    expect(source).toContain('tickets: [{ id: selectedTicket.id, quantity: 1 }]');
    expect(source).toContain('No guest tickets are currently available');
    expect(source).not.toContain('status: 1, payment_intent_id');
  });

  it('renders guest confirmation metadata without an authenticated participant refetch', () => {
    const source = read('src/screens/PaymentConfirmation/PaymentConfirmation.jsx');

    expect(source).toContain('const initialEventDetail = route?.params?.eventDetail || null;');
    expect(source).toContain('const isGuestBooking = Boolean(data?.guest_booking);');
    expect(source).toContain('if (initialEventDetail || isGuestBooking)');
    expect(source).toContain('data?.participants?.[0]?.participant_id');
  });

  it('recovers an already-confirmed authenticated payment without reopening PaymentSheet', () => {
    const source = read('src/screens/PaymentsScreen/PaymentsScreen.jsx');

    expect(source).toContain('if (reponsedata?.confirmed)');
    expect(source).toContain('await AsyncStorage.removeItem(PENDING_PAYMENT_KEY)');
    expect(source).toContain('data: reponsedata?.booking || reponsedata');
  });
});
