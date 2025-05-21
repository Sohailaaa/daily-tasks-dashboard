import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setCurrentEmployee } from '../store/taskSlice';
import { fetchEmployees } from '../store/employeeSlice';
import { format } from 'date-fns';
import { taskApi } from '../services/api';

interface DailySummaryProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface Task {
  _id: string;
  description: string;
  from: string;
  to: string;
  employeeId: string;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
}

interface DailyTasksData {
  employee: Employee;
  tasks: Task[];
  totalHours: number;
  remainingHours: number;
}

export default function DailySummary({ selectedDate, onDateChange }: DailySummaryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTasksData | null>(null);
  
  const { currentEmployeeId } = useSelector((state: RootState) => state.tasks);
  const { employees } = useSelector((state: RootState) => state.employees);
  const { tasks } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    const fetchDailyTasks = async () => {
      if (!currentEmployeeId) {
        setDailyTasks(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await taskApi.getDailyEmployeeTasks(currentEmployeeId, dateStr);
        setDailyTasks(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch daily tasks');
        setDailyTasks(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyTasks();
  }, [currentEmployeeId, selectedDate, tasks]);

  const handleEmployeeChange = (employeeId: string) => {
    dispatch(setCurrentEmployee(employeeId));
  };

  const selectedEmployee = employees.find(emp => emp.employeeId === currentEmployeeId);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
        <label className="block text-sm font-medium mb-1">
          Select Date
        </label>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="w-full p-2 border rounded-md"
        />
      </div>

        <div className="flex-1">
        <label className="block text-sm font-medium mb-1">
          Select Employee
        </label>
        <select
          value={currentEmployeeId || ''}
            onChange={(e) => handleEmployeeChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.name} - {employee.department}
            </option>
          ))}
        </select>
      </div>
      </div>

      {selectedEmployee && (
        <div className="p-4 bg-primary/5 rounded-md">
          <h2 className="text-lg font-semibold">{selectedEmployee.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedEmployee.department}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-muted-foreground">
          Loading tasks...
        </div>
      ) : dailyTasks ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium">Total Hours Today</h3>
              <p className="text-2xl">{dailyTasks.totalHours.toFixed(1)}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium">Remaining Hours</h3>
              <p className="text-2xl">{dailyTasks.remainingHours.toFixed(1)}</p>
          </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Today's Tasks</h3>
            {dailyTasks.tasks.length > 0 ? (
              <div className="space-y-2">
                {dailyTasks.tasks.map((task) => {
                  const taskEmployee = employees.find(emp => emp.employeeId === task.employeeId);
                  const fromDate = new Date(task.from);
                  const toDate = new Date(task.to);
                  return (
                    <div
                      key={task._id}
                      className="p-4 border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{task.description}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>{format(fromDate, 'HH:mm')} - {format(toDate, 'HH:mm')}</p>
                          <p className="text-primary">Employee: {taskEmployee?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground border rounded-md">
                No tasks found for this date
          </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          {currentEmployeeId ? 'No tasks found' : 'Select an employee to view their tasks'}
        </div>
      )}
    </div>
  );
} 