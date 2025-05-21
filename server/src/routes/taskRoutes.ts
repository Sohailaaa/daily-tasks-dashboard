import express from 'express';
import { z } from 'zod';
import Task from '../models/Task';
import Employee from '../models/Employee';
import { Types } from 'mongoose';

const router = express.Router();

// Define interfaces for type safety
interface TaskDocument {
  _id: Types.ObjectId;
  employeeId: string;
  description: string;
  from: Date;
  to: Date;
}

interface EmployeeDocument {
  _id: Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  department: string;
}

interface EmployeeSummary {
  totalHours: number;
  remainingHours: number;
  tasks: TaskDocument[];
  employee: EmployeeDocument | null;
}

interface EmployeeSummaries {
  [employeeId: string]: EmployeeSummary;
}

// Validation schema
const taskSchema = z.object({
  employeeId: z.string(),
  description: z.string(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ from: 'asc' });
    const employeeIds = [...new Set(tasks.map(task => task.employeeId))];
    const employees = await Employee.find({ employeeId: { $in: employeeIds } });
    
    const employeeMap = new Map(employees.map(emp => [emp.employeeId, emp]));
    const tasksWithEmployees = tasks.map(task => ({
      ...task.toObject(),
      employee: employeeMap.get(task.employeeId) || null
    }));
    
    res.json(tasksWithEmployees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get tasks by employee ID and date
router.get('/daily/:employeeId/:date', async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Find the employee first
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find tasks for this employee on the specified date
    const tasks = await Task.find({
      employeeId,
      from: { $gte: dayStart },
      to: { $lte: dayEnd }
    }).sort({ from: 'asc' });

    // Calculate total hours
    const totalHours = tasks.reduce((acc, task) => {
      return acc + (new Date(task.to).getTime() - new Date(task.from).getTime()) / (1000 * 60 * 60);
    }, 0);

    res.json({
      employee,
      tasks,
      totalHours,
      remainingHours: Math.max(0, 8 - totalHours)
    });
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    res.status(500).json({ message: 'Error fetching daily tasks' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    
    // Check if total hours for the day would exceed 8
    const startDate = new Date(validatedData.from);
    const dayStart = new Date(startDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(startDate.setHours(23, 59, 59, 999));
    
    const existingTasks = await Task.find({
      employeeId: validatedData.employeeId,
      from: { $gte: dayStart },
      to: { $lte: dayEnd }
    });

    const totalHours = existingTasks.reduce((acc, task) => {
      return acc + (new Date(task.to).getTime() - new Date(task.from).getTime()) / (1000 * 60 * 60);
    }, 0);

    const newTaskHours = (new Date(validatedData.to).getTime() - new Date(validatedData.from).getTime()) / (1000 * 60 * 60);

    if (totalHours + newTaskHours > 8) {
      return res.status(400).json({ message: 'Total daily tasks cannot exceed 8 hours' });
    }

    const task = new Task(validatedData);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating task' });
    }
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const startDate = new Date(validatedData.from);
    const dayStart = new Date(startDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(startDate.setHours(23, 59, 59, 999));
    
    const existingTasks = await Task.find({
      employeeId: validatedData.employeeId,
      _id: { $ne: req.params.id },
      from: { $gte: dayStart },
      to: { $lte: dayEnd }
    });

    const totalHours = existingTasks.reduce((acc, task) => {
      return acc + (new Date(task.to).getTime() - new Date(task.from).getTime()) / (1000 * 60 * 60);
    }, 0);

    const newTaskHours = (new Date(validatedData.to).getTime() - new Date(validatedData.from).getTime()) / (1000 * 60 * 60);

    if (totalHours + newTaskHours > 8) {
      return res.status(400).json({ message: 'Total daily tasks cannot exceed 8 hours' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating task' });
    }
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Return both the success message and the deleted task ID
    res.json({ 
      message: 'Task deleted successfully',
      taskId: task._id 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Get daily summary
router.get('/summary/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const tasks = await Task.find({
      from: { $gte: dayStart },
      to: { $lte: dayEnd }
    }).sort({ from: 'asc' });

    // Get all unique employee IDs from tasks
    const employeeIds = [...new Set(tasks.map(task => task.employeeId))];
    
    // Fetch all relevant employees
    const employees = await Employee.find({ employeeId: { $in: employeeIds } });
    const employeeMap = new Map(employees.map(emp => [emp.employeeId, emp]));

    const initialSummaries: EmployeeSummaries = {};
    const employeeSummaries = tasks.reduce<EmployeeSummaries>((acc, task) => {
      const hours = (new Date(task.to).getTime() - new Date(task.from).getTime()) / (1000 * 60 * 60);
      
      if (!acc[task.employeeId]) {
        acc[task.employeeId] = {
          totalHours: 0,
          remainingHours: 8,
          tasks: [],
          employee: employeeMap.get(task.employeeId) || null
        };
      }
      
      acc[task.employeeId].totalHours += hours;
      acc[task.employeeId].remainingHours = Math.max(0, 8 - acc[task.employeeId].totalHours);
      acc[task.employeeId].tasks.push(task);
      
      return acc;
    }, initialSummaries);

    // Add employees with no tasks for the day
    employees.forEach(emp => {
      if (!employeeSummaries[emp.employeeId]) {
        employeeSummaries[emp.employeeId] = {
          totalHours: 0,
          remainingHours: 8,
          tasks: [],
          employee: emp
        };
      }
    });

    res.json({
      date: dayStart.toISOString().split('T')[0],
      employeeSummaries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily summary' });
  }
});

export default router; 