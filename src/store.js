import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(persist((set, get) => ({
  activeTasks: [],
  completedTasks: [],
  customTags: ['Práce', 'Osobní', 'Studium', 'Nákupy'],
  notificationTemplates: ['10 min předem', '1 hodina předem', '2 hodiny předem'],

  // Přidání nebo úprava úkolu
  addTask: (task) => set((state) => {
    if (task.id) {
      // Úprava existujícího úkolu
      return {
        activeTasks: state.activeTasks.map(t => t.id === task.id ? { ...t, ...task } : t)
      };
    }
    // Nový úkol
    const newTask = { 
      ...task, 
      id: Date.now().toString(), 
      subtasks: [], 
      important: task.important || false,
      createdAt: new Date().toISOString() 
    };
    return { 
      activeTasks: [...state.activeTasks, newTask]
    };
  }),

  completeTask: (taskId) => set((state) => {
    const task = state.activeTasks.find(t => t.id === taskId);
    if (!task) return state;
    return {
      activeTasks: state.activeTasks.filter(t => t.id !== taskId),
      completedTasks: [...state.completedTasks, { ...task, completedAt: new Date().toISOString() }]
    };
  }),

  deleteTask: (taskId) => set((state) => ({
    activeTasks: state.activeTasks.filter(t => t.id !== taskId),
    completedTasks: state.completedTasks.filter(t => t.id !== taskId)
  })),

  toggleImportant: (taskId) => set((state) => ({
    activeTasks: state.activeTasks.map(t => t.id === taskId ? { ...t, important: !t.important } : t)
  })),

  // Správa podúkolů
  addSubtask: (taskId, subtaskTitle) => set((state) => ({
    activeTasks: state.activeTasks.map(t => {
      if (t.id === taskId) {
        const newSub = { id: Date.now().toString(), title: subtaskTitle, completed: false };
        return { ...t, subtasks: [...(t.subtasks || []), newSub] };
      }
      return t;
    })
  })),

  toggleSubtask: (taskId, subtaskId) => set((state) => ({
    activeTasks: state.activeTasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    })
  })),

  deleteSubtask: (taskId, subtaskId) => set((state) => ({
    activeTasks: state.activeTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
      }
      return t;
    })
  })),

  // Měsíční čištění
  performMonthlyCleanup: () => {
    const today = new Date();
    if (today.getDate() === 1) {
      set({ completedTasks: [] });
    }
  },

  // Import/Export JSON
  exportData: () => JSON.stringify({ activeTasks: get().activeTasks, completedTasks: get().completedTasks }),
  importData: (jsonString) => {
    const data = JSON.parse(jsonString);
    set({ activeTasks: data.activeTasks, completedTasks: data.completedTasks });
  },

  // Štítky
  addTag: (tag) => set((state) => ({ customTags: [...state.customTags, tag] })),
  deleteTag: (tag) => set((state) => ({ customTags: state.customTags.filter(t => t !== tag) })),
  
  // Notifikační šablony
  addNotificationTemplate: (tpl) => set((state) => ({ notificationTemplates: [...state.notificationTemplates, tpl] })),
  deleteNotificationTemplate: (tpl) => set((state) => ({ notificationTemplates: state.notificationTemplates.filter(t => t !== tpl) })),
}), {
  name: 'task-master-storage',
  storage: createJSONStorage(() => AsyncStorage),
}));
