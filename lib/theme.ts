import { Platform } from 'react-native';
import type { Priority, Recurrence, SmartFilter } from './types';

export const colors = {
  // Cosmic galaxy backgrounds
  amoled: '#05020A',
  space: '#000000',
  surface: '#150A21',
  surface2: '#1F1030',
  surface3: '#2A1840',
  hairline: 'rgba(157, 78, 221, 0.15)',
  hairlineStrong: 'rgba(157, 78, 221, 0.30)',
  overlay: 'rgba(5, 2, 10, 0.75)',

  // Accents
  primary: '#F72585',
  primaryAlt: '#E056FD',
  secondary: '#9D4EDD',
  secondaryAlt: '#8A2BE2',
  star: '#F7D36A',
  mint: '#00F5D4',
  high: '#F72585',
  medium: '#FF9F43',
  low: '#00F5D4',

  // Text
  text: '#FFFFFF',
  text2: '#B39CD6',
  text3: 'rgba(179, 156, 214, 0.55)',
  text4: 'rgba(179, 156, 214, 0.30)',
};

export const radius = {
  card: 24,
  pill: 999,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  hero: { fontSize: 40, fontWeight: '700' as const, lineHeight: 46 },
  title: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h2: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyM: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallM: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
};

export const priorityMeta: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: 'Vysoká', color: colors.primary, dot: colors.primary },
  medium: { label: 'Střední', color: colors.medium, dot: colors.medium },
  low: { label: 'Nízká', color: colors.mint, dot: colors.mint },
};

export const recurrenceMeta: Record<Recurrence, { label: string; short: string }> = {
  once: { label: 'Jednou', short: 'Jednou' },
  daily: { label: 'Denně', short: 'Denně' },
  weekly: { label: 'Týdně', short: 'Týdně' },
  monthly: { label: 'Měsíčně', short: 'Měsíčně' },
};

export const smartFilterMeta: Record<SmartFilter, { label: string; color: string }> = {
  today: { label: 'Dnes', color: colors.primary },
  scheduled: { label: 'Naplánováno', color: colors.secondary },
  starred: { label: 'Důležité', color: colors.star },
  done: { label: 'Hotovo', color: colors.mint },
};

export const isWeb = Platform.OS === 'web';
