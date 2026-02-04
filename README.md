# Simple Todo Web App

A simple personal Todo management Web application for localhost usage only.

## Tech Stack

### Frontend
- React + TypeScript (Vite)
- MUI (dark theme)
- Jotai for state management
- dnd-kit for drag & drop

### Backend
- Node.js + Express
- PostgreSQL
- node-postgres (`pg`)
- Raw SQL only

### Infrastructure
- Docker Compose for PostgreSQL
- localhost only
- CORS enabled

## Features

- Kanban board with 3 columns (Todo, Doing, Done)
- Drag & drop reordering within and between columns
- Create, edit, and delete tasks
- Archive toggle (hide/show completed tasks)
- Keyboard shortcut: Cmd+K to open task creation modal

## Startup

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run backend (in one terminal)
cd backend && npm run dev

# Run frontend (in another terminal)
cd frontend && npm run dev
```

The frontend will be available at http://localhost:5173
The backend API will be available at http://localhost:3001

## API Endpoints

- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `PATCH /tasks/reorder` - Reorder tasks

## Database Schema

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Keyboard Shortcuts

- `Cmd + K` - Open task creation modal
- `Cmd + Enter` - Submit task (in modal)
- `Esc` - Cancel/close modal

## Development

```bash
# Run backend tests
cd backend && npm test

# Run linting
cd backend && npm run lint
cd frontend && npm run lint
```
