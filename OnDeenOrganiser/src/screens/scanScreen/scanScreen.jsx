import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, RefreshControl, ScrollView } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ScanScreen() {
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTicket, setScannedTicket] = useState(null); // State to store the scanned ticket
  const [scannedToken, setScannedToken] = useState(null); // State to store the scanned token
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [tokendata, setTokendata] = useState(false); // State for pull-to-refresh
  const [data, setData] = useState(false); // State for pull-to-refresh

  // Predefined valid tickets for demonstration (Replace with your actual validation logic)
  const validTickets = new Set(['ticket1', 'ticket2', 'ticket3']);

  // Function that handles QR code scan success
  const onSuccess = (e) => {
    const scannedData = e.data;
    setTokendata(JSON.stringify(e))
    setData(scannedData)
    ;

    // if (!scannedData) {
    //   Alert.alert('Invalid Data', 'No data found in the QR code.');
    //   return;
    // }

    // Vibration.vibrate(); // Vibrate the device on scan success

    // // Assuming QR code data is in the format: "ticket:ticketValue|token:tokenValue"
    // const [ticketData, tokenData] = scannedData.split('|');

    // if (!ticketData || !tokenData) {
    //   Alert.alert('Invalid Data', 'QR code is not in the expected format.');
    //   return;
    // }

    // const ticket = ticketData.split(':')[1];
    // const token = tokenData.split(':')[1];

    // // Check if the scanned ticket is valid
    // if (validTickets.has(ticket)) {
    //   setScannedTicket(ticket); // Update scanned ticket state
    //   setScannedToken(token); // Update scanned token state
    //   Alert.alert('Access Granted', `Ticket ${ticket} is valid.`); // Display success message
    // } else {
    //   Alert.alert('Access Denied', 'Invalid Ticket.'); // Display invalid ticket message
    // }

    // Hide scanner after scanning
    setIsScanning(false);
  };

  // Function to toggle the flash mode
  const handleToggleFlash = () => {
    setFlashMode(
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.torch
        : RNCamera.Constants.FlashMode.off
    );
  };

  // Function to handle pull-to-refresh
  const hitApiToGetDataFilter = () => {
    setRefreshing(true);

    // Simulate an API call or any async operation
    setTimeout(() => {
      setRefreshing(false); // Stop refreshing after the operation
      // You can place your data fetching logic here
    }, 2000);
  };

  // Function to stop scanning
  const handleStopScanning = () => {
    setIsScanning(false); // Set scanning state to false
  };
  ;

  return (
    <View style={styles.container}>
      {/* Button to start scanning */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {setIsScanning(true); setData(null)}} // Set scanning state to true
      >
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>
      {
        data &&
        <TouchableOpacity style={[styles.scanButton, {backgroundColor:'green'}]}   >
          <Text>{data}</Text>
        </TouchableOpacity>
      }



      {/* Show QRCodeScanner only if isScanning is true */}
      {isScanning && (
        <QRCodeScanner
          onRead={onSuccess} // Callback function when QR code is successfully scanned
          cameraProps={{ flashMode }} // Pass the current flash mode to the camera
          topContent={
            <Text style={styles.titleText}>
              Scan Your QR Code
            </Text>
          }
          bottomContent={
            <View style={styles.bottomContent}>
              <Text style={styles.instructionText}>
                Hold the QR code within the frame to scan
              </Text>
              {/* Button to toggle flash on/off */}
              <TouchableOpacity onPress={handleToggleFlash} style={styles.flashButton}>
                <Icon
                  name={flashMode === RNCamera.Constants.FlashMode.off ? "flash-off" : "flash-on"}
                  size={30}
                  color="#fff"
                />
                <Text style={styles.flashButtonText}>
                  {flashMode === RNCamera.Constants.FlashMode.off ? "Turn Flash On" : "Turn Flash Off"}
                </Text>
              </TouchableOpacity>

              {/* Button to stop scanning */}
              <TouchableOpacity onPress={handleStopScanning} style={styles.stopScanButton}>
                <Text style={styles.stopScanButtonText}>Stop Scanning</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Display scanned ticket and token if available */}
      {scannedTicket && scannedToken && (
        <ScrollView
          style={styles.scannedInfo}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={hitApiToGetDataFilter} />}
        >
          <Text style={styles.scannedText}>Scanned Ticket: {scannedTicket}</Text>
          <Text style={styles.scannedText}>Scanned Token: {scannedToken}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
  },
  scanButton: {
    backgroundColor: '#ff5722',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  titleText: {
    fontSize: 24,
    padding: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    padding: 16,
    color: '#ddd',
    textAlign: 'center',
  },
  bottomContent: {
    alignItems: 'center',
  },
  flashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#ff5722',
    padding: 10,
    borderRadius: 5,
  },
  flashButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#fff',
  },
  stopScanButton: {
    marginTop: 20,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  stopScanButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  scannedInfo: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  scannedText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
});
