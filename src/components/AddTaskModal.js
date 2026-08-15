import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useStore } from '../store';
import { Theme } from '../theme';
import { X } from 'lucide-react-native';

const PRIORITIES = [
  { key: 'low', label: '🟢 Nízká', color: Theme.colors.priority.low },
  { key: 'medium', label: '🟡 Střední', color: Theme.colors.priority.medium },
  { key: 'high', label: '🔴 Vysoká', color: Theme.colors.priority.high },
  { key: 'urgent', label: '🟣 Urgentní', color: Theme.colors.priority.urgent },
];

export default function AddTaskModal({ visible, onClose, initialTask = null }) {
  const { addTask, customTags, notificationTemplates } = useStore();
  
  const [title, setTitle] = useState(initialTask?.title || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [tag, setTag] = useState(initialTask?.tag || customTags[0] || 'Práce');
  const [date, setDate] = useState(initialTask?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialTask?.time || '12:00');
  const [notificationTemplate, setNotificationTemplate] = useState(initialTask?.notificationTemplate || notificationTemplates[0] || '10 min předem');

  const handleSave = () => {
    if (!title.trim()) return;

    addTask({
      title,
      notes,
      priority,
      tag,
      date,
      time,
      notificationTemplate,
      important: false
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{initialTask ? 'Upravit úkol' : 'Nový úkol'}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Název úkolu</Text>
            <TextInput 
              style={styles.input}
              placeholder="Např. Dokončit kódování..."
              placeholderTextColor={Theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Poznámky / Odkazy (URLs)</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Doplňující informace nebo webové odkazy..."
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.label}>Priorita</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity 
                  key={p.key}
                  style={[
                    styles.priorityBtn, 
                    priority === p.key && { borderColor: p.color, backgroundColor: Theme.colors.cardSecondary }
                  ]}
                  onPress={() => setPriority(p.key)}
                >
                  <Text style={styles.priorityText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Štítek</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {customTags.map((t) => (
                <TouchableOpacity 
                  key={t}
                  style={[styles.tagChip, tag === t && styles.tagChipActive]}
                  onPress={() => setTag(t)}
                >
                  <Text style={[styles.tagChipText, tag === t && styles.tagChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Datum (YYYY-MM-DD)</Text>
            <TextInput 
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholderTextColor={Theme.colors.textMuted}
            />

            <Text style={styles.label}>Čas (HH:MM)</Text>
            <TextInput 
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholderTextColor={Theme.colors.textMuted}
            />

            <Text style={styles.label}>Upozornění (Notifikace)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {notificationTemplates.map((tpl) => (
                <TouchableOpacity 
                  key={tpl}
                  style={[styles.tagChip, notificationTemplate === tpl && styles.tagChipActive]}
                  onPress={() => setNotificationTemplate(tpl)}
                >
                  <Text style={[styles.tagChipText, notificationTemplate === tpl && styles.tagChipTextActive]}>{tpl}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Uložit úkol</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { backgroundColor: Theme.colors.card, borderTopLeftRadius: Theme.borderRadius, borderTopRightRadius: Theme.borderRadius, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: Theme.colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: Theme.colors.textMain, fontSize: 20, fontWeight: 'bold' },
  label: { color: Theme.colors.textMuted, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: Theme.colors.cardSecondary, color: Theme.colors.textMain, padding: 14, borderRadius: Theme.borderRadius, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 16, fontSize: 16 },
  priorityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  priorityBtn: { flex: 1, backgroundColor: Theme.colors.cardSecondary, padding: 10, borderRadius: 10, alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: Theme.colors.border },
  priorityText: { color: Theme.colors.textMain, fontSize: 12, fontWeight: '600' },
  tagChip: { backgroundColor: Theme.colors.cardSecondary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Theme.colors.border },
  tagChipActive: { backgroundColor: Theme.colors.accent, borderColor: Theme.colors.accent },
  tagChipText: { color: Theme.colors.textMuted, fontWeight: '600' },
  tagChipTextActive: { color: Theme.colors.textMain },
  saveButton: { backgroundColor: Theme.colors.accent, padding: 16, borderRadius: Theme.borderRadius, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: Theme.colors.textMain, fontSize: 16, fontWeight: 'bold' }
});
