# Daily Tasks Report

A full-stack application for managing employee daily tasks with time tracking capabilities.

## Features

- CRUD operations for employee tasks
- Real-time task duration tracking
- Daily work hours summary
- Maximum 8-hour workday enforcement
- Responsive and modern UI using shadcn UI and Tailwind CSS

## Tech Stack

### Frontend
- React with TypeScript
- Redux for state management
- shadcn UI components
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for data storage
- REST API

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
daily-tasks-report/
├── client/               # React frontend
└── server/              # Node.js backend
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file in server directory
   - Add MongoDB connection string and other configurations

4. Start the application:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend development server
   cd ../client
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/summary/:date` - Get daily summary

## Data Models

### Task
```typescript
interface Task {
  id: string;
  employeeId: string;
  description: string;
  from: Date;
  to: Date;
}
```

### DailySummary
```typescript
interface DailySummary {
  date: string;
  totalHours: number;
  remainingHours: number;
  tasks: Task[];
}
``` 