import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { Check } from 'lucide-react-native';

interface Option<T> {
  value: T;
  label: string;
  color?: string;
}

interface Props<T> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function OptionPicker<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((o) => {
          const active = o.value === value;
          const accent = o.color || colors.primary;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => [
                styles.chip,
                active && { backgroundColor: accent + '22', borderColor: accent },
                pressed && { opacity: 0.7 },
              ]}
            >
              {o.color ? (
                <View style={[styles.dot, { backgroundColor: o.color }]} />
              ) : null}
              <Text style={[styles.chipText, active && { color: accent }]}>{o.label}</Text>
              {active ? <Check size={13} color={accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    ...typography.smallM,
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: {
    ...typography.bodyM,
    color: colors.text2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
