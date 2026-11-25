import { View, Text, Linking, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

export default function EventDeepLink() {
  const [eventData, setEventData] = useState({
    rawUrl: '',
    eventId: '',
    isVerified: false,
    timestamp: ''
  });

  // Verify event ID format (customize this for your actual validation logic)
  const verifyEventId = (id) => {
    return /^[A-Za-z0-9]{16,}$/.test(id); // Example: At least 16 alphanumeric chars
  };

  useEffect(() => {
    const handleUrl = (url) => {
      if (!url) return;

      // Extract the last path segment as event ID
      const pathSegments = url.split('/');
      const extractedId = pathSegments[pathSegments.length - 1].split('?')[0];
      
      setEventData({
        rawUrl: url,
        eventId: extractedId,
        isVerified: verifyEventId(extractedId),
        timestamp: new Date().toLocaleString()
      });
    };

    // Check initial URL on app launch
    Linking.getInitialURL().then(handleUrl);

    // Listen for incoming URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Event Link Details</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>URL:</Text>
        <Text style={styles.value}>{eventData.rawUrl || 'None'}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Event ID:</Text>
        <Text style={[styles.value, eventData.isVerified && styles.validId]}>
          {eventData.eventId || 'Not detected'}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>
          {eventData.isVerified ? '✅ Verified' : '❌ Unverified'}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Received:</Text>
        <Text style={styles.value}>{eventData.timestamp || 'Never'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2c3e50'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center'
  },
  label: {
    width: 100,
    fontWeight: '600',
    color: '#7f8c8d'
  },
  value: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#34495e'
  },
  validId: {
    color: '#27ae60',
    fontWeight: 'bold'
  }
});