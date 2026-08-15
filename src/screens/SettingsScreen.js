import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useStore } from '../store';
import { Theme } from '../theme';
import { Settings, Trash2, Plus, Download, Upload, Bell } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
  const { 
    customTags, addTag, deleteTag, 
    notificationTemplates, addNotificationTemplate, deleteNotificationTemplate,
    exportData, importData, completedTasks 
  } = useStore();

  const [newTagText, setNewTagText] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const confirmDeleteTag = (tag) => {
    Alert.alert(
      "Smazat štítek?",
      `Opravdu chcete smazat štítek "${tag}"?`,
      [
        { text: "Zrušit", style: "cancel" },
        { text: "Smazat", style: "destructive", onPress: () => deleteTag(tag) }
      ]
    );
  };

  const handleExport = async () => {
    try {
      const jsonString = exportData();
      const fileUri = FileSystem.documentDirectory + 'task-master-backup.json';
      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Export", "Sdílení není na tomto zařízení dostupné.");
      }
    } catch (error) {
      Alert.alert("Chyba", "Nepodařilo se vyexportovat data.");
    }
  };

  const handleImport = () => {
    Alert.alert(
      "⚠️ Pozor - Přepsání dat",
      "Import dat přepíše všechny aktuální úkoly. Opravdu chcete pokračovat?",
      [
        { text: "Zrušit", style: "cancel" },
        { 
          text: "Importovat", 
          style: "destructive", 
          onPress: () => {
            try {
              importData(importJsonText);
              Alert.alert("Úspěch", "Data byla úspěšně importována.");
              setImportJsonText('');
            } catch (e) {
              Alert.alert("Chyba", "Neplatný formát JSON.");
            }
          } 
        }
      ]
    );
  };

  const clearCompletedManual = () => {
    Alert.alert(
      "Vymazat hotové úkoly",
      "Opravdu chcete trvale odstranit všechny dokončené úkoly?",
      [
        { text: "Zrušit", style: "cancel" },
        { 
          text: "Vymazat", 
          style: "destructive", 
          onPress: () => {
            // Skrze prázdný import nebo přepsání pole completedTasks v store
            // Zde zavoláme interní reset přes import/export nebo úpravou store, 
            // pro zjednodušení přepíšeme data s prázdným polem completedTasks
            const current = JSON.parse(exportData());
            current.completedTasks = [];
            importData(JSON.stringify(current));
          } 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <Settings size={24} color={Theme.colors.accent} />
        <Text style={styles.headerTitle}>Nastavení a systém</Text>
      </View>

      {/* Globální notifikace */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oznámení</Text>
        <View style={styles.rowBetween}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Bell size={20} color={Theme.colors.textMuted} style={{marginRight: 10}} />
            <Text style={styles.textMain}>Povolit lokální notifikace</Text>
          </View>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.accent }}
          />
        </View>

        <Text style={styles.subLabel} style={{marginTop: 12}}>Šablony časů pro upozornění:</Text>
        {notificationTemplates.map((tpl) => (
          <View key={tpl} style={styles.itemRow}>
            <Text style={styles.textMain}>⏱️ {tpl}</Text>
            <TouchableOpacity onPress={() => deleteNotificationTemplate(tpl)}>
              <Trash2 size={16} color={Theme.colors.priority.high} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.inputRow}>
          <TextInput 
            style={styles.input}
            placeholder="Nová šablona (např. 30 min předem)..."
            placeholderTextColor={Theme.colors.textMuted}
            value={newTemplateText}
            onChangeText={setNewTemplateText}
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            if(!newTemplateText.trim()) return;
            addNotificationTemplate(newTemplateText);
            setNewTemplateText('');
          }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Správa štítků */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Správa vlastních štítků</Text>
        {customTags.map((tag) => (
          <View key={tag} style={styles.itemRow}>
            <Text style={styles.textMain}>● {tag}</Text>
            <TouchableOpacity onPress={() => confirmDeleteTag(tag)}>
              <Trash2 size={16} color={Theme.colors.priority.high} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.inputRow}>
          <TextInput 
            style={styles.input}
            placeholder="Název nového štítku..."
            placeholderTextColor={Theme.colors.textMuted}
            value={newTagText}
            onChangeText={setNewTagText}
          />
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            if(!newTagText.trim()) return;
            addTag(newTagText);
            setNewTagText('');
          }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zálohování dat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Záloha a obnova dat (JSON)</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Download size={18} color="#FFFFFF" style={{marginRight: 8}} />
          <Text style={styles.actionBtnText}>Exportovat zálohu (JSON)</Text>
        </TouchableOpacity>

        <TextInput 
          style={[styles.input, {height: 80, textAlignVertical: 'top', marginTop: 12}]}
          placeholder="Vložte JSON pro import..."
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          value={importJsonText}
          onChangeText={setImportJsonText}
        />
        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: Theme.colors.priority.high, marginTop: 8}]} onPress={handleImport}>
          <Upload size={18} color="#FFFFFF" style={{marginRight: 8}} />
          <Text style={styles.actionBtnText}>Importovat zálohu</Text>
        </TouchableOpacity>
      </View>

      {/* Ruční vymazání hotových úkolů */}
      <View style={[styles.section, {marginBottom: 40}]}>
        <Text style={styles.sectionTitle}>Správa historie</Text>
        <TouchableOpacity style={[styles.actionBtn, {backgroundColor: Theme.colors.cardSecondary, borderWidth: 1, borderColor: Theme.colors.border}]} onPress={clearCompletedManual}>
          <Trash2 size={18} color={Theme.colors.priority.high} style={{marginRight: 8}} />
          <Text style={[styles.actionBtnText, {color: Theme.colors.priority.high}]}>Vymazat hotové úkoly ({completedTasks.length})</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: Theme.colors.textMain, fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  section: { backgroundColor: Theme.colors.card, padding: 16, borderRadius: Theme.borderRadius, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  sectionTitle: { color: Theme.colors.accent, fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  textMain: { color: Theme.colors.textMain, fontSize: 14 },
  subLabel: { color: Theme.colors.textMuted, fontSize: 13, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.cardSecondary, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.border },
  inputRow: { flexDirection: 'row', marginTop: 8 },
  input: { flex: 1, backgroundColor: Theme.colors.cardSecondary, color: Theme.colors.textMain, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border, fontSize: 14, marginRight: 8 },
  addBtn: { backgroundColor: Theme.colors.accent, justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 10 },
  actionBtn: { flexDirection: 'row', backgroundColor: Theme.colors.accent, padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});
