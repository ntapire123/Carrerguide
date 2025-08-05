const User = require('../models/User');
const { getCareerRecommendations } = require('../services/openaiService');
const { validationResult } = require('express-validator');
const { findUserByEmail, saveUser } = require('../services/fileStorage');

exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, skills, hobbies, careerGoal } = req.body;
    let user;
    let useFileStorage = false;

    try {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ name, email, skills, hobbies, careerGoal });
        await user.save();
      }
    } catch (mongoErr) {
      console.log('MongoDB not available, using file storage:', mongoErr.message);
      useFileStorage = true;
      user = await findUserByEmail(email);
      if (!user) {
        user = { name, email, skills, hobbies, careerGoal, recommendations: [] };
      }
    }

    if (useFileStorage) {
      await saveUser(user);
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recommend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, skills, hobbies, careerGoal } = req.body;
    
    // Try MongoDB first, fallback to file storage
    let user;
    let useFileStorage = false;
    
    try {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ name, email, skills, hobbies, careerGoal });
        await user.save();
      }
    } catch (mongoErr) {
      console.log('MongoDB not available, using file storage:', mongoErr.message);
      useFileStorage = true;
      user = await findUserByEmail(email);
      if (!user) {
        user = { name, email, skills, hobbies, careerGoal, recommendations: [] };
      }
    }

    const recommendations = await getCareerRecommendations({ skills, hobbies, careerGoal });

    // Debug: Log the raw recommendations data
    console.log('Raw recommendations data:', JSON.stringify(recommendations, null, 2));
    
    // Use the actual recommendations data from AI service
    const cleanedRecommendations = {
      career_paths: recommendations.career_paths || [],
      skill_gaps: recommendations.skill_gaps || [],
      action_plan: recommendations.action_plan || { short_term: [], mid_term: [], long_term: [] }
    };
    
    // Debug: Log the cleaned data
    console.log('Cleaned recommendations data:', JSON.stringify(cleanedRecommendations, null, 2));

    if (useFileStorage) {
      user.recommendations = user.recommendations || [];
      user.recommendations.push(cleanedRecommendations);
      await saveUser(user);
    } else {
      user.recommendations.push(cleanedRecommendations);
      await user.save();
    }

    res.json(cleanedRecommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};