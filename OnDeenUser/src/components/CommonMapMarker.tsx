// import React from 'react';
// import { Linking, StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { heightScale, widthScale } from '../helpers/scale';

// const CommonMapMarker = ({ data = { latitude: '0.000', longitude: '0.000' } }) => {
//     if (!data || !data?.latitude || !data?.longitude) return null;

//     const openGoogleMaps = () => {
//         const lat = parseFloat(data.latitude);
//         const lng = parseFloat(data.longitude);
//         const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`; // ✅ Works across all platforms

//         Linking.openURL(url).catch(err => console.error('Error opening map:', err));
//     };

//     return (
//         <MapView
//             style={styles.map}
//             mapType="standard"
//             showsUserLocation={true}
//             loadingEnabled={true}
//             showsMyLocationButton
//             provider={PROVIDER_GOOGLE}
//             toolbarEnabled={true}
//             onPress={openGoogleMaps} // ✅ Opens Google Maps when tapping anywhere on the map
//             region={{
//                 latitude: parseFloat(data?.latitude), 
//                 longitude: parseFloat(data?.longitude), 
//                 latitudeDelta: 0.0922,
//                 longitudeDelta: 0.0421,
//             }}
//             onRegionChangeComplete={(region) => console.log('Region Changed:', region)}
//         >
//             <Marker coordinate={{ latitude: parseFloat(data?.latitude), longitude: parseFloat(data?.longitude) }} />
//         </MapView>
//     );
// };

// const styles = StyleSheet.create({
//     map: {
//         ...StyleSheet.absoluteFillObject,
//         borderRadius: widthScale(24),
//     },
// });

// export default CommonMapMarker;

import React, { useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { widthScale } from '../helpers/scale';
import Subtract from '../assets/svg/Subtract.svg';
import { GOOGLE_MAP_KEY } from '../helpers/Constant';
import { fontFamilies } from '../assets/fonts/fonts';

type Props = {
  data: {
    latitude: string;
    longitude: string;
  };
};

const CommonMapMarker: React.FC<Props> = ({ data }) => {
  const [staticMapFailed, setStaticMapFailed] = useState(false);

  if (!data?.latitude || !data?.longitude) return null;

  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);


  if (isNaN(lat) || isNaN(lng)) return null; // extra safety check

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(err => console.error('Failed to open map:', err));
  };

  if (Platform.OS === 'ios') {
    const coordinate = encodeURIComponent(`${lat},${lng}`);
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinate}&zoom=14&size=640x360&scale=2&markers=color:red%7C${coordinate}&key=${GOOGLE_MAP_KEY}`;

    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open map at ${lat.toFixed(4)}, ${lng.toFixed(4)}`}
        style={styles.map}
        onPress={openGoogleMaps}>
        {staticMapFailed ? (
          <View style={styles.mapFallback}>
            <Subtract />
            <Text style={styles.mapFallbackTitle}>Open map</Text>
            <Text style={styles.mapFallbackText}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: staticMapUrl }}
            style={styles.staticMapImage}
            resizeMode="cover"
            onError={() => setStaticMapFailed(true)}
          />
        )}
      </Pressable>
    );
  }

  return (
    <MapView
      accessibilityLabel={`Interactive map at ${lat.toFixed(4)}, ${lng.toFixed(4)}`}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.map}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05, // Adjust zoom level for better visibility
        longitudeDelta: 0.05,
      }}
      loadingEnabled
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={true}
      zoomEnabled={true}
      zoomControlEnabled={true}
      scrollEnabled={true}
      pitchEnabled={false}
      rotateEnabled={false}
      onPress={openGoogleMaps}
    >
      <Marker
        coordinate={{
          latitude: lat,
          longitude: lng,
        }}
        onPress={openGoogleMaps}
        tracksViewChanges={false}
      >
        <Subtract />
        </Marker>
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: widthScale(24),
    overflow: 'hidden',
    backgroundColor: '#F0EDF4',
  },
  staticMapImage: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    alignItems: 'center',
    backgroundColor: '#F0EDF4',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  mapFallbackTitle: {
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    fontSize: 16,
    marginTop: 10,
  },
  mapFallbackText: {
    color: '#6A6272',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: 13,
    marginTop: 4,
  },
});

export default CommonMapMarker;
