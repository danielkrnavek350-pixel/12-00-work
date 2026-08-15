import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTasks } from '../../lib/TaskContext';

export default function Settings() {
  const { clearCompleted } = useTasks();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nastavení ⚙️</Text>
      <TouchableOpacity style={styles.card} onPress={clearCompleted}>
        <Text style={{color:'#FFF', fontWeight:'bold', fontSize:15}}>🧹 Vymazat dokončené úkoly</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0813', padding: 20, paddingTop: 55 },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#151026', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#231A3D' }
});
