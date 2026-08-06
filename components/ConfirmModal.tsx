import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { Sheet } from './Sheet';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Smazat',
  cancelLabel = 'Zrušit',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Sheet visible={visible} title={title} onClose={onCancel}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </Pressable>
        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  message: {
    ...typography.body,
    color: colors.text2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    alignItems: 'center',
  },
  cancelText: { ...typography.bodyM, color: colors.text2 },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.high,
    alignItems: 'center',
  },
  confirmText: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
});
