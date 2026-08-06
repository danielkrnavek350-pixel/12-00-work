export type Priority = 'high' | 'medium' | 'low';

export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string | null;
  subtasks: Subtask[];
  recurrence: Recurrence;
  done: boolean;
  pinned: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type FilterStatus = 'all' | 'active' | 'done';

export type SmartFilter = 'today' | 'scheduled' | 'starred' | 'done';
