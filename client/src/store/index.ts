import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import employeeReducer from './employeeSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    employees: employeeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 