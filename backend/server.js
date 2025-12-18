require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

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

// GET all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single recipe
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
app.post('/api/recipes', auth, async (req, res) => {
  const { title, image, description, ingredients, instructions, tips } = req.body;

  // Basic validation
  if (!title || !description) {
    return res.status(400).json({ message: "Title and Description are required" });
  }

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
