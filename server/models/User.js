const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clear any existing model to avoid caching issues
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Define learning resource schema explicitly
const LearningResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true }
}, { _id: false });

// Define career path schema explicitly
const CareerPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  match_score: { type: String, required: true },
  description: { type: String, required: true },
  required_skills: [{ type: String }],
  growth_projection: { type: String, required: true },
  learning_resources: [LearningResourceSchema]
}, { _id: false });

// Define action plan schema explicitly
const ActionPlanSchema = new mongoose.Schema({
  short_term: [{ type: String }],
  mid_term: [{ type: String }],
  long_term: [{ type: String }]
}, { _id: false });

// Define recommendation schema with explicit sub-schemas
const RecommendationSchema = new mongoose.Schema({
  career_paths: [CareerPathSchema],
  skill_gaps: [{ type: String }],
  action_plan: ActionPlanSchema
}, { _id: false });

// Define user schema with authentication fields
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  skills: [{ 
    type: String,
    trim: true 
  }],
  hobbies: [{ 
    type: String,
    trim: true 
  }],
  careerGoal: { 
    type: String,
    trim: true 
  },
  recommendations: [RecommendationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);