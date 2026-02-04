import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Paper, Typography } from '@mui/material';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../types';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onUpdateTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
}

export function Column({ id, title, tasks, onUpdateTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Paper
      sx={{
        flex: 1,
        minWidth: 280,
        maxWidth: 400,
        backgroundColor: isOver ? 'action.selected' : 'background.default',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'text.primary',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
        }}
      >
        {title}
        <Typography
          component="span"
          variant="body2"
          sx={{ ml: 1, color: 'text.secondary' }}
        >
          ({tasks.length})
        </Typography>
      </Typography>

      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 100,
        }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  );
}
