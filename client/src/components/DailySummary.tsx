import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setCurrentEmployee, fetchDailySummary } from '../store/taskSlice';
import { fetchEmployees } from '../store/employeeSlice';
import { format } from 'date-fns';

interface DailySummaryProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DailySummary({ selectedDate, onDateChange }: DailySummaryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { employees } = useSelector((state: RootState) => state.employees);
  const { currentEmployeeId, dailySummary, tasks } = useSelector((state: RootState) => state.tasks);

  const currentEmployee = employees.find(emp => emp.employeeId === currentEmployeeId);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Load employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Fetch daily summary when date, employee, or tasks change
  useEffect(() => {
    const fetchSummary = async () => {
      if (!currentEmployeeId) return;
      
      setLoading(true);
      try {
        await dispatch(fetchDailySummary(dateStr)).unwrap();
      } catch (error) {
        console.error('Error fetching daily summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [dispatch, currentEmployeeId, dateStr, tasks.length]); // Add tasks.length as dependency

  const employeeSummary = currentEmployeeId ? dailySummary[currentEmployeeId] : null;

  const filteredEmployees = useMemo(() => {
    if (!employeeFilter) return [];
    const lowerFilter = employeeFilter.toLowerCase();
    return employees
      .filter(emp => emp.name.toLowerCase().includes(lowerFilter))
      .slice(0, 5);
  }, [employeeFilter, employees]);

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
            value={dateStr}
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
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
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
        <div className="text-center py-4 text-gray-500">
          Loading summary...
        </div>
      ) : employeeSummary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border rounded-md shadow-sm">
              <h3 className="font-medium text-gray-700">Total Hours Today</h3>
              <p className="text-2xl text-blue-600">{employeeSummary.totalHours.toFixed(1)}</p>
            </div>
            <div className="p-4 bg-white border rounded-md shadow-sm">
              <h3 className="font-medium text-gray-700">Remaining Hours</h3>
              <p className="text-2xl text-green-600">{employeeSummary.remainingHours.toFixed(1)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Today's Tasks</h3>
            {employeeSummary.tasks.length > 0 ? (
              <div className="space-y-2">
                {employeeSummary.tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 bg-white border rounded-md shadow-sm"
                  >
                    <p className="font-medium text-gray-800">{task.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>{format(new Date(task.from), 'HH:mm')} - {format(new Date(task.to), 'HH:mm')}</p>
                      <p className="text-blue-600">Employee: {currentEmployee?.name || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 border rounded-md">
                No tasks found for this date
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 bg-gray-50 border rounded-md">
          Select an employee to view their daily summary
        </div>
      )}
    </div>
  );
} 