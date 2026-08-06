import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type Strength = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function haptic(kind: Strength = 'light'): void {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle[kind === 'heavy' ? 'Heavy' : kind === 'medium' ? 'Medium' : 'Light']);
  } catch {
    // ignore
  }
}
