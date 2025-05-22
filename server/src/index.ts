import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import taskRoutes from './routes/taskRoutes';
import employeeRoutes from './routes/employeeRoutes';
import Employee from './models/Employee';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);

// Sample employees data
const sampleEmployees = [
  {
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering'
  },
  {
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Design'
  },
  {
    employeeId: 'EMP003',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    department: 'Marketing'
  }
];

// Function to seed employees
async function seedEmployees() {
  try {
    const count = await Employee.countDocuments();
    if (count === 0) {
      await Employee.insertMany(sampleEmployees);
      console.log('Sample employees seeded successfully');
    } else {
      console.log('Employees already exist, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding employees:', error);
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Seed employees after successful connection
    await seedEmployees();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  }); 