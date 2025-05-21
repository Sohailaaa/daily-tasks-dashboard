import React, { useState, useEffect, useMemo } from 'react';
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
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyTasks, setDailyTasks] = useState<DailyTasksData | null>(null);
  const { employees } = useSelector((state: RootState) => state.employees);
  const { currentEmployeeId } = useSelector((state: RootState) => state.tasks);

  const currentEmployee = employees.find(emp => emp.employeeId === currentEmployeeId);

  const filteredEmployees = useMemo(() => {
    if (!employeeFilter) return [];
    const lowerFilter = employeeFilter.toLowerCase();
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerFilter)
    ).slice(0, 5); // Limit to 5 suggestions
  }, [employeeFilter, employees]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    const fetchDailyTasks = async () => {
      if (!currentEmployeeId) return;
      
      setLoading(true);
      try {
        const response = await taskApi.getDailyEmployeeTasks(currentEmployeeId, format(selectedDate, 'yyyy-MM-dd'));
        setDailyTasks(response.data);
      } catch (error) {
        console.error('Error fetching daily tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyTasks();
  }, [currentEmployeeId, selectedDate]);

  const handleEmployeeSelect = (employeeId: string, employeeName: string) => {
    dispatch(setCurrentEmployee(employeeId));
    setEmployeeFilter(employeeName);
    setIsEmployeeDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Select Employee</label>
          <input
            type="text"
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setIsEmployeeDropdownOpen(true);
            }}
            onFocus={() => setIsEmployeeDropdownOpen(true)}
            placeholder="Type employee name..."
            className="w-full p-2 border rounded-md"
          />
          {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
            <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="p-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleEmployeeSelect(emp.employeeId, emp.name)}
                >
                  {emp.name} - {emp.department}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                {dailyTasks.tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{task.description}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{format(new Date(task.from), 'HH:mm')} - {format(new Date(task.to), 'HH:mm')}</p>
                        <p className="text-primary">Employee: {currentEmployee?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground border rounded-md">
                No tasks found for this date
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
} 