import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Alert, Linking } from 'react-native';
import { useStore } from '../store';
import { Theme } from '../theme';
import { Check, Star, Edit3, Trash2, Plus } from 'lucide-react-native';
import AddTaskModal from '../components/AddTaskModal';

const STATIC_FILTERS = ['Dnes', 'Zítra', 'Tento týden', 'Tento měsíc', '⭐ Důležité', 'Hotové'];

export default function TasksScreen() {
  const { activeTasks, completedTasks, customTags, completeTask, deleteTask, toggleImportant, addSubtask, toggleSubtask, deleteSubtask } = useStore();
  const [activeFilter, setActiveFilter] = useState('Dnes');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const filters = [...STATIC_FILTERS, ...customTags];

  const confirmDelete = (taskId) => {
    Alert.alert(
      "Opravdu smazat?",
      "Tato akce je nevratná.",
      [
        { text: "Ne", style: "cancel" },
        { text: "Ano", style: "destructive", onPress: () => deleteTask(taskId) }
      ]
    );
  };

  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

  // Pomocné funkce pro výpočet datumů
  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const isDateInCurrentWeek = (dateStr) => {
    const curr = new Date();
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
    const lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
    const target = new Date(dateStr);
    return target >= firstDay && target <= lastDay;
  };

  const isDateInCurrentMonth = (dateStr) => {
    const curr = new Date();
    const target = new Date(dateStr);
    return target.getMonth() === curr.getMonth() && target.getFullYear() === curr.getFullYear();
  };

  const filterAndSortTasks = (tasks) => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;

        const todayStr = getFormattedDate(0);
        const tomorrowStr = getFormattedDate(1);

        if (activeFilter === '⭐ Důležité') return task.important;
        if (activeFilter === 'Dnes') return task.date === todayStr;
        if (activeFilter === 'Zítra') return task.date === tomorrowStr;
        if (activeFilter === 'Tento týden') return isDateInCurrentWeek(task.date);
        if (activeFilter === 'Tento měsíc') return isDateInCurrentMonth(task.date);
        if (customTags.includes(activeFilter)) return task.tag === activeFilter;
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });
  };

  const currentData = filterAndSortTasks(activeFilter === 'Hotové' ? completedTasks : activeTasks);

  const renderTask = ({ item }) => {
    const isExpanded = expandedTaskId === item.id;
    const priorityColor = Theme.colors.priority[item.priority];
    const completedSubtasks = item.subtasks ? item.subtasks.filter(s => s.completed).length : 0;
    const totalSubtasks = item.subtasks ? item.subtasks.length : 0;

    return (
      <View style={[styles.taskCard, { borderLeftColor: priorityColor, borderLeftWidth: 4 }]}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => setExpandedTaskId(isExpanded ? null : item.id)} 
          style={styles.cardHeader}
        >
          <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.completeIcon}>
            <Check size={16} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.taskInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.date} • {item.time} • <Text style={{color: priorityColor}}>● {item.tag}</Text>
              {totalSubtasks > 0 ? ` • Podúkoly: ${completedSubtasks}/${totalSubtasks}` : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => toggleImportant(item.id)}>
              <Star size={18} color={item.important ? Theme.colors.priority.medium : Theme.colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingTask(item); setIsModalVisible(true); }}>
              <Edit3 size={18} color={Theme.colors.textMuted} style={{marginLeft: 10}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Trash2 size={18} color={Theme.colors.textMuted} style={{marginLeft: 10}} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedArea}>
            <View style={styles.divider} />
            <Text style={styles.notesLabel}>Poznámky / Odkazy:</Text>
            <Text 
              style={styles.notes}
              onPress={() => {
                if (item.notes && (item.notes.startsWith('http://') || item.notes.startsWith('https://'))) {
                  Linking.openURL(item.notes);
                }
              }}
            >
              {item.notes || "Žádné poznámky"}
            </Text>

            <Text style={[styles.notesLabel, { marginTop: 12 }]}>Podúkoly ({completedSubtasks}/{totalSubtasks}):</Text>
            {item.subtasks && item.subtasks.map((sub) => (
              <View key={sub.id} style={styles.subtaskRow}>
                <TouchableOpacity onPress={() => toggleSubtask(item.id, sub.id)} style={styles.subtaskCheck}>
                  {sub.completed && <Check size={12} color={Theme.colors.accent} />}
                </TouchableOpacity>
                <Text style={[styles.subtaskText, sub.completed && styles.subtaskCompletedText]}>{sub.title}</Text>
                <TouchableOpacity onPress={() => deleteSubtask(item.id, sub.id)}>
                  <Trash2 size={14} color={Theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addSubtaskRow}>
              <TextInput 
                style={styles.addSubtaskInput}
                placeholder="Přidat podúkol..."
                placeholderTextColor={Theme.colors.textMuted}
                value={newSubtaskText}
                onChangeText={setNewSubtaskText}
              />
              <TouchableOpacity 
                style={styles.addSubtaskBtn}
                onPress={() => {
                  if (!newSubtaskText.trim()) return;
                  addSubtask(item.id, newSubtaskText);
                  setNewSubtaskText('');
                }}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Hledat v názvech a poznámkách..."
          placeholderTextColor={Theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[styles.pill, activeFilter === f && styles.pillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={currentData}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Žádné úkoly v této sekci.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { setEditingTask(null); setIsModalVisible(true); }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTaskModal 
        visible={isModalVisible} 
        onClose={() => { setIsModalVisible(false); setEditingTask(null); }} 
        initialTask={editingTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  searchBox: { padding: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: Theme.colors.card, color: Theme.colors.textMain, padding: 14, borderRadius: Theme.borderRadius, borderWidth: 1, borderColor: Theme.colors.border },
  filterBox: { paddingBottom: 12, paddingLeft: 16 },
  pill: { backgroundColor: Theme.colors.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Theme.colors.border },
  pillActive: { backgroundColor: Theme.colors.accent, borderColor: Theme.colors.accent },
  pillText: { color: Theme.colors.textMuted, fontWeight: '600' },
  pillTextActive: { color: Theme.colors.textMain },
  list: { padding: 16, paddingBottom: 80 },
  taskCard: { backgroundColor: Theme.colors.card, borderRadius: Theme.borderRadius, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  cardHeader: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  completeIcon: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: Theme.colors.cardSecondary },
  taskInfo: { flex: 1 },
  title: { color: Theme.colors.textMain, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  meta: { color: Theme.colors.textMuted, fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  expandedArea: { padding: 16, paddingTop: 0 },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginBottom: 12 },
  notesLabel: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  notes: { color: Theme.colors.textMain, fontSize: 14, marginBottom: 8 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  subtaskCheck: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: Theme.colors.cardSecondary },
  subtaskText: { color: Theme.colors.textMain, fontSize: 13, flex: 1 },
  subtaskCompletedText: { textDecorationLine: 'line-through', color: Theme.colors.textMuted },
  addSubtaskRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  addSubtaskInput: { flex: 1, backgroundColor: Theme.colors.cardSecondary, color: Theme.colors.textMain, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border, fontSize: 13, marginRight: 8 },
  addSubtaskBtn: { backgroundColor: Theme.colors.accent, padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Theme.colors.textMuted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: Theme.colors.accent, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }
});
