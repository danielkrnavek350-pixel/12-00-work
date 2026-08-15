import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { colors, typography } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import type { Category, Task } from '@/lib/types';
import { Check, Star, Trash2, Pin, ChevronDown, ChevronUp } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onOpen: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function TaskCard({
  task,
  category,
  onToggle,
  onSubtaskToggle,
  onOpen,
  onDelete,
  onToggleStar,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    haptic('light');
    onToggle(task.id);
  };

  const handleStar = () => {
    haptic('light');
    onToggleStar(task.id);
  };

  const handleDelete = () => {
    haptic('warning');
    onDelete(task.id);
  };

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.done).length || 0;

  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.card, task.done && styles.cardDone]}
    >
      <View style={styles.mainRow}>
        <Pressable onPress={handleToggle} style={styles.checkBtn} hitSlop={8}>
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done && <Check size={14} color="#FFF" />}
          </View>
        </Pressable>

        <Pressable onPress={() => onOpen(task)} style={styles.content}>
          <View style={styles.titleRow}>
            {task.pinned && <Pin size={13} color={colors.primary} style={styles.pinIcon} />}
            <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
              {task.title}
            </Text>
          </View>

          {task.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {category && (
              <View style={[styles.badge, { backgroundColor: category.color + '22' }]}>
                <View style={[styles.badgeDot, { backgroundColor: category.color }]} />
                <Text style={[styles.badgeText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}

            {subtasksCount > 0 && (
              <Pressable onPress={() => setExpanded(!expanded)} style={styles.subtaskBadge}>
                <Text style={styles.subtaskBadgeText}>
                  {completedSubtasks}/{subtasksCount} Podúkoly
                </Text>
                {expanded ? <ChevronUp size={12} color={colors.text3} /> : <ChevronDown size={12} color={colors.text3} />}
              </Pressable>
            )}
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable onPress={handleStar} style={styles.actionBtn} hitSlop={8}>
            <Star
              size={18}
              color={task.starred ? colors.amber : colors.text3}
              fill={task.starred ? colors.amber : 'transparent'}
            />
          </Pressable>

          <Pressable onPress={handleDelete} style={styles.actionBtn} hitSlop={8}>
            <Trash2 size={18} color={colors.high} />
          </Pressable>
        </View>
      </View>

      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <View style={styles.subtasksList}>
          {task.subtasks.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() => onSubtaskToggle?.(task.id, sub.id)}
              style={styles.subtaskItem}
            >
              <View style={[styles.subCheckbox, sub.done && styles.subCheckboxDone]}>
                {sub.done && <Check size={10} color="#FFF" />}
              </View>
              <Text style={[styles.subTitle, sub.done && styles.titleDone]}>{sub.title}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(22, 10, 36, 0.72)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.18)',
  },
  cardDone: {
    opacity: 0.6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkBtn: {
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinIcon: {
    transform: [{ rotate: '45deg' }],
  },
  title: {
    ...typography.bodyM,
    color: colors.text,
    fontSize: 15,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.text3,
  },
  desc: {
    ...typography.small,
    color: colors.text3,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...typography.smallM,
    fontSize: 11,
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subtaskBadgeText: {
    ...typography.small,
    color: colors.text3,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  subtasksList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(157, 78, 221, 0.1)',
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.text3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCheckboxDone: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  subTitle: {
    ...typography.small,
    color: colors.text2,
  },
});
