import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        backgroundColor: 'background.paper',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Box>

          {isEditing ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                fullWidth
                autoFocus
                sx={{ '& .MuiInputBase-input': { py: 0.5 } }}
              />
              <IconButton size="small" onClick={handleSave} color="primary">
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {task.title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(task.id)}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
