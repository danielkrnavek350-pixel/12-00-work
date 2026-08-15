import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTasks } from '../../lib/TaskContext';

export default function Statistics() {
  const { tasks } = useTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Statistiky 📊</Text>
      <View style={styles.card}><Text style={styles.lbl}>Celkem úkolů</Text><Text style={styles.val}>{total}</Text></View>
      <View style={styles.card}><Text style={styles.lbl}>Dokončeno</Text><Text style={[styles.val, {color:'#10B981'}]}>{completed}</Text></View>
      <View style={styles.card}><Text style={styles.lbl}>Produktivita</Text><Text style={[styles.val, {color:'#A855F7'}]}>{percent}%</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0813', padding: 20, paddingTop: 55 },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#151026', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#231A3D', flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  lbl: { color: '#A1A1AA', fontSize: 16 },
  val: { color: '#FFF', fontSize: 22, fontWeight: 'bold' }
});
