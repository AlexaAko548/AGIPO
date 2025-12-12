import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const COLUMNS = 3; 
const CONTAINER_PADDING = 20;
const SPACING = 10;
// Calculate precise width for 3 items per row
const ITEM_WIDTH = (width - (CONTAINER_PADDING * 2) - (SPACING * (COLUMNS - 1))) / COLUMNS;

type GalleryScreenProps = NativeStackScreenProps<any, 'Gallery'>;

type PokemonCapture = {
  id: number;
  name: string;
  imageUrl: string;
  capturedAt: string;
};

const GalleryScreen = ({ navigation }: GalleryScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [captures, setCaptures] = useState<PokemonCapture[]>([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const userRef = database().ref(`/users/${currentUser.uid}/discoveredPokemon`);
    userRef.once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const list: PokemonCapture[] = Object.values(data);
        // Sort newest first
        list.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
        setCaptures(list);
      }
      setLoading(false);
    });
  }, [currentUser]);

  const renderItem = ({ item }: { item: PokemonCapture }) => (
    <View style={styles.gridItem}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Collection</Text>
        <View style={{width: 24}} /> {/* Spacer for centering */}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e63946" />
        </View>
      ) : (
        <FlatList
          data={captures}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.center}>
                <Text style={styles.emptyText}>No Pokémon captured yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  header: {
    backgroundColor: '#8B2323',
    // paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 50,
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'PokemonClassic',
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  listContent: {
    padding: CONTAINER_PADDING,
    paddingBottom: 50,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    backgroundColor: '#444',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  nameText: {
    color: '#ccc',
    fontSize: 10,
    fontFamily: 'PokemonClassic',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    fontFamily: 'PokemonClassic',
    fontSize: 12,
  },
});

export default GalleryScreen;