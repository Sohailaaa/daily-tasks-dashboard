import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee';

dotenv.config();

const employees = [
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

async function seedEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Insert new employees
    const createdEmployees = await Employee.insertMany(employees);
    console.log('Inserted employees:', createdEmployees);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding employees:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

// Run the seeder
seedEmployees(); 