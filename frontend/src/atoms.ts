import { atom } from 'jotai';
import type { Task } from './types';

// Tasks state
export const tasksAtom = atom<Task[]>([]);

// Loading state
export const loadingAtom = atom<boolean>(false);

// Error state
export const errorAtom = atom<string | null>(null);

// Modal state for task creation
export const createModalOpenAtom = atom<boolean>(false);

// Archive visibility state (hide/show completed tasks)
export const showArchivedAtom = atom<boolean>(true);

// Derived atom: tasks grouped by status
export const tasksByStatusAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const showArchived = get(showArchivedAtom);
  
  return {
    todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => a.order_index - b.order_index),
    doing: tasks.filter((t) => t.status === 'doing').sort((a, b) => a.order_index - b.order_index),
    done: showArchived
      ? tasks.filter((t) => t.status === 'done').sort((a, b) => a.order_index - b.order_index)
      : [],
  };
});
