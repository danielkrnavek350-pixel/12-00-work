import { Platform, StyleSheet } from 'react-native';
import { colors } from './theme';

export const glassSurface = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
    borderRadius: 24,
  overflow: 'hidden',
  ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }
      : {}),
  },
  surface: {
    backgroundColor: 'rgba(31, 16, 48, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }
      : {}),
  },
  input: {
    backgroundColor: 'rgba(31, 16, 48, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.12)',
    borderRadius: 14,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }
      : {}),
  },
  sheet: {
    backgroundColor: 'rgba(21, 10, 33, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.22)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }
      : {}),
  },
  pill: {
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    borderRadius: 999,
  },
});

export const glassColors = colors;
