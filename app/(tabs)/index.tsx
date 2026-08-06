import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { useAuth } from '@/lib/auth';
import { useTasks } from '@/lib/useTasks';
import { matchesSmartFilter, countForSmartFilter, sortTasks, searchTasks } from '@/lib/utils';
import type { SmartFilter, Task } from '@/lib/types';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { SmartGrid } from '@/components/SmartGrid';
import { FocusBanner } from '@/components/FocusBanner';
import { SearchBar } from '@/components/SearchBar';
import { AuthScreen } from '@/components/AuthScreen';
import { GalaxyBackground } from '@/components/GalaxyBackground';
import { Plus, User } from 'lucide-react-native';
import { RectButton } from 'react-native-gesture-handler';

export default function TasksScreen() {
  const { user, isGuest, signOut } = useAuth();
  const {
    tasks,
    categories,
    loading,
    syncing,
    addTask,
    updateTask,
    toggleTask,
    toggleSubtask,
    deleteTask,
    togglePin,
    togglePriorityStar,
    addCategory,
  } = useTasks();

  const [smartFilter, setSmartFilter] = useState<SmartFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const scrollY = useSharedValue(0);

  const pinnedTask = useMemo(() => tasks.find((t) => t.pinned && !t.done) || null, [tasks]);

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => matchesSmartFilter(t, smartFilter) && !t.pinned);
    if (searchQuery.trim()) {
      list = searchTasks(list, searchQuery);
    }
    return sortTasks(list);
  }, [tasks, smartFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      today: countForSmartFilter(tasks, 'today'),
      scheduled: countForSmartFilter(tasks, 'scheduled'),
      starred: countForSmartFilter(tasks, 'starred'),
      done: countForSmartFilter(tasks, 'done'),
    }),
    [tasks],
  );

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - activeCount;

  const titleStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, 120], [1, 0.62], Extrapolation.CLAMP);
    const ty = interpolate(scrollY.value, [0, 120], [0, -8], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY: ty }] };
  });

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(scrollY.value > 8 ? 1 : 0, { duration: 200 }),
  }));

  const openNew = () => {
    haptic('light');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    haptic('light');
    setEditing(task);
    setFormOpen(true);
  };

  const handleSubmit = (task: Task) => {
    if (editing) updateTask(task);
    else addTask(task);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      haptic('warning');
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleSmartFilter = (f: SmartFilter) => {
    haptic('light');
    setSmartFilter(f);
  };

  const handleProfilePress = () => {
    haptic('light');
    if (user) {
      signOut();
    } else {
      setAuthOpen(true);
    }
  };

  const profileLabel = user ? user.email?.[0]?.toUpperCase() || 'U' : isGuest ? 'G' : '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GalaxyBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.miniHeader, headerOpacity]} pointerEvents="none">
          <Text style={styles.miniTitle} numberOfLines={1}>Moje úkoly</Text>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={(e) => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Animated.Text style={[styles.heroTitle, titleStyle]}>Moje úkoly</Animated.Text>
            <RectButton
              style={styles.profileBtn}
              underlayColor={colors.surface3}
              activeOpacity={0.7}
              onPress={handleProfilePress}
            >
              {user ? (
                <Text style={styles.profileAvatar}>{profileLabel}</Text>
              ) : (
                <View style={styles.profileIconWrap}>
                  <User size={18} color={colors.primary} />
                </View>
              )}
            </RectButton>
          </View>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>
              {activeCount} aktivních · {doneCount} hotových
            </Text>
            {syncing ? <Text style={styles.syncText}>Synchronizuji…</Text> : null}
            {!user && !isGuest ? (
              <RectButton
                underlayColor="transparent"
                activeOpacity={0.7}
                onPress={() => {
                  haptic('light');
                  setAuthOpen(true);
                }}
                style={styles.cloudBtn}
              >
                <Text style={styles.cloudBtnText}>Přihlásit se pro zálohu na cloud</Text>
              </RectButton>
            ) : null}
          </View>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <SmartGrid active={smartFilter} onChange={handleSmartFilter} counts={counts} />

          {pinnedTask && (
            <FocusBanner
              task={pinnedTask}
              category={categories.find((c) => c.id === pinnedTask.category)}
              onToggle={toggleTask}
              onOpen={openEdit}
              onUnpin={togglePin}
            />
          )}

          <View style={styles.list}>
            {loading ? (
              <Text style={styles.empty}>Načítám…</Text>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Žádné úkoly</Text>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? 'Žádné úkoly neodpovídají vyhledávání.'
                    : 'Klepněte na tlačítko + a vytvořte první úkol.'}
                </Text>
              </View>
            ) : (
              filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories.find((c) => c.id === task.category)}
                  onToggle={toggleTask}
                  onSubtaskToggle={toggleSubtask}
                  onOpen={openEdit}
                  onDelete={(id) => setDeleteTarget(tasks.find((t) => t.id === id) || null)}
                  onToggleStar={togglePriorityStar}
                />
              ))
            )}
          </View>
        </Animated.ScrollView>

        <RectButton
          style={styles.fab}
          underlayColor={colors.secondary}
          activeOpacity={0.85}
          onPress={openNew}
        >
          <Plus size={28} color={colors.text} />
        </RectButton>

        <TaskForm
          visible={formOpen}
          task={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          onAddCategory={addCategory}
        />

        <ConfirmModal
          visible={!!deleteTarget}
          title="Smazat úkol?"
          message={`Opravdu chcete smazat „${deleteTarget?.title || ''}"? Tuto akci nelze vrátit.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        <AuthScreen visible={authOpen} onClose={() => setAuthOpen(false)} />
      </View>
      </GalaxyBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, position: 'relative' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: Platform.OS === 'web' ? 24 : 8,
  },
  miniHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 1, 8, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    zIndex: 4,
  },
  miniTitle: { ...typography.h2, color: colors.text, fontSize: 17 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTitle: {
    ...typography.hero,
    color: colors.text,
    transformOrigin: 'left',
    marginBottom: 4,
    flex: 1,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  profileAvatar: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 18,
  },
  profileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subtitle: { ...typography.body, color: colors.text3 },
  syncText: { ...typography.small, color: colors.secondary },
  cloudBtn: {
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cloudBtnText: { ...typography.smallM, color: colors.primary },
  list: { paddingTop: 4 },
  empty: { ...typography.body, color: colors.text3, textAlign: 'center', marginTop: 40 },
  emptyBox: { marginTop: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { ...typography.h2, color: colors.text2 },
  emptyText: { ...typography.body, color: colors.text3, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
