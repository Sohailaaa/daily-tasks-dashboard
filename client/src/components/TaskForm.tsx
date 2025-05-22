import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { addTask, fetchDailySummary } from '../store/taskSlice';
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

  const { currentEmployeeId } = useSelector((state: RootState) => state.tasks);
  const { employees } = useSelector((state: RootState) => state.employees);

  // Load employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const currentEmployee = employees.find(emp => emp.employeeId === currentEmployeeId);

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
      
      // Create the task object with local timezone
      const task = {
        employeeId: currentEmployeeId,
        description: description.trim(),
        from: new Date(`${dateStr}T${startTime}`).toISOString(),
        to: new Date(`${dateStr}T${endTime}`).toISOString(),
      };

      await dispatch(addTask(task)).unwrap();
      
      // Refresh daily summary after adding task
      await dispatch(fetchDailySummary(dateStr)).unwrap();
      
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Add New Task</h2>
      
      {currentEmployee && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="font-medium text-blue-700">Adding task for: {currentEmployee.name}</p>
          <p className="text-sm text-blue-600">{currentEmployee.department}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input 
              type="time" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Task...
            </span>
          ) : (
            'Add Task'
          )}
        </button>
      </form>
    </div>
  );
}