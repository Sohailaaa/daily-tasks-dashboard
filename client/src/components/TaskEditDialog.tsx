import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { Task, updateTask, fetchDailySummary } from '../store/taskSlice';
import { AppDispatch, RootState } from '../store';

interface TaskEditDialogProps {
  task: Task;
  onUpdate?: () => void;
}

export default function TaskEditDialog({ task, onUpdate }: TaskEditDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(task.description);
  const [startTime, setStartTime] = useState(
    format(parseISO(task.from), 'HH:mm')
  );
  const [endTime, setEndTime] = useState(
    format(parseISO(task.to), 'HH:mm')
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { tasks } = useSelector((state: RootState) => state.tasks);

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return (endHour - startHour) + (endMinute - startMinute) / 60;
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

    // Calculate total hours excluding current task
    const currentDate = format(parseISO(task.from), 'yyyy-MM-dd');
    const totalHoursExcludingCurrent = tasks
      .filter(t => 
        t._id !== task._id && 
        format(parseISO(t.from), 'yyyy-MM-dd') === currentDate
      )
      .reduce((acc, t) => {
        const start = parseISO(t.from);
        const end = parseISO(t.to);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

    if (totalHoursExcludingCurrent + duration > 8) {
      setError('Total daily tasks cannot exceed 8 hours');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const duration = calculateDuration(startTime, endTime);
      if (!validateTask(duration)) {
        setLoading(false);
        return;
      }

      const dateStr = format(parseISO(task.from), 'yyyy-MM-dd');
      const updatedTask = {
        employeeId: task.employeeId,
        description,
        from: new Date(`${dateStr}T${startTime}`).toISOString(),
        to: new Date(`${dateStr}T${endTime}`).toISOString(),
      };

      await dispatch(updateTask({ id: task._id, task: updatedTask })).unwrap();
      
      // Refresh daily summary after updating task
      await dispatch(fetchDailySummary(dateStr)).unwrap();
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
      
      setIsOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-sm text-primary hover:text-primary-foreground hover:bg-primary rounded"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError(null);
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  disabled={loading || !!error}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 