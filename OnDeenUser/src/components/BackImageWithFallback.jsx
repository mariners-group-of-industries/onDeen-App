import React, { useState } from 'react';
import { Image, ActivityIndicator, View, StyleSheet } from 'react-native';
import Fallback from '../assets/svg/fallback.png';

const BackImageWithFallback = ({ imageurl, style, resizeMode = 'cover' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  return (
    <View style={[style, styles.container]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#422199" />
        </View>
      )}
      <Image
        source={error ? Fallback : { uri: imageurl }}
        style={[
          style,
          { display: loading ? 'none' : 'flex' },
          error && styles.fallbackImage
        ]}
        resizeMode={resizeMode}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:30
  },
  loadingContainer: {
    position: 'absolute',
  },
  fallbackImage: {
    tintColor: '#ddd', // Optional: style your fallback image
  },
});

export default BackImageWithFallback;