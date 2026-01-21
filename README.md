🔴 PokeExplorer

<!-- PROJECT SHIELDS -->

<div align="center">
<p><b>A location-based Social Pokédex app built for Trainers.</b></p>
</div>

📸 Gallery

<div align="center">
<table>
<tr>
<td align="center"><b>📍 Hunt Mode</b></td>
<td align="center"><b>📖 Pokédex</b></td>
<td align="center"><b>🌍 Social Feed</b></td>
</tr>
<tr>
<td><img src="screenshots/hunt.png" width="200" alt="Hunt Mode" /></td>
<td><img src="screenshots/pokedex.png" width="200" alt="Pokedex" /></td>
<td><img src="screenshots/feed.png" width="200" alt="Social Feed" /></td>
</tr>
</table>
<p><i>(Add your screenshots to a folder named <code>screenshots/</code> in your project root!)</i></p>
</div>

📱 Features

🔍 Pokédex

The ultimate encyclopedia.

Live Data: Fetches continuously updated data from PokeAPI.

Smart Search: Filter by Name or ID; Sort numerically or alphabetically.

Offline Capable: Caches results using AsyncStorage so you can browse without internet.

Retro UI: Styled with pixel-art fonts and clean cards.

📍 Hunt Mode (Geolocation)

Go outside and explore.

Real-time Radar: Uses Google Maps to simulate Pokémon spawns around you.

Simulation Engine: Logic determines spawn rarity and location.

Alerts: Get push notifications when a rare Pokémon appears nearby.

🌐 Social Community

Connect with other Trainers.

Global Feed: Share your catches instantly.

Socialize: Like posts (with real-time counters) and leave comments.

Share: Export your discoveries to Instagram, WhatsApp, or Discord.

👤 Trainer Profile

Identity: Customize your Trainer Name and Profile Picture.

Ranking System: Dynamic rank updates based on your capture count.

Collection: A visual grid gallery of every Pokémon you've caught.

🛠 Tech Stack

Category

Technology

Core

React Native (CLI), TypeScript

Backend

Firebase Auth, Realtime Database

Navigation

React Navigation (Stack & Tabs)

Maps

react-native-maps (Google Provider)

Storage

AsyncStorage (Offline Data)

Media

react-native-image-picker, react-native-vector-icons

🚀 Installation & Setup

1. Clone & Install

git clone [https://github.com/your-username/PokeExplorer.git](https://github.com/your-username/PokeExplorer.git)
cd PokeExplorer
npm install


2. Required Configuration

You must create a google-services.json and configure your keys for the app to launch.

A. Firebase

Go to the Firebase Console.

Create a project and download google-services.json.

Place it in: android/app/google-services.json.

B. Google Maps

Get an API Key from Google Cloud.

Open android/app/src/main/AndroidManifest.xml and add:

<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE" />


3. Run the App

For Android:

# Terminal 1: Start Metro
npx react-native start

# Terminal 2: Build & Launch
npx react-native run-android


🐛 Troubleshooting

Error

Solution

Build Failed (jcenter)

Go to node_modules/.../build.gradle and replace jcenter() with mavenCentral().

Map Crashes

Verify your API Key in AndroidManifest.xml is correct and has Maps SDK enabled.

GPS Stuck

Ensure Location is ON and you are using enableHighAccuracy: false for indoors.

<div align="center">
<br />
<sub>Built with ❤️ by the PokeExplorer Team</sub>
</div>
