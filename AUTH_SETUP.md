# Authentication System Setup Guide

## ✨ New Features

### User Authentication
- **Sign Up**: New users can create an account with name, email, age, and password
- **Login**: Existing users can log in with email and password
- **Profile Page**: Users can view their profile with:
  - Name, email, and age
  - Number of recipes shared
  - List of all recipes they've created
  - Member since date

### Database Integration
- MongoDB database for storing users and recipes
- User passwords are securely hashed using bcryptjs
- JWT tokens for secure authentication
- Recipes are now linked to users

## 🚀 Getting Started

### Prerequisites
- MongoDB installed and running locally
- Node.js and npm installed

### Backend Setup

1. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

4. **Environment Variables**:
   The `.env` file is already configured with:
   - PORT=5000
   - MONGO_URI=mongodb://localhost:27017/recipe_portal
   - JWT_SECRET (for token generation)

5. **Start the backend server**:
   ```bash
   npm run dev
   ```
   Server should be running on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Frontend should be running on http://localhost:5173

## 📖 How to Use

### 1. Create an Account
- Click on "SIGN UP" in the navigation bar
- Fill in your details:
  - Full Name
  - Email Address
  - Age
  - Password (minimum 6 characters)
  - Confirm Password
- Click "Sign Up"
- You'll be automatically logged in and redirected to the home page

### 2. Login
- Click on "LOGIN" in the navigation bar
- Enter your email and password
- Click "Login"
- You'll be redirected to the home page

### 3. View Profile
- After logging in, your name will appear in the navigation bar
- Click on your name to view your profile
- Your profile shows:
  - Your name, email, and age
  - Number of recipes you've shared
  - All recipes you've created
- Click "Logout" to sign out

### 4. Share a Recipe
- You must be logged in to share recipes
- Click on "SUBMIT RECIPE" in the navigation bar
- Fill in the recipe details
- Click "Submit Recipe"
- The recipe will be saved and linked to your account
- You'll be redirected to your profile page

## 🔐 Security Features

- Passwords are hashed using bcryptjs (never stored as plain text)
- JWT tokens for secure authentication
- Protected routes that require authentication
- Automatic token expiration after 7 days
- Token validation on each protected request

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  age: Number,
  createdAt: Date
}
```

### Recipe Model (Updated)
```javascript
{
  title: String (required),
  image: String (required),
  description: String (required),
  ingredients: [String],
  instructions: [String],
  tips: String,
  prepTime: String,
  cookTime: String,
  servings: String,
  difficulty: String,
  cuisine: String,
  dietaryType: String,
  userId: ObjectId (reference to User),
  userName: String,
  createdAt: Date
}
```

## 🛠️ API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/verify` - Verify token validity (protected)

### Recipe Routes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create new recipe (protected, requires authentication)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check if the port 27017 is not blocked
- Verify MONGO_URI in `.env` file

### Authentication Not Working
- Clear browser localStorage and try again
- Check if backend server is running on port 5000
- Verify JWT_SECRET is set in `.env` file

### Cannot Add Recipe
- Make sure you're logged in
- Check browser console for errors
- Verify token is stored in localStorage

## 📝 Notes

- Tokens are stored in browser's localStorage
- Tokens expire after 7 days
- You can only edit/delete your own recipes
- The navbar updates to show your name when logged in
