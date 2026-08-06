import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import type { Category, FilterStatus, Priority } from '../lib/types';
import { priorityMeta } from '../lib/theme';
import { Check, X } from 'lucide-react-native';

interface Props {
  status: FilterStatus;
  onStatus: (s: FilterStatus) => void;
  category: string | null;
  onCategory: (id: string | null) => void;
  priority: Priority | null;
  onPriority: (p: Priority | null) => void;
  categories: Category[];
}

const statusLabels: Record<FilterStatus, string> = {
  all: 'Vše',
  active: 'Aktivní',
  done: 'Hotové',
};

export function FilterBar({
  status,
  onStatus,
  category,
  onCategory,
  priority,
  onPriority,
  categories,
}: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {(Object.keys(statusLabels) as FilterStatus[]).map((s) => (
          <Pill
            key={s}
            label={statusLabels[s]}
            active={status === s}
            onPress={() => onStatus(s)}
          />
        ))}

        <Divider />

        <Pill
          label="Všechny kategorie"
          active={category === null}
          onPress={() => onCategory(null)}
        />
        {categories.map((c) => (
          <Pill
            key={c.id}
            label={c.name}
            active={category === c.id}
            color={c.color}
            onPress={() => onCategory(c.id)}
          />
        ))}

        <Divider />

        <Pill
          label="Všechny priority"
          active={priority === null}
          onPress={() => onPriority(null)}
        />
        {(Object.keys(priorityMeta) as Priority[]).map((p) => (
          <Pill
            key={p}
            label={priorityMeta[p].label}
            active={priority === p}
            color={priorityMeta[p].color}
            onPress={() => onPriority(p)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Pill({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  const accent = color || colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && { backgroundColor: accent + '22', borderColor: accent },
        pressed && { opacity: 0.7 },
      ]}
    >
      {color ? (
        <View style={[styles.pillDot, { backgroundColor: active ? accent : color }]} />
      ) : null}
      <Text style={[styles.pillText, active && { color: accent }]}>{label}</Text>
      {active ? <Check size={13} color={accent} /> : null}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
  backgroundColor: colors.amoled,
  zIndex: 5,
  borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillText: {
    ...typography.smallM,
    color: colors.text2,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: colors.hairline,
    marginHorizontal: 2,
  },
});
