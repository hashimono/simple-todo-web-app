import { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import { Column } from './Column';
import { tasksAtom, tasksByStatusAtom } from '../atoms';
import { updateTask, deleteTask, reorderTasks } from '../api';
import { COLUMNS, type Task, type TaskStatus } from '../types';

interface KanbanBoardProps {
  onOpenCreateModal?: (status: TaskStatus) => void;
}

export function KanbanBoard({ onOpenCreateModal }: KanbanBoardProps) {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const tasksByStatus = useAtomValue(tasksByStatusAtom);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleUpdateTask = useCallback(
    async (id: string, title: string) => {
      try {
        const currentTask = tasks.find((t) => t.id === id);
        if (!currentTask) return;

        const updated = await updateTask(id, { title });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...updated, status: currentTask.status, order_index: currentTask.order_index }
              : t
          )
        );
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    },
    [setTasks, tasks]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    },
    [setTasks]
  );

  const handleMoveToNextStatus = useCallback(
    async (id: string, currentStatus: TaskStatus) => {
      try {
        if (currentStatus === 'done') {
          await deleteTask(id);
          setTasks((prev) => prev.filter((t) => t.id !== id));
        } else {
          const nextStatus: TaskStatus = currentStatus === 'todo' ? 'doing' : 'done';
          const targetColumnTasks = tasks
            .filter((t) => t.status === nextStatus)
            .sort((a, b) => a.order_index - b.order_index);
          const newOrderIndex = targetColumnTasks.length;

          setTasks((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, status: nextStatus, order_index: newOrderIndex } : t
            )
          );

          await updateTask(id, { status: nextStatus, order_index: newOrderIndex });
        }
      } catch (error) {
        console.error('Failed to move task to next status:', error);
      }
    },
    [setTasks, tasks]
  );

  const findTaskById = (id: string): Task | undefined => {
    return tasks.find((t) => t.id === id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = findTaskById(active.id as string);
    if (!activeTask) return;

    const overId = over.id as string;
    
    // Check if dropping over a column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    const newStatus: TaskStatus = isOverColumn
      ? (overId as TaskStatus)
      : (findTaskById(overId)?.status ?? activeTask.status);

    if (activeTask.status !== newStatus) {
      setTasks((prev) => {
        return prev.map((t) =>
          t.id === activeTask.id ? { ...t, status: newStatus } : t
        );
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = findTaskById(active.id as string);
    if (!activeTask) return;

    const overId = over.id as string;
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    
    // Determine the target status
    const targetStatus: TaskStatus = isOverColumn
      ? (overId as TaskStatus)
      : (findTaskById(overId)?.status ?? activeTask.status);

    // Get tasks in the target column
    const columnTasks = tasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order_index - b.order_index);

    // Find indices
    const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
    const newIndex = isOverColumn
      ? columnTasks.length - 1
      : columnTasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      // Reorder within the same column
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      
      // Update local state
      const updatedTasks = tasks.map((t) => {
        if (t.status !== targetStatus) return t;
        const idx = reordered.findIndex((r) => r.id === t.id);
        return idx !== -1 ? { ...t, order_index: idx } : t;
      });
      setTasks(updatedTasks);

      // Persist to backend
      try {
        const tasksToUpdate = reordered.map((t, idx) => ({
          id: t.id,
          status: targetStatus,
          order_index: idx,
        }));
        await reorderTasks(tasksToUpdate);
      } catch (error) {
        console.error('Failed to reorder tasks:', error);
      }
    } else if (activeTask.status !== targetStatus) {
      // Moving to a different column
      const targetColumnTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeTask.id)
        .sort((a, b) => a.order_index - b.order_index);

      const newOrderIndex = isOverColumn
        ? targetColumnTasks.length
        : Math.max(0, targetColumnTasks.findIndex((t) => t.id === overId));

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTask.id
            ? { ...t, status: targetStatus, order_index: newOrderIndex }
            : t
        )
      );

      // Persist to backend
      try {
        await updateTask(activeTask.id, {
          status: targetStatus,
          order_index: newOrderIndex,
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          overflowX: 'auto',
          minHeight: 'calc(100vh - 100px)',
        }}
      >
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={onOpenCreateModal}
            onMoveToNextStatus={handleMoveToNextStatus}
          />
        ))}
      </Box>
    </DndContext>
  );
}
