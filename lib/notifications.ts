import { Platform } from 'react-native';

export async function ensureNotificationPermission(): Promise<boolean> {
  // Bezpečná verze: pokud není Expo SDK 53 podporováno, prostě vrátíme false
  return false;
}
