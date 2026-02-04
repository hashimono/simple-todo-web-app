// Task status type
export type TaskStatus = 'todo' | 'doing' | 'done';

// Task interface
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

// Request body for creating a task
export interface CreateTaskRequest {
  title: string;
  status?: TaskStatus;
}

// Request body for updating a task
export interface UpdateTaskRequest {
  title?: string;
  status?: TaskStatus;
  order_index?: number;
}

// Request body for reordering tasks
export interface ReorderTasksRequest {
  tasks: Array<{
    id: string;
    status: TaskStatus;
    order_index: number;
  }>;
}
