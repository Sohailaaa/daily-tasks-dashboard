import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Add validation for maximum task duration (8 hours)
taskSchema.pre('save', function(next) {
  const durationInHours = (this.to.getTime() - this.from.getTime()) / (1000 * 60 * 60);
  if (durationInHours > 8) {
    next(new Error('Task duration cannot exceed 8 hours'));
  } else {
    next();
  }
});

export const Task = mongoose.model('Task', taskSchema);
export default Task; 