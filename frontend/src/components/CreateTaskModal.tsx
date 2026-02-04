import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { backgroundColor: 'background.paper' },
      }}
    >
      <DialogTitle>新しいタスクを作成</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="タスク名"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="タスク名を入力..."
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Cmd + Enter で作成 / Esc でキャンセル
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          キャンセル
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          作成
        </Button>
      </DialogActions>
    </Dialog>
  );
}
