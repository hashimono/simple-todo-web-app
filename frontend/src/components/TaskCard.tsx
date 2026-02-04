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
      {...attributes}
      {...listeners}
      sx={{
        mb: 1,
        backgroundColor: '#f5f5f5',
        cursor: isEditing ? 'default' : 'grab',
        '&:hover': {
          backgroundColor: '#eeeeee',
        },
        '&:active': {
          cursor: isEditing ? 'default' : 'grabbing',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditing ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                fullWidth
                autoFocus
                sx={{
                  '& .MuiInputBase-input': { py: 0.5, color: '#000' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
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
                variant="body1"
                sx={{
                  flex: 1,
                  wordBreak: 'break-word',
                  color: '#000',
                  fontSize: '1rem',
                }}
              >
                {task.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1 }, color: '#666' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'error.main' }, color: '#666' }}
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
