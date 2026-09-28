import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Morning "What do you remember?" reminder (S10). Local notifications, so this works in Expo Go.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Asks for permission if needed. Returns false if the user said no. */
export async function ensureReminderPermission() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    // Android 13+ only shows the permission prompt once a channel exists.
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Morning reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return asked.granted;
}

/** Replaces any existing reminder with a daily one at hour:minute, or just clears it. */
export async function scheduleMorningReminder(reminder: {
  enabled: boolean;
  hour: number;
  minute: number;
}) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder.enabled) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'What do you remember?',
      body: 'Catch your dream before it fades.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : null),
    },
  });
}
