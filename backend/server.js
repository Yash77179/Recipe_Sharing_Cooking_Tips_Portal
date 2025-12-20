require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// MongoDB Connection
// For simplicity in this demo, if no MONGO_URI is provided, we'll log a warning.
// Ideally, the user should provide a .env file.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipe_portal';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Import Models
const Recipe = require('./models/Recipe');
const User = require('./models/User');

// Import Routes
const authRoutes = require('./routes/auth');
const { auth } = require('./middleware/auth');

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Routes

// GET all recipes with pagination
app.get('/api/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const type = req.query.type; // Veg, Non-Veg, or All

    let query = {};
    if (type && type !== 'All') {
      query.dietaryType = type;
    }




    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFiltered = await Recipe.countDocuments(query);
    const totalAll = await Recipe.countDocuments();
    const totalVeg = await Recipe.countDocuments({ dietaryType: 'Veg' });
    const totalNonVeg = await Recipe.countDocuments({ dietaryType: 'Non-Veg' });

    res.json({
      recipes,
      currentPage: page,
      totalPages: Math.ceil(totalFiltered / limit),
      totalRecipes: totalAll,
      totalFiltered,
      totalVeg,
      totalNonVeg,
      hasMore: skip + recipes.length < totalFiltered
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search recipes across entire database (MUST be before /:id route)
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ recipes: [] });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } },
        { cuisine: { $regex: q, $options: 'i' } }
      ]
    };

    const recipes = await Recipe.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 results

    res.json({
      recipes,
      count: recipes.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single recipe (MUST be after /search route)
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new recipe (protected route - requires authentication)
app.post('/api/recipes', [
  auth,
  // Validation rules
  body('title')
    .trim()
    .notEmpty().withMessage('Recipe title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('image')
    .trim()
    .notEmpty().withMessage('Recipe image URL is required')
    .isURL().withMessage('Please provide a valid image URL'),
  body('description')
    .trim()
    .notEmpty().withMessage('Recipe description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('ingredients')
    .optional()
    .isArray().withMessage('Ingredients must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(item => typeof item === 'string' && item.trim().length > 0);
      }
      return true;
    }).withMessage('Each ingredient must be a non-empty string'),
  body('instructions')
    .optional()
    .isArray().withMessage('Instructions must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(item => typeof item === 'string' && item.trim().length > 0);
      }
      return true;
    }).withMessage('Each instruction must be a non-empty string'),
  body('tips')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Tips must not exceed 500 characters'),
  body('prepTime')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Prep time must not exceed 50 characters'),
  body('cookTime')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Cook time must not exceed 50 characters'),
  body('servings')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Servings must not exceed 50 characters'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  const { title, image, description, ingredients, instructions, tips, prepTime, cookTime, servings, difficulty } = req.body;

  try {
    // Get user info
    const user = await User.findById(req.userId);

    const recipe = new Recipe({
      title,
      image,
      description,
      ingredients, // Expecting array
      instructions, // Expecting array
      tips,
      prepTime,
      cookTime,
      servings,
      difficulty,
      userId: req.userId,
      userName: user ? user.name : 'Anonymous'
    });

    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
