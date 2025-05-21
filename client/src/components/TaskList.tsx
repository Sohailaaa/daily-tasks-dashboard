import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { Task, deleteTask } from '../store/taskSlice';
import { AppDispatch, RootState } from '../store';
import TaskEditDialog from './TaskEditDialog';
import { useState } from 'react';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
}

export default function TaskList({ tasks, selectedDate }: TaskListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { employees } = useSelector((state: RootState) => state.employees);
  const [showOnlyToday, setShowOnlyToday] = useState(false);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const displayedTasks = showOnlyToday 
    ? tasks.filter(task => task.from.startsWith(selectedDateStr))
    : tasks;

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {showOnlyToday ? "Today's Tasks" : "All Tasks"}
        </h2>
        <button
          onClick={() => setShowOnlyToday(!showOnlyToday)}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {showOnlyToday ? "Show All Tasks" : "Show Today's Tasks"}
        </button>
      </div>

      {displayedTasks.length === 0 ? (
        <p className="text-muted-foreground">
          {showOnlyToday ? "No tasks for today." : "No tasks found."}
        </p>
      ) : (
        displayedTasks.map((task) => {
          const taskEmployee = employees.find(emp => emp.employeeId === task.employeeId);
          return (
            <div
              key={task._id}
              className="flex items-center justify-between p-4 bg-background rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{task.description}</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{format(new Date(task.from), 'yyyy-MM-dd HH:mm')} - {format(new Date(task.to), 'HH:mm')}</p>
                  <p className="text-primary">Employee: {taskEmployee?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TaskEditDialog task={task} />
                <button
                  onClick={() => handleDelete(task._id)}
                  className="px-2 py-1 text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
} 