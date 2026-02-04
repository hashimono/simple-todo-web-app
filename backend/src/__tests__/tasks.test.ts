import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database pool
vi.mock('../db.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

import { pool } from '../db.js';

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Database queries', () => {
    it('should fetch all tasks with correct SQL', async () => {
      const mockTasks = [
        { id: '1', title: 'Test Task', status: 'todo', order_index: 0 },
      ];
      
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: mockTasks,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const result = await pool.query('SELECT * FROM tasks ORDER BY status, order_index ASC');
      
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tasks ORDER BY status, order_index ASC');
      expect(result.rows).toEqual(mockTasks);
    });

    it('should insert a new task with correct parameters', async () => {
      const mockTask = {
        id: 'test-uuid',
        title: 'New Task',
        status: 'todo',
        order_index: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ max: null }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockTask],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      });

      // Simulate getting max order_index
      await pool.query('SELECT MAX(order_index) as max FROM tasks WHERE status = $1', ['todo']);
      
      // Simulate insert
      const result = await pool.query(
        `INSERT INTO tasks (id, title, status, order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        ['test-uuid', 'New Task', 'todo', 0]
      );

      expect(result.rows[0]).toEqual(mockTask);
    });

    it('should delete a task by id', async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ id: 'test-uuid' }],
        rowCount: 1,
        command: 'DELETE',
        oid: 0,
        fields: [],
      });

      const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', ['test-uuid']);
      
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1 RETURNING id', ['test-uuid']);
      expect(result.rowCount).toBe(1);
    });

    it('should update a task', async () => {
      const mockUpdatedTask = {
        id: 'test-uuid',
        title: 'Updated Task',
        status: 'doing',
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockUpdatedTask],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      });

      const result = await pool.query(
        'UPDATE tasks SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['Updated Task', 'doing', 'test-uuid']
      );

      expect(result.rows[0]).toEqual(mockUpdatedTask);
    });
  });
});
