import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { usePlatformPay, PlatformPayButton, PlatformPay } from '@stripe/stripe-react-native'; // Import PlatformPay
import { PAYMENTKEY } from '../helpers/Constant';

export default function CheckGooglePay() {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(null);
  
  const {
    isPlatformPaySupported,
    confirmPlatformPayPayment,
  } = usePlatformPay();

  useEffect(() => {
    checkGooglePaySupport();
  }, []);

  const checkGooglePaySupport = async () => {
    try {
      const isSupported = await isPlatformPaySupported({ 
        googlePay: { testEnv: true } 
      });
      setSupported(isSupported);
    } catch (error) {
      console.error('Error checking Google Pay support:', error);
      setSupported(false);
    }
  };

  // Mock function for testing - replace with actual server call
  const createTestPaymentIntent = async () => {
    try {
      setLoading(true);
      // For testing purposes, return a mock client secret
      // In production, call your actual server endpoint
      const mockClientSecret = PAYMENTKEY;
      setClientSecret(mockClientSecret);
      return mockClientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      Alert.alert('Error', 'Failed to create payment intent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePayPress = async () => {
    if (!supported) {
      Alert.alert('Not Supported', 'Google Pay is not supported on this device');
      return;
    }

    let secret = clientSecret;
    if (!secret) {
      secret = await createTestPaymentIntent();
      if (!secret) return;
    }

    try {
      const { error, paymentIntent } = await confirmPlatformPayPayment(
        secret,
        {
          googlePay: {
            testEnv: true, // Set to false for production
            merchantName: 'Test Merchant',
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full, // Use the imported PlatformPay
              isPhoneNumberRequired: false,
              isRequired: false,
            },
          },
        }
      );

      if (error) {
        Alert.alert('Payment Failed', error.message);
        console.error('Payment error:', error);
      } else {
        Alert.alert('Success', 'Payment was successful!');
        console.log('Payment successful:', paymentIntent);
      }
    } catch (error) {
      console.error('Google Pay error:', error);
      Alert.alert('Error', 'Something went wrong with Google Pay');
    }
  };

  if (supported === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Checking Google Pay support...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Pay Test</Text>
      
      <Text style={styles.status}>
        Google Pay Supported: {supported ? '✅ Yes' : '❌ No'}
      </Text>

      {!supported ? (
        <Text style={styles.instruction}>
          Make sure:
          {"\n"}• You're on a real Android device
          {"\n"}• Google Pay app is installed
          {"\n"}• You have cards added to Google Wallet
          {"\n"}• Device is in a supported country
        </Text>
      ) : (
        <>
          <PlatformPayButton
            type={PlatformPay.ButtonType.Pay} // Use the imported PlatformPay
            onPress={handleGooglePayPress}
            style={styles.payButton}
            disabled={loading}
          />
          {loading && <ActivityIndicator style={styles.loader} />}
          <Text style={styles.instruction}>
            Click the button to test Google Pay integration
          </Text>
          <Text style={styles.note}>
            Note: This is a test component. For real payments, you need to set up a server endpoint.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  payButton: {
    width: '100%',
    height: 50,
    marginVertical: 20,
  },
  loader: {
    marginTop: 10,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});