import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, ScrollView, Switch } from 'react-native';
import { colors, typography } from '../lib/theme';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Nízká', color: '#10B981' },
  medium: { label: 'Střední', color: '#F59E0B' },
  high: { label: 'Vysoká', color: '#EF4444' },
  urgent: { label: 'Urgentní', color: '#8B5CF6' },
};

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  task?: any;
  categories?: string[];
}

export function TaskForm({ visible, onClose, onSubmit, task, categories = [] }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Vše');
  const [priority, setPriority] = useState<Priority>('medium');
  const [reminder, setReminder] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || categories[0] || 'Vše');
      setPriority(task.priority || 'medium');
      setReminder(!!task.reminder);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0] || 'Vše');
      setPriority('medium');
      setReminder(false);
    }
  }, [task, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      ...(task || {}),
      title,
      description,
      category,
      priority,
      reminder,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{task ? 'Upravit úkol' : 'Nový úkol'}</Text>
          
          <ScrollView style={styles.formScroll}>
            <Text style={styles.label}>Název</Text>
            <TextInput
              style={styles.input}
              placeholder="Zadej název úkolu..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Popis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Podrobnosti..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Priorita</Text>
            <View style={styles.priorityRow}>
              {(Object.keys(priorityMeta) as Priority[]).map((p) => {
                const meta = priorityMeta[p];
                const isActive = priority === p;
                return (
                  <Pressable
                    key={p}
                    style={[styles.priorityBtn, isActive && { backgroundColor: meta.color, borderColor: meta.color }]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, isActive && { color: '#FFFFFF' }]} >
                      {meta.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Upozornění</Text>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ false: colors.cardBorder, true: colors.purpleAccent }}
                thumbColor={reminder ? colors.text : colors.textMuted}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>Zrušit</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleSubmit}>
              <Text style={styles.saveText}>Uložit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  formScroll: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodyM,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    ...typography.body,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  priorityText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  saveBtn: {
    backgroundColor: colors.purpleAccent,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  saveText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});
