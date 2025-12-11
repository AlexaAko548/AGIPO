import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
  AppState
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import { fetchPokemonDetail } from '../api/pokeAPI'; 

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

export default function HuntScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  
  // Fixes hook order issues by declaring all hooks at the top
  const appState = useRef(AppState.currentState);
  const [location, setLocation] = useState<any>(null);
  const [nearbyPokemon, setNearbyPokemon] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // Check immediately
    checkPermission();

    // Re-check when coming back from Settings
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkPermission();
      }
      appState.current = nextAppState;
    });

    return () => { subscription.remove(); };
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      // Check if EITHER Fine (Precise) or Coarse (Approximate) is granted
      const hasFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const hasCoarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

      if (hasFine || hasCoarse) {
        setHasPermission(true);
        getCurrentLocation();
      } else {
        // Request both
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);
            
            if (granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' || 
                granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted') {
                setHasPermission(true);
                getCurrentLocation();
            } else {
                setHasPermission(false);
            }
        } catch (err) {
            console.warn(err);
            setHasPermission(false);
        }
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    if (location) return; 

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude, 
          longitude, 
          latitudeDelta: 0.005, 
          longitudeDelta: 0.005
        });
        spawnPokemon(latitude, longitude);
      },
      (error) => {
        console.log("GPS Error:", error.code, error.message);
        // Fallback: If High Accuracy fails (indoors), try low accuracy automatically
        if (error.code === 3) { // Timeout
            Geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude, 
                        longitude: pos.coords.longitude, 
                        latitudeDelta: 0.005, 
                        longitudeDelta: 0.005
                    });
                    spawnPokemon(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => console.log("Fallback failed", err),
                { enableHighAccuracy: false, timeout: 10000 }
            );
        }
      },
      // Try High Accuracy first, but timeout fast (5s) so we don't hang
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
  };

  const spawnPokemon = (lat: number, lng: number) => {
    const randomPokemonIds = [1, 4, 7, 25, 133, 150]; 
    const spawns = randomPokemonIds.map((id, index) => {
      const latOffset = (Math.random() - 0.5) * 0.002; 
      const lngOffset = (Math.random() - 0.5) * 0.002;
      return {
        id: `spawn-${index}`,
        pokemonId: id,
        coordinate: { latitude: lat + latOffset, longitude: lng + lngOffset }
      };
    });
    setNearbyPokemon(spawns);
  };

  if (!hasPermission) {
     return (
       <View style={styles.center}>
         <Text style={{color:'white', marginBottom:20, fontWeight:'bold'}}>Location Permission Required</Text>
         <TouchableOpacity style={styles.btn} onPress={() => Linking.openSettings()}>
            <Text style={styles.btnText}>Open Settings</Text>
         </TouchableOpacity>
       </View>
     )
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DC0A2D" />
        <Text style={{color:'white', marginTop:10}}>Locating GPS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={location}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {nearbyPokemon.map((spawn) => (
          <Marker
            key={spawn.id}
            coordinate={spawn.coordinate}
            onPress={() => navigation.navigate('PokemonDetailScreen', { pokemonId: spawn.pokemonId })}
          >
            <View style={styles.markerBg}>
              <Image 
                source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spawn.pokemonId}.png` }} 
                style={styles.markerImg} 
              />
            </View>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.overlay}>
         <TouchableOpacity style={styles.btn} onPress={() => { setLocation(null); getCurrentLocation(); }}>
            <Text style={styles.btnText}>↻ Refresh Area</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
  markerBg: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 2, borderWidth: 1, borderColor: '#DC0A2D' },
  markerImg: { width: 35, height: 35, resizeMode: 'contain' },
  overlay: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  btn: { backgroundColor: '#DC0A2D', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  btnText: { color: 'white', fontWeight: 'bold' }
});