import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '../lib/theme';
import { haptic } from '../lib/haptics';
import { isOverdue, formatDueDate, formatCountdown } from '../lib/utils';
import { priorityMeta, recurrenceMeta } from '../lib/theme';
import type { Category, Task } from '../lib/types';
import { Check, ChevronRight, Clock, Pencil, Repeat, Star, Trash2 } from 'lucide-react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface Props {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onSubtaskToggle: (taskId: string, subId: string) => void;
  onOpen: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onPin?: (id: string) => void;
}

function ProgressFill({ task, category }: { task: Task; category?: Category }) {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  const pct = total > 0 ? done / total : task.done ? 1 : 0;
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(pct, { duration: 450 });
  }, [pct, width]);
  const style = useAnimatedStyle(() => ({
    width: `${interpolate(width.value, [0, 1], [0, 100])}%`,
  }));
  const fill = task.done ? colors.mint : category?.color || colors.primary;
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style, { backgroundColor: fill }]} />
    </View>
  );
}

function LeftAction({ dragAnimatedStyle, onPress }: any) {
  return (
    <RectButton style={styles.starAction} onPress={onPress}>
      <Animated.View style={[styles.starInner, dragAnimatedStyle]}>
        <Star size={22} color={colors.star} fill={colors.star} />
      </Animated.View>
    </RectButton>
  );
}

function RightActions({ dragAnimatedStyle, onEdit, onDelete }: any) {
  return (
    <View style={styles.rightActions}>
      <RectButton style={styles.rightBtnEdit} onPress={onEdit}>
        <Animated.View style={[styles.rightBtnInner, { backgroundColor: colors.secondary }, dragAnimatedStyle]}>
          <Pencil size={20} color={colors.text} />
        </Animated.View>
      </RectButton>
      <RectButton style={styles.rightBtnDelete} onPress={onDelete}>
        <Animated.View style={[styles.rightBtnInner, { backgroundColor: colors.high }, dragAnimatedStyle]}>
          <Trash2 size={20} color={colors.text} />
        </Animated.View>
      </RectButton>
    </View>
  );
}

