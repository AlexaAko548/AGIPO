import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const LocalNotification = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: "pokemon-channel-id", // Must match the channel created below
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    vibrate: true,
  });
};

export const ConfigurePushNotifications = () => {
  PushNotification.configure({
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
      console.log("NOTIFICATION:", notification);
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create the channel (Required for Android 8.0+)
  PushNotification.createChannel(
    {
      channelId: "pokemon-channel-id", // The ID we use to send
      channelName: "Pokemon Alerts",
      channelDescription: "Notifications for nearby Pokemon",
      playSound: true,
      soundName: "default",
      importance: 4, // High importance
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};