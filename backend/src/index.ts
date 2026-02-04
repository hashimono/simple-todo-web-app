import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', tasksRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
async function start(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
