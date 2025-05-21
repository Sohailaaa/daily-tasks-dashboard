import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { addTask } from '../store/taskSlice';
import { AppDispatch, RootState } from '../store';

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
  const { employees } = useSelector((state: RootState) => state.employees);

  const currentEmployee = employees.find(emp => emp.employeeId === currentEmployeeId);

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return (endHour - startHour) + (endMinute - startMinute) / 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentEmployeeId) {
      setError('Please select an employee from the dropdown above');
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
      const fromDate = new Date(`${dateStr}T${startTime}`);
      const toDate = new Date(`${dateStr}T${endTime}`);

      const task = {
        employeeId: currentEmployeeId,
        description,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
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

    const employeeSummary = dailySummary[currentEmployeeId!];
    const currentTotalHours = employeeSummary ? employeeSummary.totalHours : 0;
    const remainingHours = 8 - currentTotalHours;

    if (currentTotalHours + duration > 8) {
      setError(`Adding this task would exceed the daily limit of 8 hours. Remaining hours: ${remainingHours.toFixed(1)}`);
      return false;
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {currentEmployee && (
        <div className="p-3 bg-primary/10 rounded-md">
          <p className="font-medium">Adding task for: {currentEmployee.name}</p>
          <p className="text-sm text-muted-foreground">{currentEmployee.department}</p>
        </div>
      )}

      {!currentEmployee && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          Please select an employee from the dropdown above to add a task
      </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
          disabled={!currentEmployee}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setError(null);
            }}
            className="w-full p-2 border rounded-md"
            required
            disabled={!currentEmployee}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setError(null);
            }}
            className="w-full p-2 border rounded-md"
            required
            disabled={!currentEmployee}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        disabled={loading || !currentEmployee}
      >
        {loading ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
} 