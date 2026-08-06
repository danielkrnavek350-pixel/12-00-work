import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { colors, typography } from '../lib/theme';
import { haptic } from '../lib/haptics';
import { priorityMeta, recurrenceMeta } from '../lib/theme';
import { OptionPicker } from './OptionPicker';
import { Sheet } from './Sheet';
import type { Category, Priority, Recurrence, Subtask, Task } from '../lib/types';
import { toLocalInput, parseLocalInput, uid, detectTimeInTitle, buildDueDateFromTime } from '../lib/utils';
import { useVoiceInput } from '../lib/useVoiceInput';
import { Mic, MicOff, Plus, Sparkles, Trash2 } from 'lucide-react-native';

interface Props {
  visible: boolean;
  task: Task | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (task: Task) => void;
  onAddCategory: (name: string, color: string) => Category;
}

const palette = ['#F72585', '#9D4EDD', '#00F5D4', '#FF9F43', '#F7D36A', '#E056FD', '#8A2BE2', '#00CEC9'];

const inputStyle = {
  backgroundColor: 'rgba(31, 16, 48, 0.65)',
  borderWidth: 1,
  borderColor: 'rgba(157, 78, 221, 0.12)',
  color: colors.text,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  fontFamily: 'Inter-Regular' as const,
} as const;

