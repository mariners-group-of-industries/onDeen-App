import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAP_KEY } from '../helpers/Constant';
import MapMarker from './MapMarker';
import GradientButton from './gradientButton';
import { useNavigation } from '@react-navigation/native';

const CustomeMapView = ({ route }) => {
  const {
    mobile_number,
    country_code,
    cca2,
    latitude,
    longitude,
    address,
    update,
  } = route.params || {};

  const navigation = useNavigation();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [manualAddress, setManualAddress] = useState(address || '');
  const [latlong, setLatlong] = useState({ lat: latitude || 51.5074, lng: longitude || -0.1278 });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (latitude && longitude && address) {
      setLatlong({ lat: latitude, lng: longitude });
      setSelectedPlace({
        address: address,
        formatted_address: address,
      });
      setManualAddress(address);
    }
  }, [latitude, longitude, address]);

  const setManualPlace = () => {
    const nextAddress = manualAddress.trim();

    if (!nextAddress) {
      return null;
    }

    const place = {
      address: nextAddress,
      formatted_address: nextAddress,
    };

    setSelectedPlace(place);
    return place;
  };

  const saveandcontinue = () => {
    const place = selectedPlace || setManualPlace();

    if (!place) {
      setErrorMessage('Please enter an address to continue.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    navigation.navigate('CreateAccount', {
      mobile_number,
      country_code,
      cca2,
      latitude: latlong?.lat,
      longitude: latlong?.lng,
      address: place.address,
      update: update,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails={true}
          onPress={(data, details = null) => {
            const place = {
              address: data.description,
              formatted_address: data.description,
            };
            setSelectedPlace(place);
            setManualAddress(data.description);

            if (details?.geometry?.location) {
              const lat = details.geometry.location.lat;
              const lng = details.geometry.location.lng;
              setLatlong({ lat, lng });
            }
          }}
          query={{
            key: GOOGLE_MAP_KEY,
            language: 'en',
          }}
          onFail={(error) => console.error(error)}
          styles={{
            textInput: styles.textInput,
            container: styles.inputContainer,
            powered: styles.powered,
            description: styles.description,
            textInputContainer: styles.textInputContainer,

          }}
          defaultValue={selectedPlace?.address || ''}
          textInputProps={{
            placeholderTextColor:  '#888',
            onChangeText: text => {
              setManualAddress(text);
              if (selectedPlace?.address !== text) {
                setSelectedPlace(null);
              }
            },
            onSubmitEditing: setManualPlace,
            onBlur: () => {
              if (!selectedPlace) {
                setManualPlace();
              }
            },
          }}
        />

        {selectedPlace && (
          <View style={styles.selectedPlaceContainer}>
            <Text style={styles.selectedPlaceText}>
              Selected Place: {selectedPlace.address}
            </Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.mapContainer}>
          <MapMarker data={latlong} />
          <View style={styles.buttonContainer}>
            <GradientButton
              onPress={saveandcontinue}
              title="Save & Continue"
              textStyle={styles.customButtonText}
              disabled={!selectedPlace && !manualAddress.trim()}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingBottom: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 50,
    color: '#161616',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    borderRadius: 25,
    paddingLeft: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    color: 'black',
  },
  inputContainer: {
    width: '90%',
    color: '#161616',
  },
  powered: {
    display: 'none',
  },
  description: {
    fontSize: 14,
    fontWeight: 400,
    color: 'black',
  },
  selectedPlaceContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  selectedPlaceText: {
    fontSize: 16,
    color: 'black',
  },
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
  },
  errorMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    backgroundColor: 'transparent',
    width: '90%',
    height: 400,
    borderRadius: 30,
    margin: 20,
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    margin: 20,
    borderRadius: 30,
  },
  textInputContainer: {
    color: '#161616',
  }
});

export default CustomeMapView;
