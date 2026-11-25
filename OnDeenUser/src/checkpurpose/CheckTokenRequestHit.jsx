import { View, Text, Alert } from 'react-native';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

export default function CheckTokenRequestHit() {
  useEffect(() => {
    // 🔔 Foreground notification listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('Foreground Notification Received', JSON.stringify(remoteMessage.notification));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // 🔔 Background notification handler (runs only outside the component)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
    });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>CheckTokenRequestHit</Text>
      <Text style={{ marginTop: 10 }}>
        Listening for foreground and background FCM notifications...
      </Text>
    </View>
  );
}
