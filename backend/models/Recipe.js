const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  // Original fields
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
  
  // TheMealDB API fields
  idMeal: { type: String }, // TheMealDB unique ID
  strMeal: { type: String }, // TheMealDB meal name
  strCategory: { type: String }, // e.g., "Seafood", "Pasta"
  strArea: { type: String }, // e.g., "Italian", "British"
  strInstructions: { type: String }, // Full cooking instructions
  strMealThumb: { type: String }, // TheMealDB image URL
  strTags: { type: String }, // Comma-separated tags
  strYoutube: { type: String }, // YouTube video link
  
  // Ingredients with measures (up to 20)
  ingredients_with_measures: [{
    ingredient: String,
    measure: String
  }],
  
  strSource: { type: String }, // Source URL
  strImageSource: { type: String },
  
  // Source tracking
  source: { 
    type: String, 
    enum: ['user', 'themealdb', 'manual'], 
    default: 'user' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
