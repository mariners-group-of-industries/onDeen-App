import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StatusBar, Platform } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const ImageViewerScreen = ({ route, navigation }) => {
  const { images, initialIndex } = route.params;
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    // Fully transparent status bar
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    if (Platform.OS == 'android') {
      StatusBar.setBackgroundColor('transparent', true);
    }

    return () => {
      // Reset when leaving
      StatusBar.setBarStyle('dark-content', true);
      if (Platform.OS == 'android') {
        StatusBar.setBackgroundColor('#ffffff', true); // or your default
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Fullscreen Image Viewer */}
      <ImageViewing
        images={images.map((img) => ({ uri: img }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => {
          setVisible(false);
          navigation.goBack();
        }}
        onImageIndexChange={setCurrentIndex}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setVisible(false);
          navigation.goBack();
        }}
      >
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      {/* Index Display */}
      {visible && (
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ImageViewerScreen;
