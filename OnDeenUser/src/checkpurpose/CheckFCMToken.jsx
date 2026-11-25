import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export default function CheckFCMToken() {
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    getFcmToken();
  }, []);

  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
    } catch (error) {

    }
  };


  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>FCM Token:</Text>
      <Text selectable style={{ marginTop: 10, color: 'blue' }}>
        {fcmToken || 'Loading...'}
      </Text>
    </ScrollView>
  );
}
