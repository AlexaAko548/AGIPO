🔴 PokeExplorer

PokeExplorer is a cross-platform mobile application built with React Native (CLI) that combines a comprehensive Pokédex with location-based "Hunt" mechanics and a social feed for Trainers to share their discoveries.

📱 Features

🔍 Pokédex

Complete Database: Fetches live data from PokeAPI.

Search & Sort: Filter Pokémon by name or ID; Sort numerically or alphabetically.

Offline Support: Caches search results for offline viewing using AsyncStorage.

Detailed Views: View stats, types, height, weight, and official artwork in a clean, retro-styled card.

📍 Hunt Mode (Geolocation)

Real-time Radar: Uses Google Maps and GPS to generate random Pokémon spawns around your physical location.

Simulation: Tap on a spawned Pokémon on the map to "capture" it.

Push Notifications: Get alerted when wild Pokémon appear nearby (using react-native-push-notification).

🌐 Social Community Feed

Global Feed: See captures from other users in real-time.

Interactions: Like posts and leave comments.

Social Sharing: Share your catches to Instagram, WhatsApp, or other apps via react-native-share.

👤 Trainer Profile

Customizable: Edit your Trainer Name and upload a Profile Picture (via Camera/Gallery).

Stats & Rank: dynamic ranking system based on the number of Pokémon caught.

Collection Gallery: View your personal grid of captured Pokémon.

Secure Auth: Powered by Firebase Authentication (Email/Password & Google Sign-In).

🛠 Tech Stack

Core: React Native (0.76+), TypeScript

Backend: Firebase Realtime Database, Firebase Authentication

Navigation: React Navigation (Native Stack & Bottom Tabs)

Maps: react-native-maps (Google Maps Provider)

State/Storage: React Hooks, AsyncStorage

UI/Assets: react-native-vector-icons, SVG Transformer, Custom Fonts (Pokemon Classic)

🚀 Getting Started

Prerequisites

Node.js & npm

JDK 17

Android Studio (for Android SDK)

CocoaPods (for iOS, optional)

1. Installation

Clone the repository and install dependencies:

git clone [https://github.com/your-username/PokeExplorer.git](https://github.com/your-username/PokeExplorer.git)
cd PokeExplorer
npm install


2. Configuration (Crucial Steps)

A. Firebase Setup

Create a project in the Firebase Console.

Add an Android app (com.pokedex or your package name).

Download google-services.json and place it in android/app/.

Enable Authentication (Email/Password & Google) and Realtime Database.

B. Google Maps API Key

Get an API Key from Google Cloud Console.

Enable Maps SDK for Android.

Add the key to android/app/src/main/AndroidManifest.xml:

<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_AIzaSy_API_KEY" />


C. Custom Fonts

Ensure PokemonClassic.ttf is located in android/app/src/main/assets/fonts/.

🏃‍♂️ Running the App

Android

Connect your physical device (USB Debugging ON) or start an Emulator.

Run the build command:

npx react-native start
# In a new terminal:
npx react-native run-android


iOS (Mac Only)

cd ios
pod install
cd ..
npx react-native run-ios


🐛 Troubleshooting & Known Issues

1. Gradle Build Fails (jcenter() or ShortcutBadger errors)

Some older libraries (react-native-push-notification, react-native-voice) use deprecated repositories.
Fix: You may need to manually patch node_modules or ensure your android/app/build.gradle includes:

dependencies {
    implementation "me.leolin:ShortcutBadger:1.1.22@aar"
}


2. Map Not Loading / Crashing

Ensure your API Key is correct in AndroidManifest.xml.

Ensure "Maps SDK for Android" is ENABLED in Google Cloud Console.

Run cd android && ./gradlew clean then rebuild.

3. "Failed to insert view" / UI Crashes

This is related to complex lists on Android's Fabric architecture.
Fix: We optimized FlatList in FeedScreen and PokedexScreen by removing removeClippedSubviews={true} and isolating list items into memo components.

🔮 Future Roadmap

Battle System: Simple rock-paper-scissors combat based on Pokémon Types.

Trading: Allow users to swap captured Pokémon.

AR Mode: Use the camera to overlay Pokémon on the real world (currently simulated).

📜 License

This project is for educational purposes. Pokémon and Pokémon character names are trademarks of Nintendo.
