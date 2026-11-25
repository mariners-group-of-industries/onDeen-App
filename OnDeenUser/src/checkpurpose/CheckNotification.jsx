import React, { useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

export default function CheckNotification() {
  useEffect(() => {
    requestPermission();
  }, []);

  async function requestPermission() {
    await notifee.requestPermission();
  }

  async function displaySimpleNotification() {
    await notifee.displayNotification({
      title: '🔔 Simple Notification',
      body: 'This is a basic notification',
      android: {
        channelId: await getChannelId(),
      },
    });
  }

  async function displayBigTextNotification() {
    await notifee.displayNotification({
      title: '📝 Big Text',
      body: 'Tap to read more...',
      android: {
        channelId: await getChannelId(),
        style: {
          type: AndroidStyle.BIGTEXT,
          text: 'This is an expanded notification. You can add a lot more content here to show on expansion.',
        },
      },
    });
  }

  async function displayImageNotification() {
    await notifee.displayNotification({
      title: '🖼️ Image Notification',
      body: 'Here’s a notification with an image!',
      android: {
        channelId: await getChannelId(),
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: 'https://placekitten.com/600/300',
        },
      },
    });
  }

  async function getChannelId() {
    return await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>📲 Check Notifications</Text>
      <Button title="Simple Notification" onPress={displaySimpleNotification} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Big Text Notification" onPress={displayBigTextNotification} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Image Notification" onPress={displayImageNotification} />
    </View>
  );
}
