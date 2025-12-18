const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [String],
  instructions: [String],
  tips: String,
  prepTime: { type: String, default: '15 mins' },
  cookTime: { type: String, default: '30 mins' },
  servings: { type: String, default: '4' },
  difficulty: { type: String, default: 'Medium' },
  cuisine: { type: String, default: 'Global' },
  dietaryType: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional for existing recipes
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
