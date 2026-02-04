import type { Task, TaskStatus } from './types';

const API_BASE = 'http://localhost:3001';

// Fetch all tasks
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

// Create a new task
export async function createTask(title: string, status: TaskStatus = 'todo'): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, status }),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

// Update a task
export async function updateTask(
  id: string,
  updates: { title?: string; status?: TaskStatus; order_index?: number }
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

// Reorder tasks
export async function reorderTasks(
  tasks: Array<{ id: string; status: TaskStatus; order_index: number }>
): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder tasks');
  }
  return response.json();
}
