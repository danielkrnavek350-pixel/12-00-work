import { Platform } from 'react-native';

export async function initNotifications() {
  if (Platform.OS === 'web') return false;
  console.log("Notifikace jsou v Expo Go omezené, inicializace přeskočena.");
  return false;
}

export async function scheduleShiftReminder(shiftTitle: string, triggerDate: Date) {
  console.warn("Plánování notifikací není v Expo Go aktuálně dostupné.");
}

