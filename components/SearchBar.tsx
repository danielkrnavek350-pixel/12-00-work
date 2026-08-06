import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { Search, X } from 'lucide-react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const clear = useCallback(() => onChange(''), [onChange]);
  return (
    <View style={styles.wrap}>
      <Search size={18} color={colors.text3} style={styles.icon} />
      <input
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        placeholder="Hledat úkoly nebo čas (např. 14:00)…"
        style={webStyles.input}
      />
      {value ? (
        <Pressable onPress={clear} hitSlop={10} style={styles.clearBtn}>
          <X size={16} color={colors.text3} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(31, 16, 48, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 0 : 2,
    marginBottom: 14,
    minHeight: 46,
  },
  icon: { marginTop: Platform.OS === 'web' ? 0 : 8 },
  clearBtn: { padding: 4, marginTop: Platform.OS === 'web' ? 0 : 6 },
});

const webStyles = {
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: colors.text,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    fontFamily: 'inherit',
    padding: '10px 0',
    width: '100%',
  },
};
