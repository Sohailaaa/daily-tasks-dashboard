import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTasksByEmployeeName, Task } from '../store/taskSlice';
import { format } from 'date-fns';
import TaskEditDialog from './TaskEditDialog';

interface TaskWithEmployee extends Task {
  employee?: {
    name: string;
  };
}

export default function TaskSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchName, setSearchName] = useState('');
  const { tasks: rawTasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const tasks = rawTasks as TaskWithEmployee[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchName.trim()) {
      dispatch(fetchTasksByEmployeeName(searchName));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Enter employee name"
          className="flex-1 p-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tasks for {tasks[0].employee?.name}</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{task.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(task.from), 'MMM d, yyyy HH:mm')} -{' '}
                    {format(new Date(task.to), 'HH:mm')}
                  </p>
                </div>
                <TaskEditDialog task={task} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 