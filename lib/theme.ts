export const colors = {
  background: '#0B071E',
  card: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  text3: '#9CA3AF',
  primary: '#F59E0B',
  primaryGlow: 'rgba(245, 158, 11, 0.3)',
  purpleAccent: '#8B5CF6',
  purpleGlow: 'rgba(139, 92, 246, 0.4)',
  success: '#10B981',
  activeTag: '#8B5CF6',
  inputBg: 'rgba(255, 255, 255, 0.03)',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputBorderActive: '#F59E0B',
  hairline: 'rgba(255, 255, 255, 0.06)',
};

export const shadows = {
  cosmicGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  }
};

export const typography = {
  hero: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  body: {
    fontSize: 14,
  },
  bodyM: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
};

export default {
  colors,
  shadows,
  typography,
};
