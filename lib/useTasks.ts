import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category, Priority, Task } from './types';
import { uid, nextRecurrenceDate, isExpiredForDeletion } from './utils';
import { loadCategories, loadTasks, saveCategories, saveTasks } from './storage';
import { cancelTaskReminder, scheduleTaskReminder } from './notifications';
import { supabase } from './supabase';
import { useAuth } from './auth';

function toDbTask(t: Task, userId: string) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category || null,
    priority: t.priority,
    due_date: t.dueDate || null,
    subtasks: t.subtasks,
    recurrence: t.recurrence,
    done: t.done,
    pinned: t.pinned,
    user_id: userId,
    created_at: t.createdAt,
    completed_at: t.completedAt,
  };
}

function fromDbTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || '',
    priority: row.priority as Priority,
    dueDate: row.due_date || null,
    subtasks: row.subtasks || [],
    recurrence: row.recurrence,
    done: row.done,
    pinned: row.pinned,
    createdAt: row.created_at,
    completedAt: row.completed_at || null,
  };
}

function fromDbCategory(row: any): Category {
  return { id: row.id, name: row.name, color: row.color };
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const loaded = useRef(false);
  const userId = user?.id || null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [t, c] = await Promise.all([loadTasks(), loadCategories()]);
      if (!mounted) return;
      const purged = t.filter((task) => !isExpiredForDeletion(task));
      const expired = t.filter((task) => isExpiredForDeletion(task));
      if (expired.length > 0) {
        await saveTasks(purged);
        if (userId) {
          for (const task of expired) {
            void supabase.from('tasks').delete().eq('id', task.id).eq('user_id', userId);
          }
        }
      }
      setTasks(purged);
      setCategories(c);
      setLoading(false);
      loaded.current = true;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => {
        const expired = prev.filter((t) => isExpiredForDeletion(t));
        if (expired.length === 0) return prev;
        const remaining = prev.filter((t) => !isExpiredForDeletion(t));
        void saveTasks(remaining);
        if (userId) {
          for (const t of expired) {
            void supabase.from('tasks').delete().eq('id', t.id).eq('user_id', userId);
            void cancelTaskReminder(t.id);
          }
        }
        return remaining;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId || !loaded.current) return;
    (async () => {
      setSyncing(true);
      try {
        const { data: remoteTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId);
        const { data: remoteCats } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId);

        if (remoteTasks && remoteTasks.length > 0) {
          const mapped = remoteTasks.map(fromDbTask);
          setTasks(mapped);
          await saveTasks(mapped);
        } else {
          const local = await loadTasks();
          if (local.length > 0) {
            await Promise.all(local.map((t) => supabase.from('tasks').upsert(toDbTask(t, userId!))));
          }
        }

        if (remoteCats && remoteCats.length > 0) {
          const mapped = remoteCats.map(fromDbCategory);
          setCategories(mapped);
          await saveCategories(mapped);
        } else {
          const local = await loadCategories();
          if (local.length > 0) {
            await Promise.all(local.map((c) => supabase.from('categories').upsert({ ...c, user_id: userId! })));
          }
        }
      } catch {
        // sync errors are non-fatal — keep local data
      }
      setSyncing(false);
    })();
  }, [userId]);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    if (loaded.current) void saveTasks(next);
  }, []);

  const persistCategories = useCallback((next: Category[]) => {
    setCategories(next);
    if (loaded.current) void saveCategories(next);
  }, []);

  const syncTask = useCallback(
    (task: Task) => {
      if (!userId) return;
      void supabase.from('tasks').upsert(toDbTask(task, userId));
    },
    [userId],
  );

  const syncDeleteTask = useCallback(
    (id: string) => {
      if (!userId) return;
      void supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
    },
    [userId],
  );

  const syncCategory = useCallback(
    (cat: Category) => {
      if (!userId) return;
      void supabase.from('categories').upsert({ ...cat, user_id: userId });
    },
    [userId],
  );

  const syncDeleteCategory = useCallback(
    (id: string) => {
      if (!userId) return;
      void supabase.from('categories').delete().eq('id', id).eq('user_id', userId);
    },
    [userId],
  );

  const addTask = useCallback(
    (task: Task) => {
      persist([...tasks, task]);
      syncTask(task);
      if (task.dueDate) void scheduleTaskReminder(task.id, task.title, task.description, task.dueDate);
    },
    [tasks, persist, syncTask],
  );

  const updateTask = useCallback(
    (updated: Task) => {
      const next = tasks.map((t) => (t.id === updated.id ? updated : t));
      persist(next);
      syncTask(updated);
      if (updated.dueDate && !updated.done) {
        void scheduleTaskReminder(updated.id, updated.title, updated.description, updated.dueDate);
      } else {
        void cancelTaskReminder(updated.id);
      }
    },
    [tasks, persist, syncTask],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      let changed: Task;
      if (target.done) {
        changed = { ...target, done: false, completedAt: null };
      } else {
        const completedAt = new Date().toISOString();
        if (target.recurrence !== 'once' && target.dueDate) {
          const newDue = nextRecurrenceDate(target.recurrence, new Date(target.dueDate)).toISOString();
          changed = {
            ...target,
            done: false,
            completedAt,
            dueDate: newDue,
            subtasks: target.subtasks.map((s) => ({ ...s, done: false })),
          };
        } else {
          changed = { ...target, done: true, completedAt };
        }
      }
      const next = tasks.map((t) => (t.id === id ? changed : t));
      persist(next);
      syncTask(changed);
      if (changed.done) void cancelTaskReminder(id);
      else if (changed.dueDate) void scheduleTaskReminder(id, changed.title, changed.description, changed.dueDate);
    },
    [tasks, persist, syncTask],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subId: string) => {
      let changed: Task | null = null;
      const next = tasks.map((t) => {
        if (t.id !== taskId) return t;
        const subs = t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
        changed = { ...t, subtasks: subs };
        return changed;
      });
      persist(next);
      if (changed) syncTask(changed);
    },
    [tasks, persist, syncTask],
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist(tasks.filter((t) => t.id !== id));
      syncDeleteTask(id);
      void cancelTaskReminder(id);
    },
    [tasks, persist, syncDeleteTask],
  );

  const togglePin = useCallback(
    (id: string) => {
      let changed: Task | null = null;
      const next: Task[] = tasks.map((t) => {
        if (t.id !== id) return t;
        changed = { ...t, pinned: !t.pinned };
        return changed;
      });
      persist(next);
      if (changed) syncTask(changed);
    },
    [tasks, persist, syncTask],
  );

  const setPriority = useCallback(
    (id: string, priority: Priority) => {
      let changed: Task | null = null;
      const next = tasks.map((t) => {
        if (t.id !== id) return t;
        changed = { ...t, priority };
        return changed;
      });
      persist(next);
      if (changed) syncTask(changed);
    },
    [tasks, persist, syncTask],
  );

  const togglePriorityStar = useCallback(
    (id: string) => {
      let changed: Task | null = null;
      const next: Task[] = tasks.map((t) => {
        if (t.id !== id) return t;
        changed = { ...t, priority: (t.priority === 'high' ? 'medium' : 'high') as Priority };
        return changed;
      });
      persist(next);
      if (changed) syncTask(changed);
    },
    [tasks, persist, syncTask],
  );

  const addCategory = useCallback(
    (name: string, color: string) => {
      const cat: Category = { id: uid(), name, color };
      persistCategories([...categories, cat]);
      syncCategory(cat);
      return cat;
    },
    [categories, persistCategories, syncCategory],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      persistCategories(categories.filter((c) => c.id !== id));
      syncDeleteCategory(id);
    },
    [categories, persistCategories, syncDeleteCategory],
  );

  return {
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
    setPriority,
    togglePriorityStar,
    addCategory,
    deleteCategory,
  };
}
