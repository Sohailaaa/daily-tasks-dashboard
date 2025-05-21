import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeApi } from '../services/api';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
}

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  selectedEmployee: Employee | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
  selectedEmployee: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getAll();
      return response.data as Employee[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employee: Omit<Employee, '_id'>, { rejectWithValue }) => {
    try {
      const response = await employeeApi.create(employee);
      return response.data as Employee;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employee }: { id: string; employee: Omit<Employee, '_id'> }, { rejectWithValue }) => {
    try {
      const response = await employeeApi.update(id, employee);
      return response.data as Employee;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await employeeApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch employees';
      })
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.push(action.payload);
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create employee';
      })
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(emp => emp._id === action.payload._id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update employee';
      })
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(emp => emp.employeeId !== action.payload);
        if (state.selectedEmployee?.employeeId === action.payload) {
          state.selectedEmployee = null;
        }
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete employee';
      });
  },
});

export const { setSelectedEmployee, clearError } = employeeSlice.actions;
export default employeeSlice.reducer; 