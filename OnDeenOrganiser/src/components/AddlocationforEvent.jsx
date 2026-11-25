import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAP_KEY } from '../helpers/Constant';
import MapMarker from './MapMarker';
import GradientButton from './gradientButton';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddLocationforEvent = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { latitude, longitude, address, id } = route.params || {};

  const navigation = useNavigation();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [manualAddress, setManualAddress] = useState(address || '');
  const [latlong, setLatlong] = useState({ lat: latitude || 51.5074, lng: longitude || -0.1278 });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (latitude && longitude && address) {
      setLatlong({ lat: latitude || 0.00, lng: longitude || 0.00 });
      setSelectedPlace({
        address: address,
        formatted_address: address,
      });
      setManualAddress(address);
    }
  }, [latitude, longitude, address]);

  const saveandcontinue = () => {
    const nextAddress = selectedPlace?.address || manualAddress.trim();
    if (!nextAddress) {
      setErrorMessage('Please enter an address to continue.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    navigation.navigate('CreateEvent', {
      latitude: latlong?.lat,
      longitude: latlong?.lng,
      address: nextAddress,
      id: id
    });
  };

  const movetoEventDetailsPage = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Icon onPress={() => movetoEventDetailsPage()} name={'chevron-left'} size={24} color="#000" />
          <Text onPress={() => movetoEventDetailsPage()} style={styles.title}>Add Location</Text>
        </View>

        <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails={true}
          onPress={(data, details = null) => {
            const nextAddress = data.description || data.structured_formatting?.main_text || manualAddress;
            setSelectedPlace({
              address: nextAddress,
              formatted_address: nextAddress,
            });
            if (details?.geometry?.location) {
              const lat = details.geometry.location.lat;
              const lng = details.geometry.location.lng;
              setLatlong({ lat, lng });
            }
            setManualAddress(nextAddress);
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
            value: manualAddress,
            onChangeText: (text) => {
              setManualAddress(text);
              setSelectedPlace(null);
              if (errorMessage) {
                setErrorMessage('');
              }
            },
          }}
        />

        {(selectedPlace || manualAddress.trim()) && (
          <View style={styles.selectedPlaceContainer}>
            <Text style={styles.selectedPlaceText}>
              Selected Place: {selectedPlace?.address || manualAddress.trim()}
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
    paddingTop: 0,
    paddingBottom: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // marginBottom: 50,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: widthScale(16),
    width: '100%',
    paddingBottom: 20,
  },
  title: {
    fontSize: fontScale(18),
    fontWeight: '600',
    color: '#000',
    fontSize: fontScale(16),
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
  },
  powered: {
    display: 'none',
  },
  description: {
    fontSize: 14,
    fontWeight: 400,
    color: 'black',
    elevation: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
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
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddLocationforEvent;