export function TaskCard({
  task,
  category,
  onToggle,
  onSubtaskToggle,
  onOpen,
  onDelete,
  onToggleStar,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!task.done) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [task.done]);
  const countdown = task.done ? formatCountdown(task) : null;
  const total = task.subtasks.length;
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : task.done ? 100 : 0;
  const overdue = isOverdue(task);
  const pm = priorityMeta[task.priority];
  const rm = recurrenceMeta[task.recurrence];
  const isStarred = task.priority === 'high';

  const checkScale = useSharedValue(1);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(task.done ? 0.45 : 1, { duration: 250 }),
  }));

  const handleToggle = () => {
    haptic(task.done ? 'light' : 'success');
    checkScale.value = withTiming(0.85, { duration: 90 }, () => {
      checkScale.value = withTiming(1, { duration: 120 });
    });
    onToggle(task.id);
  };

  const handleStar = () => {
    haptic('medium');
    onToggleStar(task.id);
  };

  const handleDelete = () => {
    haptic('warning');
    onDelete(task.id);
  };

  const handleEdit = () => {
    haptic('light');
    onOpen(task);
  };

  const renderLeft = () => <LeftAction onPress={handleStar} />;
  const renderRight = () => <RightActions onEdit={handleEdit} onDelete={handleDelete} />;

  return (
    <Swipeable
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
      overshootFriction={8}
      enableTrackpadTwoFingerGesture={Platform.OS === 'ios'}
      dragOffsetFromLeftEdge={30}
      rightThreshold={40}
      leftThreshold={40}
      friction={2}
    >
      <View style={[styles.card, task.done && styles.cardDone]}>
        <View style={styles.cardInner}>
          <View style={styles.row}>
            <RectButton
              style={styles.checkboxWrap}
              underlayColor="transparent"
              activeOpacity={0.6}
              onPress={handleToggle}
            >
              <Animated.View style={[styles.checkbox, task.done && styles.checkboxDone, checkStyle]}>
                {task.done && <Check color={colors.amoled} size={18} strokeWidth={3} />}
              </Animated.View>
            </RectButton>

            <RectButton
              style={styles.body}
              underlayColor="transparent"
              activeOpacity={0.85}
              onPress={() => onOpen(task)}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <Animated.Text
                    style={[styles.title, task.done && styles.titleDone, titleStyle]}
                    numberOfLines={expanded ? undefined : 2}
                  >
                    {task.title}
                  </Animated.Text>
                  {isStarred ? (
                    <Star size={16} color={colors.star} fill={colors.star} style={styles.starInline} />
                  ) : null}
                </View>

                {task.description ? (
                  <Text style={styles.desc} numberOfLines={expanded ? undefined : 1}>
                    {task.description}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={[styles.priorityBadge, { backgroundColor: pm.color + '22' }]}>
                    <View style={[styles.dot, { backgroundColor: pm.color }]} />
                    <Text style={[styles.priorityText, { color: pm.color }]}>{pm.label}</Text>
                  </View>

                  {category ? (
                    <View style={[styles.catBadge, { backgroundColor: category.color + '22' }]}>
                      <Text style={[styles.catText, { color: category.color }]}>{category.name}</Text>
                    </View>
                  ) : null}

                  {task.recurrence !== 'once' ? (
                    <View style={styles.metaItem}>
                      <Repeat size={12} color={colors.secondary} />
                      <Text style={[styles.metaText, { color: colors.secondary }]}>{rm.short}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={12} color={overdue ? colors.high : colors.text3} />
                    <Text style={[styles.metaText, overdue && { color: colors.high }]}>
                      {formatDueDate(task.dueDate)}
                    </Text>
                  </View>
                  {total > 0 ? (
                    <Text style={styles.subCount}>{`${doneCount} z ${total} hotovo · ${pct}%`}</Text>
                  ) : null}
                </View>

                {countdown ? (
                  <View style={styles.countdownPill}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                ) : null}

                {total > 0 && <ProgressFill task={task} category={category} />}

                {total > 0 ? (
                  <RectButton
                    underlayColor="transparent"
                    activeOpacity={0.6}
                    onPress={() => {
                      haptic('light');
                      setExpanded((e) => !e);
                    }}
                    style={styles.expandBtn}
                  >
                    <Text style={styles.expandText}>
                      {expanded ? 'Skrýt podúkoly' : `Zobrazit podúkoly (${total})`}
                    </Text>
                    <ChevronRight
                      size={16}
                      color={colors.primary}
                      style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
                    />
                  </RectButton>
                ) : null}

                {expanded && total > 0 ? (
                  <View style={styles.subtasks}>
                    {task.subtasks.map((s) => (
                      <RectButton
                        key={s.id}
                        underlayColor="transparent"
                        activeOpacity={0.6}
                        onPress={() => {
                          haptic('light');
                          onSubtaskToggle(task.id, s.id);
                        }}
                        style={styles.subRow}
                      >
                        <View style={[styles.subCheck, s.done && styles.subCheckDone]}>
                          {s.done && <Check color={colors.amoled} size={12} strokeWidth={3} />}
                        </View>
                        <Text style={[styles.subText, s.done && styles.subTextDone]}>{s.title}</Text>
                      </RectButton>
                    ))}
                  </View>
                ) : null}
              </View>
            </RectButton>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
  },
  cardDone: { opacity: 0.85 },
  cardInner: { padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  checkboxWrap: { borderRadius: 999, marginTop: 2 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxDone: { backgroundColor: colors.mint, borderColor: colors.mint },
  body: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { ...typography.bodyM, color: colors.text, flex: 1 },
  titleDone: { textDecorationLine: 'line-through' },
  starInline: { marginTop: 2, marginLeft: 6 },
  desc: { ...typography.small, color: colors.text2, marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { ...typography.caption },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catText: { ...typography.caption },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.caption, color: colors.text3 },
  subCount: { ...typography.caption, color: colors.text3 },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surface3,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2 },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  expandText: { ...typography.smallM, color: colors.primary },
  subtasks: {
    marginTop: 10,
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingRight: 4,
  },
  subCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckDone: { backgroundColor: colors.mint, borderColor: colors.mint },
  subText: { ...typography.small, color: colors.text2, flex: 1 },
  subTextDone: { textDecorationLine: 'line-through', color: colors.text3 },
  starAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    marginBottom: 12,
  },
  starInner: {
    width: 64,
    height: '100%',
    backgroundColor: colors.star,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: { flexDirection: 'row', marginBottom: 12 },
  rightBtnEdit: { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 0 },
  rightBtnDelete: { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 20 },
  rightBtnInner: {
    width: 64,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: colors.mint + '18',
  },
  countdownText: { ...typography.caption, color: colors.mint },
});
