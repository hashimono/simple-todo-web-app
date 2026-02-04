import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';
import type { Task, CreateTaskRequest, UpdateTaskRequest, ReorderTasksRequest } from '../types.js';

const router = Router();

// GET /tasks - Get all tasks
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<Task>(
      'SELECT * FROM tasks ORDER BY status, order_index ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req: Request<object, object, CreateTaskRequest>, res: Response) => {
  try {
    const { title, status = 'todo' } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const id = uuidv4();
    
    // Get the max order_index for the given status
    const maxOrderResult = await pool.query<{ max: number | null }>(
      'SELECT MAX(order_index) as max FROM tasks WHERE status = $1',
      [status]
    );
    const orderIndex = (maxOrderResult.rows[0].max ?? -1) + 1;

    const result = await pool.query<Task>(
      `INSERT INTO tasks (id, title, status, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, title.trim(), status, orderIndex]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /tasks/:id - Update a task
router.put('/:id', async (req: Request<{ id: string }, object, UpdateTaskRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status, order_index } = req.body;

    // Check if task exists
    const existingTask = await pool.query<Task>(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (existingTask.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title.trim());
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (order_index !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(order_index);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query<Task>(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH /tasks/reorder - Reorder tasks
router.patch('/reorder', async (req: Request<object, object, ReorderTasksRequest>, res: Response) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      res.status(400).json({ error: 'Tasks array is required' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const task of tasks) {
        await client.query(
          `UPDATE tasks SET status = $1, order_index = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
          [task.status, task.order_index, task.id]
        );
      }

      await client.query('COMMIT');

      // Fetch and return all tasks
      const result = await client.query<Task>(
        'SELECT * FROM tasks ORDER BY status, order_index ASC'
      );
      res.json(result.rows);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

export default router;
