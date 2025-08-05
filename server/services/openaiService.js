const OpenAI = require('openai');
const { CohereClient } = require('cohere-ai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Cohere as free alternative
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function getCareerRecommendations({ skills, hobbies, careerGoal }) {
  console.log('COHERE_API_KEY:', process.env.COHERE_API_KEY ? 'Present' : 'Not present');
  
  // Try Cohere first (free alternative), then OpenAI, then mock data
  if (process.env.COHERE_API_KEY && process.env.COHERE_API_KEY !== 'your_cohere_api_key' && process.env.COHERE_API_KEY.length > 10) {
    console.log('Attempting to use Cohere API...');
    try {
      const prompt = `Analyze these career details and provide a comprehensive guide:
Skills: [${skills.join(', ')}]
Hobbies: [${hobbies.join(', ')}]
Career Goal: [${careerGoal}]

Return JSON with:
{
  "career_paths": [
    {
      "title": "Career title",
      "match_score": "X/10",
      "description": "...",
      "required_skills": [],
      "growth_projection": "...",
      "learning_resources": [
        {"name": "...", "type": "course/book/certification", "link": "..."}
      ]
    }
  ],
  "skill_gaps": [],
  "action_plan": {
    "short_term": [],
    "mid_term": [],
    "long_term": []
  }
}`;

      const response = await cohere.generate({
        model: 'command',
        prompt: prompt,
        maxTokens: 800,
        temperature: 0.7,
      });

      const text = response.generations[0].text;
      console.log('Cohere raw response:', text);
      
      // Try to extract and parse JSON from the response
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON found in Cohere response');
      }
      
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      console.log('Extracted JSON string:', jsonString);
      
      const parsedData = JSON.parse(jsonString);
      console.log('Parsed Cohere data:', JSON.stringify(parsedData, null, 2));
      
      return parsedData;
    } catch (err) {
      console.log('Cohere API failed, trying OpenAI:', err.message);
      console.error('Cohere error details:', err);
    }
  }

  // Try OpenAI if Cohere fails
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_actual_openai_api_key_here') && !process.env.OPENAI_API_KEY.includes('disabled_for_testing')) {
    try {
      const prompt = `Analyze these career details and provide a comprehensive guide:
Skills: [${skills.join(', ')}]
Hobbies: [${hobbies.join(', ')}]
Career Goal: [${careerGoal}]

Return JSON with:
{
  "career_paths": [
    {
      "title": "Career title",
      "match_score": "X/10",
      "description": "...",
      "required_skills": [],
      "growth_projection": "...",
      "learning_resources": [
        {"name": "...", "type": "course/book/certification", "link": "..."}
      ]
    }
  ],
  "skill_gaps": [],
  "action_plan": {
    "short_term": [],
    "mid_term": [],
    "long_term": []
  }
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert career counselor AI.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const text = response.choices[0].message.content;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (err) {
      console.log('OpenAI API failed, generating personalized recommendations based on user input:', err.message);
    }
  }

  // Generate dynamic recommendations based on user input
  console.log('Generating personalized recommendations based on user input...');
  
  // Analyze user skills and hobbies to generate relevant career paths
  const techSkills = skills.filter(skill => 
    ['javascript', 'python', 'programming', 'coding', 'web development', 'software', 'react', 'node', 'html', 'css'].some(tech => 
      skill.toLowerCase().includes(tech)
    )
  );
  
  const designSkills = skills.filter(skill => 
    ['design', 'ui', 'ux', 'photoshop', 'figma', 'creative', 'art', 'visual'].some(design => 
      skill.toLowerCase().includes(design)
    )
  );
  
  const businessSkills = skills.filter(skill => 
    ['management', 'business', 'marketing', 'sales', 'leadership', 'communication'].some(business => 
      skill.toLowerCase().includes(business)
    )
  );
  
  // Generate career paths based on user's skills and goal
  const careerPaths = [];
  
  if (techSkills.length > 0 || careerGoal.toLowerCase().includes('developer') || careerGoal.toLowerCase().includes('programmer')) {
    careerPaths.push({
      title: `${careerGoal.includes('Full Stack') ? 'Full Stack' : careerGoal.includes('Frontend') ? 'Frontend' : careerGoal.includes('Backend') ? 'Backend' : 'Software'} Developer`,
      match_score: `${Math.max(7, 10 - Math.max(0, 3 - techSkills.length))}/10`,
      description: `Build ${careerGoal.toLowerCase().includes('web') ? 'web' : 'software'} applications using your ${techSkills.join(', ') || 'programming'} skills.`,
      required_skills: [...techSkills, "Problem Solving", "Debugging", "Version Control"],
      growth_projection: "High demand with 22% growth expected in tech sector",
      learning_resources: [
        { name: "FreeCodeCamp", type: "course", link: "https://freecodecamp.org" },
        { name: `${techSkills.includes('JavaScript') ? 'Advanced JavaScript' : 'Programming'} Fundamentals`, type: "course", link: "https://codecademy.com" },
        { name: "Clean Code", type: "book", link: "https://amazon.com" }
      ]
    });
  }
  
  if (designSkills.length > 0 || careerGoal.toLowerCase().includes('design')) {
    careerPaths.push({
      title: careerGoal.toLowerCase().includes('ui') ? 'UI Designer' : careerGoal.toLowerCase().includes('ux') ? 'UX Designer' : 'UX/UI Designer',
      match_score: `${Math.max(6, 10 - Math.max(0, 3 - designSkills.length))}/10`,
      description: `Create user-friendly ${careerGoal.toLowerCase().includes('web') ? 'web' : 'digital'} interfaces and experiences using your ${designSkills.join(', ') || 'design'} skills.`,
      required_skills: [...designSkills, "User Research", "Prototyping", "Design Thinking"],
      growth_projection: "Steady growth in digital products and user experience",
      learning_resources: [
        { name: "Figma Academy", type: "course", link: "https://figma.com" },
        { name: "Design of Everyday Things", type: "book", link: "https://amazon.com" }
      ]
    });
  }
  
  if (businessSkills.length > 0 || careerGoal.toLowerCase().includes('manager') || careerGoal.toLowerCase().includes('business')) {
    careerPaths.push({
      title: careerGoal.toLowerCase().includes('product') ? 'Product Manager' : careerGoal.toLowerCase().includes('project') ? 'Project Manager' : 'Business Analyst',
      match_score: `${Math.max(6, 10 - Math.max(0, 3 - businessSkills.length))}/10`,
      description: `Lead ${careerGoal.toLowerCase().includes('product') ? 'product development' : 'business initiatives'} using your ${businessSkills.join(', ') || 'business'} skills.`,
      required_skills: [...businessSkills, "Strategic Thinking", "Data Analysis", "Stakeholder Management"],
      growth_projection: "Growing demand for business-tech hybrid roles",
      learning_resources: [
        { name: "Product Management Course", type: "course", link: "https://coursera.org" },
        { name: "Lean Startup", type: "book", link: "https://amazon.com" }
      ]
    });
  }
  
  // If no specific skills match, provide general career path based on goal
  if (careerPaths.length === 0) {
    careerPaths.push({
      title: careerGoal || "Technology Professional",
      match_score: "7/10",
      description: `Pursue a career in ${careerGoal.toLowerCase() || 'technology'} by developing relevant skills and experience.`,
      required_skills: skills.length > 0 ? skills : ["Communication", "Problem Solving", "Learning Agility"],
      growth_projection: "Good growth potential with skill development",
      learning_resources: [
        { name: "Coursera", type: "platform", link: "https://coursera.org" },
        { name: "LinkedIn Learning", type: "platform", link: "https://linkedin.com/learning" }
      ]
    });
  }
  
  // Generate skill gaps based on career paths and current skills
  const allRequiredSkills = careerPaths.flatMap(path => path.required_skills);
  const skillGaps = allRequiredSkills.filter(skill => 
    !skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
  ).slice(0, 5); // Limit to 5 most important gaps
  
  // Generate personalized action plan
  const actionPlan = {
    short_term: [
      `Learn ${skillGaps[0] || 'fundamental skills'} through online courses`,
      `Build 2-3 projects related to ${careerGoal.toLowerCase() || 'your target field'}`,
      "Update resume and LinkedIn profile"
    ],
    mid_term: [
      `Apply for ${careerGoal.toLowerCase() || 'relevant'} positions`,
      "Network with professionals in your target industry",
      `Gain experience in ${skillGaps[1] || 'advanced topics'}`
    ],
    long_term: [
      `Specialize in ${careerGoal.toLowerCase().includes('senior') ? 'leadership' : 'advanced technical skills'}`,
      "Mentor others and contribute to the community",
      "Consider advanced certifications or education"
    ]
  };
  
  return {
    career_paths: careerPaths,
    skill_gaps: skillGaps.length > 0 ? skillGaps : ["Industry Knowledge", "Advanced Technical Skills", "Professional Communication"],
    action_plan: actionPlan
  };
}

module.exports = { getCareerRecommendations };