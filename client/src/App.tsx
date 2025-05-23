import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { AppDispatch, RootState } from './store';
import { fetchTasks, fetchDailySummary } from './store/taskSlice';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import DailySummary from './components/DailySummary';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDailySummary(format(selectedDate, 'yyyy-MM-dd')));
  }, [dispatch, selectedDate, tasks]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Daily Tasks Report</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4"></h2>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-destructive">{error}</div>
              ) : (
                <TaskList tasks={tasks} selectedDate={selectedDate} />
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4"></h2>
              <TaskForm selectedDate={selectedDate} />
            </div>
            
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Daily Summary</h2>
              <DailySummary selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
