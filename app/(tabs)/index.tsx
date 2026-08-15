import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTasks, Task } from '../../lib/TaskContext';

export default function Index() {
  const { tasks, addTask, toggleComplete, toggleStar, deleteTask } = useTasks();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Task['category']>('Práce');
  const [priority, setPriority] = useState<Task['priority']>('stredni');

  const handleCreate = () => {
    if (!title.trim()) return;
    addTask(title, category, priority);
    setTitle('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Moje úkoly ✨</Text>
      
      <View style={styles.cardBox}>
        <TextInput
          style={styles.input}
          placeholder="Napiš nový úkol..."
          placeholderTextColor="#71717A"
          value={title}
          onChangeText={setTitle}
        />
        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:8}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['Práce', 'Osobní', 'Studium', 'Nákupy', 'Zdraví'] as Task['category'][]).map(c => (
              <TouchableOpacity key={c} style={[styles.pill, category === c && styles.activePill]} onPress={() => setCategory(c)}>
                <Text style={{color: category === c ? '#FFF' : '#A1A1AA', fontSize:11}}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
            <Text style={{color:'#FFF', fontWeight:'bold', fontSize:12}}>Přidat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.taskCard}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <Text style={{fontSize:20, marginRight:10}}>{item.completed ? '✅' : '⭕'}</Text>
            </TouchableOpacity>
            <View style={{flex:1}}>
              <Text style={[styles.taskTitle, item.completed && {textDecorationLine:'line-through', color:'#71717A'}]}>{item.title}</Text>
              <Text style={{color:'#C084FC', fontSize:11, marginTop:2}}>{item.category}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleStar(item.id)}><Text style={{fontSize:18, marginRight:12}}>{item.isStarred ? '⭐' : '☆'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}><Text style={{fontSize:16}}>🗑️</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0813', padding: 20, paddingTop: 55 },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  cardBox: { backgroundColor: '#151026', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#231A3D' },
  input: { backgroundColor: '#1C1630', padding: 12, borderRadius: 10, color: '#FFF' },
  pill: { backgroundColor: '#1C1630', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6, justifyContent:'center' },
  activePill: { backgroundColor: '#A855F7' },
  addBtn: { backgroundColor: '#A855F7', paddingHorizontal: 16, justifyContent:'center', borderRadius: 8 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151026', padding: 15, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#231A3D' },
  taskTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' }
});
