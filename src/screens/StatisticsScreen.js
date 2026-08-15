import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../store';
import { Theme } from '../theme';
import { BarChart2, CheckCircle, Clock } from 'lucide-react-native';

export default function StatisticsScreen() {
  const { activeTasks, completedTasks, customTags } = useStore();

  const totalCount = activeTasks.length + completedTasks.length;
  const completedCount = completedTasks.length;
  const pendingCount = activeTasks.length;
  const productivity = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <BarChart2 size={28} color={Theme.colors.accent} style={{marginBottom: 10}} />
        <Text style={styles.cardTitle}>Celková produktivita</Text>
        <Text style={styles.productivityNumber}>{productivity}%</Text>
        <Text style={styles.cardSubtitle}>Dokončeno {completedCount} z {totalCount} úkolů</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.smallCard, { marginRight: 8 }]}>
          <CheckCircle size={22} color={Theme.colors.priority.low} />
          <Text style={styles.smallNumber}>{completedCount}</Text>
          <Text style={styles.smallLabel}>Dokončeno</Text>
        </View>
        <View style={[styles.smallCard, { marginLeft: 8 }]}>
          <Clock size={22} color={Theme.colors.priority.medium} />
          <Text style={styles.smallNumber}>{pendingCount}</Text>
          <Text style={styles.smallLabel}>Čeká na splnění</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Rozpad podle štítků (Dokončené úkoly)</Text>
      {customTags.map((tag) => {
        const count = completedTasks.filter(t => t.tag === tag).length;
        return (
          <View key={tag} style={styles.tagStatRow}>
            <Text style={styles.tagStatName}>● {tag}</Text>
            <Text style={styles.tagStatCount}>{count} dokončeno</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 16 },
  card: { backgroundColor: Theme.colors.card, padding: 24, borderRadius: Theme.borderRadius, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  cardTitle: { color: Theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
  productivityNumber: { color: Theme.colors.textMain, fontSize: 42, fontWeight: 'bold', marginVertical: 8 },
  cardSubtitle: { color: Theme.colors.textMuted, fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 20 },
  smallCard: { flex: 1, backgroundColor: Theme.colors.card, padding: 16, borderRadius: Theme.borderRadius, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  smallNumber: { color: Theme.colors.textMain, fontSize: 24, fontWeight: 'bold', marginVertical: 6 },
  smallLabel: { color: Theme.colors.textMuted, fontSize: 12 },
  sectionTitle: { color: Theme.colors.textMain, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tagStatRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Theme.colors.card, padding: 14, borderRadius: Theme.borderRadius, marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.border },
  tagStatName: { color: Theme.colors.textMain, fontSize: 14, fontWeight: '600' },
  tagStatCount: { color: Theme.colors.accent, fontSize: 14, fontWeight: 'bold' }
});
