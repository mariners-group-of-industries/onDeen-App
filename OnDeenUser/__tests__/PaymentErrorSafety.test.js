const fs = require('fs');
const path = require('path');

const paymentScreen = fs.readFileSync(
  path.join(__dirname, '..', 'src/screens/PaymentsScreen/PaymentsScreen.jsx'),
  'utf8',
);

describe('payment failure UX safety', () => {
  it('keeps platform-pay capability failures out of the React Native red error overlay', () => {
    expect(paymentScreen).not.toContain("console.error('Error checking platform payment support:'");
    expect(paymentScreen).toContain('setGooglePaySupported(false);');
    expect(paymentScreen).toContain('setApplePaySupported(false);');
  });

  it('surfaces recoverable card failures through the in-app toast', () => {
    expect(paymentScreen).toContain("showToast('Failed to initialize payment');");
    expect(paymentScreen).toContain('showToast(`Payment failed: ${error.message}`);');
    expect(paymentScreen).toContain("showToast('Payment processing failed');");
  });
});
