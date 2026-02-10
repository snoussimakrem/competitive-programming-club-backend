const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  level: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid experience level'
    }
  },
  goals: {
    type: String,
    required: [true, 'Learning goals are required'],
    trim: true,
    minlength: [10, 'Please provide at least 10 characters for your goals'],
    maxlength: [1000, 'Goals cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Create index for faster queries
applicationSchema.index({ email: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);