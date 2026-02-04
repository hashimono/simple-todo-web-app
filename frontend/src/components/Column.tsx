import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../types';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onUpdateTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenCreateModal?: (status: TaskStatus) => void;
  onMoveToNextStatus: (id: string, currentStatus: TaskStatus) => void;
}

export function Column({ id, title, tasks, onUpdateTask, onDeleteTask, onOpenCreateModal, onMoveToNextStatus }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const showAddButton = id === 'todo' || id === 'doing';

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
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
        {showAddButton && onOpenCreateModal && (
          <IconButton
            size="small"
            color="primary"
            onClick={() => onOpenCreateModal(id)}
            sx={{ ml: 1 }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

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
              onMoveToNextStatus={onMoveToNextStatus}
            />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  );
}
