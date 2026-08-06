import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { glassSurface } from '../lib/glass';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  headerAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
}

export function Sheet({ visible, title, onClose, children, headerAction }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, glassSurface.sheet]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerActions}>
              {headerAction ? (
                <Pressable
                  onPress={headerAction.onPress}
                  disabled={headerAction.disabled}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    headerAction.disabled && styles.saveBtnDisabled,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.saveBtnText}>{headerAction.label}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <X size={20} color={colors.text2} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 1, 8, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'web' ? 24 : 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text4,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    ...typography.smallM,
    color: colors.text,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bodyContent: {
    paddingBottom: 40,
    gap: 14,
  },
});
