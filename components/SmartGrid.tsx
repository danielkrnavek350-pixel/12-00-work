import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, smartFilterMeta } from '../lib/theme';
import type { SmartFilter } from '../lib/types';
import { CalendarDays, CalendarClock, Star, CheckCircle2 } from 'lucide-react-native';

interface Props {
  active: SmartFilter;
  onChange: (f: SmartFilter) => void;
  counts: Record<SmartFilter, number>;
}

const icons: Record<SmartFilter, React.ReactNode> = {
  today: <CalendarDays size={20} color={colors.primary} />,
  scheduled: <CalendarClock size={20} color={colors.secondary} />,
  starred: <Star size={20} color={colors.star} />,
  done: <CheckCircle2 size={20} color={colors.mint} />,
};

const order: SmartFilter[] = ['today', 'scheduled', 'starred', 'done'];

export function SmartGrid({ active, onChange, counts }: Props) {
  return (
    <View style={styles.grid}>
      {order.map((f) => {
        const meta = smartFilterMeta[f];
        const isActive = active === f;
        return (
          <Pressable
            key={f}
            onPress={() => onChange(f)}
            style={({ pressed }) => [
              styles.tile,
              isActive && { borderColor: meta.color, backgroundColor: meta.color + '18' },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={[styles.tileIcon, { backgroundColor: meta.color + '22' }]}>{icons[f]}</View>
            <Text style={[styles.tileLabel, isActive && { color: meta.color }]}>{meta.label}</Text>
            <Text style={styles.tileCount}>{counts[f]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    padding: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { ...typography.smallM, color: colors.text2 },
  tileCount: { ...typography.h2, color: colors.text, fontSize: 22 },
});
