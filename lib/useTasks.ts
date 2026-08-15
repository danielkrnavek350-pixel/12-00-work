import { useState } from 'react';

export function useTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Dokončit projekt', isStarred: false, priority: 'high' }
  ]);

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const toggleStar = (id: string) => setTasks(tasks.map(t => t.id === id ? {...t, isStarred: !t.isStarred} : t));

  return { tasks, deleteTask, toggleStar };
}