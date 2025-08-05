const mongoose = require('mongoose');

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

// Define user schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: [{ type: String }],
  hobbies: [{ type: String }],
  careerGoal: { type: String },
  recommendations: [RecommendationSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);