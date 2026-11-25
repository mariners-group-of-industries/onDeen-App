import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Dimensions, StyleSheet } from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';

export default function ViewMap({ locationDetails }) {
    const [region, setRegion] = useState({
        latitude: 24.774265,
        longitude: 46.738586,
        latitudeDelta: 0.09, 
        longitudeDelta: 0.09,
    });

    useEffect(() => {
        setRegion({
            latitude: locationDetails?.latitude,
            longitude: locationDetails?.longitude,
            latitudeDelta: region?.latitudeDelta || 0.005,
            longitudeDelta: region?.longitudeDelta || 0.005,
        })
        
        
    }, [locationDetails])

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                    mapType="standard"
                    showsUserLocation={true}
                    loadingEnabled={true}
                    scrollEnabled={true} // Disable scrolling
                    zoomEnabled={true} 
                >
                    {/* <Marker
                        coordinate={{
                            latitude: region?.latitude || 24.774265,
                            longitude: region?.longitude || 46.738586,
                        }}
                    >
                        <Image
                            source={require('../assets/images/Subtract.png')}
                            style={styles.marker}
                            resizeMode="contain"
                        />
                    </Marker> */}
                </MapView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F6FD',
    },
    mapContainer: {
        width: '100%', 
        height: heightScale(300),
        borderRadius: widthScale(24),
        overflow: 'hidden', 
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    marker: {
        width: widthScale(30),
        height: heightScale(30),
        resizeMode: 'contain',
    },
});
