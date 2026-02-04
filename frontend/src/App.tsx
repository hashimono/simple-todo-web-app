import { useEffect, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { KanbanBoard } from './components/KanbanBoard';
import { CreateTaskModal } from './components/CreateTaskModal';
import {
  tasksAtom,
  loadingAtom,
  errorAtom,
  createModalOpenAtom,
  showArchivedAtom,
} from './atoms';
import { fetchTasks, createTask } from './api';

function App() {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [modalOpen, setModalOpen] = useAtom(createModalOpenAtom);
  const [showArchived, setShowArchived] = useAtom(showArchivedAtom);
  const setTasksAtom = useSetAtom(tasksAtom);

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('タスクの読み込みに失敗しました');
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [setTasks, setLoading, setError]);

  // Keyboard shortcut: Cmd+K to open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setModalOpen]);

  const handleCreateTask = useCallback(
    async (title: string) => {
      try {
        const newTask = await createTask(title);
        setTasksAtom((prev) => [...prev, newTask]);
      } catch (err) {
        console.error('Failed to create task:', err);
        setError('タスクの作成に失敗しました');
      }
    },
    [setTasksAtom, setError]
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                size="small"
              />
            }
            label="完了タスクを表示"
            sx={{ mr: 2 }}
          />
          <Tooltip title="新しいタスクを作成 (Cmd+K)">
            <IconButton
              color="primary"
              onClick={() => setModalOpen(true)}
              sx={{ mr: 1 }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && tasks.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          <Typography>タスクがありません</Typography>
          <Typography variant="body2">
            Cmd+K または + ボタンでタスクを作成してください
          </Typography>
        </Box>
      )}

      {!loading && <KanbanBoard />}

      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </Box>
  );
}

export default App;
