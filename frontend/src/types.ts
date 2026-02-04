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
  { id: 'todo', title: 'ToDo' },
  { id: 'doing', title: '対応中' },
  { id: 'done', title: '完了' },
];
