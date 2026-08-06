import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, Task } from './types';
import { defaultCategories, dummyTasks } from './dummyData';

const TASKS_KEY = '@tasks_v2';
const CATEGORIES_KEY = '@categories_v2';
const INIT_KEY = '@initialized_v2';

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // fall through to seed
  }
  await seedIfEmpty();
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore persistence errors
  }
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw) as Category[];
  } catch {
    // fall through
  }
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  return defaultCategories;
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
}

async function seedIfEmpty(): Promise<void> {
  try {
    const init = await AsyncStorage.getItem(INIT_KEY);
    if (init) return;
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(dummyTasks));
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    await AsyncStorage.setItem(INIT_KEY, '1');
  } catch {
    // ignore
  }
}
