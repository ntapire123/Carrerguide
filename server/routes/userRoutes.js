const express = require('express');
const { body } = require('express-validator');
const { createUser, recommend } = require('../controllers/userController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});

const userValidation = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('skills').isArray(),
  body('hobbies').isArray(),
  body('careerGoal').notEmpty(),
];

router.post('/users', userValidation, createUser);
router.post('/recommend', limiter, userValidation, recommend);

module.exports = router;