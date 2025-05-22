import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
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
  const response = await axios.get('/api/tasks');
  return response.data;
});

export const fetchDailySummary = createAsyncThunk(
  'tasks/fetchDailySummary',
  async (date: string) => {
    const response = await axios.get(`/api/tasks/summary/${date}`);
    return response.data;
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (task: Omit<Task, '_id'>) => {
    const response = await axios.post('/api/tasks', task);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, task }: { id: string; task: Omit<Task, '_id'> }) => {
    const response = await axios.put(`/api/tasks/${id}`, task);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    await axios.delete(`/api/tasks/${id}`);
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
        state.tasks = action.payload;
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