import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { colors, typography } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { useTasks } from '@/lib/useTasks';
import { useAuth } from '@/lib/auth';
import { ensureNotificationPermission } from '@/lib/notifications';
import { loadTasks, saveTasks, loadCategories, saveCategories } from '@/lib/storage';
import { ConfirmModal } from '@/components/ConfirmModal';
import { BatteryOptimizationModal } from '@/components/BatteryOptimizationModal';
import { GalaxyBackground } from '@/components/GalaxyBackground';
import type { Category, Task } from '@/lib/types';
import {
  Bell,
  BellOff,
  Download,
  Info,
  LogOut,
  Plus,
  Trash2,
  Upload,
  User,
  Battery as BatteryIcon,
} from 'lucide-react-native';

const palette = ['#3E82F7', '#6C5CE7', '#2ED573', '#FF9F43', '#FF4B4B', '#00CEC9', '#F368E0', '#FDA7DF'];

export default function SettingsScreen() {
  const { categories, addCategory, deleteCategory, tasks } = useTasks();
  const { user, isGuest, signOut } = useAuth();
  const [notifGranted, setNotifGranted] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(palette[0]);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [batteryOpen, setBatteryOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void ensureNotificationPermission().then(setNotifGranted);
    }
  }, []);

  const requestNotif = async () => {
    haptic('light');
    const ok = await ensureNotificationPermission();
    setNotifGranted(ok);
  };

  const createCat = () => {
    const n = newName.trim();
    if (!n) return;
    addCategory(n, newColor);
    setNewName('');
    setShowAddCat(false);
    haptic('medium');
  };

  const confirmDeleteCat = () => {
    if (deleteCat) {
      deleteCategory(deleteCat.id);
      setDeleteCat(null);
      haptic('warning');
    }
  };

  const usedCount = (catId: string) => tasks.filter((t) => t.category === catId).length;

  const exportData = async () => {
    haptic('light');
    const allTasks = await loadTasks();
    const allCats = await loadCategories();
    const data = JSON.stringify({ tasks: allTasks, categories: allCats, exportedAt: new Date().toISOString() }, null, 2);
    if (Platform.OS === 'web') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moje-ukoly-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = () => {
    haptic('light');
    setImportError(null);
    setImportSuccess(false);
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as { tasks?: Task[]; categories?: Category[] };
        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          setImportError('Neplatný formát souboru.');
          return;
        }
        await saveTasks(parsed.tasks as Task[]);
        if (parsed.categories && Array.isArray(parsed.categories)) {
          await saveCategories(parsed.categories as Category[]);
        }
        setImportSuccess(true);
        haptic('success');
      } catch {
        setImportError('Nepodařilo se načíst soubor. Zkontrolujte formát JSON.');
      }
    };
    input.click();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GalaxyBackground>
      <View style={styles.container}>
        <Text style={styles.heroTitle}>Nastavení</Text>
        <Text style={styles.subtitle}>Předvolby a kategorie</Text>

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Účet</Text>
            <View style={styles.card}>
              {user ? (
                <View style={styles.accountRow}>
                  <View style={styles.accountIcon}>
                    <Text style={styles.accountAvatar}>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountEmail}>{user.email}</Text>
                    <Text style={styles.accountStatus}>Přihlášeno · Cloud sync aktivní</Text>
                  </View>
                  <Pressable onPress={() => { haptic('warning'); signOut(); }} style={styles.logoutBtn}>
                    <LogOut size={16} color={colors.high} />
                    <Text style={styles.logoutText}>Odhlásit se</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.accountRow}>
                  <View style={styles.accountIcon}>
                    <User size={20} color={colors.text3} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountEmail}>
                      {isGuest ? 'Host' : 'Nepřihlášen'}
                    </Text>
                    <Text style={styles.accountStatus}>
                      {isGuest ? 'Místní data bez cloudové zálohy' : 'Přihlaste se pro cloudovou synchronizaci'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oznámení</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: notifGranted ? colors.mint + '22' : colors.high + '22' }]}>
                  {notifGranted ? <Bell size={20} color={colors.mint} /> : <BellOff size={20} color={colors.high} />}
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>Připomenutí úkolů</Text>
                  <Text style={styles.rowSub}>
                    {notifGranted
                      ? 'Oznámení jsou povolena. Upozornění dorazí včas podle termínu.'
                      : 'Oznámení nejsou povolena. Klepněte pro povolení.'}
                  </Text>
                </View>
                {!notifGranted && Platform.OS !== 'web' ? (
                  <Pressable onPress={requestNotif} style={styles.enableBtn}>
                    <Text style={styles.enableBtnText}>Povolit</Text>
                  </Pressable>
                ) : null}
              </View>
              {Platform.OS === 'web' ? (
                <Text style={styles.note}>
                  V prohlížeči nejsou lokální oznámení podporována. Nainstalujte aplikaci do zařízení pro plnou funkci připomínání.
                </Text>
              ) : null}
            </View>
          </View>

          {Platform.OS === 'android' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Baterie</Text>
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.medium + '22' }]}>
                    <BatteryIcon size={20} color={colors.medium} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>Optimalizace baterie</Text>
                    <Text style={styles.rowSub}>
                      Vypněte optimalizaci baterie pro spolehlivá připomenutí na pozadí.
                    </Text>
                  </View>
                  <Pressable onPress={() => { haptic('light'); setBatteryOpen(true); }} style={styles.enableBtn}>
                    <Text style={styles.enableBtnText}>Otevřít</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Záloha dat</Text>
            <View style={styles.card}>
              <Pressable onPress={exportData} style={({ pressed }) => [styles.backupBtn, pressed && { opacity: 0.7 }]}>
                <Download size={18} color={colors.primary} />
                <Text style={styles.backupBtnText}>Exportovat do JSON</Text>
              </Pressable>
              <Pressable onPress={importData} style={({ pressed }) => [styles.backupBtn, pressed && { opacity: 0.7 }]}>
                <Upload size={18} color={colors.secondary} />
                <Text style={[styles.backupBtnText, { color: colors.secondary }]}>Importovat z JSON</Text>
              </Pressable>
              {importError ? (
                <Text style={styles.importError}>{importError}</Text>
              ) : null}
              {importSuccess ? (
                <Text style={styles.importSuccess}>Data byla úspěšně importována. Restartujte aplikaci pro načtení.</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kategorie</Text>
              <Pressable
                onPress={() => { haptic('light'); setShowAddCat((v) => !v); }}
                style={styles.addBtn}
              >
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addBtnText}>Přidat</Text>
              </Pressable>
            </View>

            {showAddCat ? (
              <View style={styles.newCatBox}>
                <input
                  value={newName}
                  onChange={(e) => setNewName((e.target as HTMLInputElement).value)}
                  placeholder="Název kategorie"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(31, 16, 48, 0.65)',
                    borderWidth: 1,
                    borderColor: 'rgba(157, 78, 221, 0.12)',
                    color: colors.text,
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <View style={styles.colorRow}>
                  {palette.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setNewColor(c)}
                      style={[styles.colorDot, { backgroundColor: c }, newColor === c && styles.colorDotActive]}
                    />
                  ))}
                </View>
                <Pressable onPress={createCat} style={styles.createBtn}>
                  <Text style={styles.createBtnText}>Vytvořit kategorii</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.card}>
              {categories.length === 0 ? (
                <Text style={styles.empty}>Žádné kategorie</Text>
              ) : (
                categories.map((c) => (
                  <View key={c.id} style={styles.catRow}>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                    <Text style={styles.catName}>{c.name}</Text>
                    <Text style={styles.catCount}>{usedCount(c.id)} úkolů</Text>
                    <Pressable onPress={() => setDeleteCat(c)} hitSlop={10}>
                      <Trash2 size={16} color={colors.text3} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O aplikaci</Text>
            <View style={styles.card}>
              <View style={styles.aboutRow}>
                <Info size={18} color={colors.text3} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aboutTitle}>Moje úkoly</Text>
                  <Text style={styles.aboutSub}>
                    Produkční to-do aplikace v duchu Samsung One UI s cloudovou synchronizací.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        <ConfirmModal
          visible={!!deleteCat}
          title="Smazat kategorii?"
          message={`Opravdu chcete smazat kategorii „${deleteCat?.name || ''}"? Úkoly v této kategorii zůstanou, ale ztratí štítek.`}
          onConfirm={confirmDeleteCat}
          onCancel={() => setDeleteCat(null)}
        />

        <BatteryOptimizationModal visible={batteryOpen} onClose={() => setBatteryOpen(false)} />
      </View>
      </GalaxyBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, paddingHorizontal: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 8 },
  heroTitle: { ...typography.hero, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body, color: colors.text3, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 },
  sectionTitle: { ...typography.h2, color: colors.text, fontSize: 17, marginBottom: 10, paddingHorizontal: 4 },
  card: { backgroundColor: 'rgba(22, 10, 36, 0.72)', borderRadius: 24, padding: 18, gap: 14, borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.18)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.bodyM, color: colors.text },
  rowSub: { ...typography.small, color: colors.text3, marginTop: 3 },
  enableBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  enableBtnText: { ...typography.smallM, color: colors.text },
  note: { ...typography.small, color: colors.text3, marginTop: 10 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(31, 16, 48, 0.6)', borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.14)', alignItems: 'center', justifyContent: 'center' },
  accountAvatar: { ...typography.h2, color: colors.primary, fontSize: 18 },
  accountInfo: { flex: 1 },
  accountEmail: { ...typography.bodyM, color: colors.text },
  accountStatus: { ...typography.small, color: colors.text3, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.high + '1A' },
  logoutText: { ...typography.smallM, color: colors.high },
  backupBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: 'rgba(31, 16, 48, 0.6)', borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.14)' },
  backupBtnText: { ...typography.bodyM, color: colors.primary },
  importError: { ...typography.small, color: colors.high, marginTop: 4 },
  importSuccess: { ...typography.small, color: colors.mint, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: 'rgba(31, 16, 48, 0.6)', borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.14)' },
  addBtnText: { ...typography.smallM, color: colors.primary },
  newCatBox: { marginBottom: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(22, 10, 36, 0.72)', borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.18)', gap: 10 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: colors.text },
  createBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  createBtnText: { ...typography.bodyM, color: colors.text },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  catName: { ...typography.bodyM, color: colors.text2, flex: 1 },
  catCount: { ...typography.small, color: colors.text3, marginRight: 8 },
  empty: { ...typography.body, color: colors.text3, textAlign: 'center', paddingVertical: 8 },
  aboutRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  aboutTitle: { ...typography.bodyM, color: colors.text },
  aboutSub: { ...typography.small, color: colors.text3, marginTop: 4 },
});
