import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTasks } from '../../lib/TaskContext';

export default function Calendar() {
  const { tasks } = useTasks();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kalendář 📅</Text>
      <View style={styles.card}>
        <Text style={{color:'#FFF', fontSize:16, fontWeight:'bold', marginBottom:8}}>Dnešní přehled (Srpen 2026)</Text>
        <Text style={{color:'#A1A1AA'}}>Naplánováno úkolů: {tasks.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0813', padding: 20, paddingTop: 55 },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#151026', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#231A3D' }
});
