const express = require('express');
const { body } = require('express-validator');
const { createUser, recommend } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
});

const userValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('hobbies')
    .optional()
    .isArray()
    .withMessage('Hobbies must be an array'),
  body('careerGoal')
    .notEmpty()
    .withMessage('Career goal is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Career goal must be between 10 and 500 characters'),
];

// Protected routes - require authentication
router.post('/users', protect, userValidation, createUser);
router.post('/recommend', protect, limiter, userValidation, recommend);

module.exports = router;