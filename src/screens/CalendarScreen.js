import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useStore } from '../store';
import { Theme } from '../theme';
import { Calendar as CalendarIcon, Check } from 'lucide-react-native';

export default function CalendarScreen() {
  const { activeTasks, completedTasks, completeTask } = useStore();
  const [systemEvents, setSystemEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const calendarIds = calendars.map(c => c.id);
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        try {
          const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
          setSystemEvents(events);
        } catch (error) {
          console.log("Chyba při načítání systémového kalendáře:", error);
        }
      }
    })();
  }, []);

  const allTasks = [...activeTasks, ...completedTasks];
  const dayTasks = allTasks.filter(t => t.date === selectedDate);
  const dayEvents = systemEvents.filter(e => e.startDate && e.startDate.startsWith(selectedDate));

  // Generování několika posledních/budoucích dní pro rychlý výběr v řadě
  const generateDays = () => {
    const days = [];
    for (let i = -3; i <= 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <CalendarIcon size={24} color={Theme.colors.accent} />
        <Text style={styles.headerTitle}>Kalendář a události</Text>
      </View>

      {/* Horizontální výběr data */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {generateDays().map((dateStr) => (
          <TouchableOpacity 
            key={dateStr}
            style={[styles.dateChip, selectedDate === dateStr && styles.dateChipActive]}
            onPress={() => setSelectedDate(dateStr)}
          >
            <Text style={[styles.dateChipText, selectedDate === dateStr && styles.dateChipTextActive]}>
              {dateStr.slice(5)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subHeader}>Zobrazeno pro den: {selectedDate}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Systémové události (Samsung/Google)</Text>
        {dayEvents.length === 0 ? (
          <Text style={styles.emptyText}>Žádné systémové události.</Text>
        ) : (
          dayEvents.map((item, index) => (
            <View key={item.id || index} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventTime}>📅 {new Date(item.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
          ))
        )}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Úkoly z Task Master Pro</Text>
        {dayTasks.length === 0 ? (
          <Text style={styles.emptyText}>Žádné úkoly pro tento den.</Text>
        ) : (
          dayTasks.map((item) => {
            const priorityColor = Theme.colors.priority[item.priority];
            const isCompleted = completedTasks.some(t => t.id === item.id);
            return (
              <View key={item.id} style={[styles.taskCard, { borderLeftColor: priorityColor, borderLeftWidth: 4 }]}>
                <View style={{flex: 1}}>
                  <Text style={[styles.taskTitle, isCompleted && styles.completedText]}>{item.title}</Text>
                  <Text style={styles.taskMeta}>Čas: {item.time} • Štítek: {item.tag}</Text>
                </View>
                {!isCompleted && (
                  <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.checkBtn}>
                    <Check size={16} color={Theme.colors.textMain} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { color: Theme.colors.textMain, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  dateScroll: { maxHeight: 50, marginBottom: 16 },
  dateChip: { backgroundColor: Theme.colors.card, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: Theme.colors.border, height: 42 },
  dateChipActive: { backgroundColor: Theme.colors.accent, borderColor: Theme.colors.accent },
  dateChipText: { color: Theme.colors.textMuted, fontWeight: '600' },
  dateChipTextActive: { color: Theme.colors.textMain },
  subHeader: { color: Theme.colors.textMuted, fontSize: 13, marginBottom: 16 },
  sectionLabel: { color: Theme.colors.accent, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  eventCard: { backgroundColor: Theme.colors.cardSecondary, padding: 12, borderRadius: Theme.borderRadius, marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.border },
  eventTitle: { color: Theme.colors.textMain, fontSize: 14, fontWeight: '600' },
  eventTime: { color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  taskCard: { flexDirection: 'row', backgroundColor: Theme.colors.card, padding: 12, borderRadius: Theme.borderRadius, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  taskTitle: { color: Theme.colors.textMain, fontSize: 15, fontWeight: 'bold' },
  completedText: { textDecorationLine: 'line-through', color: Theme.colors.textMuted },
  taskMeta: { color: Theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  checkBtn: { backgroundColor: Theme.colors.accent, padding: 8, borderRadius: 8 },
  emptyText: { color: Theme.colors.textMuted, fontSize: 13, fontStyle: 'italic', marginBottom: 10 }
});
