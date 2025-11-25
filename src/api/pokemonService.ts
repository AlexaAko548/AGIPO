import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

// 1. Define the shape of the Pokemon data we want to save
export interface PokemonData {
  id: number;           // e.g., 25
  name: string;         // e.g., "Pikachu"
  imageUrl: string;     // URL to the sprite
  types: string[];      // e.g., ["Electric"]
  height?: number;      // Optional
  weight?: number;      // Optional
}

/**
 * Saves a captured Pokemon to the current user's database.
 * Usage: await capturePokemon(myPokemonObject);
 */
export const capturePokemon = async (pokemon: PokemonData): Promise<boolean> => {
  try {
    // 2. Get the current user
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No user is currently logged in.');
    }

    const userId = currentUser.uid;
    const timestamp = new Date().toISOString();

    // 3. Define the path: users -> [userID] -> discoveredPokemon -> [pokemonID]
    // Using pokemon.id as the key prevents duplicates automatically.
    // If they catch it again, it just updates the capture time.
    const pokemonRef = database()
      .ref(`/users/${userId}/discoveredPokemon/${pokemon.id}`);

    // 4. Save the data
    await pokemonRef.set({
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
      types: pokemon.types,
      capturedAt: timestamp, // We add the time it was caught
    });

    console.log(`Successfully saved ${pokemon.name} to database.`);
    return true;

  } catch (error: any) {
    console.error('Capture Error:', error);
    Alert.alert('Save Error', 'Could not save this Pokémon to your Pokedex.');
    return false;
  }
};

/**
 * Helper to check if a user has already caught a specific Pokemon.
 * Useful for the AR screen to show a "Caught" icon instead of a generic one.
 */
export const checkIfCaught = async (pokemonId: number): Promise<boolean> => {
  const currentUser = auth().currentUser;
  if (!currentUser) return false;

  const snapshot = await database()
    .ref(`/users/${currentUser.uid}/discoveredPokemon/${pokemonId}`)
    .once('value');

  return snapshot.exists();
};