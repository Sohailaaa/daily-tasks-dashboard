import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Remove direct axios import
// import axios from 'axios';
import { taskApi } from '../services/api';

export interface Task {
  _id: string;
  employeeId: string;
  description: string;
  from: string;
  to: string;
}

interface EmployeeSummary {
  totalHours: number;
  remainingHours: number;
  tasks: Task[];
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  dailySummary: {
    [employeeId: string]: EmployeeSummary;
  };
  currentEmployeeId: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  dailySummary: {},
  currentEmployeeId: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await taskApi.getAll();
  return response.data;
});

export const fetchDailySummary = createAsyncThunk(
  'tasks/fetchDailySummary',
  async (date: string) => {
    const response = await taskApi.getDailySummary(date);
    return response.data;
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (task: Omit<Task, '_id'>) => {
    // Use taskApi instead of direct axios
    const response = await taskApi.create(task);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, task }: { id: string; task: Omit<Task, '_id'> }) => {
    const response = await taskApi.update(id, task);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    await taskApi.delete(id);
    return id;
  }
);

export const fetchTasksByEmployeeName = createAsyncThunk(
  'tasks/fetchTasksByEmployeeName',
  async (name: string) => {
    const response = await taskApi.getByEmployeeName(name);
    return response.data;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentEmployee: (state, action) => {
      state.currentEmployeeId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're setting an array
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(fetchDailySummary.fulfilled, (state, action) => {
        state.dailySummary = action.payload.employeeSummaries;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        // Ensure tasks is an array before trying to push
        if (!Array.isArray(state.tasks)) {
          state.tasks = [];
        }
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      .addCase(fetchTasksByEmployeeName.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksByEmployeeName.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasksByEmployeeName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks by employee name';
      });
  },
});

export const { setCurrentEmployee } = taskSlice.actions;
export default taskSlice.reducer;