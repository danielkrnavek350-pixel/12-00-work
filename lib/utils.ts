import type { Priority, Recurrence, SmartFilter, Task } from './types';

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalInput(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = (timePart || '00:00').split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0);
}

const czMonths = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const czDays = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

export function formatDueDate(iso: string | null): string {
  if (!iso) return 'Bez termínu';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Bez termínu';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  let day: string;
  if (diffDays === 0) day = 'Dnes';
  else if (diffDays === 1) day = 'Zítra';
  else if (diffDays === -1) day = 'Včera';
  else if (diffDays > 1 && diffDays < 7) day = czDays[d.getDay()];
  else day = `${d.getDate()}. ${czMonths[d.getMonth()]}`;
  return `${day} ${time}`;
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.done) return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isScheduled(task: Task): boolean {
  return !task.done && !!task.dueDate;
}

export function priorityRank(p: Priority): number {
  return p === 'high' ? 0 : p === 'medium' ? 1 : 2;
}

export function nextRecurrenceDate(rec: Recurrence, from: Date): Date {
  const next = new Date(from);
  if (rec === 'daily') next.setDate(next.getDate() + 1);
  else if (rec === 'weekly') next.setDate(next.getDate() + 7);
  else if (rec === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ra = priorityRank(a.priority);
    const rb = priorityRank(b.priority);
    if (ra !== rb) return ra - rb;
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (da !== db) return da - db;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function countForSmartFilter(tasks: Task[], filter: SmartFilter): number {
  return tasks.filter((t) => matchesSmartFilter(t, filter)).length;
}

export function matchesSmartFilter(task: Task, filter: SmartFilter): boolean {
  switch (filter) {
    case 'today':
      return !task.done && isToday(task.dueDate);
    case 'scheduled':
      return !task.done && isScheduled(task);
    case 'starred':
      return !task.done && task.priority === 'high';
    case 'done':
      return task.done;
  }
}

export function hoursUntilDeletion(task: Task): number | null {
  if (!task.done || !task.completedAt) return null;
  const completed = new Date(task.completedAt).getTime();
  const deadline = completed + 24 * 60 * 60 * 1000;
  const remaining = deadline - Date.now();
  return remaining > 0 ? remaining / (60 * 60 * 1000) : 0;
}

export function formatCountdown(task: Task): string | null {
  if (!task.done || !task.completedAt) return null;
  const completed = new Date(task.completedAt).getTime();
  const deadline = completed + 24 * 60 * 60 * 1000;
  const remaining = deadline - Date.now();
  if (remaining <= 0) return 'Smaže se…';
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 1) {
    return `Smaže se za ${hours} hod`;
  }
  return `Smaže se za ${String(mins).padStart(2, '0')}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`;
}

export function isExpiredForDeletion(task: Task): boolean {
  if (!task.done || !task.completedAt) return false;
  const completed = new Date(task.completedAt).getTime();
  return Date.now() - completed >= 24 * 60 * 60 * 1000;
}

const TIME_REGEX = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;

export function detectTimeInTitle(title: string): { hour: number; minute: number } | null {
  const m = TIME_REGEX.exec(title);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function buildDueDateFromTime(hour: number, minute: number, base?: Date | null): Date {
  const baseDate = base ? new Date(base) : new Date();
  baseDate.setHours(hour, minute, 0, 0);
  if (!base && baseDate.getTime() < Date.now()) {
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return baseDate;
}

export function parseSearchTime(query: string): { hour: number; minute: number } | null {
  const m = TIME_REGEX.exec(query.trim());
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return tasks;
  const searchTime = parseSearchTime(trimmed);
  const keyword = trimmed.replace(TIME_REGEX, '').trim();
  return tasks.filter((t) => {
    let match = true;
    if (keyword) {
      const inTitle = t.title.toLowerCase().includes(keyword);
      const inDesc = t.description.toLowerCase().includes(keyword);
      match = inTitle || inDesc;
    }
    if (searchTime && t.dueDate) {
      const due = new Date(t.dueDate);
      const dueMinutes = due.getHours() * 60 + due.getMinutes();
      const queryMinutes = searchTime.hour * 60 + searchTime.minute;
      if (dueMinutes > queryMinutes) match = false;
    }
    return match;
  });
}