export function TaskForm({ visible, task, categories, onClose, onSubmit, onAddCategory }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrence, setRecurrence] = useState<Recurrence>('once');
  const [dueDate, setDueDate] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSub, setNewSub] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(palette[0]);

  const detectedTime = useMemo(() => detectTimeInTitle(title), [title]);

  const voice = useVoiceInput((text) => {
    setTitle((prev) => (prev ? `${prev} ${text}` : text));
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setPriority(task.priority);
      setRecurrence(task.recurrence);
      setDueDate(task.dueDate ? toLocalInput(new Date(task.dueDate)) : '');
      setSubtasks(task.subtasks);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.id || '');
      setPriority('medium');
      setRecurrence('once');
      const soon = new Date();
      soon.setHours(soon.getHours() + 2, 0, 0, 0);
      setDueDate(toLocalInput(soon));
      setSubtasks([]);
    }
    setNewSub('');
    setShowNewCat(false);
  }, [task, visible, categories]);

  const addSub = () => {
    const t = newSub.trim();
    if (!t) return;
    haptic('light');
    setSubtasks((s) => [...s, { id: uid(), title: t, done: false }]);
    setNewSub('');
  };

  const removeSub = (id: string) => {
    haptic('light');
    setSubtasks((s) => s.filter((x) => x.id !== id));
  };

  const submit = () => {
    if (!title.trim()) return;
    haptic('medium');
    let finalDueDate = dueDate ? parseLocalInput(dueDate).toISOString() : null;
    if (detectedTime && !dueDate) {
      finalDueDate = buildDueDateFromTime(detectedTime.hour, detectedTime.minute).toISOString();
    } else if (detectedTime && dueDate) {
      const base = parseLocalInput(dueDate);
      finalDueDate = buildDueDateFromTime(detectedTime.hour, detectedTime.minute, base).toISOString();
    }
    const next: Task = {
      id: task?.id || uid(),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      recurrence,
      dueDate: finalDueDate,
      subtasks,
      done: task?.done || false,
      pinned: task?.pinned || false,
      createdAt: task?.createdAt || new Date().toISOString(),
      completedAt: task?.completedAt || null,
    };
    onSubmit(next);
    onClose();
  };

  const createCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const c = onAddCategory(name, newCatColor);
    setCategory(c.id);
    setNewCatName('');
    setShowNewCat(false);
    haptic('medium');
  };

  const onMicPress = () => {
    haptic('light');
    voice.toggle();
  };

  return (
    <Sheet
      visible={visible}
      title={task ? 'Upravit úkol' : 'Nový úkol'}
      onClose={onClose}
      headerAction={{
        label: 'Uložit',
        onPress: submit,
        disabled: !title.trim(),
      }}
    >
      <View style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>Název *</Text>
          {voice.supported ? (
            <Pressable
              onPress={onMicPress}
              style={({ pressed }) => [styles.micBtn, voice.listening && styles.micBtnActive, pressed && { opacity: 0.7 }]}
            >
              {voice.listening ? <Mic size={16} color={colors.amoled} /> : <Mic size={16} color={colors.primary} />}
              <Text style={[styles.micText, voice.listening && styles.micTextActive]}>
                {voice.listening ? 'Poslouchám…' : 'Diktovat'}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.micBtn, styles.micBtnDisabled]}>
              <MicOff size={16} color={colors.text4} />
              <Text style={[styles.micText, { color: colors.text4 }]}>Nedostupné</Text>
            </View>
          )}
        </View>
        <RNTextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Co je potřeba udělat? (např. Sraz v 10:10)"
          placeholderTextColor={colors.text4}
          style={inputStyle}
        />
        {detectedTime ? (
          <View style={styles.timeHint}>
            <Sparkles size={14} color={colors.star} />
            <Text style={styles.timeHintText}>
              {`Detekován čas ${String(detectedTime.hour).padStart(2, '0')}:${String(detectedTime.minute).padStart(2, '0')} — připomenutí se nastaví automaticky`}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Popis</Text>
        <RNTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Doplňující poznámky (volitelné)"
          placeholderTextColor={colors.text4}
          multiline
          style={[inputStyle, { minHeight: 76, textAlignVertical: 'top' }]}
        />
      </View>

      <OptionPicker
        label="Priorita"
        value={priority}
        onChange={(p) => {
          haptic('light');
          setPriority(p);
        }}
        options={(Object.keys(priorityMeta) as Priority[]).map((p) => ({
          value: p,
          label: priorityMeta[p].label,
          color: priorityMeta[p].color,
        }))}
      />

      <View style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={styles.label}>Kategorie</Text>
          <Pressable
            onPress={() => setShowNewCat((v) => !v)}
            style={({ pressed }) => [styles.tinyBtn, pressed && { opacity: 0.6 }]}
          >
            <Plus size={14} color={colors.primary} />
            <Text style={styles.tinyBtnText}>Nová</Text>
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategory(c.id)}
              style={({ pressed }) => [
                styles.chip,
                category === c.id && { backgroundColor: c.color + '22', borderColor: c.color },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={[styles.chipText, category === c.id && { color: c.color }]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {showNewCat ? (
          <View style={styles.newCatBox}>
            <RNTextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Název kategorie"
              placeholderTextColor={colors.text4}
              style={inputStyle}
            />
            <View style={styles.colorRow}>
              {palette.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setNewCatColor(c)}
                  style={[styles.colorDot, { backgroundColor: c }, newCatColor === c && styles.colorDotActive]}
                />
              ))}
            </View>
            <Pressable onPress={createCategory} style={styles.addCatBtn}>
              <Text style={styles.addCatBtnText}>Přidat kategorii</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <OptionPicker
        label="Opakování"
        value={recurrence}
        onChange={(r) => {
          haptic('light');
          setRecurrence(r);
        }}
        options={(Object.keys(recurrenceMeta) as Recurrence[]).map((r) => ({
          value: r,
          label: recurrenceMeta[r].label,
        }))}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Termín a čas</Text>
        {Platform.OS === 'web' ? (
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate((e.target as HTMLInputElement).value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(31, 16, 48, 0.65)',
              borderWidth: 1,
              borderColor: 'rgba(157, 78, 221, 0.12)',
              color: colors.text,
              borderRadius: 14,
              padding: '12px 14px',
              fontSize: 15,
              fontFamily: 'inherit',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        ) : (
          <RNTextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DDTHH:MM"
            placeholderTextColor={colors.text4}
            style={inputStyle}
          />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Podúkoly</Text>
        {subtasks.length > 0 ? (
          <View style={styles.subList}>
            {subtasks.map((s) => (
              <View key={s.id} style={styles.subRow}>
                <Text style={styles.subText}>{s.title}</Text>
                <Pressable onPress={() => removeSub(s.id)} hitSlop={10}>
                  <Trash2 size={16} color={colors.high} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.subInputRow}>
          <RNTextInput
            value={newSub}
            onChangeText={setNewSub}
            placeholder="Přidat podúkol…"
            placeholderTextColor={colors.text4}
            style={[inputStyle, { flex: 1 }]}
          />
          <Pressable onPress={addSub} style={styles.addSubBtn}>
            <Plus size={18} color={colors.amoled} />
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Zrušit</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!title.trim()}
          style={({ pressed }) => [
            styles.saveBtn,
            !title.trim() && styles.saveBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.saveText}>{task ? 'Uložit změny' : 'Vytvořit úkol'}</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    ...typography.smallM,
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
  },
  micBtnActive: { backgroundColor: colors.primary },
  micBtnDisabled: { opacity: 0.6 },
  micText: { ...typography.smallM, color: colors.primary },
  micTextActive: { color: colors.amoled },
  timeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.star + '1A',
  },
  timeHintText: { ...typography.small, color: colors.star, flex: 1 },
  tinyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
  },
  tinyBtnText: { ...typography.smallM, color: colors.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: { ...typography.bodyM, color: colors.text2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  newCatBox: { marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: 'rgba(31, 16, 48, 0.6)', borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.14)', gap: 10 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: colors.text },
  addCatBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  addCatBtnText: { ...typography.bodyM, color: colors.text },
  subList: { gap: 6 },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 16, 48, 0.55)',
  },
  subText: { ...typography.body, color: colors.text2, flex: 1 },
  subInputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addSubBtn: {
    width: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 16, 48, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.14)',
    alignItems: 'center',
  },
  cancelText: { ...typography.bodyM, color: colors.text2 },
  saveBtn: { flex: 1.5, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
});
