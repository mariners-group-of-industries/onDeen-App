import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
} from 'react-native';
import MapView from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import DeviceInfo from 'react-native-device-info';
import GradientButton from '../../components/gradientButton';
import { GOOGLE_MAP_KEY } from '../../helpers/Constant';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import LatestHeader from '../../components/LatestHeader';
import { fontFamilies } from '../../assets/fonts/fonts';
import Subtract from '../../../src/assets/svg/Subtract.svg';
import { useFilter } from '../../context/FilterContext';

const IOS_SIMULATOR_LOCATION = {
  lat: 51.5074,
  lng: -0.1278,
  address: 'London',
};

const UpdateLocation = ({ route }) => {
  const { setFilter1, hithomepageapi, setHithomepageapi } = useFilter();
  const { latitude, longitude, address } = route.params || {};
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isIOSSimulator, setIsIOSSimulator] = useState(Platform.OS === 'ios' ? null : false);
  const [latlong, setLatlong] = useState({
    lat: latitude || IOS_SIMULATOR_LOCATION.lat,
    lng: longitude || IOS_SIMULATOR_LOCATION.lng,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    let mounted = true;
    DeviceInfo.isEmulator().then((isEmulator) => {
      if (mounted) {
        setIsIOSSimulator(isEmulator);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setLatlong({ lat: latitude, lng: longitude });
      if (address) {
        setSelectedPlace({ address });
        setSearchQuery(address);
      } else {
        fetchAddress(latitude, longitude);
      }
    }
  }, [latitude, longitude, address]);

  useEffect(() => {
    if (latitude || longitude || Platform.OS !== 'ios') {
      return;
    }

    let mounted = true;
    DeviceInfo.isEmulator().then((isEmulator) => {
      if (!mounted) {
        return;
      }
      setIsIOSSimulator(isEmulator);
      if (!isEmulator) {
        return;
      }
      setLatlong({ lat: IOS_SIMULATOR_LOCATION.lat, lng: IOS_SIMULATOR_LOCATION.lng });
      setSelectedPlace({
        address: IOS_SIMULATOR_LOCATION.address,
        details: {
          address_components: [
            {
              long_name: IOS_SIMULATOR_LOCATION.address,
              types: ['locality'],
            },
          ],
        },
      });
      setSearchQuery(IOS_SIMULATOR_LOCATION.address);
    });

    return () => {
      mounted = false;
    };
  }, [latitude, longitude]);

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: GOOGLE_MAP_KEY,
            language: 'en',
          },
        },
      );
      if (res.data?.results?.length > 0) {
        const fetchedAddress = res?.data?.results[0].formatted_address;
        setSelectedPlace({
          address: fetchedAddress,
          details: res?.data?.results[0],
        });
        setSearchQuery(fetchedAddress);
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
  };

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,
            key: GOOGLE_MAP_KEY,
            language: 'en',
          },
        },
      );
      setSearchResults(response?.data?.predictions || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectPlace = async (placeId) => {
    try {
      Keyboard.dismiss();

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAP_KEY,
            language: 'en',
          },
        },
      );
      const details = response?.data?.result;

      setSelectedPlace({
        address: details?.formatted_address,
        details,
      });
      setLatlong({
        lat: details?.geometry?.location.lat,
        lng: details?.geometry?.location.lng,
      });

      mapRef.current?.animateToRegion(
        {
          latitude: details?.geometry?.location.lat,
          longitude: details?.geometry?.location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );

      setSearchQuery(details?.formatted_address);
      setSearchResults([]);
    } catch (error) {
      console.error("Error selecting place:", error);
    }
  };

  const handleMapMove = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: GOOGLE_MAP_KEY,
            language: 'en',
          },
        },
      );
      if (response?.data?.results?.length > 0) {
        const address = response?.data?.results[0].formatted_address;
        setSelectedPlace({
          address: address || 'No address found',
          details: response?.data?.results[0],
        });
        setSearchQuery(address);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const getCityName = (details) => {
    if (!details?.address_components) return '';
    for (let component of details.address_components) {
      if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
        return component.long_name;
      }
    }
    return '';
  };

  const saveAndContinue = () => {
    if (!selectedPlace) {
      setErrorMessage('Please select an address to continue.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const cityName = getCityName(selectedPlace.details);
    const finalCity = cityName || selectedPlace.address || '';
    setFilter1('latitude', latlong?.lat || latitude);
    setFilter1('longitude', latlong?.lng || longitude);
    setFilter1('address', finalCity);
    setHithomepageapi(hithomepageapi + 1);
    navigation.navigate('MainNavigator', {
      screen: 'Home',
      params: {
        latitude: latlong?.lat,
        longitude: latlong?.lng,
        address: finalCity,
      },
    });
  };

  const ContainerComponent = SafeAreaView;
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latlong?.lat},${latlong?.lng}&zoom=15&size=640x640&scale=2&maptype=roadmap&key=${GOOGLE_MAP_KEY}`;

  return (
      <ContainerComponent style={styles.screen}>
        <View style={{ flex: 1 }}>
          <LatestHeader
            statusBarColor="#FFFFFF"
            title="Back"
            leftIconName="chevron-left"
            onLeftPress={() => navigation.goBack()}
            titleStyle={{
              color: '#000000',
              fontSize: fontScale(16),
            }}
            containerStyle={{
              paddingHorizontal: heightScale(10),
              justifyContent: 'flex-start',
              marginBottom: 10,
            }}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[styles.container]}
          >
            <View style={styles.inputContainer}>
              <Search color="#161616" size={20} strokeWidth={2} style={styles.searchIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Search location"
                placeholderTextColor="#BDBDBD"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text) handleSearch(text);
                  else setSearchResults([]);
                }}
              />
              {searchQuery?.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    Keyboard.dismiss();
                  }}
                >
                  <X color="#131313" size={20} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {searchResults?.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item?.place_id}
                renderItem={({ item }) => (
                  <View style={{ marginHorizontal: 24 }}>
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => handleSelectPlace(item?.place_id)}
                    >
                      <View style={styles.resultImageContainer}>
                        <Image
                          resizeMode="contain"
                          source={require('../../assets/images/Union.png')}
                          style={styles.resultImage}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', flexGrow: 1, paddingRight: 54 }}>
                        <Text style={styles.resultText}>{item?.description}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            {errorMessage ? (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.mapContainer}>
              {latlong?.lat !== undefined && latlong?.lng !== undefined && (
                <View style={styles.mapFrame}>
                  {Platform.OS === 'ios' && isIOSSimulator !== false ? (
                    <Image
                      resizeMode="cover"
                      source={{ uri: staticMapUrl }}
                      style={styles.maps}
                    />
                  ) : (
                    <MapView
                      style={styles.maps}
                      ref={mapRef}
                      initialRegion={{
                        latitude: latlong?.lat,
                        longitude: latlong?.lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      onRegionChangeComplete={(region) => {
                        setLatlong({
                          lat: region.latitude,
                          lng: region.longitude,
                        });
                        handleMapMove(region.latitude, region.longitude);
                      }}
                      onPress={() => Keyboard.dismiss()}
                    />
                  )}
                  <View pointerEvents="none" style={styles.centerMarker}>
                    <Subtract width={24} height={30} />
                  </View>
                </View>
              )}
              <GradientButton
                containerStyle={styles.saveButton}
                gradientStyle={styles.saveButtonGradient}
                onPress={saveAndContinue}
                title="SAVE & CONTINUE"
                textStyle={styles.customButtonText}
                colors={['#DB3171', '#FFCC33']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              />
            </View>
          </ScrollView>
        </View>
      </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: heightScale(10),
    paddingBottom: heightScale(20),
    paddingHorizontal: widthScale(20),
    alignItems: 'center',
    color: '#161616',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  textInput: {
    flex: 1,
    height: 42,
    paddingRight: widthScale(42),
    paddingLeft: widthScale(8),
    paddingVertical: 0,
    backgroundColor: '#F9F6FD',
    color: '#131313',
    fontSize: fontScale(14),
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  inputContainer: {
    width: '100%',
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: widthScale(20),
    borderRadius: widthScale(24),
    backgroundColor: '#F3F0F7',
    overflow: 'hidden',
    color: '#161616',
  },
  searchIcon: {
    marginRight: widthScale(2),
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
    backgroundColor: '#F9F6FD',
    padding: 10,
    borderRadius: 8,
  },
  selectedPlaceText: {
    fontSize: 16,
    color: 'black',
  },
  customButtonText: {
    color: '#F9F6FD',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  saveButton: {
    alignSelf: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  saveButtonGradient: {
    height: 48,
    paddingVertical: 0,
  },
  errorMessageContainer: {
    backgroundColor: '#F9F6FD',
    padding: 10,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  errorMessageText: {
    color: '#131313',
    fontSize: 16,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  mapContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: heightScale(10),
  },
  mapFrame: {
    width: '100%',
    height: Dimensions.get('window').height * 0.68,
    borderRadius: widthScale(24),
    overflow: 'hidden',
    backgroundColor: '#F3F0F7',
  },
  textInputContainer: {
    color: '#161616',
  },
  listView: {
    backgroundColor: '##F9F6FD',
  },
  poweredContainer: {
    backgroundColor: '#F9F6FD',
    justifyContent: 'center',
  },
  row: {
    paddingVertical: heightScale(10),
    marginVertical: widthScale(2),
    borderRadius: widthScale(30),
    backgroundColor: '#F9F6FD',
  },
  maps: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTitle: {
    color: '#000000',
    fontSize: fontScale(16),
    paddingTop: 16,
    lineHeight: 14,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightScale(6),
    backgroundColor: '#F9F6FD',
    gap: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  resultImageContainer: {
    height: heightScale(32),
    width: widthScale(32),
    borderRadius: widthScale(90),
    backgroundColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImage: {
    width: widthScale(16),
    height: heightScale(16),
    color: '#DB3171',
  },
  resultText: {
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    marginRight: 16,
  },
  clearButton: {
    position: 'absolute',
    right: widthScale(14),
    top: heightScale(11),
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 30,
    marginLeft: -12,
    marginTop: -30,
    zIndex: 1,
  },
});

export default UpdateLocation;
