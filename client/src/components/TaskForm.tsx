import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { addTask } from '../store/taskSlice';
import { AppDispatch, RootState } from '../store';
import { fetchEmployees } from '../store/employeeSlice';

interface TaskFormProps {
  selectedDate: Date;
}

export default function TaskForm({ selectedDate }: TaskFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { dailySummary, currentEmployeeId } = useSelector((state: RootState) => state.tasks);
  const { employees = [], loading: employeesLoading } = useSelector((state: RootState) => state.employees);

  // Add useEffect to load employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const currentEmployee = Array.isArray(employees) 
    ? employees.find(emp => emp && emp.employeeId === currentEmployeeId) 
    : undefined;

  const calculateDuration = (start: string, end: string): number => {
    // Add safety checks
    if (!start || !end) {
      setError('Start time and end time are required');
      return 0;
    }
    
    try {
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      return (endHour - startHour) + (endMinute - startMinute) / 60;
    } catch (err) {
      setError('Invalid time format');
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentEmployeeId) {
      setError('Please select an employee from the dropdown above');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!startTime || !endTime) {
      setError('Start and end times are required');
      return;
    }

    setLoading(true);

    try {
      const duration = calculateDuration(startTime, endTime);
      if (!validateTask(duration)) {
        setLoading(false);
        return;
      }

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Create the task object with better validation
      const task = {
        employeeId: currentEmployeeId,
        description: description.trim(),
        from: `${dateStr}T${startTime}:00Z`,
        to: `${dateStr}T${endTime}:00Z`,
      };

      await dispatch(addTask(task)).unwrap();
      setDescription('');
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (error: any) {
      setError(error.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const validateTask = (duration: number): boolean => {
    if (duration <= 0) {
      setError('End time must be after start time');
      return false;
    }

    if (duration > 8) {
      setError('Task duration cannot exceed 8 hours');
      return false;
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Description
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            disabled={loading}
          />
        </label>
      </div>
      <div>
        <label>
          Start Time
          <input 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            disabled={loading}
          />
        </label>
      </div>
      <div>
        <label>
          End Time
          <input 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            disabled={loading}
          />
        </label>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
}