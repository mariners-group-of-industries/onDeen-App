import { View, StyleSheet, Text } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Colormarkerpin from '../../../assets/svg/colormarkerpin.svg';
import { fontFamilies } from '../../../assets/themes/fonts';

// standard: Default street map view.
// satellite: Satellite imagery with no street names.
// hybrid: Satellite imagery with street names and labels.
// terrain: Map with physical features like mountains and water bodies.

export default function LocationMap({ eventbyid }) {
  const latitude = Number(eventbyid?.latitude);
  const longitude = Number(eventbyid?.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
  const mapReadyRef = useRef(false);
  const [showFallback, setShowFallback] = useState(!hasCoordinates);
  const [region, setRegion] = useState({
    latitude: hasCoordinates ? latitude : 37.78825,
    longitude: hasCoordinates ? longitude : -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    mapReadyRef.current = false;
    setShowFallback(!hasCoordinates);

    if (hasCoordinates) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const fallbackTimer = setTimeout(() => {
        if (!mapReadyRef.current) {
          setShowFallback(true);
        }
      }, 3500);

      return () => clearTimeout(fallbackTimer);
    }
  }, [hasCoordinates, latitude, longitude]);

  if (showFallback) {
    return (
      <View style={[styles.container, styles.fallbackContainer]}>
        <Text style={styles.fallbackTitle}>Map preview unavailable</Text>
        <Text style={styles.fallbackText}>
          {eventbyid?.location ? `Location: ${eventbyid.location}` : 'No precise location was provided for this event.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        mapType="hybrid"
        showsUserLocation={true}
        loadingEnabled={false}
        onMapReady={() => {
          mapReadyRef.current = true;
          setShowFallback(false);
        }}
        onError={() => setShowFallback(true)}>
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}>
          <Colormarkerpin />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 200,
    borderRadius: 20, // Apply border radius to container
    overflow: 'hidden', // Ensure content is clipped within the rounded corners
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackContainer: {
    backgroundColor: '#F9F6FD',
    paddingHorizontal: 24,
  },
  fallbackTitle: {
    color: '#17101F',
    fontSize: 15,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    marginBottom: 6,
  },
  fallbackText: {
    color: '#545454',
    fontSize: 13,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    textAlign: 'center',
    lineHeight: 18,
  },

});
