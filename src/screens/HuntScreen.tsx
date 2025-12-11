import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert, // Import Alert
} from "react-native";

import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// 1. Define the Navigation Types
type RootStackParamList = {
  AR: { pokemon: { name: string; id: number } }; 
};

// Helper: sprite URL from poke id
const getPokemonImage = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Haversine distance (meters)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function HuntScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [spawns, setSpawns] = useState<
    { name: string; id: number; latitude: number; longitude: number }[]
  >([]);
  const [loadingLocation, setLoadingLocation] = useState(false); // New state to track loading

  // Request Android permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Load 100 pokemon (names + urls)
  const loadPokemonList = async () => {
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
      const data = await res.json();
      setPokemonList(data.results || []);
    } catch (err) {
      console.log("Failed to load pokemon list:", err);
    }
  };

  // Generate spawns around player
  const generateSpawns = (coords: { lat: number; lon: number }) => {
    if (!pokemonList || pokemonList.length === 0) return;

    const result: { name: string; id: number; latitude: number; longitude: number }[] = [];

    for (let i = 0; i < 5; i++) {
      const randIndex = Math.floor(Math.random() * pokemonList.length);
      const p = pokemonList[randIndex];
      const parts = p.url.split("/").filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10);

      const lat = coords.lat + (Math.random() - 0.5) * 0.003;
      const lon = coords.lon + (Math.random() - 0.5) * 0.003;

      result.push({
        name: p.name,
        id: Number.isNaN(id) ? randIndex + 1 : id,
        latitude: lat,
        longitude: lon,
      });
    }

    setSpawns(result);
  };

  // Get location once and generate spawns
  // Get location once and generate spawns
  const getLocation = async () => {
    setLoadingLocation(true);
    const ok = await requestLocationPermission();
    if (!ok) {
      setLoadingLocation(false);
      Alert.alert("Permission Denied", "We need location access to play Hunt Mode.");
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLocation(coords);
        generateSpawns(coords);
        setLoadingLocation(false);
      },
      (error) => {
        console.log("Geolocation error:", error);
        setLoadingLocation(false);
        
        // Custom error messages based on code
        let errorMsg = "Could not get location.";
        if (error.code === 3) errorMsg = "Location request timed out. Try moving outdoors.";
        if (error.code === 2) errorMsg = "GPS signal unavailable.";
        if (error.code === 1) errorMsg = "Location permission denied.";

        Alert.alert("GPS Error", errorMsg);
      },
      // UPDATED OPTIONS
      { 
        enableHighAccuracy: true, // Try 'true' for better outdoor precision, or 'false' for faster wifi/cell lock
        timeout: 60000,           // Increased to 60 seconds (gives GPS more time to warm up)
        maximumAge: 10000         // Accept a cached location if it's less than 10 seconds old
      }
    );
  };

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (pokemonList.length > 0) getLocation();
  }, [pokemonList]);

  // Navigate to ARScreen when a Pokémon is clicked
  const handleCatchPokemon = (pokemon: { name: string; id: number }) => {
    navigation.navigate("AR", { pokemon });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hunt Mode</Text>

      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{ latitude: location.lat, longitude: location.lon }}
            title="You"
            pinColor="blue"
          />

          {spawns.map((p, idx) => (
            <Marker
              key={idx}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name.toUpperCase()}
              onPress={() => handleCatchPokemon({ name: p.name, id: p.id })}
            >
              <Image source={{ uri: getPokemonImage(p.id) }} style={styles.markerImg} />
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.center}>
          {loadingLocation ? (
            <>
              <ActivityIndicator size="large" color="#e63946" />
              <Text style={{ marginTop: 10, color: '#fff' }}>Getting GPS Signal...</Text>
            </>
          ) : (
            <>
              <Text style={{ marginTop: 10, color: '#fff', marginBottom: 20 }}>Location not found</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={getLocation}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => location && generateSpawns(location)}>
        <Text style={styles.buttonText}>Refresh Hunt</Text>
      </TouchableOpacity>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>Nearby Pokémon</Text>

        <FlatList
          data={spawns}
          keyExtractor={(item) => `${item.id}-${item.latitude.toFixed(5)}`}
          horizontal={false}
          renderItem={({ item }) => {
            const dist = location
              ? getDistanceMeters(location.lat, location.lon, item.latitude, item.longitude)
              : 0;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleCatchPokemon({ name: item.name, id: item.id })}
              >
                <Image source={{ uri: getPokemonImage(item.id) }} style={styles.pokeImg} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.pokeName}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.pokeDist}>{dist} m away</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  title: { 
    fontFamily: 'PokemonClassic',
    fontSize: 16,
    textAlign: "center", 
    paddingVertical: 15,
    backgroundColor: '#8B2323',
    color: 'white',
  },
  map: { width: "100%", height: "90%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    position: "absolute",
    right: 16,
    bottom: 230, 
    backgroundColor: "#e63946",
    padding: 10,
    borderRadius: 8,
    elevation: 4,
  },
  retryBtn: {
    backgroundColor: "#e63946",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontFamily: 'PokemonClassic', fontSize: 10 },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    elevation: 10,
  },
  panelTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: '#333', fontFamily: 'PokemonClassic' },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  pokeImg: { width: 44, height: 44 },
  pokeName: { fontSize: 12, fontWeight: "700", color: '#333', fontFamily: 'PokemonClassic' },
  pokeDist: { fontSize: 12, color: "#666" },
  markerImg: { width: 55, height: 55 },
});