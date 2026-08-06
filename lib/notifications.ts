import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync() as { status: string };
    if (current.status === 'granted') return true;
    const req = await Notifications.requestPermissionsAsync() as { status: string };
    return req.status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  body: string,
  dueDate: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const due = new Date(dueDate);
  if (due.getTime() <= Date.now()) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
    const id = await Notifications.scheduleNotificationAsync({
      identifier: taskId,
      content: {
        title: title || 'Připomenutí úkolu',
        body: body || 'Máte nevyřízený úkol',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: due },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch {
    // ignore
  }
}
