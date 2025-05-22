import axios from 'axios';
import type { Employee } from '../store/employeeSlice';
import type { Task } from '../store/taskSlice';
import { getApiUrl } from '../config';

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Validate response data
    if (response.data === null || response.data === undefined) {
      console.warn('API Response contains no data:', response);
      return { ...response, data: [] }; // Return empty array as default
    }

    // Log successful response
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error(error.response.data?.message || 'Invalid request');
        case 404:
          throw new Error('Resource not found');
        case 500:
          throw new Error('Server error - please try again');
        default:
          throw new Error(`An unexpected error occurred: ${error.response.status}`);
      }
    } else if (error.request) {
      throw new Error('No response from server - please check your connection');
    } else {
      throw new Error(`Request configuration error: ${error.message}`);
    }
  }
);

// Task API
export const taskApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  getDailySummary: (date: string) => api.get(`/tasks/summary/${date}`),
  create: (task: Omit<Task, '_id'>) => api.post<Task>('/tasks', task),
  update: (id: string, task: Omit<Task, '_id'>) => api.put<Task>(`/tasks/${id}`, task),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getDailyEmployeeTasks: (employeeId: string, date: string) => 
    api.get(`/tasks/daily/${employeeId}/${date}`),
  getByEmployeeName: (name: string) => api.get<Task[]>(`/tasks/employee/${name}`),
};

// Employee API
export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (employee: Omit<Employee, '_id'>) => api.post<Employee>('/employees', employee),
  update: (id: string, employee: Omit<Employee, '_id'>) => api.put<Employee>(`/employees/${id}`, employee),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export default api; 