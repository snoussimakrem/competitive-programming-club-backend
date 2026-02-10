const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// POST /api/applications - Submit new application
router.post('/', async (req, res) => {
  try {
    console.log('📝 Received application submission:', req.body);

    const { name, email, level, goals } = req.body;

    // Basic validation
    if (!name || !email || !level || !goals) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create application document
    const application = new Application({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      level: level,
      goals: goals.trim()
    });

    // Save to database
    const savedApplication = await application.save();
    
    console.log(`✅ Application saved with ID: ${savedApplication._id}`);
    console.log('📊 Application details:', {
      name: savedApplication.name,
      email: savedApplication.email,
      level: savedApplication.level
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: {
        id: savedApplication._id,
        name: savedApplication.name,
        email: savedApplication.email,
        level: savedApplication.level,
        createdAt: savedApplication.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Application submission error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle other errors
    console.error('Full error details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/applications - Get all applications (for testing)
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

module.exports = router;