import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography } from '../lib/theme';

type SmartFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all' | 'custom';

const smartFilterMeta: Record<SmartFilter, { label: string; icon: string }> = {
  today: { label: 'Dnes', icon: '☀️' },
  tomorrow: { label: 'Zítra', icon: '🚀' },
  week: { label: 'Týden', icon: '📅' },
  month: { label: 'Měsíc', icon: '📊' },
  all: { label: 'Vše', icon: '📂' },
  custom: { label: 'Vlastní', icon: '⚙️' },
};

interface SmartGridProps {
  active: SmartFilter;
  onChange: (filter: SmartFilter) => void;
}

export function SmartGrid({ active, onChange }: SmartGridProps) {
  const order: SmartFilter[] = ['today', 'tomorrow', 'week', 'month', 'all', 'custom'];

  return (
    <View style={styles.grid}>
      {order.map((f) => {
        const meta = smartFilterMeta[f] || { label: f, icon: '📌' };
        const isActive = active === f;
        return (
          <Pressable
            key={f}
            style={[styles.card, isActive && styles.activeCard]}
            onPress={() => onChange(f)}
          >
            <Text style={styles.icon}>{meta.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: colors.purpleAccent,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.text,
    fontWeight: 'bold',
  },
});
