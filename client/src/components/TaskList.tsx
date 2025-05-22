import { format, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { Task, deleteTask } from '../store/taskSlice';
import { AppDispatch, RootState } from '../store';
import TaskEditDialog from './TaskEditDialog';
import { useState, useMemo, useEffect } from 'react';
import { fetchEmployees } from '../store/employeeSlice';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
}

export default function TaskList({ tasks, selectedDate }: TaskListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { employees = [] } = useSelector((state: RootState) => state.employees);
  const [showOnlyToday, setShowOnlyToday] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const filteredEmployees = useMemo(() => {
    if (!employeeFilter || !Array.isArray(employees)) return [];
    const lowerFilter = employeeFilter.toLowerCase();
    return employees.filter(emp => 
      emp?.name?.toLowerCase().includes(lowerFilter)
    ).slice(0, 5); // Limit to 5 suggestions
  }, [employeeFilter, employees]);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks) || !Array.isArray(employees)) return [];
    
    let filtered = showOnlyToday 
      ? tasks.filter(task => task?.from?.startsWith(selectedDateStr))
      : tasks;

    if (employeeFilter) {
      filtered = filtered.filter(task => {
        const employee = employees.find(emp => emp?.employeeId === task?.employeeId);
        return employee?.name?.toLowerCase().includes(employeeFilter.toLowerCase());
      });
    }

    return filtered;
  }, [tasks, showOnlyToday, selectedDateStr, employeeFilter, employees]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(id));
    }
  };

  const formatTaskTime = (isoString: string) => {
    const date = parseISO(isoString);
    return format(date, 'HH:mm');
  };

  const formatTaskDate = (isoString: string) => {
    const date = parseISO(isoString);
    return format(date, 'yyyy-MM-dd');
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

      <div className="relative">
        <input
          type="text"
          value={employeeFilter}
          onChange={(e) => {
            setEmployeeFilter(e.target.value);
            setIsEmployeeDropdownOpen(true);
          }}
          onFocus={() => setIsEmployeeDropdownOpen(true)}
          placeholder="Filter by employee name..."
          className="w-full p-2 border rounded-md mb-4"
        />
        {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
          <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.employeeId}
                className="p-2 hover:bg-muted cursor-pointer"
                onClick={() => {
                  setEmployeeFilter(emp.name);
                  setIsEmployeeDropdownOpen(false);
                }}
              >
                {emp.name} - {emp.department}
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-muted-foreground">
          {showOnlyToday ? "No tasks for today." : "No tasks found."}
        </p>
      ) : (
        filteredTasks.map((task) => {
          const taskEmployee = employees.find(emp => emp.employeeId === task.employeeId);
          const taskDate = formatTaskDate(task.from);
          const startTime = formatTaskTime(task.from);
          const endTime = formatTaskTime(task.to);
          
          return (
            <div
              key={task._id}
              className="flex items-center justify-between p-4 bg-background rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{task.description}</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{taskDate} {startTime} - {endTime}</p>
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