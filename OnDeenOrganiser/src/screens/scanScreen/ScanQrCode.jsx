import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Animated, Platform, Settings } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import QRVerificationScreen from './QRVerificationScreen';
import FlashMode from '../../assets/svg/flecelight.svg';
import { useDispatch } from 'react-redux';
import { updateattendanceAPI } from '../../redux/slices/updateattendanceSlice';
import Slider from '@react-native-community/slider';
import { useRoute } from '@react-navigation/native';

export default function ScanQrCode() {
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [isScanning, setIsScanning] = useState(true);
  const [data, setData] = useState('');
  const [apiresponce, setApiresponce] = useState('');
  const [message, setMessage] = useState(''); 
  const [zoom, setZoom] = useState(0); 
  const dispatch = useDispatch();
  const route = useRoute();
  const buddyMode = Number(route.params?.roleType) === 5;
  // iOS Simulator has no injectable camera feed. XCUITest may provide one QR
  // payload through NSUserDefaults; without that explicit launch argument this
  // path is completely inert and the production camera flow is unchanged.
  const proofScanData = Platform.OS === 'ios' ? Settings.get('ondeenQrProofData') : null;
  const proofEventId = Platform.OS === 'ios' ? Settings.get('ondeenQrProofEventId') : null;
  const assignedEventId = route.params?.eventId ?? proofEventId;
  const injectedProofScan = useRef(false);
  const animationValue = useState(new Animated.Value(0))[0]; 

  const onSuccess = (e) => {
    setData(e.data);
    setIsScanning(false);
  };

  const handleToggleFlash = () => {
    setFlashMode(
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.torch
        : RNCamera.Constants.FlashMode.off
    );
  };

  useEffect(() => {
    if (data) {
      fetchData(data);
    } else {
      startScanAnimation();
    }
  }, [data]);

  useEffect(() => {
    if (
      injectedProofScan.current ||
      typeof proofScanData !== 'string' ||
      proofScanData.trim().length === 0
    ) return;
    injectedProofScan.current = true;
    const timer = setTimeout(() => onSuccess({data: proofScanData}), 1500);
    return () => clearTimeout(timer);
  }, [proofScanData]);

  const fetchData = async (scanData) => {
    try {
      const action = await dispatch(updateattendanceAPI(
        buddyMode || assignedEventId
          ? {
              qrcode: scanData,
              event_id: assignedEventId,
              roleType: buddyMode ? 5 : 3,
            }
          : scanData,
      ));
      const payload = action?.payload || action;
      const payloadMessage = typeof payload === 'string'
        ? payload
        : payload?.response?.message;
      setApiresponce(typeof payload === 'object' ? payload : {status: false});
      setMessage(
        payloadMessage ||
          (payload?.status === true ? 'Attendance marked successfully.' : 'Unable to verify this QR code.'),
      );
    } catch (error) {
      setApiresponce({status: false});
      setMessage('Error occurred while updating attendance.');
    }
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const scanBoxTranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 300], // Move scan line up and down
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#282c34" />

      {!isScanning && data && (
        <QRVerificationScreen
          data={data}
          message={message}
          apiresponce={apiresponce}
          resetScan={() => {
            setData('');
            setApiresponce(null);
            setMessage('');
            setIsScanning(true);
          }}
        />
      )}

      {isScanning && (
        <QRCodeScanner
          onRead={onSuccess}
          cameraProps={{ flashMode, zoom }}
          bottomContent={
            <View style={styles.bottomContent}>
              <TouchableOpacity onPress={handleToggleFlash}>
                <FlashMode />
              </TouchableOpacity>
            </View>
          }
          containerStyle={styles.qrCodeScannerContainer}
          cameraStyle={styles.cameraStyle}
          cameraContainerStyle={styles.cameraContainerStyle}
          topViewStyle={styles.topViewStyle}
          showMarker={false}
          bottomViewStyle={styles.bottomViewStyle}
        />
      )}

      {/* Animated Scanning View */}
      {isScanning && (
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanBoxTranslateY }] }]}
        />
      )}

      {/* Zoom Slider */}
      {isScanning && (
        <View style={styles.zoomContainer}>
          <Slider
            style={styles.zoomSlider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={zoom}
            onValueChange={(value) => setZoom(value)}
          />
        </View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
    width: '100%',
    height: '100%',
  },
  statusContainer: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 5,
    top: 20,
    left: 10,
    right: 10,
    padding: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  successText: {
    color: 'green',
  },
  failedText: {
    color: 'red',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  bottomContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeScannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topViewStyle: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 5,
  },
  bottomViewStyle: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  scanLine: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    height: 2,
    backgroundColor: '#00FF00',
    opacity: 0.8,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  zoomText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  zoomSlider: {
    width: 300,
    height: 40,
  },
});
