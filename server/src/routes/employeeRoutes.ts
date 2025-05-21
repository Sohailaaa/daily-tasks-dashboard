import express from 'express';
import { z } from 'zod';
import Employee from '../models/Employee';

const router = express.Router();

// Validation schema
const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(1, 'Department is required'),
});

// Error handler wrapper
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get all employees
router.get('/', asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ name: 'asc' });
  res.json(employees);
}));

// Get employee by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ employeeId: req.params.id });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  res.json(employee);
}));

// Get employee by name
router.get('/by-name/:name', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      name: { $regex: new RegExp(req.params.name, 'i') }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error finding employee' });
  }
});

// Create new employee
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = employeeSchema.parse(req.body);
  
  // Check for existing employee with same ID or email
  const existingEmployee = await Employee.findOne({
    $or: [
      { employeeId: validatedData.employeeId },
      { email: validatedData.email }
    ]
  });
  
  if (existingEmployee) {
    return res.status(400).json({
      message: 'Employee with this ID or email already exists'
    });
  }
  
  const employee = new Employee(validatedData);
  await employee.save();
  res.status(201).json(employee);
}));

// Update employee
router.put('/:id', asyncHandler(async (req, res) => {
  const validatedData = employeeSchema.parse(req.body);
  
  // Check for existing employee with same email (excluding current employee)
  const existingEmployee = await Employee.findOne({
    email: validatedData.email,
    employeeId: { $ne: req.params.id }
  });
  
  if (existingEmployee) {
    return res.status(400).json({
      message: 'Employee with this email already exists'
    });
  }
  
  const employee = await Employee.findOneAndUpdate(
    { employeeId: req.params.id },
    validatedData,
    { new: true, runValidators: true }
  );
  
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  
  res.json(employee);
}));

// Delete employee
router.delete('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndDelete({ employeeId: req.params.id });
  
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  
  res.json({ message: 'Employee deleted successfully', employee });
}));

export default router; 