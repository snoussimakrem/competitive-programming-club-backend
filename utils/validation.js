// utils/validation.js - Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

const validateLevel = (level) => {
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  return validLevels.includes(level);
};

const validateGoals = (goals) => {
  return goals && goals.trim().length >= 10 && goals.trim().length <= 1000;
};

const validateApplicationData = (data) => {
  const errors = [];

  if (!validateName(data.name)) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!validateLevel(data.level)) {
    errors.push('Please select a valid experience level');
  }

  if (!validateGoals(data.goals)) {
    errors.push('Learning goals must be between 10 and 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Basic sanitization - remove script tags and excessive whitespace
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

module.exports = {
  validateEmail,
  validateName,
  validateLevel,
  validateGoals,
  validateApplicationData,
  sanitizeInput
};
