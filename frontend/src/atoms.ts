import { atom } from 'jotai';
import type { Task, TaskStatus } from './types';

// Tasks state
export const tasksAtom = atom<Task[]>([]);

// Loading state
export const loadingAtom = atom<boolean>(false);

// Error state
export const errorAtom = atom<string | null>(null);

// Modal state for task creation
export const createModalOpenAtom = atom<boolean>(false);

// Initial status for new task creation (used when clicking column header + button)
export const createTaskInitialStatusAtom = atom<TaskStatus>('todo');

// Derived atom: tasks grouped by status
export const tasksByStatusAtom = atom((get) => {
  const tasks = get(tasksAtom);
  
  return {
    todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => a.order_index - b.order_index),
    doing: tasks.filter((t) => t.status === 'doing').sort((a, b) => a.order_index - b.order_index),
    done: tasks.filter((t) => t.status === 'done').sort((a, b) => a.order_index - b.order_index),
  };
});
