# 🚀 AI Career Guide - Complete System Workflow

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Complete Application Flow](#complete-application-flow)
5. [Authentication Workflow](#authentication-workflow)
6. [Career Recommendation Workflow](#career-recommendation-workflow)
7. [Database Operations](#database-operations)
8. [Security Implementation](#security-implementation)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Error Handling Strategy](#error-handling-strategy)

---

## 🎯 System Overview

The AI Career Guide is a full-stack web application that provides personalized career recommendations using artificial intelligence. The system consists of a React frontend, Node.js/Express backend, MongoDB database, and AI service integration.

### Key Components:
- **Frontend**: React application with authentication and career recommendation UI
- **Backend**: Express.js API with JWT authentication and AI integration
- **Database**: MongoDB for user data and recommendation storage
- **AI Services**: OpenAI/Cohere integration for generating career recommendations
- **Security**: JWT tokens, password hashing, input validation, rate limiting

---

## 🛠️ Technology Stack

### Frontend Technologies:
- **React 19.1.1**: Component-based UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Context**: State management
- **React Icons**: Icon components
- **React Toastify**: Toast notifications

### Backend Technologies:
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **express-rate-limit**: API rate limiting
- **CORS**: Cross-origin resource sharing

---

## 📁 Project Structure

```
AI Career Guide/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── Auth.js       # Authentication wrapper
│   │   │   ├── Login.js      # Login form
│   │   │   ├── Signup.js     # Registration form
│   │   │   ├── Header.js     # App header with user info
│   │   │   ├── UserForm.js   # Career input form
│   │   │   └── ResultsDisplay.js # Career recommendations
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   └── CareerContext.js  # Career data state
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── package.json
├── server/                    # Node.js Backend
│   ├── controllers/          # Business logic
│   │   ├── authController.js     # Auth operations
│   │   └── userController.js     # User/career operations
│   ├── middleware/           # Custom middleware
│   │   └── auth.js              # JWT authentication
│   ├── models/               # Database models
│   │   └── User.js              # User schema
│   ├── routes/               # API routes
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── services/             # External services
│   │   ├── openaiService.js     # AI integration
│   │   └── fileStorage.js       # Backup storage
│   ├── server.js             # Server entry point
│   ├── .env                  # Environment variables
│   └── package.json
└── SYSTEM_WORKFLOW.md        # This documentation
```

---

## 🔄 Complete Application Flow

### 1. Application Startup

#### Server Startup Process:
1. **Load Environment Variables** - Server reads `.env` file for configuration
2. **Initialize Express App** - Create Express application instance
3. **Configure Middleware** - Set up CORS, body parsing, cookie parsing
4. **Connect to MongoDB** - Establish database connection
5. **Mount API Routes** - Register authentication and user routes
6. **Start HTTP Server** - Listen on specified port (default: 5000)

#### Client Startup Process:
1. **React App Initialization** - Load main App component
2. **Authentication Check** - Verify if user has valid token
3. **Route to Appropriate View** - Show login/signup or main app
4. **Context Providers Setup** - Initialize authentication and career contexts

### 2. User Authentication Flow

#### Registration Process:
```
User fills signup form → 
Frontend validates input → 
Send POST to /api/auth/register → 
Server validates data → 
Check if user exists → 
Hash password → 
Save to database → 
Generate JWT token → 
Send token to client → 
Store token locally → 
Update authentication state → 
Redirect to main app
```

#### Login Process:
```
User fills login form → 
Send POST to /api/auth/login → 
Server finds user by email → 
Compare password hashes → 
Generate JWT token → 
Send token to client → 
Store token locally → 
Update authentication state → 
Redirect to main app
```

### 3. Main Application Flow

#### After Authentication:
```
Show Header with user info → 
Display UserForm component → 
User enters skills/hobbies/goals → 
Form validation → 
Send POST to /api/recommend → 
Server processes request → 
Call AI service → 
Generate recommendations → 
Save to database → 
Return recommendations → 
Display in ResultsDisplay component
```

---

## 🔐 Authentication Workflow

### User Registration Detailed Steps:

1. **Frontend Form Submission** (`Signup.js`):
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     if (!validateForm()) return;
     
     const result = await register(name, email, password);
     if (result.success) {
       toast.success('Account created!');
     } else {
       toast.error(result.message);
     }
   };
   ```

2. **Authentication Context** (`AuthContext.js`):
   ```javascript
   const register = async (name, email, password) => {
     const response = await axios.post('/api/auth/register', {
       name, email, password
     });
     
     if (response.data.success) {
       const { token, user } = response.data;
       localStorage.setItem('token', token);
       setUser(user);
       setIsAuthenticated(true);
     }
   };
   ```

3. **Server Controller** (`authController.js`):
   ```javascript
   exports.register = async (req, res) => {
     // Validate input
     const errors = validationResult(req);
     if (!errors.isEmpty()) return res.status(400).json({errors});
     
     // Check existing user
     const existingUser = await User.findOne({ email });
     if (existingUser) return res.status(400).json({message: 'User exists'});
     
     // Create user (password auto-hashed by mongoose middleware)
     const user = await User.create({ name, email, password });
     
     // Send token response
     sendTokenResponse(user, 201, res);
   };
   ```

4. **Database Model** (`User.js`):
   ```javascript
   // Auto-hash password before saving
   UserSchema.pre('save', async function(next) {
     if (!this.isModified('password')) next();
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
   });
   ```

### JWT Token Management:

1. **Token Generation**:
   ```javascript
   UserSchema.methods.getSignedJwtToken = function() {
     return jwt.sign(
       { id: this._id },
       process.env.JWT_SECRET,
       { expiresIn: '30d' }
     );
   };
   ```

2. **Token Verification Middleware**:
   ```javascript
   exports.protect = async (req, res, next) => {
     let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
     
     if (!token) return res.status(401).json({message: 'Not authorized'});
     
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = await User.findById(decoded.id);
     next();
   };
   ```

---

## 🎯 Career Recommendation Workflow

### Step-by-Step Process:

1. **User Input Collection** (`UserForm.js`):
   - User enters skills (JavaScript, React, etc.)
   - User adds hobbies (coding, reading, etc.)
   - User specifies career goal
   - Form validates all required fields

2. **API Request** (`UserForm.js`):
   ```javascript
   const handleSubmit = async (e) => {
     setLoading(true);
     try {
       const response = await axios.post('/api/recommend', formData);
       setRecommendations(response.data);
     } catch (error) {
       setError('Failed to get recommendations');
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Server Processing** (`userController.js`):
   ```javascript
   exports.recommend = async (req, res) => {
     // Validate request
     const errors = validationResult(req);
     if (!errors.isEmpty()) return res.status(400).json({errors});
     
     // Update user profile
     const user = await User.findByIdAndUpdate(req.user.id, req.body);
     
     // Generate AI recommendations
     const recommendations = await getCareerRecommendations(req.body);
     
     // Save recommendations
     user.recommendations.push(recommendations);
     await user.save();
     
     res.json(recommendations);
   };
   ```

4. **AI Service Integration** (`openaiService.js`):
   ```javascript
   const getCareerRecommendations = async ({skills, hobbies, careerGoal}) => {
     const prompt = `Generate career recommendations for:
       Skills: ${skills.join(', ')}
       Hobbies: ${hobbies.join(', ')}
       Goal: ${careerGoal}`;
     
     const response = await openai.chat.completions.create({
       model: "gpt-3.5-turbo",
       messages: [{role: "user", content: prompt}],
       max_tokens: 2000
     });
     
     return parseAIResponse(response.choices[0].message.content);
   };
   ```

5. **Results Display** (`ResultsDisplay.js`):
   - Shows career paths with match scores
   - Displays required skills for each path
   - Lists skill gaps and learning resources
   - Provides short-term and long-term action plans

---

## 🗄️ Database Operations

### User Schema Structure:
```javascript
const UserSchema = new mongoose.Schema({
  // Authentication
  name: {type: String, required: true, maxlength: 50},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true, minlength: 6, select: false},
  
  // Career Data
  skills: [{type: String, trim: true}],
  hobbies: [{type: String, trim: true}],
  careerGoal: {type: String, trim: true},
  
  // AI Recommendations History
  recommendations: [RecommendationSchema],
  
  // Metadata
  createdAt: {type: Date, default: Date.now}
});
```

### Database Connection:
```javascript
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
```

---

## 🛡️ Security Implementation

### 1. Password Security:
- **Hashing**: bcrypt with salt rounds
- **Validation**: Minimum 6 characters, mixed case, numbers
- **Storage**: Never store plain text passwords

### 2. JWT Security:
- **Secret Key**: Strong, environment-specific secret
- **Expiration**: 30-day token lifetime
- **Storage**: localStorage on client, httpOnly cookies option

### 3. Input Validation:
```javascript
const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min: 6}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').notEmpty().isLength({max: 50})
];
```

### 4. Rate Limiting:
```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 requests max
  message: 'Too many requests'
});
```

### 5. CORS Configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/updatedetails` - Update profile (protected)

### Career Endpoints:
- `POST /api/recommend` - Get AI career recommendations (protected)
- `POST /api/users` - Create/update user profile (protected)

### Request/Response Examples:

**Registration Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f8a1b2c3d4e5f6",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Recommendation Request:**
```json
{
  "skills": ["JavaScript", "React"],
  "hobbies": ["Coding", "Reading"],
  "careerGoal": "Full-stack developer"
}
```

---

## 🚨 Error Handling Strategy

### Client-Side Error Handling:
```javascript
// API call with error handling
try {
  const response = await axios.post('/api/auth/login', data);
  if (response.data.success) {
    // Handle success
  }
} catch (error) {
  const message = error.response?.data?.message || 'Request failed';
  toast.error(message);
}
```

### Server-Side Error Handling:
```javascript
// Global error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### Common Error Scenarios:
1. **Validation Errors**: Invalid input data
2. **Authentication Errors**: Invalid credentials, expired tokens
3. **Database Errors**: Connection issues, duplicate entries
4. **AI Service Errors**: API failures, rate limits exceeded
5. **Network Errors**: Timeout, connection refused

---

## 🎯 Summary

This AI Career Guide system provides a complete full-stack solution with:

1. **Secure Authentication**: JWT-based login/registration system
2. **AI Integration**: OpenAI/Cohere for career recommendations
3. **Modern UI**: React with responsive design and animations
4. **Robust Backend**: Express.js with comprehensive error handling
5. **Data Persistence**: MongoDB with fallback file storage
6. **Security Features**: Password hashing, input validation, rate limiting

The system follows modern web development best practices and provides a scalable foundation for career guidance applications.
