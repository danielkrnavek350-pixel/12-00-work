import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '../lib/theme';
import { haptic } from '../lib/haptics';
import { formatDueDate, isOverdue } from '../lib/utils';
import type { Category, Task } from '../lib/types';
import { Check, Clock, Pin, Star } from 'lucide-react-native';
import { RectButton } from 'react-native-gesture-handler';

interface Props {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
  onUnpin: (id: string) => void;
}

export function FocusBanner({ task, category, onToggle, onOpen, onUnpin }: Props) {
  const total = task.subtasks.length;
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const pct = total > 0 ? doneCount / total : task.done ? 1 : 0;
  const overdue = isOverdue(task);
  const catColor = category?.color || colors.primary;

  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(pct, { duration: 500 });
  }, [pct, width]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(width.value, [0, 1], [0, 100])}%`,
  }));

  const checkScale = useSharedValue(1);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = () => {
    haptic(task.done ? 'light' : 'success');
    checkScale.value = withTiming(0.85, { duration: 90 }, () => {
      checkScale.value = withTiming(1, { duration: 120 });
    });
    onToggle(task.id);
  };

  const handleUnpin = () => {
    haptic('light');
    onUnpin(task.id);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: catColor }]} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pin size={14} color={colors.star} fill={colors.star} />
            <Text style={styles.headerLabel}>Fokus úkol</Text>
          </View>
          <RectButton onPress={handleUnpin} underlayColor="transparent" activeOpacity={0.6} style={styles.unpinBtn}>
            <Text style={styles.unpinText}>Odepnout</Text>
          </RectButton>
        </View>

        <View style={styles.body}>
          <RectButton
            style={styles.checkboxWrap}
            underlayColor="transparent"
            activeOpacity={0.6}
            onPress={handleToggle}
          >
            <Animated.View style={[styles.checkbox, task.done && styles.checkboxDone, checkStyle]}>
              {task.done && <Check color={colors.amoled} size={20} strokeWidth={3} />}
            </Animated.View>
          </RectButton>

          <RectButton style={styles.bodyText} underlayColor="transparent" activeOpacity={0.85} onPress={() => onOpen(task)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
              {task.description ? <Text style={styles.desc} numberOfLines={1}>{task.description}</Text> : null}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={12} color={overdue ? colors.high : colors.text3} />
                  <Text style={[styles.metaText, overdue && { color: colors.high }]}>
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
                {category ? (
                  <View style={[styles.catBadge, { backgroundColor: catColor + '22' }]}>
                    <Text style={[styles.catText, { color: catColor }]}>{category.name}</Text>
                  </View>
                ) : null}
                {task.priority === 'high' ? (
                  <View style={styles.starBadge}>
                    <Star size={11} color={colors.star} fill={colors.star} />
                    <Text style={styles.starText}>Důležité</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </RectButton>
        </View>

        {total > 0 ? (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: catColor }]} />
            </View>
            <Text style={styles.progressLabel}>
              {`${doneCount} z ${total} hotovo · ${Math.round(pct * 100)}%`}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 24,
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
  },
  accentBar: { width: 4 },
  inner: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLabel: { ...typography.smallM, color: colors.star, textTransform: 'uppercase', letterSpacing: 0.5 },
  unpinBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.surface2 },
  unpinText: { ...typography.smallM, color: colors.text3 },
  body: { flexDirection: 'row', gap: 12 },
  checkboxWrap: { borderRadius: 999, marginTop: 2 },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.mint, borderColor: colors.mint },
  bodyText: { flex: 1 },
  title: { ...typography.title, color: colors.text, fontSize: 19 },
  desc: { ...typography.small, color: colors.text2, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.caption, color: colors.text3 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catText: { ...typography.caption },
  starBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.star + '22' },
  starText: { ...typography.caption, color: colors.star },
  progressSection: { marginTop: 14, gap: 6 },
  progressTrack: { height: 6, backgroundColor: colors.surface3, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { ...typography.small, color: colors.text3 },
});
