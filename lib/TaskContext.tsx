import React, { createContext, useContext, useState } from 'react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  isStarred: boolean;
  priority: 'vysoka' | 'stredni' | 'nizka';
  category: 'Práce' | 'Osobní' | 'Studium' | 'Nákupy' | 'Zdraví';
  date: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category: Task['category'], priority: Task['priority']) => void;
  toggleComplete: (id: string) => void;
  toggleStar: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Dokončit kódování aplikace', completed: false, isStarred: true, priority: 'vysoka', category: 'Práce', date: '2026-08-14' },
  { id: '2', title: 'Nakoupit potraviny na víkend', completed: false, isStarred: false, priority: 'stredni', category: 'Nákupy', date: '2026-08-14' },
  { id: '3', title: 'Ranní protažení a běh', completed: true, isStarred: false, priority: 'nizka', category: 'Zdraví', date: '2026-08-14' }
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (title: string, category: Task['category'], priority: Task['priority']) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      isStarred: false,
      priority,
      category,
      date: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleStar = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isStarred: !t.isStarred } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleComplete, toggleStar, deleteTask, clearCompleted }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
