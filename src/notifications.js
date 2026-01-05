import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // 👈 สำคัญ (แทน alert)
    shouldShowList: true,     // 👈 ให้เข้า Notification Center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('ต้องอนุญาตการแจ้งเตือน');
  }
}

export function showNotification(title, body) {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}
