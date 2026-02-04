// Task status type
export type TaskStatus = 'todo' | 'doing' | 'done';

// Task interface
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Column configuration
export interface Column {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];
