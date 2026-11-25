import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapMarker = ({ data }) => {
  if (!data) return null; 

  return (
    <MapView
      style={styles.map}
      region={{
        latitude: data.lat,
        longitude: data.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
      onRegionChangeComplete={(region) => console.log('Region Changed:', region)}
    >
      <Marker coordinate={{ latitude: data.lat, longitude: data.lng }} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});

export default MapMarker;
