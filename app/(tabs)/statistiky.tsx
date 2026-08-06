import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { colors, typography, priorityMeta } from '@/lib/theme';
import { useTasks } from '@/lib/useTasks';
import { CheckCircle2, Clock, Flame, TrendingUp } from 'lucide-react-native';
import { GalaxyBackground } from '@/components/GalaxyBackground';

export default function StatsScreen() {
  const { tasks, categories } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const active = total - done;
    const overdue = tasks.filter(
      (t) => !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now(),
    ).length;
    const byPriority = {
      high: tasks.filter((t) => t.priority === 'high' && !t.done).length,
      medium: tasks.filter((t) => t.priority === 'medium' && !t.done).length,
      low: tasks.filter((t) => t.priority === 'low' && !t.done).length,
    };
    const byCategory = categories.map((c) => ({
      cat: c,
      total: tasks.filter((t) => t.category === c.id).length,
      done: tasks.filter((t) => t.category === c.id && t.done).length,
    }));
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, active, overdue, byPriority, byCategory, completionRate };
  }, [tasks, categories]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GalaxyBackground>
      <View style={styles.container}>
        <Text style={styles.heroTitle}>Statistiky</Text>
        <Text style={styles.subtitle}>Přehled tvé produktivity</Text>

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bigCard}>
            <View style={styles.bigCardTop}>
              <View style={[styles.bigIcon, { backgroundColor: colors.primary + '22' }]}>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={styles.bigCardLabel}>Celková dokončenost</Text>
            </View>
            <Text style={styles.bigCardValue}>{stats.completionRate}%</Text>
            <View style={styles.bigBar}>
              <View style={[styles.bigBarFill, { width: `${stats.completionRate}%` }]} />
            </View>
            <Text style={styles.bigCardSub}>
              {`${stats.done} z ${stats.total} úkolů hotovo`}
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <Kpi
              icon={<Clock size={20} color={colors.secondary} />}
              bg={colors.secondary + '22'}
              value={stats.active}
              label="Aktivní"
            />
            <Kpi
              icon={<CheckCircle2 size={20} color={colors.mint} />}
              bg={colors.mint + '22'}
              value={stats.done}
              label="Hotové"
            />
            <Kpi
              icon={<Flame size={20} color={colors.high} />}
              bg={colors.high + '22'}
              value={stats.overdue}
              label="Po termínu"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktivní podle priority</Text>
            <View style={styles.card}>
              {(['high', 'medium', 'low'] as const).map((p) => {
                const count = stats.byPriority[p];
                const max = Math.max(stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low, 1);
                const pct = (count / max) * 100;
                const meta = priorityMeta[p];
                return (
                  <View key={p} style={styles.barRow}>
                    <View style={styles.barLabelRow}>
                      <View style={[styles.dot, { backgroundColor: meta.color }]} />
                      <Text style={styles.barLabel}>{meta.label}</Text>
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Podle kategorie</Text>
            <View style={styles.card}>
              {stats.byCategory.length === 0 ? (
                <Text style={styles.empty}>Žádné kategorie</Text>
              ) : (
                stats.byCategory.map(({ cat, total, done }) => {
                  const pct = total > 0 ? (done / total) * 100 : 0;
                  return (
                    <View key={cat.id} style={styles.catRow}>
                      <View style={styles.catTop}>
                        <View style={styles.catLeft}>
                          <View style={[styles.dot, { backgroundColor: cat.color }]} />
                          <Text style={styles.catName}>{cat.name}</Text>
                        </View>
                        <Text style={styles.catCount}>{`${done}/${total}`}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </Animated.ScrollView>
      </View>
      </GalaxyBackground>
    </SafeAreaView>
  );
}

function Kpi({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.kpi}>
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>{icon}</View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, paddingHorizontal: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 8 },
  heroTitle: { ...typography.hero, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body, color: colors.text3, marginBottom: 16 },
  bigCard: {
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
  },
  bigCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  bigIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bigCardLabel: { ...typography.bodyM, color: colors.text2 },
  bigCardValue: { ...typography.hero, color: colors.text, fontSize: 48, marginBottom: 14 },
  bigBar: { height: 8, backgroundColor: colors.surface3, borderRadius: 4, overflow: 'hidden' },
  bigBarFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  bigCardSub: { ...typography.small, color: colors.text3, marginTop: 10 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpi: {
    flex: 1,
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
  },
  kpiIcon: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { ...typography.h2, color: colors.text },
  kpiLabel: { ...typography.small, color: colors.text3 },
  section: { marginBottom: 16 },
  sectionTitle: { ...typography.h2, color: colors.text, fontSize: 17, marginBottom: 10, paddingHorizontal: 4 },
  card: { backgroundColor: 'rgba(22, 10, 36, 0.72)', borderRadius: 24, padding: 18, gap: 16, borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.18)' },
  barRow: { gap: 8 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  barLabel: { ...typography.bodyM, color: colors.text2, flex: 1 },
  barCount: { ...typography.bodyM, color: colors.text },
  barTrack: { height: 6, backgroundColor: colors.surface3, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  catRow: { gap: 8 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catName: { ...typography.bodyM, color: colors.text2 },
  catCount: { ...typography.smallM, color: colors.text3 },
  empty: { ...typography.body, color: colors.text3, textAlign: 'center', paddingVertical: 12 },
});
