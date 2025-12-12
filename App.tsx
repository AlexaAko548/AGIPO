import React, { useEffect } from 'react'; // Added useEffect
import { LogBox } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configureGoogleSignIn } from './src/api/authService';
import { ConfigurePushNotifications } from './src/services/LocalPushController'; // Import it

// ... existing LogBox.ignoreLogs ...
LogBox.ignoreLogs([
  'This method is deprecated',
  'Method called was',
  'ref()',
  'set()',
  'onAuthStateChanged',
  'signInWithCredential',
  'GoogleAuthProvider',
  'getApp',
  'SafeAreaView has been deprecated',
]);

configureGoogleSignIn();

const App = () => {
  // Initialize Notifications on App Launch
  useEffect(() => {
    ConfigurePushNotifications();
  }, []);

  return <RootNavigator />;
};

export default App;