import React, {useState} from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

const BuddyTask = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const task = route.params?.task || {};
  const [message, setMessage] = useState('');
  const name = [task.user_first_name, task.user_last_name].filter(Boolean).join(' ') || 'User';
  const phone = [task.country_code, task.user_mobile].filter(Boolean).join(' ');

  const contactUser = async () => {
    if (!task.whatsapp_url) {
      setMessage('WhatsApp contact is not available for this request.');
      return;
    }
    try {
      await Linking.openURL(task.whatsapp_url);
      setMessage('WhatsApp link opened.');
    } catch {
      setMessage('Unable to open WhatsApp on this device.');
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Buddy tasks" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹  Buddy tasks</Text>
        </Pressable>
        <Text style={styles.eyebrow}>ASSIGNED SUPPORT</Text>
        <Text style={styles.title}>{task.event_title || 'Assigned listing'}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>REQUESTING USER</Text>
          <Text style={styles.name}>{name}</Text>
          {!!phone && <Text style={styles.meta}>{phone}</Text>}
          <Text style={styles.meta}>This request is assigned to your Buddy account.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Contact User on WhatsApp"
          onPress={contactUser}
          style={styles.primaryButton}>
          <Text style={styles.primaryText}>Contact User on WhatsApp</Text>
        </Pressable>
        {!!message && <Text accessibilityRole="status" style={styles.status}>{message}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan QR for this assigned listing"
          onPress={() => navigation.navigate('BuddyScanner', {eventId: task.event_id, roleType: 5})}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Scan QR for this listing</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {backgroundColor: '#FDFBFF', flex: 1},
  content: {padding: 24, paddingBottom: 48},
  back: {color: '#461477', fontSize: 16, fontWeight: '700', marginBottom: 32},
  eyebrow: {color: '#6C6572', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  title: {color: '#17121C', fontSize: 28, fontWeight: '800', marginTop: 7},
  card: {backgroundColor: '#F1E8FA', borderRadius: 20, marginTop: 24, padding: 20},
  label: {color: '#6C6572', fontSize: 11, fontWeight: '800', letterSpacing: 1},
  name: {color: '#17121C', fontSize: 22, fontWeight: '800', marginTop: 9},
  meta: {color: '#514B58', fontSize: 15, lineHeight: 21, marginTop: 8},
  primaryButton: {alignItems: 'center', backgroundColor: '#461477', borderRadius: 28, marginTop: 24, padding: 16},
  primaryText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
  secondaryButton: {alignItems: 'center', borderColor: '#461477', borderRadius: 28, borderWidth: 1, marginTop: 14, padding: 15},
  secondaryText: {color: '#461477', fontSize: 16, fontWeight: '800'},
  status: {color: '#3F7426', fontSize: 14, marginTop: 12, textAlign: 'center'},
});

export default BuddyTask;
